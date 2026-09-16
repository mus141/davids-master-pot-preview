const B = require('./build.js');
const { site, menu, stores, pages, url, asset, esc, para, heat, allerg } = B;

const S = (lang, k) => site.strings[lang][k];

/* ---------- shared blocks ---------- */
const sectionHead = (kicker, h, sub, cls='') => `
  <div class="sec__head${cls ? ' ' + cls : ''}">
    <h2 class="display sec__h">${esc(h)}</h2>
    ${sub ? `<p class="lede" style="margin-top:var(--s-4);max-width:46ch">${esc(sub)}</p>` : ''}
  </div>`;

const baseCard = (b, i, lang) => `
  <article class="base" data-rv>
    <span class="base__n">${String(i+1).padStart(2,'0')}</span>
    <img class="base__img" src="${asset(b.img)}" alt="${esc(b[lang].name)}" loading="lazy">
    <h3 class="base__name">${esc(b[lang].name)}</h3>
    ${heat(b.heat, lang)}
    <p class="base__blurb">${esc(b[lang].blurb)}</p>
    <p class="allergens">${esc(S(lang,'common').allergens)}: ${esc(allerg(b.allergens, lang))}</p>
  </article>`;

const dishCard = (d, lang) => `
  <article class="dish" data-rv>
    <img src="${asset(d.img)}" alt="${esc(d[lang].name)}" loading="lazy">
    <div><h3>${esc(d[lang].name)}</h3><p>${esc(d[lang].blurb)}</p></div>
  </article>`;

const storeCard = (s, lang, t) => {
  const st = S(lang,'stores');
  // phone and hours are null until the client supplies them. Render
  // nothing rather than a guess; the card stays useful either way.
  const tel = s.phone
    ? `<a class="store__tel" href="tel:${esc(s.phone.replace(/[^\d+]/g,''))}">${esc(st.call)} ${esc(s.phone)}</a>`
    : '';
  const hrs = s.hours
    ? `<p class="store__hours">${esc(s.hours)}</p>`
    : `<p class="store__hours store__hours--unknown">${esc(st.hoursUnknown)}</p>`;
  return `
  <article class="store" data-rv data-state="${s.state}">
    <img src="${asset(s.img)}" alt="${esc(s[lang].name)}" loading="lazy">
    <div class="store__body">
      ${s.new ? `<span class="tag">${esc(t.newTag)}</span>` : ''}
      <span class="store__city">${esc(s[lang].city)} · ${s.state}</span>
      <h3 class="store__name">${esc(s[lang].name)}</h3>
      <p class="store__addr">${esc(s.address)}</p>
      ${hrs}
      ${tel}
      <a class="store__link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}"
         target="_blank" rel="noopener">${esc(S(lang,'cta').directions)} →</a>
    </div>
  </article>`;
};

const marquee = lang => {
  const items = lang === 'en'
    ? ['大味','Build your own hot pot','大味','20 shops across Australia','大味','Since 2018','大味','Pay by weight']
    : ['大味','自己的锅，自己配','大味','全澳二十家门店','大味','始于 2018','大味','按重量计价'];
  const row = items.map(i => `<span class="marquee__item">${esc(i)}</span>`).join('');
  return `<div class="marquee"><div class="marquee__track">${row}${row}</div></div>`;
};


/* ---------- big visual blocks (reference-strength) ---------- */
const TILE_BG = ['var(--crimson)','var(--ink)','var(--gold-deep)','var(--red)',
                 'var(--ink)','var(--crimson)','var(--red)','var(--gold-deep)'];

const tiles = lang => {
  // Eight category tiles. Images are FLOW PLACEHOLDERS — swap the
  // files in assets-src/flow/ and re-run optimise.sh.
  const cats = lang === 'en'
    ? [['Signature Malatang','soup/spicy-malatang.png'],['Stir-Fry Spicy Pot','soup/stir-fry-spicy-pot.png'],
       ['Sichuan Dry Mix','soup/sichuan-dry-mix.png'],['Pork Bone Broth','soup/pork-bone.png'],
       ['Golden Pickled','soup/golden-pickled.png'],['Tomato Broth','soup/tomato.png'],
       ['Coconut Laksa','soup/coconut-laksa.jpg'],['Small Bites','snack/prawn-spring-rolls.png']]
    : [['招牌麻辣烫','soup/spicy-malatang.png'],['干锅麻辣','soup/stir-fry-spicy-pot.png'],
       ['四川拌菜','soup/sichuan-dry-mix.png'],['猪骨浓汤','soup/pork-bone.png'],
       ['金汤酸菜','soup/golden-pickled.png'],['香甜番茄','soup/tomato.png'],
       ['椰香叻沙','soup/coconut-laksa.jpg'],['小食','snack/prawn-spring-rolls.png']];
  return `<div class="tiles">` + cats.map(([n,img],i) => `
    <a class="tile" href="${url(lang,'menu')}" style="--tile-bg:${TILE_BG[i]}" data-rv="scale">
      <img class="tile__img" src="${asset(img)}" alt="" loading="lazy">
      <span class="tile__label">${esc(n)}</span>
      <span class="tile__go" aria-hidden="true">→</span>
      <span class="sr">${esc(n)}</span>
    </a>`).join('') + `</div>`;
};

const stats = lang => {
  const rows = lang === 'en'
    ? [[20,'','Shops nationwide'],[4,'','States'],[100,'+','Ingredients'],[7,'','Soup bases']]
    : [[20,'','全澳门店'],[4,'','覆盖州份'],[100,'+','食材种类'],[7,'','汤底选择']];
  return `<div class="stats">` + rows.map(([n,suf,l]) => `
    <div class="stat" data-rv>
      <span class="stat__n" data-count="${n}" data-suffix="${suf}">0${suf}</span>
      <span class="stat__l">${esc(l)}</span>
    </div>`).join('') + `</div>`;
};

const paraStrip = (lang, img, cap) => `
  <div class="para">
    <img class="para__img" src="${asset(img)}" alt="" loading="lazy">
    <div class="para__cap wrap"><p class="display" style="font-size:var(--t-3);max-width:20ch">${esc(cap)}</p></div>
  </div>`;


/* ---------- pinned horizontal broth rail -------------------- */
const hrail = lang => {
  const t = lang === 'en'
    ? { k:'Seven broths', h:'Scroll the fridge', s:'Every one simmered from scratch each morning.' }
    : { k:'七款汤底', h:'横着逛一遍', s:'每一锅，都是当天清早现熬。' };
  return `
  <section class="hrail bleed-crimson">
    <div class="hrail__pin">
      <div class="hrail__head wrap">
        <h2 class="display sec__h">${esc(t.h)}</h2>
      </div>
      <div class="hrail__track">
        ${menu.soupBases.map((b,i)=>`
        <article class="hcard">
          <span class="hcard__n">${String(i+1).padStart(2,'0')}</span>
          <img src="${asset(b.img)}" alt="${esc(b[lang].name)}" loading="lazy">
          <div class="hcard__body">
            <h3>${esc(b[lang].name)}</h3>
            ${heat(b.heat, lang)}
            <p>${esc(b[lang].blurb)}</p>
          </div>
        </article>`).join('')}
      </div>
      <div class="hrail__bar"><i></i></div>
    </div>
  </section>`;
};

/* ---------- reach beat -------------------------------------- */
const reach = lang => {
  const t = lang === 'en'
    ? { word:'Shops across Australia', states:['Victoria','Queensland','South Australia','Western Australia'],
        tail:'One recipe. Four states. Twenty kitchens.' }
    : { word:'家门店，遍布全澳', states:['维多利亚州','昆士兰州','南澳','西澳'],
        tail:'一套配方，四个州，二十间厨房。' };
  return `
  <section class="reach bleed-ink">
    <div class="reach__pin">
      <div class="wrap center">
        <span class="reach__fig" data-count="20">0</span>
        <p class="reach__word" style="margin-top:var(--s-4)">${esc(t.word)}</p>
        <div class="reach__states">
          ${t.states.map(x=>`<span class="reach__state">${esc(x)}</span>`).join('')}
        </div>
        <p class="lede reach__tail">${esc(t.tail)}</p>
      </div>
    </div>
  </section>`;
};

/* ---------- pages ---------- */
function home(lang) {
  const p = pages.home[lang], t = S(lang,'cta');
  const stampTxt = lang === 'en' ? 'Since<br>2018' : '始于<br>2018';
  return `
  <section class="hero">
    <div class="wrap hero__in">
      <div>
        <p class="kicker">${esc(p.kicker)}</p>
        <h1 class="display hero__h rv-lines">${lang==='en'
          ? `<span><i>Build your <em>own</em></i></span><span><i>hot pot</i></span>`
          : `<span><i>自己的锅</i></span><span><i><em>自己配</em></i></span>`}</h1>
        <p class="lede" data-rv style="--rv-d:520ms">${esc(p.sub)}</p>
        <div class="hero__cta" data-rv style="--rv-d:640ms">
          <a class="btn" href="${url(lang,'menu')}">${esc(t.seeMenu)}</a>
          <a class="btn btn--ghost" href="${url(lang,'stores')}">${esc(t.findStore)}</a>
        </div>
      </div>
      <div class="hero__aside">
        <span class="hero__glow" aria-hidden="true"></span>
        <span class="hero__stamp">${stampTxt}</span>
        <img class="hero__mascot" src="${asset('brand/mascot.png')}" alt="" loading="eager">
      </div>
    </div>
  </section>
  ${marquee(lang)}

  <section class="section--tight wrap">
    ${tiles(lang)}
  </section>

  ${paraStrip(lang, 'store/3.jpg', lang==='en'?'The broth is ours. The bowl is yours.':'汤是我们的，碗是你的。')}

  <section class="section wrap">
    <div class="story story__grid">
      <div>
        <h2 class="display sec__h--lg">${esc(p.storyH)}</h2>
      </div>
      <div data-rv="right">${para(p.storyBody)}</div>
    </div>
  </section>

  ${reach(lang)}

  <section class="section--tight bleed-ink"><div class="wrap">${stats(lang)}</div></section>

  ${hrail(lang)}

  <section class="section--tight bleed-crimson pt-0">
    <div class="wrap center">
      <a class="btn btn--gold" href="${url(lang,'menu')}">${esc(t.seeMenu)}</a>
    </div>
  </section>

  <section class="section wrap">
    ${sectionHead(p.buildKicker, p.buildH, '')}
    <div class="steps">
      ${p.steps.map(s=>`<div class="step" data-rv><span class="step__n">${esc(s.n)}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>`).join('')}
    </div>
    <div class="mt-l"><a class="btn btn--ghost" href="${url(lang,'build')}">${lang==='en'?'The full walkthrough':'查看完整流程'}</a></div>
  </section>

  <section class="section bleed-ink">
    <div class="wrap">
      ${sectionHead(p.storesKicker, p.storesH, '')}
      <div class="stores">${stores.list.slice(0,6).map(s=>storeCard(s,lang,pages.stores[lang])).join('')}</div>
      <div class="mt-l"><a class="btn btn--gold" href="${url(lang,'stores')}">${esc(t.viewAll)}</a></div>
    </div>
  </section>

  <section class="section wrap">
    <div class="split">
      <div>
        <h2 class="display sec__h sec__h--gap-xs">${esc(p.appH)}</h2>
        <p>${esc(p.appBody)}</p>
        <div style="margin-top:var(--s-6)"><a class="btn" href="${url(lang,'club')}">${esc(t.joinClub)}</a></div>
      </div>
      <div class="qr">
        <figure><img src="${asset('brand/qr-appstore.png')}" alt="App Store QR"><figcaption>App Store</figcaption></figure>
        <figure><img src="${asset('brand/qr-googleplay.png')}" alt="Google Play QR"><figcaption>Google Play</figcaption></figure>
      </div>
    </div>
  </section>`;
}

function menuPage(lang) {
  const p = pages.menu[lang];
  return `
  <section class="section--tight wrap pagehead">
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 class="display pagehead__h">${esc(p.h1)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </section>
  ${marquee(lang)}
  <section class="section bleed-crimson"><div class="wrap">
    <h2 class="display sec__h sec__h--gap-s">${esc(p.s1)}</h2>
    <div class="bases">${menu.soupBases.map((b,i)=>baseCard(b,i,lang)).join('')}</div>
  </div></section>
  <section class="section wrap">
    <h2 class="display sec__h sec__h--gap">${esc(p.s2)}</h2>
    <div class="dishes">${menu.snacks.map(d=>dishCard(d,lang)).join('')}</div>
  </section>
  <section class="section--tight wrap pb-xl">
    <h2 class="display sec__h sec__h--gap">${esc(p.s3)}</h2>
    <div class="dishes">${menu.rice.map(d=>dishCard(d,lang)).join('')}</div>
    <p class="note">${esc(p.note)}</p>
  </section>`;
}

function buildPage(lang) {
  const p = pages.build[lang], h = pages.home[lang];
  return `
  <section class="section--tight wrap pagehead">
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 class="display pagehead__h pagehead__h--tight">${esc(p.h1)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </section>
  <section class="section bleed-ink"><div class="wrap">
    <div class="steps">
      ${h.steps.map(s=>`<div class="step" data-rv><span class="step__n">${esc(s.n)}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>`).join('')}
    </div>
  </div></section>
  ${marquee(lang)}
  <section class="section wrap">
    <h2 class="display sec__h sec__h--gap-s">${esc(p.faqH)}</h2>
    <div class="faq">
      ${p.faq.map(f=>`<details data-rv><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
    </div>
    <div class="mt-l"><a class="btn" href="${url(lang,'stores')}">${esc(S(lang,'cta').findStore)}</a></div>
  </section>`;
}

function storesPage(lang) {
  const p = pages.stores[lang];
  const counts = stores.states.map(s => ({...s, n: stores.list.filter(x=>x.state===s.code).length}));
  return `
  <section class="section--tight wrap pagehead">
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 class="display pagehead__h pagehead__h--tight">${esc(p.h1)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </section>
  <section class="section--tight wrap pt-0">
    <div class="filters">
      <button class="filter" data-filter="all" aria-pressed="true">${esc(p.filterAll)}<b>${stores.list.length}</b></button>
      ${counts.map(c=>`<button class="filter" data-filter="${c.code}" aria-pressed="false">${esc(c[lang])}<b>${c.n}</b></button>`).join('')}
    </div>
    <p class="sr" role="status" aria-live="polite" data-storecount></p>
    <div class="stores" id="storeGrid">${stores.list.map(s=>storeCard(s,lang,p)).join('')}</div>
    <div class="empty" data-storeempty hidden>
      <p class="display" style="font-size:var(--t-2)">${esc(S(lang,'stores').empty)}</p>
      <p style="margin-top:var(--s-3);color:var(--text-mute)">${esc(S(lang,'stores').emptyHint)}</p>
      <button class="btn btn--ghost" data-storereset style="margin-top:var(--s-5)">${esc(S(lang,'stores').reset)}</button>
    </div>
  </section>`;
}

function promosPage(lang) {
  const p = pages.promotions[lang];
  const items = promos[lang];
  return `
  <section class="section--tight wrap pagehead">
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 class="display pagehead__h">${esc(p.h1)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </section>
  <section class="section--tight wrap pb-xl">
    <div class="promos">
      ${items.map(i=>`<article class="promo" data-rv>
        <span class="promo__status" ${i.on?'data-on':'data-off'}>${esc(i.on?p.ongoing:p.ended)}</span>
        <div><h3>${esc(i.t)}</h3><p>${esc(i.d)}</p></div>
      </article>`).join('')}
    </div>
  </section>`;
}

function newsPage(lang) {
  const p = pages.news[lang], items = news[lang];
  return `
  <section class="section--tight wrap pagehead">
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 class="display pagehead__h">${esc(p.h1)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </section>
  <section class="section--tight wrap pb-xl">
    <div class="promos">
      ${items.map(i=>`<article class="promo" data-rv>
        <span class="promo__status" data-off>${esc(i.date)}</span>
        <div><h3>${esc(i.t)}</h3><p>${esc(i.d)}</p></div>
      </article>`).join('')}
    </div>
  </section>`;
}

function franchisePage(lang) {
  const p = pages.franchise[lang], f = p.fields;
  return `
  <section class="section--tight wrap pagehead">
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 class="display pagehead__h pagehead__h--tight">${esc(p.h1)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </section>
  ${marquee(lang)}
  <section class="section bleed-crimson"><div class="wrap">
    <h2 class="display sec__h sec__h--gap">${esc(p.pitchH)}</h2>
    <div class="steps">
      ${p.pitch.map((x,i)=>`<div class="step" data-rv><span class="step__n">${String(i+1).padStart(2,'0')}</span><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join('')}
    </div>
  </div></section>
  <section class="section bleed-ink"><div class="wrap">
    <h2 class="display sec__h sec__h--gap">${esc(p.timelineH)}</h2>
    <div class="timeline">
      ${timeline[lang].map(t=>`<div class="tl" data-rv="left"><span class="tl__yr">${esc(t.y)}</span><p>${esc(t.d)}</p></div>`).join('')}
    </div>
  </div></section>
  <section class="section wrap">
    <h2 class="display sec__h" style="margin-bottom:var(--s-4)">${esc(p.formH)}</h2>
    <p class="lede" style="margin-bottom:var(--s-6)">${esc(p.formSub)}</p>
    <form class="form" data-form>
      ${[['name','text','name'],['phone','tel','tel'],['email','email','email'],['subject','text','off']]
        .map(([k,ty,ac])=>`<div class="field"><label for="f-${k}">${esc(f[k])} *</label><input id="f-${k}" name="${k}" type="${ty}" autocomplete="${ac}" required></div>`).join('')}
      <div class="field"><label for="f-message">${esc(f.message)}</label><textarea id="f-message" name="message" rows="5"></textarea></div>
      <div><button class="btn" type="submit">${esc(S(lang,'cta').submit)}</button></div>
      <p data-formnote role="status" aria-live="polite" style="font-size:var(--t--1);color:var(--text-mute)"></p>
    </form>
  </section>`;
}

function clubPage(lang) {
  const p = pages.club[lang];
  return `
  <section class="section--tight wrap pagehead">
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 class="display pagehead__h pagehead__h--tight">${esc(p.h1)}</h1>
    <p class="lede">${esc(p.sub)}</p>
  </section>
  ${marquee(lang)}
  <section class="section wrap">
    <h2 class="display sec__h sec__h--gap">${esc(p.howH)}</h2>
    <div class="steps">
      ${p.how.map(s=>`<div class="step" data-rv><span class="step__n">${esc(s.n)}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>`).join('')}
    </div>
  </section>
  <section class="section bleed-crimson"><div class="wrap">
    <h2 class="display sec__h sec__h--gap-s">${esc(p.tiersH)}</h2>
    <div class="tiers">
      ${p.tiers.map(t=>`<div class="tier" data-rv><b>${esc(t.n)}</b><span>${esc(t.t)}</span></div>`).join('')}
    </div>
    <h3 class="display" style="font-size:var(--t-2);margin-block:var(--s-8) var(--s-4)">${esc(p.perksH)}</h3>
    <ul class="ticks">${p.perks.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
  </div></section>
  <section class="section wrap">
    <div class="split">
      <div>
        <h2 class="display sec__h sec__h--gap-xs">${esc(p.appH)}</h2>
        <p>${esc(p.appBody)}</p>
      </div>
      <div class="qr">
        <figure><img src="${asset('brand/qr-appstore.png')}" alt="App Store QR"><figcaption>App Store</figcaption></figure>
        <figure><img src="${asset('brand/qr-googleplay.png')}" alt="Google Play QR"><figcaption>Google Play</figcaption></figure>
      </div>
    </div>
  </section>`;
}

function contactPage(lang) {
  const p = pages.contact[lang], f = p.fields;
  return `
  <section class="section wrap pagehead">
    <p class="kicker">${esc(p.kicker)}</p>
    <h1 class="display pagehead__h">${esc(p.h1)}</h1>
    <p class="lede" style="margin-bottom:var(--s-7)">${esc(p.sub)}</p>
    <form class="form" data-form>
      ${[['name','text','name'],['email','email','email'],['subject','text','off']]
        .map(([k,ty,ac])=>`<div class="field"><label for="c-${k}">${esc(f[k])} *</label><input id="c-${k}" name="${k}" type="${ty}" autocomplete="${ac}" required></div>`).join('')}
      <div class="field"><label for="c-message">${esc(f.message)} *</label><textarea id="c-message" name="message" rows="6" required></textarea></div>
      <div><button class="btn" type="submit">${esc(S(lang,'cta').submit)}</button></div>
      <p data-formnote role="status" aria-live="polite" style="font-size:var(--t--1);color:var(--text-mute)"></p>
    </form>
  </section>`;
}

/* ---------- inline datasets (real content from the client's site) ---------- */
const promos = {
  en: [
    { on:true,  t:"Mid-Autumn Mooncake Gift Box", d:"Six mooncakes across three flavours, plus $25 of vouchers in the box. From 15 to 27 September, spend $60 and add one for $44.90, or buy it outright for $55.90. In store and pick-up at every shop, while stocks last." },
    { on:false, t:"Coconut Laksa Soup Base lands in Melbourne", d:"Our Melbourne shops introduced the new Laksa base with a $3 OFF voucher, free in the app's voucher mall for members." },
    { on:false, t:"Collingwood opening: buy one get one free", d:"Our 17th shop opened on Smith Street with buy one get one free on Malatang, plus an in-store game for a shot at a Giant Opening Gift Pack." },
    { on:false, t:"Carnegie opening: free ice cream for a year", d:"Our 16th shop opened with free yogurt ice cream on any Malatang, a $50 voucher pack for $25, and a Circle & Win game with free ice cream for a year as the top prize." }
  ],
  zh: [
    { on:true,  t:"中秋月饼礼盒", d:"三种口味共六枚月饼，礼盒内另附 25 澳元代金券。9 月 15 日至 27 日，消费满 60 澳元可加 44.90 澳元换购，或直接以 55.90 澳元购买。全澳门店均可购买及自取，售完即止。" },
    { on:false, t:"椰香叻沙汤底登陆墨尔本", d:"墨尔本门店推出全新叻沙汤底，会员可在应用券城免费领取 3 澳元优惠券。" },
    { on:false, t:"科林伍德新店：麻辣烫买一送一", d:"第 17 家门店在史密斯街开业，麻辣烫买一送一，另有店内互动游戏，有机会赢取开业超级礼包。" },
    { on:false, t:"卡内基新店：冰淇淋免费吃一年", d:"第 16 家门店开业，凡点麻辣烫即送酸奶冰淇淋，50 澳元券包仅售 25 澳元，并设「转盘赢好礼」游戏，头奖为免费冰淇淋吃一年。" }
  ]
};
const news = {
  en: [
    { date:"23 Dec 2025", t:"What it really costs to open a hot pot restaurant in 2026", d:"A plain breakdown of startup costs for anyone weighing up a hot pot venue, from fit-out to equipment to the things people forget to budget for." },
    { date:"23 Dec 2025", t:"Is David's Master Pot halal? A straight answer", d:"We are not halal-certified in Australia. Our signature broths are built on a pork bone base. Here is the full detail so you can decide before you visit." },
    { date:"23 Dec 2025", t:"Where did hot pot actually come from?", d:"A short history of the communal pot, from the Chinese riverbanks where it started to the shopping centres where it now lives." },
    { date:"23 Dec 2025", t:"Malatang explained: hot pot's street food cousin", d:"Born in Sichuan, malatang gives you a customised bowl of spicy noodle soup in ten to fifteen minutes. No table, no waiting, no set menu." },
    { date:"18 Dec 2025", t:"Chinese food in Adelaide, done your way", d:"Two Adelaide shops, one interactive model, and a fridge full of Sichuan ingredients waiting to be picked." },
    { date:"25 Dec 2024", t:"Melbourne hot pot, delivered near you", d:"Bold Sichuan flavours without leaving the house, from the Melbourne shops closest to your door." }
  ],
  zh: [
    { date:"2025年12月23日", t:"2026 年开一家火锅店，到底要花多少钱", d:"从装修、设备到最容易被漏算的开支，为正在考虑开店的人做一份实在的成本拆解。" },
    { date:"2025年12月23日", t:"David's Master Pot 是清真认证吗？直接回答", d:"我们在澳大利亚并未取得清真认证，招牌汤底以猪骨熬制。详细说明如下，供您在到店前做决定。" },
    { date:"2025年12月23日", t:"火锅究竟从哪儿来", d:"一锅共食的简史：从最初的中国江畔，到如今的购物中心。" },
    { date:"2025年12月23日", t:"麻辣烫：火锅的街头表亲", d:"源自四川，十到十五分钟就能端走一碗自选的麻辣汤粉。不用占桌，不用等位，没有固定菜单。" },
    { date:"2025年12月18日", t:"在阿德莱德，中餐也能自己配", d:"两家门店，一套互动模式，一柜子等你来挑的四川食材。" },
    { date:"2024年12月25日", t:"墨尔本火锅，送到你家门口", d:"不出门也能吃到地道川味，由离你最近的墨尔本门店送出。" }
  ]
};
const timeline = {
  en: [
    { y:"2017", d:"September — David's Master Pot is founded and lands in Melbourne." },
    { y:"2018", d:"17 November — the first shop opens on Melbourne's busiest street. The next day, we expand into Brisbane." },
    { y:"2019", d:"A second Melbourne branch opens in March. The Chef David flagship follows in November." },
    { y:"2020", d:"Five shops in Melbourne. David's Hot Pot reaches Docklands and Point Cook, and the group covers the Gold Coast and Adelaide by year end." },
    { y:"2023", d:"Franchise shops span Victoria, South Australia and Queensland, taking the group to eight in Australia. Our signature hot pot beef reaches central Brisbane." },
    { y:"2024", d:"Two new locations bring authentic malatang to more of the country." },
    { y:"2025", d:"Three more shops. One mission: unmistakable hot pot, everywhere in Australia." },
    { y:"2026", d:"Collingwood opens in August. Harbour Town on the Gold Coast follows in September." }
  ],
  zh: [
    { y:"2017", d:"9 月，David's Master Pot 创立，落地墨尔本。" },
    { y:"2018", d:"11 月 17 日，第一家门店在墨尔本最繁忙的街道开业。次日，品牌进入布里斯班。" },
    { y:"2019", d:"3 月，墨尔本第二家分店开业；11 月，Chef David 旗舰店揭幕。" },
    { y:"2020", d:"墨尔本增至五家门店，David's Hot Pot 进驻 Docklands 与 Point Cook；年底，集团版图覆盖黄金海岸与阿德莱德。" },
    { y:"2023", d:"加盟门店遍及维州、南澳与昆州，全澳达到八家。招牌肥牛进入布里斯班市中心。" },
    { y:"2024", d:"新增两家门店，把地道麻辣烫带到更多城市。" },
    { y:"2025", d:"再开三家门店，目标只有一个：让全澳都吃到不会认错的那锅味道。" },
    { y:"2026", d:"8 月科林伍德开业，9 月黄金海岸海港城接力。" }
  ]
};

module.exports = { home, menuPage, buildPage, storesPage, promosPage, newsPage, franchisePage, clubPage, contactPage };
