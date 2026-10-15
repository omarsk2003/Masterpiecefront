"use strict";

const form = document.getElementById("guidance-form");
const status = document.getElementById("form-status");
function renderGuidance() {
  const notes = window.LiftNutritionGuidance.read();
  const list = document.getElementById("note-list");
  list.replaceChildren();
  notes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";
    const topic = document.createElement("span");
    topic.textContent = note.topic.toUpperCase();
    const title = document.createElement("h3");
    title.textContent = note.title;
    const body = document.createElement("p");
    body.textContent = note.body;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.dataset.remove = note.id;
    remove.textContent = "Remove note";
    card.append(topic, title, body, remove);
    list.append(card);
  });
  document.getElementById("note-empty").hidden = notes.length > 0;
  document.getElementById("note-count").textContent = `${notes.length} ${notes.length === 1 ? "NOTE" : "NOTES"}`;
}
form.addEventListener("submit", event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const input = Object.fromEntries(new FormData(form).entries());
  if (!window.LiftNutritionGuidance.add(input)) {
    status.textContent = "Could not save the note on this device.";
    return;
  }
  form.reset();
  status.textContent = "Guidance shared with Alexander's Nutrition page.";
  renderGuidance();
});
document.getElementById("note-list").addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  if (window.LiftNutritionGuidance.remove(button.dataset.remove)) {
    status.textContent = "Guidance note removed.";
    renderGuidance();
  }
});
renderGuidance();
