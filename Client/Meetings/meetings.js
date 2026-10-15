"use strict";
if (window.LiftClientAccess?.isPremium() !== false) {


function renderMeetings(group) {
  const meetings = group.service.read();
  const list = document.getElementById(`${group.prefix}-list`);
  list.replaceChildren();
  meetings.forEach(meeting => {
    const card = document.createElement("article");
    card.className = "meeting-card";
    const person = document.createElement("div");
    person.className = "person";
    const avatar = document.createElement("span");
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = group.initials;
    const personText = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = group.name;
    const context = document.createElement("small");
    context.textContent = group.context;
    personText.append(name, context);
    person.append(avatar, personText);
    const content = document.createElement("div");
    content.className = "meeting-content";
    const topic = document.createElement("h3");
    topic.textContent = meeting.topic;
    const date = document.createElement("p");
    date.textContent = `${new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(meeting.start))} · ${meeting.minutes} min`;
    content.append(topic, date);
    const actions = document.createElement("div");
    actions.className = "meeting-actions";
    const state = document.createElement("span");
    state.className = `state ${meeting.status}`;
    state.textContent = meeting.status.toUpperCase();
    actions.append(state);
    if (meeting.status === "pending") {
      for (const [label, decision] of [["Accept", "accepted"], ["Decline", "declined"]]) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.id = meeting.id;
        button.dataset.decision = decision;
        button.textContent = label;
        actions.append(button);
      }
    } else if (meeting.status === "accepted") {
      const link = document.createElement("a");
      link.href = meeting.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Join Zoom ↗";
      actions.append(link);
    }
    card.append(person, content, actions);
    list.append(card);
  });
  document.getElementById(`${group.prefix}-count`).textContent = `${meetings.length} ${meetings.length === 1 ? "REQUEST" : "REQUESTS"}`;
  document.getElementById(`${group.prefix}-empty`).hidden = meetings.length > 0;
}
const meetingGroups = [
  { service: window.LiftCoachMeetings, prefix: "meeting", initials: "SC", name: "Coach Sarah Chen", context: "Training conversation" }
];
for (const group of meetingGroups) {
  document.getElementById(`${group.prefix}-list`).addEventListener("click", event => {
    const button = event.target.closest("[data-decision]");
    if (button && group.service.setStatus(button.dataset.id, button.dataset.decision)) renderMeetings(group);
  });
  window.addEventListener("storage", event => { if (event.key === group.service.key) renderMeetings(group); });
  renderMeetings(group);
}
}
