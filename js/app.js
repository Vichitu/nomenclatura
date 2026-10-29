// Núcleo de la app: estado compartido, interfaz común y cambio de modo.
// Cada modo (js/modos/*.js) recibe `ctx` con las utilidades de aquí.
'use strict';

(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const COLORES = {
    cadena: 'var(--c-cadena)', suf: 'var(--c-suf)', acido: 'var(--c-suf)', insat: 'var(--c-insat)', ester: 'var(--c-ester)',
    sust: ['var(--c-s1)', 'var(--c-s2)', 'var(--c-s3)', 'var(--c-s4)', 'var(--c-s5)'],
  };
  const ETIQUETA_PARTE = {
    cadena: 'cadena principal', suf: 'grupo principal', acido: 'ácido', insat: 'insaturación', sust: 'sustituyente', ester: 'alquilo del éster',
  };
  const TIPOS_ERROR = {
    localizadores: 'Numeración / localizadores', orden: 'Orden alfabético', cadena: 'Cadena principal',
    grupo: 'Grupo principal (sufijo)', guiones: 'Guiones y formato', antiguo: 'Localizadores en formato antiguo',
    sustituyentes: 'Sustituyentes', estructura: 'Piezas de la estructura', isomero: 'Posición en la estructura (isómero)',
    isomeros: 'Isómeros', estereo: 'Estereoquímica (R/S, E/Z)', triviales: 'Nombres triviales', otro: 'Otros',
  };
  const MODOS_MAS = { triviales: 'Nombres triviales', cadena: 'Cadena principal', error: 'Encuentra el error', isomeros: 'Isómeros', estereo: 'Estereoquímica' };
  const ZONAS = ['editor', 'figura', 'respuesta', 'opciones', 'inicio', 'encontrados'];
  const BOTONES = { comprobar: '#btn-comprobar', pista: '#btn-pista', solucion: '#btn-solucion', siguiente: '#btn-siguiente' };

  let modo = null;
  let figuraS = 44; // escala del último dibujo de #figura, para traducir clics a coordenadas
  let nombreModo = null;
  const sesion = { racha: 0, ok: 0, total: 0 };
  const recientes = [];
  let niveles = new Set((Progreso.pref('niveles') || []).filter((n) => NIVELES.some((x) => x.id === n)));
  if (!niveles.size) NIVELES.forEach((n) => niveles.add(n.id));

  // Solución mostrada: partes del nombre ↔ átomos.
  const solucion = { partes: [], activa: null, fija: null, g: null };

  const ctx = {
    $, esc, est: {}, editor: null, TIPOS_ERROR,

    nuevo: () => {
      limpiar();
      modo.nuevo(ctx);
    },
    limpiar,
    zonas(lista) {
      ZONAS.forEach((z) => { $(`#z-${z}`).hidden = !lista.includes(z); });
      if (lista.includes('editor')) ctx.editor._ajustarVista();
    },
    // cfg: { comprobar: 'Texto' | false, … }. Lo que no se indica no cambia.
    botones(cfg) {
      Object.entries(cfg).forEach(([k, v]) => {
        const b = $(BOTONES[k]);
        b.hidden = v === false;
        b.disabled = false;
        if (typeof v === 'string') {
          const icono = b.querySelector('svg');
          b.textContent = v;
          if (icono) b.prepend(icono);
        }
      });
    },
    // tema e instrucción son texto; grande es HTML (ya escapado).
    enunciado(tema, instruccion = '', grande = '') {
      $('#enunciado').innerHTML = `<div class="enunciado-cab">
          ${tema ? `<span class="insignia">${esc(tema)}</span>` : ''}
          <span class="instruccion">${esc(instruccion)}</span></div>
        ${grande ? `<div class="nombre-grande">${grande}</div>` : ''}`;
    },
    feedback(html, tipo = '') {
      const f = $('#feedback');
      f.className = `feedback ${tipo}`;
      f.innerHTML = html;
    },
    pista: (texto) => $('#pistas').insertAdjacentHTML('beforeend', `<li>${texto}</li>`),
    respuesta(v) {
      const i = $('#respuesta');
      if (v === undefined) return i.value;
      i.value = v;
      if (window.matchMedia('(min-width: 760px)').matches) i.focus({ preventScroll: true });
      return v;
    },
    pintarFigura(g, o = {}) {
      figuraS = o.S || 44;
      Quimica.pintarEn($('#figura'), g, o);
    },
    figuraClicable: (si) => $('#figura').classList.toggle('clicable', !!si),
    explicacion(html) {
      const s = $('#explicacion');
      s.innerHTML = html;
      s.hidden = false;
      return s;
    },
    nivelNombre: (id) => NIVELES.find((n) => n.id === id)?.nombre || '',
    niveles: () => niveles,

    preparar(m) {
      if (!m._g) {
        m._g = Quimica.grafoDeSmiles(m.s);
        m._can = Quimica.canonico(Quimica.quitarMapas(m.s));
      }
      return m;
    },
    // Copia girada/reflejada al azar para que la orientación no dé pistas.
    // Sin reflejo cuando el dibujo tiene cuñas (cambiaría la configuración).
    orientar(g, { reflejar = true } = {}) {
      const c = Quimica.copiar(g);
      const giro = Math.random() < 0.5;
      const fx = reflejar ? (Math.random() < 0.5 ? -1 : 1) : (giro ? -1 : 1);
      const fy = reflejar ? (Math.random() < 0.3 ? -1 : 1) : (giro ? -1 : 1);
      c.atoms.forEach((a) => { a.x *= fx; a.y *= fy; });
      return Quimica.aOrigen(c);
    },
    elegirMolecula(clave) {
      const pool = MOLECULAS.filter((m) => niveles.has(m.nv));
      const m = Progreso.elegir(pool, clave, new Set(recientes.slice(-Math.min(8, pool.length - 1))));
      recientes.push(clave(m));
      return ctx.preparar(m);
    },
    elegir(items, clave) {
      const it = Progreso.elegir(items, clave, new Set(recientes.slice(-Math.min(4, items.length - 1))));
      recientes.push(clave(it));
      return it;
    },
    // Resultado del ejercicio para el progreso (repaso espaciado y temas dominados).
    // Con contarIntento = true también suma un intento al marcador de la sesión.
    registrar(clave, id, ok, tipoError, contarIntento = true) {
      Progreso.registrar(clave, id, ok, tipoError);
      if (contarIntento) ctx.intento(ok);
      pintarMarcador();
      pintarNiveles();
    },
    // Un intento en el marcador de la sesión: cada «Comprobar» cuenta, acierte o falle.
    intento(ok) {
      sesion.total++;
      if (ok) { sesion.ok++; sesion.racha++; } else sesion.racha = 0;
      pintarMarcador();
    },

    mostrarSolucion,
    ocultarSolucion: () => { $('#solucion').hidden = true; },
  };

  // Vista de aplicación (portátil/escritorio): todo en pantalla, corrección en el panel lateral.
  const escritorio = () => window.matchMedia('(min-width: 1100px) and (min-height: 560px)').matches;

  function limpiar() {
    $('#lateral').scrollTop = 0;
    ctx.feedback('');
    $('#pistas').innerHTML = '';
    $('#solucion').hidden = true;
    $('#explicacion').hidden = true;
    $('#explicacion').innerHTML = '';
  }

  // ───────── Solución: nombre troceado ↔ átomos ─────────
  function mostrarSolucion(m, g, { desplazar = true } = {}) {
    const ref = m.sis || m.n;
    const partes = Nombre.segmentar(ref);
    const res = Nombre.resaltados(partes, g);
    let iSust = 0;
    solucion.g = g;
    solucion.partes = partes.map((p, k) => {
      if (!res[k] || !res[k].atoms.size) return null;
      const color = p.k === 'sust' ? COLORES.sust[iSust++ % COLORES.sust.length] : COLORES[p.k];
      return { ...res[k], color, k: p.k, i: k };
    });
    solucion.activa = solucion.fija = null;

    $('#trivial').innerHTML = m.sis && Nombre.normalizar(m.sis) !== Nombre.normalizar(m.n)
      ? `<b>${esc(m.n)}</b> es el nombre trivial aceptado. Su nombre sistemático es:` : '';
    $('#nombre-partes').innerHTML = partes.map((p, k) => {
      const s = solucion.partes[k];
      if (!s) return `<span class="sep">${esc(p.t)}</span>`;
      return `<button class="parte" data-i="${k}" style="--c:${s.color}" aria-pressed="false"><span class="txt">${esc(p.t)}</span><small>${ETIQUETA_PARTE[p.k]}</small></button>`;
    }).join('');
    $('#pasos').innerHTML = Nombre.pasos(m, g).map((p) => `<li>${p}</li>`).join('');
    $('#nota').hidden = !m.nota;
    $('#nota').innerHTML = m.nota ? `<b>Ojo:</b> ${esc(m.nota)}` : '';
    $('#solucion').hidden = false;
    pintarSolucion();
    if (desplazar && !escritorio()) $('#feedback').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function pintarSolucion() {
    const activa = solucion.fija ?? solucion.activa;
    const orden = (r) => (r.k === 'cadena' ? 0 : 1);
    const resaltes = solucion.partes.filter(Boolean).sort((a, b) => orden(a) - orden(b)).map((r) => ({
      ...r, opacidad: activa == null ? (r.k === 'cadena' ? 0.18 : 0.32) : r.i === activa ? 0.55 : 0.06,
    }));
    Quimica.pintarEn($('#figura-sol'), solucion.g, { resaltes, locantes: true });
    document.querySelectorAll('#nombre-partes .parte').forEach((b) => {
      b.classList.toggle('activa', +b.dataset.i === activa);
      b.classList.toggle('apagada', activa != null && +b.dataset.i !== activa);
      b.setAttribute('aria-pressed', String(+b.dataset.i === solucion.fija));
    });
  }

  // ───────── Cabecera, temas y modos ─────────
  function pintarMarcador() {
    $('#racha').textContent = sesion.racha;
    $('#sesion').textContent = `${sesion.ok}/${sesion.total}`;
    const pool = MOLECULAS.filter((m) => niveles.has(m.nv));
    const n = ['dibujar', 'nombrar'].reduce((t, tipo) => t + Progreso.pendientes(pool, (m) => `${tipo}:${m.n}`), 0);
    $('#pendientes').textContent = n;
  }

  function pintarNiveles() {
    const html = NIVELES.map((n) => {
      const mols = MOLECULAS.filter((m) => m.nv === n.id);
      const dominadas = mols.filter((m) => Progreso.caja(`dibujar:${m.n}`) >= 2 || Progreso.caja(`nombrar:${m.n}`) >= 2).length;
      const on = niveles.has(n.id);
      const pct = Math.round((100 * dominadas) / mols.length);
      return `<button class="chip ${on ? 'on' : ''}" data-nv="${n.id}" aria-pressed="${on}"
        title="${dominadas} de ${mols.length} moléculas dominadas (acertadas a la primera dos veces seguidas)"
        aria-label="${esc(n.nombre)}: ${dominadas} de ${mols.length} moléculas dominadas">
        <span class="chip-fila">${on ? '✓ ' : ''}${esc(n.nombre)} <span class="progreso">${dominadas}/${mols.length}</span></span>
        <span class="chip-barra" aria-hidden="true"><span style="width:${pct}%"></span></span></button>`;
    }).join('');
    const todos = niveles.size === NIVELES.length;
    $('#niveles').innerHTML = html + `<button class="chip todos" data-nv="*">${todos ? 'Elegir solo uno' : 'Todos los temas'}</button>`;
    $('#temas-resumen').textContent = todos ? 'todos incluidos' : `${niveles.size} de ${NIVELES.length} incluidos`;
  }

  function alternarNivel(id) {
    if (id === '*') {
      if (niveles.size === NIVELES.length) niveles = new Set([NIVELES[0].id]);
      else NIVELES.forEach((n) => niveles.add(n.id));
    } else if (niveles.has(id)) {
      if (niveles.size > 1) niveles.delete(id);
    } else niveles.add(id);
    Progreso.pref('niveles', [...niveles]);
    pintarNiveles();
    pintarMarcador();
    if (!niveles.has(ctx.est.mol?.nv)) ctx.nuevo();
  }

  function abrirMenu(abrir) {
    $('#menu-mas').hidden = !abrir;
    $('#btn-mas').setAttribute('aria-expanded', String(abrir));
    if (abrir) $('#menu-mas button').focus();
  }

  function ponerModo(nombre) {
    if (!MODOS[nombre] || !MODOS[nombre].nuevo) nombre = 'dibujar';
    nombreModo = nombre;
    modo = MODOS[nombre];
    ctx.est = {};
    ctx.figuraClicable(false);
    document.querySelectorAll('[data-modo]').forEach((b) => {
      b.classList.toggle('activo', b.dataset.modo === nombre);
      b.setAttribute('aria-current', b.dataset.modo === nombre ? 'true' : 'false');
    });
    const extra = MODOS_MAS[nombre];
    $('#btn-mas').classList.toggle('activo', !!extra);
    $('#mas-titulo').textContent = extra || 'Más ejercicios';
    $('#temas').hidden = !modo.niveles;
    $('#progreso-repaso').hidden = true;
    abrirMenu(false);
    Progreso.pref('modo', nombre);
    ctx.nuevo();
  }

  function pintarPaleta() {
    const grupos = {};
    Object.entries(Editor.HERRAMIENTAS).forEach(([id, h]) => { (grupos[h.grupo] = grupos[h.grupo] || []).push([id, h]); });
    $('#paleta').innerHTML = Object.entries(grupos).map(([g, hs]) => `
      <div class="grupo-paleta" role="group" aria-label="${g}"><span>${g}</span><div>
        ${hs.map(([id, h]) => `<button class="pieza ${id.length <= 2 ? 'el-' + id : ''}" data-h="${id}" title="${esc(h.titulo)}" aria-label="${esc(h.titulo)}" aria-pressed="false">${esc(h.et)}</button>`).join('')}
      </div></div>`).join('');
    elegirHerramienta('C');
  }

  function elegirHerramienta(id) {
    ctx.editor.usar(id);
    document.querySelectorAll('.pieza').forEach((b) => {
      b.classList.toggle('on', b.dataset.h === id);
      b.setAttribute('aria-pressed', String(b.dataset.h === id));
    });
  }

  function bienvenida(mostrar) {
    $('#bienvenida').hidden = !mostrar;
    if (mostrar) $('#btn-bienvenida').focus();
    else Progreso.pref('bienvenida', true);
  }

  // ───────── Arranque ─────────
  async function iniciar() {
    try {
      await Quimica.iniciar();
    } catch (e) {
      $('#cargando').textContent = 'No se pudo cargar el motor químico (RDKit). Comprueba la conexión a internet y recarga la página.';
      return;
    }
    $('#cargando').remove();
    Progreso.persistir();

    ctx.editor = new Editor.Editor($('#lienzo'), {
      alCambiar: () => { if ($('#feedback').classList.contains('aviso')) ctx.feedback(''); },
    });
    pintarPaleta();
    pintarNiveles();
    pintarMarcador();
    bienvenida(!Progreso.pref('bienvenida'));

    MOLECULAS.forEach((m) => {
      ctx.preparar(m);
      if (!m._g || !m._can) console.warn('Molécula no válida:', m.n, m.s);
    });

    $('#paleta').addEventListener('click', (e) => { const b = e.target.closest('.pieza'); if (b) elegirHerramienta(b.dataset.h); });
    $('#niveles').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) alternarNivel(b.dataset.nv); });
    document.querySelectorAll('[data-modo]').forEach((b) => b.addEventListener('click', () => ponerModo(b.dataset.modo)));
    $('#btn-mas').addEventListener('click', () => abrirMenu($('#menu-mas').hidden));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.mas')) abrirMenu(false);
      // En la vista de escritorio, los temas son un desplegable: se cierra al hacer clic fuera.
      if (escritorio() && !e.target.closest('.temas')) $('#temas').open = false;
    });
    $('#bienvenida').addEventListener('click', (e) => { if (e.target === $('#bienvenida')) bienvenida(false); });
    $('#btn-comprobar').addEventListener('click', () => modo.comprobar?.(ctx));
    $('#btn-pista').addEventListener('click', () => modo.pista?.(ctx));
    $('#btn-solucion').addEventListener('click', () => modo.solucion?.(ctx));
    $('#btn-siguiente').addEventListener('click', () => (modo.siguiente ? modo.siguiente(ctx) : ctx.nuevo()));
    $('#btn-deshacer').addEventListener('click', () => ctx.editor.deshacer());
    $('#btn-centrar').addEventListener('click', () => ctx.editor.centrar());
    $('#btn-limpiar').addEventListener('click', () => ctx.editor.limpiar());
    $('#btn-bienvenida').addEventListener('click', () => bienvenida(false));
    $('#btn-ver-bienvenida').addEventListener('click', () => bienvenida(true));
    $('#respuesta').addEventListener('keydown', (e) => { if (e.key === 'Enter') modo.comprobar?.(ctx); });
    $('#feedback').addEventListener('click', (e) => { if (e.target.closest('[data-explicar]')) modo.explicar?.(ctx); });
    $('#figura').addEventListener('click', (e) => {
      if (!modo.clicFigura || !$('#figura').classList.contains('clicable')) return;
      const svg = $('#figura');
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      modo.clicFigura(ctx, { x: p.x / figuraS, y: p.y / figuraS });
    });
    $('#z-opciones').addEventListener('click', (e) => { const b = e.target.closest('[data-opcion]'); if (b) modo.opcion?.(ctx, b.dataset.opcion, b); });
    $('#z-inicio').addEventListener('click', (e) => { const b = e.target.closest('[data-accion]'); if (b) modo.accion?.(ctx, b.dataset.accion, b); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('#menu-mas').hidden) { abrirMenu(false); $('#btn-mas').focus(); }
      if (e.key === 'Escape' && !$('#bienvenida').hidden) bienvenida(false);
      if (e.key === 'Escape' && $('#temas').open && escritorio()) $('#temas').open = false;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !$('#z-editor').hidden && document.activeElement !== $('#respuesta')) {
        e.preventDefault();
        ctx.editor.deshacer();
      }
    });

    const partes = $('#nombre-partes');
    partes.addEventListener('mouseover', (e) => {
      const b = e.target.closest('.parte');
      solucion.activa = b ? +b.dataset.i : null;
      pintarSolucion();
    });
    partes.addEventListener('mouseleave', () => { solucion.activa = null; pintarSolucion(); });
    partes.addEventListener('click', (e) => {
      const b = e.target.closest('.parte');
      if (!b) return;
      const i = +b.dataset.i;
      solucion.fija = solucion.fija === i ? null : i;
      pintarSolucion();
    });

    ponerModo(Progreso.pref('modo') || 'dibujar');
  }

  window.App = { ctx, modo: () => nombreModo };
  iniciar();
})();
