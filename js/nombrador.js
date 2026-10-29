// Nombrador IUPAC: genera el nombre (en español) de una estructura dibujada,
// siguiendo las reglas de los apuntes (Tema 2b):
//  1. Grupos funcionales y grupo principal (tabla de prioridades, pág. 16).
//  2. Cadena principal y numeración (págs. 25-33), evaluando a la vez todas las
//     cadenas/anillos candidatos y todas sus numeraciones con el orden de criterios:
//     nº de grupos principales → anillo > cadena → tamaño → enlaces múltiples →
//     dobles → localizadores del grupo principal → de las insaturaciones →
//     nº de sustituyentes → sus localizadores → orden alfabético.
//  3. Sustituyentes (también complejos), multiplicadores, orden alfabético,
//     elisión de vocales y nombres retenidos (fenol, ácido benzoico, anilina…).
// Alcance: cadenas, anillos sencillos de carbono y benceno. Los sistemas de
// varios anillos fusionados y los heterociclos quedan fuera (lanza Fuera).
'use strict';

const Nombrador = (() => {
  const RAIZ = ['', 'met', 'et', 'prop', 'but', 'pent', 'hex', 'hept', 'oct', 'non', 'dec', 'undec', 'dodec',
    'tridec', 'tetradec', 'pentadec', 'hexadec', 'heptadec', 'octadec', 'nonadec', 'icos'];
  const MULT = { 2: 'di', 3: 'tri', 4: 'tetra', 5: 'penta', 6: 'hexa', 7: 'hepta', 8: 'octa', 9: 'nona', 10: 'deca' };
  const MULT_COMPLEJO = { 2: 'bis', 3: 'tris', 4: 'tetrakis', 5: 'pentakis', 6: 'hexakis' };
  const HALO = { F: 'fluoro', Cl: 'cloro', Br: 'bromo', I: 'yodo' };
  // De mayor a menor prioridad (los que pueden ir como sufijo).
  const ORDEN_GF = ['acido', 'ester', 'amida', 'nitrilo', 'aldehido', 'cetona', 'alcohol', 'tiol', 'amina'];
  const SUFIJO = { acido: 'oico', ester: 'oato', amida: 'amida', nitrilo: 'nitrilo', aldehido: 'al', cetona: 'ona', alcohol: 'ol', tiol: 'tiol', amina: 'amina' };
  const SUFIJO_EXO = { acido: 'carboxílico', ester: 'carboxilato', amida: 'carboxamida', nitrilo: 'carbonitrilo', aldehido: 'carbaldehído' };
  const BENCENO = { acido: 'benzoico', ester: 'benzoato', amida: 'benzamida', nitrilo: 'benzonitrilo', aldehido: 'benzaldehído', alcohol: 'fenol', amina: 'anilina' };
  // Grupos cuyo carbono es siempre el C1 de la cadena: su localizador no se escribe.
  const C1_FIJO = new Set(['acido', 'ester', 'amida', 'nitrilo', 'aldehido']);
  const NOMBRE_GF = {
    acido: 'ácido carboxílico', ester: 'éster', amida: 'amida', nitrilo: 'nitrilo', aldehido: 'aldehído',
    cetona: 'cetona', alcohol: 'alcohol', tiol: 'tiol', amina: 'amina',
  };
  // Nombres retenidos de sustituyentes (apuntes, pág. 35).
  const RETENIDOS = { '1-metiletil': 'isopropil', '1,1-dimetiletil': 'terc-butil', '1-metilpropil': 'sec-butil', '2-metilpropil': 'isobutil', fenilmetil: 'bencil' };

  class Fuera extends Error {}
  const fuera = (motivo) => { throw new Fuera(motivo); };

  const vocal = (s) => /^[aeiouáéíóú]/.test(s);
  const normal = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const cmpNum = (a, b) => a - b;

  // Comparación lexicográfica de tuplas (números o listas de números).
  function cmpTupla(x, y) {
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      const a = x[i], b = y[i];
      if (Array.isArray(a) || Array.isArray(b)) {
        const c = cmpLista(a || [], b || []);
        if (c) return c;
      } else if (a !== b) return (a ?? 0) - (b ?? 0);
    }
    return 0;
  }
  function cmpLista(a, b) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  }

  // ───────── Contexto: anillos, grupos funcionales ─────────
  function ciclos(n, adj) {
    const res = [];
    const vistos = new Set();
    for (let s = 0; s < n; s++) {
      const camino = [s];
      const en = new Set([s]);
      const dfs = (v) => {
        if (camino.length > 12) return;
        for (const w of adj[v]) {
          if (w === s && camino.length >= 3) {
            const k = camino.slice().sort(cmpNum).join();
            if (!vistos.has(k)) { vistos.add(k); res.push(camino.slice()); }
            continue;
          }
          if (w <= s || en.has(w)) continue;
          en.add(w); camino.push(w);
          dfs(w);
          camino.pop(); en.delete(w);
        }
      };
      dfs(s);
    }
    return res;
  }

  function contexto(g) {
    const n = g.atoms.length;
    const adj = Quimica.vecinos(g);
    const ord = Array.from({ length: n }, () => new Array(n).fill(0));
    g.bonds.forEach((b) => { ord[b.a][b.b] = ord[b.b][b.a] = b.order; });
    const H = g.atoms.map((_, i) => Quimica.hidrogenos(g, i));
    const el = (i) => g.atoms[i].el;
    const carga = (i) => g.atoms[i].charge || 0;
    const cx = { g, n, adj, ord, H, el, carga };

    // Anillos: solo monocíclicos de carbono.
    const anillos = ciclos(n, adj);
    cx.anillo = new Map();
    anillos.forEach((r, k) => r.forEach((a) => {
      if (cx.anillo.has(a)) fuera('Sistemas de varios anillos fusionados o con puente (naftaleno, biciclos…).');
      cx.anillo.set(a, k);
    }));
    anillos.forEach((r) => { if (r.some((a) => el(a) !== 'C')) fuera('Anillos con heteroátomos (piridina, furano, THF…). Búscalos en «Nombres triviales».'); });
    cx.anillos = anillos.map((r) => {
      const dobles = r.filter((a, k) => ord[a][r[(k + 1) % r.length]] === 2).length;
      return { atomos: r, aromatico: r.length === 6 && dobles === 3 };
    });

    // Elementos y cargas fuera del alcance.
    g.atoms.forEach((a, i) => {
      if (!['C', 'O', 'N', 'S', 'F', 'Cl', 'Br', 'I'].includes(a.el)) fuera(`El elemento ${a.el} queda fuera de lo que sé nombrar.`);
      if (carga(i) && !(a.el === 'N' && carga(i) === 1) && !(a.el === 'O' && carga(i) === -1)) fuera('Iones y especies con carga (salvo el grupo nitro).');
    });

    // Grupos funcionales.
    const grupos = [];
    const esCarbonilo = (c) => adj[c].some((x) => el(x) === 'O' && ord[c][x] === 2);
    for (let i = 0; i < n; i++) {
      const e = el(i);
      if (e === 'C') {
        const vec = adj[i];
        const Od = vec.find((j) => el(j) === 'O' && ord[i][j] === 2 && adj[j].length === 1);
        const OH = vec.filter((j) => el(j) === 'O' && ord[i][j] === 1 && adj[j].length === 1 && H[j] === 1);
        const Op = vec.filter((j) => el(j) === 'O' && ord[i][j] === 1 && adj[j].length === 2);
        const Ns = vec.filter((j) => el(j) === 'N' && ord[i][j] === 1 && !carga(j));
        const Nt = vec.find((j) => el(j) === 'N' && ord[i][j] === 3);
        if (vec.some((j) => el(j) === 'N' && ord[i][j] === 2)) fuera('Iminas (C=N).');
        if (vec.some((j) => el(j) === 'S' && ord[i][j] === 2)) fuera('Tiocetonas (C=S).');
        if (Nt != null) grupos.push({ tipo: 'nitrilo', c: i, atomos: [Nt] });
        else if (Od != null) {
          if (OH.length) grupos.push({ tipo: 'acido', c: i, atomos: [Od, OH[0]] });
          else if (Op.length) {
            const o = Op[0];
            const r = adj[o].find((x) => x !== i);
            if (el(r) !== 'C') fuera('Peroxiácidos y similares.');
            if (esCarbonilo(r)) fuera('Anhídridos de ácido.');
            grupos.push({ tipo: 'ester', c: i, atomos: [Od, o], oxigeno: o, alquilo: r });
          } else if (Ns.length) grupos.push({ tipo: 'amida', c: i, atomos: [Od, Ns[0]], n: Ns[0] });
          else if (vec.some((j) => HALO[el(j)])) fuera('Haluros de ácido (cloruro de acetilo…).');
          else if (vec.filter((j) => el(j) === 'C').length === 2) grupos.push({ tipo: 'cetona', c: i, atomos: [Od] });
          else if (H[i] >= 1) grupos.push({ tipo: 'aldehido', c: i, atomos: [Od] });
          else fuera('Combinación de grupos con carbonilo que no sé nombrar.');
        } else {
          OH.forEach((o) => grupos.push({ tipo: 'alcohol', c: i, atomos: [o] }));
        }
      } else if (e === 'O') {
        if (adj[i].some((j) => el(j) === 'O')) fuera('Peróxidos e hidroperóxidos.');
        if (adj[i].length === 2 && adj[i].some((j) => el(j) !== 'C')) fuera('Oxígeno unido a heteroátomos.');
      } else if (e === 'S') {
        if (adj[i].some((j) => el(j) !== 'C' || ord[i][j] !== 1) || adj[i].length > 2) fuera('Compuestos de azufre distintos de tioles y tioéteres.');
        if (adj[i].length === 1) grupos.push({ tipo: 'tiol', c: adj[i][0], atomos: [i] });
      } else if (e === 'N') {
        if (carga(i) === 1) {
          const oxs = adj[i].filter((j) => el(j) === 'O');
          if (oxs.length !== 2 || adj[i].length !== 3) fuera('Especies nitrogenadas con carga distintas del nitro.');
          continue;
        }
        if (adj[i].some((j) => el(j) !== 'C')) fuera('Nitrógeno unido a heteroátomos (hidracinas, hidroxilaminas…).');
        if (adj[i].some((j) => ord[i][j] !== 1)) continue; // nitrilo
        if (adj[i].some((j) => esCarbonilo(j))) continue; // amida
        grupos.push({ tipo: 'amina', n: i, atomos: [i], carbonos: adj[i].slice() });
      }
    }
    cx.grupos = grupos;
    const tipos = new Set(grupos.map((x) => x.tipo));
    cx.principal = ORDEN_GF.find((t) => tipos.has(t)) || null;
    cx.principales = grupos.filter((x) => x.tipo === cx.principal);
    // Como prefijo, ciano-, carboxi-, carbamoil- y alcoxicarbonil- incluyen su carbono:
    // si no son el grupo principal, ese carbono no puede estar en la cadena.
    cx.noCadena = new Set(grupos.filter((x) => x.tipo !== cx.principal && ['nitrilo', 'acido', 'amida', 'ester'].includes(x.tipo)).map((x) => x.c));
    // Carbonos de grupos que, como prefijo, se nombran enteros (carboxi-, ciano-…): no entran en la
    // cadena de un sustituyente («carboximetil», no «2-hidroxi-2-oxoetil»).
    cx.carbonoGrupo = new Set(grupos.filter((x) => ['nitrilo', 'acido', 'amida', 'ester'].includes(x.tipo)).map((x) => x.c));

    // Éster: el grupo unido al oxígeno («de R») no forma parte de la cadena.
    cx.excluidos = new Set();
    if (cx.principal === 'ester') {
      if (cx.principales.length > 1) fuera('Varios grupos éster en la misma molécula.');
      const es = cx.principales[0];
      const cola = [es.alquilo];
      cx.excluidos.add(es.alquilo);
      while (cola.length) {
        const x = cola.shift();
        adj[x].forEach((y) => { if (y !== es.oxigeno && !cx.excluidos.has(y)) { cx.excluidos.add(y); cola.push(y); } });
      }
      if (cx.excluidos.has(es.c)) fuera('Ésteres cíclicos (lactonas).');
    }
    return cx;
  }

  // ───────── Sustituyentes ─────────
  const simple = (nombre) => ({ nombre, complejo: false });
  const complejo = (nombre) => ({ nombre, complejo: true });

  function alcoxi(al) {
    const m = al.nombre.match(/^(.*?)(met|et|prop|but)il$/);
    if (m) return { nombre: `${m[1]}${m[2]}oxi`, complejo: al.complejo };
    if (al.nombre === 'fenil') return simple('fenoxi');
    if (al.nombre === 'isopropil') return simple('isopropoxi');
    if (al.nombre === 'terc-butil') return simple('terc-butoxi');
    return complejo(`${al.complejo ? encerrar(al.nombre) : al.nombre}oxi`);
  }

  // Paréntesis anidados: ( ), luego [ ], luego { }.
  const encerrar = (s) => (s.includes('[') ? `{${s}}` : s.includes('(') ? `[${s}]` : `(${s})`);

  // Une sustituyentes [{nombre, complejo, loc}] en orden alfabético con multiplicadores.
  // Simples: sin multiplicadores ni sec-/terc-. Complejos: su nombre completo (incluidos
  // sus multiplicadores), sin localizadores ni signos.
  const claveAlfa = (x) => normal(x.complejo ? x.nombre : x.nombre.replace(/^(sec|terc|tert)-/, '')).replace(/[\d,()\-]/g, '');
  function juntarPrefijos(lista, conLocantes) {
    const grupos = new Map();
    lista.forEach((s) => {
      const k = s.nombre;
      if (!grupos.has(k)) grupos.set(k, { ...s, locs: [] });
      grupos.get(k).locs.push(s.loc);
    });
    // El guion solo separa un prefijo del localizador del siguiente («3-etil-2-metil»);
    // sin localizadores, los prefijos van pegados («bromoclorometano»).
    const unir = (partes) => partes.reduce((s, p, i) => (i && /^[\dN]/.test(p) ? `${s}-${p}` : s + p), '');
    return unir([...grupos.values()]
      .sort((a, b) => (claveAlfa(a) < claveAlfa(b) ? -1 : claveAlfa(a) > claveAlfa(b) ? 1 : 0))
      .map((s) => {
        const k = s.locs.length;
        const locs = s.locs.slice().sort((a, b) => (typeof a === 'string' ? (typeof b === 'string' ? (a < b ? -1 : 1) : -1) : typeof b === 'string' ? 1 : a - b));
        const mostrar = locs.filter((l) => typeof l === 'string' || conLocantes);
        const mult = k > 1 ? (s.complejo ? MULT_COMPLEJO[k] : MULT[k]) : '';
        const cuerpo = s.complejo ? encerrar(s.nombre) : s.nombre;
        return `${mostrar.length ? `${mostrar.join(',')}-` : ''}${mult}${cuerpo}`;
      }));
  }

  function nombrarRama(cx, b, a, o) {
    const e = cx.el(b);
    if (HALO[e]) return simple(HALO[e]);
    const otros = cx.adj[b].filter((x) => x !== a);
    if (e === 'O') {
      if (o === 2) return simple('oxo');
      if (!otros.length) return simple('hidroxi');
      return alcoxi(nombrarAlquilo(cx, otros[0], b, 1));
    }
    if (e === 'S') {
      if (!otros.length) return simple('sulfanil');
      const al = nombrarAlquilo(cx, otros[0], b, 1);
      return al.complejo ? complejo(`${encerrar(al.nombre)}tio`) : simple(`${al.nombre}tio`);
    }
    if (e === 'N') {
      if (cx.carga(b) === 1) return simple('nitro');
      if (!otros.length) return simple('amino');
      const nombres = otros.map((r) => ({ ...nombrarAlquilo(cx, r, b, 1), loc: 0 }));
      return complejo(`${juntarPrefijos(nombres, false)}amino`);
    }
    if (e === 'C') return nombrarAlquilo(cx, b, a, o);
    return fuera('Sustituyente que no sé nombrar.');
  }

  // Grupo carbonado unido por b al átomo a (con enlace de orden o).
  function nombrarAlquilo(cx, b, a, o) {
    const vec = cx.adj[b].filter((x) => x !== a);
    if (o === 1 && vec.some((x) => cx.el(x) === 'N' && cx.ord[b][x] === 3)) return simple('ciano');
    const Od = vec.find((x) => cx.el(x) === 'O' && cx.ord[b][x] === 2);
    if (o === 1 && Od != null) {
      const resto = vec.filter((x) => x !== Od);
      if (resto.some((x) => cx.el(x) === 'O' && cx.adj[x].length === 1)) return simple('carboxi');
      const N = resto.find((x) => cx.el(x) === 'N');
      if (N != null && cx.adj[N].length === 1) return simple('carbamoil');
      const Op = resto.find((x) => cx.el(x) === 'O');
      if (Op != null) {
        const ox = alcoxi(nombrarAlquilo(cx, cx.adj[Op].find((x) => x !== b), Op, 1));
        return complejo(`${ox.complejo ? encerrar(ox.nombre) : ox.nombre}carbonil`);
      }
      const C = resto.find((x) => cx.el(x) === 'C');
      if (C == null) return simple('formil');
      const r = nombrarAlquilo(cx, C, b, cx.ord[b][C]);
      if (r.nombre === 'metil') return simple('acetil');
      if (r.nombre === 'fenil') return simple('benzoil');
      const m = !r.complejo && r.nombre.match(/^(et|prop|but|pent|hex)il$/);
      if (m) return simple(`${RAIZ[RAIZ.indexOf(m[1]) + 1]}anoil`);
      return complejo(`${r.complejo ? encerrar(r.nombre) : r.nombre}carbonil`);
    }
    if (cx.anillo.has(b)) return nombrarAnilloSustituyente(cx, b, a, o);
    return nombrarCadenaSustituyente(cx, b, a, o);
  }

  // Sustituyentes de un conjunto de átomos A (numerados 1..m), excluyendo `fuera`.
  function sustituyentesDe(cx, A, excluidos) {
    const pos = new Map(A.map((x, i) => [x, i + 1]));
    const lista = [];
    A.forEach((x) => cx.adj[x].forEach((y) => {
      if (pos.has(y) || excluidos.has(y)) return;
      lista.push({ loc: pos.get(x), a: x, b: y, o: cx.ord[x][y] });
    }));
    return lista;
  }

  // Enlaces múltiples entre átomos consecutivos de A (cerrado: anillo).
  function multiplesDe(cx, A, cerrado) {
    const r = [];
    const m = A.length;
    for (let k = 0; k < m - (cerrado ? 0 : 1); k++) {
      const o = cx.ord[A[k]][A[(k + 1) % m]];
      if (o > 1) r.push({ loc: cerrado && k === m - 1 ? m : k + 1, o });
    }
    return r;
  }

  function nombrarCadenaSustituyente(cx, b, a, o) {
    // Cadenas acíclicas de carbono que empiezan en b.
    const caminos = [];
    const dfs = (camino, vistos) => {
      caminos.push(camino.slice());
      const v = camino[camino.length - 1];
      cx.adj[v].forEach((w) => {
        if (w === a || vistos.has(w) || cx.el(w) !== 'C' || cx.anillo.has(w) || cx.carbonoGrupo.has(w)) return;
        vistos.add(w); camino.push(w);
        dfs(camino, vistos);
        camino.pop(); vistos.delete(w);
      });
    };
    dfs([b], new Set([b, a]));
    let mejor = null;
    let empatados = [];
    caminos.forEach((P) => {
      const mult = multiplesDe(cx, P, false);
      const subs = sustituyentesDe(cx, P, new Set([a]));
      const t = [-P.length, -mult.length, -mult.filter((x) => x.o === 2).length, -subs.length,
        mult.map((x) => x.loc), subs.map((x) => x.loc).sort(cmpNum)];
      const c = mejor ? cmpTupla(t, mejor.t) : -1;
      if (c < 0) { mejor = { t }; empatados = [{ P, mult, subs }]; } else if (c === 0) empatados.push({ P, mult, subs });
    });
    const elegido = desempateAlfabetico(cx, empatados);
    const { P, mult, subs } = elegido;
    const m = P.length;
    if (m > 20) fuera('Cadenas de más de 20 carbonos.');
    const prefijos = juntarPrefijos(subs.map((s) => ({ ...nombrarRama(cx, s.b, s.a, s.o), loc: s.loc })), m > 1);
    const en = mult.filter((x) => x.o === 2).map((x) => x.loc), ins = mult.filter((x) => x.o === 3).map((x) => x.loc);
    let base;
    if (!mult.length) base = RAIZ[m] + (o === 2 ? 'iliden' : o === 3 ? 'ilidin' : 'il');
    else if (m === 2) base = (en.length ? 'eten' : 'etin') + (o === 2 ? 'iliden' : 'il');
    else base = `${insaturado(RAIZ[m], en, ins, true)}-1-${o === 2 ? 'iliden' : 'il'}`;
    const nombre = prefijos + base;
    if (RETENIDOS[nombre]) return simple(RETENIDOS[nombre]);
    return /[\d(]/.test(nombre) || prefijos ? complejo(nombre) : simple(nombre);
  }

  function nombrarAnilloSustituyente(cx, b, a, o) {
    const R = cx.anillos[cx.anillo.get(b)];
    const r = R.atomos;
    const k0 = r.indexOf(b);
    const m = r.length;
    let mejor = null;
    let empatados = [];
    [1, -1].forEach((dir) => {
      const A = Array.from({ length: m }, (_, k) => r[(k0 + dir * k + m) % m]);
      const mult = R.aromatico ? [] : multiplesDe(cx, A, true);
      const subs = sustituyentesDe(cx, A, new Set([a]));
      const t = [mult.map((x) => x.loc), subs.map((x) => x.loc).sort(cmpNum)];
      const c = mejor ? cmpTupla(t, mejor.t) : -1;
      if (c < 0) { mejor = { t }; empatados = [{ P: A, mult, subs }]; } else if (c === 0) empatados.push({ P: A, mult, subs });
    });
    const { mult, subs } = desempateAlfabetico(cx, empatados);
    const prefijos = juntarPrefijos(subs.map((s) => ({ ...nombrarRama(cx, s.b, s.a, s.o), loc: s.loc })), true);
    let base;
    if (R.aromatico) base = 'fenil';
    else if (!mult.length) base = `ciclo${RAIZ[m]}il`;
    else base = `ciclo${insaturado(RAIZ[m], mult.filter((x) => x.o === 2).map((x) => x.loc), mult.filter((x) => x.o === 3).map((x) => x.loc), true)}-1-il`;
    if (o === 2) base = base.replace(/il$/, 'iliden');
    const nombre = prefijos + base;
    return prefijos || /\d/.test(base) ? complejo(nombre) : simple(nombre);
  }

  // Entre candidatos empatados, gana el que da el localizador más bajo al primero en orden alfabético.
  function desempateAlfabetico(cx, empatados) {
    if (empatados.length === 1) return empatados[0];
    let mejor = null;
    empatados.forEach((c) => {
      const lista = c.subs.filter((s) => typeof s.loc === 'number').map((s) => ({ ...nombrarRama(cx, s.b, s.a, s.o), loc: s.loc }));
      lista.sort((x, y) => (claveAlfa(x) < claveAlfa(y) ? -1 : claveAlfa(x) > claveAlfa(y) ? 1 : x.loc - y.loc));
      const t = lista.map((x) => x.loc);
      if (!mejor || cmpLista(t, mejor.t) < 0) mejor = { t, c };
    });
    return mejor.c;
  }

  // «pent-1-en-4-in», «buta-1,3-dien», «hex-2-en»… (sin la vocal final).
  function insaturado(raiz, en, ins, conLocantes) {
    let s = raiz;
    const seg = (locs, nucleo, primero) => {
      const mult = locs.length > 1 ? MULT[locs.length] : '';
      const a = primero && locs.length > 1 ? 'a' : '';
      return `${a}${conLocantes ? `-${locs.join(',')}-` : ''}${mult}${nucleo}`;
    };
    if (en.length) s += seg(en, 'en', true);
    if (ins.length) s += seg(ins, 'in', !en.length);
    return s;
  }

  // ───────── Cadena principal y numeración ─────────
  function candidatos(cx) {
    const usable = (i) => cx.el(i) === 'C' && !cx.excluidos.has(i) && !cx.noCadena.has(i);
    const lista = [];
    cx.anillos.forEach((R) => {
      if (!R.atomos.every(usable)) return;
      const m = R.atomos.length;
      for (let k0 = 0; k0 < m; k0++) {
        [1, -1].forEach((dir) => {
          lista.push({ A: Array.from({ length: m }, (_, k) => R.atomos[(k0 + dir * k + m) % m]), anillo: R });
        });
      }
    });
    const aciclico = (i) => usable(i) && !cx.anillo.has(i);
    for (let s = 0; s < cx.n; s++) {
      if (!aciclico(s)) continue;
      const dfs = (camino, vistos) => {
        lista.push({ A: camino.slice(), anillo: null });
        const v = camino[camino.length - 1];
        cx.adj[v].forEach((w) => {
          if (!aciclico(w) || vistos.has(w)) return;
          vistos.add(w); camino.push(w);
          dfs(camino, vistos);
          camino.pop(); vistos.delete(w);
        });
      };
      dfs([s], new Set([s]));
    }
    return lista;
  }

  function evaluar(cx, cand) {
    const { A, anillo } = cand;
    const pos = new Map(A.map((x, i) => [x, i + 1]));
    const gf = [];
    const atomosGF = new Set(cx.excluidos);
    cx.principales.forEach((gr) => {
      if (gr.tipo === 'amina') {
        const c = gr.carbonos.find((x) => pos.has(x));
        if (c != null) { gf.push({ loc: pos.get(c), gr, exo: false }); atomosGF.add(gr.n); }
        return;
      }
      if (pos.has(gr.c)) { gf.push({ loc: pos.get(gr.c), gr, exo: false }); gr.atomos.forEach((x) => atomosGF.add(x)); return; }
      // En un anillo, el carbono del grupo (–COOH, –CHO…) queda fuera: sufijo «-carboxílico», etc.
      if (anillo && C1_FIJO.has(gr.tipo)) {
        const r = cx.adj[gr.c].find((x) => pos.has(x));
        if (r != null) { gf.push({ loc: pos.get(r), gr, exo: true }); atomosGF.add(gr.c); gr.atomos.forEach((x) => atomosGF.add(x)); }
      }
    });
    const multTodos = multiplesDe(cx, A, !!anillo);
    const mult = anillo?.aromatico ? [] : multTodos;
    const subs = sustituyentesDe(cx, A, atomosGF);
    // Sustituyentes sobre el N de aminas y amidas principales: localizador N. Si hay
    // varios N, se distinguen con el localizador de su carbono (N1, N2…).
    const conN = gf.filter(({ gr }) => gr.tipo === 'amina' || gr.tipo === 'amida');
    conN.forEach(({ gr, loc }) => {
      const N = gr.n;
      cx.adj[N].forEach((y) => {
        if (pos.has(y) || y === gr.c) return;
        subs.push({ loc: conN.length > 1 ? `N${loc}` : 'N', a: N, b: y, o: cx.ord[N][y] });
      });
    });
    const numericos = subs.filter((s) => typeof s.loc === 'number');
    const t = [
      -gf.length,
      anillo ? 0 : 1,
      -A.length,
      -multTodos.length,
      -multTodos.filter((x) => x.o === 2).length,
      gf.map((x) => x.loc).sort(cmpNum),
      mult.map((x) => x.loc),
      mult.filter((x) => x.o === 2).map((x) => x.loc),
      -subs.length,
      numericos.map((x) => x.loc).sort(cmpNum),
    ];
    return { ...cand, pos, gf, mult, subs, t };
  }

  // ───────── Nombre completo ─────────
  function nombrar(g) {
    if (!g.atoms.length) return { vacio: true };
    const cx = contexto(g);
    if (!g.atoms.some((a) => a.el === 'C')) fuera('La molécula no tiene carbono: no es un compuesto orgánico.');
    const evaluados = candidatos(cx).map((c) => evaluar(cx, c));
    if (!evaluados.length) fuera('No encuentro una cadena de carbono que nombrar.');
    let mejorT = null;
    let empatados = [];
    evaluados.forEach((e) => {
      const c = mejorT ? cmpTupla(e.t, mejorT) : -1;
      if (c < 0) { mejorT = e.t; empatados = [e]; } else if (c === 0) empatados.push(e);
    });
    const P = desempateAlfabetico(cx, empatados);
    return construir(cx, P);
  }

  function construir(cx, P) {
    const T = cx.principal && P.gf.length ? cx.principal : null;
    if (cx.principal && !P.gf.length) fuera('El grupo principal no queda en ninguna cadena que sepa nombrar.');
    const m = P.A.length;
    const aromatico = !!P.anillo?.aromatico;
    const numericos = P.subs.filter((s) => typeof s.loc === 'number');
    // Rasgos que llevan localizador: grupos principales, enlaces múltiples y sustituyentes.
    const F = P.gf.length + P.mult.length + numericos.length;
    const omitir = m === 1
      || (m === 2 && !P.anillo && F === 1)
      || (P.anillo && F === 1)
      || (m === 3 && !P.anillo && F === 1 && (T === 'cetona' || P.mult.length === 1));
    const sustituyentes = P.subs.map((s) => ({ ...nombrarRama(cx, s.b, s.a, s.o), loc: s.loc }));
    const prefijos = juntarPrefijos(sustituyentes, !omitir);

    // Base: raíz + insaturaciones (sin la vocal final).
    let base;
    if (aromatico) base = 'bencen';
    else {
      const en = P.mult.filter((x) => x.o === 2).map((x) => x.loc), ins = P.mult.filter((x) => x.o === 3).map((x) => x.loc);
      if (m > 20) fuera('Cadenas de más de 20 carbonos.');
      const raiz = (P.anillo ? 'ciclo' : '') + RAIZ[m];
      base = en.length || ins.length ? insaturado(raiz, en, ins, !omitir) : `${raiz}an`;
    }
    const conVocal = (b, s) => (vocal(s.replace(/^-[\dN,]+-/, '')) ? b + s : `${b}o${s}`);

    let nombre;
    let resto = '';
    if (!T) {
      nombre = prefijos + (aromatico ? 'benceno' : `${base}o`);
    } else {
      const k = P.gf.length;
      const exo = P.gf.some((x) => x.exo);
      if (aromatico && BENCENO[T] && k === 1) {
        const ret = BENCENO[T];
        nombre = T === 'acido' ? `ácido ${prefijos}${ret}` : prefijos + ret;
      } else {
        const suf = (exo ? SUFIJO_EXO[T] : SUFIJO[T]);
        const multSuf = (k > 1 ? MULT[k] : '') + suf;
        const sinLoc = omitir || exo || (!P.anillo && C1_FIJO.has(T));
        const locs = P.gf.map((x) => x.loc).sort(cmpNum).join(',');
        const s = sinLoc ? multSuf : `-${locs}-${multSuf}`;
        const nucleo = conVocal(aromatico ? 'bencen' : base, s);
        nombre = T === 'acido' ? `ácido ${prefijos}${nucleo}` : prefijos + nucleo;
      }
      if (T === 'ester') {
        const es = cx.principales[0];
        const al = nombrarAlquilo(cx, es.alquilo, es.oxigeno, 1);
        resto = ` de ${al.nombre}o`;
      }
    }
    nombre += resto;

    // Grafo con la numeración (mapas) para resaltar las partes del nombre.
    const g = Quimica.copiar(cx.g);
    g.atoms.forEach((a) => { a.map = 0; });
    P.A.forEach((x, i) => { g.atoms[x].map = i + 1; });
    let k = 100;
    cx.excluidos.forEach((x) => { if (cx.el(x) === 'C') g.atoms[x].map = k++; });
    return {
      nombre,
      grafo: g,
      principal: T ? NOMBRE_GF[T] : null,
      cadena: aromatico ? 'anillo de benceno' : `${P.anillo ? 'anillo' : 'cadena'} de ${m} carbono${m > 1 ? 's' : ''}`,
    };
  }

  // Envoltorio que nunca lanza: { nombre, grafo, … } | { fuera: motivo } | { vacio }.
  function nombrarSeguro(g) {
    try {
      return nombrar(g);
    } catch (e) {
      if (e instanceof Fuera) return { fuera: e.message };
      console.error(e);
      return { fuera: 'No he podido nombrar esta estructura.' };
    }
  }

  return { nombrar: nombrarSeguro };
})();
