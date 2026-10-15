// Editor de estructuras por piezas (fórmula lineoangular).
// Clic en un átomo: une la pieza seleccionada. Clic en un enlace: cambia su orden.
// Arrastrar desde un átomo: crea un enlace nuevo (o lo cierra con otro átomo).
'use strict';

const Editor = (() => {
  const R3 = Math.sqrt(3) / 2;

  // Fragmentos en coordenadas locales: el átomo de anclaje está en (0,0)
  // y el enlace de unión apunta hacia +x. Índice -1 = átomo de anclaje.
  const frag = (atoms, bonds) => ({
    atoms: atoms.map(([el, x, y, charge]) => ({ el, x, y, charge: charge || 0 })),
    bonds: bonds || [[-1, 0, 1]],
  });

  const HERRAMIENTAS = {
    C: { et: 'C', grupo: 'Átomos', titulo: 'Carbono: haz clic en un átomo para alargar la cadena', frag: frag([['C', 1, 0]]) },
    O: { et: 'O', grupo: 'Átomos', titulo: 'Oxígeno', frag: frag([['O', 1, 0]]) },
    N: { et: 'N', grupo: 'Átomos', titulo: 'Nitrógeno', frag: frag([['N', 1, 0]]) },
    S: { et: 'S', grupo: 'Átomos', titulo: 'Azufre', frag: frag([['S', 1, 0]]) },
    F: { et: 'F', grupo: 'Átomos', titulo: 'Flúor', frag: frag([['F', 1, 0]]) },
    Cl: { et: 'Cl', grupo: 'Átomos', titulo: 'Cloro', frag: frag([['Cl', 1, 0]]) },
    Br: { et: 'Br', grupo: 'Átomos', titulo: 'Bromo', frag: frag([['Br', 1, 0]]) },
    I: { et: 'I', grupo: 'Átomos', titulo: 'Yodo', frag: frag([['I', 1, 0]]) },

    doble: { et: '=', grupo: 'Enlaces', titulo: 'Doble enlace: clic en un enlace para hacerlo doble', orden: 2, frag: frag([['C', 1, 0]], [[-1, 0, 2]]) },
    triple: { et: '≡', grupo: 'Enlaces', titulo: 'Triple enlace: clic en un enlace para hacerlo triple', orden: 3, frag: frag([['C', 1, 0]], [[-1, 0, 3]]) },

    OH: { et: '–OH', grupo: 'Grupos', titulo: 'Hidroxilo', frag: frag([['O', 1, 0]]) },
    CO: { et: '=O', grupo: 'Grupos', titulo: 'Oxígeno con doble enlace (carbonilo)', frag: frag([['O', 1, 0]], [[-1, 0, 2]]) },
    CHO: { et: '–CHO', grupo: 'Grupos', titulo: 'Aldehído', frag: frag([['C', 1, 0], ['O', 1.5, R3]], [[-1, 0, 1], [0, 1, 2]]) },
    COOH: { et: '–COOH', grupo: 'Grupos', titulo: 'Ácido carboxílico', frag: frag([['C', 1, 0], ['O', 1.5, R3], ['O', 1.5, -R3]], [[-1, 0, 1], [0, 1, 2], [0, 2, 1]]) },
    NH2: { et: '–NH₂', grupo: 'Grupos', titulo: 'Amino', frag: frag([['N', 1, 0]]) },
    CN: { et: '–C≡N', grupo: 'Grupos', titulo: 'Nitrilo', frag: frag([['C', 1, 0], ['N', 2, 0]], [[-1, 0, 1], [0, 1, 3]]) },
    NO2: { et: '–NO₂', grupo: 'Grupos', titulo: 'Nitro', frag: frag([['N', 1, 0, 1], ['O', 1.5, R3], ['O', 1.5, -R3, -1]], [[-1, 0, 1], [0, 1, 2], [0, 2, 1]]) },

    metil: { et: 'metil', grupo: 'Sustituyentes', titulo: '–CH₃', frag: frag([['C', 1, 0]]) },
    etil: { et: 'etil', grupo: 'Sustituyentes', titulo: '–CH₂CH₃', frag: frag([['C', 1, 0], ['C', 1.5, R3]], [[-1, 0, 1], [0, 1, 1]]) },
    propil: { et: 'propil', grupo: 'Sustituyentes', titulo: '–CH₂CH₂CH₃', frag: frag([['C', 1, 0], ['C', 1.5, R3], ['C', 2.5, R3]], [[-1, 0, 1], [0, 1, 1], [1, 2, 1]]) },
    isopropil: { et: 'isopropil', grupo: 'Sustituyentes', titulo: '–CH(CH₃)₂', frag: frag([['C', 1, 0], ['C', 1.5, R3], ['C', 1.5, -R3]], [[-1, 0, 1], [0, 1, 1], [0, 2, 1]]) },
    tercbutil: { et: 'terc-butil', grupo: 'Sustituyentes', titulo: '–C(CH₃)₃', frag: frag([['C', 1, 0], ['C', 2, 0], ['C', 1.5, R3], ['C', 1.5, -R3]], [[-1, 0, 1], [0, 1, 1], [0, 2, 1], [0, 3, 1]]) },
    vinil: { et: 'vinil', grupo: 'Sustituyentes', titulo: '–CH=CH₂', frag: frag([['C', 1, 0], ['C', 1.5, R3]], [[-1, 0, 1], [0, 1, 2]]) },
    fenil: { et: 'fenil', grupo: 'Sustituyentes', titulo: '–C₆H₅ (anillo de benceno)', anillo: 6, aromatico: true },

    c3: { et: '△', grupo: 'Anillos', titulo: 'Ciclopropano', anillo: 3 },
    c4: { et: '□', grupo: 'Anillos', titulo: 'Ciclobutano', anillo: 4 },
    c5: { et: '⬠', grupo: 'Anillos', titulo: 'Ciclopentano', anillo: 5 },
    c6: { et: '⬡', grupo: 'Anillos', titulo: 'Ciclohexano', anillo: 6 },
    benceno: { et: 'benceno', grupo: 'Anillos', titulo: 'Benceno (anillo aromático)', anillo: 6, aromatico: true },

    mover: { et: '✥ mover', grupo: 'Edición', titulo: 'Arrastra átomos para recolocarlos' },
    borrar: { et: '⌫ borrar', grupo: 'Edición', titulo: 'Clic en un átomo o enlace para borrarlo' },
  };

  const ELEMENTOS = ['C', 'O', 'N', 'S', 'F', 'Cl', 'Br', 'I'];
  const dif = (a, b) => { let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };
  const cruz = (ax, ay, bx, by) => ax * by - ay * bx;

  function distSegmento(p, A, B) {
    const dx = B.x - A.x, dy = B.y - A.y;
    const t = Math.max(0, Math.min(1, ((p.x - A.x) * dx + (p.y - A.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p.x - (A.x + t * dx), p.y - (A.y + t * dy));
  }

  class Editor {
    constructor(svg, opciones = {}) {
      this.svg = svg;
      this.S = 40;
      this.g = { atoms: [], bonds: [] };
      this.herramienta = 'C';
      this.historial = [];
      this.alCambiar = opciones.alCambiar || (() => {});
      this.hover = null;
      this.arrastre = null;
      this.preview = null;
      svg.addEventListener('pointerdown', (e) => this._abajo(e));
      svg.addEventListener('pointermove', (e) => this._mover(e));
      svg.addEventListener('pointerup', (e) => this._arriba(e));
      svg.addEventListener('pointercancel', () => { this.arrastre = null; this.preview = null; this.render(); });
      svg.addEventListener('pointerleave', () => { if (!this.arrastre) { this.hover = null; this.render(); } });
      new ResizeObserver(() => this._ajustarVista()).observe(svg);
      this._ajustarVista();
    }

    // ───────── API ─────────
    usar(h) { this.herramienta = h; }
    grafo() { return Quimica.copiar(this.g); }
    vacio() { return this.g.atoms.length === 0; }
    limpiar(guardar = true) {
      if (guardar && !this.vacio()) this._guardar();
      this.g = { atoms: [], bonds: [] };
      this._cambio();
    }
    reiniciar() { this.historial = []; this.limpiar(false); }
    deshacer() {
      const prev = this.historial.pop();
      if (!prev) return;
      this.g = JSON.parse(prev);
      this._cambio();
    }
    centrar() {
      if (this.vacio()) return;
      const xs = this.g.atoms.map((a) => a.x), ys = this.g.atoms.map((a) => a.y);
      const dx = this.W / this.S / 2 - (Math.min(...xs) + Math.max(...xs)) / 2;
      const dy = this.H / this.S / 2 - (Math.min(...ys) + Math.max(...ys)) / 2;
      this._guardar();
      this.g.atoms.forEach((a) => { a.x += dx; a.y += dy; });
      this._cambio();
    }

    // ───────── Vista ─────────
    _ajustarVista() {
      const r = this.svg.getBoundingClientRect();
      this.W = r.width || 800;
      this.H = r.height || 400;
      this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
      this.render();
    }

    render() {
      const g = this.g;
      const errores = g.atoms.map((_, i) => i).filter((i) => Quimica.excedeValencia(g, i));
      let html = Quimica.svgMolecula(g, {
        S: this.S,
        hoverAtomo: this.hover?.tipo === 'atomo' ? this.hover.i : null,
        hoverEnlace: this.hover?.tipo === 'enlace' ? this.hover.i : null,
        errores,
        preview: this.preview,
      });
      if (this.vacio()) {
        html += `<text class="ayuda-lienzo" x="${this.W / 2}" y="${this.H / 2 - 12}" text-anchor="middle">Elige una pieza y haz clic aquí para empezar</text>`;
        html += `<text class="ayuda-lienzo sub" x="${this.W / 2}" y="${this.H / 2 + 14}" text-anchor="middle">clic en un átomo = unir pieza · clic en un enlace = doble/triple · arrastrar = enlace libre</text>`;
      }
      this.svg.innerHTML = html;
    }

    // ───────── Puntero ─────────
    _punto(e) {
      const pt = this.svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(this.svg.getScreenCTM().inverse());
      return { x: p.x / this.S, y: p.y / this.S };
    }

    _tocar(p, excluir = -1) {
      let mejor = null, dm = 0.4;
      this.g.atoms.forEach((a, i) => {
        const d = Math.hypot(a.x - p.x, a.y - p.y);
        if (i !== excluir && d < dm) { dm = d; mejor = { tipo: 'atomo', i }; }
      });
      if (mejor || excluir >= 0) return mejor;
      let de = 0.22;
      this.g.bonds.forEach((b, k) => {
        const d = distSegmento(p, this.g.atoms[b.a], this.g.atoms[b.b]);
        if (d < de) { de = d; mejor = { tipo: 'enlace', i: k }; }
      });
      return mejor;
    }

    _abajo(e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      this.svg.setPointerCapture(e.pointerId);
      const p = this._punto(e);
      this.arrastre = { p0: p, toque: this._tocar(p), movido: false, guardado: false };
    }

    _mover(e) {
      const p = this._punto(e);
      const d = this.arrastre;
      if (!d) {
        const t = this._tocar(p);
        if (JSON.stringify(t) !== JSON.stringify(this.hover)) { this.hover = t; this.render(); }
        return;
      }
      if (!d.movido && Math.hypot(p.x - d.p0.x, p.y - d.p0.y) > 0.3) d.movido = true;
      if (!d.movido || d.toque?.tipo !== 'atomo') return;
      const a = this.g.atoms[d.toque.i];
      if (this.herramienta === 'mover') {
        if (!d.guardado) { this._guardar(); d.guardado = true; }
        a.x = p.x;
        a.y = p.y;
        this.render();
        return;
      }
      if (this.herramienta === 'borrar') return;
      const dest = this._destino(d.toque.i, p);
      this.preview = { x1: a.x, y1: a.y, x2: dest.x, y2: dest.y };
      this.render();
    }

    _arriba(e) {
      const d = this.arrastre;
      this.arrastre = null;
      if (!d) return;
      const p = this._punto(e);
      if (!d.movido) { this._clic(d.toque, d.p0); return; }
      this.preview = null;
      const h = this.herramienta;
      if (d.toque?.tipo === 'atomo' && h !== 'mover' && h !== 'borrar') {
        const dest = this._destino(d.toque.i, p);
        const orden = HERRAMIENTAS[h].orden || 1;
        this._guardar();
        const j = dest.j != null ? dest.j : this._nuevoAtomo(ELEMENTOS.includes(h) ? h : 'C', dest.x, dest.y);
        this._enlazar(d.toque.i, j, orden);
        this._cambio();
        return;
      }
      if (d.guardado) this._cambio();
      else this.render();
    }

    _destino(i, p) {
      const t = this._tocar(p, i);
      if (t) return { j: t.i, x: this.g.atoms[t.i].x, y: this.g.atoms[t.i].y };
      const a = this.g.atoms[i];
      const paso = Math.PI / 6;
      const ang = Math.round(Math.atan2(p.y - a.y, p.x - a.x) / paso) * paso;
      return { j: null, x: a.x + Math.cos(ang), y: a.y + Math.sin(ang) };
    }

    _clic(toque, p) {
      const h = this.herramienta;
      const T = HERRAMIENTAS[h];
      if (h === 'mover') return;
      if (h === 'borrar') {
        if (!toque) return;
        this._guardar();
        if (toque.tipo === 'atomo') this._borrarAtomo(toque.i);
        else this.g.bonds.splice(toque.i, 1);
        this._cambio();
        return;
      }
      this._guardar();
      if (toque?.tipo === 'enlace') {
        const b = this.g.bonds[toque.i];
        if (T.anillo) this._fusionarAnillo(toque.i, T);
        else if (T.orden) b.order = b.order === T.orden ? 1 : T.orden;
        else b.order = (b.order % 3) + 1;
      } else if (toque?.tipo === 'atomo') {
        if (T.anillo) this._anilloUnido(toque.i, T);
        else this._unirFragmento(toque.i, T.frag);
      } else if (T.anillo) {
        this._anilloSuelto(p, T);
      } else {
        this._fragmentoSuelto(p, T.frag);
      }
      this._cambio();
    }

    // ───────── Modificaciones ─────────
    _guardar() {
      this.historial.push(JSON.stringify(this.g));
      if (this.historial.length > 100) this.historial.shift();
    }

    _cambio() {
      this.hover = null;
      this.render();
      this.alCambiar();
    }

    _vecinos(i) {
      const r = [];
      this.g.bonds.forEach((b) => { if (b.a === i) r.push(b.b); else if (b.b === i) r.push(b.a); });
      return r;
    }

    _nuevoAtomo(el, x, y, charge = 0) {
      const cerca = this.g.atoms.findIndex((a) => Math.hypot(a.x - x, a.y - y) < 0.3);
      if (cerca >= 0) return cerca;
      this.g.atoms.push({ el, x, y, charge });
      return this.g.atoms.length - 1;
    }

    _enlazar(i, j, orden = 1) {
      if (i === j) return;
      const b = this.g.bonds.find((x) => (x.a === i && x.b === j) || (x.a === j && x.b === i));
      if (b) { if (orden > 1) b.order = orden; return; }
      this.g.bonds.push({ a: i, b: j, order: orden });
    }

    _borrarAtomo(i) {
      this.g.bonds = this.g.bonds
        .filter((b) => b.a !== i && b.b !== i)
        .map((b) => ({ ...b, a: b.a > i ? b.a - 1 : b.a, b: b.b > i ? b.b - 1 : b.b }));
      this.g.atoms.splice(i, 1);
    }

    _distanciaMinima(puntos, excluir) {
      let dm = 9;
      puntos.forEach((q) => this.g.atoms.forEach((b, k) => {
        if (k !== excluir) dm = Math.min(dm, Math.hypot(b.x - q.x, b.y - q.y));
      }));
      return dm;
    }

    // Giro (signo) con el que se llega al átomo i desde su único vecino.
    _giroEntrada(i) {
      const v = this._vecinos(i);
      if (v.length !== 1) return 0;
      const k = v[0];
      const previos = this._vecinos(k).filter((x) => x !== i);
      if (!previos.length) return 0;
      const P = this.g.atoms[previos[0]], K = this.g.atoms[k], A = this.g.atoms[i];
      return Math.sign(cruz(K.x - P.x, K.y - P.y, A.x - K.x, A.y - K.y));
    }

    // Mejor dirección (radianes) para un enlace nuevo desde el átomo i.
    _direccion(i) {
      const a = this.g.atoms[i];
      const v = this._vecinos(i);
      if (!v.length) return -Math.PI / 6;
      const angs = v.map((j) => Math.atan2(this.g.atoms[j].y - a.y, this.g.atoms[j].x - a.x));
      const cands = v.length === 1
        ? [angs[0] + (2 * Math.PI) / 3, angs[0] - (2 * Math.PI) / 3]
        : Array.from({ length: 24 }, (_, k) => (k * Math.PI) / 12);
      const giro = this._giroEntrada(i);
      let mejor = cands[0], ms = -Infinity;
      for (const c of cands) {
        const q = { x: a.x + Math.cos(c), y: a.y + Math.sin(c) };
        const dm = this._distanciaMinima([q], i);
        let s = Math.min(...angs.map((x) => dif(c, x))) + (dm < 0.6 ? -5 : Math.min(dm, 1.5) * 0.3);
        if (v.length === 1) {
          const K = this.g.atoms[v[0]];
          const g2 = Math.sign(cruz(a.x - K.x, a.y - K.y, Math.cos(c), Math.sin(c)));
          if (giro && g2 === -giro) s += 0.5;
          // Sin giro previo: seguir avanzando en horizontal (zigzag clásico).
          if (!giro) s += 0.1 * Math.cos(c) * Math.sign(a.x - K.x || 1);
        }
        if (s > ms) { ms = s; mejor = c; }
      }
      return mejor;
    }

    _colocar(locales, bonds, ancla) {
      const idx = locales.map((p) => this._nuevoAtomo(p.el, p.x, p.y, p.charge));
      bonds.forEach(([x, y, o]) => this._enlazar(x < 0 ? ancla : idx[x], y < 0 ? ancla : idx[y], o));
    }

    _unirFragmento(i, f) {
      const a = this.g.atoms[i];
      const th = this._direccion(i);
      const c = Math.cos(th), s = Math.sin(th);
      const giro = this._giroEntrada(i) || (this._vecinos(i).length ? 0 : 1);
      let mejor = null, ms = -Infinity;
      for (const m of [1, -1]) {
        const pos = f.atoms.map((p) => ({ ...p, x: a.x + c * p.x - s * p.y * m, y: a.y + s * p.x + c * p.y * m }));
        const dm = this._distanciaMinima(pos, i);
        let sc = dm < 0.6 ? -5 + dm : Math.min(dm, 1.2);
        if (pos.length > 1) {
          const g2 = Math.sign(cruz(c, s, pos[1].x - pos[0].x, pos[1].y - pos[0].y));
          if (giro && g2 === -giro) sc += 0.3;
        }
        if (sc > ms) { ms = sc; mejor = pos; }
      }
      this._colocar(mejor, f.bonds, i);
    }

    _fragmentoSuelto(p, f) {
      const x0 = f.atoms[0].x, y0 = f.atoms[0].y;
      const c = Math.cos(-Math.PI / 6), s = Math.sin(-Math.PI / 6);
      const pos = f.atoms.map((q) => {
        const x = q.x - x0, y = q.y - y0;
        return { ...q, x: p.x + c * x - s * y, y: p.y + s * x + c * y };
      });
      const enlaces = f.bonds.filter(([x, y]) => x >= 0 && y >= 0);
      this._colocar(pos, enlaces, -1);
    }

    _cerrarAnillo(idx, aromatico, desfase = 0) {
      const n = idx.length;
      for (let k = 0; k < n; k++) {
        const orden = aromatico && (k + desfase) % 2 === 0 ? 2 : 1;
        this._enlazar(idx[k], idx[(k + 1) % n], orden);
      }
    }

    _anilloSuelto(p, T) {
      const n = T.anillo;
      const r = 1 / (2 * Math.sin(Math.PI / n));
      const ini = n === 4 ? -Math.PI / 4 : -Math.PI / 2;
      const idx = [];
      for (let k = 0; k < n; k++) {
        const t = ini + (2 * Math.PI * k) / n;
        idx.push(this._nuevoAtomo('C', p.x + r * Math.cos(t), p.y + r * Math.sin(t)));
      }
      this._cerrarAnillo(idx, T.aromatico);
    }

    _anilloUnido(i, T) {
      const a = this.g.atoms[i];
      const n = T.anillo;
      const th = this._direccion(i);
      const r = 1 / (2 * Math.sin(Math.PI / n));
      const cx = a.x + Math.cos(th) * (1 + r), cy = a.y + Math.sin(th) * (1 + r);
      const idx = [];
      for (let k = 0; k < n; k++) {
        const t = th + Math.PI + (2 * Math.PI * k) / n;
        idx.push(this._nuevoAtomo('C', cx + r * Math.cos(t), cy + r * Math.sin(t)));
      }
      this._enlazar(i, idx[0], 1);
      this._cerrarAnillo(idx, T.aromatico);
    }

    _fusionarAnillo(k, T) {
      const b = this.g.bonds[k];
      const A = this.g.atoms[b.a], B = this.g.atoms[b.b];
      const n = T.anillo;
      const L = Math.hypot(B.x - A.x, B.y - A.y) || 1;
      const nx = -(B.y - A.y) / L, ny = (B.x - A.x) / L;
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
      const apotema = 1 / (2 * Math.tan(Math.PI / n));
      const ocupacion = (sg) => this.g.atoms.filter((q) => Math.hypot(q.x - (mx + nx * sg * apotema), q.y - (my + ny * sg * apotema)) < 1.2).length;
      const sg = ocupacion(1) <= ocupacion(-1) ? 1 : -1;
      const cx = mx + nx * sg * apotema, cy = my + ny * sg * apotema;
      const r = Math.hypot(A.x - cx, A.y - cy);
      const angA = Math.atan2(A.y - cy, A.x - cx);
      let delta = Math.atan2(B.y - cy, B.x - cx) - angA;
      delta = Math.atan2(Math.sin(delta), Math.cos(delta));
      const cadena = [b.a];
      for (let t = 1; t <= n - 2; t++) {
        const ang = angA - t * delta;
        cadena.push(this._nuevoAtomo('C', cx + r * Math.cos(ang), cy + r * Math.sin(ang)));
      }
      cadena.push(b.b);
      for (let t = 0; t < cadena.length - 1; t++) {
        const orden = T.aromatico && (t + (b.order === 2 ? 1 : 0)) % 2 === 0 ? 2 : 1;
        this._enlazar(cadena[t], cadena[t + 1], orden);
      }
    }
  }

  return { Editor, HERRAMIENTAS };
})();
