// Isómeros constitucionales (Tema 2c): dada una fórmula, dibujar todos sus
// isómeros del tipo pedido. Cada acierto se compara por SMILES canónico.
'use strict';

window.MODOS = window.MODOS || {};

(() => {
  // f: fórmula (HTML); tipo: qué isómeros cuentan; mols: [nombre, SMILES].
  const SERIES = [
    { f: 'C<sub>4</sub>H<sub>10</sub>', tipo: 'alcanos', mols: [['butano', 'CCCC'], ['2-metilpropano', 'CC(C)C']] },
    { f: 'C<sub>5</sub>H<sub>12</sub>', tipo: 'alcanos', mols: [['pentano', 'CCCCC'], ['2-metilbutano', 'CCC(C)C'], ['2,2-dimetilpropano', 'CC(C)(C)C']] },
    {
      f: 'C<sub>6</sub>H<sub>14</sub>', tipo: 'alcanos',
      mols: [['hexano', 'CCCCCC'], ['2-metilpentano', 'CCCC(C)C'], ['3-metilpentano', 'CCC(C)CC'], ['2,2-dimetilbutano', 'CCC(C)(C)C'], ['2,3-dimetilbutano', 'CC(C)C(C)C']],
    },
    {
      f: 'C<sub>4</sub>H<sub>8</sub>', tipo: 'alquenos y cicloalcanos (sin contar cis/trans)',
      mols: [['but-1-eno', 'C=CCC'], ['but-2-eno', 'CC=CC'], ['2-metilprop-1-eno', 'C=C(C)C'], ['ciclobutano', 'C1CCC1'], ['metilciclopropano', 'CC1CC1']],
    },
    {
      f: 'C<sub>5</sub>H<sub>10</sub>', tipo: 'alquenos de cadena abierta (sin contar cis/trans)', sinAnillos: true,
      mols: [['pent-1-eno', 'C=CCCC'], ['pent-2-eno', 'CC=CCC'], ['2-metilbut-1-eno', 'C=C(C)CC'], ['3-metilbut-1-eno', 'C=CC(C)C'], ['2-metilbut-2-eno', 'CC=C(C)C']],
    },
    { f: 'C<sub>2</sub>H<sub>6</sub>O', tipo: 'todos', mols: [['etanol', 'CCO'], ['metoximetano', 'COC']] },
    { f: 'C<sub>3</sub>H<sub>8</sub>O', tipo: 'todos', mols: [['propan-1-ol', 'CCCO'], ['propan-2-ol', 'CC(C)O'], ['metoxietano', 'CCOC']] },
    {
      f: 'C<sub>4</sub>H<sub>10</sub>O', tipo: 'alcoholes y éteres',
      mols: [['butan-1-ol', 'CCCCO'], ['butan-2-ol', 'CCC(C)O'], ['2-metilpropan-1-ol', 'CC(C)CO'], ['2-metilpropan-2-ol', 'CC(C)(C)O'],
        ['1-metoxipropano', 'CCCOC'], ['2-metoxipropano', 'CC(C)OC'], ['etoxietano', 'CCOCC']],
    },
    { f: 'C<sub>4</sub>H<sub>8</sub>O', tipo: 'aldehídos y cetonas', mols: [['butanal', 'CCCC=O'], ['2-metilpropanal', 'CC(C)C=O'], ['butan-2-ona', 'CCC(C)=O']] },
    {
      f: 'C<sub>5</sub>H<sub>10</sub>O', tipo: 'aldehídos y cetonas',
      mols: [['pentanal', 'CCCCC=O'], ['2-metilbutanal', 'CCC(C)C=O'], ['3-metilbutanal', 'CC(C)CC=O'], ['2,2-dimetilpropanal', 'CC(C)(C)C=O'],
        ['pentan-2-ona', 'CCCC(C)=O'], ['pentan-3-ona', 'CCC(=O)CC'], ['3-metilbutan-2-ona', 'CC(C)C(C)=O']],
    },
    {
      f: 'C<sub>4</sub>H<sub>8</sub>O<sub>2</sub>', tipo: 'ácidos carboxílicos y ésteres',
      mols: [['ácido butanoico', 'CCCC(=O)O'], ['ácido 2-metilpropanoico', 'CC(C)C(=O)O'], ['metanoato de propilo', 'CCCOC=O'],
        ['metanoato de isopropilo', 'CC(C)OC=O'], ['etanoato de etilo', 'CCOC(C)=O'], ['propanoato de metilo', 'CCC(=O)OC']],
    },
    {
      f: 'C<sub>3</sub>H<sub>9</sub>N', tipo: 'aminas',
      mols: [['propan-1-amina', 'CCCN'], ['propan-2-amina', 'CC(C)N'], ['N-metiletanamina', 'CCNC'], ['N,N-dimetilmetanamina', 'CN(C)C']],
    },
    { f: 'C<sub>3</sub>H<sub>7</sub>Cl', tipo: 'todos', mols: [['1-cloropropano', 'CCCCl'], ['2-cloropropano', 'CC(C)Cl']] },
    { f: 'C<sub>2</sub>H<sub>4</sub>Cl<sub>2</sub>', tipo: 'todos', mols: [['1,1-dicloroetano', 'CC(Cl)Cl'], ['1,2-dicloroetano', 'ClCCCl']] },
    {
      f: 'C<sub>4</sub>H<sub>9</sub>Br', tipo: 'todos',
      mols: [['1-bromobutano', 'CCCCBr'], ['2-bromobutano', 'CCC(C)Br'], ['1-bromo-2-metilpropano', 'CC(C)CBr'], ['2-bromo-2-metilpropano', 'CC(C)(C)Br']],
    },
    {
      f: 'C<sub>8</sub>H<sub>10</sub>', tipo: 'con un anillo de benceno',
      mols: [['etilbenceno', 'CCc1ccccc1'], ['1,2-dimetilbenceno', 'Cc1ccccc1C'], ['1,3-dimetilbenceno', 'Cc1cccc(C)c1'], ['1,4-dimetilbenceno', 'Cc1ccc(C)cc1']],
    },
  ];

  const clave = (s) => `isomeros:${s.f.replace(/<[^>]+>/g, '')}`;

  function preparar(s) {
    if (s.preparada) return s;
    s.mols = s.mols.map(([n, smi]) => ({ n, smi, can: Quimica.canonico(smi), g: Quimica.grafoDeSmiles(smi) }));
    s.formula = Quimica.formula(s.mols[0].g);
    s.preparada = true;
    return s;
  }

  function pintarLista(ctx) {
    const e = ctx.est;
    const cont = ctx.$('#z-encontrados');
    const mostrar = e.s.mols.filter((m) => e.encontrados.has(m.can) || e.rendido);
    cont.innerHTML = `<h3>Encontrados: ${e.encontrados.size} de ${e.s.mols.length}</h3>
      <div class="rejilla-isomeros">${mostrar.map((m, i) => `
        <figure class="${e.encontrados.has(m.can) ? '' : 'faltaba'}"><svg data-i="${i}"></svg>
          <figcaption>${ctx.esc(m.n)}${e.encontrados.has(m.can) ? '' : ' <small>(te faltaba)</small>'}</figcaption></figure>`).join('')}
      </div>`;
    cont.querySelectorAll('svg').forEach((svg) => Quimica.pintarEn(svg, mostrar[+svg.dataset.i].g, { S: 26, margen: 0.7 }));
  }

  function enunciado(ctx) {
    const e = ctx.est;
    const tipo = e.s.tipo === 'todos' ? 'todos sus isómeros constitucionales' : `todos sus isómeros (${e.s.tipo})`;
    ctx.enunciado('Isómeros', `Dibuja uno a uno ${tipo}`,
      `${e.s.f} <small class="contador">${e.encontrados.size} de ${e.s.mols.length}</small>`);
  }

  function terminar(ctx, ok) {
    const e = ctx.est;
    if (!e.contado) {
      e.contado = true;
      ctx.registrar(clave(e.s), null, ok, ok ? null : 'isomeros', false);
    }
    ctx.botones({ comprobar: false, pista: false, solucion: false });
  }

  MODOS.isomeros = {
    niveles: false,
    SERIES,

    nuevo(ctx) {
      const e = ctx.est;
      e.s = preparar(ctx.elegir(SERIES, clave));
      e.encontrados = new Set();
      e.rendido = e.contado = false;
      e.pistas = 0;
      ctx.zonas(['editor', 'encontrados']);
      ctx.botones({ comprobar: 'Añadir isómero', pista: 'Pista', solucion: 'Me rindo', siguiente: 'Otra fórmula →' });
      ctx.editor.reiniciar();
      enunciado(ctx);
      pintarLista(ctx);
    },

    comprobar(ctx) {
      const e = ctx.est;
      const g = ctx.editor.grafo();
      const aviso = MODOS.evaluar.avisoDibujo(g);
      if (aviso) { ctx.feedback(aviso, 'aviso'); return; }
      const can = Quimica.canonico(Quimica.aMolblock(g));
      const formula = Quimica.formula(g);
      if (formula !== e.s.formula) {
        ctx.intento(false);
        ctx.feedback(`Tu molécula es <b>${formula}</b>, pero se pide <b>${e.s.formula}</b>. Cuenta los átomos (los H no se dibujan, se deducen).`, 'mal');
        return;
      }
      const m = e.s.mols.find((x) => x.can === can);
      if (!m) {
        const motivo = e.s.sinAnillos && Quimica.contarCoincidencias(can, '[R]') ? 'tiene un anillo y aquí solo cuentan las cadenas abiertas' : `no es del tipo pedido (${e.s.tipo})`;
        ctx.intento(false);
        ctx.feedback(`Es un isómero de ${e.s.formula}, pero ${motivo}.`, 'mal');
        return;
      }
      if (e.encontrados.has(can)) {
        ctx.feedback(`Esa ya la tienes: es <b>${ctx.esc(m.n)}</b>, la misma molécula aunque esté girada o dibujada de otra forma.`, 'aviso');
        return;
      }
      e.encontrados.add(can);
      ctx.intento(true);
      ctx.editor.reiniciar();
      enunciado(ctx);
      pintarLista(ctx);
      if (e.encontrados.size === e.s.mols.length) {
        ctx.feedback(`<b>¡Completo!</b> Has encontrado los ${e.s.mols.length} isómeros.`, 'bien');
        terminar(ctx, e.pistas === 0);
      } else {
        ctx.feedback(`<b>¡Bien!</b> Es <b>${ctx.esc(m.n)}</b>. Te quedan ${e.s.mols.length - e.encontrados.size}.`, 'bien');
      }
    },

    pista(ctx) {
      const e = ctx.est;
      const falta = e.s.mols.filter((m) => !e.encontrados.has(m.can));
      if (!falta.length) return;
      e.pistas++;
      const m = falta[Math.floor(Math.random() * falta.length)];
      ctx.pista(`Te falta, por ejemplo, <b>${ctx.esc(m.n)}</b>. Dibújalo a partir de su nombre.`);
    },

    solucion(ctx) {
      const e = ctx.est;
      e.rendido = true;
      if (!e.contado) ctx.intento(false);
      pintarLista(ctx);
      ctx.feedback(`Te faltaban ${e.s.mols.length - e.encontrados.size}. Los tienes abajo marcados.`, 'aviso');
      terminar(ctx, false);
    },
  };
})();
