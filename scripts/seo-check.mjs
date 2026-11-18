// Ruta: scripts/seo-check.mjs
// Comprueba las páginas HTML de iaencrudo.es antes de publicar. Sale con código 1 si algo falla.
// Uso: node scripts/seo-check.mjs
import { readFileSync, readdirSync } from 'node:fs';

const RAIZ = new URL('..', import.meta.url);
const leer = (f) => readFileSync(new URL(f, RAIZ), 'utf8');
const BASE = 'https://iaencrudo.es';
const IGNORAR = new Set(['google086ef6036430d125.html']);
const errores = [];
const mal = (f, m) => errores.push(`${f}: ${m}`);

const sitemap = [...leer('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const rutaDe = (f) => (f === 'index.html' ? '/' : `/${f.replace(/\.html$/, '')}`);
const archivos = readdirSync(RAIZ).filter((f) => f.endsWith('.html') && !IGNORAR.has(f) && !f.includes(' 2'));

for (const f of archivos) {
  const h = leer(f);
  const texto = (re) => h.match(re)?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"') ?? null;
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(h);
  const url = BASE + rutaDe(f);

  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) mal(f, `${h1} H1 (debe haber 1)`);

  const titulo = texto(/<title>([^<]*)<\/title>/);
  if (!titulo) mal(f, 'sin <title>');
  else if ([...titulo].length > 60) mal(f, `title de ${[...titulo].length} caracteres (máx. 60)`);

  if (!/<html lang="es"/.test(h)) mal(f, 'sin lang="es"');
  if (/href="#"/.test(h)) mal(f, 'enlace href="#"');
  for (const img of h.match(/<img\b[^>]*>/g) || []) if (!/\salt="[^"]+"/.test(img)) mal(f, `imagen sin alt: ${img}`);

  if (noindex) {
    if (sitemap.includes(url)) mal(f, 'noindex pero está en el sitemap');
    continue; // la 404 no necesita descripción, canonical ni JSON-LD
  }

  const desc = texto(/<meta name="description" content="([^"]*)"/);
  if (!desc) mal(f, 'sin meta description');
  else if ([...desc].length > 155) mal(f, `description de ${[...desc].length} caracteres (máx. 155)`);

  const canon = texto(/<link rel="canonical" href="([^"]*)"/);
  if (canon !== url) mal(f, `canonical ${canon} (esperado ${url})`);
  if (!sitemap.includes(url)) mal(f, 'indexable pero no está en el sitemap');

  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) mal(f, 'sin JSON-LD');
  for (const [, j] of ld) {
    try { JSON.parse(j); } catch (e) { mal(f, `JSON-LD no válido: ${e.message}`); }
  }
  for (const m of ['og:title', 'og:description', 'og:image', 'twitter:card']) if (!h.includes(`"${m}"`)) mal(f, `sin ${m}`);
}

for (const u of sitemap) {
  const f = u === `${BASE}/` ? 'index.html' : `${u.slice(BASE.length + 1)}.html`;
  if (!archivos.includes(f)) mal('sitemap.xml', `${u} no tiene página`);
}
if (!/Sitemap: https:\/\/iaencrudo\.es\/sitemap\.xml/.test(leer('robots.txt'))) mal('robots.txt', 'no enlaza el sitemap');
if (!leer('ads.txt').includes('pub-3004394150242621')) mal('ads.txt', 'falta la línea de AdSense');

if (errores.length) {
  console.error(`[seo-check] ${errores.length} fallos:\n- ${errores.join('\n- ')}`);
  process.exit(1);
}
console.log(`[seo-check] OK: ${archivos.length} páginas, ${sitemap.length} URL en el sitemap.`);
