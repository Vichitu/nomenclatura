// «Nombres triviales»: las moléculas y grupos de la lámina «Algunos nombres
// triviales» de los apuntes (pág. 39). Se practican en los dos sentidos:
// nombre trivial → dibujo, y dibujo → nombre trivial.
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
    { n: 'fenol', sis: 'bencenol', s: 'Oc1ccccc1', nota: 'Benceno con un –OH.' },
    { n: 'anilina', sis: 'bencenamina', s: 'Nc1ccccc1', nota: 'Benceno con un –NH₂.' },
    { n: 'ácido benzoico', sis: 'ácido bencenocarboxílico', s: 'OC(=O)c1ccccc1', nota: 'Benceno con un –COOH.' },
    { n: 'acetileno', sis: 'etino', s: 'C#C', nota: 'H–C≡C–H: el alquino más sencillo.' },
    { n: 'acetonitrilo', sis: 'etanonitrilo', s: 'CC#N', nota: 'CH₃–C≡N. «Acet-» indica 2 carbonos (como en el ácido acético).' },
    { n: 'etileno', sis: 'eteno', s: 'C=C', nota: 'H₂C=CH₂: el alqueno más sencillo.' },
    { n: 'diclorometano', alt: ['cloruro de metileno'], s: 'ClCCl', nota: 'CH₂Cl₂, un disolvente muy usado (también «cloruro de metileno»).' },
    { n: 'cloroformo', sis: 'triclorometano', s: 'ClC(Cl)Cl', nota: 'CHCl₃.' },
    { n: 'ácido carbámico', sis: 'ácido aminometanoico', s: 'NC(=O)O', nota: 'H₂N–COOH: un ácido carboxílico con un –NH₂ en el mismo carbono.' },
    { n: 'acetofenona', sis: '1-feniletan-1-ona', s: 'CC(=O)c1ccccc1', nota: 'Las «-fenonas» son Ph–CO–R. Con R = metilo, acetofenona.' },
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
    { n: 'acetona', sis: 'propanona', s: 'CC(C)=O', nota: 'CH₃–CO–CH₃: un acetilo (CH₃–CO–) unido a un metilo.' },
    { n: 'ácido acético', sis: 'ácido etanoico', s: 'CC(=O)O', nota: 'CH₃–COOH. «Acet-» = 2 carbonos.' },
    { n: 'acetato de etilo', sis: 'etanoato de etilo', s: 'CCOC(C)=O', nota: 'Éster del ácido acético con etanol: CH₃–COO–CH₂CH₃.' },
    { n: 'anhídrido acético', sis: 'anhídrido etanoico', s: 'CC(=O)OC(C)=O', nota: 'Dos acetilos unidos por un O: CH₃CO–O–COCH₃.' },
    { n: 'formaldehído', sis: 'metanal', s: 'C=O', nota: 'H₂C=O. «Form-» = 1 carbono (como en el ácido fórmico).' },
    { n: 'ácido fórmico', sis: 'ácido metanoico', s: 'OC=O', nota: 'H–COOH: el ácido carboxílico más sencillo.' },
    { n: 'formiato de metilo', alt: ['formato de metilo'], sis: 'metanoato de metilo', s: 'COC=O', nota: 'Éster del ácido fórmico con metanol: H–COO–CH₃.' },
    { n: 'DMSO', alt: ['dimetilsulfóxido', 'dimetil sulfóxido', 'sulfóxido de dimetilo'], sis: 'dimetilsulfóxido', s: 'CS(C)=O', nota: 'Dimetilsulfóxido: (CH₃)₂S=O, un disolvente.' },
    { n: 'DMF', alt: ['dimetilformamida', 'N,N-dimetilformamida'], sis: 'N,N-dimetilmetanamida', s: 'CN(C)C=O', nota: 'Dimetilformamida: H–CO–N(CH₃)₂, un disolvente.' },
    { n: 'THF', hetero: true, alt: ['tetrahidrofurano'], sis: 'oxolano', s: 'C1CCOC1', nota: 'Tetrahidrofurano: el furano sin dobles enlaces (anillo saturado de 5 con un O).' },

    // Grupos (R = resto de la molécula)
    { n: 'acetilo', grupo: true, sis: 'etanoilo', s: '*C(C)=O', nota: 'CH₃–CO–. Aparece en acetona, ácido acético, acetato de etilo…' },
    { n: 'formilo', grupo: true, sis: 'metanoilo', s: '*C=O', nota: 'H–CO–. Aparece en formaldehído, ácido fórmico, formiato de metilo…' },
    { n: 'benzoilo', grupo: true, sis: 'bencenocarbonilo', s: '*C(=O)c1ccccc1', nota: 'Ph–CO–: un fenilo unido a un carbonilo.' },
    { n: 'fenilo', grupo: true, s: '*c1ccccc1', nota: 'C₆H₅–: un benceno unido por uno de sus carbonos (Ph).' },
    { n: 'bencilo', grupo: true, sis: 'fenilmetilo', s: '*Cc1ccccc1', nota: 'Ph–CH₂–: un fenilo con un CH₂ en medio. No confundir con fenilo.' },
    { n: 'vinilo', grupo: true, sis: 'etenilo', s: '*C=C', nota: 'CH₂=CH–.' },
    { n: 'alilo', grupo: true, sis: 'prop-2-en-1-ilo', s: '*CC=C', nota: 'CH₂=CH–CH₂–: como el vinilo, pero con un CH₂ en medio.' },
    { n: 'metileno', grupo: true, sis: 'metanodiilo', s: '*C*', nota: '–CH₂– como puente entre dos partes de la molécula. Unido por doble enlace (=CH₂) se llama metilideno.' },
  ];

  const sinFinal = (n) => n.replace(/o$/, '');
  const aceptados = (t) => [t.n, ...(t.alt || []), ...(t.grupo ? [sinFinal(t.n), ...(t.alt || []).map(sinFinal)] : [])];

  // Cada molécula se pregunta en los dos sentidos (los grupos, solo dibujo → nombre).
  const EJERCICIOS = TRIVIALES.flatMap((t) => (t.grupo ? [{ t, tipo: 'nombrar' }] : [{ t, tipo: 'dibujar' }, { t, tipo: 'nombrar' }]));
  const clave = (x) => `trivial:${x.tipo}:${x.t.n}`;

  function preparar(t) {
    if (!t._g) {
      t._g = Quimica.grafoDeSmiles(t.s);
      t._can = Quimica.canonico(t.s);
    }
    return t;
  }

  function ficha(ctx, t, titulo) {
    const sis = t.sis && Nombre.normalizar(t.sis) !== Nombre.normalizar(t.n) ? `<p>Nombre sistemático: <b>${ctx.esc(t.sis)}</b></p>` : '';
    const caja = ctx.explicacion(`
      <h2>${ctx.esc(titulo)}</h2>
      <div class="figura-marco"><svg id="ficha-trivial" class="figura"></svg></div>
      <p class="nombre-mini">${ctx.esc(t.n)}${t.grupo ? ' <small>(R = resto de la molécula)</small>' : ''}</p>
      ${sis}
      <p class="nota">${ctx.esc(t.nota)}</p>`);
    Quimica.pintarEn(caja.querySelector('#ficha-trivial'), t._g, { S: 40 });
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
    ctx.feedback(e.x.tipo === 'nombrar' ? `Es <b>${ctx.esc(e.x.t.n)}</b>.` : 'Aquí tienes la estructura: compárala con la tuya.', 'aviso');
    ficha(ctx, e.x.t, 'Respuesta');
  }

  MODOS.triviales = {
    niveles: false,
    TRIVIALES,

    nuevo(ctx) {
      const e = ctx.est;
      e.x = ctx.elegir(EJERCICIOS, clave);
      preparar(e.x.t);
      e.terminado = false;
      e.intentos = 0;
      e.nPistas = 0;
      ctx.botones({ comprobar: 'Comprobar', pista: 'Pista', solucion: 'Ver respuesta', siguiente: 'Saltar →' });
      if (e.x.tipo === 'dibujar') {
        ctx.zonas(['editor']);
        ctx.enunciado('Nombres triviales', 'Dibuja la estructura de', ctx.esc(e.x.t.n));
        ctx.editor.reiniciar();
      } else {
        ctx.zonas(['figura', 'respuesta']);
        ctx.enunciado('Nombres triviales', e.x.t.grupo ? '¿Cómo se llama este grupo? (R = resto de la molécula)' : '¿Cuál es su nombre trivial?');
        ctx.respuesta('');
        ctx.pintarFigura(ctx.orientar(e.x.t._g));
      }
    },

    comprobar(ctx) {
      const e = ctx.est;
      const t = e.x.t;
      if (e.terminado) { ctx.nuevo(); return; }
      let ok = false;
      let html = '';
      if (e.x.tipo === 'dibujar') {
        const r = MODOS.evaluar.dibujo({ n: t.n, s: t.s, _g: t._g, _can: t._can }, ctx.editor.grafo());
        if (r.aviso) { ctx.feedback(r.aviso, 'aviso'); return; }
        ok = r.ok;
        html = ok ? `<b>¡Correcto!</b> Es la estructura de ${ctx.esc(t.n)}.` : r.html;
      } else {
        const resp = Nombre.normalizar(ctx.respuesta());
        if (!resp) { ctx.feedback('Escribe un nombre.', 'aviso'); return; }
        if (aceptados(t).some((x) => Nombre.normalizar(x) === resp)) {
          ok = true;
          html = '<b>¡Correcto!</b>';
        } else if (t.sis && Nombre.normalizar(t.sis) === resp) {
          ctx.feedback(`Ese es su nombre <b>sistemático</b>, y es correcto, pero aquí se pide el <b>trivial</b>. Inténtalo otra vez.`, 'aviso');
          return;
        } else {
          const otro = TRIVIALES.find((x) => x !== t && aceptados(x).some((a) => Nombre.normalizar(a) === resp));
          html = `<b>Todavía no.</b>${otro ? ` «${ctx.esc(otro.n)}» es ${otro.grupo ? "otro grupo" : "otra molécula"} de la lista: ${ctx.esc(otro.nota)}` : ''}`;
        }
      }
      ctx.intento(ok);
      if (ok) {
        const extra = e.intentos ? ` <span class="intentos">(al ${e.intentos + 1}.º intento)</span>` : '';
        terminar(ctx, true);
        ctx.feedback(html + extra, 'bien');
        ficha(ctx, t, 'Para recordarlo');
        return;
      }
      e.intentos++;
      Progreso.anotarError('triviales');
      ctx.feedback(`${html}<div class="fb-acciones"><button class="btn-explicar" data-explicar>Ver la respuesta</button><span>o vuelve a intentarlo</span></div>`, 'mal');
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

    siguiente(ctx) {
      const e = ctx.est;
      if (!e.terminado && e.intentos > 0) terminar(ctx, false);
      ctx.nuevo();
    },
  };
})();
