// Repaso general: sesión tipo examen con preguntas de todas las secciones,
// alternando dibujar y nombrar al azar, sin pistas y con un único intento.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  const TIPO = { dibujar: 'Nombre → Estructura', nombrar: 'Estructura → Nombre' };
  const barajar = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  };

  // Preguntas repartidas entre todas las secciones (una de cada antes de repetir sección).
  function generar(n) {
    const usadas = new Set();
    const preguntas = [];
    let ronda = [];
    while (preguntas.length < n) {
      if (!ronda.length) ronda = barajar(NIVELES.map((x) => x.id));
      const nivel = ronda.pop();
      const libres = MOLECULAS.filter((m) => m.nv === nivel && !usadas.has(m.n));
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
    ctx.enunciado('<span class="etiqueta">Repaso general</span><div class="nombre-grande">Examen de prueba</div>');
    const fallos = r.ultimosFallos || [];
    ctx.$('#z-inicio').innerHTML = `
      <p>Preguntas al azar de <b>todas las secciones</b>, mezclando «dibuja la estructura» y «escribe el nombre», como en un examen real.
      No hay pistas y cada pregunta tiene un solo intento. Al final verás tu nota y en qué fallas más.</p>
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
    ctx.preparar(q.mol);
    r.g = ctx.orientar(q.mol._g);
    r.respondida = false;
    ctx.feedback('');
    ctx.$('#pistas').innerHTML = '';
    ctx.ocultarSolucion();
    const barra = ctx.$('#progreso-repaso');
    barra.hidden = false;
    barra.innerHTML = `<span>Pregunta ${r.i + 1} de ${r.preguntas.length}</span>
      <div class="barra"><div style="width:${(100 * r.i) / r.preguntas.length}%"></div></div>
      <span>${r.resultados.filter((x) => x.ok).length} aciertos</span>`;
    ctx.botones({ comprobar: 'Comprobar', pista: false, solucion: 'No lo sé', siguiente: false });
    if (q.tipo === 'dibujar') {
      ctx.zonas(['editor']);
      ctx.enunciado(`<span class="etiqueta">${TIPO.dibujar} · Dibuja la estructura de</span><div class="nombre-grande">${ctx.esc(q.mol.n)}</div>`);
      ctx.editor.reiniciar();
    } else {
      ctx.zonas(['figura', 'respuesta']);
      ctx.enunciado(`<span class="etiqueta">${TIPO.nombrar} · ¿Cómo se llama esta molécula?</span>`);
      ctx.respuesta('');
      ctx.pintarFigura(r.g);
    }
  }

  function cerrar(ctx, ok, html, tipoError) {
    const r = ctx.est;
    const q = r.preguntas[r.i];
    r.respondida = true;
    r.resultados.push({ ...q, ok, tipoError });
    ctx.registrar(`${q.tipo}:${q.mol.n}`, q.mol.n, ok, tipoError);
    const correcto = q.tipo === 'nombrar' && !ok ? ` La respuesta es <b>${ctx.esc(q.mol.n)}</b>.` : '';
    ctx.feedback(html + correcto, ok ? 'bien' : 'mal');
    const ultima = r.i === r.preguntas.length - 1;
    ctx.botones({ comprobar: ultima ? 'Ver resultados →' : 'Siguiente pregunta →', solucion: false });
    ctx.mostrarSolucion(q.mol, r.g);
  }

  function resumen(ctx) {
    const r = ctx.est;
    r.fase = 'resumen';
    const res = r.resultados;
    const aciertos = res.filter((x) => x.ok).length;
    const nota = ((10 * aciertos) / res.length).toFixed(1).replace('.', ',');
    r.ultimosFallos = res.filter((x) => !x.ok).map(({ mol, tipo }) => ({ mol, tipo }));
    ctx.ocultarSolucion();
    ctx.feedback('');
    ctx.$('#progreso-repaso').hidden = true;
    ctx.zonas(['inicio']);
    ctx.botones({ comprobar: false, pista: false, solucion: false, siguiente: false });
    ctx.enunciado(`<span class="etiqueta">Resultado del repaso</span><div class="nombre-grande">${aciertos} de ${res.length} · nota ${nota}</div>`);

    const porSeccion = NIVELES.map((n) => {
      const xs = res.filter((x) => x.mol.nv === n.id);
      return xs.length ? `<tr><td>${ctx.esc(n.nombre)}</td><td>${xs.filter((x) => x.ok).length}/${xs.length}</td>${barraMini(xs)}</tr>` : '';
    }).join('');
    const porTipo = Object.entries(TIPO).map(([k, t]) => {
      const xs = res.filter((x) => x.tipo === k);
      return xs.length ? `<tr><td>${t}</td><td>${xs.filter((x) => x.ok).length}/${xs.length}</td>${barraMini(xs)}</tr>` : '';
    }).join('');
    const errores = {};
    res.filter((x) => !x.ok).forEach((x) => { const k = x.tipoError || 'nolose'; errores[k] = (errores[k] || 0) + 1; });
    const listaErrores = Object.entries(errores).sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `<li>${k === 'nolose' ? 'Sin responder («No lo sé»)' : ctx.TIPOS_ERROR[k] || k}: <b>${n}</b></li>`).join('');
    const fallos = r.ultimosFallos.map((x) => `<li>${ctx.esc(x.mol.n)} <small>(${TIPO[x.tipo]})</small></li>`).join('');

    ctx.$('#z-inicio').innerHTML = `
      <div class="resumen">
        <div><h3>Por sección</h3><table>${porSeccion}</table></div>
        <div><h3>Por tipo de ejercicio</h3><table>${porTipo}</table>
          ${listaErrores ? `<h3>Dónde has fallado</h3><ul>${listaErrores}</ul>` : '<p>¡Sin fallos!</p>'}</div>
      </div>
      ${fallos ? `<h3>Moléculas falladas</h3><ul class="lista-fallos">${fallos}</ul>` : ''}
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
      if (accion === 'empezar') empezar(ctx, generar(+boton.dataset.n));
      else if (accion === 'fallos') empezar(ctx, barajar(r.ultimosFallos || []));
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
      const ev = q.tipo === 'dibujar'
        ? MODOS.evaluar.dibujo(q.mol, ctx.editor.grafo())
        : MODOS.evaluar.nombre(q.mol, ctx.respuesta(), ctx.esc);
      if (ev.aviso) { ctx.feedback(ev.aviso, 'aviso'); return; }
      cerrar(ctx, ev.ok, ev.html, ev.tipo);
    },

    solucion(ctx) {
      const r = ctx.est;
      if (r.fase !== 'pregunta' || r.respondida) return;
      cerrar(ctx, false, 'Sin responder.', null);
    },
  };
})();
