"use strict";

// One local conversation shared by Alexander's client page and Sarah's coach page.
(() => {
  const key = "lift-alexander-sarah-chat-v1";
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(saved) ? saved.filter(item => ["client", "coach"].includes(item.from) && typeof item.text === "string" && typeof item.time === "string") : [];
    } catch { return []; }
  }
  function send(from, text) {
    if (!["client", "coach"].includes(from) || !text.trim()) return false;
    const next = [...read(), { from, text: text.trim().slice(0, 1000), time: new Date().toISOString() }];
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { return false; }
    document.dispatchEvent(new Event("lift:client-coach-chat-change"));
    return true;
  }
  window.LiftClientCoachChat = { key, read, send };
})();
