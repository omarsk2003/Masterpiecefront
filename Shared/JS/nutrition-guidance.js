"use strict";

(() => {
  const key = "lift-alexander-nutrition-guidance-v1";
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(saved) ? saved.filter(item => item && item.clientId === "alexander-drake") : [];
    } catch { return []; }
  }
  function write(items) {
    try { localStorage.setItem(key, JSON.stringify(items)); }
    catch { return false; }
    document.dispatchEvent(new Event("lift:nutrition-guidance-change"));
    return true;
  }
  function add(input) {
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      clientId: "alexander-drake",
      topic: String(input.topic).trim().slice(0, 60),
      title: String(input.title).trim().slice(0, 100),
      body: String(input.body).trim().slice(0, 600),
      createdAt: new Date().toISOString()
    };
    return write([item, ...read()]);
  }
  function remove(id) { return write(read().filter(item => item.id !== id)); }
  window.LiftNutritionGuidance = { key, read, add, remove };
})();
