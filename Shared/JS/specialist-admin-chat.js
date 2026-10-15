"use strict";
(() => {
  const key = "lift-admin-specialist-chats-v1";
  const seed = {
    coach: [{ from: "coach", text: "Alexander can only train for 90 minutes. I adjusted the AI workout proposal and need the schedule reflected in his plan.", time: "09 Oct · 12:05" }],
    nutritionist: [{ from: "nutritionist", text: "I reviewed the suggested meal plan. Can you confirm whether the client's food preferences have been updated?", time: "08 Oct · 14:20" }, { from: "admin", text: "I will check the client profile and follow up here.", time: "08 Oct · 15:00" }]
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  function read() { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; } }
  function init(role) {
    const $ = selector => document.querySelector(selector);
    function thread() { const saved = read()[role]; return Array.isArray(saved) ? saved : seed[role]; }
    function render() {
      $("#chat-log").innerHTML = thread().map(message => `<article class="chat-bubble ${message.from === role ? "mine" : "admin"}"><strong>${message.from === role ? "You" : "LIFT Admin"}</strong><p>${escapeHtml(message.text)}</p><time>${escapeHtml(message.time)}</time></article>`).join("");
      $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
    }
    $("#chat-form").addEventListener("submit", event => {
      event.preventDefault();
      const field = $("#chat-text");
      const text = field.value.trim();
      if (!text) return;
      const saved = read();
      saved[role] = [...thread(), { from: role, text, time: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date()) }];
      localStorage.setItem(key, JSON.stringify(saved));
      field.value = "";
      render();
      $("#chat-status").textContent = "Message sent to LIFT Admin.";
    });
    window.addEventListener("storage", event => { if (event.key === key) render(); });
    window.addEventListener("focus", render);
    render();
  }
  window.LiftSpecialistAdminChat = { init };
})();
