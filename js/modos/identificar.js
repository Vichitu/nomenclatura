// «Identificar mi dibujo»: el usuario dibuja libremente y, a cada cambio, se
// muestra el nombre IUPAC de lo dibujado (Nombrador), con el grupo principal,
// la cadena principal, la fórmula, la estereoquímica (E/Z por la geometría del
// dibujo, R/S por las cuñas; avisa de los estereocentros sin fijar) y el nombre
// trivial cuando lo tiene.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  let espera = null;

  // Nombre trivial (banco y lámina de triviales) por SMILES canónico.
  function trivial(can) {
    if (!can) return null;
    const t = MODOS.triviales.TRIVIALES.find((x) => !x.grupo && MODOS.triviales.preparar(x)._can === can);
    if (t) return t.n;
    const m = MOLECULAS.find((x) => x._can === can && x.sis);
    return m ? m.n : null;
  }

  // Prefijo de estereoquímica, p. ej. «(2E,4S)-». Solo los elementos de la cadena principal.
  function estereo(g, r) {
    const d = Quimica.descriptores(Quimica.aMolblock(g));
    if (!d) return { prefijo: '', fuera: 0, sinFijar: [] };
    const loc = (i) => { const m = r.grafo.atoms[i]?.map; return m > 0 && m < 100 ? m : 0; };
    const lista = [];
    const sinFijar = [];
    let fuera = 0;
    Object.entries(d.atomos).forEach(([i, x]) => {
      const l = loc(+i);
      const quien = l ? `C${l}` : 'un carbono de un sustituyente';
      if (x === '?') { if (!sinFijar.includes(quien)) sinFijar.push(quien); }
      else if (l) lista.push([l, x]);
      else fuera++;
    });
    d.enlaces.forEach(({ a, b, d: x }) => {
      const la = loc(a), lb = loc(b);
      if (x === '?') return;
      if (la && lb) lista.push([Math.min(la, lb), x]); else fuera++;
    });
    lista.sort((p, q) => p[0] - q[0]);
    return { prefijo: lista.length ? `(${lista.map(([l, x]) => `${l}${x}`).join(',')})-` : '', fuera, sinFijar };
  }

  function fila(et, valor) {
    return `<div class="id-fila"><span>${et}</span><b>${valor}</b></div>`;
  }

  function pintar(ctx) {
    const esc = ctx.esc;
    const g = ctx.editor.grafo();
    const TEMA = 'Identificar mi dibujo';
    ctx.ocultarSolucion();
    if (!g.atoms.length) {
      ctx.enunciado(TEMA, 'Dibuja una molécula con las piezas: su nombre IUPAC aparece aquí a medida que dibujas.',
        '<span class="id-espera">El nombre aparecerá aquí</span>');
      ctx.feedback('Empieza con un carbono o un anillo de la paleta, o pulsa <b>Cargar un ejemplo</b>.');
      return;
    }
    const aviso = MODOS.evaluar.avisoDibujo(g);
    if (aviso) {
      ctx.enunciado(TEMA, 'Corrige el dibujo para poder nombrarlo.', '<span class="id-espera">…</span>');
      ctx.feedback(aviso, 'aviso');
      return;
    }

    const can = Quimica.canonico(Quimica.aMolblock(g));
    const triv = trivial(can);
    const r = Nombrador.nombrar(g);
    const formula = Quimica.formula(g);

    if (r.fuera) {
      ctx.enunciado(TEMA, triv ? 'Nombre trivial de lo que has dibujado:' : 'Lo que has dibujado:',
        triv ? esc(triv) : '<span class="id-espera">Sin nombre sistemático</span>');
      ctx.feedback(`${triv ? '' : `<b>No puedo nombrarla.</b> `}${esc(r.fuera)}
        <div class="id-ficha">${fila('Fórmula', formula)}</div>
        <p class="id-nota">Este modo nombra cadenas, anillos sencillos de carbono y bencenos con los grupos de la tabla de prioridades.</p>`,
      triv ? '' : 'aviso');
      return;
    }

    const st = estereo(g, r);
    // El descriptor va delante del nombre, pero detrás de «ácido»: ácido (2Z)-but-2-enoico.
    const nombre = r.nombre.replace(/^(ácido )?/, (a) => a + st.prefijo);
    ctx.enunciado(TEMA, 'Nombre IUPAC de lo que has dibujado:', esc(nombre));
    const filas = [
      fila('Grupo principal', r.principal ? esc(r.principal) : 'ninguno (se nombra como hidrocarburo)'),
      fila('Cadena principal', esc(r.cadena)),
      fila('Fórmula', formula),
    ];
    if (triv && Nombre.normalizar(triv) !== Nombre.normalizar(r.nombre)) filas.push(fila('Nombre trivial', esc(triv)));
    const notas = [];
    if (st.prefijo) notas.push('La estereoquímica sale de tu dibujo: E/Z según cómo has dibujado los dobles enlaces y R/S según las cuñas.');
    if (st.fuera) notas.push('Hay estereoquímica fuera de la cadena principal que no se indica en el nombre.');
    if (st.sinFijar.length) {
      notas.push(`${st.sinFijar.join(', ')} ${st.sinFijar.length > 1 ? 'son estereocentros' : 'es un estereocentro'}: usa la <b>cuña</b> o la <b>cuña rayada</b> para fijar su configuración (R/S).`);
    }
    ctx.feedback(`<div class="id-ficha">${filas.join('')}</div>${notas.map((n) => `<p class="id-nota">${n}</p>`).join('')}`);

    // Desglose del nombre (pasa el ratón por cada parte para verla en el dibujo).
    const partes = Nombre.segmentar(r.nombre);
    if (!partes.some((p) => p.k === 'texto')) {
      try {
        ctx.mostrarSolucion({ n: r.nombre }, r.grafo, { desplazar: false });
      } catch (e) {
        ctx.ocultarSolucion();
      }
    }
  }

  MODOS.identificar = {
    niveles: false,

    nuevo(ctx) {
      ctx.zonas(['editor']);
      ctx.botones({ comprobar: false, solucion: false, siguiente: false, pista: 'Cargar un ejemplo' });
      ctx.editor.reiniciar();
      pintar(ctx);
    },

    // Se llama tras cada cambio del editor; se agrupan los cambios seguidos (arrastres).
    cambioEditor(ctx) {
      clearTimeout(espera);
      espera = setTimeout(() => pintar(ctx), 120);
    },

    // «Cargar un ejemplo»: una molécula del banco para ver cómo se nombra y modificarla.
    pista(ctx) {
      const m = ctx.elegir(MOLECULAS.filter((x) => ctx.preparar(x)._g), (x) => `identificar:${x.n}`);
      const g = ctx.orientar(m._g);
      g.atoms.forEach((a) => { a.map = 0; });
      ctx.editor.cargar(g);
    },
  };
})();
