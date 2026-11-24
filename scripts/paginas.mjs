// Ruta: scripts/paginas.mjs
// Genera las páginas fijas de iaencrudo.es (sobre mí, metodología, contacto, legales y 404),
// el sitemap.xml y el robots.txt. Se lanza a mano tras cambiar un texto: node scripts/paginas.mjs
// La portada (index.html) la genera scripts/generar.mjs con los datos del día.
import { writeFileSync } from 'node:fs';
import { pagina, faqHtml, faqLd, EMAIL, YOUTUBE, TITULAR, URL_BASE, BARRA, PIE, SCRIPTS, ESTILOS, ESTILOS_EXTRA } from './comun.mjs';

const RAIZ = new URL('..', import.meta.url);
const escribir = (archivo, html) => writeFileSync(new URL(archivo, RAIZ), html);

const ACTUALIZADO_LEGAL = '18 de noviembre de 2026';
const mail = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;
const ext = (url, texto) => `<a href="${url}" rel="noopener" target="_blank">${texto}</a>`;

const WEBS = [
  ['RepostaBarato', 'https://repostabarato.iaencrudo.es/', 'precios de la gasolina y el diésel en cada gasolinera de España'],
  ['AhorroLuz', 'https://ahorroluz.iaencrudo.es/', 'precio de la luz por horas y calculadoras de la factura de luz y gas'],
  ['ViviendaClara', 'https://viviendaclara.iaencrudo.es/', 'qué vivienda te puedes permitir y cuánto cuesta por provincia'],
  ['CapitalPráctico', 'https://capitalpractico.iaencrudo.es/', 'calculadoras de sueldo neto, hipoteca, ahorro e inversión'],
  ['Vacacionable', 'https://vacacionable.iaencrudo.es/', 'festivos, puentes y calendario laboral de cada comunidad'],
  ['ViajaChollo', 'https://viajachollo.iaencrudo.es/', 'vuelos y alojamiento baratos y presupuesto de viaje'],
  ['Elecciones al Día', 'https://elecciones.iaencrudo.es/', 'candidatos, propuestas y herramientas para las elecciones del 29-N'],
];
const listaWebs = `<ul>${WEBS.map(([n, u, d]) => `<li><a href="${u}">${n}</a>: ${d}.</li>`).join('')}</ul>`;

// ---------------------------------------------------------------- Sobre mí
const preguntasSobreMi = [
  { q: '¿Las webs son gratis?', a: 'Sí. Ninguna pide registro ni cobra por usar sus herramientas. Se financian con publicidad de Google AdSense y, en ViajaChollo y en algunas páginas de RepostaBarato, con enlaces de afiliado señalados como tales.' },
  { q: '¿Escribe una IA los textos?', a: 'Los redacto con ayuda de inteligencia artificial y los reviso antes de publicarlos. Las cifras no las genera ninguna IA: salen de fuentes oficiales y cada web explica cómo las calcula.' },
  { q: '¿Puedo usar los datos en un artículo?', a: `Sí, citando la fuente y enlazando a la página de la que salen. Si necesitas datos actualizados de un municipio o una provincia, escríbeme a ${mail}.` },
];
escribir('sobre-mi.html', pagina({
  ruta: '/sobre-mi',
  titulo: 'Sobre mí: quién hace las webs de IA en Crudo',
  h1: 'Sobre mí',
  descripcion: 'Soy Aarón Gómez Vera, ingeniero informático y desarrollador full-stack. Hago webs gratuitas con datos oficiales y ayuda de IA, y lo cuento en vídeo.',
  ogDescripcion: 'Quién está detrás de IA en Crudo y de sus siete webs gratuitas con datos oficiales.',
  tipo: 'AboutPage',
  actualizado: ACTUALIZADO_LEGAL,
  ld: [faqLd(preguntasSobreMi)],
  cuerpo: `<p>Soy <strong>${TITULAR}</strong>, ingeniero informático y desarrollador full-stack en España. IA en Crudo es mi proyecto personal: construyo webs que resuelven dudas concretas de dinero y del día a día, con datos oficiales, y cuento en vídeo cómo las hago y cuánto dinero dan, desde cero.</p>

<h2>Qué hago</h2>
<p>Cada web responde a una pregunta que mucha gente se hace a menudo: dónde repostar más barato hoy, a qué hora sale más barata la luz, qué piso puedo pagar, cuánto me queda de sueldo neto, si mañana es festivo o a quién votar en mi provincia. La respuesta tiene que estar en la primera pantalla y con su fuente al lado.</p>
${listaWebs}

<h2>Cómo trabajo</h2>
<p>Programo las webs con ayuda de <strong>Claude Code</strong>, una herramienta de inteligencia artificial que escribe código. Yo decido qué se hace, reviso lo que propone y compruebo los datos antes de publicar. Los errores también se cuentan: en el canal enseño lo que la IA hace mal y cómo lo arreglo.</p>
<p>Los datos salen de organismos públicos (el Ministerio para la Transición Ecológica, Red Eléctrica, el BOE, el INE, el Ministerio del Interior y otros) y se actualizan solos con la frecuencia de cada fuente. En <a href="/como-hacemos-este-contenido">cómo hacemos este contenido</a> está, web a web, de dónde sale cada cifra y qué límites tiene.</p>

<h2>Principios</h2>
<ul>
<li><strong>No inventamos datos.</strong> Si una cifra no tiene fuente, no se publica.</li>
<li><strong>Gratis y sin registro.</strong> No pedimos tu correo para usar ninguna herramienta.</li>
<li><strong>Tus datos se quedan en tu navegador.</strong> Las calculadoras hacen las cuentas en tu dispositivo y no envían lo que escribes.</li>
<li><strong>La publicidad va aparte.</strong> Los anuncios se identifican como tales y no cambian el orden ni el contenido de los resultados.</li>
</ul>

<h2>Han hablado de nosotros</h2>
<p><strong>Diario de Jerez</strong> publicó el 5 de noviembre de 2026 ${ext('https://www.diariodejerez.es/jerez/jerez-deposito-diferencia-euros-gasolinera_0_2008421592.html', '«Llenar el depósito en Jerez: hasta 22 euros de diferencia según la gasolinera»')}, con los datos de RepostaBarato.</p>

<h2>El canal</h2>
<p>En el canal de YouTube ${ext(YOUTUBE, 'IA en Crudo')} enseño cómo construyo cada web con IA, los errores incluidos, y las cifras reales de visitas e ingresos.</p>

${faqHtml(preguntasSobreMi)}

<p>¿Has visto un error o quieres proponer algo? Escríbeme desde la página de <a href="/contacto">contacto</a>.</p>`,
}));

// ---------------------------------------------------------------- Cómo hacemos este contenido
escribir('como-hacemos-este-contenido.html', pagina({
  ruta: '/como-hacemos-este-contenido',
  titulo: 'Cómo hacemos este contenido: fuentes y metodología',
  h1: 'Cómo hacemos este contenido',
  descripcion: 'De dónde salen los datos de las siete webs de IA en Crudo, cómo se calculan, cada cuánto se actualizan y qué límites tienen.',
  ogDescripcion: 'Fuentes oficiales, cálculos y límites de cada web de IA en Crudo.',
  actualizado: ACTUALIZADO_LEGAL,
  cuerpo: `<p>Todas las webs de IA en Crudo siguen el mismo método: tomar datos públicos y oficiales, hacer con ellos una cuenta que a la gente le sirva y explicar al lado de cada cifra de dónde sale. Esta página resume ese método. Cada web tiene además su propia metodología, más detallada.</p>

<h2>El proceso</h2>
<ol>
<li><strong>Una pregunta real.</strong> Partimos de lo que la gente busca de verdad, por ejemplo «gasolinera más barata en Jerez» o «¿mañana es festivo?», y de lo que nos preguntan en los comentarios de los vídeos.</li>
<li><strong>Una fuente oficial.</strong> Buscamos el organismo que publica ese dato. Si no hay fuente oficial, buscamos la más fiable que esté publicada y lo decimos.</li>
<li><strong>Un cálculo explicado.</strong> Las fórmulas están escritas en cada página: medias, diferencias, plazos o repartos.</li>
<li><strong>Actualización automática.</strong> Las webs se reconstruyen solas con GitHub Actions: cada hora, cada día o cuando cambia la norma, según la fuente.</li>
<li><strong>Revisión humana.</strong> Programo con ayuda de inteligencia artificial y reviso los textos y los datos antes de publicar. Si encontramos un error, lo corregimos y cambiamos la fecha de revisión.</li>
</ol>

<h2>Fuentes de cada web</h2>
<h3>RepostaBarato (carburantes)</h3>
<p>Precios de todas las gasolineras de España desde la ${ext('https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/', 'API de precios de carburantes')} del Ministerio para la Transición Ecológica y el Reto Demográfico, la misma que usa el ${ext('https://geoportalgasolineras.es', 'Geoportal de gasolineras')}. Las gasolineras están obligadas a comunicar sus precios, y las páginas se regeneran cada hora. Límite: el precio válido es el del surtidor, y la distancia se mide en línea recta.</p>
<h3>AhorroLuz (luz y gas)</h3>
<p>Precio voluntario para el pequeño consumidor (PVPC) por horas de ${ext('https://www.esios.ree.es/es/pvpc', 'Red Eléctrica (e·sios)')}, y ofertas del mercado libre del ${ext('https://comparador.cnmc.gob.es/', 'comparador de la CNMC')}. Requisitos del ${ext('https://www.miteco.gob.es/es/energia/energia-electrica/bono-social/requisitos.html', 'bono social')} y normativa de autoconsumo (${ext('https://www.boe.es/eli/es/rd/2019/04/05/244', 'Real Decreto 244/2019')}). Límite: los precios del PVPC no incluyen impuestos salvo que se indique.</p>
<h3>ViviendaClara (vivienda)</h3>
<p>Valor tasado de la vivienda del ${ext('https://apps.fomento.gob.es/BoletinOnline2/?nivel=2&orden=35000000', 'Ministerio de Vivienda')}, ${ext('https://www.ine.es/dynt3/inebase/index.htm?padre=12385', 'estadísticas del INE')}, el ${ext('https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi', 'índice de alquiler SERPAVI')} y la ${ext('https://www.boe.es/buscar/act.php?id=BOE-A-1994-26003', 'Ley de Arrendamientos Urbanos')}. Límite: el valor tasado es una media por provincia o municipio, no el precio de una vivienda concreta.</p>
<h3>CapitalPráctico (finanzas personales)</h3>
<p>Tramos y deducciones de la ${ext('https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764', 'Ley del IRPF')} y de la ${ext('https://sede.agenciatributaria.gob.es', 'Agencia Tributaria')}, bases y tipos de cotización de la ${ext('https://www.seg-social.es', 'Seguridad Social')} y guías del ${ext('https://clientebancario.bde.es', 'Portal del Cliente Bancario del Banco de España')}. Límite: las calculadoras dan una estimación, no sustituyen a un asesor ni a la declaración oficial.</p>
<h3>Vacacionable (festivos)</h3>
<p>Resoluciones anuales de fiestas laborales del BOE (${ext('https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-21667', '2026')} y ${ext('https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-21254', '2027')}), los boletines autonómicos y provinciales para las fiestas locales y el ${ext('https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430', 'Estatuto de los Trabajadores')} para las vacaciones. Límite: las fiestas locales solo salen en los municipios que ya las tienen publicadas.</p>
<h3>ViajaChollo (viajes)</h3>
<p>Precios de vuelos y alojamiento de los buscadores con los que trabajamos mediante Travelpayouts, que se muestran tal como los dan. Los enlaces son de afiliado y están señalados: si reservas desde ellos, la web puede recibir una comisión sin que pagues más. Límite: los precios cambian a cada momento y el que vale es el de la web donde reservas.</p>
<h3>Elecciones al Día (elecciones del 29-N)</h3>
<p>Candidaturas proclamadas en el ${ext('https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-23103', 'BOE del 3 de noviembre de 2026')}, escaños por provincia del ${ext('https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20742', 'Real Decreto 806/2026')}, resultados y censo de 2023 del Ministerio del Interior y propuestas de cada partido con su fuente (programa, nota oficial o entrevista). Límite: no hacemos encuestas ni recomendamos voto.</p>

<h2>Lo que no hacemos</h2>
<ul>
<li>No publicamos opiniones de usuarios, testimonios ni valoraciones inventadas.</li>
<li>No cobramos a gasolineras, comercializadoras, inmobiliarias ni partidos por aparecer o por salir antes.</li>
<li>No guardamos lo que escribes en las calculadoras: las cuentas se hacen en tu navegador.</li>
</ul>

<h2>Correcciones</h2>
<p>Si ves un dato que no cuadra, escríbenos a ${mail} con el enlace de la página y, si puedes, la fuente correcta. Lo revisamos y, si hay error, lo corregimos y actualizamos la fecha de revisión. Puedes ver quién hace las webs en <a href="/sobre-mi">sobre mí</a>.</p>`,
}));

// ---------------------------------------------------------------- Contacto
escribir('contacto.html', pagina({
  ruta: '/contacto',
  titulo: 'Contacto de IA en Crudo',
  h1: 'Contacto',
  descripcion: 'Escríbenos para avisar de un error en los datos, pedir datos para un artículo o proponer una herramienta: contacto@iaencrudo.es.',
  ogDescripcion: 'Cómo contactar con IA en Crudo: errores, prensa y propuestas.',
  tipo: 'ContactPage',
  cuerpo: `<p>La forma de contactar es el correo <strong>${mail}</strong>. Lo leo yo, ${TITULAR}, y contesto en cuanto puedo. No hay formulario: así tu mensaje no pasa por ningún servicio externo.</p>

<h2>Para qué puedes escribir</h2>
<ul>
<li><strong>Un error en los datos.</strong> Mándanos el enlace de la página, qué dato está mal y, si la tienes, la fuente correcta. Las correcciones se aplican y se cambia la fecha de revisión de la página.</li>
<li><strong>Prensa.</strong> Si eres periodista, puedes usar los datos citando la fuente. Te mandamos las cifras al día de tu municipio o tu provincia: gasolina, festivos, vivienda o elecciones.</li>
<li><strong>Una propuesta.</strong> ¿Echas en falta una calculadora, una ciudad o un dato? Muchas de las páginas actuales salieron de preguntas de quien nos lee o nos ve en vídeo.</li>
<li><strong>Tus datos personales.</strong> Para ejercer tus derechos de protección de datos, escribe indicando cuál quieres ejercer. Los detalles están en la <a href="/politica-privacidad">política de privacidad</a>.</li>
</ul>

<h2>Lo que no hacemos</h2>
<p>No vendemos enlaces ni artículos patrocinados, y no cobramos por aparecer en los listados. Tampoco damos asesoramiento financiero, fiscal ni legal personalizado: las herramientas dan estimaciones con datos oficiales.</p>

<h2>Otras formas de seguirnos</h2>
<p>El proceso de cada web se cuenta en el canal de YouTube, y también publicamos vídeos cortos en TikTok e Instagram. Los enlaces están al pie de la página.</p>`,
}));

// ---------------------------------------------------------------- Aviso legal
escribir('aviso-legal.html', pagina({
  ruta: '/aviso-legal',
  titulo: 'Aviso legal | IA en Crudo',
  h1: 'Aviso legal',
  descripcion: 'Aviso legal de iaencrudo.es conforme a la LSSI-CE: titular, condiciones de uso, propiedad intelectual, publicidad y responsabilidad.',
  ogDescripcion: 'Titular, condiciones de uso y responsabilidad de iaencrudo.es.',
  actualizado: ACTUALIZADO_LEGAL,
  cuerpo: `<h2>1. Datos identificativos del titular</h2>
<p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (<strong>LSSI-CE</strong>), se informa de los datos del titular de este sitio web:</p>
<ul>
<li><strong>Titular:</strong> ${TITULAR}</li>
<li><strong>Correo electrónico:</strong> ${mail}</li>
<li><strong>Sitio web:</strong> ${URL_BASE} (en adelante, «el sitio» o «IA en Crudo»)</li>
</ul>
<p>Este aviso se aplica a ${URL_BASE}. Cada una de las webs de IA en Crudo en los subdominios de iaencrudo.es tiene su propio aviso legal, con el mismo titular.</p>

<h2>2. Objeto y aceptación</h2>
<p>IA en Crudo es un sitio web informativo y gratuito que resume cada día datos públicos (precios medios de los carburantes, precio de la luz y próximos festivos) y presenta las webs del proyecto. El acceso y la navegación por el sitio atribuyen la condición de usuario e implican la aceptación de este aviso legal, de la <a href="/politica-privacidad">política de privacidad</a> y de la <a href="/politica-cookies">política de cookies</a> vigentes en cada momento.</p>

<h2>3. Condiciones de uso</h2>
<p>El usuario se compromete a utilizar el sitio de conformidad con la ley, la buena fe y el orden público, y en particular a no:</p>
<ul>
<li>Utilizar el sitio o sus contenidos con fines ilícitos o lesivos para terceros.</li>
<li>Dañar, sobrecargar o impedir el normal funcionamiento del sitio, ni introducir virus o código malicioso.</li>
<li>Extraer contenidos de forma masiva o automatizada, salvo la indexación por buscadores.</li>
<li>Hacer clic de forma artificial en los anuncios o generar impresiones fraudulentas.</li>
</ul>

<h2>4. Exención de responsabilidad sobre los datos</h2>
<p>Los datos que se muestran proceden de organismos públicos (Ministerio para la Transición Ecológica y el Reto Demográfico, Red Eléctrica, Boletín Oficial del Estado y otros) y tienen carácter <strong>exclusivamente informativo</strong>. Pueden contener errores o retrasos de la fuente original. En la medida permitida por la ley, el titular no será responsable de los daños derivados de errores, retrasos u omisiones en los datos publicados por terceros, ni de decisiones tomadas a partir de ellos. Las calculadoras ofrecen estimaciones y no constituyen asesoramiento financiero, fiscal ni legal.</p>

<h2>5. Responsabilidad sobre el sitio y los enlaces</h2>
<p>El titular procura que el sitio esté disponible y libre de errores, pero no garantiza la ausencia de interrupciones, fallos técnicos o elementos dañinos ajenos a su control, y podrá modificar, suspender o retirar contenidos sin previo aviso.</p>
<p>El sitio incluye enlaces a webs de terceros, como organismos oficiales, con fines informativos. Conforme al artículo 17 de la LSSI-CE, el titular no responde de sus contenidos salvo que tenga conocimiento efectivo de su ilicitud y no actúe con diligencia para suprimir el enlace. Si detectas un enlace a un contenido ilícito, comunícanoslo en ${mail}.</p>

<h2>6. Propiedad intelectual e industrial</h2>
<p>Los textos, diseños, gráficos, código fuente, la marca IA en Crudo y demás elementos del sitio son titularidad del titular o se utilizan con la debida autorización, y están protegidos por el Real Decreto Legislativo 1/1996, de 12 de abril, por el que se aprueba el texto refundido de la Ley de Propiedad Intelectual, y por la normativa de propiedad industrial.</p>
<p>Queda prohibida la reproducción, distribución, comunicación pública o transformación, total o parcial, de los contenidos con fines comerciales sin autorización previa y por escrito. Se permite citar fragmentos breves con fines informativos o educativos, indicando la fuente y enlazando a la página original. Los textos normativos y los datos de organismos públicos que se citan no están sujetos a propiedad intelectual (art. 13 de la Ley de Propiedad Intelectual) y pertenecen a sus fuentes.</p>

<h2>7. Publicidad</h2>
<p>El sitio se financia mediante anuncios servidos por Google AdSense, identificados como publicidad. El contenido de los anuncios es responsabilidad de los anunciantes y su presencia no implica recomendación por parte del titular. El contenido editorial es independiente de la publicidad.</p>

<h2>8. Protección de datos y cookies</h2>
<p>El tratamiento de datos personales se rige por la <a href="/politica-privacidad">política de privacidad</a>, y el uso de cookies por la <a href="/politica-cookies">política de cookies</a>.</p>

<h2>9. Legislación aplicable y jurisdicción</h2>
<p>Este aviso legal se rige por la legislación española. Para la resolución de cualquier controversia, las partes se someterán a los juzgados y tribunales que correspondan conforme a la normativa aplicable. Si el usuario tiene la condición de consumidor, serán competentes los juzgados de su domicilio.</p>`,
}));

// ---------------------------------------------------------------- Privacidad
escribir('politica-privacidad.html', pagina({
  ruta: '/politica-privacidad',
  titulo: 'Política de privacidad | IA en Crudo',
  h1: 'Política de privacidad',
  descripcion: 'Política de privacidad de iaencrudo.es según el RGPD y la LOPDGDD: responsable, datos tratados, Google AdSense, GoatCounter y tus derechos.',
  ogDescripcion: 'Cómo trata iaencrudo.es tus datos y cómo ejercer tus derechos.',
  actualizado: ACTUALIZADO_LEGAL,
  cuerpo: `<p>Esta política describe cómo se tratan los datos personales de las personas que visitan ${URL_BASE}, de acuerdo con el Reglamento (UE) 2016/679 General de Protección de Datos (<strong>RGPD</strong>) y la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (<strong>LOPDGDD</strong>).</p>

<h2>1. Responsable del tratamiento</h2>
<ul>
<li><strong>Identidad:</strong> ${TITULAR}</li>
<li><strong>Correo electrónico:</strong> ${mail}</li>
<li><strong>Sitio web:</strong> ${URL_BASE}</li>
</ul>
<p>Por el volumen y la naturaleza de los datos tratados, el responsable no está obligado a designar un Delegado de Protección de Datos.</p>

<h2>2. Principios que aplicamos</h2>
<p>Tratamos los datos de forma lícita, leal y transparente; solo para fines determinados y legítimos; limitándonos a los datos necesarios; manteniéndolos exactos; conservándolos el tiempo imprescindible y con medidas de seguridad adecuadas (art. 5 RGPD).</p>

<h2>3. Qué datos tratamos, para qué y con qué base legal</h2>
<h3>3.1. Correo electrónico</h3>
<ul>
<li><strong>Datos:</strong> tu dirección de correo, tu nombre si lo indicas y el contenido de tu mensaje.</li>
<li><strong>Finalidad:</strong> responder a tu consulta, atender correcciones y gestionar el ejercicio de tus derechos.</li>
<li><strong>Base legal:</strong> tu consentimiento al escribirnos (art. 6.1.a RGPD).</li>
</ul>
<h3>3.2. Publicidad</h3>
<p>Mostramos anuncios de Google AdSense. Google puede tratar datos de navegación, identificadores de cookies o del dispositivo y la dirección IP para servir, medir y, si lo consientes, personalizar los anuncios. <strong>Base legal:</strong> tu consentimiento, recogido mediante la plataforma de gestión del consentimiento (CMP) certificada de Google (art. 6.1.a RGPD y art. 22.2 LSSI-CE).</p>
<h3>3.3. Recuento de visitas: GoatCounter</h3>
<p>Contamos las visitas con GoatCounter, una herramienta de código abierto que no usa cookies ni guarda datos personales: registra la página vista, la web de la que vienes, el navegador, el tamaño de pantalla y el país aproximado, sin identificarte. La IP no se almacena. <strong>Base legal:</strong> interés legítimo en saber qué contenidos se leen para mejorarlos (art. 6.1.f RGPD).</p>
<h3>3.4. Registros técnicos</h3>
<p>El proveedor de alojamiento (GitHub Pages) puede registrar datos técnicos de cada visita, como la dirección IP, la fecha y la página solicitada, para garantizar el funcionamiento y la seguridad del sitio. <strong>Base legal:</strong> interés legítimo (art. 6.1.f RGPD).</p>
<h3>3.5. Lo que no hacemos</h3>
<p>No pedimos registro, no vendemos datos personales, no elaboramos perfiles propios y no tomamos decisiones automatizadas con efectos jurídicos sobre ti.</p>

<h2>4. Google AdSense y cookies de terceros</h2>
<p>Este sitio utiliza Google AdSense, prestado en el Espacio Económico Europeo por <strong>Google Ireland Limited</strong> (Gordon House, Barrow Street, Dublín 4, Irlanda), con la participación de Google LLC.</p>
<ul>
<li>Los proveedores externos, incluido Google, utilizan cookies para mostrar anuncios basados en las visitas anteriores del usuario a este sitio web o a otros sitios web.</li>
<li>Las cookies de publicidad de Google, entre ellas la cookie de DoubleClick, permiten a Google y a sus socios mostrar anuncios en función de las visitas a este y otros sitios de Internet.</li>
<li>Otros proveedores o redes publicitarias certificados por Google pueden utilizar cookies para servir anuncios en este sitio. La lista aparece en el mensaje de consentimiento.</li>
<li>Si no das tu consentimiento para anuncios personalizados, Google puede mostrar anuncios no personalizados o limitados.</li>
</ul>
<p>Más información: ${ext('https://policies.google.com/technologies/partner-sites?hl=es', 'cómo utiliza Google la información de los sitios que usan sus servicios')}, ${ext('https://policies.google.com/technologies/ads?hl=es', 'cómo utiliza Google las cookies en la publicidad')} y la ${ext('https://policies.google.com/privacy?hl=es', 'política de privacidad de Google')}. La lista de cookies está en la <a href="/politica-cookies">política de cookies</a>.</p>

<h2>5. Cómo gestionar la personalización de anuncios</h2>
<ul>
<li><strong>En este sitio:</strong> en tu primera visita desde el EEE, el Reino Unido o Suiza verás el mensaje de consentimiento de Google, donde puedes aceptar, rechazar o elegir finalidades y proveedores.</li>
<li><strong>En tu cuenta de Google:</strong> en ${ext('https://myadcenter.google.com/?hl=es', 'Mi Centro de Anuncios')}.</li>
<li><strong>Otros proveedores:</strong> en ${ext('https://www.youronlinechoices.com/es/', 'Your Online Choices')}.</li>
<li><strong>En tu navegador:</strong> bloqueando o eliminando las cookies de terceros.</li>
</ul>

<h2>6. Destinatarios</h2>
<p>No cedemos datos personales a terceros salvo obligación legal. Pueden acceder a datos Google Ireland Limited y Google LLC (como responsables independientes de la publicidad), GitHub (alojamiento), el proveedor de correo del responsable y, cuando exista obligación legal, las administraciones públicas, jueces y tribunales.</p>

<h2>7. Transferencias internacionales</h2>
<p>Algunos proveedores, como Google LLC o GitHub, pueden tratar datos en Estados Unidos. Ambos están adheridos al Marco de Privacidad de Datos UE-EE. UU., con decisión de adecuación de la Comisión Europea de julio de 2023, y usan cláusulas contractuales tipo (art. 46 RGPD).</p>

<h2>8. Plazos de conservación</h2>
<ul>
<li><strong>Mensajes de contacto:</strong> el tiempo necesario para responder y, después, hasta 12 meses, salvo que haya que conservarlos para atender responsabilidades legales.</li>
<li><strong>Solicitudes de derechos:</strong> durante los plazos de prescripción (con carácter general, 3 años).</li>
<li><strong>Cookies:</strong> según la duración indicada en la política de cookies.</li>
</ul>

<h2>9. Tus derechos</h2>
<p>Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad, y retirar tu consentimiento (arts. 15 a 22 RGPD), escribiendo a ${mail}. Responderemos en el plazo de un mes, prorrogable en los casos previstos en el RGPD. Si consideras que no hemos atendido bien tu solicitud, puedes reclamar ante la ${ext('https://www.aepd.es', 'Agencia Española de Protección de Datos')}.</p>

<h2>10. Seguridad y menores</h2>
<p>Todo el sitio funciona con conexión cifrada (HTTPS). No está dirigido a menores de 14 años y no recogemos conscientemente sus datos (art. 7 LOPDGDD).</p>

<h2>11. Cambios en esta política</h2>
<p>Podemos actualizar esta política por cambios legales, técnicos o en los servicios que usamos. La versión vigente es la publicada en esta página, con su fecha de actualización.</p>`,
}));

// ---------------------------------------------------------------- Cookies
const tabla = (filas) => `<div class="tabla"><table><thead><tr><th>Cookie</th><th>Titular</th><th>Finalidad</th><th>Duración</th></tr></thead><tbody>${filas.map((f) => `<tr>${f.map((c, i) => `<td>${i === 0 ? `<code>${c}</code>` : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
escribir('politica-cookies.html', pagina({
  ruta: '/politica-cookies',
  titulo: 'Política de cookies | IA en Crudo',
  h1: 'Política de cookies',
  descripcion: 'Qué cookies usa iaencrudo.es: las del mensaje de consentimiento y las publicitarias de Google AdSense, y cómo retirar tu consentimiento.',
  ogDescripcion: 'Cookies de iaencrudo.es y cómo controlarlas.',
  actualizado: ACTUALIZADO_LEGAL,
  cuerpo: `<p>Esta política se ha elaborado conforme al artículo 22.2 de la LSSI-CE, el RGPD y la ${ext('https://www.aepd.es/guias/guia-cookies.pdf', 'Guía sobre el uso de las cookies de la AEPD')}.</p>

<h2>1. Qué son las cookies</h2>
<p>Las cookies son pequeños archivos que un sitio web guarda en tu navegador para recordar información sobre tu visita. Esta política también se aplica a tecnologías similares, como el almacenamiento local del navegador o los identificadores de dispositivo.</p>

<h2>2. Cookies técnicas</h2>
<p>IA en Crudo no instala cookies propias. La única cookie técnica es la que usa la plataforma de gestión del consentimiento (CMP) de Google para recordar tu elección, y está exenta de consentimiento:</p>
${tabla([['FCCDCF', 'Google (CMP)', 'Guardar tus preferencias de consentimiento', 'Hasta 13 meses'], ['FCNEC', 'Google (CMP)', 'Registrar el estado del mensaje de consentimiento', 'Hasta 1 año']])}

<h2>3. Medición de visitas</h2>
<p>Contamos las visitas con <strong>GoatCounter</strong>, que no instala cookies ni guarda datos personales, así que no necesita tu consentimiento. No usamos Google Analytics en este sitio.</p>

<h2>4. Cookies publicitarias: Google AdSense</h2>
<p>Con tu consentimiento, Google y sus socios publicitarios certificados pueden instalar cookies para mostrar anuncios, limitar cuántas veces ves el mismo, medir su rendimiento, prevenir el fraude y personalizarlos. Entre ellas:</p>
${tabla([['__gads', 'Google', 'Mostrar anuncios, limitar su frecuencia y medir su rendimiento', '13 meses'], ['__gpi', 'Google', 'Mostrar y medir anuncios en este sitio', '13 meses'], ['__eoi', 'Google', 'Seguridad y prevención del fraude publicitario', '6 meses'], ['IDE', 'Google (doubleclick.net)', 'Mostrar anuncios personalizados según tu navegación', '13 meses'], ['test_cookie', 'Google (doubleclick.net)', 'Comprobar si el navegador admite cookies', '15 minutos']])}
<p>Google cambia de vez en cuando los nombres y la duración de sus cookies. La relación oficial está en ${ext('https://policies.google.com/technologies/cookies?hl=es', 'cómo utiliza Google las cookies')}. Si rechazas las cookies publicitarias, puedes seguir usando el sitio con normalidad.</p>

<h2>5. Cómo das, cambias o retiras tu consentimiento</h2>
<p>Cuando visitas el sitio desde el Espacio Económico Europeo, el Reino Unido o Suiza, se muestra el mensaje de consentimiento de la CMP certificada de Google, integrada en el Marco de Transparencia y Consentimiento (TCF) de IAB Europe. Puedes aceptar todo, rechazar con la misma facilidad o elegir por finalidad y por proveedor. Para cambiar tu decisión, usa el enlace de privacidad que muestra ese mensaje o borra las cookies de este sitio: en tu siguiente visita volverá a aparecer.</p>

<h2>6. Configurar o eliminar cookies en tu navegador</h2>
<ul>
<li>${ext('https://support.google.com/chrome/answer/95647?hl=es', 'Google Chrome')}</li>
<li>${ext('https://support.mozilla.org/es/kb/Borrar%20cookies', 'Mozilla Firefox')}</li>
<li>${ext('https://support.apple.com/es-es/105082', 'Safari (iPhone y iPad)')}</li>
<li>${ext('https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09', 'Microsoft Edge')}</li>
</ul>

<h2>7. Actualizaciones y contacto</h2>
<p>Revisaremos esta política cuando cambien las cookies o la normativa. Para cualquier duda, escribe a ${mail}. El tratamiento de tus datos se explica en la <a href="/politica-privacidad">política de privacidad</a>.</p>`,
}));

// ---------------------------------------------------------------- 404 (sin indexar)
escribir('404.html', `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página no encontrada | IA en Crudo</title>
<meta name="robots" content="noindex, follow">
<link rel="icon" href="/logo-96.png" type="image/png">
${SCRIPTS}
${ESTILOS}
${ESTILOS_EXTRA}
</head>
<body>
<div class="wrap">
${BARRA}
<main>
<article class="doc">
<h1>Esta página no existe</h1>
<p>Puede que el enlace esté mal escrito o que la página se haya movido. Estas son las webs de IA en Crudo:</p>
${listaWebs}
<p>O vuelve a la <a href="/">portada</a>, con los precios de la gasolina, la luz y los festivos de hoy.</p>
</article>
</main>
${PIE}
</div>
</body>
</html>
`);

// ---------------------------------------------------------------- sitemap.xml y robots.txt
const RUTAS = ['/', '/sobre-mi', '/como-hacemos-este-contenido', '/contacto', '/aviso-legal', '/politica-privacidad', '/politica-cookies'];
escribir('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${RUTAS.map((r) => `<url><loc>${URL_BASE}${r}</loc></url>`).join('\n')}
</urlset>
`);
escribir('robots.txt', `User-agent: *
Allow: /

Sitemap: ${URL_BASE}/sitemap.xml
`);
console.log(`[paginas] ${RUTAS.length - 1} páginas, 404, sitemap.xml y robots.txt generados.`);
