const fs = require('fs'), path = require('path');
const B = require('./build.js');
const R = require('./render.js');
const { LANGS, OUT, SLUG, shell, pages, esc } = B;

const META = {
  en: {
    home:   ["Build Your Own Hot Pot | David's Master Pot", "Authentic Sichuan malatang across Australia. Pick a broth, stack your bowl, pay by weight. 20 shops in four states."],
    menu:   ["Menu | David's Master Pot", "Seven soup bases, over 100 ingredients and one price per 100g. Full allergen detail on every item."],
    build:  ["How It Works | David's Master Pot", "Assisted self-serve hot pot explained in three steps, plus honest answers on price, spice, vegetarian options and halal."],
    stores: ["Find a Store | David's Master Pot", "20 David's Master Pot shops across Melbourne, Brisbane, the Gold Coast, Perth and Adelaide."],
    promotions: ["Promotions | David's Master Pot", "Current offers, seasonal gift boxes and app-only vouchers at David's Master Pot."],
    news:   ["What's New | David's Master Pot", "New shops, new broths and notes on where hot pot and malatang actually came from."],
    franchise: ["Franchise | David's Master Pot", "Twenty shops in eight years. Franchise opportunities with David's Management Group across Australia."],
    club:   ["Club David | David's Master Pot", "Over $200 of vouchers on joining, points on every visit and a lifetime discount that grows with your tier."],
    contact:["Contact | David's Master Pot", "Feedback, media, catering and order enquiries for David's Master Pot."]
  },
  zh: {
    home:   ["自己的锅，自己配 | David's Master Pot", "地道四川麻辣烫，遍布全澳。选汤底、装满碗、按重量结账。四州二十家门店。"],
    menu:   ["菜单 | David's Master Pot", "七款汤底，百余种食材，统一按每 100 克计价，每道菜品均标注过敏原。"],
    build:  ["怎么吃 | David's Master Pot", "三步讲清半自助麻辣烫，并如实说明价格、辣度、素食选择与清真问题。"],
    stores: ["门店 | David's Master Pot", "墨尔本、布里斯班、黄金海岸、珀斯与阿德莱德，共二十家门店。"],
    promotions: ["优惠活动 | David's Master Pot", "当前优惠、节令礼盒与应用专属代金券。"],
    news:   ["最新消息 | David's Master Pot", "新店、新汤底，以及关于火锅与麻辣烫来历的记录。"],
    franchise: ["加盟合作 | David's Master Pot", "八年二十店。David's Management Group 全澳加盟机会。"],
    club:   ["大卫会员 | David's Master Pot", "注册即送逾 200 澳元代金券，消费累积积分，等级越高折扣越大。"],
    contact:["联系我们 | David's Master Pot", "意见反馈、媒体合作、宴会订餐与订单咨询。"]
  }
};

const RENDER = { home:R.home, menu:R.menuPage, build:R.buildPage, stores:R.storesPage,
  promotions:R.promosPage, news:R.newsPage, franchise:R.franchisePage, club:R.clubPage, contact:R.contactPage };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let n = 0;
for (const lang of LANGS) {
  for (const key of Object.keys(SLUG)) {
    const [title, desc] = META[lang][key];
    const html = shell({ lang, key, title, desc, body: RENDER[key](lang) });
    const dir = SLUG[key] === 'index' ? path.join(OUT, lang) : path.join(OUT, lang, SLUG[key]);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    n++;
  }
  // 404 per language
  const nf = pages.notFound[lang];
  const body = `<section class="section wrap" style="padding-block:var(--s-10);text-align:left">
    <h1 class="display" style="font-size:var(--t-5)">${esc(nf.h1)}</h1>
    <p class="lede" style="margin-block:var(--s-5) var(--s-6)">${esc(nf.sub)}</p>
    <a class="btn" href="${B.BASE}/${lang}/">${esc(B.site.strings[lang].cta.backHome)}</a></section>`;
  fs.writeFileSync(path.join(OUT, lang, '404.html'),
    shell({ lang, key:'home', title: (lang==='en'?'Page not found':'页面不存在')+" | David's Master Pot", desc:'', body }));
}

// Concatenated stylesheet
const css = ['tokens','base','components','motion'].map(f => fs.readFileSync(path.join(__dirname,'src',f+'.css'),'utf8')).join('\n');
fs.writeFileSync(path.join(OUT,'styles.css'), css);
fs.copyFileSync(path.join(__dirname,'src','app.js'), path.join(OUT,'app.js'));
fs.writeFileSync(path.join(OUT,'fonts.css'),
  fs.readFileSync(path.join(__dirname,'assets-src','fonts','fonts.css'),'utf8')
    .replace(/url\('\/assets\/fonts\//g, `url('${B.BASE}/assets/fonts/`));

// Cache-busting: stamp styles.css / app.js with a content hash so a
// plain refresh always picks up changes instead of serving a stale file.
const crypto = require('crypto');
const hash = f => crypto.createHash('sha1')
  .update(fs.readFileSync(path.join(OUT, f))).digest('hex').slice(0, 8);
const vCss = hash('styles.css'), vJs = hash('app.js');
for (const f of fs.readdirSync(OUT, { recursive: true })) {
  if (!String(f).endsWith('.html')) continue;
  const fp = path.join(OUT, String(f));
  fs.writeFileSync(fp, fs.readFileSync(fp, 'utf8')
    .replace('/styles.css"', `/styles.css?v=${vCss}"`)
    .replace('/app.js"', `/app.js?v=${vJs}"`));
}
console.log('cache-bust css=' + vCss + ' js=' + vJs);

// Assets
fs.cpSync(path.join(__dirname,'assets'), path.join(OUT,'assets'), { recursive: true });

// Root redirect honouring browser language
fs.writeFileSync(path.join(OUT,'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>David's Master Pot</title><meta name="robots" content="noindex">
<link rel="canonical" href="${B.BASE}/en/">
<script>var B="${B.BASE}";location.replace((navigator.language||'en').toLowerCase().startsWith('zh')?B+'/zh/':B+'/en/');</script>
</head><body><p><a href="${B.BASE}/en/">English</a> · <a href="${B.BASE}/zh/">中文</a></p></body></html>`);

// sitemap
const urls = [];
for (const lang of LANGS) for (const key of Object.keys(SLUG)) urls.push(B.url(lang,key));
fs.writeFileSync(path.join(OUT,'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
urls.map(u=>`  <url><loc>https://davidsmasterpot.com.au${u}</loc></url>`).join('\n')+`\n</urlset>\n`);

console.log(`built ${n} pages + 2 error pages, ${LANGS.length} languages`);
