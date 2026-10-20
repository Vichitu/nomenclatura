// Análisis de nombres IUPAC (español): trocea el nombre en partes
// (localizadores, sustituyentes, cadena, insaturaciones, sufijo), relaciona
// cada parte con los átomos de la estructura y diagnostica respuestas.
'use strict';

const Nombre = (() => {
  // Sustituyentes (prefijos). el: primer átomo; nC: carbonos de la rama; ord: orden del enlace de unión.
  const SUST = {
    'terc-butil': { el: 'C', nC: 4 }, 'tert-butil': { el: 'C', nC: 4 }, 'sec-butil': { el: 'C', nC: 4 },
    isobutil: { el: 'C', nC: 4 }, isopropil: { el: 'C', nC: 3 },
    '(propan-2-il)': { el: 'C', nC: 3 }, '(1-metiletil)': { el: 'C', nC: 3 },
    metilideno: { el: 'C', nC: 1, ord: 2 }, metiliden: { el: 'C', nC: 1, ord: 2 },
    ciclohexil: { el: 'C', nC: 6 }, ciclopentil: { el: 'C', nC: 5 }, ciclopropil: { el: 'C', nC: 3 },
    fenil: { el: 'C', nC: 6 }, bencil: { el: 'C', nC: 7 }, vinil: { el: 'C', nC: 2 }, etenil: { el: 'C', nC: 2 }, alil: { el: 'C', nC: 3 },
    metoxi: { el: 'O', nC: 1 }, etoxi: { el: 'O', nC: 2 }, hidroxi: { el: 'O', nC: 0, ord: 1 }, oxo: { el: 'O', ord: 2 },
    amino: { el: 'N', nC: 0 }, nitro: { el: 'N' },
    cloro: { el: 'Cl' }, bromo: { el: 'Br' }, fluoro: { el: 'F' }, yodo: { el: 'I' }, iodo: { el: 'I' },
    metil: { el: 'C', nC: 1 }, etil: { el: 'C', nC: 2 }, propil: { el: 'C', nC: 3 }, butil: { el: 'C', nC: 4 },
    pentil: { el: 'C', nC: 5 }, hexil: { el: 'C', nC: 6 }, heptil: { el: 'C', nC: 7 }, octil: { el: 'C', nC: 8 },
  };
  const CLAVES_SUST = Object.keys(SUST).sort((a, b) => b.length - a.length);
  const MULT = ['tetrakis', 'tris', 'bis', 'tetra', 'penta', 'hexa', 'tri', 'di'];
  const MULT_N = { di: 2, bis: 2, tri: 3, tris: 3, tetra: 4, tetrakis: 4, penta: 5, hexa: 6 };

  const INSAT = ['dieno', 'dien', 'trieno', 'diino', 'eno', 'en', 'ino', 'in'];
  // Sufijos del grupo principal → tipo.
  const SUF = {
    'carbaldehído': 'al', carbaldehido: 'al', 'carboxílico': 'oico', carboxilico: 'oico', carbonitrilo: 'nitrilo',
    carboxamida: 'amida', carboxilato: 'oato', nitrilo: 'nitrilo', dioico: 'oico', oico: 'oico', oato: 'oato',
    amida: 'amida', diamina: 'amina', amina: 'amina', diona: 'ona', ona: 'ona', triol: 'ol', diol: 'ol', ol: 'ol', dial: 'al', al: 'al',
  };
  const CLAVES_SUF = Object.keys(SUF).sort((a, b) => b.length - a.length);
  const PALABRAS_CADENA = ['benceno', 'naftaleno', 'tolueno', 'estireno', 'xileno', 'anilina', 'anisol'];

  const GRUPO = {
    oico: { nombre: 'ácido carboxílico (–COOH)', como: '«ácido …-oico»', el: [{ el: 'O' }], requiere: { el: 'O', ord: 2 } },
    oato: { nombre: 'éster (–COO–R)', como: '«…-oato de R»', el: [{ el: 'O' }], requiere: { el: 'O', ord: 2 } },
    amida: { nombre: 'amida (–CONH₂)', como: 'sufijo «-amida»', el: [{ el: 'O', ord: 2 }, { el: 'N' }], requiere: { el: 'O', ord: 2 } },
    nitrilo: { nombre: 'nitrilo (–C≡N)', como: 'sufijo «-nitrilo»', el: [{ el: 'N', ord: 3 }] },
    al: { nombre: 'aldehído (–CHO)', como: 'sufijo «-al»', el: [{ el: 'O', ord: 2 }] },
    ona: { nombre: 'cetona (C=O)', como: 'sufijo «-ona»', el: [{ el: 'O', ord: 2 }] },
    ol: { nombre: 'alcohol (–OH)', como: 'sufijo «-ol»', el: [{ el: 'O', ord: 1 }] },
    amina: { nombre: 'amina (–NH₂)', como: 'sufijo «-amina»', el: [{ el: 'N' }] },
  };

  const PREFIJO = { 1: 'met', 2: 'et', 3: 'prop', 4: 'but', 5: 'pent', 6: 'hex', 7: 'hept', 8: 'oct', 9: 'non', 10: 'dec' };

  function normalizar(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[’‘´`]/g, "'").replace(/\s*-\s*/g, '-').replace(/\s*,\s*/g, ',')
      .replace(/\s+/g, ' ').replace(/tert-/g, 'terc-').replace(/iodo/g, 'yodo').replace(/\.$/, '').trim();
  }

  function buscarSustituyente(r) {
    for (const mult of ['', ...MULT]) {
      if (!r.startsWith(mult)) continue;
      for (const clave of CLAVES_SUST) {
        if (r.startsWith(mult + clave)) return { len: mult.length + clave.length, base: clave, mult };
      }
    }
    return null;
  }

  function clasificarPalabra(w) {
    if (INSAT.includes(w)) return [{ k: 'insat', t: w }];
    if (SUF[w]) return [{ k: 'suf', t: w, tipo: SUF[w] }];
    if (PALABRAS_CADENA.includes(w) || w.endsWith('ano')) return [{ k: 'cadena', t: w }];
    for (const suf of CLAVES_SUF) {
      if (w.endsWith(suf) && w.length > suf.length + 1) return [{ k: 'cadena', t: w.slice(0, -suf.length) }, { k: 'suf', t: suf, tipo: SUF[suf] }];
    }
    for (const ins of ['dieno', 'eno', 'ino']) {
      if (w.endsWith(ins) && w.length > ins.length + 1) return [{ k: 'cadena', t: w.slice(0, -ins.length) }, { k: 'insat', t: ins }];
    }
    return [{ k: 'cadena', t: w }];
  }

  // Devuelve [{k, t, locs, base, ...}] cuya concatenación de `t` es el nombre original.
  function segmentar(nombre) {
    const s = (nombre || '').trim();
    const low = s.toLowerCase();
    const partes = [];
    let i = 0;
    let loc = null;
    const push = (k, desde, hasta, extra = {}) => partes.push({ k, t: s.slice(desde, hasta), locs: [], ...extra });
    while (i < s.length) {
      const r = low.slice(i);
      let m;
      if (!loc && (m = r.match(/^[áa]cido\s+/))) { push('acido', i, i + m[0].length, { tipo: 'oico' }); i += m[0].length; continue; }
      if ((m = r.match(/^\s+de\s+\S.*$/))) { push('ester', i, s.length); i = s.length; continue; }
      if (!loc && (m = r.match(/^((?:\d+'?|n)(?:,(?:\d+'?|n))*)-/))) {
        loc = { desde: i, locs: m[1].split(',').map((x) => (x === 'n' ? 'N' : x)) };
        i += m[0].length;
        continue;
      }
      if (r[0] === '-' || r[0] === ' ') { push('sep', i, i + 1); i++; continue; }
      const sm = buscarSustituyente(r);
      if (sm) {
        const desde = loc ? loc.desde : i;
        push('sust', desde, i + sm.len, { locs: loc ? loc.locs : [], base: sm.base, mult: sm.mult, spec: SUST[sm.base] });
        loc = null;
        i += sm.len;
        continue;
      }
      m = r.match(/^[^\s-]+/);
      if (!m) { push('texto', i, i + 1); i++; continue; }
      let pos = i;
      clasificarPalabra(m[0]).forEach((p, k) => {
        const desde = k === 0 && loc ? loc.desde : pos;
        push(p.k, desde, pos + p.t.length, { tipo: p.tipo, locs: k === 0 && loc ? loc.locs : [] });
        pos += p.t.length;
      });
      loc = null;
      i += m[0].length;
    }
    if (loc) push('texto', loc.desde, s.length);
    return partes;
  }

  // ───────── Partes del nombre ↔ átomos ─────────
  function contexto(g) {
    const adj = Quimica.vecinos(g);
    const cadena = new Set(g.atoms.map((a, i) => (a.map > 0 && a.map < 100 ? i : -1)).filter((i) => i >= 0));
    const porMapa = {};
    g.atoms.forEach((a, i) => { if (a.map) porMapa[a.map] = i; });
    const orden = (i, j) => (g.bonds.find((b) => (b.a === i && b.b === j) || (b.a === j && b.b === i)) || {}).order || 0;
    return { g, adj, cadena, porMapa, orden };
  }

  function ramas(cx, ancla) {
    const { g, adj, cadena, orden } = cx;
    return adj[ancla].filter((j) => !cadena.has(j)).map((j) => {
      const atoms = new Set([j]);
      const cola = [j];
      while (cola.length) {
        const x = cola.shift();
        adj[x].forEach((y) => {
          if (y !== ancla && !cadena.has(y) && !atoms.has(y)) { atoms.add(y); cola.push(y); }
        });
      }
      const nC = [...atoms].filter((x) => g.atoms[x].el === 'C').length;
      return { atoms, primero: j, el: g.atoms[j].el, ord: orden(ancla, j), nC };
    });
  }

  const encaja = (rama, spec, estricto = true) => rama.el === spec.el
    && (spec.ord == null || rama.ord === spec.ord)
    && (!estricto || spec.nC == null || rama.nC === spec.nC);

  function conEnlaces(cx, atoms) {
    const bonds = new Set();
    cx.g.bonds.forEach((b, k) => { if (atoms.has(b.a) && atoms.has(b.b)) bonds.add(k); });
    return { atoms, bonds };
  }

  function resaltarSust(cx, p, usados) {
    const atoms = new Set();
    const veces = p.locs.length || MULT_N[p.mult] || 1;
    const anclasDe = (loc) => {
      if (loc === 'N') return cx.g.atoms.map((a, i) => (a.el === 'N' && !cx.cadena.has(i) ? i : -1)).filter((i) => i >= 0);
      if (loc != null && cx.porMapa[loc] != null) return [cx.porMapa[loc]];
      return [...cx.cadena];
    };
    for (let v = 0; v < veces; v++) {
      const loc = p.locs[v];
      let hecho = false;
      for (const estricto of [true, false]) {
        for (const ancla of anclasDe(loc)) {
          const r = ramas(cx, ancla).find((x) => !usados.has(x.primero) && encaja(x, p.spec, estricto));
          if (r) {
            usados.add(r.primero);
            atoms.add(ancla);
            r.atoms.forEach((x) => atoms.add(x));
            hecho = true;
            break;
          }
        }
        if (hecho) break;
      }
    }
    return conEnlaces(cx, atoms);
  }

  function resaltarGrupo(cx, tipo, locs) {
    const grupo = GRUPO[tipo] || GRUPO.ol;
    const atoms = new Set();
    const anclas = locs.length ? locs.map((l) => cx.porMapa[l]).filter((x) => x != null) : [...cx.cadena];
    const vecino = (ancla, s) => cx.adj[ancla].filter((j) => !cx.cadena.has(j) && encaja({ el: cx.g.atoms[j].el, ord: cx.orden(ancla, j) }, s, false));
    const directos = (ancla) => {
      if (grupo.requiere && !vecino(ancla, grupo.requiere).length) return [];
      return [...new Set(grupo.el.flatMap((s) => vecino(ancla, s)))];
    };
    anclas.forEach((a) => {
      const d = directos(a);
      if (d.length) { atoms.add(a); d.forEach((x) => atoms.add(x)); }
    });
    if (!atoms.size) {
      // Grupo con su propio carbono fuera de la cadena (-carbaldehído, -carboxílico, benzoico…)
      anclas.forEach((a) => {
        cx.adj[a].filter((c) => !cx.cadena.has(c) && cx.g.atoms[c].el === 'C').forEach((c) => {
          const d = directos(c);
          if (d.length) { atoms.add(a); atoms.add(c); d.forEach((x) => atoms.add(x)); }
        });
      });
    }
    return conEnlaces(cx, atoms);
  }

  function resaltarInsat(cx, locs) {
    const atoms = new Set();
    const multiples = cx.g.bonds.filter((b) => b.order > 1 && cx.cadena.has(b.a) && cx.cadena.has(b.b)
      && cx.g.atoms[b.a].el === 'C' && cx.g.atoms[b.b].el === 'C');
    multiples.forEach((b) => {
      const menor = Math.min(cx.g.atoms[b.a].map, cx.g.atoms[b.b].map);
      if (!locs.length || locs.includes(String(menor))) { atoms.add(b.a); atoms.add(b.b); }
    });
    return conEnlaces(cx, atoms);
  }

  function resaltados(partes, g) {
    const cx = contexto(g);
    if (!cx.cadena.size) g.atoms.forEach((_, i) => cx.cadena.add(i));
    const usados = new Set();
    return partes.map((p) => {
      switch (p.k) {
        case 'cadena': return conEnlaces(cx, new Set(cx.cadena));
        case 'sust': return resaltarSust(cx, p, usados);
        case 'insat': return resaltarInsat(cx, p.locs);
        case 'suf': return resaltarGrupo(cx, p.tipo, p.locs);
        case 'acido': return resaltarGrupo(cx, 'oico', []);
        case 'ester': {
          const atoms = new Set(g.atoms.map((a, i) => (a.map >= 100 ? i : -1)).filter((i) => i >= 0));
          [...atoms].forEach((i) => cx.adj[i].forEach((j) => { if (g.atoms[j].el === 'O') atoms.add(j); }));
          return conEnlaces(cx, atoms);
        }
        default: return null;
      }
    });
  }

  // ───────── Explicación paso a paso (orden de los apuntes) ─────────
  function analisis(mol, g) {
    const ref = mol.sis || mol.n;
    const partes = segmentar(ref);
    const cx = contexto(g);
    const grupo = partes.find((p) => p.k === 'acido') || partes.find((p) => p.k === 'suf');
    const tipo = grupo ? grupo.tipo : null;
    const cadenaC = [...cx.cadena].filter((i) => g.atoms[i].el === 'C');
    const enAnillo = cadenaC.length > 2 && g.bonds.filter((b) => cx.cadena.has(b.a) && cx.cadena.has(b.b)).length >= cx.cadena.size;
    const aromatico = enAnillo && cadenaC.length === 6 && g.bonds.filter((b) => cx.cadena.has(b.a) && cx.cadena.has(b.b) && b.order === 2).length === 3;
    const multiples = aromatico ? [] : g.bonds
      .filter((b) => b.order > 1 && cx.cadena.has(b.a) && cx.cadena.has(b.b) && g.atoms[b.a].el === 'C' && g.atoms[b.b].el === 'C')
      .map((b) => ({ orden: b.order, locs: [g.atoms[b.a].map, g.atoms[b.b].map].sort((x, y) => x - y) }))
      .sort((x, y) => x.locs[0] - y.locs[0]);
    const sustituyentes = partes.filter((p) => p.k === 'sust');
    return { partes, tipo, cadenaC: cadenaC.length, enAnillo, aromatico, multiples, sustituyentes, trivial: !cx.cadena.size };
  }

  const nombreSust = (p) => (p.mult || '') + p.base;
  const donde = (p) => (p.locs.length ? ` en ${p.locs.map((l) => (l === 'N' ? 'el N' : 'C' + l)).join(', ')}` : '');

  function pasos(mol, g) {
    const a = analisis(mol, g);
    const out = [];
    if (a.trivial) return ['Nombre trivial aceptado por la IUPAC: hay que conocerlo de memoria (ver «Algunos nombres triviales» en los apuntes).'];
    out.push(a.tipo
      ? `<b>Grupo funcional principal:</b> ${GRUPO[a.tipo].nombre} → ${GRUPO[a.tipo].como}.`
      : '<b>Grupo funcional principal:</b> ninguno (hidrocarburo) → terminación -ano / -eno / -ino.');
    if (a.aromatico) out.push('<b>Cadena principal:</b> anillo de benceno.');
    else out.push(`<b>Cadena principal:</b> ${a.cadenaC} carbonos → «${PREFIJO[a.cadenaC] || a.cadenaC}-»${a.enAnillo ? ' en anillo → «ciclo-»' : ''}.`);
    if (!a.aromatico) {
      out.push(a.multiples.length
        ? `<b>Insaturaciones:</b> ${a.multiples.map((m) => `${m.orden === 2 ? 'doble' : 'triple'} enlace C${m.locs[0]}–C${m.locs[1]}`).join('; ')} → ${a.multiples.some((m) => m.orden === 3) ? '-ino' : '-eno'}.`
        : '<b>Insaturaciones:</b> ninguna → «-an-».');
    }
    out.push('<b>Numeración:</b> desde el extremo que da el localizador más bajo al grupo principal; si empata, a las insaturaciones; después a los sustituyentes; y por último, al primero en orden alfabético.');
    out.push(a.sustituyentes.length
      ? `<b>Sustituyentes (orden alfabético):</b> ${a.sustituyentes.map((p) => nombreSust(p) + donde(p)).join(' · ')}.`
      : '<b>Sustituyentes:</b> ninguno.');
    return out;
  }

  // Pistas graduales según el modo.
  function pistas(mol, g, modo) {
    const a = analisis(mol, g);
    if (a.trivial) return ['Es un nombre trivial: búscalo en la tabla de nombres triviales de los apuntes.'];
    const lista = [];
    lista.push(a.tipo ? `Grupo principal: ${GRUPO[a.tipo].nombre}, se nombra con ${GRUPO[a.tipo].como}.` : 'No hay grupo funcional principal: es un hidrocarburo.');
    if (a.aromatico) lista.push({ texto: 'La cadena principal es un anillo de benceno.', cadena: true });
    else lista.push({ texto: `La cadena principal tiene ${a.cadenaC} carbonos («${PREFIJO[a.cadenaC] || a.cadenaC}-»)${a.enAnillo ? ' y forma un anillo' : ''}.`, cadena: true });
    if (modo === 'nombrar') {
      lista.push({ texto: 'Te marco la numeración correcta en el dibujo.', numeros: true });
      if (a.sustituyentes.length) lista.push(`Sustituyentes: ${a.sustituyentes.map(nombreSust).join(', ')}. Ordénalos alfabéticamente (los multiplicadores di-, tri-… no cuentan).`);
      else lista.push('No hay sustituyentes: solo cadena + insaturaciones + sufijo.');
    } else {
      if (a.multiples.length) lista.push(`Enlaces múltiples: ${a.multiples.map((m) => `${m.orden === 2 ? 'doble' : 'triple'} entre C${m.locs[0]} y C${m.locs[1]}`).join('; ')}.`);
      else if (!a.aromatico) lista.push('No hay dobles ni triples enlaces en la cadena principal.');
      if (a.sustituyentes.length) lista.push(`Sustituyentes: ${a.sustituyentes.map((p) => nombreSust(p) + donde(p)).join(' · ')}.`);
      else lista.push('No hay sustituyentes.');
    }
    return lista.map((x) => (typeof x === 'string' ? { texto: x } : x));
  }

  // ───────── Diagnóstico de una respuesta escrita ─────────
  function nucleo(p) {
    const t = normalizar(p.t).replace(/^((\d+'?|n)(,(\d+'?|n))*-)/, '');
    if (p.k === 'cadena') return 'cadena:' + t.replace(/(ano|an|a|o)$/, '');
    if (p.k === 'insat') return 'insat:' + t.replace(/o$/, '');
    if (p.k === 'sust') return 'sust:' + t;
    return p.k + ':' + t;
  }

  const sinLocantes = (p) => normalizar(p.t).replace(/^((\d+'?|n)(,(\d+'?|n))*-)/, '');
  const describir = (p) => ({
    sust: `el sustituyente «${normalizar(nombreSust(p))}»`,
    cadena: `la cadena «${sinLocantes(p)}-»`,
    insat: `la insaturación «-${sinLocantes(p)}»`,
    suf: `el sufijo «-${sinLocantes(p)}»`,
    acido: '«ácido»',
    ester: `«${normalizar(p.t)}»`,
  }[p.k] || `«${normalizar(p.t)}»`);

  function aceptados(mol) {
    return [mol.n, mol.sis, ...(mol.alt || [])].filter(Boolean);
  }

  function diagnostico(respuesta, mol) {
    const nu = normalizar(respuesta);
    if (!nu) return { estado: 'vacio' };
    const exacto = aceptados(mol).find((x) => normalizar(x) === nu);
    if (exacto) return { estado: 'ok', preferido: normalizar(mol.n) === nu || normalizar(mol.sis || '') === nu };

    const ref = mol.sis || mol.n;
    const pc = segmentar(ref).filter((p) => p.k !== 'sep');
    const pu = segmentar(respuesta).filter((p) => p.k !== 'sep');
    const locs = (p) => p.locs.join(',');
    const trozos = segmentar(respuesta).map((p) => {
      if (p.k === 'sep') return { t: p.t, estado: 'sep' };
      const iguales = pc.filter((q) => nucleo(q) === nucleo(p));
      if (iguales.some((q) => locs(q) === locs(p))) return { t: p.t, estado: 'bien' };
      return { t: p.t, estado: iguales.length ? 'loc' : 'mal' };
    });

    const mensajes = [];
    const sinLoc = (x) => normalizar(x).replace(/(^|-)(n)(,n)*-/g, '$1').replace(/[\d,'\-\s]/g, '');
    const nc = pc.map(nucleo), nuc = pu.map(nucleo);
    const multiset = (arr) => arr.slice().sort().join('|');
    const numeros = (x) => (normalizar(x).match(/\d+/g) || []).sort().join(',');
    const formatoAntiguo = pu.some((p) => p.k === 'cadena' && p.locs.length);
    const sinGuiones = (x) => normalizar(x).replace(/[-\s]/g, '');
    let tipo = 'otro';
    if (sinGuiones(respuesta) === sinGuiones(ref)) {
      tipo = 'guiones';
      mensajes.push(`Casi: solo fallan los <b>guiones</b>. El guion separa números de letras (3-metil); entre dos palabras unidas no se pone: <b>${ref}</b>.`);
    } else if (sinLoc(respuesta) === sinLoc(ref) && numeros(respuesta) === numeros(ref) && formatoAntiguo) {
      tipo = 'antiguo';
      mensajes.push(`Los localizadores son correctos, pero están colocados como en la nomenclatura antigua. Ahora cada localizador va justo delante de lo que indica: <b>${ref}</b>.`);
    } else if (sinLoc(respuesta) === sinLoc(ref)) {
      tipo = 'localizadores';
      mensajes.push('Has identificado bien la cadena, el grupo principal y los sustituyentes, pero <b>fallan los localizadores</b>. Revisa desde qué extremo numeras.');
    } else if (multiset(nc) === multiset(nuc)) {
      tipo = 'orden';
      mensajes.push('Tienes todas las piezas del nombre, pero <b>en otro orden</b>. Los sustituyentes van en orden alfabético y el sufijo del grupo principal al final.');
    } else {
      tipo = 'sustituyentes';
      const faltan = pc.filter((p) => !nuc.includes(nucleo(p)));
      const sobran = pu.filter((p) => !nc.includes(nucleo(p)));
      const cadenaRef = pc.find((p) => p.k === 'cadena');
      const cadenaUsr = pu.find((p) => p.k === 'cadena');
      if (cadenaRef && cadenaUsr && nucleo(cadenaRef) !== nucleo(cadenaUsr)) {
        tipo = 'cadena';
        mensajes.push('La <b>cadena principal</b> no es la correcta. Recuerda: primero la que contiene el grupo principal; después, la más larga.');
      }
      const sufRef = pc.find((p) => p.k === 'suf' || p.k === 'acido');
      const sufUsr = pu.find((p) => p.k === 'suf' || p.k === 'acido');
      if (sufRef && (!sufUsr || sufRef.tipo !== sufUsr.tipo)) {
        tipo = 'grupo';
        mensajes.push('Revisa el <b>grupo funcional principal</b>: es el de mayor prioridad en la tabla y es el único que va como sufijo.');
      }
      if (faltan.length) mensajes.push(`Falta: ${faltan.map(describir).join(', ')}.`);
      if (sobran.length) mensajes.push(`No encaja: ${sobran.map(describir).join(', ')}.`);
    }
    return { estado: 'mal', mensajes, trozos, tipo };
  }

  // ───────── Comparación detallada: qué hay que cambiar de `texto` para llegar a `ref` ─────────
  const NUM_PREFIJO = { hept: 7, pent: 5, prop: 3, oct: 8, non: 9, dec: 10, but: 4, hex: 6, met: 1, et: 2 };
  const cs = (locs) => locs.map((l) => (l === 'N' ? 'el N' : `C${l}`)).join(', ');

  function cadenaDe(p) {
    const t = normalizar(p.t);
    const sinCiclo = t.replace(/^ciclo/, '');
    if (/^(benc|benz|fen)/.test(sinCiclo)) return { n: 6, anillo: true };
    const k = Object.keys(NUM_PREFIJO).find((x) => sinCiclo.startsWith(x));
    return k ? { n: NUM_PREFIJO[k], anillo: t.startsWith('ciclo') } : null;
  }

  function mapaSustituyentes(partes) {
    const m = new Map();
    partes.filter((p) => p.k === 'sust').forEach((p) => {
      const base = normalizar(p.base);
      const v = m.get(base) || { locs: [], partes: [] };
      const n = p.locs.length || MULT_N[p.mult] || 1;
      v.locs.push(...(p.locs.length ? p.locs : Array(n).fill('?')));
      v.partes.push(p);
      m.set(base, v);
    });
    return m;
  }

  // Letra que decide el orden alfabético (sin terc-, sec-, n-).
  const letraOrden = (base) => base.replace(/^(terc|tert|sec|n)-/, '').replace(/^\(/, '');

  function comparar(texto, ref) {
    const util = (s) => segmentar(s).filter((p) => p.k !== 'sep' && p.k !== 'texto');
    const pu = util(texto), pc = util(ref);
    const dif = [];

    // 1. Grupo principal
    const grupoDe = (ps) => ps.find((p) => p.k === 'acido') || ps.find((p) => p.k === 'suf');
    const gu = grupoDe(pu), gc = grupoDe(pc);
    const formatoAntiguo = pu.some((p) => p.k === 'cadena' && p.locs.length);
    if (formatoAntiguo) {
      dif.push('<b>Formato:</b> estás usando la nomenclatura antigua (2-pentanol). Ahora cada localizador va justo delante de lo que indica: pentan-2-ol.');
    }
    if (gu?.tipo !== gc?.tipo) {
      if (gc) {
        dif.push(`<b>Grupo principal:</b> el grupo de mayor prioridad es: ${GRUPO[gc.tipo].nombre}, así que el nombre se construye con ${GRUPO[gc.tipo].como}`
          + (gu ? `, no con el sufijo de ${GRUPO[gu.tipo].nombre}. Los demás grupos se nombran como prefijos.` : '.'));
      } else {
        dif.push(`<b>Grupo principal:</b> la molécula correcta no tiene el grupo ${GRUPO[gu.tipo].nombre}, así que su nombre no lleva ese sufijo. (Los halógenos, los éteres y los alquilos van siempre como prefijos.)`);
      }
    } else if (gc && gc.locs.length && gc.locs.join() !== gu.locs.join() && !formatoAntiguo) {
      dif.push(`<b>Localizador del grupo principal:</b> el grupo ${GRUPO[gc.tipo].nombre} está en ${cs(gc.locs)}${gu.locs.length ? `, no en ${cs(gu.locs)}` : ''}. Numera desde el extremo que le dé el número más bajo.`);
    }

    // 2. Cadena principal
    const cu = pu.find((p) => p.k === 'cadena'), cc = pc.find((p) => p.k === 'cadena');
    const nu = cu && cadenaDe(cu), nc = cc && cadenaDe(cc);
    if (nu && nc && nu.n !== nc.n) {
      dif.push(`<b>Cadena principal:</b> tiene ${nc.n} carbonos («${PREFIJO[nc.n]}-»), no ${nu.n} («${PREFIJO[nu.n]}-»)`
        + (nc.anillo && !nu.anillo ? ' y forma un anillo («ciclo-»).' : nc.anillo ? '.' : '. Debe contener el grupo principal y, después, ser la más larga posible.'));
    } else if (nu && nc && nu.anillo !== nc.anillo) {
      dif.push(nc.anillo ? '<b>Cadena principal:</b> es un anillo, así que lleva el prefijo «ciclo-».' : '<b>Cadena principal:</b> es una cadena abierta: no lleva «ciclo-».');
    }

    // 3. Insaturaciones
    const insat = (ps) => ps.filter((p) => p.k === 'insat').map((p) => ({ t: normalizar(p.t).replace(/^[\d,]+-/, '').replace(/o$/, ''), locs: p.locs }));
    const iu = insat(pu), ic = insat(pc);
    const descInsat = (i) => `${i.t.includes('in') ? 'triple' : 'doble'} enlace${i.locs.length ? ` en ${cs(i.locs)}` : ''}`;
    const claveInsat = (i) => `${i.t}@${i.locs.join()}`;
    if (iu.map(claveInsat).join('|') !== ic.map(claveInsat).join('|')) {
      if (!ic.length) dif.push('<b>Insaturaciones:</b> la cadena principal no tiene dobles ni triples enlaces, así que la terminación es «-ano».');
      else if (!iu.length) dif.push(`<b>Insaturaciones:</b> falta indicar el ${ic.map(descInsat).join(' y el ')}.`);
      else dif.push(`<b>Insaturaciones:</b> debe ser ${ic.map(descInsat).join(' y ')}, no ${iu.map(descInsat).join(' y ')}. El localizador indica el primer carbono del enlace múltiple.`);
    }

    // 4. Sustituyentes y sus localizadores
    const su = mapaSustituyentes(pu), sc = mapaSustituyentes(pc);
    sc.forEach((v, base) => {
      const u = su.get(base);
      const conLocs = v.locs[0] !== '?';
      if (!u) {
        dif.push(v.locs.length > 1
          ? `<b>Sustituyentes:</b> faltan ${v.locs.length} grupos «${base}»${conLocs ? ` (en ${cs(v.locs)})` : ''}.`
          : `<b>Sustituyentes:</b> falta «${base}»${conLocs ? ` en ${cs(v.locs)}` : ''}.`);
      } else if (v.locs.length !== u.locs.length) {
        dif.push(`<b>Sustituyentes:</b> hay ${v.locs.length} grupo${v.locs.length > 1 ? 's' : ''} «${base}»${conLocs ? ` (${cs(v.locs)})` : ''}, no ${u.locs.length}.`);
      } else if (v.locs.join() !== u.locs.join()) {
        dif.push(`<b>Localizadores:</b> «${base}» va en ${cs(v.locs)}, no en ${cs(u.locs)}.`);
      } else if (v.locs.length > 1 && (u.partes.length > 1 || (u.partes[0].mult || '') !== (v.partes[0].mult || ''))) {
        dif.push(`<b>Multiplicadores:</b> con ${v.locs.length} grupos «${base}» se escribe todo junto con el multiplicador: «${v.partes[0].t}».`);
      }
    });
    su.forEach((v, base) => {
      if (!sc.has(base)) dif.push(`<b>Sustituyentes:</b> «${base}» no aparece en el nombre correcto${nu && nc && nu.n !== nc.n ? ' (con la cadena principal correcta, ese grupo forma parte de la cadena o cambia)' : ''}.`);
    });

    // 5. Éster
    const eu = pu.find((p) => p.k === 'ester'), ec = pc.find((p) => p.k === 'ester');
    if (ec && (!eu || normalizar(eu.t) !== normalizar(ec.t))) {
      dif.push(`<b>Éster:</b> el grupo unido al oxígeno se nombra al final: «${normalizar(ec.t).trim()}».`);
    }

    // 6. Orden alfabético (solo si todo lo demás está bien)
    const ordenU = pu.filter((p) => p.k === 'sust').map((p) => normalizar(p.base));
    const ordenC = pc.filter((p) => p.k === 'sust').map((p) => normalizar(p.base));
    if (!dif.length && ordenU.slice().sort().join() === ordenC.slice().sort().join() && ordenU.join() !== ordenC.join()) {
      const resalta = (b) => { const l = letraOrden(b); const i = b.indexOf(l); return `${b.slice(0, i)}<b><u>${l[0]}</u></b>${l.slice(1)}`; };
      dif.push(`<b>Orden alfabético:</b> los sustituyentes se citan por orden alfabético, sin contar los multiplicadores (di-, tri-…) ni terc-/sec-: ${ordenC.map(resalta).join(' → ')}.`);
    }

    // 7. Formato
    if (!dif.length) {
      const sinGuiones = (x) => normalizar(x).replace(/[-\s]/g, '');
      if (sinGuiones(texto) === sinGuiones(ref)) dif.push('<b>Guiones:</b> el guion separa números de letras («3-metil»); entre dos palabras unidas no se pone, y los números se separan con comas.');
      else dif.push('<b>Escritura:</b> revisa la ortografía comparando tu nombre con el correcto.');
    }
    return dif;
  }

  // Nombre correcto con las partes que había que cambiar marcadas.
  function marcarCorreccion(texto, ref) {
    const pu = segmentar(texto).filter((p) => p.k !== 'sep');
    const locs = (p) => p.locs.join(',');
    return segmentar(ref).map((p) => {
      if (p.k === 'sep') return { t: p.t, estado: 'sep' };
      const iguales = pu.filter((q) => nucleo(q) === nucleo(p));
      return { t: p.t, estado: iguales.some((q) => locs(q) === locs(p)) ? 'bien' : 'cambia' };
    });
  }

  return { segmentar, resaltados, pasos, pistas, diagnostico, normalizar, aceptados, nombreSust, comparar, marcarCorreccion };
})();
