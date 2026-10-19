// Estereoquímica (Tema 2c): asignar R/S a los carbonos quirales y E/Z a los
// dobles enlaces. RDKit da la respuesta; las prioridades CIP se calculan aquí
// para explicarla, y solo se muestran si reproducen el resultado de RDKit.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  // Cadena principal numerada con mapas. La configuración se elige al azar en cada ejercicio.
  const DATOS = [
    { n: 'butan-2-ol', s: '[CH3:1][C@H:2](O)[CH2:3][CH3:4]' },
    { n: '2-bromobutano', s: '[CH3:1][C@H:2](Br)[CH2:3][CH3:4]' },
    { n: 'pentan-2-amina', s: '[CH3:1][C@H:2](N)[CH2:3][CH2:4][CH3:5]' },
    { n: 'ácido 2-hidroxipropanoico', s: '[CH3:3][C@H:2](O)[C:1](=O)O', nota: 'Es el ácido láctico de los apuntes: el enantiómero (S) es el que aparece en ellos.' },
    { n: 'ácido 2-aminopropanoico', s: '[CH3:3][C@H:2](N)[C:1](=O)O', nota: 'Es el aminoácido alanina; en las proteínas aparece la (S)-alanina.' },
    { n: '1-feniletan-1-ol', s: '[CH3:2][C@H:1](O)c1ccccc1' },
    { n: '3-metilhexano', s: '[CH3:1][CH2:2][C@H:3](C)[CH2:4][CH2:5][CH3:6]' },
    { n: '2,3-dihidroxipropanal', s: 'O=[CH:1][C@H:2](O)[CH2:3]O', nota: 'Es el gliceraldehído.' },
    { n: '1-bromo-1-cloroetano', s: 'Cl[C@H:1](Br)[CH3:2]' },
    { n: '3-bromobut-1-eno', s: '[CH2:1]=[CH:2][C@H:3](Br)[CH3:4]' },
    { n: '2-metilbutan-1-ol', s: 'O[CH2:1][C@H:2](C)[CH2:3][CH3:4]' },
    { n: '3-cloro-2-metilpentano', s: '[CH3:1][CH:2](C)[C@H:3](Cl)[CH2:4][CH3:5]' },
    { n: 'butano-2,3-diol', s: '[CH3:1][C@H:2](O)[C@@H:3](O)[CH3:4]', meso: true },
    { n: '2,3-dibromobutano', s: '[CH3:1][C@H:2](Br)[C@H:3](Br)[CH3:4]', meso: true },
    { n: '3-bromobutan-2-ol', s: '[CH3:1][C@H:2](O)[C@H:3](Br)[CH3:4]' },
    { n: 'ácido 2,3-dihidroxibutanodioico', s: 'O[C:1](=O)[C@H:2](O)[C@@H:3](O)[C:4](=O)O', meso: true, nota: 'Es el ácido tartárico de los apuntes.' },
    { n: 'but-2-eno', s: '[CH3:1]/[CH:2]=[CH:3]/[CH3:4]' },
    { n: 'pent-2-eno', s: '[CH3:1]/[CH:2]=[CH:3]/[CH2:4][CH3:5]' },
    { n: 'hex-3-eno', s: '[CH3:1][CH2:2]/[CH:3]=[CH:4]/[CH2:5][CH3:6]' },
    { n: '1-bromoprop-1-eno', s: 'Br/[CH:1]=[CH:2]/[CH3:3]' },
    { n: '1,2-dicloroeteno', s: 'Cl/[CH:1]=[CH:2]/Cl' },
    { n: '3-metilpent-2-eno', s: '[CH3:1]/[CH:2]=[C:3](/C)[CH2:4][CH3:5]', nota: 'Aquí no sirve cis/trans: el C3 no tiene H. Se compara la prioridad CIP de los grupos (etilo > metilo).' },
    { n: '2-bromobut-2-eno', s: '[CH3:1]/[C:2](Br)=[CH:3]/[CH3:4]' },
    { n: '1-bromo-1-cloroprop-1-eno', s: 'Br/[C:1](Cl)=[CH:2]/[CH3:3]' },
    { n: 'ácido but-2-enoico', s: '[CH3:4]/[CH:3]=[CH:2]/[C:1](=O)O' },
    { n: 'pent-3-en-2-ol', s: '[CH3:1][C@H:2](O)/[CH:3]=[CH:4]/[CH3:5]' },
  ];

  const Z = { H: 1, B: 5, C: 6, N: 7, O: 8, F: 9, P: 15, S: 16, Cl: 17, Br: 35, I: 53 };
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const sub = (n) => String(n).split('').map((c) => SUB[+c]).join('');

  // Cambia al azar la configuración de cada centro y de los dobles enlaces.
  function alAzar(s) {
    let r = s.replace(/@@?/g, (m) => (Math.random() < 0.5 ? m : m === '@' ? '@@' : '@'));
    const igual = r.search(/\]=\[|\)=\[|[A-Za-z]=\[/);
    if (/[/\\]/.test(r) && igual >= 0 && Math.random() < 0.5) {
      r = r.slice(0, igual + 1) + r.slice(igual + 1).replace(/[/\\]/g, (c) => (c === '/' ? '\\' : '/'));
    }
    return r;
  }

  // ───────── Prioridades CIP (dígrafo jerárquico, exploración por esferas) ─────────
  function enlace(g, i, j) {
    return g.bonds.find((b) => (b.a === i && b.b === j) || (b.a === j && b.b === i));
  }

  function arbol(g, adj, desde, atomo, prof, camino) {
    const nodo = { z: Z[g.atoms[atomo].el] || 6, hijos: [] };
    if (prof === 0) return nodo;
    adj[atomo].forEach((n) => {
      const orden = enlace(g, atomo, n).order;
      if (n !== desde) {
        nodo.hijos.push(camino.has(n)
          ? { z: Z[g.atoms[n].el] || 6, hijos: [] }
          : arbol(g, adj, atomo, n, prof - 1, new Set([...camino, n])));
      }
      for (let k = 1; k < orden; k++) nodo.hijos.push({ z: Z[g.atoms[n].el] || 6, hijos: [] });
    });
    for (let k = 0; k < Quimica.hidrogenos(g, atomo); k++) nodo.hijos.push({ z: 1, hijos: [] });
    return nodo;
  }

  const cmpLista = (a, b) => {
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const d = (a[i] ?? 0) - (b[i] ?? 0);
      if (d) return d;
    }
    return 0;
  };

  function esferas(raiz, max = 7) {
    const res = [[[raiz.z]]];
    let nivel = [raiz];
    for (let d = 0; d < max && nivel.length; d++) {
      const conj = nivel.map((n) => n.hijos.map((h) => h.z).sort((a, b) => b - a));
      const orden = nivel.map((_, i) => i).sort((i, j) => nivel[j].z - nivel[i].z || cmpLista(conj[j], conj[i]));
      res.push(orden.map((i) => conj[i]));
      nivel = orden.flatMap((i) => nivel[i].hijos.slice().sort((a, b) => b.z - a.z));
    }
    return res;
  }

  function cmpEsferas(A, B) {
    for (let d = 0; d < Math.max(A.length, B.length); d++) {
      const a = A[d] || [], b = B[d] || [];
      for (let k = 0; k < Math.max(a.length, b.length); k++) {
        const c = cmpLista(a[k] || [], b[k] || []);
        if (c) return c;
      }
    }
    return 0;
  }

  // Sustituyentes de `centro` (sin `excluir`) ordenados de mayor a menor prioridad.
  // Cada uno: { atomo } o { atomo: null } para un H implícito.
  function prioridades(g, adj, centro, excluir = -1) {
    const ramas = adj[centro].filter((n) => n !== excluir)
      .map((n) => ({ atomo: n, e: esferas(arbol(g, adj, centro, n, 7, new Set([centro, n]))) }));
    for (let k = 0; k < Quimica.hidrogenos(g, centro); k++) ramas.push({ atomo: null, e: [[[1]]] });
    ramas.sort((x, y) => cmpEsferas(y.e, x.e));
    const empate = ramas.some((r, i) => i > 0 && cmpEsferas(r.e, ramas[i - 1].e) === 0);
    return { ramas, empate };
  }

  // R/S a partir del dibujo (cuñas) y de nuestras prioridades, para validar contra RDKit.
  function rsGeometrico(g, adj, c, ramas) {
    const C = g.atoms[c];
    const vec = ramas.map((r) => {
      if (r.atomo == null) return null;
      const A = g.atoms[r.atomo];
      const b = enlace(g, c, r.atomo);
      const z = b.a === c ? (b.estereo === 1 ? 1 : b.estereo === 6 ? -1 : 0) : 0;
      const L = Math.hypot(A.x - C.x, A.y - C.y) || 1;
      return [(A.x - C.x) / L, -(A.y - C.y) / L, z];
    });
    const conocidos = vec.filter(Boolean);
    const iH = vec.findIndex((v) => !v);
    if (iH >= 0) {
      const s = conocidos.reduce((t, v) => [t[0] + v[0], t[1] + v[1], t[2] + v[2]], [0, 0, 0]);
      vec[iH] = [-s[0], -s[1], -s[2] || (conocidos.some((v) => v[2]) ? 0 : -1)];
    }
    const [a, b, d, e] = vec;
    const r = (u) => [u[0] - e[0], u[1] - e[1], u[2] - e[2]];
    const [x, y, w] = [r(a), r(b), r(d)];
    const det = x[0] * (y[1] * w[2] - y[2] * w[1]) - x[1] * (y[0] * w[2] - y[2] * w[0]) + x[2] * (y[0] * w[1] - y[1] * w[0]);
    if (!det) return null;
    return det < 0 ? 'R' : 'S';
  }

  function ezGeometrico(g, a, b, pa, pb) {
    const A = g.atoms[a], B = g.atoms[b];
    const lado = (p, origen) => Math.sign((B.x - A.x) * (g.atoms[p].y - origen.y) - (B.y - A.y) * (g.atoms[p].x - origen.x));
    return lado(pa, A) === lado(pb, B) ? 'Z' : 'E';
  }

  // Descripción corta de un sustituyente para la explicación.
  function etiquetaRama(g, adj, desde, n) {
    if (n == null) return 'H';
    const at = g.atoms[n];
    const h = Quimica.hidrogenos(g, n);
    const H = h ? 'H' + (h > 1 ? sub(h) : '') : '';
    if (at.el !== 'C') return at.el + H;
    const vecinos = adj[n].filter((x) => x !== desde);
    const orden = (x) => enlace(g, n, x).order;
    const oDoble = vecinos.some((x) => g.atoms[x].el === 'O' && orden(x) === 2);
    const oH = vecinos.some((x) => g.atoms[x].el === 'O' && orden(x) === 1 && Quimica.hidrogenos(g, x));
    if (oDoble && oH) return 'COOH';
    if (oDoble && h === 1) return 'CHO';
    const dobleC = vecinos.find((x) => orden(x) === 2 && g.atoms[x].el === 'C');
    if (dobleC != null && h === 0 && vecinos.length === 2) return 'C₆H₅';
    if (dobleC != null) return Quimica.hidrogenos(g, dobleC) === 2 ? 'CH=CH₂' : 'CH=CH–R';
    if (vecinos.some((x) => g.atoms[x].el === 'O' && orden(x) === 1)) return `C${H}(OH)–R`;
    if (vecinos.length === 2 && vecinos.every((x) => g.atoms[x].el === 'C' && Quimica.hidrogenos(g, x) === 3)) return 'CH(CH₃)₂';
    if (h === 3) return 'CH₃';
    if (h === 2 && vecinos.length === 1) {
      const x = vecinos[0];
      if (g.atoms[x].el === 'C' && Quimica.hidrogenos(g, x) === 3) return 'CH₂CH₃';
      if (g.atoms[x].el !== 'C') return 'CH₂' + etiquetaRama(g, adj, n, x);
    }
    return 'C' + H + '–R';
  }

  // Posición para rotular la prioridad de un sustituyente.
  function posicion(g, c, n) {
    const C = g.atoms[c], A = g.atoms[n];
    const dx = A.x - C.x, dy = A.y - C.y, L = Math.hypot(dx, dy) || 1;
    return { x: C.x + dx * 0.55 - (dy / L) * 0.32, y: C.y + dy * 0.55 + (dx / L) * 0.32 };
  }

  function preparar(dato) {
    const smiles = alAzar(dato.s);
    const limpio = Quimica.quitarMapas(smiles);
    const tags = Quimica.descriptores(limpio);
    const g0 = Quimica.grafoDeSmiles(smiles);
    const adj = Quimica.vecinos(g0);
    const mapa = (i) => g0.atoms[i].map;
    const elementos = [];
    Object.entries(tags.atomos).forEach(([i, d]) => {
      const c = +i;
      const p = prioridades(g0, adj, c);
      const geo = p.empate ? null : rsGeometrico(g0, adj, c, p.ramas);
      elementos.push({ tipo: 'centro', c, loc: mapa(c), resp: d, ramas: p.ramas, fiable: geo === d });
    });
    tags.enlaces.forEach(({ a, b, d }) => {
      const pa = prioridades(g0, adj, a, b), pb = prioridades(g0, adj, b, a);
      const geo = pa.ramas[0].atomo != null && pb.ramas[0].atomo != null ? ezGeometrico(g0, a, b, pa.ramas[0].atomo, pb.ramas[0].atomo) : null;
      elementos.push({ tipo: 'doble', a, b, loc: Math.min(mapa(a), mapa(b)), resp: d, ramasA: pa.ramas, ramasB: pb.ramas, fiable: geo === d && !pa.empate && !pb.empate });
    });
    elementos.sort((x, y) => x.loc - y.loc);
    return { dato, g0, adj, elementos };
  }

  const nombreElemento = (el) => (el.tipo === 'centro'
    ? `C${el.loc} · carbono quiral`
    : `C${el.loc}=C${el.loc + 1} · doble enlace`);

  function nombreCompleto(e) {
    const els = e.q.elementos;
    const desc = els.length === 1 ? `(${els[0].resp})` : `(${els.map((x) => x.loc + x.resp).join(',')})`;
    const n = e.q.dato.n;
    return n.startsWith('ácido ') ? `ácido ${desc}-${n.slice(6)}` : `${desc}-${n}`;
  }

  function pintarOpciones(ctx) {
    const e = ctx.est;
    ctx.$('#z-opciones').innerHTML = `<div class="estereo-filas">${e.q.elementos.map((el, i) => {
      const ops = el.tipo === 'centro' ? ['R', 'S'] : ['E', 'Z'];
      return `<div class="fila-estereo"><span>${nombreElemento(el)}</span>${ops.map((o) => {
        let cls = e.sel[i] === o ? 'on' : '';
        if (e.respondida) cls = o === el.resp ? 'correcta' : e.sel[i] === o ? 'incorrecta' : '';
        return `<button class="opcion corta ${cls}" data-opcion="${i}:${o}" ${e.respondida ? 'disabled' : ''}>${o}</button>`;
      }).join('')}</div>`;
    }).join('')}</div>`;
  }

  function pintar(ctx, explicar) {
    const e = ctx.est;
    const etiquetas = [];
    // Solo se numeran los átomos por los que se pregunta, para no confundir con las prioridades.
    const relevantes = new Set(e.q.elementos.flatMap((el) => (el.tipo === 'centro' ? [el.c] : [el.a, el.b])));
    const g = Quimica.copiar(e.g);
    g.atoms.forEach((a, i) => { if (!relevantes.has(i)) a.map = 0; });
    if (explicar) {
      e.q.elementos.filter((el) => el.fiable).forEach((el) => {
        if (el.tipo === 'centro') {
          el.ramas.forEach((r, k) => { if (r.atomo != null) etiquetas.push({ ...posicion(e.g, el.c, r.atomo), texto: '①②③④'[k] }); });
        } else {
          [[el.a, el.ramasA], [el.b, el.ramasB]].forEach(([c, ramas]) => ramas.forEach((r, k) => {
            if (r.atomo != null) etiquetas.push({ ...posicion(e.g, c, r.atomo), texto: k === 0 ? 'alta' : 'baja', clase: 'prioridad texto' });
          }));
        }
      });
    }
    ctx.pintarFigura(g, { locantes: true, etiquetas, S: 50 });
  }

  function explicacion(ctx, el) {
    const e = ctx.est;
    const g = e.q.g0, adj = e.q.adj;
    if (!el.fiable) return `${nombreElemento(el)}: <b>${el.resp}</b>.`;
    if (el.tipo === 'centro') {
      const lista = el.ramas.map((r, k) => `${'①②③④'[k]} ${etiquetaRama(g, adj, el.c, r.atomo)}`).join(', ');
      return `C${el.loc}: prioridades ${lista}. Con el ④ hacia atrás, ①→②→③ gira en sentido <b>${el.resp === 'R' ? 'horario → R' : 'antihorario → S'}</b>.`;
    }
    const lado = (c, ramas) => `en C${g.atoms[c].map}, ${etiquetaRama(g, adj, c, ramas[0].atomo)} &gt; ${etiquetaRama(g, adj, c, ramas[1]?.atomo)}`;
    return `C${el.loc}=C${el.loc + 1}: ${lado(el.a, el.ramasA)}; ${lado(el.b, el.ramasB)}. Los de mayor prioridad están ${el.resp === 'Z' ? 'del mismo lado → <b>Z</b>' : 'en lados opuestos → <b>E</b>'}.`;
  }

  function responder(ctx, rendirse) {
    const e = ctx.est;
    const els = e.q.elementos;
    if (!rendirse && e.sel.filter(Boolean).length < els.length) {
      ctx.feedback('Elige una opción para cada estereocentro o doble enlace.', 'aviso');
      return;
    }
    e.respondida = true;
    const ok = !rendirse && els.every((el, i) => e.sel[i] === el.resp);
    ctx.registrar(`estereo:${e.q.dato.n}`, null, ok, ok ? null : 'estereo');
    pintarOpciones(ctx);
    pintar(ctx, true);
    const centros = els.filter((x) => x.tipo === 'centro').map((x) => x.resp);
    const meso = e.q.dato.meso && centros.length === 2 && centros[0] !== centros[1];
    const notas = [
      meso ? 'Esta combinación es la <b>forma meso</b>: tiene un plano de simetría interno y es aquiral.' : '',
      e.q.dato.nota ? ctx.esc(e.q.dato.nota) : '',
      els.some((x) => x.tipo === 'centro') ? 'Truco: si el grupo de menor prioridad queda hacia delante (cuña), el giro que ves en el papel se invierte.' : '',
    ].filter(Boolean);
    ctx.feedback(`${rendirse ? '' : ok ? '<b>¡Correcto!</b> ' : '<b>No del todo.</b> '}El nombre completo es <b>${ctx.esc(nombreCompleto(e))}</b>.
      <ul>${els.map((el) => `<li>${explicacion(ctx, el)}</li>`).join('')}</ul>
      ${notas.map((n) => `<p class="nota-estereo">${n}</p>`).join('')}`, ok ? 'bien' : rendirse ? 'aviso' : 'mal');
    ctx.botones({ comprobar: false, solucion: false, pista: false });
  }

  MODOS.estereo = {
    niveles: false,

    nuevo(ctx) {
      const e = ctx.est;
      const dato = ctx.elegir(DATOS, (d) => `estereo:${d.n}`);
      e.q = preparar(dato);
      e.g = ctx.orientar(e.q.g0, { reflejar: false });
      e.sel = [];
      e.respondida = false;
      ctx.zonas(['figura', 'opciones']);
      ctx.botones({ comprobar: 'Comprobar', pista: 'Pista', solucion: 'Ver solución', siguiente: 'Siguiente →' });
      const hay = e.q.elementos.map((x) => x.tipo);
      const que = [hay.includes('centro') ? 'R o S a cada carbono quiral' : '', hay.includes('doble') ? 'E o Z a cada doble enlace' : ''].filter(Boolean).join(' y ');
      ctx.enunciado('Estereoquímica', `Asigna ${que}`, ctx.esc(dato.n));
      pintar(ctx, false);
      pintarOpciones(ctx);
    },

    opcion(ctx, valor) {
      const e = ctx.est;
      if (e.respondida) return;
      const [i, o] = valor.split(':');
      e.sel[+i] = o;
      pintarOpciones(ctx);
    },

    comprobar(ctx) { if (!ctx.est.respondida) responder(ctx, false); },
    solucion(ctx) { if (!ctx.est.respondida) responder(ctx, true); },

    pista(ctx) {
      const e = ctx.est;
      e.nPistas = (e.nPistas || 0) + 1;
      if (e.nPistas === 1) {
        ctx.pista('Reglas de Cahn-Ingold-Prelog: gana el sustituyente cuyo primer átomo tiene mayor número atómico (Br &gt; Cl &gt; O &gt; N &gt; C &gt; H). Si empatan, se comparan los átomos siguientes. Un doble enlace cuenta como dos átomos iguales.');
      } else if (e.nPistas === 2) {
        pintar(ctx, true);
        ctx.pista('Te marco las prioridades en el dibujo (① = la más alta; «alta»/«baja» en los dobles enlaces). Si no ves el ④, es el H, que no se dibuja.');
        ctx.botones({ pista: false });
      }
    },
  };
})();
