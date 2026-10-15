// «Encuentra el error»: se muestra una molécula con un nombre propuesto y el
// alumno decide si es correcto o qué regla incumple.
// Los errores de numeración y de orden alfabético se generan a partir del
// nombre correcto; los de cadena y grupo principal están escritos a mano.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  const ERRORES_MANUALES = {
    '2-metilbutano': [{ n: '2-etilpropano', tipo: 'cadena' }],
    '3-metilpentano': [{ n: '2-etilbutano', tipo: 'cadena' }],
    '2,2-dimetilbutano': [{ n: '2-etil-2-metilpropano', tipo: 'cadena' }],
    '2,3-dimetilbutano': [{ n: '2-isopropilpropano', tipo: 'cadena' }],
    '4-isopropilheptano': [{ n: '2-metil-3-propilhexano', tipo: 'cadena' }],
    '4-etil-2-metilhexano': [{ n: '2-metil-4-etilhexano', tipo: 'orden' }],
    '3-metilbut-1-eno': [{ n: '2-metilbut-3-eno', tipo: 'localizadores' }],
    '4-metilpentan-2-ol': [{ n: '2-metilpentan-4-ol', tipo: 'localizadores' }],
    '4-hidroxibutan-2-ona': [{ n: '3-oxobutan-1-ol', tipo: 'grupo' }],
    '3-oxobutanal': [{ n: '4-oxobutan-2-ona', tipo: 'grupo' }],
    '2-aminoetan-1-ol': [{ n: '2-hidroxietan-1-amina', tipo: 'grupo' }],
    '4-aminobutan-2-ona': [{ n: '3-oxobutan-1-amina', tipo: 'grupo' }],
    'ácido 2-hidroxipropanoico': [{ n: '1-carboxietan-1-ol', tipo: 'grupo' }],
    'ácido 3-aminopropanoico': [{ n: '2-carboxietan-1-amina', tipo: 'grupo' }],
    'metoxietano': [{ n: 'etoximetano', tipo: 'cadena' }],
    '1-metoxipropano': [{ n: 'propoximetano', tipo: 'cadena' }],
  };

  const OPCIONES = [
    ['correcto', 'El nombre es correcto'],
    ['localizadores', 'Numeración / localizadores'],
    ['orden', 'Orden alfabético de los sustituyentes'],
    ['cadena', 'Elección de la cadena principal'],
    ['grupo', 'Elección del grupo principal (sufijo)'],
  ];

  const EXPLICACION = {
    correcto: 'El nombre propuesto es correcto.',
    localizadores: 'Se ha numerado desde el extremo equivocado. Los localizadores más bajos son, por este orden, para el grupo principal, las insaturaciones y los sustituyentes; si empatan, para el que va primero alfabéticamente.',
    orden: 'Los sustituyentes deben citarse en orden alfabético, sin tener en cuenta los multiplicadores di-, tri-…',
    cadena: 'La cadena principal elegida no es la correcta: debe contener el grupo principal y, después, ser la más larga.',
    grupo: 'El sufijo corresponde siempre al grupo de mayor prioridad de la tabla; el resto se nombran como prefijos (hidroxi-, oxo-, amino-…).',
  };

  // Grupos principales que fijan el C1 en un extremo: invertir la numeración no tiene sentido.
  const C1_FIJO = ['al', 'oico', 'oato', 'amida', 'nitrilo'];

  // Numera la cadena desde el otro extremo (solo cadenas abiertas).
  function invertirNumeracion(m) {
    if (m.sis) return null;
    const g = m._g;
    const cadena = g.atoms.filter((a) => a.map > 0 && a.map < 100);
    const N = cadena.length;
    const enlacesCadena = g.bonds.filter((b) => g.atoms[b.a].map > 0 && g.atoms[b.a].map < 100 && g.atoms[b.b].map > 0 && g.atoms[b.b].map < 100);
    if (N < 3 || enlacesCadena.length !== N - 1) return null;
    const partes = Nombre.segmentar(m.n);
    if (partes.some((p) => p.k === 'acido' || p.k === 'ester' || (p.k === 'suf' && C1_FIJO.includes(p.tipo)))) return null;
    let cambia = false;
    const nuevo = partes.map((p) => {
      const num = p.locs.filter((l) => /^\d+$/.test(l));
      if (!num.length || num.length !== p.locs.length) return p.t;
      cambia = true;
      const inv = num.map((l) => (p.k === 'insat' ? N - +l : N + 1 - +l)).sort((a, b) => a - b);
      return p.t.replace(/^[\d,]+/, inv.join(','));
    }).join('');
    return cambia ? nuevo : null;
  }

  // Cita los sustituyentes en orden inverso.
  function desordenar(m) {
    const ref = m.sis || m.n;
    const partes = Nombre.segmentar(ref);
    const idx = partes.map((p, i) => (p.k === 'sust' ? i : -1)).filter((i) => i >= 0);
    if (idx.length < 2) return null;
    const primero = idx[0], ultimo = idx[idx.length - 1];
    if (partes.slice(primero, ultimo + 1).some((p) => p.k !== 'sust' && p.k !== 'sep')) return null;
    const susts = idx.map((i) => partes[i]);
    if (new Set(susts.map((p) => p.base)).size < 2) return null;
    const antes = partes.slice(0, primero).map((p) => p.t).join('');
    const despues = partes.slice(ultimo + 1).map((p) => p.t).join('');
    return antes + susts.reverse().map((p) => p.t).join('-') + despues;
  }

  function variantes(m) {
    const aceptados = new Set(Nombre.aceptados(m).map(Nombre.normalizar));
    const lista = [];
    const añadir = (n, tipo) => { if (n && !aceptados.has(Nombre.normalizar(n)) && !lista.some((x) => x.n === n)) lista.push({ n, tipo }); };
    añadir(invertirNumeracion(m), 'localizadores');
    añadir(desordenar(m), 'orden');
    (ERRORES_MANUALES[m.n] || []).forEach((x) => añadir(x.n, x.tipo));
    return lista;
  }

  function pintarOpciones(ctx, elegida) {
    const e = ctx.est;
    ctx.$('#z-opciones').innerHTML = `<div class="opciones-error">${OPCIONES.map(([k, t]) => {
      let cls = '';
      if (e.respondida && k === e.q.tipo) cls = 'correcta';
      else if (e.respondida && k === elegida) cls = 'incorrecta';
      return `<button class="opcion ${cls}" data-opcion="${k}" ${e.respondida ? 'disabled' : ''}>${t}</button>`;
    }).join('')}</div>`;
  }

  function responder(ctx, elegida) {
    const e = ctx.est;
    if (e.respondida) return;
    e.respondida = true;
    const ok = elegida === e.q.tipo;
    ctx.registrar(`error:${e.mol.n}`, e.mol.n, ok, ok ? null : e.q.tipo);
    pintarOpciones(ctx, elegida);
    const titulo = ok ? '<b>¡Correcto!</b> ' : elegida ? '<b>No.</b> ' : '';
    const nombre = e.q.tipo === 'correcto' ? '' : ` El nombre correcto es <b>${ctx.esc(e.mol.n)}</b>.`;
    ctx.feedback(`${titulo}${EXPLICACION[e.q.tipo]}${nombre}`, ok ? 'bien' : elegida ? 'mal' : 'aviso');
    ctx.botones({ solucion: false });
    ctx.mostrarSolucion(e.mol, e.g);
  }

  MODOS.error = {
    niveles: true,

    nuevo(ctx) {
      const e = ctx.est;
      e.mol = ctx.elegirMolecula((m) => `error:${m.n}`);
      e.g = ctx.orientar(e.mol._g);
      const vs = variantes(e.mol);
      e.q = !vs.length || Math.random() < 0.25 ? { n: e.mol.n, tipo: 'correcto' } : vs[Math.floor(Math.random() * vs.length)];
      e.respondida = false;
      ctx.zonas(['figura', 'opciones']);
      ctx.botones({ comprobar: false, pista: false, solucion: 'Ver solución', siguiente: 'Siguiente →' });
      ctx.enunciado(`<span class="etiqueta">${ctx.esc(ctx.nivelNombre(e.mol.nv))} · ¿Es correcto este nombre? Si no lo es, ¿qué regla incumple?</span>
        <div class="nombre-grande">${ctx.esc(e.q.n)}</div>`);
      ctx.pintarFigura(e.g);
      pintarOpciones(ctx);
    },

    opcion(ctx, k) { responder(ctx, k); },
    solucion(ctx) { responder(ctx, null); },
  };
})();
