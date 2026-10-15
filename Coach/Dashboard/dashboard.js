"use strict";

function renderDashboardPlan() {
  const plan = window.LiftCoachPlan.read();
  const approved = plan.status === "approved";
  const stats = document.querySelectorAll(".stat-card");
  stats[1].querySelector("strong").textContent = approved ? "01" : "00";
  stats[1].querySelector("small").textContent = approved ? "Alexander's plan is active" : "No plan currently approved";
  stats[2].querySelector("strong").textContent = approved ? "00" : "01";
  stats[2].querySelector("small").textContent = approved ? "All caught up for now" : "Alexander's update needs approval";
  const pill = document.querySelector(".status-pill");
  pill.lastChild.textContent = approved ? " Plan approved" : " Needs review";
  document.querySelector(".focus-panel>p").textContent = approved
    ? "Alexander's workout plan is approved. If his schedule or exercise needs change, discuss it together before you approve an update."
    : "Alexander's revised plan is saved for review. Discuss any changes, then approve the update to share it with him.";
  document.getElementById("coach-review-summary").textContent = approved ? "Training plan approved" : "Alexander’s revision needs review";
}
function renderCoachActivity() {
  const upcoming = window.LiftCoachMeetings.read().filter(item => item.status === "accepted" && new Date(item.start).getTime() > Date.now());
  const lastRead = Date.parse(localStorage.getItem("lift-coach-client-chat-read-v1") || "") || 0;
  const messages = window.LiftClientCoachChat.read().filter(item => item.from === "client" && Date.parse(item.time) > lastRead);
  document.getElementById("coach-meeting-count").textContent = String(upcoming.length).padStart(2, "0");
  document.getElementById("coach-message-count").textContent = String(messages.length).padStart(2, "0");
  document.getElementById("coach-meeting-summary").textContent = upcoming.length ? `${upcoming.length} upcoming client ${upcoming.length === 1 ? "meeting" : "meetings"}` : "No upcoming meetings";
  document.getElementById("coach-message-summary").textContent = messages.length ? `${messages.length} unread client ${messages.length === 1 ? "message" : "messages"}` : "No unread messages";
}
function renderCoachGreeting() {
  let name = "Sarah Chen";
  try { name = JSON.parse(localStorage.getItem("lift-coach-profile-v1") || "{}").name || name; }
  catch { /* Keep the sample coach name. */ }
  document.querySelector(".page-heading h1 span").textContent = name.split(/\s+/)[0] + ".";
}
renderDashboardPlan();
renderCoachGreeting();
renderCoachActivity();
window.addEventListener("storage", renderDashboardPlan);
window.addEventListener("storage", renderCoachActivity);
document.addEventListener("lift:meetings-change", renderCoachActivity);
document.addEventListener("lift:client-coach-chat-change", renderCoachActivity);
window.addEventListener("storage", event => { if (event.key === "lift-coach-profile-v1") renderCoachGreeting(); });
