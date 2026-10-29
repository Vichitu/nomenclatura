# Nomenclatura orgánica

Web para practicar la nomenclatura IUPAC de química orgánica (en español),
basada en los apuntes del Tema 2: Química orgánica estructural.

## Modos

- **Nombre → Estructura:** dibuja la molécula con piezas a partir de su nombre.
- **Estructura → Nombre:** escribe el nombre de la molécula dibujada.
- **Nombres triviales:** las moléculas y grupos de la lámina «Algunos nombres triviales»,
  para dibujarlos a partir del nombre y nombrarlos a partir del dibujo.
- **Cadena principal:** marcar y numerar la cadena principal sobre el dibujo, y ordenar
  grupos funcionales por prioridad.
- **Encuentra el error:** decide qué regla incumple un nombre propuesto.
- **Isómeros:** dibuja todos los isómeros de una fórmula molecular.
- **Estereoquímica:** asigna R/S y E/Z.
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
- `js/editor.js` — editor de estructuras por piezas.
- `js/progreso.js` — progreso y repetición espaciada.
- `js/modos/` — un archivo por modo de práctica.
- `js/app.js` — núcleo de la interfaz.
