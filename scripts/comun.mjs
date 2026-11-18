// Ruta: scripts/comun.mjs
// Piezas comunes de todas las páginas de iaencrudo.es: cabecera, pie, scripts (GoatCounter y AdSense)
// y JSON-LD. Los estilos se leen de scripts/plantilla.txt para que la portada y el resto sean iguales.
import { readFileSync } from 'node:fs';

export const URL_BASE = 'https://iaencrudo.es';
export const EMAIL = 'contacto@iaencrudo.es';
export const YOUTUBE = 'https://www.youtube.com/@iaencrudo';
export const TITULAR = 'Aarón Gómez Vera';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const PLANTILLA = readFileSync(new URL('plantilla.txt', import.meta.url), 'utf8');
/** El bloque <style> de la portada, para usarlo igual en las demás páginas. */
export const ESTILOS = PLANTILLA.match(/<style>[\s\S]*?<\/style>/)[0];

/** Scripts que lleva cada página: recuento de visitas sin cookies (GoatCounter) y AdSense. No tocar el de AdSense. */
export const SCRIPTS = `<script>window.goatcounter = { path: function (p) { return location.host + p; } };</script>
<script data-goatcounter="https://iaencrudo.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3004394150242621" crossorigin="anonymous"></script>`;

/** Barra superior, igual en todas las páginas. */
export const BARRA = `<nav class="barra" aria-label="Principal">
<a class="marca" href="/"><img src="/logo-96.png" alt="Logotipo de IA en Crudo" width="32" height="32">IA en Crudo</a>
<span class="menu"><a href="/sobre-mi">Sobre mí</a><a href="/como-hacemos-este-contenido">Cómo lo hacemos</a><a href="/contacto">Contacto</a></span>
</nav>`;

/** Pie reducido: legales, contacto y un único enlace a YouTube. */
export const PIE = `<footer>
<p>© 2026 IA en Crudo · <a href="/sobre-mi">Sobre mí</a> · <a href="/como-hacemos-este-contenido">Cómo hacemos este contenido</a> · <a href="/contacto">Contacto</a> · <a href="/aviso-legal">Aviso legal</a> · <a href="/politica-privacidad">Privacidad</a> · <a href="/politica-cookies">Cookies</a></p>
<p>Síguenos en <a href="${YOUTUBE}">YouTube</a>, <a href="https://www.tiktok.com/@iaencrudo">TikTok</a> e <a href="https://www.instagram.com/iaencrudo">Instagram</a>.</p>
</footer>`;

/** Estilos que solo necesitan las páginas interiores (y la barra, que también usa la portada). */
export const ESTILOS_EXTRA = `<style>
.barra{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;padding:16px 0 0;font-size:15px}
.barra .marca{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--txt);text-decoration:none}
.barra .marca img{border-radius:8px}
.barra .menu{display:flex;flex-wrap:wrap;gap:4px 16px}
.barra .menu a{color:var(--sub);text-decoration:none}
.barra .menu a:hover{color:var(--acc)}
.migas{font-size:14px;color:var(--sub);margin:24px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:6px}
.migas li+li::before{content:"›";margin-right:6px}
.migas a{color:var(--sub)}
article.doc{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:24px;margin:16px 0 32px}
article.doc h1{margin-top:0}
article.doc h2{font-size:22px;margin:28px 0 8px}
article.doc h3{font-size:18px;margin:20px 0 6px}
article.doc .fecha{font-size:14px;color:var(--sub)}
article.doc table{border-collapse:collapse;width:100%;font-size:14px}
article.doc th,article.doc td{border-bottom:1px solid var(--line);padding:8px;text-align:left;vertical-align:top}
.tabla{overflow-x:auto}
.faq details{border-top:1px solid var(--line);padding:12px 0}
.faq summary{font-weight:600;cursor:pointer}
.faq p{margin:8px 0 0}
</style>`;

/** JSON-LD: se escapa «</» para que el texto no cierre el <script>. */
export const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/<\//g, '<\\/')}</script>`;

export const ORGANIZACION = {
  '@type': 'Organization',
  '@id': `${URL_BASE}/#organizacion`,
  name: 'IA en Crudo',
  url: `${URL_BASE}/`,
  logo: { '@type': 'ImageObject', url: `${URL_BASE}/logo.png`, width: 800, height: 800 },
  email: EMAIL,
  founder: { '@type': 'Person', name: TITULAR, url: `${URL_BASE}/sobre-mi` },
  sameAs: [YOUTUBE, 'https://www.tiktok.com/@iaencrudo', 'https://www.instagram.com/iaencrudo'],
};

export const migasLd = (migas) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Inicio', ruta: '/' }, ...migas].map((m, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: m.name,
    item: `${URL_BASE}${m.ruta}`,
  })),
});

export const faqLd = (preguntas) => ({
  '@type': 'FAQPage',
  mainEntity: preguntas.map((p) => ({
    '@type': 'Question',
    name: p.q,
    acceptedAnswer: { '@type': 'Answer', text: p.a.replace(/<[^>]+>/g, '') },
  })),
});

/** Bloque FAQ visible (las mismas preguntas que el JSON-LD FAQPage). */
export const faqHtml = (preguntas, titulo = 'Preguntas frecuentes') => `<section class="faq">
<h2>${esc(titulo)}</h2>
${preguntas.map((p) => `<details open><summary>${esc(p.q)}</summary><p>${p.a}</p></details>`).join('\n')}
</section>`;

/**
 * Página interior completa.
 * @param {{ruta:string,titulo:string,h1:string,descripcion:string,ogDescripcion:string,cuerpo:string,actualizado?:string,ld?:object[],tipo?:string,indexar?:boolean}} p
 */
export function pagina(p) {
  const url = `${URL_BASE}${p.ruta}`;
  const migas = [{ name: p.h1, ruta: p.ruta }];
  const grafo = [ORGANIZACION, { '@type': p.tipo || 'WebPage', '@id': `${url}#pagina`, url, name: p.titulo, description: p.descripcion, inLanguage: 'es', isPartOf: { '@id': `${URL_BASE}/#web` }, publisher: { '@id': `${URL_BASE}/#organizacion` } }, migasLd(migas), ...(p.ld || [])];
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.titulo)}</title>
<meta name="description" content="${esc(p.descripcion)}">
${p.indexar === false ? '<meta name="robots" content="noindex, follow">\n' : ''}<link rel="canonical" href="${url}">
<link rel="icon" href="/logo-96.png" type="image/png">
<meta property="og:title" content="${esc(p.titulo)}">
<meta property="og:description" content="${esc(p.ogDescripcion)}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<meta property="og:image" content="${URL_BASE}/logo.png">
<meta name="twitter:card" content="summary">
<meta name="twitter:description" content="${esc(p.twitterDescripcion || p.ogDescripcion + ' IA en Crudo.')}">
${SCRIPTS}
${jsonLd({ '@context': 'https://schema.org', '@graph': grafo })}
${ESTILOS}
${ESTILOS_EXTRA}
</head>
<body>
<div class="wrap">
${BARRA}
<ol class="migas"><li><a href="/">Inicio</a></li><li aria-current="page">${esc(p.h1)}</li></ol>
<main>
<article class="doc">
<h1>${esc(p.h1)}</h1>
${p.actualizado ? `<p class="fecha">Actualizado el ${esc(p.actualizado)}</p>\n` : ''}${p.cuerpo}
</article>
</main>
${PIE}
</div>
</body>
</html>
`;
}
