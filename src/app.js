/* =============================================================
   David's Master Pot — motion + interaction layer
   Vanilla, no dependencies. Everything degrades cleanly and
   yields entirely to prefers-reduced-motion.
   ============================================================= */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ZH = document.documentElement.dataset.lang === 'zh';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- 1. Loading screen ------------------------------ */
  const loader = $('.loader');
  if (loader) {
    const bar = $('.loader__bar i', loader);
    let pct = 0, done = false;

    const set = v => { pct = Math.min(100, v); if (bar) bar.style.width = pct + '%'; };
    const tick = setInterval(() => { if (pct < 88) set(pct + Math.random() * 13); }, 170);

    const finish = () => {
      if (done) return; done = true;
      clearInterval(tick); set(100);
      setTimeout(() => {
        loader.setAttribute('data-done', '');
        document.body.removeAttribute('data-loading');
        document.dispatchEvent(new Event('dmp:ready'));
        setTimeout(() => loader.remove(), 700);
      }, 330);
    };

    // Wait for fonts + above-the-fold imagery, with a hard ceiling
    const waits = [document.fonts ? document.fonts.ready : Promise.resolve()];
    $$('img').slice(0, 4).forEach(img => {
      if (!img.complete) waits.push(new Promise(r => { img.onload = img.onerror = r; }));
    });
    Promise.all(waits).then(() => setTimeout(finish, RM ? 0 : 420));
    setTimeout(finish, RM ? 0 : 3200);   // ceiling: never trap the user
  } else {
    document.body.removeAttribute('data-loading');
  }

  /* ---------- 2. Scrolling --------------------------------
     Native. No wheel hijacking, no lerp, no transform wrapper.
     Anchor links ease via CSS scroll-behavior in base.css.     */

  /* ---------- 3. Scroll reveals ------------------------------ */
  const revealables = $$('[data-rv], .rv-lines');
  if (revealables.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    // Stagger siblings inside a shared parent
    const groups = new Map();
    revealables.forEach(el => {
      const key = el.parentElement;
      const arr = groups.get(key) || [];
      arr.push(el); groups.set(key, arr);
    });
    groups.forEach(arr => arr.forEach((el, i) => {
      if (!el.style.getPropertyValue('--rv-d')) el.style.setProperty('--rv-d', Math.min(i * 90, 450) + 'ms');
    }));
    revealables.forEach(el => io.observe(el));

    // Failsafe: nothing may stay invisible. If the observer never
    // reports (hidden tab, background render, unsupported), or the
    // page is restored from bfcache, reveal everything outright.
    const revealAll = () => revealables.forEach(el => el.classList.add('is-in'));
    setTimeout(() => {
      if (!document.querySelector('[data-rv].is-in, .rv-lines.is-in')) revealAll();
    }, 2600);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        revealables.forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in');
        });
      }
    });
    addEventListener('pageshow', e => { if (e.persisted) revealAll(); });
  }

  /* ---------- 4. Counters ------------------------------------ */
  const stats = $$('[data-count]');
  if (stats.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target, to = +el.dataset.count, dur = 1500;
        if (RM) { el.textContent = to + (el.dataset.suffix || ''); io.unobserve(el); return; }
        const t0 = performance.now();
        const step = now => {
          const p = Math.min(1, (now - t0) / dur);
          const e = 1 - Math.pow(1 - p, 3);          // easeOutCubic
          el.textContent = Math.round(to * e) + (el.dataset.suffix || '');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach(el => io.observe(el));
    setTimeout(() => stats.forEach(el => {
      if (el.textContent === '0' || el.textContent === '0+') el.textContent = el.dataset.count + (el.dataset.suffix || '');
    }), 2800);
  }

  /* ---------- 5. Parallax + scroll-reactive marquee ---------- */
  const paras = $$('.para__img');
  const tracks = $$('.marquee__track');
  const progress = $('.progress');
  let lastY = window.scrollY, ticking = false;
  let railDrive = null, reachDrive = null;

  const onScroll = () => {
    const y = window.scrollY;

    if (progress) {
      const m = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (m > 0 ? (y / m) * 100 : 0) + '%';
    }

    if (!RM) {
      paras.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        img.style.transform = `translate3d(0, ${(-p * 52).toFixed(2)}px, 0)`;
      });

      // Marquee speeds up with scroll velocity, then settles
      const v = Math.min(Math.abs(y - lastY), 90);
      tracks.forEach(t => t.style.setProperty('--mq-dur', (38 - v * 0.3).toFixed(1) + 's'));
    }

    if (railDrive) railDrive();
    if (reachDrive) reachDrive();

    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- 5b. Pinned horizontal rail ---------------------
     Drives the track with the section's own scroll progress.
     Without JS the rail is a plain swipeable overflow container,
     so it degrades instead of breaking.                        */
  const rail = $('.hrail');
  if (rail && !RM) {
    const pin = $('.hrail__pin', rail), track = $('.hrail__track', rail), bar = $('.hrail__bar i', rail);
    const drive = () => {
      const r = rail.getBoundingClientRect();
      const span = rail.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / span));
      const dist = Math.max(0, track.scrollWidth - pin.clientWidth);
      track.style.transform = `translate3d(${-dist * p}px,0,0)`;
      if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
    };
    railDrive = drive;
    addEventListener('resize', drive);
    drive();
  }

  /* ---------- 5c. Reach beat: states light up ---------------- */
  const reach = $('.reach');
  if (reach && !RM) {
    const fig = $('.reach__fig', reach), chips = $$('.reach__state', reach);
    const to = +(fig?.dataset.count || 20);
    const drive = () => {
      const r = reach.getBoundingClientRect();
      const span = reach.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      const p = Math.max(0, Math.min(1, -r.top / span));
      const eased = p < 1 ? 1 - Math.pow(1 - p, 2) : 1;
      if (fig) fig.textContent = Math.max(0, Math.round(to * eased));
      chips.forEach((c, i) => c.classList.toggle('is-lit', eased >= (i + 1) / (chips.length + 0.5)));
    };
    reachDrive = drive;
    addEventListener('resize', drive);
    drive();
  }

  /* ---------- 6. Sticky order bar ---------------------------- */
  const bar = $('.orderbar');
  if (bar) {
    const io = new IntersectionObserver(([en]) => {
      bar.toggleAttribute('data-show', !en.isIntersecting);
    }, { threshold: 0 });
    const hero = $('.hero') || $('main > section');
    if (hero) io.observe(hero);
  }

  /* ---------- 7. Mobile nav ---------------------------------- */
  const burger = $('.burger'), nav = $('#nav');
  if (burger && nav) burger.addEventListener('click', () => {
    const open = nav.hasAttribute('data-open');
    nav.toggleAttribute('data-open', !open);
    burger.setAttribute('aria-expanded', String(!open));
    burger.toggleAttribute('data-x', !open);
  });

  /* ---------- 8. Store filtering ----------------------------- */
  const grid = $('#storeGrid');
  if (grid) {
    const btns = $$('.filter');
    btns.forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      let shown = 0;
      $$('.store', grid).forEach((card, i) => {
        const show = f === 'all' || card.dataset.state === f;
        card.hidden = !show;
        if (show) {
          shown++;
          if (!RM) {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = `cardIn .5s cubic-bezier(.22,.61,.36,1) ${Math.min(i * 45, 400)}ms both`;
          }
        }
      });
      announceStores(shown, f === 'all' ? '' : b.textContent.replace(/\d+$/, '').trim());
    }));
  }

  /* ---------- 9. Store filtering: empty state + announcement -- */
  function announceStores(shown, label) {
    const emptyBox = $('[data-storeempty]'), countNote = $('[data-storecount]');
    if (countNote) countNote.textContent = ZH
      ? `显示 ${shown} 家门店${label ? '（' + label + '）' : ''}`
      : `Showing ${shown} shop${shown === 1 ? '' : 's'}${label ? ' in ' + label : ''}`;
    if (emptyBox) emptyBox.hidden = shown !== 0;
  }
  if (grid) {
    const resetBtn = $('[data-storereset]');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      const all = $$('.filter').find(b => b.dataset.filter === 'all');
      if (all) all.click();
    });
    announceStores($$('.store', grid).filter(c => !c.hidden).length, '');
  }

  /* ---------- 10. Forms -------------------------------------
     Validates inline, never blocks on a single bad field, keeps
     everything the user typed, and survives a dead network.   */
  const FORM_ENDPOINT = document.documentElement.dataset.formEndpoint || '';
  const MAXLEN = { name: 80, phone: 30, email: 120, subject: 120, message: 2000 };

  const msg = key => {
    const en = { required:'This field is required.', email:'Enter a valid email address, like name@example.com.',
      phone:'Enter a valid phone number, digits and + only.', tooLong:'That is longer than we can accept.',
      sending:'Sending...', ok:'Thanks. We have your message and will reply within two business days.',
      fail:'That did not send. Try again, or email us directly.',
      offline:'You appear to be offline. Your message is still here, try again when you reconnect.',
      fixErrors:'Check the highlighted fields and try again.',
      noBackend:'No form endpoint is configured yet. Set formEndpoint in site.json before going live.' };
    const zh = { required:'此项为必填。', email:'请输入有效的电子邮箱，例如 name@example.com。',
      phone:'请输入有效的电话号码，仅限数字与加号。', tooLong:'内容超出可接受的长度。',
      sending:'发送中...', ok:'已收到，我们会在两个工作日内回复。',
      fail:'发送失败。请重试，或直接发邮件给我们。',
      offline:'您似乎已离线。内容仍在，联网后请重试。',
      fixErrors:'请检查标红的字段后重试。',
      noBackend:'尚未配置表单接收地址。上线前请在 site.json 中设置 formEndpoint。' };
    return (ZH ? zh : en)[key];
  };

  const fieldError = (input, text) => {
    const wrap = input.closest('.field');
    if (!wrap) return;
    let e = $('.field__err', wrap);
    if (!e) {
      e = document.createElement('p');
      e.className = 'field__err';
      e.id = input.id + '-err';
      wrap.appendChild(e);
    }
    if (text) {
      e.textContent = text;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', e.id);
    } else {
      e.textContent = '';
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  };

  const validate = input => {
    const v = input.value.trim(), name = input.name;
    if (input.required && !v) return msg('required');
    if (!v) return '';                                   // optional + empty is fine
    if (MAXLEN[name] && v.length > MAXLEN[name]) return msg('tooLong');
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return msg('email');
    if (input.type === 'tel' && !/^[+]?[\d\s()-]{6,}$/.test(v)) return msg('phone');
    return '';
  };

  $$('[data-form]').forEach(form => {
    const note = $('[data-formnote]', form);
    const fields = $$('input, textarea', form);
    const submit = $('button[type="submit"]', form);
    let busy = false;

    // cap length at the source, and clear an error as soon as it is fixed
    fields.forEach(f => {
      if (MAXLEN[f.name]) f.setAttribute('maxlength', MAXLEN[f.name]);
      f.addEventListener('blur', () => fieldError(f, validate(f)));
      f.addEventListener('input', () => { if (f.getAttribute('aria-invalid')) fieldError(f, validate(f)); });
    });

    form.setAttribute('novalidate', '');   // we own the messaging, not the browser

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (busy) return;                     // double-submit guard

      let firstBad = null;
      fields.forEach(f => {
        const err = validate(f);
        fieldError(f, err);
        if (err && !firstBad) firstBad = f;
      });
      if (firstBad) {
        if (note) note.textContent = msg('fixErrors');
        firstBad.focus();
        return;
      }

      if (!FORM_ENDPOINT) { if (note) note.textContent = msg('noBackend'); return; }
      if (!navigator.onLine) { if (note) note.textContent = msg('offline'); return; }

      busy = true;
      if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = msg('sending'); }
      if (note) note.textContent = msg('sending');

      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 12000);
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST', signal: ctl.signal,
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        if (note) note.textContent = msg('ok');
        form.reset();
        fields.forEach(f => fieldError(f, ''));
      } catch (err) {
        // input is deliberately preserved so nothing typed is lost
        if (note) note.textContent = navigator.onLine ? msg('fail') : msg('offline');
      } finally {
        clearTimeout(timer);
        busy = false;
        if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || submit.textContent; }
      }
    });
  });
})();
