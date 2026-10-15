// Modos de práctica: «Nombre → Estructura» (dibujar) y «Estructura → Nombre» (nombrar).
// Exporta también las funciones de evaluación que reutiliza el repaso general.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  // Grupos que se comparan para explicar en qué falla una estructura dibujada.
  const GRUPOS = [
    { n: 'dobles enlaces C=C', s: 'C=C' },
    { n: 'triples enlaces C≡C', s: 'C#C' },
    { n: 'anillos de benceno', s: 'c1ccccc1' },
    { n: 'grupos –OH', s: '[OX2H1][#6;!$(C=O)]' },
    { n: 'grupos cetona C=O', s: '[#6][CX3](=O)[#6]' },
    { n: 'grupos aldehído –CHO', s: '[CX3;H1,H2;!$(C-[O,N])]=O' },
    { n: 'grupos ácido –COOH', s: '[CX3](=O)[OX2H1]' },
    { n: 'grupos éster –COO–', s: '[CX3](=O)[OX2][#6]' },
    { n: 'grupos amida –CON<', s: '[CX3](=O)[NX3]' },
    { n: 'grupos amina', s: '[NX3;+0;!$(NC=O)]' },
    { n: 'grupos nitrilo –C≡N', s: 'C#N' },
    { n: 'enlaces éter C–O–C', s: '[OX2]([#6;!$(C=O)])[#6;!$(C=O)]' },
    { n: 'grupos nitro', s: '[N+](=O)[O-]' },
    { n: 'átomos de Cl', s: '[Cl]' }, { n: 'átomos de Br', s: '[Br]' }, { n: 'átomos de F', s: '[F]' }, { n: 'átomos de I', s: '[I]' },
  ];

  // Comprobaciones previas de un dibujo. Devuelve un aviso (texto) o null.
  function avisoDibujo(g) {
    if (!g.atoms.length) return 'Dibuja primero la molécula.';
    if (g.atoms.some((_, i) => Quimica.excedeValencia(g, i))) {
      return 'Hay átomos con demasiados enlaces (marcados en rojo). Recuerda: C forma 4 enlaces, N 3, O 2 y los halógenos 1.';
    }
    const piezas = Quimica.componentes(g);
    if (piezas > 1) return `Tienes ${piezas} piezas sueltas: todas deben estar unidas en una sola molécula.`;
    return null;
  }

  // → { aviso } | { ok, html, tipo }
  function evaluarDibujo(mol, g) {
    const aviso = avisoDibujo(g);
    if (aviso) return { aviso };
    const mb = Quimica.aMolblock(g);
    const can = Quimica.canonico(mb);
    if (!can) return { aviso: 'No he podido interpretar la estructura. Revisa los enlaces.' };
    if (can === mol._can) return { ok: true, html: '<b>¡Correcto!</b> La estructura corresponde al nombre.' };

    const objetivo = mol._g;
    const mensajes = [];
    const cu = Quimica.contarElementos(g), co = Quimica.contarElementos(objetivo);
    if ((cu.C || 0) !== (co.C || 0)) {
      mensajes.push(`Tu estructura tiene <b>${cu.C || 0} carbonos</b> y la del nombre tiene <b>${co.C || 0}</b>. Suma los de la cadena principal y los de todos los sustituyentes.`);
    }
    const smiles = Quimica.quitarMapas(mol.s);
    GRUPOS.forEach((gr) => {
      const a = Quimica.contarCoincidencias(mb, gr.s), b = Quimica.contarCoincidencias(smiles, gr.s);
      if (a !== b) mensajes.push(`Número de ${gr.n}: tienes <b>${a}</b>, el nombre indica <b>${b}</b>.`);
    });
    const fu = Quimica.formula(g), fo = Quimica.formula(objetivo);
    let tipo = 'estructura';
    if (!mensajes.length && fu === fo) {
      tipo = 'isomero';
      mensajes.push(`Tu molécula es un <b>isómero</b> de la correcta: misma fórmula (${fo}) y mismos grupos, pero en otra posición. Revisa la cadena principal y los localizadores.`);
    } else {
      mensajes.push(`Fórmula de tu dibujo: ${fu} · fórmula esperada: ${fo}.`);
    }
    return { ok: false, tipo, html: `<b>Todavía no.</b><ul>${mensajes.map((m) => `<li>${m}</li>`).join('')}</ul>` };
  }

  function evaluarNombre(mol, texto, esc) {
    const d = Nombre.diagnostico(texto, mol);
    if (d.estado === 'vacio') return { aviso: 'Escribe un nombre.' };
    if (d.estado === 'ok') {
      const extra = d.preferido ? '' : ` Aceptado. El nombre que usan los apuntes es <b>${esc(mol.n)}</b>.`;
      return { ok: true, html: `<b>¡Correcto!</b>${extra}` };
    }
    const trozos = d.trozos.map((t) => `<span class="trozo ${t.estado}">${esc(t.t)}</span>`).join('');
    return {
      ok: false,
      tipo: d.tipo,
      html: `<div class="tu-respuesta">${trozos}</div><ul>${d.mensajes.map((m) => `<li>${m}</li>`).join('')}</ul>
        <p class="leyenda"><span class="trozo bien">bien</span> <span class="trozo loc">localizador incorrecto</span> <span class="trozo mal">no corresponde</span></p>`,
    };
  }

  function crear(tipo) {
    const clave = (m) => `${tipo}:${m.n}`;

    function pintar(ctx) {
      const e = ctx.est;
      const resaltes = [];
      if (e.resalteCadena) {
        const r = Nombre.resaltados([{ k: 'cadena', locs: [] }], e.g)[0];
        resaltes.push({ ...r, color: 'var(--c-cadena)', opacidad: 0.3 });
      }
      ctx.pintarFigura(e.g, { resaltes, locantes: e.verNumeros });
    }

    function contar(ctx, ok, tipoError) {
      const e = ctx.est;
      if (e.contado) return;
      e.contado = true;
      ctx.registrar(clave(e.mol), e.mol.n, ok, tipoError);
    }

    return {
      niveles: true,

      nuevo(ctx) {
        const e = ctx.est;
        e.mol = ctx.elegirMolecula(clave);
        e.g = ctx.orientar(e.mol._g);
        e.contado = e.resuelto = false;
        e.pistas = Nombre.pistas(e.mol, e.g, tipo);
        e.nPistas = 0;
        e.resalteCadena = e.verNumeros = false;
        ctx.zonas(tipo === 'dibujar' ? ['editor'] : ['figura', 'respuesta']);
        ctx.botones({ comprobar: 'Comprobar', pista: 'Pista', solucion: 'Ver solución', siguiente: 'Siguiente →' });
        const nivel = ctx.nivelNombre(e.mol.nv);
        if (tipo === 'dibujar') {
          ctx.enunciado(`<span class="etiqueta">${ctx.esc(nivel)} · Dibuja la estructura de</span><div class="nombre-grande">${ctx.esc(e.mol.n)}</div>`);
          ctx.editor.reiniciar();
        } else {
          ctx.enunciado(`<span class="etiqueta">${ctx.esc(nivel)} · ¿Cómo se llama esta molécula?</span>`);
          ctx.respuesta('');
          pintar(ctx);
        }
      },

      comprobar(ctx) {
        const e = ctx.est;
        if (e.resuelto) { ctx.nuevo(); return; }
        const r = tipo === 'dibujar' ? evaluarDibujo(e.mol, ctx.editor.grafo()) : evaluarNombre(e.mol, ctx.respuesta(), ctx.esc);
        if (r.aviso) { ctx.feedback(r.aviso, 'aviso'); return; }
        contar(ctx, r.ok, r.tipo);
        ctx.feedback(r.html, r.ok ? 'bien' : 'mal');
        if (r.ok) {
          e.resuelto = true;
          ctx.botones({ comprobar: 'Otra →' });
          ctx.mostrarSolucion(e.mol, e.g);
        }
      },

      pista(ctx) {
        const e = ctx.est;
        if (e.nPistas >= e.pistas.length) return;
        const p = e.pistas[e.nPistas++];
        ctx.pista(p.texto);
        if (p.cadena && tipo === 'nombrar') e.resalteCadena = true;
        if (p.numeros) e.verNumeros = true;
        if (tipo === 'nombrar') pintar(ctx);
        if (e.nPistas >= e.pistas.length) ctx.botones({ pista: false });
      },

      solucion(ctx) {
        const e = ctx.est;
        contar(ctx, false, null);
        e.resuelto = true;
        if (tipo === 'nombrar') ctx.feedback(`La respuesta es <b>${ctx.esc(e.mol.n)}</b>.`, 'aviso');
        else ctx.feedback('Aquí tienes la estructura: compárala con la tuya.', 'aviso');
        ctx.botones({ comprobar: 'Otra →' });
        ctx.mostrarSolucion(e.mol, e.g);
      },
    };
  }

  MODOS.dibujar = crear('dibujar');
  MODOS.nombrar = crear('nombrar');
  MODOS.evaluar = { dibujo: evaluarDibujo, nombre: evaluarNombre, avisoDibujo };
})();
