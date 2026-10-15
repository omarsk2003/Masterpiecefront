"use strict";

// Static inbox examples. Replies remain in this page's memory until refresh.
const conversations = [
  { id: 1, source: "client", name: "Alexander Drake", email: "alexander@example.com", subject: "Workout schedule does not fit", category: "Suggestion", date: "09 Oct", messages: [
    { from: "client", text: "My current workout starts too early for my work schedule. Could LIFT make it easier to request a later time?", time: "09 Oct · 10:12" }
  ] },
  { id: 2, source: "public", name: "Hala Nasser", email: "hala@example.com", subject: "Questions about membership", category: "Memberships", date: "09 Oct", messages: [
    { from: "visitor", text: "I would like to know more about the Premium plan and how specialist matching works before registering.", time: "09 Oct · 09:35" }
  ] },
  { id: 3, source: "client", name: "Nour Salem", email: "nour@example.com", subject: "Progress chart issue", category: "Technical issue", date: "08 Oct", messages: [
    { from: "client", text: "I entered my latest weight, but the progress chart did not update. Can you check this?", time: "08 Oct · 16:24" },
    { from: "admin", text: "Thanks for letting us know. Please tell us which device and browser you are using so we can look into it.", time: "08 Oct · 17:02" },
    { from: "client", text: "I'm using Chrome on my phone. I can send more details if needed.", time: "09 Oct · 08:10" }
  ] },
  { id: 4, source: "public", name: "Adam Saleh", email: "adam@example.com", subject: "Contact page feedback", category: "Something else", date: "07 Oct", messages: [
    { from: "visitor", text: "The website looks great. I would love to see more detail about the nutrition service on the public pages.", time: "07 Oct · 13:40" }
  ] },
  { id: 5, source: "client", name: "Mariam Haddad", email: "mariam@example.com", subject: "Billing question", category: "Account & billing", date: "06 Oct", messages: [
    { from: "client", text: "I have a question about when my Premium subscription renews.", time: "06 Oct · 11:05" },
    { from: "admin", text: "We received your question. Subscription details will be available in your account when billing is connected.", time: "06 Oct · 11:30" }
  ] },
  { id: 6, source: "coach", name: "Sarah Chen", email: "sarah@lift.demo", subject: "Client workout availability", category: "Training coordination", date: "09 Oct", messages: [
    { from: "coach", text: "Alexander can only train for 90 minutes. I adjusted the AI workout proposal and need the schedule reflected in his plan.", time: "09 Oct · 12:05" }
  ] },
  { id: 7, source: "nutritionist", name: "Maya Haddad", email: "maya@lift.demo", subject: "Nutrition plan clarification", category: "Nutrition coordination", date: "08 Oct", messages: [
    { from: "nutritionist", text: "I reviewed the suggested meal plan. Can you confirm whether the client's food preferences have been updated?", time: "08 Oct · 14:20" },
    { from: "admin", text: "I will check the client profile and follow up here.", time: "08 Oct · 15:00" }
  ] }
];

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const initials = name => name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();
const specialistChatKey = "lift-admin-specialist-chats-v1";
function readSpecialistChats() {
  try { return JSON.parse(localStorage.getItem(specialistChatKey) || "{}"); } catch { return {}; }
}
function syncSpecialistChats() {
  const saved = readSpecialistChats();
  for (const item of conversations.filter(entry => ["coach", "nutritionist"].includes(entry.source))) {
    const thread = saved[item.source];
    if (Array.isArray(thread) && thread.every(message => [item.source, "admin"].includes(message.from) && typeof message.text === "string" && typeof message.time === "string")) item.messages = thread;
  }
}
function saveSpecialistChats() {
  const saved = readSpecialistChats();
  for (const item of conversations.filter(entry => ["coach", "nutritionist"].includes(entry.source))) saved[item.source] = item.messages;
  localStorage.setItem(specialistChatKey, JSON.stringify(saved));
}
syncSpecialistChats();
let filter = "all";
let selectedId = conversations[0].id;
const memberEmail = new URLSearchParams(location.search).get("member");
if (memberEmail) {
  const linkedConversation = conversations.find(item => item.source === "client" && item.email.toLowerCase() === memberEmail.toLowerCase());
  if (linkedConversation) selectedId = linkedConversation.id;
}

function visibleConversations() {
  const query = $("#message-search").value.trim().toLowerCase();
  return conversations.filter(item => (filter === "all" || item.source === filter) && (!query || [item.name, item.email, item.subject, item.category, ...item.messages.map(message => message.text)].join(" ").toLowerCase().includes(query)));
}

function renderList() {
  const visible = visibleConversations();
  $("#inbox-total").textContent = `${conversations.length} messages`;
  $("#stat-all").textContent = conversations.length;
  $("#stat-client").textContent = conversations.filter(item => item.source !== "public").length;
  $("#stat-public").textContent = conversations.filter(item => item.source === "public").length;
  $("#stat-awaiting").textContent = conversations.filter(item => item.source !== "public" && item.messages.at(-1)?.from !== "admin").length;
  $("#visible-count").textContent = `${visible.length} shown`;
  $("#list-empty").hidden = visible.length !== 0;
  $("#message-list").innerHTML = visible.map(item => {
    const last = item.messages.at(-1);
    return `<button type="button" class="message-item ${item.id === selectedId ? "active" : ""}" data-id="${item.id}" aria-current="${item.id === selectedId ? "true" : "false"}"><span class="item-top"><span class="item-avatar" aria-hidden="true">${escapeHtml(initials(item.name))}</span><strong>${escapeHtml(item.name)}</strong><time>${escapeHtml(item.date)}</time></span><strong>${escapeHtml(item.subject)}</strong><p>${escapeHtml(last.text)}</p><span class="item-type ${item.source}">${({ client: "REGISTERED CLIENT", coach: "COACH", nutritionist: "NUTRITIONIST", public: "PUBLIC VISITOR" })[item.source]}</span></button>`;
  }).join("");
}

function renderConversation() {
  const item = conversations.find(message => message.id === selectedId);
  if (!item) {
    $("#conversation-source").textContent = "MESSAGE DETAILS";
    $("#conversation-title").textContent = "Select a message";
    $("#conversation-meta").textContent = "";
    $("#source-badge").hidden = true;
    $("#conversation-content").innerHTML = '<p class="list-empty">Choose a message from the inbox to read it.</p>';
    $("#reply-form").hidden = true;
    $("#visitor-notice").hidden = true;
    $("#subscription-link").hidden = true;
    return;
  }
  $("#conversation-source").textContent = ({ client: "CLIENT SUPPORT", coach: "COACH CONVERSATION", nutritionist: "NUTRITIONIST CONVERSATION", public: "PUBLIC CONTACT US" })[item.source];
  $("#source-badge").hidden = false;
  $("#conversation-title").textContent = item.name;
  $("#conversation-meta").textContent = `${item.email} · ${item.category}`;
  $("#source-badge").textContent = ({ client: "CLIENT ACCOUNT", coach: "COACH ACCOUNT", nutritionist: "NUTRITIONIST ACCOUNT", public: "VISITOR" })[item.source];
  $("#source-badge").classList.toggle("public", item.source === "public");
  $("#conversation-content").innerHTML = `<h3 class="thread-subject">${escapeHtml(item.subject)}</h3>` + item.messages.map(message => `<article class="thread-message ${message.from === "admin" ? "admin" : ""}"><strong>${message.from === "admin" ? "LIFT Admin" : escapeHtml(item.name)}</strong><p>${escapeHtml(message.text)}</p><time>${escapeHtml(message.time)}</time></article>`).join("");
  $("#visitor-notice").hidden = item.source !== "public";
  const hasMembership = item.source === "client" && item.email.toLowerCase() === "alexander@example.com";
  $("#subscription-link").hidden = !hasMembership;
  if (hasMembership) $("#subscription-link").href = `../Subscriptions/subscriptions.html?member=${encodeURIComponent(item.email)}`;
  $("#reply-form").hidden = item.source === "public";
  $("#reply-label").textContent = `Reply to ${item.source === "client" ? "client" : item.source}`;
  $("#conversation-content").scrollTop = $("#conversation-content").scrollHeight;
}

$("#message-list").addEventListener("click", event => {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  selectedId = Number(button.dataset.id);
  renderList();
  renderConversation();
});
$("#message-search").addEventListener("input", () => {
  const visible = visibleConversations();
  if (!visible.some(item => item.id === selectedId)) selectedId = visible[0]?.id ?? null;
  renderList();
  renderConversation();
});
document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(item => {
    item.classList.toggle("active", item === button);
    item.setAttribute("aria-pressed", String(item === button));
  });
  const visible = visibleConversations();
  if (!visible.some(item => item.id === selectedId)) selectedId = visible[0]?.id ?? null;
  renderList();
  renderConversation();
}));
$("#reply-form").addEventListener("submit", event => {
  event.preventDefault();
  const item = conversations.find(message => message.id === selectedId);
  if (!item || item.source === "public") return;
  const text = $("#reply-text").value.trim();
  if (!text) return;
  item.messages.push({ from: "admin", text, time: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date()) });
  if (["coach", "nutritionist"].includes(item.source)) saveSpecialistChats();
  $("#reply-text").value = "";
  renderList();
  renderConversation();
  $("#reply-status").textContent = `Reply added to ${item.name}'s conversation.`;
});

const menuButton = $(".admin-menu-toggle");
menuButton.addEventListener("click", () => {
  const opened = $("lift-admin-sidebar").classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(opened));
  menuButton.setAttribute("aria-label", opened ? "Close sidebar" : "Open sidebar");
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    $("lift-admin-sidebar").classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open sidebar");
  }
});

renderList();
renderConversation();
window.addEventListener("storage", event => { if (event.key === specialistChatKey) { syncSpecialistChats(); renderList(); renderConversation(); } });
window.addEventListener("focus", () => { syncSpecialistChats(); renderList(); renderConversation(); });

