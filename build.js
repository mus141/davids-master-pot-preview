const fs = require('fs'), path = require('path');
const R = __dirname;
const read = f => JSON.parse(fs.readFileSync(path.join(R, 'content', f), 'utf8'));
const site = read('site.json'), menu = read('menu.json'), stores = read('stores.json'), pages = read('pages.json');
const LANGS = ['en', 'zh'];
const OUT = path.join(R, 'build');

// Base path for hosting under a subdirectory (GitHub Pages serves at
// /<repo>/). Empty for root hosting on the real domain.
const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
const PREVIEW = process.env.PREVIEW === '1';

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const para = s => s.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('');

// Page registry: slug -> {file, navKey}
const NAV = ['menu','build','stores','promotions','news','franchise','club'];
const SLUG = { home:'index', menu:'menu', build:'build-your-own', stores:'stores',
  promotions:'promotions', news:'whats-new', franchise:'franchise', club:'club-david', contact:'contact' };

const url = (lang, key) => `${BASE}/${lang}/${SLUG[key] === 'index' ? '' : SLUG[key] + '/'}`;
const asset = p => BASE + '/assets/' + p.replace(/\.(png|jpe?g|webp)$/i, '.webp');

function heat(n, lang) {
  const label = lang === 'en' ? 'Heat' : '辣度';
  let d = '';
  for (let i = 0; i < 3; i++) d += `<i${i < n ? '' : ' data-off'}></i>`;
  return n === 0 ? '' : `<span class="heat">${label} ${d}</span>`;
}
const allerg = (list, lang) => lang === 'en'
  ? list.join(', ')
  : list.map(a => site.allergens[a] || a).join('、');

function shell({ lang, key, title, desc, body }) {
  const t = site.strings[lang], other = lang === 'en' ? 'zh' : 'en';
  const nav = NAV.map(k =>
    `<a href="${url(lang,k)}"${k===key?' aria-current="page"':''}>${esc(t.nav[k])}</a>`).join('');
  return `<!doctype html>
<html lang="${lang === 'zh' ? 'zh-Hans' : 'en-AU'}" data-lang="${lang}" data-form-endpoint="${esc(site.formEndpoint || '')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="alternate" hreflang="en-AU" href="https://davidsmasterpot.com.au${url('en',key)}">
<link rel="alternate" hreflang="zh-Hans" href="https://davidsmasterpot.com.au${url('zh',key)}">
<link rel="alternate" hreflang="x-default" href="https://davidsmasterpot.com.au${url('en',key)}">
<link rel="icon" href="${asset('brand/logo.png')}">
${PREVIEW ? '<meta name="robots" content="noindex, nofollow">' : ''}
<link rel="preload" href="${BASE}/assets/fonts/archivo-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${BASE}/assets/fonts/anton-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${BASE}/fonts.css">
<link rel="stylesheet" href="${BASE}/styles.css">
<script>document.documentElement.className='js';</script>
<style>:root{}</style>
</head>
<body data-loading>
<div class="loader" role="status" aria-live="polite" aria-label="${lang==='zh'?'加载中':'Loading'}">
  <div class="loader__in">
    <div class="loader__seal">
      <span class="steam"><b></b><b></b><b></b></span>
      <span class="loader__ring"></span>
      <span class="loader__ring"></span>
      <span class="loader__ring loader__ring--spin"></span>
      <span class="loader__mark">大味</span>
    </div>
    <span class="loader__word">${lang==='zh'?'汤已上火':'Bringing it to the boil'}</span>
    <span class="loader__bar"><i></i></span>
  </div>
</div>
<span class="progress" aria-hidden="true"></span>
<a class="skip" href="#main">${esc(t.common.skip)}</a>
<header class="hdr">
  <div class="wrap hdr__in">
    <a class="hdr__logo" href="${url(lang,'home')}">
      <img src="${asset('brand/logo.png')}" alt="David's Master Pot">
    </a>
    <nav class="hdr__nav" id="nav">${nav}
      <a class="lang" href="${url(other,key)}" hreflang="${other}">${esc(t.common.langLabel)}</a>
    </nav>
    <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<main id="main">${body}</main>
<div class="orderbar">
  <div class="wrap orderbar__in">
    <p>${lang==='zh'?'靠最近的门店，自己配一碗。':'Your nearest pot is closer than you think.'}</p>
    <a class="btn" href="${url(lang,'stores')}">${esc(t.cta.findStore)}</a>
    <a class="btn btn--ghost" href="${url(lang,'menu')}">${esc(t.cta.seeMenu)}</a>
  </div>
</div>
<footer class="ftr">
  <div class="wrap">
    <div class="ftr__grid">
      <div>
        <img class="ftr__logo" src="${asset('brand/logo.png')}" alt="">
        <p class="ftr__tag">${lang==='en'
          ? 'Authentic Sichuan malatang, built your way, across Australia.'
          : '地道四川麻辣烫，自己配的那一碗，遍布全澳。'}</p>
      </div>
      <div><h4>${lang==='en'?'Discover':'探索'}</h4><ul>
        ${['menu','build','stores','promotions'].map(k=>`<li><a href="${url(lang,k)}">${esc(t.nav[k])}</a></li>`).join('')}
      </ul></div>
      <div><h4>${lang==='en'?'Company':'公司'}</h4><ul>
        ${['franchise','club','news','contact'].map(k=>`<li><a href="${url(lang,k)}">${esc(t.nav[k])}</a></li>`).join('')}
      </ul></div>
      <div><h4>${lang==='en'?'Social':'关注我们'}</h4><ul>
        <li><a href="${site.brand.social.instagram}" rel="noopener">Instagram</a></li>
        <li><a href="${site.brand.social.facebook}" rel="noopener">Facebook</a></li>
        <li><a href="${site.brand.social.xiaohongshu}">小红书</a></li>
      </ul></div>
    </div>
    <div class="ftr__base">
      <span>© ${new Date().getFullYear()} David's Management Group.</span>
      <span>${esc(t.common.storeCount)}</span>
    </div>
  </div>
</footer>
<script src="${BASE}/app.js" defer></script>
</body></html>`;
}
module.exports = { BASE, PREVIEW, site, menu, stores, pages, LANGS, OUT, SLUG, NAV, url, asset, esc, para, heat, allerg, shell, read };
