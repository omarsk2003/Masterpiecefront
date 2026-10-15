"use strict";

const form = document.getElementById("video-form");
const fileInput = document.getElementById("video-file");
const preview = document.getElementById("upload-preview");
const previewBox = document.getElementById("preview-box");
const status = document.getElementById("form-status");
let previewUrl = null;
let cardUrls = [];
function clearPreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null;
  preview.removeAttribute("src");
  preview.load();
  previewBox.hidden = true;
}
fileInput.addEventListener("change", () => {
  clearPreview();
  const file = fileInput.files[0];
  if (!file) return;
  if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type) || file.size > 80 * 1024 * 1024) {
    status.textContent = "Choose an MP4, WebM or Ogg video that is 80 MB or smaller.";
    fileInput.value = "";
    return;
  }
  status.textContent = "";
  previewUrl = URL.createObjectURL(file);
  preview.src = previewUrl;
  document.getElementById("preview-name").textContent = file.name;
  previewBox.hidden = false;
});
document.getElementById("exercise-select").addEventListener("change", event => {
  const custom = event.target.value === "Other";
  const label = document.getElementById("custom-exercise-label");
  label.hidden = !custom;
  label.querySelector("input").required = custom;
});
async function renderLibrary() {
  cardUrls.forEach(url => URL.revokeObjectURL(url));
  cardUrls = [];
  const list = document.getElementById("video-list");
  list.replaceChildren();
  try {
    const guides = (await window.LiftExerciseLibrary.all()).filter(item => item.clientId === "alexander-drake");
    guides.forEach(guide => {
      const article = document.createElement("article");
      article.className = "video-card";
      const video = document.createElement("video");
      const url = URL.createObjectURL(guide.file);
      cardUrls.push(url);
      video.src = url;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      const content = document.createElement("div");
      content.className = "video-content";
      const kicker = document.createElement("span");
      kicker.textContent = "COACH DEMONSTRATION";
      const title = document.createElement("h3");
      title.textContent = guide.exercise;
      const steps = document.createElement("p");
      steps.textContent = guide.steps;
      const cues = document.createElement("p");
      cues.className = "coach-tip";
      cues.textContent = "Focus: " + guide.cues;
      const mistakes = document.createElement("p");
      mistakes.className = "coach-tip";
      mistakes.textContent = "Avoid: " + guide.mistakes;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.dataset.remove = guide.id;
      remove.textContent = "Remove guide";
      content.append(kicker, title, steps, cues, mistakes, remove);
      article.append(video, content);
      list.append(article);
    });
    document.getElementById("library-empty").hidden = guides.length > 0;
    document.getElementById("video-count").textContent = `${guides.length} ${guides.length === 1 ? "VIDEO" : "VIDEOS"}`;
  } catch {
    status.textContent = "Local video storage is unavailable. Open LIFT on a local server in this browser.";
  }
}
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const file = fileInput.files[0];
  if (!file) return;
  const exercise = form.elements.exercise.value === "Other" ? form.elements.customExercise.value : form.elements.exercise.value;
  const save = document.getElementById("save-video");
  save.disabled = true;
  status.textContent = "Saving the video on this device…";
  try {
    await window.LiftExerciseLibrary.add({
      file,
      exercise,
      steps: form.elements.steps.value,
      cues: form.elements.cues.value,
      mistakes: form.elements.mistakes.value
    });
    form.reset();
    document.getElementById("custom-exercise-label").hidden = true;
    document.getElementById("custom-exercise-label").querySelector("input").required = false;
    clearPreview();
    await renderLibrary();
    status.textContent = "Video guide saved. Alexander can watch it from his Workout page on this device.";
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Could not save the video on this device.";
  } finally {
    save.disabled = false;
  }
});
document.getElementById("video-list").addEventListener("click", async event => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  button.disabled = true;
  try {
    await window.LiftExerciseLibrary.remove(button.dataset.remove);
    await renderLibrary();
    status.textContent = "Video guide removed.";
  } catch {
    button.disabled = false;
    status.textContent = "Could not remove the guide.";
  }
});
window.addEventListener("pagehide", () => { clearPreview(); cardUrls.forEach(url => URL.revokeObjectURL(url)); });
renderLibrary();
