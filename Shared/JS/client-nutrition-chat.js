"use strict";

(() => {
  const key = "lift-alexander-maya-chat-v1";
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(saved) ? saved.filter(item => ["client", "nutritionist"].includes(item.from) && typeof item.text === "string" && typeof item.time === "string") : [];
    } catch { return []; }
  }
  function send(from, text) {
    if (!["client", "nutritionist"].includes(from) || !text.trim()) return false;
    try { localStorage.setItem(key, JSON.stringify([...read(), { from, text: text.trim().slice(0, 1000), time: new Date().toISOString() }])); }
    catch { return false; }
    document.dispatchEvent(new Event("lift:client-nutrition-chat-change"));
    return true;
  }
  window.LiftClientNutritionChat = { key, read, send };
})();
