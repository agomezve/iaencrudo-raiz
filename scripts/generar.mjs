// Ruta: scripts/generar.mjs
// Genera index.html a partir de scripts/plantilla.txt con los datos del día:
//   - Carburantes: JSON públicos de RepostaBarato (que a su vez salen de la API del Ministerio
//     para la Transición Ecológica).
//   - Luz: PVPC por horas de la API pública de Red Eléctrica (REE).
//   - Festivos: resolución del BOE recogida por Vacacionable (festivos-boe.json).
// Sin dependencias. Si una fuente falla, ese bloque muestra un aviso y el resto se genera igual.
// Lo lanza el workflow "Actualizar portada" cada mañana y cada tarde.
import { readFileSync, writeFileSync } from 'node:fs';

const RAIZ = new URL('..', import.meta.url);
const RB = 'https://repostabarato.iaencrudo.es';
const REE = 'https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real';
const FESTIVOS = 'https://raw.githubusercontent.com/agomezve/vacacionable-web/main/src/data/festivos-boe.json';
/** Canarias, Ceuta y Melilla tienen otra fiscalidad (IGIC e IPSI): se analizan aparte. */
const FUERA_RANKING = new Set(['35', '38', '51', '52']);
const ELECCIONES = '2026-11-29';

const num = (n, d = 2) => n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const titulo = (s) => s.toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());

function fechaMadrid(dias = 0) {
  const d = new Date(Date.now() + dias * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(d);
}
const HOY = fechaMadrid();
const fechaLarga = (iso) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`)).replace(',', '');

async function json(url) {
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(30_000), headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn(`[generar] ${url} intento ${i}: ${e.message}`);
      if (i < 3) await new Promise((r) => setTimeout(r, 2000 * i));
    }
  }
  return null;
}

const media = (a) => a.reduce((s, x) => s + x, 0) / a.length;

// ---------- Carburantes ----------
async function carburantes() {
  const indice = await json(`${RB}/datos/indice.json`);
  if (!indice) return null;
  const provs = [];
  let todas = [];
  for (const p of indice.provincias) {
    const d = await json(`${RB}/datos/p/${p.id}.json`);
    if (!d?.estaciones?.length) continue;
    const e95 = d.estaciones.filter((e) => e.g95 > 0);
    const eGsa = d.estaciones.filter((e) => e.gsa > 0);
    if (!e95.length || !eGsa.length) continue;
    provs.push({ ...p, n: d.estaciones.length, g95: media(e95.map((e) => e.g95)), gsa: media(eGsa.map((e) => e.gsa)) });
    if (!FUERA_RANKING.has(p.id)) todas = todas.concat(d.estaciones.map((e) => ({ ...e, prov: p.nombre, slug: p.slug })));
  }
  if (provs.length < 40) return null; // datos incompletos: mejor no publicar un ranking cojo
  const pen = provs.filter((p) => !FUERA_RANKING.has(p.id));
  const por95 = [...pen].sort((a, b) => a.g95 - b.g95);
  const porGsa = [...pen].sort((a, b) => a.gsa - b.gsa);
  const t95 = todas.filter((e) => e.g95 > 0);
  const tGsa = todas.filter((e) => e.gsa > 0);
  const min95 = t95.reduce((a, b) => (b.g95 < a.g95 ? b : a));
  const max95 = t95.reduce((a, b) => (b.g95 > a.g95 ? b : a));
  const can = provs.filter((p) => p.id === '35' || p.id === '38');
  return {
    fecha: indice.fecha,
    estaciones: provs.reduce((s, p) => s + p.n, 0),
    media95: media(t95.map((e) => e.g95)),
    mediaGsa: media(tGsa.map((e) => e.gsa)),
    barata95: por95[0], cara95: por95.at(-1),
    barataGsa: porGsa[0], caraGsa: porGsa.at(-1),
    min95, max95,
    canarias95: can.length ? media(can.map((p) => p.g95)) : null,
  };
}

// ---------- Luz (PVPC) ----------
async function luz() {
  const url = `${REE}?start_date=${fechaMadrid(-1)}T00:00&end_date=${fechaMadrid(1)}T23:59&time_trunc=hour`;
  const d = await json(url);
  const serie = d?.included?.find((s) => s.type === 'PVPC' || s.id === '1001')?.attributes?.values;
  if (!serie?.length) return null;
  const dias = {};
  for (const v of serie) (dias[v.datetime.slice(0, 10)] ??= []).push({ h: Number(v.datetime.slice(11, 13)), p: v.value / 1000 });
  const hoy = dias[HOY];
  if (!hoy || hoy.length < 23) return null;
  const ayer = dias[fechaMadrid(-1)];
  const barata = hoy.reduce((a, b) => (b.p < a.p ? b : a));
  const cara = hoy.reduce((a, b) => (b.p > a.p ? b : a));
  return {
    media: media(hoy.map((x) => x.p)),
    ayer: ayer?.length >= 23 ? media(ayer.map((x) => x.p)) : null,
    barata, cara,
    manana: (dias[fechaMadrid(1)]?.length ?? 0) >= 23,
  };
}

// ---------- Festivos ----------
async function festivos() {
  const d = await json(FESTIVOS);
  if (!d?.anios) return null;
  const cuenta = {};
  let total = 19;
  for (const anio of Object.values(d.anios)) {
    total = anio.regiones?.length ?? total;
    for (const [region, lista] of Object.entries(anio.festivos)) {
      for (const f of lista) if (f.fecha >= HOY) ((cuenta[f.fecha] ??= { nombre: f.nombre, regiones: [] }).regiones.push(region));
    }
  }
  const prox = Object.keys(cuenta).sort().slice(0, 3).map((f) => ({ fecha: f, ...cuenta[f], n: cuenta[f].regiones.length }));
  return prox.length ? { prox, total } : null;
}

const [gas, pvpc, fest] = await Promise.all([carburantes(), luz(), festivos()]);
const hora = (h) => `${String(h).padStart(2, '0')}:00–${String((h + 1) % 24).padStart(2, '0')}:00`;
const nada = (que) => `<p class="aviso">Hoy no se han podido descargar los datos de ${que}. Puedes consultarlos en la web enlazada.</p>`;

let bGas = nada('carburantes');
if (gas) {
  const dif95 = (gas.cara95.g95 - gas.barata95.g95) * 50;
  bGas = `<p class="cifra"><strong>${num(gas.media95, 3)} €/l</strong> gasolina 95 · <strong>${num(gas.mediaGsa, 3)} €/l</strong> diésel</p>
<p>Precio medio de hoy en ${gas.estaciones.toLocaleString('es-ES')} gasolineras. En la Península y Baleares, la gasolina 95 más barata de media está en <a href="${RB}/provincia/${gas.barata95.slug}">${esc(gas.barata95.nombre)}</a> (${num(gas.barata95.g95, 3)} €/l) y la más cara, en <a href="${RB}/provincia/${gas.cara95.slug}">${esc(gas.cara95.nombre)}</a> (${num(gas.cara95.g95, 3)} €/l): <strong>${num(dif95)} € más por llenar un depósito de 50 litros</strong>. En diésel, la más barata es ${esc(gas.barataGsa.nombre)} (${num(gas.barataGsa.gsa, 3)} €/l) y la más cara, ${esc(gas.caraGsa.nombre)} (${num(gas.caraGsa.gsa, 3)} €/l).</p>
<p>Entre gasolineras la diferencia es todavía mayor: la gasolina 95 más barata de la Península y Baleares cuesta hoy ${num(gas.min95.g95, 3)} €/l (${esc(titulo(gas.min95.n))}, ${esc(titulo(gas.min95.m))}) y la más cara, ${num(gas.max95.g95, 3)} €/l. Por eso compensa mirar antes de repostar.${gas.canarias95 ? ` Canarias, Ceuta y Melilla tienen otros impuestos y quedan fuera de la comparación (en Canarias la media es de ${num(gas.canarias95, 3)} €/l).` : ''}</p>
<p class="fuente">Fuente: Ministerio para la Transición Ecológica, datos del ${esc(new Date(gas.fecha).toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'long', timeStyle: 'short' }))}. Media simple de las gasolineras que venden cada combustible.</p>`;
}

let bLuz = nada('la luz');
if (pvpc) {
  const cambio = pvpc.ayer ? ((pvpc.media - pvpc.ayer) / pvpc.ayer) * 100 : null;
  const veces = pvpc.cara.p / pvpc.barata.p;
  bLuz = `<p class="cifra"><strong>${num(pvpc.media, 4)} €/kWh</strong> de media hoy (PVPC)</p>
<p>${cambio === null ? '' : `Es un ${num(Math.abs(cambio), 1)} % ${cambio >= 0 ? 'más' : 'menos'} que ayer. `}La hora más barata es la de ${hora(pvpc.barata.h)} (${num(pvpc.barata.p, 4)} €/kWh) y la más cara, la de ${hora(pvpc.cara.h)} (${num(pvpc.cara.p, 4)} €/kWh)${veces < 50 ? `: ${num(veces, 1)} veces más` : ''}. Poner la lavadora o el lavavajillas en las horas baratas es la forma más sencilla de bajar la factura si tienes la tarifa regulada.</p>
<p><a href="https://ahorroluz.iaencrudo.es/precio-luz-hoy">Precio de la luz hora a hora</a>${pvpc.manana ? ` · <a href="https://ahorroluz.iaencrudo.es/precio-luz-manana">ya está el de mañana</a>` : ''}</p>
<p class="fuente">Fuente: Red Eléctrica (REE), término de energía del PVPC con peajes y cargos, sin impuestos.</p>`;
}

let bFest = nada('festivos');
if (fest) {
  const items = fest.prox.map((f) => `<li><strong>${esc(fechaLarga(f.fecha))}</strong>: ${esc(f.nombre)}, festivo en ${f.n === fest.total ? 'toda España' : `${f.n} de ${fest.total} territorios`}</li>`).join('\n');
  const parcial = fest.prox.find((f) => f.n < fest.total);
  bFest = `<ul class="lista">${items}</ul>
${parcial ? `<p>Que un festivo lo sea en tu comunidad depende del BOE de cada año: el ${esc(fechaLarga(parcial.fecha))} solo es fiesta en ${parcial.n} de los ${fest.total} territorios (17 comunidades, Ceuta y Melilla). Además, cada ayuntamiento tiene dos fiestas locales.</p>` : ''}
<p><a href="https://vacacionable.iaencrudo.es/es-festivo-manana">¿Mañana es festivo?</a> · <a href="https://vacacionable.iaencrudo.es/calendario-laboral-2027">Calendario laboral 2027</a></p>
<p class="fuente">Fuente: resolución anual de fiestas laborales del BOE.</p>`;
}

const diasElec = Math.round((Date.parse(`${ELECCIONES}T00:00:00Z`) - Date.parse(`${HOY}T00:00:00Z`)) / 86_400_000);
const bElec = diasElec > 0
  ? `<p class="cifra"><strong>${diasElec === 1 ? 'Mañana' : `Faltan ${diasElec} días`}</strong> para las elecciones generales del 29 de noviembre</p>
<p>No todos los votos pesan lo mismo: en Teruel sale un diputado por cada 35.451 electores y en Madrid, uno por cada 137.488. Un voto en Teruel pesa 3,9 veces más que uno en Madrid, porque la ley electoral da a cada provincia un mínimo de 2 diputados (1 a Ceuta y Melilla) y reparte el resto según la población.</p>
<p><a href="https://elecciones.iaencrudo.es/cuanto-vale-tu-voto">Cuánto vale tu voto en tu provincia</a> · <a href="https://elecciones.iaencrudo.es/test-politico">Test político</a> · <a href="https://elecciones.iaencrudo.es/">Candidatos de tu provincia</a></p>
<p class="fuente">Fuente: censo electoral de 2023 (Ministerio del Interior) y escaños del Real Decreto 806/2026.</p>`
  : `<p class="cifra"><strong>Elecciones generales del 29 de noviembre</strong></p>
<p>Resultados por provincia, escaños y pactos posibles en Elecciones al Día.</p>
<p><a href="https://elecciones.iaencrudo.es/resultados-29n">Resultados del 29-N</a> · <a href="https://elecciones.iaencrudo.es/cuanto-vale-tu-voto">Cuánto vale tu voto</a></p>`;

const actualizado = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'full', timeStyle: 'short' });
const html = readFileSync(new URL('scripts/plantilla.txt', RAIZ), 'utf8')
  .replace('{{FECHA}}', esc(actualizado))
  .replace('{{FECHA_ISO}}', HOY)
  .replace('{{GASOLINA}}', bGas)
  .replace('{{LUZ}}', bLuz)
  .replace('{{FESTIVOS}}', bFest)
  .replace('{{ELECCIONES}}', bElec);
if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error('Quedan marcadores sin rellenar en la plantilla');
writeFileSync(new URL('index.html', RAIZ), html);
console.log(`[generar] index.html: gasolina ${gas ? 'ok' : 'SIN DATOS'}, luz ${pvpc ? 'ok' : 'SIN DATOS'}, festivos ${fest ? 'ok' : 'SIN DATOS'}.`);
