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
      link.href = meeting.room ? `../../Shared/MeetingRoom/meeting.html?room=${encodeURIComponent(meeting.room)}` : meeting.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Join meeting ↗";
      actions.append(link);
      if (meeting.room) {
        const copy = document.createElement("button");
        copy.type = "button";
        copy.dataset.copyRoom = meeting.room;
        copy.textContent = "Copy meeting link";
        actions.append(copy);
      }
    } else if (meeting.status === "pending") {
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.dataset.cancel = meeting.id;
      cancel.textContent = "Cancel request";
      actions.append(cancel);
    }
    if (!meeting.demo) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.dataset.remove = meeting.id;
      remove.textContent = "Remove";
      actions.append(remove);
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
    window.LiftNotice.warning(feedback.textContent);
    startField.focus();
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  if (!window.LiftCoachMeetings.create(data)) {
    feedback.textContent = "Could not save the request on this device.";
    window.LiftNotice.error(feedback.textContent);
    return;
  }
  form.reset();
  refreshMinimum();
  feedback.textContent = "Meeting request sent to Alexander. Waiting for his response.";
  window.LiftNotice.success(feedback.textContent);
  renderMeetings();
});
document.getElementById("meeting-list").addEventListener("click", async event => {
  const button = event.target.closest("[data-cancel]");
  if (button) { if (!await window.LiftNotice.confirm("Cancel this meeting request?", { confirmText: "Cancel meeting" })) return; if (window.LiftCoachMeetings.setStatus(button.dataset.cancel, "cancelled")) { renderMeetings(); window.LiftNotice.success("Meeting request cancelled."); } else window.LiftNotice.error("Could not cancel the meeting."); }
  const remove = event.target.closest("[data-remove]");
  if (remove) { if (!await window.LiftNotice.confirm("Remove this meeting from the list?", { confirmText: "Remove meeting" })) return; if (window.LiftCoachMeetings.remove(remove.dataset.remove)) { renderMeetings(); window.LiftNotice.success("Meeting removed."); } else window.LiftNotice.error("Could not remove the meeting."); }
  const copy = event.target.closest("[data-copy-room]");
  if (copy) {
    const url = new URL(`../../Shared/MeetingRoom/meeting.html?room=${encodeURIComponent(copy.dataset.copyRoom)}`, location.href).href;
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(() => { feedback.textContent = "Meeting link copied."; }, () => { feedback.textContent = `Copy this meeting link: ${url}`; });
    else feedback.textContent = `Copy this meeting link: ${url}`;
  }
});
window.addEventListener("storage", event => { if (event.key === window.LiftCoachMeetings.key) renderMeetings(); });
refreshMinimum();
renderMeetings();
