"use strict";
(() => {
  const key = "lift-pricing-v1";
  const defaults = { free: 0, ai: 19.99, premium: 39.99, promos: [] };
  function read() {
    try { const stored = JSON.parse(localStorage.getItem(key) || "null"); return { ...defaults, ...stored, promos: Array.isArray(stored?.promos) ? stored.promos : [] }; }
    catch { return { ...defaults }; }
  }
  function save(value) { try { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event("lift:pricing-change")); return true; } catch { return false; } }
  const price = (plan, promoCode = "") => {
    const data = read();
    const base = Number(data[plan]) || 0;
    const promo = data.promos.find(item => item.code === String(promoCode).trim().toUpperCase() && item.active && (!item.plans?.length || item.plans.includes(plan)));
    return { base, discount: promo ? promo.discount : 0, total: Math.max(0, Math.round(base * (100 - (promo?.discount || 0))) / 100), valid: Boolean(promo) };
  };
  window.LiftPricing = { key, read, save, price };
})();
