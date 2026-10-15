// Progreso del alumno, guardado en este navegador (localStorage):
// estadísticas por molécula, repetición espaciada (cajas de Leitner),
// recuento de tipos de error y preferencias.
'use strict';

const Progreso = (() => {
  const CLAVE = 'nomenclatura-iupac-v1';
  const MINUTO = 60000;
  const DIA = 24 * 60 * MINUTO;
  // Días de espera hasta el siguiente repaso según la caja (0 = recién fallada).
  const INTERVALOS = [0, 1, 3, 7, 16, 35];

  const d = leer();
  d.stats = d.stats || {};
  d.srs = d.srs || {};
  d.errores = d.errores || {};
  d.prefs = d.prefs || {};
  // Formato de la primera versión: modo y niveles sueltos.
  if (d.modo) { d.prefs.modo = d.prefs.modo || d.modo; delete d.modo; }
  if (d.niveles) { d.prefs.niveles = d.prefs.niveles || d.niveles; delete d.niveles; }

  function leer() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; }
  }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch (e) { /* sin almacenamiento */ }
  }

  // Pide al navegador que no borre estos datos aunque falte espacio.
  function persistir() {
    try { navigator.storage?.persist?.().catch(() => {}); } catch (e) { /* no soportado */ }
  }

  // clave: identificador del ejercicio en un modo (p. ej. "nombrar:etanol").
  // id: molécula, para las estadísticas globales.
  function registrar(clave, id, ok, tipoError) {
    if (id) {
      const s = d.stats[id] || { ok: 0, ko: 0 };
      if (ok) s.ok++; else s.ko++;
      d.stats[id] = s;
    }
    const r = d.srs[clave] || { caja: 0 };
    r.caja = ok ? Math.min(r.caja + 1, INTERVALOS.length - 1) : 0;
    r.proxima = Date.now() + (ok ? INTERVALOS[r.caja] * DIA : 10 * MINUTO);
    d.srs[clave] = r;
    if (!ok && tipoError) d.errores[tipoError] = (d.errores[tipoError] || 0) + 1;
    guardar();
  }

  const vencido = (clave, ahora = Date.now()) => !!d.srs[clave] && d.srs[clave].proxima <= ahora;
  const caja = (clave) => d.srs[clave]?.caja || 0;
  const azar = (a) => a[Math.floor(Math.random() * a.length)];

  // Elige el siguiente ejercicio: primero los que toca repasar, luego los nuevos.
  function elegir(items, claveDe, evitar = new Set()) {
    if (!items.length) return null;
    const libres = items.filter((x) => !evitar.has(claveDe(x)));
    const pool = libres.length ? libres : items;
    const ahora = Date.now();
    const vencidos = pool.filter((x) => vencido(claveDe(x), ahora));
    const nuevos = pool.filter((x) => !d.srs[claveDe(x)]);
    if (vencidos.length && (!nuevos.length || Math.random() < 0.7)) {
      const minima = Math.min(...vencidos.map((x) => caja(claveDe(x))));
      return azar(vencidos.filter((x) => caja(claveDe(x)) === minima));
    }
    if (nuevos.length) return azar(nuevos);
    const proximos = pool.slice().sort((a, b) => d.srs[claveDe(a)].proxima - d.srs[claveDe(b)].proxima);
    return azar(proximos.slice(0, 3));
  }

  const pendientes = (items, claveDe) => items.filter((x) => vencido(claveDe(x))).length;

  return {
    registrar, elegir, pendientes, caja, persistir,
    stats: () => d.stats,
    errores: () => d.errores,
    pref: (k, v) => {
      if (v === undefined) return d.prefs[k];
      d.prefs[k] = v;
      guardar();
      return v;
    },
  };
})();
