// «Grupos funcionales»: prioridad, prefijos y sufijos (apuntes, pág. 16).
// Ejercicios: comparar dos grupos, ordenar cuatro, elegir la terminación del grupo
// principal, elegir el prefijo de un grupo secundario y nombrar moléculas
// polifuncionales eligiendo entre cuatro nombres.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  // r: número de prioridad de la tabla de los apuntes (anhídrido y éster comparten el 7).
  const GRUPOS = [
    { n: 'Sal de ácido', f: 'R–COO⁻ Y⁺', r: 4, pre: null, suf: '«…ato de Y»', det: 'Las sales de ácido van por delante de los propios ácidos carboxílicos.' },
    { n: 'Ácido carboxílico', f: '–COOH', r: 5, pre: 'carboxi-', suf: '«ácido …oico» (o «ácido …carboxílico»)', det: '«-carboxílico» se usa cuando el carbono del grupo no puede contarse en la cadena (por ejemplo, unido a un anillo).' },
    { n: 'Ácido sulfónico', f: '–SO₃H', r: 6, pre: 'sulfo-', suf: '«ácido …sulfónico»', det: 'Contiene azufre: R–S(=O)₂–OH.' },
    { n: 'Anhídrido', f: '–CO–O–CO–', r: 7, pre: null, suf: '«anhídrido …oico» (sin sufijo propio)', det: 'Se nombra con la palabra «anhídrido» delante, como el anhídrido acético.' },
    { n: 'Éster', f: '–COO–R', r: 7, pre: 'alcoxicarbonil- (metoxicarbonil-…)', suf: '«…oato de R» (o «…carboxilato de R»)', det: 'Tiene la misma prioridad que el anhídrido en la tabla de los apuntes.' },
    { n: 'Haluro de ácido', f: '–COX', r: 8, pre: 'haloformil-', suf: '«haluro de …oilo» (o «haluro de …carbonilo»)', det: 'X es un halógeno: cloruro de acetilo, bromuro de benzoilo…' },
    { n: 'Amida', f: '–CONH₂', r: 9, pre: 'carbamoil-', suf: '«…amida» (o «…carboxamida»)', det: 'No confundir amida (–CONH₂) con amina (–NH₂).' },
    { n: 'Nitrilo', f: '–C≡N', r: 10, pre: 'ciano-', suf: '«…nitrilo» (o «…carbonitrilo»)', det: 'Con «-nitrilo», el carbono del C≡N cuenta en la cadena; como prefijo «ciano-» lo incluye.' },
    { n: 'Aldehído', f: '–CHO', r: 11, pre: 'oxo- / formil-', suf: '«…al» (o «…carbaldehído»)', det: '«oxo-» si su carbono está en la cadena; «formil-» si no lo está.' },
    { n: 'Cetona', f: 'C=O (interna)', r: 12, pre: 'oxo-', suf: '«…ona»', det: 'Carbonilo entre dos carbonos.' },
    { n: 'Alcohol', f: '–OH', r: 13, pre: 'hidroxi-', suf: '«…ol»', det: 'En los apuntes aparece como «hidroxilo».' },
    { n: 'Tiol', f: '–SH', r: 15, pre: 'sulfanil- (mercapto-)', suf: '«…tiol»', det: 'El análogo con azufre del alcohol.' },
    { n: 'Hidroperóxido', f: '–O–OH', r: 16, pre: 'hidroperoxi-', suf: null, det: 'En la tabla no tiene sufijo: solo se nombra como prefijo.' },
    { n: 'Amina', f: '–NH₂', r: 17, pre: 'amino-', suf: '«…amina»', det: 'Por debajo del alcohol: en el 2-aminoetan-1-ol manda el –OH.' },
    { n: 'Imina', f: 'C=NH', r: 18, pre: 'imino-', suf: '«…imina»', det: 'Doble enlace carbono–nitrógeno.' },
    { n: 'Éter', f: '–O–R', r: 19, pre: 'alcoxi- (metoxi-, etoxi-…)', suf: null, det: 'Sin sufijo: en nomenclatura sustitutiva siempre es prefijo.' },
    { n: 'Tioéter', f: '–S–R', r: 20, pre: 'alquiltio- (metiltio-…)', suf: null, det: 'El análogo con azufre del éter.' },
    { n: 'Peróxido', f: '–O–O–R', r: 21, pre: 'peroxi-', suf: null, det: 'Sin sufijo en la tabla.' },
    { n: 'Halógeno', f: '–X', r: 22, pre: 'halo- (fluoro-, cloro-, bromo-, yodo-)', suf: null, det: 'Sin sufijo: siempre es prefijo.' },
    { n: 'Nitro', f: '–NO₂', r: 23, pre: 'nitro-', suf: null, det: 'Sin sufijo: siempre es prefijo.' },
  ];
  const SIN_SUFIJO = 'No tiene sufijo: solo se nombra como prefijo';

  // Moléculas polifuncionales para nombrar eligiendo entre cuatro nombres.
  const MOLECULAS_GF = [
    { s: 'OCC(=O)O', f: 'HO–CH₂–COOH', n: 'ácido 2-hidroxietanoico', ops: ['2-carboxietan-1-ol', 'etano-1,2-diol', 'ácido 2-oxoetanoico'], por: 'El ácido carboxílico es el principal («ácido …oico»); el –OH pasa a prefijo «hidroxi-».' },
    { s: 'CC(N)C(=O)O', f: 'CH₃–CH(NH₂)–COOH', n: 'ácido 2-aminopropanoico', ops: ['2-carboxipropan-1-amina', '2-aminopropan-1-ol', 'ácido 2-iminopropanoico'], por: 'El –COOH da «ácido propanoico»; el –NH₂ se cita como «amino-».' },
    { s: 'CC(=O)CC(=O)O', f: 'CH₃–CO–CH₂–COOH', n: 'ácido 3-oxobutanoico', ops: ['butano-2,4-diona', '3-hidroxibutanona', 'ácido 2-oxobutanoico'], por: 'El –COOH es el principal y su carbono es el C1; la cetona en C3 es «oxo-».' },
    { s: 'CC(O)C=O', f: 'CH₃–CH(OH)–CHO', n: '2-hidroxipropanal', ops: ['propano-1,2-diol', '2-oxopropan-1-ol', '2-hidroxipropanona'], por: 'El aldehído manda sobre el alcohol: «propanal» con el prefijo «2-hidroxi-».' },
    { s: 'COCCO', f: 'CH₃–O–CH₂–CH₂–OH', n: '2-metoxietan-1-ol', ops: ['1-hidroxi-2-metoxietano', 'metoxipropanona', 'metoxietanal'], trampa: { '1-hidroxi-2-metoxietano': 'el –OH es el grupo principal y debe ir como sufijo (-ol), no como prefijo' }, por: 'El alcohol da el sufijo «-ol»; el éter CH₃O– se nombra «metoxi-».' },
    { s: 'ClCCCO', f: 'Cl–CH₂–CH₂–CH₂–OH', n: '3-cloropropan-1-ol', ops: ['1-cloropropan-3-ol', '3-hidroxipropilcloruro', 'cloropropanal'], trampa: { '1-cloropropan-3-ol': 'está mal numerada: el –OH (grupo principal) debe llevar el localizador más bajo' }, por: 'El –OH fija el localizador 1 y el sufijo «-ol»; el cloro va como prefijo.' },
    { s: 'NCCO', f: 'H₂N–CH₂–CH₂–OH', n: '2-aminoetan-1-ol', ops: ['2-hidroxietan-1-amina', 'etano-1,2-diamina', 'aminoetanona'], trampa: { '2-hidroxietan-1-amina': 'el alcohol tiene más prioridad que la amina, así que el sufijo debe ser -ol' }, por: 'El alcohol tiene más prioridad que la amina: «-ol» y prefijo «amino-».' },
    { s: 'N#CCC(=O)O', f: 'N≡C–CH₂–COOH', n: 'ácido 2-cianoetanoico', ops: ['3-oxopropanonitrilo', 'ácido 2-aminopropanoico', '2-cianoetan-1-ol'], por: 'El ácido es el principal; el –C≡N, secundario, se nombra «ciano-».' },
    { s: 'CC(=O)CCO', f: 'CH₃–CO–CH₂–CH₂–OH', n: '4-hidroxibutan-2-ona', ops: ['3-oxobutan-1-ol', 'butano-1,3-diol', '2-hidroxibutan-4-ona'], trampa: { '3-oxobutan-1-ol': 'la cetona tiene más prioridad que el alcohol, así que el sufijo debe ser -ona', '2-hidroxibutan-4-ona': 'está mal numerada: la cetona (grupo principal) debe llevar el localizador más bajo' }, por: 'La cetona manda sobre el alcohol: «-ona»; el –OH es «hidroxi-».' },
    { s: 'NC(=O)CC(C)=O', f: 'H₂N–CO–CH₂–CO–CH₃', n: '3-oxobutanamida', ops: ['butano-1,3-diona', '3-hidroxibutanamida', '2-oxobutanamida'], por: 'La amida es la principal: «-amida»; la cetona en C3 queda como «oxo-».' },
    { s: 'CC(O)CC(=O)O', f: 'CH₃–CH(OH)–CH₂–COOH', n: 'ácido 3-hidroxibutanoico', ops: ['ácido 2-hidroxibutanoico', 'butano-1,3-diol', '3-carboxibutan-2-ol'], por: 'El –COOH es el C1; el –OH queda en C3 como «hidroxi-».' },
    { s: 'O=CCC(=O)O', f: 'OHC–CH₂–COOH', n: 'ácido 3-oxopropanoico', ops: ['ácido 2-formiletanoico', '3-hidroxipropanal', 'ácido 3-hidroxipropanoico'], trampa: { 'ácido 2-formiletanoico': 'la cadena principal debe incluir el carbono del –CHO (es más larga), y entonces se nombra «oxo-»' }, por: 'El ácido manda sobre el aldehído; como el carbono del –CHO está en la cadena, se nombra «oxo-».' },
    { s: 'CC(Br)C(=O)O', f: 'CH₃–CH(Br)–COOH', n: 'ácido 2-bromopropanoico', ops: ['bromopropanal', 'ácido 3-bromopropanoico', '2-carboxipropilbromuro'], por: 'El –COOH da el nombre; el bromo es un prefijo en C2.' },
    { s: 'CC(S)C(=O)O', f: 'CH₃–CH(SH)–COOH', n: 'ácido 2-sulfanilpropanoico', ops: ['ácido 2-hidroxipropanoico', 'propano-2-tiol', 'ácido propanotioico'], por: 'El ácido es el principal; el –SH secundario se nombra «sulfanil-».' },
    { s: 'COCC(=O)O', f: 'CH₃–O–CH₂–COOH', n: 'ácido 2-metoxietanoico', ops: ['ácido 1-metoxietanoico', '2-hidroxietanoato de metilo', 'metoxietanal'], por: 'Ácido principal; el éter se cita como «metoxi-» en C2.' },
    { s: 'NCCC=O', f: 'H₂N–CH₂–CH₂–CHO', n: '3-aminopropanal', ops: ['propano-1,3-diamina', '3-hidroxipropanal', '3-formilpropanamina'], por: 'El aldehído es el principal (C1); el –NH₂ queda en C3 como «amino-».' },
    { s: 'CC(C(=O)O)[N+](=O)[O-]', f: 'CH₃–CH(NO₂)–COOH', n: 'ácido 2-nitropropanoico', ops: ['2-nitropropan-1-ol', 'ácido 3-nitropropanoico', 'nitropropanal'], por: 'El nitro nunca es sufijo: siempre prefijo «nitro-».' },
    { s: 'CC(=O)CC#N', f: 'CH₃–CO–CH₂–C≡N', n: '3-oxobutanonitrilo', ops: ['2-oxobutanonitrilo', '4-cianobutan-2-ona', 'butano-1,3-diona'], por: 'El nitrilo manda sobre la cetona: «-nitrilo» (su carbono es el C1) y «oxo-» en C3.' },
    { s: 'CCS(=O)(=O)O', f: 'CH₃–CH₂–SO₃H', n: 'ácido etanosulfónico', ops: ['ácido etanoico', 'etanotiol', 'etanoato de hidrógeno'], por: 'Grupo principal: ácido sulfónico, «ácido …sulfónico».' },
    { s: 'CC(N)=O', f: 'CH₃–CO–NH₂', n: 'etanamida', ops: ['etanamina', 'etanonitrilo', 'etanoato'], por: 'Es una amida (–CONH₂), no una amina: «-amida».' },
  ];

  const TIPOS = {
    comparar: '¿Cuál tiene más prioridad?',
    ordenar: 'Ordenar cuatro grupos',
    sufijo: 'Terminación del grupo principal',
    prefijo: 'Prefijo del grupo secundario',
    nombrar: 'Nombrar moléculas',
  };
  const ajustes = () => ({ tipo: 'mezcla', ...(Progreso.pref('grupos') || {}) });

  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  const barajar = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  };
  const sufijo = (g) => g.suf || SIN_SUFIJO;

  function tabla() {
    return `<h2>Tabla de prioridades (apuntes, pág. 16)</h2>
      <p class="ayuda">De mayor a menor prioridad. El de mayor prioridad es el grupo principal: va como sufijo. Los demás, como prefijos.</p>
      <table class="tabla-grupos"><thead><tr><th>Grupo</th><th>Como prefijo</th><th>Como sufijo</th></tr></thead><tbody>
      ${GRUPOS.map((g) => `<tr><td><b>${g.n}</b><br><small>${g.f}</small></td><td>${g.pre || '—'}</td><td>${g.suf || '—'}</td></tr>`).join('')}
      </tbody></table>`;
  }

  // ───────── Preparación de cada tipo de ejercicio ─────────
  function preguntaComparar(ctx, e) {
    let a, b;
    do { [a, b] = barajar(GRUPOS).slice(0, 2); } while (a.r === b.r);
    e.ops = [a, b].map((g) => ({ texto: `<b>${g.n}</b><code>${g.f}</code>`, ok: g.r === Math.min(a.r, b.r), g }));
    const mayor = a.r < b.r ? a : b, menor = a.r < b.r ? b : a;
    e.porque = `${mayor.n} tiene más prioridad que ${menor.n.toLowerCase()}. Si están los dos, ${mayor.suf ? `el nombre lleva el sufijo de ${mayor.n.toLowerCase()}, ${mayor.suf},` : `${mayor.n.toLowerCase()} manda,`} y ${menor.n.toLowerCase()} se nombra como prefijo${menor.pre ? ` «${menor.pre}»` : ''}.`;
    ctx.enunciado('Grupos funcionales', '¿Cuál de los dos grupos tiene MÁS prioridad?', 'Compara');
  }

  function preguntaSufijo(ctx, e) {
    const g = azar(GRUPOS.filter((x) => x.n !== 'Sal de ácido'));
    const otras = barajar([...new Set(GRUPOS.map(sufijo).filter((s) => s !== sufijo(g)))]).slice(0, 3);
    e.ops = barajar([sufijo(g), ...otras]).map((s) => ({ texto: s, ok: s === sufijo(g) }));
    e.porque = `${g.n} (${g.f}) como grupo principal: ${g.suf || 'no tiene sufijo; solo se nombra como prefijo'}. ${g.det}`;
    ctx.enunciado('Grupos funcionales', `Si «${g.n}» es el grupo principal, ¿cómo termina el nombre?`, `${g.n} <small class="contador">${g.f}</small>`);
  }

  function preguntaPrefijo(ctx, e) {
    const g = azar(GRUPOS.filter((x) => x.pre));
    const otras = barajar([...new Set(GRUPOS.filter((x) => x.pre && x.pre !== g.pre).map((x) => x.pre))]).slice(0, 3);
    e.ops = barajar([g.pre, ...otras]).map((p) => ({ texto: p, ok: p === g.pre }));
    e.porque = `${g.n} (${g.f}) como grupo secundario se nombra «${g.pre}». ${g.det}`;
    ctx.enunciado('Grupos funcionales', `Si «${g.n}» NO es el grupo principal, ¿qué prefijo lleva?`, `${g.n} <small class="contador">${g.f}</small>`);
  }

  function preguntaNombrar(ctx, e) {
    const m = ctx.elegir(MOLECULAS_GF, (x) => `grupos:nombrar:${x.n}`);
    if (!m._g) m._g = Quimica.grafoDeSmiles(m.s);
    e.ops = barajar([m.n, ...m.ops]).map((n) => ({ texto: n, ok: n === m.n }));
    e.porque = m.por;
    e.mol = m;
    ctx.zonas(['figura', 'opciones']);
    ctx.enunciado('Grupos funcionales', `¿Cómo se llama esta molécula? (${m.f})`);
    ctx.pintarFigura(ctx.orientar(m._g));
  }

  function pintarOpciones(ctx, elegida) {
    const e = ctx.est;
    ctx.$('#z-opciones').innerHTML = `<div class="opciones-error ${e.tipo === 'comparar' ? 'opciones-par' : ''}">${e.ops.map((o, k) => {
      let cls = '';
      if (e.respondido && o.ok) cls = 'correcta';
      else if (e.respondido && k === elegida) cls = 'incorrecta';
      const etiqueta = e.tipo === 'comparar' ? `<span class="fxLetra">${'AB'[k]}</span>` : '';
      return `<button class="opcion ${cls}" data-opcion="${k}" ${e.respondido ? 'disabled' : ''}>${etiqueta}${o.texto}</button>`;
    }).join('')}</div>`;
  }

  // ───────── Ordenar cuatro grupos ─────────
  function preguntaOrdenar(ctx, e) {
    const elegidos = [];
    for (const g of barajar(GRUPOS)) {
      if (!elegidos.some((x) => x.r === g.r)) elegidos.push(g);
      if (elegidos.length === 4) break;
    }
    e.grupos = elegidos;
    e.elegidos = [];
    ctx.botones({ comprobar: 'Comprobar orden' });
    ctx.enunciado('Grupos funcionales', 'Haz clic en los grupos de mayor a menor prioridad (vuelve a hacer clic para deshacer)', 'Ordena por prioridad');
    pintarOrden(ctx);
  }

  function pintarOrden(ctx) {
    const e = ctx.est;
    const correcto = e.grupos.slice().sort((a, b) => a.r - b.r);
    ctx.$('#z-opciones').innerHTML = `<div class="orden-grupos">${e.grupos.map((g, gi) => {
      const pos = e.elegidos.indexOf(gi);
      let cls = pos >= 0 ? 'on' : '';
      if (e.respondido) cls = correcto[pos] === g ? 'correcta' : 'incorrecta';
      return `<button class="opcion grupo-orden ${cls}" data-opcion="${gi}" ${e.respondido ? 'disabled' : ''}>
        <span class="orden-num">${pos >= 0 ? pos + 1 : ''}</span>
        <span class="orden-formula">${g.f}</span><span class="orden-nombre">${g.n}</span></button>`;
    }).join('')}</div>`;
  }

  function corregirOrden(ctx, rendirse) {
    const e = ctx.est;
    if (!rendirse && e.elegidos.length < e.grupos.length) { ctx.feedback('Ordena los cuatro grupos antes de comprobar.', 'aviso'); return; }
    const correcto = e.grupos.slice().sort((a, b) => a.r - b.r);
    const ok = !rendirse && e.elegidos.every((gi, k) => e.grupos[gi] === correcto[k]);
    if (rendirse) e.elegidos = correcto.map((g) => e.grupos.indexOf(g));
    const filas = correcto.map((g, k) => `<li><b>${g.n}</b> (${g.f}) → ${k === 0 && g.suf ? `sufijo ${g.suf}` : g.pre ? `prefijo «${g.pre}»` : 'sin prefijo'}</li>`).join('');
    cerrar(ctx, ok, rendirse, `<ol class="orden-resultado">${filas}</ol>
      <p class="nota-estereo">El de mayor prioridad es el grupo principal: va como sufijo y la cadena principal debe contenerlo. Los demás se nombran como prefijos.</p>`);
    pintarOrden(ctx);
  }

  // ───────── Común ─────────
  function cerrar(ctx, ok, rendirse, detalle) {
    const e = ctx.est;
    e.respondido = true;
    ctx.intento(ok);
    ctx.registrar(`grupos:${e.tipo}`, null, ok, ok ? null : 'grupo', false);
    const titulo = ok ? '<b>¡Correcto!</b> ' : rendirse ? '<b>Solución:</b> ' : '<b>No.</b> ';
    ctx.feedback(`${titulo}${detalle}`, ok ? 'bien' : rendirse ? 'aviso' : 'mal');
    ctx.botones({ comprobar: 'Siguiente →', pista: false, solucion: false, siguiente: false });
  }

  function responder(ctx, k, rendirse = false) {
    const e = ctx.est;
    if (e.respondido) return;
    const ok = !rendirse && e.ops[k].ok;
    const correcta = e.ops.find((o) => o.ok);
    const texto = e.tipo === 'comparar' ? correcta.g.n : correcta.texto;
    // Opciones «trampa»: describen la misma molécula pero incumplen una regla.
    const motivo = !ok && !rendirse && e.mol?.trampa?.[e.ops[k].texto];
    const trampa = motivo ? ` «${e.ops[k].texto}» describe la misma molécula, pero ${motivo}.` : '';
    cerrar(ctx, ok, rendirse, `${ok ? '' : `Respuesta correcta: <b>${texto}</b>.${trampa} `}${e.porque}`);
    pintarOpciones(ctx, k);
  }

  function pintarAjustes(ctx) {
    const a = ajustes();
    ctx.ajustes(`<label>Ejercicios <select data-ajuste="tipo">${Object.entries({ mezcla: 'Mezcla de todo', ...TIPOS })
      .map(([k, v]) => `<option value="${k}" ${k === a.tipo ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`);
  }

  MODOS.grupos = {
    niveles: false,
    GRUPOS,
    MOLECULAS_GF,

    nuevo(ctx) {
      const e = ctx.est;
      pintarAjustes(ctx);
      const a = ajustes();
      e.tipo = a.tipo === 'mezcla' ? azar(Object.keys(TIPOS)) : a.tipo;
      e.respondido = false;
      e.mol = null;
      ctx.zonas(['opciones']);
      ctx.botones({ comprobar: false, pista: 'Ver tabla', solucion: 'Ver solución', siguiente: 'Saltar →' });
      if (e.tipo === 'comparar') preguntaComparar(ctx, e);
      else if (e.tipo === 'sufijo') preguntaSufijo(ctx, e);
      else if (e.tipo === 'prefijo') preguntaPrefijo(ctx, e);
      else if (e.tipo === 'nombrar') preguntaNombrar(ctx, e);
      if (e.tipo === 'ordenar') preguntaOrdenar(ctx, e);
      else pintarOpciones(ctx, null);
    },

    opcion(ctx, valor) {
      const e = ctx.est;
      if (e.respondido) return;
      if (e.tipo === 'ordenar') {
        const gi = +valor;
        const pos = e.elegidos.indexOf(gi);
        if (pos >= 0) e.elegidos = e.elegidos.slice(0, pos);
        else e.elegidos.push(gi);
        pintarOrden(ctx);
        return;
      }
      responder(ctx, +valor);
    },

    comprobar(ctx) {
      const e = ctx.est;
      if (e.respondido) { ctx.nuevo(); return; }
      if (e.tipo === 'ordenar') corregirOrden(ctx, false);
    },

    solucion(ctx) {
      const e = ctx.est;
      if (e.respondido) return;
      if (e.tipo === 'ordenar') corregirOrden(ctx, true);
      else responder(ctx, -1, true);
    },

    // La pista es la tabla completa de los apuntes.
    pista(ctx) {
      ctx.explicacion(tabla());
      ctx.botones({ pista: false });
    },

    ajuste(ctx, nombre, valor) {
      Progreso.pref('grupos', { ...ajustes(), [nombre]: valor });
      ctx.nuevo();
    },
  };
})();
