// Modos de práctica: «Nombre → Estructura» (dibujar) y «Estructura → Nombre» (nombrar).
// Exporta también la evaluación y la explicación de errores, que reutiliza el repaso general.
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

  const BOTON_EXPLICAR = `<div class="fb-acciones">
      <button class="btn-explicar" data-explicar>¿Por qué está mal? Ver explicación</button>
      <span>o corrígelo y vuelve a comprobar</span></div>`;

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

  function cadenaMasLarga(g) {
    const adj = Quimica.vecinos(g);
    const esC = (i) => g.atoms[i].el === 'C';
    let mejor = 0;
    const dfs = (i, visto) => {
      mejor = Math.max(mejor, visto.size);
      adj[i].forEach((j) => {
        if (esC(j) && !visto.has(j)) { visto.add(j); dfs(j, visto); visto.delete(j); }
      });
    };
    g.atoms.forEach((_, i) => { if (esC(i)) dfs(i, new Set([i])); });
    return mejor;
  }

  // Diferencias de composición entre un dibujo y la molécula correcta.
  function diferenciasEstructura(mol, g, mb) {
    const objetivo = mol._g;
    const mensajes = [];
    const cu = Quimica.contarElementos(g), co = Quimica.contarElementos(objetivo);
    if ((cu.C || 0) !== (co.C || 0)) {
      mensajes.push(`<b>Carbonos:</b> tu dibujo tiene ${cu.C || 0} y la molécula correcta tiene ${co.C || 0}. Suma los de la cadena principal y los de todos los sustituyentes.`);
    }
    const smiles = Quimica.quitarMapas(mol.s);
    GRUPOS.forEach((gr) => {
      const a = Quimica.contarCoincidencias(mb, gr.s), b = Quimica.contarCoincidencias(smiles, gr.s);
      if (a !== b) mensajes.push(`<b>${gr.n[0].toUpperCase() + gr.n.slice(1)}:</b> tienes ${a} y deberían ser ${b}.`);
    });
    return mensajes;
  }

  // → { aviso } | { ok, html, tipo }
  function evaluarDibujo(mol, g) {
    const aviso = avisoDibujo(g);
    if (aviso) return { aviso };
    const mb = Quimica.aMolblock(g);
    const can = Quimica.canonico(mb);
    if (!can) return { aviso: 'No he podido interpretar la estructura. Revisa los enlaces.' };
    if (can === mol._can) return { ok: true, html: '<b>¡Correcto!</b> La estructura corresponde al nombre.' };

    const mensajes = diferenciasEstructura(mol, g, mb);
    const fu = Quimica.formula(g), fo = Quimica.formula(mol._g);
    let tipo = 'estructura';
    if (!mensajes.length && fu === fo) {
      tipo = 'isomero';
      mensajes.push('Tienes las piezas correctas (misma fórmula y mismos grupos), pero <b>colocadas en otra posición</b>.');
    }
    return { ok: false, tipo, html: `<b>Todavía no.</b><ul>${mensajes.slice(0, 2).map((m) => `<li>${m}</li>`).join('')}</ul>` };
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
      html: `<b>Todavía no.</b><div class="tu-respuesta">${trozos}</div><ul>${d.mensajes.map((m) => `<li>${m}</li>`).join('')}</ul>
        <p class="leyenda"><span class="trozo bien">bien</span> <span class="trozo loc">localizador incorrecto</span> <span class="trozo mal">no corresponde</span></p>`,
    };
  }

  // ───────── Explicación del error ─────────
  // Índice de moléculas con nombre conocido, para reconocer lo que ha dibujado o escrito el alumno.
  let indice = null;
  function indiceMoleculas() {
    if (indice) return indice;
    indice = { porCan: new Map(), porNombre: new Map() };
    const añadir = (entrada, nombres) => {
      if (!entrada.can) return;
      if (!indice.porCan.has(entrada.can)) indice.porCan.set(entrada.can, entrada);
      nombres.forEach((x) => {
        const k = Nombre.normalizar(x);
        if (!indice.porNombre.has(k)) indice.porNombre.set(k, entrada);
      });
    };
    MOLECULAS.forEach((m) => añadir({ n: m.n, ref: m.sis || m.n, s: m.s, can: m._can }, Nombre.aceptados(m)));
    (MODOS.isomeros?.SERIES || []).forEach((serie) => serie.mols.forEach((x) => {
      const [n, smi] = Array.isArray(x) ? x : [x.n, x.smi];
      añadir({ n, ref: n, s: smi, can: Quimica.canonico(smi) }, [n]);
    }));
    return indice;
  }

  function figura(titulo, nombre, id, esc) {
    return `<figure class="comparada"><figcaption>${titulo}</figcaption>
      <div class="figura-marco"><svg id="${id}" class="figura"></svg></div>
      ${nombre ? `<p class="nombre-mini">${esc(nombre)}</p>` : ''}</figure>`;
  }

  // intento: { tipo: 'dibujar', grafo } | { tipo: 'nombrar', texto }
  function explicar(ctx, mol, gSol, intento) {
    const esc = ctx.esc;
    const ref = mol.sis || mol.n;
    const idx = indiceMoleculas();
    let mensajes = [];
    let figuras = '';
    let gUsuario = null;
    let correccion = '';

    if (intento.tipo === 'dibujar') {
      const g = intento.grafo;
      const mb = Quimica.aMolblock(g);
      const conocida = idx.porCan.get(Quimica.canonico(mb));
      gUsuario = g;
      if (conocida) {
        mensajes.push(`Lo que has dibujado se llama <b>${esc(conocida.n)}</b>, no ${esc(mol.n)}.`);
        mensajes.push(...Nombre.comparar(conocida.ref, ref));
      } else {
        mensajes.push(...diferenciasEstructura(mol, g, mb));
      }
      const lu = cadenaMasLarga(g), lc = cadenaMasLarga(mol._g);
      if (!conocida && lu !== lc) {
        mensajes.push(`<b>Cadena:</b> la cadena de carbonos más larga de tu dibujo tiene ${lu} C; en la molécula correcta tiene ${lc} C.`);
      }
      if (!mensajes.length) mensajes.push('Tienes las mismas piezas que la molécula correcta, pero <b>en otras posiciones</b>. Compara la numeración de la cadena con la tuya.');
      figuras = figura('Tu dibujo', conocida?.n, 'exp-usuario', esc) + figura('Lo que pide el nombre', mol.n, 'exp-correcto', esc);
      const pasos = Nombre.pistas(mol, gSol, 'dibujar').map((p) => `<li>${p.texto}</li>`).join('');
      correccion = `<p>Constrúyela en este orden:</p><ol class="pasos-construccion">${pasos}</ol>`;
    } else {
      const texto = intento.texto;
      const conocida = idx.porNombre.get(Nombre.normalizar(texto));
      mensajes = Nombre.comparar(texto, ref);
      if (conocida && conocida.can !== mol._can) {
        mensajes.unshift(`Tu nombre corresponde a <b>otra molécula</b> (la de la izquierda).`);
        gUsuario = Quimica.grafoDeSmiles(conocida.s);
        figuras = figura('Lo que describe tu nombre', texto, 'exp-usuario', esc) + figura('La molécula del ejercicio', mol.n, 'exp-correcto', esc);
      }
      const chips = Nombre.marcarCorreccion(texto, ref)
        .map((t) => (t.estado === 'sep' ? esc(t.t) : `<span class="chip-correccion ${t.estado}">${esc(t.t)}</span>`)).join('');
      correccion = `<div class="correccion">${chips}</div><p class="leyenda">Las partes resaltadas son las que tenías que cambiar. Debajo tienes el nombre desglosado parte a parte.</p>`;
    }

    const caja = ctx.explicacion(`
      <h2>Por qué está mal y cómo corregirlo</h2>
      ${figuras ? `<div class="comparativa">${figuras}</div>` : ''}
      <h3>Qué ha fallado</h3>
      <ul class="lista-fallos-exp">${mensajes.map((m) => `<li>${m}</li>`).join('')}</ul>
      <h3>Cómo corregirlo</h3>
      ${correccion}`);
    if (gUsuario) Quimica.pintarEn(caja.querySelector('#exp-usuario'), Quimica.aOrigen(Quimica.copiar(gUsuario)), { S: 34 });
    if (figuras) Quimica.pintarEn(caja.querySelector('#exp-correcto'), gSol, { S: 34, locantes: true });
    caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Cada ejercicio cuenta una sola vez, al terminarlo.
    function terminar(ctx, resuelto) {
      const e = ctx.est;
      if (e.terminado) return;
      e.terminado = true;
      ctx.registrar(clave(e.mol), e.mol.n, resuelto && e.intentos === 0, null, resuelto);
      ctx.botones({ comprobar: 'Siguiente ejercicio →', pista: false, solucion: false, siguiente: false });
    }

    const intentoActual = (ctx) => (tipo === 'dibujar'
      ? { tipo, grafo: ctx.editor.grafo() }
      : { tipo, texto: ctx.respuesta() });

    return {
      niveles: true,

      nuevo(ctx) {
        const e = ctx.est;
        e.mol = ctx.elegirMolecula(clave);
        e.g = ctx.orientar(e.mol._g);
        e.terminado = false;
        e.intentos = 0;
        e.ultimoIntento = null;
        e.pistas = Nombre.pistas(e.mol, e.g, tipo);
        e.nPistas = 0;
        e.resalteCadena = e.verNumeros = false;
        ctx.zonas(tipo === 'dibujar' ? ['editor'] : ['figura', 'respuesta']);
        ctx.botones({ comprobar: 'Comprobar', pista: 'Pista', solucion: 'Ver solución', siguiente: 'Saltar →' });
        const tema = ctx.nivelNombre(e.mol.nv);
        if (tipo === 'dibujar') {
          ctx.enunciado(tema, 'Dibuja la estructura de esta molécula', ctx.esc(e.mol.n));
          ctx.editor.reiniciar();
        } else {
          ctx.enunciado(tema, '¿Cómo se llama esta molécula?');
          ctx.respuesta('');
          pintar(ctx);
        }
      },

      comprobar(ctx) {
        const e = ctx.est;
        if (e.terminado) { ctx.nuevo(); return; }
        const intento = intentoActual(ctx);
        const r = tipo === 'dibujar' ? evaluarDibujo(e.mol, intento.grafo) : evaluarNombre(e.mol, intento.texto, ctx.esc);
        if (r.aviso) { ctx.feedback(r.aviso, 'aviso'); return; }
        if (r.ok) {
          const extra = e.intentos ? ` <span class="intentos">(al ${e.intentos + 1}.º intento)</span>` : '';
          terminar(ctx, true);
          ctx.feedback(r.html + extra, 'bien');
          ctx.mostrarSolucion(e.mol, e.g);
          return;
        }
        e.intentos++;
        e.ultimoIntento = intento;
        Progreso.anotarError(r.tipo);
        ctx.feedback(r.html + BOTON_EXPLICAR, 'mal');
      },

      explicar(ctx) {
        const e = ctx.est;
        if (!e.ultimoIntento) return;
        terminar(ctx, false);
        ctx.feedback(tipo === 'nombrar' ? `La respuesta es <b>${ctx.esc(e.mol.n)}</b>.` : 'Compara tu dibujo con la estructura correcta.', 'aviso');
        explicar(ctx, e.mol, e.g, e.ultimoIntento);
        ctx.mostrarSolucion(e.mol, e.g, { desplazar: false });
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
        terminar(ctx, false);
        if (tipo === 'nombrar') ctx.feedback(`La respuesta es <b>${ctx.esc(e.mol.n)}</b>.`, 'aviso');
        else ctx.feedback('Aquí tienes la estructura correcta: compárala con la tuya.', 'aviso');
        if (e.ultimoIntento) explicar(ctx, e.mol, e.g, e.ultimoIntento);
        ctx.mostrarSolucion(e.mol, e.g, { desplazar: !e.ultimoIntento });
      },

      siguiente(ctx) {
        const e = ctx.est;
        if (!e.terminado && e.intentos > 0) terminar(ctx, false);
        ctx.nuevo();
      },
    };
  }

  MODOS.dibujar = crear('dibujar');
  MODOS.nombrar = crear('nombrar');
  MODOS.evaluar = { dibujo: evaluarDibujo, nombre: evaluarNombre, avisoDibujo, explicar, BOTON_EXPLICAR };
})();
