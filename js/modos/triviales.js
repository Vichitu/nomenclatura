// «Nombres triviales»: las moléculas y grupos de la lámina «Algunos nombres
// triviales» de los apuntes (pág. 39). Se practican en los dos sentidos:
// nombre trivial → dibujo y dibujo → nombre, también en formato test. Incluye los
// grupos y radicales de los apuntes manuscritos.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  // n: nombre trivial · alt: otros nombres aceptados · sis: nombre sistemático
  // grupo: es un sustituyente (se dibuja con R) y solo se pregunta en el sentido dibujo → nombre.
  const TRIVIALES = [
    { n: 'tolueno', sis: 'metilbenceno', s: 'Cc1ccccc1', nota: 'Benceno con un metilo.' },
    { n: 'o-xileno', alt: ['orto-xileno', 'oxileno'], sis: '1,2-dimetilbenceno', s: 'Cc1ccccc1C', nota: 'Benceno con dos metilos en posición orto (1,2). Existen también m-xileno (1,3) y p-xileno (1,4).' },
    { n: 'naftaleno', s: 'c1ccc2ccccc2c1', nota: 'Dos anillos de benceno fusionados (comparten un enlace).' },
    { n: 'estireno', sis: 'etenilbenceno', alt: ['vinilbenceno'], s: 'C=Cc1ccccc1', nota: 'Benceno con un vinilo (–CH=CH₂).' },
    { n: 'fenol', sis: 'bencenol', alt: ['hidroxibenceno'], s: 'Oc1ccccc1', nota: 'Benceno con un –OH.' },
    { n: 'anilina', sis: 'bencenamina', alt: ['aminobenceno', 'fenilamina'], s: 'Nc1ccccc1', nota: 'Benceno con un –NH₂.' },
    { n: 'ácido benzoico', sis: 'ácido bencenocarboxílico', s: 'OC(=O)c1ccccc1', nota: 'Benceno con un –COOH.' },
    { n: 'acetileno', sis: 'etino', s: 'C#C', nota: 'H–C≡C–H: el alquino más sencillo.' },
    { n: 'acetonitrilo', sis: 'etanonitrilo', s: 'CC#N', nota: 'CH₃–C≡N. «Acet-» indica 2 carbonos (como en el ácido acético).' },
    { n: 'etileno', sis: 'eteno', s: 'C=C', nota: 'H₂C=CH₂: el alqueno más sencillo.' },
    { n: 'diclorometano', alt: ['cloruro de metileno'], s: 'ClCCl', nota: 'CH₂Cl₂, un disolvente muy usado (también «cloruro de metileno»).' },
    { n: 'cloroformo', sis: 'triclorometano', s: 'ClC(Cl)Cl', nota: 'CHCl₃.' },
    { n: 'ácido carbámico', sis: 'ácido aminometanoico', s: 'NC(=O)O', nota: 'H₂N–COOH: un ácido carboxílico con un –NH₂ en el mismo carbono.' },
    { n: 'acetofenona', sis: '1-feniletan-1-ona', alt: ['1-feniletanona'], s: 'CC(=O)c1ccccc1', nota: 'Las «-fenonas» son Ph–CO–R. Con R = metilo, acetofenona.' },
    { n: 'benzofenona', sis: 'difenilmetanona', s: 'O=C(c1ccccc1)c1ccccc1', nota: 'Ph–CO–Ph: la fenona con R = fenilo.' },
    { n: 'piperidina', hetero: true, sis: 'azinano', s: 'C1CCNCC1', nota: 'Anillo saturado de 6 con un N (como un ciclohexano con un N).' },
    { n: 'morfolina', hetero: true, sis: '1,4-oxazinano', s: 'C1COCCN1', nota: 'Anillo saturado de 6 con un O y un N enfrentados (posiciones 1 y 4).' },
    { n: 'dioxano', hetero: true, alt: ['1,4-dioxano'], sis: '1,4-dioxano', s: 'C1COCCO1', nota: 'Anillo saturado de 6 con dos O enfrentados (1,4).' },
    { n: 'piridina', hetero: true, s: 'c1ccncc1', nota: 'Como el benceno, pero con un N en el anillo.' },
    { n: 'imidazol', hetero: true, sis: '1H-1,3-diazol', s: 'c1c[nH]cn1', nota: 'Anillo aromático de 5 con dos N separados por un carbono (uno es N–H).' },
    { n: 'indol', hetero: true, s: 'c1ccc2[nH]ccc2c1', nota: 'Benceno fusionado con un pirrol.' },
    { n: 'pirrolidina', hetero: true, sis: 'azolidina', s: 'C1CCNC1', nota: 'Anillo saturado de 5 con un N (el pirrol sin dobles enlaces).' },
    { n: 'furano', hetero: true, sis: 'oxol', s: 'c1ccoc1', nota: 'Anillo aromático de 5 con un O.' },
    { n: 'pirrol', hetero: true, sis: '1H-azol', s: 'c1cc[nH]c1', nota: 'Anillo aromático de 5 con un N–H.' },
    { n: 'tiofeno', hetero: true, s: 'c1ccsc1', nota: 'Anillo aromático de 5 con un S.' },
    { n: 'acetona', sis: 'propanona', alt: ['propan-2-ona'], s: 'CC(C)=O', nota: 'CH₃–CO–CH₃: un acetilo (CH₃–CO–) unido a un metilo.' },
    { n: 'ácido acético', sis: 'ácido etanoico', s: 'CC(=O)O', nota: 'CH₃–COOH. «Acet-» = 2 carbonos.' },
    { n: 'acetato de etilo', sis: 'etanoato de etilo', s: 'CCOC(C)=O', nota: 'Éster del ácido acético con etanol: CH₃–COO–CH₂CH₃.' },
    { n: 'anhídrido acético', sis: 'anhídrido etanoico', s: 'CC(=O)OC(C)=O', nota: 'Dos acetilos unidos por un O: CH₃CO–O–COCH₃.' },
    { n: 'formaldehído', sis: 'metanal', s: 'C=O', nota: 'H₂C=O. «Form-» = 1 carbono (como en el ácido fórmico).' },
    { n: 'ácido fórmico', sis: 'ácido metanoico', s: 'OC=O', nota: 'H–COOH: el ácido carboxílico más sencillo.' },
    { n: 'formiato de metilo', alt: ['formato de metilo'], sis: 'metanoato de metilo', s: 'COC=O', nota: 'Éster del ácido fórmico con metanol: H–COO–CH₃.' },
    { n: 'DMSO', alt: ['dimetilsulfóxido', 'dimetil sulfóxido', 'sulfóxido de dimetilo'], s: 'CS(C)=O', nota: 'Dimetilsulfóxido: (CH₃)₂S=O, un disolvente.' },
    { n: 'DMF', alt: ['dimetilformamida', 'N,N-dimetilformamida'], sis: 'N,N-dimetilmetanamida', s: 'CN(C)C=O', nota: 'Dimetilformamida: H–CO–N(CH₃)₂, un disolvente.' },
    { n: 'THF', hetero: true, alt: ['tetrahidrofurano'], sis: 'oxolano', s: 'C1CCOC1', nota: 'Tetrahidrofurano: el furano sin dobles enlaces (anillo saturado de 5 con un O).' },


    // Grupos (R = resto de la molécula). Lámina de los apuntes y apuntes manuscritos.
    { n: 'acetilo', grupo: true, sis: 'etanoilo', s: '*C(C)=O', nota: 'CH₃–CO–. Aparece en acetona, ácido acético, acetato de etilo…' },
    { n: 'formilo', grupo: true, sis: 'metanoilo', s: '*C=O', nota: 'H–CO–. Aparece en formaldehído, ácido fórmico, formiato de metilo…' },
    { n: 'benzoilo', grupo: true, sis: 'bencenocarbonilo', s: '*C(=O)c1ccccc1', nota: 'Ph–CO–: un fenilo unido a un carbonilo.' },
    { n: 'fenilo', grupo: true, s: '*c1ccccc1', nota: 'C₆H₅–: un benceno unido por uno de sus carbonos (Ph).' },
    { n: 'bencilo', grupo: true, sis: 'fenilmetilo', s: '*Cc1ccccc1', nota: 'Ph–CH₂–: un fenilo con un CH₂ en medio. No confundir con fenilo.' },
    { n: 'vinilo', grupo: true, sis: 'etenilo', s: '*C=C', nota: 'CH₂=CH–.' },
    { n: 'alilo', grupo: true, sis: 'prop-2-en-1-ilo', s: '*CC=C', nota: 'CH₂=CH–CH₂–: como el vinilo, pero con un CH₂ en medio.' },
    { n: 'metileno', grupo: true, sis: 'metanodiilo', s: '*C*', nota: '–CH₂– como puente entre dos partes de la molécula. No confundir con metilideno (=CH₂).' },
    { n: 'metilideno', grupo: true, s: '*=C', nota: '=CH₂: un carbono unido al resto por un doble enlace (sufijo -ideno). No confundir con metileno (–CH₂–).' },
    { n: 'fenoxi', grupo: true, alt: ['fenoxilo'], s: '*Oc1ccccc1', nota: 'Ph–O–: un fenilo unido a través de un oxígeno (como metoxi, pero con fenilo).' },
    { n: 'isopropenilo', grupo: true, sis: 'prop-1-en-2-ilo', s: '*C(C)=C', nota: 'CH₂=C(CH₃)–: se une por el carbono central del doble enlace. No confundir con alilo.' },
    { n: 'tritilo', grupo: true, sis: 'trifenilmetilo', s: '*C(c1ccccc1)(c1ccccc1)c1ccccc1', nota: 'Ph₃C–: un carbono con tres fenilos.' },
    { n: 'isopropilo', grupo: true, sis: 'propan-2-ilo', alt: ['1-metiletilo'], s: '*C(C)C', nota: '(CH₃)₂CH–: se une por el carbono central. «Iso» = la cadena termina en (CH₃)₂CH–.' },
    { n: 'sec-butilo', grupo: true, sis: 'butan-2-ilo', alt: ['1-metilpropilo'], s: '*C(C)CC', nota: 'CH₃CH₂CH(CH₃)–: se une por un carbono secundario (con un H).' },
    { n: 'terc-butilo', grupo: true, sis: '2-metilpropan-2-ilo', alt: ['tert-butilo', 'ter-butilo', '1,1-dimetiletilo'], s: '*C(C)(C)C', nota: '(CH₃)₃C–: se une por un carbono terciario (sin H), con tres metilos.' },
    { n: 'neopentilo', grupo: true, sis: '2,2-dimetilpropilo', s: '*CC(C)(C)C', nota: '(CH₃)₃C–CH₂–: «neo» = la cadena termina en (CH₃)₃C–; se une por el CH₂.' },
    { n: 'isohexilo', grupo: true, sis: '4-metilpentilo', s: '*CCCC(C)C', nota: '(CH₃)₂CH–CH₂CH₂CH₂–: 6 C, la cadena termina en (CH₃)₂CH– («iso»).' },
  ];

  const sinFinal = (n) => n.replace(/o$/, '');
  const aceptados = (t) => [t.n, ...(t.alt || []), ...(t.grupo ? [sinFinal(t.n), ...(t.alt || []).map(sinFinal)] : [])];

  // Tipos de pregunta: escribir el nombre, dibujar, y dos de tipo test.
  const TIPOS = {
    nombrar: 'Ver estructura → escribir nombre',
    dibujar: 'Ver nombre → dibujar',
    testNombre: 'Test: ver estructura → elegir nombre',
    testEstructura: 'Test: ver nombre → elegir estructura',
  };
  const CONTENIDOS = { todo: 'Todo', moleculas: 'Solo moléculas', grupos: 'Solo grupos y radicales' };
  const ajustes = () => ({ contenido: 'todo', pregunta: 'mezcla', ...(Progreso.pref('triviales') || {}) });

  function ejercicios() {
    const a = ajustes();
    const items = TRIVIALES.filter((t) => a.contenido === 'todo' || (a.contenido === 'grupos') === !!t.grupo);
    const tipos = a.pregunta === 'mezcla' ? Object.keys(TIPOS) : [a.pregunta];
    // Los grupos no se dibujan (llevan R): se preguntan en los otros formatos.
    return items.flatMap((t) => tipos.filter((tipo) => !(t.grupo && tipo === 'dibujar')).map((tipo) => ({ t, tipo })));
  }
  const clave = (x) => `trivial:${x.tipo}:${x.t.n}`;
  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  const barajar = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  };

  function preparar(t) {
    if (!t._g) {
      t._g = Quimica.grafoDeSmiles(t.s);
      t._can = Quimica.canonico(t.s);
    }
    return t;
  }

  // Corrección de un nombre escrito (también la usa el repaso general).
  function evaluarNombre(t, texto, esc) {
    const resp = Nombre.normalizar(texto);
    if (!resp) return { aviso: 'Escribe un nombre.' };
    if (aceptados(t).some((x) => Nombre.normalizar(x) === resp)) return { ok: true, html: '<b>¡Correcto!</b>' };
    if (t.sis && Nombre.normalizar(t.sis) === resp) {
      return { aviso: 'Ese es su nombre <b>sistemático</b>, y es correcto, pero aquí se pide el <b>trivial</b>. Inténtalo otra vez.' };
    }
    const otro = TRIVIALES.find((x) => x !== t && aceptados(x).some((a) => Nombre.normalizar(a) === resp));
    return { ok: false, html: `<b>Todavía no.</b>${otro ? ` «${esc(otro.n)}» es ${otro.grupo ? 'otro grupo' : 'otra molécula'} de la lista: ${esc(otro.nota)}` : ''}` };
  }

  function ficha(ctx, t, titulo) {
    const sis = t.sis && Nombre.normalizar(t.sis) !== Nombre.normalizar(t.n) ? `<p>Nombre sistemático: <b>${ctx.esc(t.sis)}</b></p>` : '';
    const caja = ctx.explicacion(`
      <h2>${ctx.esc(titulo)}</h2>
      <div class="figura-marco"><svg id="ficha-trivial" class="figura"></svg></div>
      <p class="nombre-mini">${ctx.esc(t.n)}${t.grupo ? ' <small>(R = resto de la molécula)</small>' : ''}</p>
      ${sis}
      <p class="nota">${ctx.esc(t.nota)}</p>`);
    Quimica.pintarEn(caja.querySelector('#ficha-trivial'), preparar(t)._g, { S: 40 });
  }

  function terminar(ctx, ok) {
    const e = ctx.est;
    if (e.terminado) return;
    e.terminado = true;
    ctx.registrar(clave(e.x), null, ok && e.intentos === 0, null, false);
    ctx.botones({ comprobar: 'Siguiente →', pista: false, solucion: false, siguiente: false });
  }

  function mostrarRespuesta(ctx) {
    const e = ctx.est;
    terminar(ctx, false);
    if (e.opciones) pintarOpciones(ctx, null);
    ctx.feedback(e.x.tipo === 'dibujar' ? 'Aquí tienes la estructura: compárala con la tuya.' : `Es <b>${ctx.esc(e.x.t.n)}</b>.`, 'aviso');
    ficha(ctx, e.x.t, 'Respuesta');
  }

  // Tres distractores del mismo tipo (moléculas con moléculas, grupos con grupos).
  function distractores(t) {
    return barajar(TRIVIALES.filter((x) => x !== t && !!x.grupo === !!t.grupo)).slice(0, 3);
  }

  function pintarOpciones(ctx, elegida) {
    const e = ctx.est;
    const conDibujo = e.x.tipo === 'testEstructura';
    ctx.$('#z-opciones').innerHTML = `<div class="${conDibujo ? 'opciones-dibujo' : 'opciones-error'}">${e.opciones.map((t, k) => {
      let cls = '';
      if (e.terminado && t === e.x.t) cls = 'correcta';
      else if (e.terminado && k === elegida) cls = 'incorrecta';
      return `<button class="opcion ${cls}" data-opcion="${k}" ${e.terminado ? 'disabled' : ''}>
        ${conDibujo ? `<svg class="figura" data-k="${k}"></svg>` : ''}<span>${conDibujo && !e.terminado ? `Opción ${'ABCD'[k]}` : ctx.esc(t.n)}</span></button>`;
    }).join('')}</div>`;
    if (conDibujo) {
      ctx.$('#z-opciones').querySelectorAll('svg[data-k]').forEach((svg) => {
        Quimica.pintarEn(svg, ctx.orientar(preparar(e.opciones[+svg.dataset.k])._g), { S: 28, margen: 0.7 });
      });
    }
  }

  function pintarAjustes(ctx) {
    const a = ajustes();
    const sel = (nombre, opciones, valor) => `<select data-ajuste="${nombre}">${Object.entries(opciones)
      .map(([k, v]) => `<option value="${k}" ${k === valor ? 'selected' : ''}>${v}</option>`).join('')}</select>`;
    ctx.ajustes(`<label>Contenido ${sel('contenido', CONTENIDOS, a.contenido)}</label>
      <label>Pregunta ${sel('pregunta', { mezcla: 'Mezcla de todo', ...TIPOS }, a.pregunta)}</label>`);
  }

  MODOS.triviales = {
    niveles: false,
    TRIVIALES,
    preparar,
    evaluarNombre,
    ficha,

    nuevo(ctx) {
      const e = ctx.est;
      pintarAjustes(ctx);
      e.x = ctx.elegir(ejercicios(), clave);
      const t = preparar(e.x.t);
      e.terminado = false;
      e.intentos = 0;
      e.nPistas = 0;
      e.opciones = null;
      const tema = t.grupo ? 'Grupos y radicales' : 'Nombres triviales';
      ctx.botones({ comprobar: 'Comprobar', pista: 'Pista', solucion: 'Ver respuesta', siguiente: 'Saltar →' });
      if (e.x.tipo === 'dibujar') {
        ctx.zonas(['editor']);
        ctx.enunciado(tema, 'Dibuja la estructura de', ctx.esc(t.n));
        ctx.editor.reiniciar();
      } else if (e.x.tipo === 'nombrar') {
        ctx.zonas(['figura', 'respuesta']);
        ctx.enunciado(tema, t.grupo ? '¿Cómo se llama este grupo? (R = resto de la molécula; no forma parte del nombre)' : '¿Cuál es su nombre trivial?');
        ctx.respuesta('');
        ctx.pintarFigura(ctx.orientar(t._g));
      } else {
        e.opciones = barajar([t, ...distractores(t)]);
        ctx.botones({ comprobar: false, pista: false });
        if (e.x.tipo === 'testNombre') {
          ctx.zonas(['figura', 'opciones']);
          ctx.enunciado(tema, `Elige el nombre correcto${t.grupo ? ' (R = resto de la molécula)' : ''}`);
          ctx.pintarFigura(ctx.orientar(t._g));
        } else {
          ctx.zonas(['opciones']);
          ctx.enunciado(tema, 'Elige la estructura que corresponde a este nombre', ctx.esc(t.n));
        }
        pintarOpciones(ctx, null);
      }
    },

    // Respuesta de tipo test: un único intento.
    opcion(ctx, valor) {
      const e = ctx.est;
      if (!e.opciones || e.terminado) return;
      const k = +valor;
      const ok = e.opciones[k] === e.x.t;
      ctx.intento(ok);
      if (!ok) Progreso.anotarError('triviales');
      terminar(ctx, ok);
      pintarOpciones(ctx, k);
      ctx.feedback(ok ? '<b>¡Correcto!</b>' : `<b>No.</b> Era <b>${ctx.esc(e.x.t.n)}</b>; elegiste ${ctx.esc(e.opciones[k].n)}: ${ctx.esc(e.opciones[k].nota)}`, ok ? 'bien' : 'mal');
      ficha(ctx, e.x.t, ok ? 'Para recordarlo' : 'Respuesta');
    },

    comprobar(ctx) {
      const e = ctx.est;
      const t = e.x.t;
      if (e.terminado) { ctx.nuevo(); return; }
      if (e.opciones) return;
      let r;
      if (e.x.tipo === 'dibujar') {
        r = MODOS.evaluar.dibujo({ n: t.n, s: t.s, _g: t._g, _can: t._can }, ctx.editor.grafo());
        if (r.ok) r.html = `<b>¡Correcto!</b> Es la estructura de ${ctx.esc(t.n)}.`;
      } else {
        r = evaluarNombre(t, ctx.respuesta(), ctx.esc);
      }
      if (r.aviso) { ctx.feedback(r.aviso, 'aviso'); return; }
      ctx.intento(r.ok);
      if (r.ok) {
        const extra = e.intentos ? ` <span class="intentos">(al ${e.intentos + 1}.º intento)</span>` : '';
        terminar(ctx, true);
        ctx.feedback(r.html + extra, 'bien');
        ficha(ctx, t, 'Para recordarlo');
        return;
      }
      e.intentos++;
      Progreso.anotarError('triviales');
      ctx.feedback(`${r.html}<div class="fb-acciones"><button class="btn-explicar" data-explicar>Ver la respuesta</button><span>o vuelve a intentarlo</span></div>`, 'mal');
    },

    explicar(ctx) { mostrarRespuesta(ctx); },

    solucion(ctx) {
      const e = ctx.est;
      if (!e.terminado && e.intentos === 0) ctx.intento(false);
      mostrarRespuesta(ctx);
    },

    pista(ctx) {
      const e = ctx.est;
      const t = e.x.t;
      e.nPistas++;
      if (e.x.tipo === 'dibujar') {
        if (e.nPistas === 1) ctx.pista(t.sis ? `Su nombre sistemático es <b>${ctx.esc(t.sis)}</b>.` : ctx.esc(t.nota));
        else { ctx.pista(ctx.esc(t.nota)); ctx.botones({ pista: false }); }
        if (t.hetero && e.nPistas === 1) {
          ctx.pista('Para poner un N, O o S dentro de un anillo, dibuja el anillo y usa la herramienta «⇄ C/N/O/S» sobre el átomo.');
        }
      } else if (e.nPistas === 1) {
        ctx.pista(`Empieza por «${ctx.esc(t.n.slice(0, 3))}…» (${t.n.replace(/\s/g, '').length} letras).`);
      } else {
        ctx.pista(t.sis ? `Su nombre sistemático es ${ctx.esc(t.sis)}. ${ctx.esc(t.nota)}` : ctx.esc(t.nota));
        ctx.botones({ pista: false });
      }
    },

    ajuste(ctx, nombre, valor) {
      Progreso.pref('triviales', { ...ajustes(), [nombre]: valor });
      ctx.nuevo();
    },

    siguiente(ctx) {
      const e = ctx.est;
      if (!e.terminado && e.intentos > 0) terminar(ctx, false);
      ctx.nuevo();
    },
  };
})();
