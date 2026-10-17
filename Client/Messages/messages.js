"use strict";
if (window.LiftClientAccess?.isPremium() !== false) {


const specialists = {
  coach: { name: "Sarah Chen", initials: "SC", role: "Your coach · Strength & conditioning", profileRole: "Strength & conditioning coach", approval: "Discuss your training plan together.", guidance: "Tell Sarah what fits your schedule or what feels difficult. She can review and approve an update to your training plan.", emptyTitle: "Start a conversation with Sarah.", emptyDescription: "Ask about your training schedule, exercise technique or a change to your workout plan.", placeholder: "Write a message to Sarah…" },
  nutritionist: { name: "Maya Haddad", initials: "MH", role: "Your nutritionist · Personal nutrition", profileRole: "Personal nutritionist", approval: "Discuss your nutrition plan together.", guidance: "Share your food preferences or questions with Maya. She can review and approve changes to your nutrition plan.", emptyTitle: "Start a conversation with Maya.", emptyDescription: "Ask about your meals, nutrition targets or a change to your nutrition plan.", placeholder: "Write a message to Maya…" }
};
let activeChat = new URLSearchParams(window.location.search).get("chat") === "nutritionist" ? "nutritionist" : "coach";
const $ = (id) => document.getElementById(id);
const messageList = $("message-list");
const messageText = $("message-text");

function renderConversation() {
  if (!document.getElementById("message-list")) return;
  const messages = activeChat === "coach" ? window.LiftClientCoachChat.read() : window.LiftClientNutritionChat.read();
  const specialist = specialists[activeChat];
  $("chat-avatar").textContent = specialist.initials;
  $("chat-title").textContent = specialist.name;
  $("chat-role").textContent = specialist.role;
  $("profile-avatar").textContent = specialist.initials;
  $("profile-name").textContent = specialist.name;
  $("profile-role").textContent = specialist.profileRole;
  $("approval-text").textContent = specialist.approval;
  $("guidance-text").textContent = specialist.guidance;
  messageText.placeholder = specialist.placeholder;
  messageList.setAttribute("aria-label", "Messages with " + specialist.name);
  document.querySelectorAll(".contact-button").forEach((button) => {
    const selected = button.dataset.chat === activeChat;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  messageList.replaceChildren();
  if (messages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = '<span aria-hidden="true">✳</span><h3></h3><p></p>';
    empty.querySelector("h3").textContent = specialist.emptyTitle;
    empty.querySelector("p").textContent = specialist.emptyDescription;
    messageList.append(empty);
    return;
  }
  messages.forEach(({ text, time, from }) => {
    const bubble = document.createElement("article");
    bubble.className = "message-bubble";
    if (from === "coach" || from === "nutritionist") bubble.classList.add("specialist-message");
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    const timestamp = document.createElement("time");
    timestamp.dateTime = time;
    timestamp.textContent = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(time));
    bubble.append(paragraph, timestamp);
    messageList.append(bubble);
  });
  messageList.scrollTop = messageList.scrollHeight;
}

document.querySelectorAll(".contact-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeChat = button.dataset.chat;
    renderConversation();
  });
});
$("message-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageText.value.trim();
  if (!text) return;
  if (activeChat === "coach") {
    if (!window.LiftClientCoachChat.send("client", text)) return window.LiftNotice.error("Could not save the message on this device.");
  } else {
    if (!window.LiftClientNutritionChat.send("client", text)) return window.LiftNotice.error("Could not save the message on this device.");
  }
  messageText.value = "";
  renderConversation();
  window.LiftNotice.success("Message sent.");
  messageText.focus();
});
messageText.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    $("message-form").requestSubmit();
  }
});
renderConversation();
window.addEventListener("storage", event => {
  if (event.key === window.LiftClientCoachChat.key && activeChat === "coach") renderConversation();
  if (event.key === window.LiftClientNutritionChat.key && activeChat === "nutritionist") renderConversation();
});
window.addEventListener("focus", renderConversation);
}
