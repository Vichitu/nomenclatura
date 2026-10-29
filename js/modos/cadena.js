// «Cadena principal» (apuntes, págs. 25-33): marcar la cadena principal sobre el
// dibujo y numerarla (clic en C1 y C2). Se aceptan las elecciones equivalentes por
// simetría (automorfismos del grafo). El orden de prioridad de los grupos está en
// el modo «Grupos funcionales».
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  // Criterios para elegir la cadena principal (págs. 25-31), en el orden de los apuntes.
  const CRITERIO_CADENA = {
    grupo: 'Debe contener el <b>grupo funcional de mayor rango</b> (regla a); entre las que lo contienen, gana la más larga.',
    anillo: 'Los <b>anillos tienen prioridad</b> sobre las cadenas abiertas aunque la cadena sea más larga (criterio de 2021).',
    larga: 'Gana la cadena con <b>más átomos</b> (criterio de 2021; antes primaban las insaturaciones).',
    multiples: 'Hay empate en número de átomos: gana la que tiene <b>más enlaces múltiples</b>.',
    insatLoc: 'Empate en átomos y en enlaces múltiples: gana la que deja las <b>insaturaciones con el número más bajo</b>.',
    sustituyentes: 'Empate en número de átomos: gana la que tiene <b>más sustituyentes</b>.',
    locSust: 'Empate en número de átomos y de sustituyentes: gana la que da los <b>localizadores más bajos a los sustituyentes</b>.',
  };
  // Criterios de numeración (págs. 32-33).
  const CRITERIO_NUM = {
    c1: 'El carbono del grupo principal (–COOH, –CHO…) es siempre el <b>C1</b>.',
    gf: 'Se numera desde el extremo que da el <b>localizador más bajo al grupo funcional principal</b>.',
    insat: 'Sin grupo principal que decida, el número más bajo es para las <b>insaturaciones</b>.',
    doble: 'Los enlaces múltiples empatan: el <b>doble enlace</b> recibe el número más bajo.',
    sust: 'Los <b>sustituyentes</b> reciben los localizadores más bajos (se comparan uno a uno: decide el primer punto de diferencia).',
    alfa: 'Los localizadores empatan: el número más bajo es para el sustituyente que va <b>primero alfabéticamente</b>.',
    anillo: 'En el anillo, el C1 es el carbono con el sustituyente y se sigue en el sentido que da los localizadores más bajos.',
    simetrica: 'La molécula es simétrica respecto a la cadena: da igual el extremo por el que empieces.',
  };

  // s: SMILES con la cadena principal numerada (mapas). Sin s, se toma del banco.
  const CADENAS = [
    { n: '3-etilpentano', cadena: 'larga', num: 'simetrica' },
    { n: '2,2,4-trimetilpentano', cadena: 'larga', num: 'sust' },
    { n: '3-etil-2-metilpentano', cadena: 'larga', num: 'sust' },
    { n: '4-etil-2-metilhexano', cadena: 'larga', num: 'sust' },
    { n: '2,3,5-trimetilhexano', cadena: 'larga', num: 'sust' },
    { n: '3-etil-4-metilhexano', cadena: 'larga', num: 'alfa' },
    { n: '5-etil-3-metiloctano', cadena: 'larga', num: 'sust' },
    { n: '4-isopropilheptano', cadena: 'larga', num: 'simetrica' },
    { n: '4-etenilnonano', s: '[CH3:1][CH2:2][CH2:3][CH:4](C=C)[CH2:5][CH2:6][CH2:7][CH2:8][CH3:9]', cadena: 'larga', num: 'sust', nota: 'Ejemplo de los apuntes: con el criterio anterior a 2021 se habría elegido la cadena con el doble enlace (3-propiloct-1-eno).' },
    { n: '3-metilidenhexano', cadena: 'larga', num: 'sust' },
    { n: '3-etilocta-1,4-dieno', s: '[CH2:1]=[CH:2][CH:3](CC)[CH:4]=[CH:5][CH2:6][CH2:7][CH3:8]', cadena: 'multiples', num: 'insat', nota: 'Ejemplo de los apuntes: la cadena por el etilo también tiene 8 C, pero solo un enlace doble (3-eteniloct-4-eno).' },
    { n: '4-(prop-1-en-1-il)non-1-eno', s: '[CH2:1]=[CH:2][CH2:3][CH:4](C=CC)[CH2:5][CH2:6][CH2:7][CH2:8][CH3:9]', cadena: 'insatLoc', num: 'insat', nota: 'Ejemplo de los apuntes: la otra cadena de 9 C tendría el doble enlace en C2 (non-2-eno).' },
    { n: '5-cloro-2,3-dimetil-4-propilheptano', s: '[CH3:1][CH:2](C)[CH:3](C)[CH:4](CCC)[CH:5](Cl)[CH2:6][CH3:7]', cadena: 'sustituyentes', num: 'sust', nota: 'Ejemplo de los apuntes: la otra cadena de 7 C solo tiene dos sustituyentes (3-cloro-4-(3-metilbutan-2-il)heptano).' },
    { n: '3,6-dimetil-5-(2-metilbutil)nonano', s: '[CH3:1][CH2:2][CH:3](C)[CH2:4][CH:5](CC(C)CC)[CH:6](C)[CH2:7][CH2:8][CH3:9]', cadena: 'locSust', num: 'sust', nota: 'Ejemplo de los apuntes: la otra cadena de 9 C con tres sustituyentes daría 3,5,7 (peor que 3,5,6).' },
    { n: 'hexilciclopropano', cadena: 'anillo', num: 'anillo' },
    { n: '1-etil-3-metilciclohexano', cadena: 'anillo', num: 'alfa' },
    { n: '2-metilbutan-1-ol', cadena: 'grupo', num: 'gf' },
    { n: '4-metilpentan-2-ol', cadena: 'larga', num: 'gf' },
    { n: 'but-3-en-2-ol', cadena: 'larga', num: 'gf' },
    { n: '5-metilhex-3-en-2-ol', cadena: 'larga', num: 'gf' },
    { n: '3-metilbut-1-eno', cadena: 'larga', num: 'insat' },
    { n: 'pent-1-en-4-ino', cadena: 'larga', num: 'doble' },
    { n: '4-hidroxibutan-2-ona', cadena: 'grupo', num: 'gf' },
    { n: 'N-etil-N-metilpropan-1-amina', cadena: 'larga', num: 'gf', nota: 'En las aminas, la cadena más importante unida al N es la principal; las demás se citan con el localizador N.' },
    { n: '3-oxobutanal', cadena: 'grupo', num: 'c1' },
    { n: 'ácido 4-oxopentanoico', cadena: 'grupo', num: 'c1' },
    { n: 'ácido 3-amino-2-(2-aminoetil)pentanoico', s: 'O[C:1](=O)[CH:2](CCN)[CH:3](N)[CH2:4][CH3:5]', cadena: 'grupo', num: 'c1', nota: 'Ejemplo de los apuntes: la cadena debe contener el –COOH; de las que lo contienen, la más larga tiene 5 C.' },
    { n: 'ácido 2-(2-hidroxietoxi)etanoico', s: 'OCCO[CH2:2][C:1](=O)O', cadena: 'grupo', num: 'c1', nota: 'Ejemplo de los apuntes (ácido (2-hidroxietoxi)acético): el O del éter corta la cadena, y la parte con el –COOH es la principal.' },
  ];

  // ───────── Simetría: automorfismos del grafo molecular ─────────
  function automorfismos(g, limite = 20000) {
    const n = g.atoms.length;
    const adj = Quimica.vecinos(g);
    const orden = Array.from({ length: n }, () => Array(n).fill(0));
    g.bonds.forEach((b) => { orden[b.a][b.b] = orden[b.b][b.a] = b.order; });
    const inv = g.atoms.map((a, i) => `${a.el}|${adj[i].length}|${Quimica.hidrogenos(g, i)}|${a.charge || 0}`);
    // Recorrido en anchura para que cada átomo tenga vecinos ya asignados.
    const sec = [];
    const visto = new Set();
    for (let r = 0; r < n; r++) {
      if (visto.has(r)) continue;
      visto.add(r);
      const cola = [r];
      while (cola.length) {
        const x = cola.shift();
        sec.push(x);
        adj[x].forEach((y) => { if (!visto.has(y)) { visto.add(y); cola.push(y); } });
      }
    }
    const res = [];
    const img = Array(n).fill(-1);
    const usado = Array(n).fill(false);
    const bt = (k) => {
      if (res.length >= limite) return;
      if (k === n) { res.push(img.slice()); return; }
      const i = sec[k];
      for (let j = 0; j < n; j++) {
        if (usado[j] || inv[j] !== inv[i]) continue;
        let ok = true;
        let asignados = 0;
        for (const v of adj[i]) {
          if (img[v] < 0) continue;
          asignados++;
          if (orden[j][img[v]] !== orden[i][v]) { ok = false; break; }
        }
        if (!ok || adj[j].filter((x) => usado[x]).length !== asignados) continue;
        img[i] = j; usado[j] = true;
        bt(k + 1);
        img[i] = -1; usado[j] = false;
      }
    };
    bt(0);
    return res;
  }

  const mismoConjunto = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));

  // ───────── Juego 1: marcar y numerar la cadena ─────────
  function prepararCadena(item) {
    if (!item._g) {
      const s = item.s || MOLECULAS.find((m) => m.n === item.n).s;
      item._g = Quimica.grafoDeSmiles(s);
      item._aut = automorfismos(item._g);
    }
    return item;
  }

  function cadenaCorrecta(g) {
    return new Set(g.atoms.map((a, i) => (a.map > 0 && a.map < 100 ? i : -1)).filter((i) => i >= 0));
  }

  function enlacesEntre(g, atoms) {
    const r = new Set();
    g.bonds.forEach((b, k) => { if (atoms.has(b.a) && atoms.has(b.b)) r.add(k); });
    return r;
  }

  // Copia con la numeración correcta trasladada a la cadena que eligió el alumno (σ).
  function numeracionSobre(g, sigma) {
    const c = Quimica.copiar(g);
    c.atoms.forEach((a) => { a.map = 0; });
    g.atoms.forEach((a, i) => { if (a.map > 0 && a.map < 100) c.atoms[sigma[i]].map = a.map; });
    return c;
  }

  function pintarCadena(ctx) {
    const e = ctx.est;
    const resaltes = [];
    let g = e.g;
    if (e.fase === 'cadena') {
      resaltes.push({ atoms: e.sel, bonds: enlacesEntre(e.g, e.sel), color: 'var(--acento)', opacidad: 0.45 });
    } else {
      resaltes.push({ atoms: e.cadena, bonds: enlacesEntre(e.g, e.cadena), color: 'var(--c-cadena)', opacidad: 0.3 });
      if (e.malSel) resaltes.push({ atoms: e.malSel, bonds: enlacesEntre(e.g, e.malSel), color: 'var(--mal)', opacidad: 0.35 });
    }
    if (e.fase === 'fin') g = numeracionSobre(e.g, e.sigma);
    const etiquetas = e.fase === 'numerar' ? e.num.map((i, k) => {
      const a = e.g.atoms[i];
      return { x: a.x, y: a.y - 0.5, texto: `C${k + 1}`, clase: 'num-usuario' };
    }) : [];
    ctx.pintarFigura(g, { resaltes, etiquetas, locantes: e.fase === 'fin', S: 50 });
  }

  function iniciarCadena(ctx) {
    const e = ctx.est;
    e.juego = 'cadena';
    e.item = prepararCadena(ctx.elegir(CADENAS, (x) => `cadena:${x.n}`));
    e.g = ctx.orientar(e.item._g);
    e.correcta = cadenaCorrecta(e.g);
    e.sel = new Set();
    e.num = [];
    e.fase = 'cadena';
    e.ok = true;
    e.malSel = null;
    e.nPistas = 0;
    ctx.zonas(['figura']);
    ctx.figuraClicable(true);
    ctx.botones({ comprobar: 'Comprobar cadena', pista: 'Pista', solucion: 'Ver solución', siguiente: 'Saltar →' });
    ctx.enunciado('Cadena principal', 'Haz clic en los átomos que forman la cadena principal (vuelve a hacer clic para quitar uno)', ctx.esc(e.item.n));
    pintarCadena(ctx);
  }

  function pasarANumerar(ctx) {
    const e = ctx.est;
    e.fase = 'numerar';
    e.num = [];
    ctx.botones({ comprobar: false, pista: 'Pista', solucion: 'Ver numeración' });
    ctx.enunciado('Cadena principal', 'Ahora numérala: haz clic en el carbono que será el C1 y después en el C2', ctx.esc(e.item.n));
    pintarCadena(ctx);
  }

  function comprobarCadena(ctx, rendirse = false) {
    const e = ctx.est;
    if (!rendirse && !e.sel.size) { ctx.feedback('Marca primero los átomos de la cadena principal.', 'aviso'); return; }
    const sigmas = rendirse ? [] : e.item._aut.filter((s) => mismoConjunto(new Set([...e.correcta].map((i) => s[i])), e.sel));
    const ok = sigmas.length > 0;
    if (!rendirse) ctx.intento(ok);
    else ctx.intento(false);
    e.ok = ok;
    // Se sigue con la cadena del alumno si es equivalente; si no, con la correcta.
    e.sigmas = ok ? sigmas : e.item._aut.filter((s) => mismoConjunto(new Set([...e.correcta].map((i) => s[i])), e.correcta));
    e.cadena = ok ? new Set(e.sel) : new Set(e.correcta);
    const sobran = new Set([...e.sel].filter((i) => !e.cadena.has(i)));
    e.malSel = !ok && sobran.size ? sobran : null;
    const nC = [...e.correcta].filter((i) => e.g.atoms[i].el === 'C').length;
    const criterio = CRITERIO_CADENA[e.item.cadena];
    const nota = e.item.nota ? `<p class="nota-estereo">${e.item.nota}</p>` : '';
    if (ok) {
      ctx.feedback(`<b>¡Correcto!</b> La cadena principal tiene ${nC} átomos. ${criterio}${nota}`, 'bien');
    } else {
      const marcas = sobran.size ? ' (en azul la correcta; en rojo, lo que sobraba)' : ' (en azul)';
      const tuya = rendirse ? ''
        : e.sel.size === e.correcta.size ? `Tu cadena también tiene ${e.sel.size} átomos, pero no es la principal${marcas}. `
          : `Has marcado ${e.sel.size} átomos; la cadena principal tiene ${e.correcta.size}${marcas}. `;
      ctx.feedback(`${rendirse ? '' : '<b>No es esa.</b> '}${tuya}${criterio}${nota}`, rendirse ? 'aviso' : 'mal');
    }
    pasarANumerar(ctx);
  }

  function comprobarNumeracion(ctx, rendirse = false) {
    const e = ctx.est;
    const [u1, u2] = e.num;
    const buenas = rendirse ? [] : e.sigmas.filter((s) => s[e.item._g.atoms.findIndex((a) => a.map === 1)] === u1
      && s[e.item._g.atoms.findIndex((a) => a.map === 2)] === u2);
    const ok = buenas.length > 0;
    ctx.intento(ok);
    e.sigma = ok ? buenas[0] : e.sigmas[0];
    e.fase = 'fin';
    e.ok = e.ok && ok;
    ctx.registrar(`cadena:${e.item.n}`, null, e.ok, e.ok ? null : 'cadena', false);
    const criterio = CRITERIO_NUM[e.item.num];
    const previo = ctx.$('#feedback').innerHTML;
    const titulo = ok ? '<b>Numeración correcta.</b> ' : rendirse ? '<b>Numeración:</b> ' : '<b>Numeración incorrecta.</b> Mira los números en el dibujo. ';
    ctx.feedback(`${previo}<hr class="separador">${titulo}${criterio}`, ok && e.ok ? 'bien' : ok ? 'aviso' : 'mal');
    ctx.enunciado('Cadena principal', 'Resultado', ctx.esc(e.item.n));
    ctx.botones({ comprobar: 'Siguiente ejercicio →', pista: false, solucion: false, siguiente: false });
    ctx.figuraClicable(false);
    pintarCadena(ctx);
  }

  function clicCadena(ctx, p) {
    const e = ctx.est;
    let mejor = -1, d = 0.55;
    e.g.atoms.forEach((a, i) => { const di = Math.hypot(a.x - p.x, a.y - p.y); if (di < d) { d = di; mejor = i; } });
    if (mejor < 0) return;
    if (e.fase === 'cadena') {
      if (e.sel.has(mejor)) e.sel.delete(mejor); else e.sel.add(mejor);
      if (ctx.$('#feedback').classList.contains('aviso')) ctx.feedback('');
      pintarCadena(ctx);
    } else if (e.fase === 'numerar') {
      if (!e.cadena.has(mejor)) { ctx.feedback('Elige un átomo de la cadena principal (la resaltada en azul).', 'aviso'); return; }
      if (e.num.includes(mejor)) return;
      e.num.push(mejor);
      pintarCadena(ctx);
      if (e.num.length === 2) comprobarNumeracion(ctx);
    }
  }

  MODOS.cadena = {
    niveles: false,
    CADENAS,
    automorfismos,

    nuevo(ctx) {
      ctx.est.terminado = false;
      iniciarCadena(ctx);
    },

    comprobar(ctx) {
      const e = ctx.est;
      if (e.fase === 'fin') ctx.nuevo();
      else if (e.fase === 'cadena') comprobarCadena(ctx);
    },

    solucion(ctx) {
      const e = ctx.est;
      if (e.fase === 'cadena') comprobarCadena(ctx, true);
      else if (e.fase === 'numerar') comprobarNumeracion(ctx, true);
    },

    pista(ctx) {
      const e = ctx.est;
      e.nPistas++;
      if (e.fase === 'cadena') {
        ctx.pista(e.nPistas === 1 ? `La cadena principal tiene ${e.correcta.size} átomos.` : CRITERIO_CADENA[e.item.cadena]);
      } else if (e.fase === 'numerar') {
        ctx.pista(CRITERIO_NUM[e.item.num]);
      }
    },

    clicFigura(ctx, p) { clicCadena(ctx, p); },

    siguiente(ctx) {
      const e = ctx.est;
      if (e.fase === 'numerar') ctx.registrar(`cadena:${e.item.n}`, null, false, null, false);
      ctx.nuevo();
    },
  };
})();
