"use strict";

const adminKey = "lift-admin-specialist-chats-v1";
const initialAdminThread = [
  { from: "nutritionist", text: "I reviewed the suggested meal plan. Can you confirm whether the client's food preferences have been updated?", time: "08 Oct · 14:20" },
  { from: "admin", text: "I will check the client profile and follow up here.", time: "08 Oct · 15:00" }
];
const $ = id => document.getElementById(id);
let activeThread = new URLSearchParams(location.search).get("thread") === "admin" ? "admin" : "client";
function readAdminData() {
  try { return JSON.parse(localStorage.getItem(adminKey) || "{}"); }
  catch { return {}; }
}
function adminMessages() {
  const saved = readAdminData().nutritionist;
  return Array.isArray(saved) ? saved : initialAdminThread;
}
function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" }).format(date);
}
function render() {
  const client = activeThread === "client";
  $("conversation-avatar").textContent = client ? "AD" : "✳";
  $("conversation-name").textContent = client ? "Alexander Drake" : "LIFT Admin";
  $("conversation-subtitle").textContent = client ? "Your assigned client · Premium" : "Account & nutrition coordination";
  $("conversation-type").textContent = client ? "CLIENT CHAT" : "ADMIN CHAT";
  $("message-text").placeholder = client ? "Write to Alexander…" : "Write to LIFT Admin…";
  $("context-title").textContent = client ? "Nutrition that fits real life." : "Need help from the team?";
  $("context-copy").textContent = client
    ? "Ask Alexander about food preferences or meal timing. Review and approve a revised plan after you agree on it."
    : "Use this conversation for account questions or nutrition coordination with LIFT Admin.";
  $("context-link").hidden = !client;
  document.querySelectorAll(".thread-button").forEach(button => {
    const selected = button.dataset.thread === activeThread;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const messages = client ? window.LiftClientNutritionChat.read() : adminMessages();
  if (client) {
    const newest = messages.filter(message => message.from === "client").map(message => Date.parse(message.time)).filter(Number.isFinite).reduce((max, time) => Math.max(max, time), 0);
    if (newest) localStorage.setItem("lift-nutrition-client-chat-read-v1", new Date(newest).toISOString());
  }
  const log = $("conversation-log");
  log.replaceChildren();
  if (!messages.length) {
    const empty = document.createElement("div");
    empty.className = "chat-empty";
    empty.innerHTML = '<span aria-hidden="true">✳</span><h3>Start the conversation.</h3><p></p>';
    empty.querySelector("p").textContent = client
      ? "Discuss meal choices, preferences or a change to Alexander's nutrition plan."
      : "Ask the admin team about your account or nutrition coordination.";
    log.append(empty);
  } else {
    messages.forEach(message => {
      const bubble = document.createElement("article");
      bubble.className = `chat-bubble ${message.from === "nutritionist" ? "mine" : "theirs"}`;
      const name = document.createElement("strong");
      name.textContent = message.from === "nutritionist" ? "You" : client ? "Alexander" : "LIFT Admin";
      const body = document.createElement("p");
      body.textContent = message.text;
      const time = document.createElement("time");
      time.textContent = formatTime(message.time);
      bubble.append(name, body, time);
      log.append(bubble);
    });
  }
  log.scrollTop = log.scrollHeight;
}
document.querySelectorAll(".thread-button").forEach(button => button.addEventListener("click", () => {
  activeThread = button.dataset.thread;
  render();
}));
$("message-form").addEventListener("submit", event => {
  event.preventDefault();
  const field = $("message-text");
  const text = field.value.trim();
  if (!text) return;
  let saved = false;
  if (activeThread === "client") saved = window.LiftClientNutritionChat.send("nutritionist", text);
  else {
    const data = readAdminData();
    data.nutritionist = [...adminMessages(), { from: "nutritionist", text, time: new Date().toISOString() }];
    try { localStorage.setItem(adminKey, JSON.stringify(data)); saved = true; } catch { saved = false; }
  }
  $("message-status").textContent = saved ? "Message sent." : "Could not save the message on this device.";
  if (!saved) return;
  field.value = "";
  render();
  field.focus();
});
$("message-text").addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    $("message-form").requestSubmit();
  }
});
window.addEventListener("storage", event => {
  if ([adminKey, window.LiftClientNutritionChat.key].includes(event.key)) render();
});
window.addEventListener("focus", render);
render();
