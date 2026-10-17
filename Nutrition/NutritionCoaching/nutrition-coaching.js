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
    window.LiftNotice.error(status.textContent);
    return;
  }
  form.reset();
  status.textContent = "Guidance shared with Alexander's Nutrition page.";
  window.LiftNotice.success(status.textContent);
  renderGuidance();
});
document.getElementById("note-list").addEventListener("click", async event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  if (!await window.LiftNotice.confirm("Remove this nutrition guidance note?", { confirmText: "Remove note" })) return;
  if (window.LiftNutritionGuidance.remove(button.dataset.remove)) {
    status.textContent = "Guidance note removed.";
    window.LiftNotice.success(status.textContent);
    renderGuidance();
  } else window.LiftNotice.error("Could not remove the guidance note.");
});
renderGuidance();

const mealVideoForm = document.getElementById("meal-video-form");
const mealVideoStatus = document.getElementById("meal-video-status");
const mealNames = window.LiftNutritionPlan.readPublished().meals.split(/\r?\n/).map(line => line.replace(/^[^:]+:\s*/, "").trim()).filter(Boolean);
const mealSelect = document.getElementById("meal-video-select");
const exampleMealVideos = ["ai_p-JJs_yw", "9D0SS-BdO3s", "U_vrXvbviT0", "N5_TEGENBCI"];
let mealPreviewUrls = [];
mealNames.forEach(name => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  mealSelect.append(option);
});
async function renderMealVideos() {
  try {
    const videos = await window.LiftMealVideos.all();
    const list = document.getElementById("meal-video-list");
    mealPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    mealPreviewUrls = [];
    list.replaceChildren();
    mealNames.forEach((name, index) => {
      const card = document.createElement("article");
      card.className = "meal-video-card";
      const heading = document.createElement("h3");
      heading.textContent = name;
      const uploaded = videos.find(video => video.meal === name.toLowerCase());
      const label = document.createElement("p");
      label.textContent = uploaded ? "Your preparation video · shown to Alexander" : "Example recipe · upload your own video to replace it";
      card.append(heading, label);
      if (uploaded) {
        const player = document.createElement("video");
        const url = URL.createObjectURL(uploaded.file);
        mealPreviewUrls.push(url);
        player.src = url;
        player.controls = true;
        player.playsInline = true;
        player.preload = "metadata";
        player.setAttribute("aria-label", name + " preparation video");
        const steps = document.createElement("p");
        steps.textContent = uploaded.instructions;
        card.append(player, steps);
      } else if (index < exampleMealVideos.length) {
        const frame = document.createElement("iframe");
        frame.src = "https://www.youtube-nocookie.com/embed/" + exampleMealVideos[index];
        frame.title = name + " example preparation";
        frame.loading = "lazy";
        frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
        frame.allowFullscreen = true;
        const link = document.createElement("a");
        link.href = "https://www.youtube.com/watch?v=" + exampleMealVideos[index];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Watch on YouTube ↗";
        card.append(frame, link);
      }
      list.append(card);
    });
  } catch { mealVideoStatus.textContent = "Video storage is unavailable in this browser."; window.LiftNotice.error(mealVideoStatus.textContent); }
}
mealVideoForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!mealVideoForm.reportValidity()) return;
  const file = mealVideoForm.elements.video.files[0];
  try {
    await window.LiftMealVideos.save(mealVideoForm.elements.meal.value, file, mealVideoForm.elements.instructions.value);
    mealVideoForm.reset();
    mealVideoStatus.textContent = "Preparation video saved for Alexander on this device.";
    window.LiftNotice.success(mealVideoStatus.textContent);
    renderMealVideos();
  } catch (error) { mealVideoStatus.textContent = error.message || "Could not save the video."; window.LiftNotice.error(mealVideoStatus.textContent); }
});
renderMealVideos();
window.addEventListener("pagehide", () => mealPreviewUrls.forEach(url => URL.revokeObjectURL(url)));
