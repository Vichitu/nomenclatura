// Repaso general: sesión tipo examen con preguntas de todas las secciones,
// alternando dibujar y nombrar al azar, sin pistas y con un único intento.
// Opcionalmente incluye los nombres triviales y los grupos de los apuntes.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  const TIPO = { dibujar: 'Nombre → Estructura', nombrar: 'Estructura → Nombre' };
  const TRIVIALES = 'triviales'; // sección extra del repaso
  const barajar = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  };
  // Cada pregunta es { mol, tipo } (banco) o { t, tipo } (nombre trivial).
  const nombreDe = (q) => (q.t ? q.t.n : q.mol.n);
  const conTriviales = () => Progreso.pref('repasoTriviales') !== false;

  // Preguntas repartidas entre todas las secciones (una de cada antes de repetir sección).
  function generar(n, triviales) {
    const usadas = new Set();
    const preguntas = [];
    const secciones = [...NIVELES.map((x) => x.id), ...(triviales ? [TRIVIALES] : [])];
    let ronda = [];
    while (preguntas.length < n) {
      if (!ronda.length) ronda = barajar(secciones);
      const seccion = ronda.pop();
      if (seccion === TRIVIALES) {
        const libres = MODOS.triviales.TRIVIALES.filter((t) => !usadas.has(t.n));
        if (!libres.length) continue;
        const t = libres[Math.floor(Math.random() * libres.length)];
        usadas.add(t.n);
        preguntas.push({ t, tipo: t.grupo || Math.random() < 0.5 ? 'nombrar' : 'dibujar' });
        continue;
      }
      const libres = MOLECULAS.filter((m) => m.nv === seccion && !usadas.has(m.n));
      if (!libres.length) continue;
      const mol = libres[Math.floor(Math.random() * libres.length)];
      usadas.add(mol.n);
      preguntas.push({ mol, tipo: Math.random() < 0.5 ? 'dibujar' : 'nombrar' });
    }
    return preguntas;
  }

  function inicio(ctx) {
    const r = ctx.est;
    r.fase = 'inicio';
    ctx.zonas(['inicio']);
    ctx.botones({ comprobar: false, pista: false, solucion: false, siguiente: false });
    ctx.$('#progreso-repaso').hidden = true;
    ctx.enunciado('Repaso general', 'Prepárate como en un examen real', 'Examen de prueba');
    const fallos = r.ultimosFallos || [];
    ctx.$('#z-inicio').innerHTML = `
      <p>Preguntas al azar de <b>todas las secciones</b>, mezclando «dibuja la estructura» y «escribe el nombre», como en un examen real.
      No hay pistas y cada pregunta tiene un solo intento. Al final verás tu nota y en qué fallas más.</p>
      <label class="casilla"><input type="checkbox" id="repaso-triviales" ${conTriviales() ? 'checked' : ''}>
        Incluir nombres triviales y grupos (tolueno, piridina, fenilo, terc-butilo…)</label>
      <div class="botonera">
        <button class="primario" data-accion="empezar" data-n="10">10 preguntas</button>
        <button data-accion="empezar" data-n="20">20 preguntas</button>
        <button data-accion="empezar" data-n="30">30 preguntas</button>
        ${fallos.length ? `<button data-accion="fallos">Repasar mis fallos (${fallos.length})</button>` : ''}
      </div>`;
  }

  function empezar(ctx, preguntas) {
    const r = ctx.est;
    r.fase = 'pregunta';
    r.preguntas = preguntas;
    r.i = 0;
    r.resultados = [];
    pregunta(ctx);
  }

  function pregunta(ctx) {
    const r = ctx.est;
    const q = r.preguntas[r.i];
    const g = q.t ? MODOS.triviales.preparar(q.t)._g : ctx.preparar(q.mol)._g;
    r.g = ctx.orientar(g);
    r.respondida = false;
    r.intento = null;
    ctx.limpiar();
    const barra = ctx.$('#progreso-repaso');
    barra.hidden = false;
    barra.innerHTML = `<span>Pregunta ${r.i + 1} de ${r.preguntas.length}</span>
      <div class="barra"><div style="width:${(100 * r.i) / r.preguntas.length}%"></div></div>
      <span>${r.resultados.filter((x) => x.ok).length} aciertos</span>`;
    ctx.botones({ comprobar: 'Comprobar', pista: false, solucion: 'No lo sé', siguiente: false });
    const tema = q.t ? 'Nombres triviales' : TIPO[q.tipo];
    if (q.tipo === 'dibujar') {
      ctx.zonas(['editor']);
      ctx.enunciado(tema, 'Dibuja la estructura de esta molécula', ctx.esc(nombreDe(q)));
      ctx.editor.reiniciar();
    } else {
      ctx.zonas(['figura', 'respuesta']);
      ctx.enunciado(tema, q.t ? (q.t.grupo ? '¿Cómo se llama este grupo? (R = resto de la molécula)' : '¿Cuál es su nombre trivial?') : '¿Cómo se llama esta molécula?');
      ctx.respuesta('');
      ctx.pintarFigura(r.g);
    }
  }

  function cerrar(ctx, ok, html, tipoError) {
    const r = ctx.est;
    const q = r.preguntas[r.i];
    r.respondida = true;
    r.resultados.push({ ...q, ok, tipoError });
    if (q.t) ctx.registrar(`trivial:${q.tipo}:${q.t.n}`, null, ok, ok ? null : 'triviales');
    else ctx.registrar(`${q.tipo}:${q.mol.n}`, q.mol.n, ok, tipoError);
    const correcto = q.tipo === 'nombrar' && !ok ? ` La respuesta es <b>${ctx.esc(nombreDe(q))}</b>.` : '';
    const explicar = !ok && r.intento && !q.t ? '<div class="fb-acciones"><button class="btn-explicar" data-explicar>¿Por qué está mal? Ver explicación</button></div>' : '';
    ctx.feedback(html + correcto + explicar, ok ? 'bien' : 'mal');
    const ultima = r.i === r.preguntas.length - 1;
    ctx.botones({ comprobar: ultima ? 'Ver resultados →' : 'Siguiente pregunta →', solucion: false });
    if (q.t) MODOS.triviales.ficha(ctx, q.t, ok ? 'Para recordarlo' : 'Respuesta');
    else ctx.mostrarSolucion(q.mol, r.g);
  }

  function resumen(ctx) {
    const r = ctx.est;
    r.fase = 'resumen';
    const res = r.resultados;
    const aciertos = res.filter((x) => x.ok).length;
    const nota = ((10 * aciertos) / res.length).toFixed(1).replace('.', ',');
    r.ultimosFallos = res.filter((x) => !x.ok).map(({ mol, t, tipo }) => ({ mol, t, tipo }));
    ctx.limpiar();
    ctx.$('#progreso-repaso').hidden = true;
    ctx.zonas(['inicio']);
    ctx.botones({ comprobar: false, pista: false, solucion: false, siguiente: false });
    ctx.enunciado('Resultado del repaso', aciertos === res.length ? '¡Perfecto!' : 'Revisa abajo dónde has fallado', `${aciertos} de ${res.length} · nota ${nota}`);

    const fila = (titulo, xs) => (xs.length ? `<tr><td>${ctx.esc(titulo)}</td><td>${xs.filter((x) => x.ok).length}/${xs.length}</td>${barraMini(xs)}</tr>` : '');
    const porSeccion = NIVELES.map((n) => fila(n.nombre, res.filter((x) => x.mol && x.mol.nv === n.id))).join('')
      + fila('Nombres triviales y grupos', res.filter((x) => x.t));
    const porTipo = Object.entries(TIPO).map(([k, t]) => fila(t, res.filter((x) => x.tipo === k))).join('');
    const errores = {};
    res.filter((x) => !x.ok).forEach((x) => { const k = x.tipoError || (x.t ? 'triviales' : 'nolose'); errores[k] = (errores[k] || 0) + 1; });
    const listaErrores = Object.entries(errores).sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `<li>${k === 'nolose' ? 'Sin responder («No lo sé»)' : ctx.TIPOS_ERROR[k] || k}: <b>${n}</b></li>`).join('');
    const fallos = r.ultimosFallos.map((x) => `<li>${ctx.esc(nombreDe(x))} <small>(${x.t ? 'nombre trivial · ' : ''}${TIPO[x.tipo]})</small></li>`).join('');

    ctx.$('#z-inicio').innerHTML = `
      <div class="resumen">
        <div><h3>Por sección</h3><table>${porSeccion}</table></div>
        <div><h3>Por tipo de ejercicio</h3><table>${porTipo}</table>
          ${listaErrores ? `<h3>Dónde has fallado</h3><ul>${listaErrores}</ul>` : '<p>¡Sin fallos!</p>'}</div>
      </div>
      ${fallos ? `<h3>Preguntas falladas</h3><ul class="lista-fallos">${fallos}</ul>` : ''}
      <div class="botonera">
        ${fallos ? '<button class="primario" data-accion="fallos">Repasar mis fallos</button>' : ''}
        <button data-accion="inicio">Nueva sesión</button>
      </div>`;
  }

  const barraMini = (xs) => `<td><div class="barra mini"><div style="width:${(100 * xs.filter((x) => x.ok).length) / xs.length}%"></div></div></td>`;

  MODOS.repaso = {
    niveles: false,

    nuevo(ctx) { inicio(ctx); },

    accion(ctx, accion, boton) {
      const r = ctx.est;
      if (accion === 'empezar') {
        const triviales = ctx.$('#repaso-triviales')?.checked ?? conTriviales();
        Progreso.pref('repasoTriviales', triviales);
        empezar(ctx, generar(+boton.dataset.n, triviales));
      } else if (accion === 'fallos') empezar(ctx, barajar(r.ultimosFallos || []));
      else inicio(ctx);
    },

    comprobar(ctx) {
      const r = ctx.est;
      if (r.fase !== 'pregunta') return;
      if (r.respondida) {
        if (r.i < r.preguntas.length - 1) { r.i++; pregunta(ctx); } else resumen(ctx);
        return;
      }
      const q = r.preguntas[r.i];
      const intento = q.tipo === 'dibujar' ? { tipo: q.tipo, grafo: ctx.editor.grafo() } : { tipo: q.tipo, texto: ctx.respuesta() };
      let ev;
      if (q.t) {
        const t = q.t;
        ev = q.tipo === 'dibujar'
          ? MODOS.evaluar.dibujo({ n: t.n, s: t.s, _g: t._g, _can: t._can }, intento.grafo)
          : MODOS.triviales.evaluarNombre(t, intento.texto, ctx.esc);
      } else {
        ev = q.tipo === 'dibujar'
          ? MODOS.evaluar.dibujo(q.mol, intento.grafo)
          : MODOS.evaluar.nombre(q.mol, intento.texto, ctx.esc);
      }
      if (ev.aviso) { ctx.feedback(ev.aviso, 'aviso'); return; }
      r.intento = intento;
      cerrar(ctx, ev.ok, ev.html, ev.tipo);
    },

    solucion(ctx) {
      const r = ctx.est;
      if (r.fase !== 'pregunta' || r.respondida) return;
      cerrar(ctx, false, 'Sin responder.', null);
    },

    explicar(ctx) {
      const r = ctx.est;
      if (r.fase !== 'pregunta' || !r.intento || r.preguntas[r.i].t) return;
      MODOS.evaluar.explicar(ctx, r.preguntas[r.i].mol, r.g, r.intento);
    },
  };
})();
