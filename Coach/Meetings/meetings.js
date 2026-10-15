"use strict";

const form = document.getElementById("meeting-form");
const startField = document.getElementById("meeting-start");
const feedback = document.getElementById("form-feedback");
function localDateTime(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
function refreshMinimum() {
  startField.min = localDateTime(new Date());
}
function prettyDate(value) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
function renderMeetings() {
  const meetings = window.LiftCoachMeetings.read();
  document.getElementById("requested-count").textContent = String(meetings.filter(item => item.status === "pending").length).padStart(2, "0");
  document.getElementById("upcoming-count").textContent = String(meetings.filter(item => item.status === "accepted" && new Date(item.start).getTime() >= Date.now()).length).padStart(2, "0");
  document.getElementById("previous-count").textContent = String(meetings.filter(item => new Date(item.start).getTime() < Date.now()).length).padStart(2, "0");
  const list = document.getElementById("meeting-list");
  list.replaceChildren();
  meetings.forEach(meeting => {
    const card = document.createElement("article");
    card.className = "meeting-card";
    const info = document.createElement("div");
    info.className = "meeting-info";
    const kicker = document.createElement("span");
    kicker.textContent = "ALEXANDER DRAKE · PREMIUM CLIENT";
    const title = document.createElement("h3");
    title.textContent = meeting.topic;
    const meta = document.createElement("p");
    meta.textContent = `${prettyDate(meeting.start)} · ${meeting.minutes} min`;
    info.append(kicker, title, meta);
    const actions = document.createElement("div");
    actions.className = "meeting-actions";
    const state = document.createElement("span");
    state.className = `meeting-state ${meeting.status}`;
    state.textContent = meeting.status.toUpperCase();
    actions.append(state);
    if (meeting.status === "accepted") {
      const link = document.createElement("a");
      link.href = meeting.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open Zoom ↗";
      actions.append(link);
    } else if (meeting.status === "pending") {
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.dataset.cancel = meeting.id;
      cancel.textContent = "Cancel request";
      actions.append(cancel);
    }
    card.append(info, actions);
    list.append(card);
  });
  document.getElementById("meeting-empty").hidden = meetings.length > 0;
  document.getElementById("request-count").textContent = `${meetings.length} ${meetings.length === 1 ? "REQUEST" : "REQUESTS"}`;
}
form.addEventListener("submit", event => {
  event.preventDefault();
  refreshMinimum();
  if (!form.reportValidity()) return;
  if (new Date(startField.value).getTime() <= Date.now()) {
    feedback.textContent = "Choose a future date and time.";
    startField.focus();
    return;
  }
  const link = form.elements.link.value.trim();
  try {
    const url = new URL(link);
    if (url.protocol !== "https:" || !/(^|\.)zoom\.(us|com)$/.test(url.hostname)) throw new Error();
  } catch {
    feedback.textContent = "Enter a valid HTTPS Zoom meeting link.";
    form.elements.link.focus();
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  if (!window.LiftCoachMeetings.create(data)) {
    feedback.textContent = "Could not save the request on this device.";
    return;
  }
  form.reset();
  refreshMinimum();
  feedback.textContent = "Meeting request sent to Alexander. Waiting for his response.";
  renderMeetings();
});
document.getElementById("meeting-list").addEventListener("click", event => {
  const button = event.target.closest("[data-cancel]");
  if (button && window.LiftCoachMeetings.setStatus(button.dataset.cancel, "cancelled")) renderMeetings();
});
window.addEventListener("storage", event => { if (event.key === window.LiftCoachMeetings.key) renderMeetings(); });
refreshMinimum();
renderMeetings();
