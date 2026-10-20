// Utilidades químicas: RDKit (canónico, coordenadas, subestructuras),
// grafo molecular propio y dibujo en SVG (fórmula lineoangular).
'use strict';

const Quimica = (() => {
  const RDKIT_VERSION = '2024.3.5-1.0.0';
  const RDKIT_BASE = `https://unpkg.com/@rdkit/rdkit@${RDKIT_VERSION}/dist/`;
  let RD = null;

  async function iniciar() {
    if (!RD) RD = await window.initRDKitModule({ locateFile: (f) => RDKIT_BASE + f });
    return RD;
  }

  // ───────── RDKit ─────────
  function abrirMol(entrada) {
    let m = null;
    try { m = RD.get_mol(entrada); } catch (e) { m = null; }
    if (m && typeof m.is_valid === 'function' && !m.is_valid()) { m.delete(); return null; }
    return m;
  }

  function conMol(entrada, fn) {
    const m = abrirMol(entrada);
    if (!m) return null;
    try { return fn(m); } finally { m.delete(); }
  }

  // SMILES canónico SIN estereoquímica. Al leer un dibujo con coordenadas, RDKit
  // deduce E/Z de la geometría de los dobles enlaces; como la constitución es lo
  // único que se compara, se quitan los marcadores / \ @ y se vuelve a canonizar.
  function canonico(entrada) {
    const s = conMol(entrada, (m) => m.get_smiles());
    if (!s || !/[/\\@]/.test(s)) return s;
    return conMol(s.replace(/[/\\]/g, '').replace(/@+/g, ''), (m) => m.get_smiles());
  }

  function contarCoincidencias(entrada, smarts) {
    let q = null;
    try { q = RD.get_qmol(smarts); } catch (e) { return 0; }
    if (!q) return 0;
    try {
      const n = conMol(entrada, (m) => {
        const r = JSON.parse(m.get_substruct_matches(q) || '[]');
        return Array.isArray(r) ? r.length : (r && r.atoms ? 1 : 0);
      });
      return n || 0;
    } finally { q.delete(); }
  }

  const quitarMapas = (s) => s.replace(/:\d+\]/g, ']');

  // Mapas de átomo en el orden en que RDKit numera los átomos del SMILES.
  function mapasSmiles(s) {
    const mapas = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '[') {
        const j = s.indexOf(']', i);
        const m = s.slice(i + 1, j).match(/:(\d+)$/);
        mapas.push(m ? +m[1] : 0);
        i = j + 1;
        continue;
      }
      const dos = s.slice(i, i + 2);
      if (dos === 'Cl' || dos === 'Br') { mapas.push(0); i += 2; continue; }
      if ('BCNOPSFIbcnops'.includes(c)) mapas.push(0);
      i++;
    }
    return mapas;
  }

  // ───────── Molfile ─────────
  const CARGA_V2000 = { 1: 3, 2: 2, 3: 1, 5: -1, 6: -2, 7: -3 };

  function leerMolblock(mb) {
    const L = mb.split(/\r?\n/);
    const na = parseInt(L[3].slice(0, 3), 10);
    const nb = parseInt(L[3].slice(3, 6), 10);
    const atoms = [];
    const bonds = [];
    for (let k = 0; k < na; k++) {
      const l = L[4 + k];
      atoms.push({
        x: parseFloat(l.slice(0, 10)),
        y: -parseFloat(l.slice(10, 20)),
        el: l.slice(31, 34).trim(),
        charge: CARGA_V2000[parseInt(l.slice(36, 39), 10)] || 0,
        map: 0,
      });
    }
    for (let k = 0; k < nb; k++) {
      const l = L[4 + na + k];
      const estereo = parseInt(l.slice(9, 12), 10) || 0; // 1 = cuña, 6 = cuña rayada
      bonds.push({ a: parseInt(l.slice(0, 3), 10) - 1, b: parseInt(l.slice(3, 6), 10) - 1, order: parseInt(l.slice(6, 9), 10), estereo });
    }
    for (let k = 4 + na + nb; k < L.length; k++) {
      const l = L[k];
      if (!l.startsWith('M  CHG')) continue;
      const n = parseInt(l.slice(6, 9), 10);
      for (let t = 0; t < n; t++) {
        const idx = parseInt(l.slice(9 + 8 * t, 13 + 8 * t), 10);
        atoms[idx - 1].charge = parseInt(l.slice(13 + 8 * t, 17 + 8 * t), 10);
      }
    }
    return { atoms, bonds };
  }

  function aMolblock(g) {
    const f = (n, w) => String(n).padStart(w);
    const L = ['', '  nomenclatura', ''];
    L.push(`${f(g.atoms.length, 3)}${f(g.bonds.length, 3)}  0  0  0  0  0  0  0  0999 V2000`);
    g.atoms.forEach((a) => {
      L.push(`${a.x.toFixed(4).padStart(10)}${(-a.y).toFixed(4).padStart(10)}${'0.0000'.padStart(10)} ${a.el.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`);
    });
    g.bonds.forEach((b) => L.push(`${f(b.a + 1, 3)}${f(b.b + 1, 3)}${f(b.order, 3)}  0`));
    const cargas = g.atoms.map((a, i) => [i + 1, a.charge || 0]).filter((x) => x[1]);
    for (let k = 0; k < cargas.length; k += 8) {
      const p = cargas.slice(k, k + 8);
      L.push('M  CHG' + f(p.length, 3) + p.map(([i, c]) => ' ' + f(i, 3) + ' ' + f(c, 3)).join(''));
    }
    L.push('M  END');
    return L.join('\n');
  }

  // Escala a longitud de enlace 1, gira el eje principal a horizontal y lleva a origen.
  function normalizar(g) {
    if (!g.atoms.length) return g;
    if (g.bonds.length) {
      const media = g.bonds.reduce((s, b) => s + Math.hypot(g.atoms[b.a].x - g.atoms[b.b].x, g.atoms[b.a].y - g.atoms[b.b].y), 0) / g.bonds.length;
      if (media > 0) g.atoms.forEach((a) => { a.x /= media; a.y /= media; });
    }
    const n = g.atoms.length;
    const cx = g.atoms.reduce((s, a) => s + a.x, 0) / n;
    const cy = g.atoms.reduce((s, a) => s + a.y, 0) / n;
    let sxx = 0, syy = 0, sxy = 0;
    g.atoms.forEach((a) => { const x = a.x - cx, y = a.y - cy; sxx += x * x; syy += y * y; sxy += x * y; });
    const th = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const c = Math.cos(-th), s = Math.sin(-th);
    g.atoms.forEach((a) => {
      const x = a.x - cx, y = a.y - cy;
      a.x = x * c - y * s;
      a.y = x * s + y * c;
    });
    return aOrigen(g);
  }

  function aOrigen(g) {
    const minx = Math.min(...g.atoms.map((a) => a.x));
    const miny = Math.min(...g.atoms.map((a) => a.y));
    g.atoms.forEach((a) => { a.x -= minx; a.y -= miny; });
    return g;
  }

  function grafoDeSmiles(smilesConMapas) {
    const mb = conMol(quitarMapas(smilesConMapas), (m) => {
      try { m.set_new_coords(true); } catch (e) { /* coordenadas por defecto */ }
      return m.get_molblock();
    });
    if (!mb) return null;
    const g = leerMolblock(mb);
    const mapas = mapasSmiles(smilesConMapas);
    if (mapas.length !== g.atoms.length) console.warn('Mapas y átomos no coinciden en', smilesConMapas);
    g.atoms.forEach((a, i) => { a.map = mapas[i] || 0; });
    return normalizar(g);
  }

  // ───────── Grafo ─────────
  const VALENCIAS = { C: [4], N: [3], O: [2], S: [2, 4, 6], P: [3, 5], F: [1], Cl: [1], Br: [1], I: [1], B: [3] };

  function vecinos(g) {
    const adj = g.atoms.map(() => []);
    g.bonds.forEach((b) => { adj[b.a].push(b.b); adj[b.b].push(b.a); });
    return adj;
  }

  const sumaEnlaces = (g, i) => g.bonds.reduce((s, b) => s + (b.a === i || b.b === i ? b.order : 0), 0);

  function valencias(at) {
    const c = at.charge || 0;
    const base = VALENCIAS[at.el] || [4];
    if (!c) return base;
    if (at.el === 'C') return [3];
    return base.map((v) => v + c);
  }

  function hidrogenos(g, i) {
    const s = sumaEnlaces(g, i);
    const v = valencias(g.atoms[i]).find((x) => x >= s);
    return v === undefined ? 0 : v - s;
  }

  const excedeValencia = (g, i) => sumaEnlaces(g, i) > Math.max(...valencias(g.atoms[i]));

  function contarElementos(g) {
    const c = {};
    g.atoms.forEach((a, i) => {
      c[a.el] = (c[a.el] || 0) + 1;
      const h = hidrogenos(g, i);
      if (h) c.H = (c.H || 0) + h;
    });
    return c;
  }

  function formula(g) {
    const c = contarElementos(g);
    const orden = Object.keys(c).sort((x, y) => {
      const p = (k) => (k === 'C' ? 0 : k === 'H' ? 1 : 2);
      return p(x) - p(y) || x.localeCompare(y);
    });
    return orden.map((k) => k + (c[k] > 1 ? `<sub>${c[k]}</sub>` : '')).join('');
  }

  function componentes(g) {
    const padre = g.atoms.map((_, i) => i);
    const raiz = (i) => (padre[i] === i ? i : (padre[i] = raiz(padre[i])));
    g.bonds.forEach((b) => { padre[raiz(b.a)] = raiz(b.b); });
    return new Set(g.atoms.map((_, i) => raiz(i))).size;
  }

  function enlacesEnAnillo(g, adj) {
    const res = new Set();
    g.bonds.forEach((b, k) => {
      const visto = new Set([b.a]);
      const cola = [b.a];
      while (cola.length) {
        const x = cola.shift();
        for (const y of adj[x]) {
          if ((x === b.a && y === b.b) || (x === b.b && y === b.a) || visto.has(y)) continue;
          if (y === b.b) { res.add(k); cola.length = 0; break; }
          visto.add(y);
          cola.push(y);
        }
      }
    });
    return res;
  }

  // ───────── Dibujo SVG ─────────
  function etiquetaAtomo(g, i, adj) {
    const a = g.atoms[i];
    if (a.el === 'C' && adj[i].length > 0 && !a.charge) return null;
    let dx = 0;
    adj[i].forEach((j) => { dx += g.atoms[j].x - a.x; });
    return { el: a.el, h: hidrogenos(g, i), izq: adj[i].length > 0 && dx > 0.15, carga: a.charge || 0 };
  }

  const recorte = (e) => (e ? (e.el.length > 1 ? 0.42 : 0.32) : 0);

  function lineasEnlace(g, k, adj, etq, anillo) {
    const b = g.bonds[k];
    const A = g.atoms[b.a], B = g.atoms[b.b];
    let dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const ra = recorte(etq[b.a]), rb = recorte(etq[b.b]);
    const x1 = A.x + dx * ra, y1 = A.y + dy * ra, x2 = B.x - dx * rb, y2 = B.y - dy * rb;
    const nx = -dy, ny = dx;
    const desplaza = (d, ca = 0, cb = 0) => [x1 + dx * ca + nx * d, y1 + dy * ca + ny * d, x2 - dx * cb + nx * d, y2 - dy * cb + ny * d];
    if (b.order === 3) return [[x1, y1, x2, y2], desplaza(0.14), desplaza(-0.14)];
    if (b.order !== 2) return [[x1, y1, x2, y2]];
    let lado = 0;
    const cuenta = (i, otro) => adj[i].forEach((j) => {
      if (j !== otro) lado += Math.sign((g.atoms[j].x - A.x) * nx + (g.atoms[j].y - A.y) * ny);
    });
    cuenta(b.a, b.b);
    cuenta(b.b, b.a);
    if (lado === 0 && !anillo.has(k)) return [desplaza(0.08), desplaza(-0.08)];
    if (lado === 0) lado = 1;
    const s = Math.sign(lado);
    return [[x1, y1, x2, y2], desplaza(0.18 * s, etq[b.a] ? 0 : 0.15, etq[b.b] ? 0 : 0.15)];
  }

  // Enlace en perspectiva: cuña llena (hacia delante) o rayada (hacia atrás).
  // Estrecha en el átomo a (el estereocentro) y ancha en b.
  function cuña(g, b, etq, P, S) {
    const A = g.atoms[b.a], B = g.atoms[b.b];
    let dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    const rb = recorte(etq[b.b]);
    const x2 = B.x - dx * rb, y2 = B.y - dy * rb;
    const nx = -dy, ny = dx, w = 0.13;
    if (b.estereo === 1) {
      const pts = [[A.x, A.y], [x2 + nx * w, y2 + ny * w], [x2 - nx * w, y2 - ny * w]];
      return `<polygon class="cuna" points="${pts.map(([x, y]) => `${P(x)},${P(y)}`).join(' ')}"/>`;
    }
    let h = '';
    const n = 6;
    for (let t = 1; t <= n; t++) {
      const f = t / n;
      const cx = A.x + (x2 - A.x) * f, cy = A.y + (y2 - A.y) * f;
      h += `<line class="enlace" x1="${P(cx + nx * w * f)}" y1="${P(cy + ny * w * f)}" x2="${P(cx - nx * w * f)}" y2="${P(cy - ny * w * f)}" stroke-width="${(0.045 * S).toFixed(2)}"/>`;
    }
    return h;
  }

  // Descriptores CIP calculados por RDKit: { atomos: {idx: 'R'|'S'}, enlaces: [{a, b, d: 'E'|'Z'}] }
  function descriptores(smiles) {
    return conMol(smiles, (m) => {
      const t = JSON.parse(m.get_stereo_tags());
      const atomos = {};
      (t.CIP_atoms || []).forEach(([i, d]) => { atomos[i] = d.replace(/[()]/g, ''); });
      const enlaces = (t.CIP_bonds || []).map(([a, b, d]) => ({ a, b, d: d.replace(/[()]/g, '') }));
      return { atomos, enlaces };
    });
  }

  function cajaVista(g, S, margen = 0.85) {
    if (!g.atoms.length) return { x: 0, y: 0, w: 4 * S, h: 3 * S };
    const xs = g.atoms.map((a) => a.x), ys = g.atoms.map((a) => a.y);
    const minx = Math.min(...xs) - margen, maxx = Math.max(...xs) + margen;
    const miny = Math.min(...ys) - margen, maxy = Math.max(...ys) + margen;
    return { x: minx * S, y: miny * S, w: (maxx - minx) * S, h: (maxy - miny) * S };
  }

  // o: { S, resaltes:[{atoms:Set,bonds:Set,color,opacidad}], locantes, hoverAtomo, hoverEnlace, errores:[], preview }
  function svgMolecula(g, o = {}) {
    const S = o.S || 40;
    const P = (v) => (v * S).toFixed(1);
    const adj = vecinos(g);
    const anillo = enlacesEnAnillo(g, adj);
    const etq = g.atoms.map((_, i) => etiquetaAtomo(g, i, adj));
    let h = '';

    (o.resaltes || []).forEach((r) => {
      if (!r) return;
      h += `<g opacity="${r.opacidad ?? 0.3}" style="color:${r.color}">`;
      r.bonds.forEach((k) => {
        const b = g.bonds[k];
        const A = g.atoms[b.a], B = g.atoms[b.b];
        h += `<line x1="${P(A.x)}" y1="${P(A.y)}" x2="${P(B.x)}" y2="${P(B.y)}" style="stroke:currentColor" stroke-width="${(0.36 * S).toFixed(1)}" stroke-linecap="round"/>`;
      });
      r.atoms.forEach((i) => {
        const a = g.atoms[i];
        h += `<circle cx="${P(a.x)}" cy="${P(a.y)}" r="${(0.3 * S).toFixed(1)}" style="fill:currentColor"/>`;
      });
      h += '</g>';
    });

    g.bonds.forEach((b, k) => {
      const cls = 'enlace' + (o.hoverEnlace === k ? ' hover' : '');
      if (b.order === 1 && (b.estereo === 1 || b.estereo === 6)) {
        h += cuña(g, b, etq, P, S);
        return;
      }
      lineasEnlace(g, k, adj, etq, anillo).forEach(([x1, y1, x2, y2]) => {
        h += `<line class="${cls}" x1="${P(x1)}" y1="${P(y1)}" x2="${P(x2)}" y2="${P(y2)}" stroke-width="${(0.055 * S).toFixed(2)}"/>`;
      });
    });

    const fs = (0.46 * S).toFixed(1);
    g.atoms.forEach((a, i) => {
      const e = etq[i];
      if (!e) return;
      const cls = `atomo el-${a.el}`;
      h += `<text class="${cls}" x="${P(a.x)}" y="${P(a.y)}" font-size="${fs}" text-anchor="middle" dominant-baseline="central">${a.el}</text>`;
      if (e.h > 0) {
        const w = a.el.length > 1 ? 0.25 : 0.19;
        const hx = e.izq ? a.x - w : a.x + w;
        const sub = e.h > 1 ? `<tspan font-size="${(0.32 * S).toFixed(1)}" dy="${(0.13 * S).toFixed(1)}">${e.h}</tspan>` : '';
        h += `<text class="${cls}" x="${P(hx)}" y="${P(a.y)}" font-size="${fs}" text-anchor="${e.izq ? 'end' : 'start'}" dominant-baseline="central">H${sub}</text>`;
      }
      if (e.carga) {
        const signo = e.carga > 0 ? '+' : '−';
        const n = Math.abs(e.carga) > 1 ? Math.abs(e.carga) : '';
        const cx = e.h > 0 && !e.izq ? a.x + 0.62 : a.x + 0.3;
        h += `<text class="${cls} carga" x="${P(cx)}" y="${P(a.y - 0.28)}" font-size="${(0.3 * S).toFixed(1)}" text-anchor="middle" dominant-baseline="central">${n}${signo}</text>`;
      }
    });

    if (o.locantes) {
      g.atoms.forEach((a, i) => {
        if (!(a.map > 0 && a.map < 100)) return;
        // En el centro del mayor hueco entre enlaces.
        const angs = adj[i].map((j) => Math.atan2(g.atoms[j].y - a.y, g.atoms[j].x - a.x)).sort((p, q) => p - q);
        let dir = -Math.PI / 2;
        if (angs.length === 1) dir = angs[0] + Math.PI;
        else if (angs.length > 1) {
          let hueco = -1;
          angs.forEach((t, k) => {
            const sig = k + 1 < angs.length ? angs[k + 1] : angs[0] + 2 * Math.PI;
            if (sig - t > hueco) { hueco = sig - t; dir = (t + sig) / 2; }
          });
        }
        const ux = Math.cos(dir), uy = Math.sin(dir);
        const d = etq[i] ? 0.7 : 0.42;
        h += `<text class="locante" x="${P(a.x + ux * d)}" y="${P(a.y + uy * d)}" font-size="${(0.3 * S).toFixed(1)}" text-anchor="middle" dominant-baseline="central">${a.map}</text>`;
      });
    }

    (o.etiquetas || []).forEach((t) => {
      h += `<text class="${t.clase || 'prioridad'}" x="${P(t.x)}" y="${P(t.y)}" font-size="${(0.42 * S).toFixed(1)}" text-anchor="middle" dominant-baseline="central">${t.texto}</text>`;
    });

    (o.errores || []).forEach((i) => {
      const a = g.atoms[i];
      h += `<circle class="error" cx="${P(a.x)}" cy="${P(a.y)}" r="${(0.34 * S).toFixed(1)}"/>`;
    });
    if (o.hoverAtomo != null && g.atoms[o.hoverAtomo]) {
      const a = g.atoms[o.hoverAtomo];
      h += `<circle class="hover-atomo" cx="${P(a.x)}" cy="${P(a.y)}" r="${(0.3 * S).toFixed(1)}"/>`;
    }
    if (o.preview) {
      const p = o.preview;
      h += `<line class="preview" x1="${P(p.x1)}" y1="${P(p.y1)}" x2="${P(p.x2)}" y2="${P(p.y2)}" stroke-width="${(0.055 * S).toFixed(2)}"/>`;
      h += `<circle class="preview-punto" cx="${P(p.x2)}" cy="${P(p.y2)}" r="${(0.12 * S).toFixed(1)}"/>`;
    }
    return h;
  }

  // Dibuja ajustando el viewBox al tamaño de la molécula.
  function pintarEn(svg, g, o = {}) {
    const S = o.S || 44;
    const v = cajaVista(g, S, o.margen);
    svg.setAttribute('viewBox', `${v.x.toFixed(1)} ${v.y.toFixed(1)} ${v.w.toFixed(1)} ${v.h.toFixed(1)}`);
    svg.style.width = `${Math.round(v.w)}px`;
    svg.style.maxWidth = '100%';
    svg.innerHTML = svgMolecula(g, { ...o, S });
  }

  const copiar = (g) => ({ atoms: g.atoms.map((a) => ({ ...a })), bonds: g.bonds.map((b) => ({ ...b })) });

  return {
    iniciar, canonico, contarCoincidencias, quitarMapas, grafoDeSmiles, aMolblock,
    vecinos, hidrogenos, excedeValencia, contarElementos, formula, componentes,
    svgMolecula, pintarEn, copiar, aOrigen, descriptores, mapasSmiles,
  };
})();
