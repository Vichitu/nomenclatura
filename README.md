# Nomenclatura orgánica

Web para practicar la nomenclatura IUPAC de química orgánica (en español),
basada en los apuntes del Tema 2: Química orgánica estructural.

## Modos

- **Nombre → Estructura:** dibuja la molécula con piezas a partir de su nombre.
- **Estructura → Nombre:** escribe el nombre de la molécula dibujada.
- **Nombres triviales:** las moléculas y grupos de la lámina «Algunos nombres triviales»
  y los radicales de los apuntes manuscritos (52 en total): dibujarlos, nombrarlos o
  elegir entre cuatro opciones (nombre o estructura).
- **Cadena principal:** marcar y numerar la cadena principal sobre el dibujo.
- **Grupos funcionales:** comparar prioridades, ordenar grupos, elegir prefijo y
  sufijo, y nombrar moléculas polifuncionales.
- **Encuentra el error:** decide qué regla incumple un nombre propuesto.
- **Isómeros:** dibuja todos los isómeros de una fórmula molecular.
- **Estereoquímica:** asigna R/S y E/Z.
- **Identificar mi dibujo:** dibuja cualquier molécula y su nombre IUPAC aparece
  al momento, con el grupo principal, la cadena principal, la fórmula, la
  estereoquímica (E/Z por el dibujo y R/S con las cuñas) y el nombre trivial si lo tiene.
- **Repaso general:** examen de prueba con preguntas de todas las secciones.

El progreso se guarda en el navegador de cada usuario (`localStorage`), con
repetición espaciada: las moléculas falladas vuelven antes.

## Uso

Es una web estática: basta con abrir `index.html` en un navegador con conexión
a internet (la librería química RDKit.js se carga desde unpkg).

## Estructura

- `js/moleculas.js` — banco de ejercicios (nombre + SMILES con la cadena numerada).
- `js/quimica.js` — RDKit, grafo molecular y dibujo SVG.
- `js/nombre.js` — análisis de nombres: partes, resaltado y diagnóstico de errores.
- `js/nombrador.js` — genera el nombre IUPAC de una estructura dibujada.
- `js/editor.js` — editor de estructuras por piezas.
- `js/progreso.js` — progreso y repetición espaciada.
- `js/modos/` — un archivo por modo de práctica.
- `js/app.js` — núcleo de la interfaz.
