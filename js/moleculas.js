// Banco de ejercicios. Basado en los apuntes del Tema 2b (Nomenclatura).
//
// Campos:
//   n    nombre preferido (el que se muestra)
//   alt  otros nombres aceptados (triviales, formato antiguo…)
//   sis  nombre sistemático usado para el desglose cuando `n` es trivial
//   s    SMILES con mapas de átomo: [CH3:1] = carbono 1 de la cadena principal.
//        Mapas >= 100 marcan el grupo alquilo de los ésteres (no se numeran).
//   nv   nivel
//   nota explicación de la regla aplicada (opcional)

window.NIVELES = [
  { id: 'alcanos', nombre: 'Alcanos' },
  { id: 'ciclos', nombre: 'Cicloalcanos' },
  { id: 'insat', nombre: 'Alquenos y alquinos' },
  { id: 'haluros', nombre: 'Haluros' },
  { id: 'alcoholes', nombre: 'Alcoholes y éteres' },
  { id: 'carbonilos', nombre: 'Aldehídos y cetonas' },
  { id: 'acidos', nombre: 'Ácidos y ésteres' },
  { id: 'nitrogenados', nombre: 'Aminas, amidas y nitrilos' },
  { id: 'aromaticos', nombre: 'Aromáticos' },
  { id: 'poli', nombre: 'Polifuncionales' },
];

const BENCENO_1 = '[c:1]1[cH:2][cH:3][cH:4][cH:5][cH:6]1';

window.MOLECULAS = [
  // ───────────── Alcanos ─────────────
  { nv: 'alcanos', n: 'metano', s: '[CH4:1]' },
  { nv: 'alcanos', n: 'etano', s: '[CH3:1][CH3:2]' },
  { nv: 'alcanos', n: 'propano', s: '[CH3:1][CH2:2][CH3:3]' },
  { nv: 'alcanos', n: 'butano', s: '[CH3:1][CH2:2][CH2:3][CH3:4]' },
  { nv: 'alcanos', n: 'pentano', s: '[CH3:1][CH2:2][CH2:3][CH2:4][CH3:5]' },
  { nv: 'alcanos', n: 'hexano', s: '[CH3:1][CH2:2][CH2:3][CH2:4][CH2:5][CH3:6]' },
  { nv: 'alcanos', n: 'heptano', s: '[CH3:1][CH2:2][CH2:3][CH2:4][CH2:5][CH2:6][CH3:7]' },
  { nv: 'alcanos', n: 'octano', s: '[CH3:1][CH2:2][CH2:3][CH2:4][CH2:5][CH2:6][CH2:7][CH3:8]' },
  { nv: 'alcanos', n: '2-metilpropano', alt: ['isobutano'], s: '[CH3:1][CH:2](C)[CH3:3]' },
  { nv: 'alcanos', n: '2-metilbutano', alt: ['isopentano'], s: '[CH3:1][CH:2](C)[CH2:3][CH3:4]' },
  { nv: 'alcanos', n: '2,2-dimetilpropano', alt: ['neopentano'], s: '[CH3:1][C:2](C)(C)[CH3:3]' },
  { nv: 'alcanos', n: '2-metilpentano', alt: ['isohexano'], s: '[CH3:1][CH:2](C)[CH2:3][CH2:4][CH3:5]' },
  { nv: 'alcanos', n: '3-metilpentano', s: '[CH3:1][CH2:2][CH:3](C)[CH2:4][CH3:5]' },
  { nv: 'alcanos', n: '2,2-dimetilbutano', alt: ['neohexano'], s: '[CH3:1][C:2](C)(C)[CH2:3][CH3:4]' },
  { nv: 'alcanos', n: '2,3-dimetilbutano', s: '[CH3:1][CH:2](C)[CH:3](C)[CH3:4]' },
  { nv: 'alcanos', n: '3-etilpentano', s: '[CH3:1][CH2:2][CH:3](CC)[CH2:4][CH3:5]' },
  { nv: 'alcanos', n: '3,3-dimetilhexano', s: '[CH3:1][CH2:2][C:3](C)(C)[CH2:4][CH2:5][CH3:6]' },
  { nv: 'alcanos', n: '2,2,4-trimetilpentano', alt: ['isooctano'], s: '[CH3:1][C:2](C)(C)[CH2:3][CH:4](C)[CH3:5]' },
  {
    nv: 'alcanos', n: '3-etil-2-metilpentano', s: '[CH3:1][CH:2](C)[CH:3](CC)[CH2:4][CH3:5]',
    nota: 'Los sustituyentes se citan en orden alfabético (etil antes que metil), independientemente de su localizador.',
  },
  { nv: 'alcanos', n: '4-etil-2-metilhexano', s: '[CH3:1][CH:2](C)[CH2:3][CH:4](CC)[CH2:5][CH3:6]' },
  {
    nv: 'alcanos', n: '2,3,5-trimetilhexano', s: '[CH3:1][CH:2](C)[CH:3](C)[CH2:4][CH:5](C)[CH3:6]',
    nota: 'Los localizadores se comparan uno a uno: 2,3,5 es menor que 2,4,5 (el primer punto de diferencia decide).',
  },
  {
    nv: 'alcanos', n: '3-etil-4-metilhexano', s: '[CH3:1][CH2:2][CH:3](CC)[CH:4](C)[CH2:5][CH3:6]',
    nota: 'Empate de localizadores (3,4 por ambos extremos): el número más bajo se da al sustituyente que va primero por orden alfabético (etil).',
  },
  { nv: 'alcanos', n: '5-etil-3-metiloctano', s: '[CH3:1][CH2:2][CH:3](C)[CH2:4][CH:5](CC)[CH2:6][CH2:7][CH3:8]' },
  {
    nv: 'alcanos', n: '4-isopropilheptano', alt: ['4-(propan-2-il)heptano', '4-(1-metiletil)heptano'],
    s: '[CH3:1][CH2:2][CH2:3][CH:4](C(C)C)[CH2:5][CH2:6][CH3:7]',
    nota: 'La cadena que pasa por el isopropilo solo tiene 6 C; la principal es la de 7 C (heptano).',
  },

  // ───────────── Cicloalcanos ─────────────
  { nv: 'ciclos', n: 'ciclopropano', s: '[CH2:1]1[CH2:2][CH2:3]1' },
  { nv: 'ciclos', n: 'ciclobutano', s: '[CH2:1]1[CH2:2][CH2:3][CH2:4]1' },
  { nv: 'ciclos', n: 'ciclopentano', s: '[CH2:1]1[CH2:2][CH2:3][CH2:4][CH2:5]1' },
  { nv: 'ciclos', n: 'ciclohexano', s: '[CH2:1]1[CH2:2][CH2:3][CH2:4][CH2:5][CH2:6]1' },
  { nv: 'ciclos', n: 'metilciclopentano', s: 'C[CH:1]1[CH2:2][CH2:3][CH2:4][CH2:5]1' },
  { nv: 'ciclos', n: 'etilciclohexano', s: 'CC[CH:1]1[CH2:2][CH2:3][CH2:4][CH2:5][CH2:6]1' },
  { nv: 'ciclos', n: '1,1-dimetilciclohexano', s: 'C[C:1]1(C)[CH2:2][CH2:3][CH2:4][CH2:5][CH2:6]1' },
  { nv: 'ciclos', n: '1,2-dimetilciclopentano', s: 'C[CH:1]1[CH:2](C)[CH2:3][CH2:4][CH2:5]1' },
  { nv: 'ciclos', n: '1,3-dimetilciclohexano', s: 'C[CH:1]1[CH2:2][CH:3](C)[CH2:4][CH2:5][CH2:6]1' },
  {
    nv: 'ciclos', n: '1-etil-3-metilciclohexano', s: 'CC[CH:1]1[CH2:2][CH:3](C)[CH2:4][CH2:5][CH2:6]1',
    nota: 'En el anillo sale 1,3 en cualquier sentido; desempata el orden alfabético: etil recibe el 1.',
  },
  {
    nv: 'ciclos', n: 'isopropilciclohexano', alt: ['(propan-2-il)ciclohexano', '(1-metiletil)ciclohexano'],
    s: 'CC(C)[CH:1]1[CH2:2][CH2:3][CH2:4][CH2:5][CH2:6]1',
  },
  {
    nv: 'ciclos', n: 'hexilciclopropano', alt: ['ciclopropilhexano', '1-ciclopropilhexano'],
    s: 'CCCCCC[CH:1]1[CH2:2][CH2:3]1',
    nota: 'Criterio de 2021 de los apuntes: los anillos tienen prioridad sobre las cadenas acíclicas, aunque la cadena sea más larga. El anillo es la cadena principal.',
  },

  // ───────────── Alquenos y alquinos ─────────────
  { nv: 'insat', n: 'eteno', alt: ['etileno'], s: '[CH2:1]=[CH2:2]' },
  { nv: 'insat', n: 'propeno', alt: ['prop-1-eno', 'propileno'], s: '[CH2:1]=[CH:2][CH3:3]' },
  { nv: 'insat', n: 'but-1-eno', alt: ['1-buteno'], s: '[CH2:1]=[CH:2][CH2:3][CH3:4]' },
  { nv: 'insat', n: 'but-2-eno', alt: ['2-buteno'], s: '[CH3:1][CH:2]=[CH:3][CH3:4]' },
  { nv: 'insat', n: 'pent-2-eno', alt: ['2-penteno'], s: '[CH3:1][CH:2]=[CH:3][CH2:4][CH3:5]' },
  { nv: 'insat', n: '2-metilprop-1-eno', alt: ['2-metilpropeno', 'isobutileno'], s: '[CH2:1]=[C:2](C)[CH3:3]' },
  { nv: 'insat', n: '2-metilbut-2-eno', alt: ['2-metil-2-buteno'], s: '[CH3:1][C:2](C)=[CH:3][CH3:4]' },
  {
    nv: 'insat', n: '3-metilbut-1-eno', alt: ['3-metil-1-buteno'], s: '[CH2:1]=[CH:2][CH:3](C)[CH3:4]',
    nota: 'El doble enlace (sufijo -eno) tiene preferencia sobre el metilo (prefijo) para recibir el localizador más bajo.',
  },
  { nv: 'insat', n: 'buta-1,3-dieno', alt: ['1,3-butadieno', 'butadieno'], s: '[CH2:1]=[CH:2][CH:3]=[CH2:4]' },
  { nv: 'insat', n: 'penta-1,3-dieno', alt: ['1,3-pentadieno'], s: '[CH2:1]=[CH:2][CH:3]=[CH:4][CH3:5]' },
  { nv: 'insat', n: 'etino', alt: ['acetileno'], s: '[CH:1]#[CH:2]' },
  { nv: 'insat', n: 'propino', alt: ['prop-1-ino'], s: '[CH:1]#[C:2][CH3:3]' },
  { nv: 'insat', n: 'but-1-ino', alt: ['1-butino'], s: '[CH:1]#[C:2][CH2:3][CH3:4]' },
  { nv: 'insat', n: 'but-2-ino', alt: ['2-butino'], s: '[CH3:1][C:2]#[C:3][CH3:4]' },
  { nv: 'insat', n: 'hex-3-ino', alt: ['3-hexino'], s: '[CH3:1][CH2:2][C:3]#[C:4][CH2:5][CH3:6]' },
  { nv: 'insat', n: '4-metilpent-2-ino', alt: ['4-metil-2-pentino'], s: '[CH3:1][C:2]#[C:3][CH:4](C)[CH3:5]' },
  { nv: 'insat', n: '4,4-dimetilpent-2-ino', alt: ['4,4-dimetil-2-pentino'], s: '[CH3:1][C:2]#[C:3][C:4](C)(C)[CH3:5]' },
  {
    nv: 'insat', n: 'pent-1-en-4-ino', s: '[CH2:1]=[CH:2][CH2:3][C:4]#[CH:5]',
    nota: 'Los enlaces múltiples dan 1,4 por ambos extremos: en caso de empate, el doble enlace recibe el número más bajo.',
  },
  { nv: 'insat', n: 'ciclopenteno', s: '[CH:1]1=[CH:2][CH2:3][CH2:4][CH2:5]1' },
  { nv: 'insat', n: 'ciclohexeno', s: '[CH:1]1=[CH:2][CH2:3][CH2:4][CH2:5][CH2:6]1' },
  {
    nv: 'insat', n: '3-metilciclohex-1-eno', alt: ['3-metilciclohexeno'], s: '[CH:1]1=[CH:2][CH:3](C)[CH2:4][CH2:5][CH2:6]1',
    nota: 'En un cicloalqueno el doble enlace ocupa las posiciones 1 y 2; se numera en el sentido que da el localizador más bajo al sustituyente.',
  },
  { nv: 'insat', n: 'ciclohexa-1,3-dieno', alt: ['1,3-ciclohexadieno'], s: '[CH:1]1=[CH:2][CH:3]=[CH:4][CH2:5][CH2:6]1' },
  {
    nv: 'insat', n: '3-metilidenhexano', alt: ['3-metilidenohexano', '2-etilpent-1-eno'],
    s: '[CH3:1][CH2:2][C:3](=C)[CH2:4][CH2:5][CH3:6]',
    nota: 'Criterio de 2021 de los apuntes: la cadena principal es la MÁS LARGA (6 C) aunque no contenga el doble enlace. El =CH2 se nombra como sustituyente «metiliden» (-ideno: unido por doble enlace). Con el criterio antiguo sería 2-etilpent-1-eno.',
  },

  // ───────────── Haluros ─────────────
  { nv: 'haluros', n: 'clorometano', alt: ['cloruro de metilo'], s: 'Cl[CH3:1]' },
  { nv: 'haluros', n: 'diclorometano', s: 'Cl[CH2:1]Cl' },
  { nv: 'haluros', n: 'triclorometano', alt: ['cloroformo'], s: 'Cl[CH:1](Cl)Cl' },
  { nv: 'haluros', n: 'yodometano', alt: ['iodometano'], s: 'I[CH3:1]' },
  { nv: 'haluros', n: 'bromoetano', s: 'Br[CH2:1][CH3:2]' },
  { nv: 'haluros', n: '1,2-dibromoetano', s: 'Br[CH2:1][CH2:2]Br' },
  { nv: 'haluros', n: '1,1,1-tricloroetano', s: 'Cl[C:1](Cl)(Cl)[CH3:2]' },
  {
    nv: 'haluros', n: '1-bromo-2-cloroetano', s: 'Br[CH2:1][CH2:2]Cl',
    nota: 'Empate (1,2 por ambos lados): el localizador más bajo es para el que se cita primero alfabéticamente (bromo).',
  },
  { nv: 'haluros', n: '2-cloropropano', s: '[CH3:1][CH:2](Cl)[CH3:3]' },
  { nv: 'haluros', n: '1-cloro-2-metilpropano', s: 'Cl[CH2:1][CH:2](C)[CH3:3]' },
  { nv: 'haluros', n: '2-cloro-2-metilpropano', s: '[CH3:1][C:2](C)(Cl)[CH3:3]' },
  {
    nv: 'haluros', n: '2-bromo-3-metilbutano', s: '[CH3:1][CH:2](Br)[CH:3](C)[CH3:4]',
    nota: 'Halógenos y alquilos son prefijos del mismo rango: con empate de localizadores (2,3), desempata el orden alfabético.',
  },
  { nv: 'haluros', n: '2-bromo-2-metilbutano', s: '[CH3:1][C:2](C)(Br)[CH2:3][CH3:4]' },
  {
    nv: 'haluros', n: '3-cloroprop-1-eno', alt: ['3-cloropropeno', 'cloruro de alilo'], s: 'Cl[CH2:3][CH:2]=[CH2:1]',
    nota: 'El doble enlace (sufijo -eno) manda sobre el halógeno (prefijo) en la numeración.',
  },
  { nv: 'haluros', n: 'clorociclohexano', s: 'Cl[CH:1]1[CH2:2][CH2:3][CH2:4][CH2:5][CH2:6]1' },
  { nv: 'haluros', n: 'clorobenceno', s: 'Cl' + BENCENO_1 },
  { nv: 'haluros', n: '1,2-diclorobenceno', alt: ['o-diclorobenceno', 'orto-diclorobenceno'], s: 'Cl[c:1]1[c:2](Cl)[cH:3][cH:4][cH:5][cH:6]1' },

  // ───────────── Alcoholes y éteres ─────────────
  { nv: 'alcoholes', n: 'metanol', s: '[CH3:1]O' },
  { nv: 'alcoholes', n: 'etanol', s: 'O[CH2:1][CH3:2]' },
  { nv: 'alcoholes', n: 'propan-1-ol', alt: ['1-propanol'], s: 'O[CH2:1][CH2:2][CH3:3]' },
  { nv: 'alcoholes', n: 'propan-2-ol', alt: ['2-propanol', 'isopropanol', 'alcohol isopropílico'], s: '[CH3:1][CH:2](O)[CH3:3]' },
  { nv: 'alcoholes', n: 'butan-1-ol', alt: ['1-butanol'], s: 'O[CH2:1][CH2:2][CH2:3][CH3:4]' },
  { nv: 'alcoholes', n: 'butan-2-ol', alt: ['2-butanol'], s: '[CH3:1][CH:2](O)[CH2:3][CH3:4]' },
  { nv: 'alcoholes', n: 'pentan-3-ol', alt: ['3-pentanol'], s: '[CH3:1][CH2:2][CH:3](O)[CH2:4][CH3:5]' },
  { nv: 'alcoholes', n: '2-metilpropan-2-ol', alt: ['terc-butanol', '2-metil-2-propanol'], s: '[CH3:1][C:2](C)(O)[CH3:3]' },
  { nv: 'alcoholes', n: '2-metilbutan-1-ol', alt: ['2-metil-1-butanol'], s: 'O[CH2:1][CH:2](C)[CH2:3][CH3:4]' },
  { nv: 'alcoholes', n: '2-metilbutan-2-ol', alt: ['2-metil-2-butanol'], s: '[CH3:1][C:2](C)(O)[CH2:3][CH3:4]' },
  { nv: 'alcoholes', n: '3-metilpentan-2-ol', alt: ['3-metil-2-pentanol'], s: '[CH3:1][CH:2](O)[CH:3](C)[CH2:4][CH3:5]' },
  {
    nv: 'alcoholes', n: '4-metilpentan-2-ol', alt: ['4-metil-2-pentanol'], s: '[CH3:1][CH:2](O)[CH2:3][CH:4](C)[CH3:5]',
    nota: 'El grupo principal (–OH) manda en la numeración: recibe el 2 aunque el metilo quede en 4.',
  },
  { nv: 'alcoholes', n: 'etano-1,2-diol', alt: ['etilenglicol', '1,2-etanodiol'], s: 'O[CH2:1][CH2:2]O' },
  { nv: 'alcoholes', n: 'propano-1,2,3-triol', alt: ['glicerol', 'glicerina'], s: 'O[CH2:1][CH:2](O)[CH2:3]O' },
  { nv: 'alcoholes', n: 'ciclohexanol', s: 'O[CH:1]1[CH2:2][CH2:3][CH2:4][CH2:5][CH2:6]1' },
  { nv: 'alcoholes', n: '2-metilciclohexan-1-ol', alt: ['2-metilciclohexanol'], s: 'O[CH:1]1[CH:2](C)[CH2:3][CH2:4][CH2:5][CH2:6]1' },
  { nv: 'alcoholes', n: 'prop-2-en-1-ol', alt: ['alcohol alílico', '2-propen-1-ol'], s: 'O[CH2:1][CH:2]=[CH2:3]' },
  {
    nv: 'alcoholes', n: 'but-3-en-2-ol', alt: ['3-buten-2-ol'], s: '[CH3:1][CH:2](O)[CH:3]=[CH2:4]',
    nota: 'El –OH (grupo principal) tiene prioridad sobre el doble enlace para el localizador más bajo.',
  },
  { nv: 'alcoholes', n: '2-cloroetan-1-ol', alt: ['2-cloroetanol'], s: 'Cl[CH2:2][CH2:1]O' },
  { nv: 'alcoholes', n: 'fenol', alt: ['bencenol', 'hidroxibenceno'], s: 'O' + BENCENO_1 },
  {
    nv: 'alcoholes', n: 'metoxietano', alt: ['etil metil éter', 'metil etil éter', 'etilmetiléter'], s: 'CO[CH2:1][CH3:2]',
    nota: 'En nomenclatura sustitutiva la cadena más larga es la principal y el –O–CH3 se nombra como prefijo «metoxi». En clase funcional: etil metil éter.',
  },
  { nv: 'alcoholes', n: 'etoxietano', alt: ['dietil éter', 'éter dietílico', 'dietiléter'], s: 'CCO[CH2:1][CH3:2]' },
  { nv: 'alcoholes', n: '1-metoxipropano', alt: ['metoxipropano', 'metil propil éter'], s: 'CO[CH2:1][CH2:2][CH3:3]' },
  { nv: 'alcoholes', n: '2-metoxipropano', alt: ['isopropil metil éter'], s: 'CO[CH:2]([CH3:1])[CH3:3]' },
  { nv: 'alcoholes', n: 'metoxibenceno', alt: ['anisol'], s: 'CO' + BENCENO_1 },

  // ───────────── Aldehídos y cetonas ─────────────
  { nv: 'carbonilos', n: 'metanal', alt: ['formaldehído'], s: 'O=[CH2:1]' },
  { nv: 'carbonilos', n: 'etanal', alt: ['acetaldehído'], s: 'O=[CH:1][CH3:2]' },
  { nv: 'carbonilos', n: 'propanal', s: 'O=[CH:1][CH2:2][CH3:3]' },
  { nv: 'carbonilos', n: 'butanal', s: 'O=[CH:1][CH2:2][CH2:3][CH3:4]' },
  {
    nv: 'carbonilos', n: '2-metilpropanal', s: 'O=[CH:1][CH:2](C)[CH3:3]',
    nota: 'En los aldehídos el carbono del –CHO es siempre el C1, por eso no se indica su localizador.',
  },
  { nv: 'carbonilos', n: '3-metilbutanal', s: 'O=[CH:1][CH2:2][CH:3](C)[CH3:4]' },
  { nv: 'carbonilos', n: 'propanona', alt: ['acetona', 'propan-2-ona', 'dimetil cetona'], s: '[CH3:1][C:2](=O)[CH3:3]' },
  { nv: 'carbonilos', n: 'butan-2-ona', alt: ['butanona', '2-butanona', 'etil metil cetona'], s: '[CH3:1][C:2](=O)[CH2:3][CH3:4]' },
  { nv: 'carbonilos', n: 'pentan-2-ona', alt: ['2-pentanona'], s: '[CH3:1][C:2](=O)[CH2:3][CH2:4][CH3:5]' },
  { nv: 'carbonilos', n: 'pentan-3-ona', alt: ['3-pentanona', 'dietil cetona'], s: '[CH3:1][CH2:2][C:3](=O)[CH2:4][CH3:5]' },
  { nv: 'carbonilos', n: 'hexan-3-ona', alt: ['3-hexanona'], s: '[CH3:1][CH2:2][C:3](=O)[CH2:4][CH2:5][CH3:6]' },
  { nv: 'carbonilos', n: '3-metilbutan-2-ona', alt: ['3-metilbutanona', '3-metil-2-butanona'], s: '[CH3:1][C:2](=O)[CH:3](C)[CH3:4]' },
  { nv: 'carbonilos', n: '4-metilpentan-2-ona', alt: ['4-metil-2-pentanona'], s: '[CH3:1][C:2](=O)[CH2:3][CH:4](C)[CH3:5]' },
  { nv: 'carbonilos', n: 'pentano-2,4-diona', alt: ['2,4-pentanodiona', 'acetilacetona'], s: '[CH3:1][C:2](=O)[CH2:3][C:4](=O)[CH3:5]' },
  { nv: 'carbonilos', n: 'ciclopentanona', s: 'O=[C:1]1[CH2:2][CH2:3][CH2:4][CH2:5]1' },
  { nv: 'carbonilos', n: 'ciclohexanona', s: 'O=[C:1]1[CH2:2][CH2:3][CH2:4][CH2:5][CH2:6]1' },
  { nv: 'carbonilos', n: 'but-3-en-2-ona', alt: ['3-buten-2-ona', 'metil vinil cetona'], s: '[CH3:1][C:2](=O)[CH:3]=[CH2:4]' },
  {
    nv: 'carbonilos', n: 'benzaldehído', sis: 'bencenocarbaldehído', alt: ['bencenocarbaldehído'],
    s: 'O=[CH]' + BENCENO_1,
    nota: 'Cuando el –CHO cuelga de un anillo, el carbono no se puede contar en la cadena: se usa el sufijo -carbaldehído (IC, incluye el carbono). El nombre trivial benzaldehído es el aceptado.',
  },
  { nv: 'carbonilos', n: '1-feniletan-1-ona', alt: ['acetofenona', '1-feniletanona', 'metil fenil cetona'], s: '[CH3:2][C:1](=O)c1ccccc1' },

  // ───────────── Ácidos y ésteres ─────────────
  { nv: 'acidos', n: 'ácido metanoico', alt: ['ácido fórmico'], s: 'O=[CH:1]O' },
  { nv: 'acidos', n: 'ácido etanoico', alt: ['ácido acético'], s: '[CH3:2][C:1](=O)O' },
  { nv: 'acidos', n: 'ácido propanoico', alt: ['ácido propiónico'], s: '[CH3:3][CH2:2][C:1](=O)O' },
  { nv: 'acidos', n: 'ácido butanoico', alt: ['ácido butírico'], s: '[CH3:4][CH2:3][CH2:2][C:1](=O)O' },
  { nv: 'acidos', n: 'ácido pentanoico', s: '[CH3:5][CH2:4][CH2:3][CH2:2][C:1](=O)O' },
  { nv: 'acidos', n: 'ácido 2-metilpropanoico', s: '[CH3:3][CH:2](C)[C:1](=O)O' },
  { nv: 'acidos', n: 'ácido 3-metilbutanoico', s: '[CH3:4][CH:3](C)[CH2:2][C:1](=O)O' },
  { nv: 'acidos', n: 'ácido 3-cloropropanoico', s: 'Cl[CH2:3][CH2:2][C:1](=O)O' },
  { nv: 'acidos', n: 'ácido prop-2-enoico', alt: ['ácido propenoico', 'ácido acrílico'], s: '[CH2:3]=[CH:2][C:1](=O)O' },
  { nv: 'acidos', n: 'ácido etanodioico', alt: ['ácido oxálico'], s: 'O=[C:1](O)[C:2](=O)O' },
  { nv: 'acidos', n: 'ácido butanodioico', alt: ['ácido succínico'], s: 'O=[C:1](O)[CH2:2][CH2:3][C:4](=O)O' },
  {
    nv: 'acidos', n: 'ácido benzoico', sis: 'ácido bencenocarboxílico', alt: ['ácido bencenocarboxílico'],
    s: 'OC(=O)' + BENCENO_1,
  },
  { nv: 'acidos', n: 'metanoato de metilo', alt: ['formiato de metilo'], s: 'O=[CH:1]O[CH3:101]' },
  { nv: 'acidos', n: 'etanoato de metilo', alt: ['acetato de metilo'], s: '[CH3:2][C:1](=O)O[CH3:101]' },
  {
    nv: 'acidos', n: 'etanoato de etilo', alt: ['acetato de etilo'], s: '[CH3:2][C:1](=O)O[CH2:101][CH3:102]',
    nota: 'Ésteres (clase funcional): la cadena principal es la del ácido de partida (-oico → -oato) y el grupo unido al O se nombra al final: «de etilo».',
  },
  { nv: 'acidos', n: 'etanoato de propilo', alt: ['acetato de propilo'], s: '[CH3:2][C:1](=O)O[CH2:101][CH2:102][CH3:103]' },
  { nv: 'acidos', n: 'propanoato de metilo', s: '[CH3:3][CH2:2][C:1](=O)O[CH3:101]' },
  { nv: 'acidos', n: 'butanoato de etilo', s: '[CH3:4][CH2:3][CH2:2][C:1](=O)O[CH2:101][CH3:102]' },
  { nv: 'acidos', n: 'benzoato de metilo', alt: ['bencenocarboxilato de metilo'], s: '[CH3:101]OC(=O)' + BENCENO_1 },
  {
    nv: 'acidos', n: 'etanoato de fenilo', alt: ['acetato de fenilo'],
    s: '[CH3:2][C:1](=O)O[c:101]1[cH:102][cH:103][cH:104][cH:105][cH:106]1',
  },

  // ───────────── Aminas, amidas y nitrilos ─────────────
  { nv: 'nitrogenados', n: 'metanamina', alt: ['metilamina'], s: 'N[CH3:1]' },
  { nv: 'nitrogenados', n: 'etanamina', alt: ['etilamina'], s: 'N[CH2:1][CH3:2]' },
  { nv: 'nitrogenados', n: 'propan-1-amina', alt: ['propilamina', '1-propanamina'], s: 'N[CH2:1][CH2:2][CH3:3]' },
  { nv: 'nitrogenados', n: 'propan-2-amina', alt: ['isopropilamina', '2-propanamina'], s: '[CH3:1][CH:2](N)[CH3:3]' },
  { nv: 'nitrogenados', n: 'butan-2-amina', alt: ['sec-butilamina', '2-butanamina'], s: '[CH3:1][CH:2](N)[CH2:3][CH3:4]' },
  {
    nv: 'nitrogenados', n: 'N-metiletanamina', alt: ['etilmetilamina', 'etil metil amina'], s: 'CN[CH2:1][CH3:2]',
    nota: 'En aminas secundarias y terciarias, la cadena más importante es la principal; las demás se citan como sustituyentes con el localizador N.',
  },
  { nv: 'nitrogenados', n: 'N,N-dimetilmetanamina', alt: ['trimetilamina'], s: 'CN(C)[CH3:1]' },
  { nv: 'nitrogenados', n: 'N-etil-N-metilpropan-1-amina', s: 'CCN(C)[CH2:1][CH2:2][CH3:3]' },
  { nv: 'nitrogenados', n: 'ciclohexanamina', alt: ['ciclohexilamina'], s: 'N[CH:1]1[CH2:2][CH2:3][CH2:4][CH2:5][CH2:6]1' },
  { nv: 'nitrogenados', n: 'anilina', sis: 'bencenamina', alt: ['bencenamina', 'fenilamina'], s: 'N' + BENCENO_1 },
  { nv: 'nitrogenados', n: 'etanamida', alt: ['acetamida'], s: '[CH3:2][C:1](=O)N' },
  { nv: 'nitrogenados', n: 'propanamida', s: '[CH3:3][CH2:2][C:1](=O)N' },
  { nv: 'nitrogenados', n: '2-metilpropanamida', s: '[CH3:3][CH:2](C)[C:1](=O)N' },
  { nv: 'nitrogenados', n: 'N-metiletanamida', alt: ['N-metilacetamida'], s: 'CN[C:1](=O)[CH3:2]' },
  { nv: 'nitrogenados', n: 'N,N-dimetilmetanamida', alt: ['N,N-dimetilformamida', 'dimetilformamida', 'DMF'], s: 'CN(C)[CH:1]=O' },
  { nv: 'nitrogenados', n: 'benzamida', sis: 'bencenocarboxamida', alt: ['bencenocarboxamida'], s: 'NC(=O)' + BENCENO_1 },
  {
    nv: 'nitrogenados', n: 'etanonitrilo', alt: ['acetonitrilo'], s: 'N#[C:1][CH3:2]',
    nota: 'En el sufijo -nitrilo el carbono del –C≡N forma parte de la cadena (es el C1).',
  },
  { nv: 'nitrogenados', n: 'propanonitrilo', alt: ['propionitrilo'], s: 'N#[C:1][CH2:2][CH3:3]' },
  { nv: 'nitrogenados', n: 'butanonitrilo', alt: ['butironitrilo'], s: 'N#[C:1][CH2:2][CH2:3][CH3:4]' },
  { nv: 'nitrogenados', n: '2-metilpropanonitrilo', s: 'N#[C:1][CH:2](C)[CH3:3]' },
  { nv: 'nitrogenados', n: 'benzonitrilo', sis: 'bencenocarbonitrilo', alt: ['bencenocarbonitrilo'], s: 'N#C' + BENCENO_1 },

  // ───────────── Aromáticos ─────────────
  { nv: 'aromaticos', n: 'benceno', s: '[cH:1]1[cH:2][cH:3][cH:4][cH:5][cH:6]1' },
  { nv: 'aromaticos', n: 'tolueno', sis: 'metilbenceno', alt: ['metilbenceno'], s: 'C' + BENCENO_1 },
  { nv: 'aromaticos', n: 'etilbenceno', s: 'CC' + BENCENO_1 },
  { nv: 'aromaticos', n: 'isopropilbenceno', alt: ['cumeno', '(propan-2-il)benceno', '(1-metiletil)benceno'], s: 'CC(C)' + BENCENO_1 },
  {
    nv: 'aromaticos', n: '1,2-dimetilbenceno', alt: ['o-xileno', 'orto-xileno', 'o-dimetilbenceno'],
    s: 'C[c:1]1[c:2](C)[cH:3][cH:4][cH:5][cH:6]1',
    nota: 'Posiciones relativas en el benceno: 1,2 = orto (o-), 1,3 = meta (m-), 1,4 = para (p-).',
  },
  { nv: 'aromaticos', n: '1,3-dimetilbenceno', alt: ['m-xileno', 'meta-xileno', 'm-dimetilbenceno'], s: 'C[c:1]1[cH:2][c:3](C)[cH:4][cH:5][cH:6]1' },
  { nv: 'aromaticos', n: '1,4-dimetilbenceno', alt: ['p-xileno', 'para-xileno', 'p-dimetilbenceno'], s: 'C[c:1]1[cH:2][cH:3][c:4](C)[cH:5][cH:6]1' },
  {
    nv: 'aromaticos', n: '1-etil-2-metilbenceno', alt: ['o-etilmetilbenceno'], s: 'CC[c:1]1[c:2](C)[cH:3][cH:4][cH:5][cH:6]1',
    nota: 'Orden alfabético: etil antes que metil, así que etil recibe el 1.',
  },
  { nv: 'aromaticos', n: 'nitrobenceno', s: '[O-][N+](=O)' + BENCENO_1 },
  {
    nv: 'aromaticos', n: '1-cloro-4-nitrobenceno', alt: ['p-cloronitrobenceno'], s: 'Cl[c:1]1[cH:2][cH:3][c:4]([N+](=O)[O-])[cH:5][cH:6]1',
    nota: 'Cloro y nitro son ambos prefijos: con 1,4 en cualquier sentido, el 1 va al primero alfabéticamente (cloro).',
  },
  { nv: 'aromaticos', n: '1-bromo-3-clorobenceno', alt: ['m-bromoclorobenceno'], s: 'Br[c:1]1[cH:2][c:3](Cl)[cH:4][cH:5][cH:6]1' },
  { nv: 'aromaticos', n: 'estireno', sis: 'etenilbenceno', alt: ['etenilbenceno', 'vinilbenceno', 'feniletileno'], s: 'C=C' + BENCENO_1 },
  { nv: 'aromaticos', n: '4-metilfenol', alt: ['p-cresol', 'p-metilfenol'], s: 'C[c:4]1[cH:3][cH:2][c:1](O)[cH:6][cH:5]1' },
  { nv: 'aromaticos', n: 'naftaleno', s: 'c1ccc2ccccc2c1' },

  // ───────────── Polifuncionales ─────────────
  {
    nv: 'poli', n: '3-oxobutanal', s: 'O=[CH:1][CH2:2][C:3](=O)[CH3:4]',
    nota: 'El aldehído tiene más prioridad que la cetona (tabla de prioridades): va como sufijo (-al) y la cetona pasa a prefijo (oxo-).',
  },
  {
    nv: 'poli', n: '4-hidroxibutan-2-ona', s: '[CH3:1][C:2](=O)[CH2:3][CH2:4]O',
    nota: 'Cetona > alcohol: la cetona es el sufijo (-ona) y el –OH se nombra como prefijo «hidroxi».',
  },
  { nv: 'poli', n: '4-aminobutan-2-ona', s: '[CH3:1][C:2](=O)[CH2:3][CH2:4]N' },
  { nv: 'poli', n: 'ácido 2-hidroxipropanoico', alt: ['ácido láctico'], s: '[CH3:3][CH:2](O)[C:1](=O)O' },
  { nv: 'poli', n: 'ácido 4-oxopentanoico', s: '[CH3:5][C:4](=O)[CH2:3][CH2:2][C:1](=O)O' },
  { nv: 'poli', n: 'ácido 3-aminopropanoico', alt: ['β-alanina', 'beta-alanina'], s: 'N[CH2:3][CH2:2][C:1](=O)O' },
  { nv: 'poli', n: 'ácido 2-hidroxibenzoico', alt: ['ácido salicílico'], s: 'OC(=O)[c:1]1[c:2](O)[cH:3][cH:4][cH:5][cH:6]1' },
  {
    nv: 'poli', n: '2-aminoetan-1-ol', alt: ['2-aminoetanol', 'etanolamina'], s: 'N[CH2:2][CH2:1]O',
    nota: 'Alcohol > amina: -ol es el sufijo y el –NH2 se nombra como prefijo «amino».',
  },
  { nv: 'poli', n: '2-cloropropanal', s: 'O=[CH:1][CH:2](Cl)[CH3:3]' },
  { nv: 'poli', n: '5-metilhex-3-en-2-ol', s: '[CH3:1][CH:2](O)[CH:3]=[CH:4][CH:5](C)[CH3:6]' },
  { nv: 'poli', n: '3-metilbut-3-en-2-ona', s: '[CH3:1][C:2](=O)[C:3](C)=[CH2:4]' },
  { nv: 'poli', n: '3-hidroxibutanoato de etilo', s: '[CH3:4][CH:3](O)[CH2:2][C:1](=O)O[CH2:101][CH3:102]' },
];
