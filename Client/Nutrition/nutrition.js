"use strict";
if (window.LiftClientAccess?.isPremium() !== false) {

const clientAccess = window.LiftClientAccess;
const approvedPlan = window.LiftNutritionPlan.readPublished();
const mealDate = clientAccess.todayKey();
const mealKey = index => `premium-meal:${mealDate}:${approvedPlan.updatedAt || "initial"}:${index}`;
const isMealLogged = index => Boolean(clientAccess.getActivity().meals?.[mealKey(index)]);

document.querySelector(".calorie-row strong").innerHTML = `${approvedPlan.calories.toLocaleString("en")} <small>kcal</small>`;
const macroValues = document.querySelectorAll(".macro-grid .macro strong");
[approvedPlan.protein, approvedPlan.carbs, approvedPlan.fats].forEach((value, index) => { macroValues[index].textContent = `${value} g`; });
if (approvedPlan.updatedAt) {
  document.querySelector(".meal-section").hidden = true;
  document.querySelector(".calorie-ring").hidden = true;
  document.querySelector(".calorie-row p").textContent = "Specialist-approved daily target";
  const menu = document.createElement("section");
  menu.className = "approved-menu";
  menu.innerHTML = '<p class="eyebrow">APPROVED BY MAYA</p><div class="approved-menu-heading"><h2>Your updated meal outline</h2><span id="approved-meal-progress" aria-live="polite"></span></div><p class="approved-menu-help">Log each meal after you eat it. Your check-ins are saved in this browser and appear in Progress.</p><div class="approved-menu-lines"></div><p class="approved-menu-note"></p>';
  approvedPlan.meals.split(/\n+/).filter(Boolean).forEach((line, index) => {
    const row = document.createElement("div");
    row.className = "approved-menu-line";
    const item = document.createElement("p");
    item.textContent = line.trim();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "log-button";
    button.dataset.mealIndex = index;
    row.append(item, button);
    menu.querySelector(".approved-menu-lines").append(row);
  });
  menu.querySelector(".approved-menu-note").textContent = approvedPlan.notes;
  document.querySelector(".overview-card").after(menu);
}

const meals = [...document.querySelectorAll(".meal-card")];
const progress = document.getElementById(approvedPlan.updatedAt ? "approved-meal-progress" : "meal-progress");
const ring = document.querySelector(".calorie-ring");
const ringValue = document.getElementById("ring-value");
const logButtons = [...document.querySelectorAll(approvedPlan.updatedAt ? ".approved-menu-line .log-button" : ".meal-card .log-button")];

function updateProgress() {
  const completed = logButtons.filter((_, index) => isMealLogged(index)).length;
  progress.textContent = `${completed} OF ${logButtons.length} LOGGED`;
  if (!approvedPlan.updatedAt) {
    const loggedCalories = meals.reduce((total, meal, index) => total + (isMealLogged(index) ? Number(meal.dataset.calories) : 0), 0);
    const percentage = Math.round(loggedCalories / approvedPlan.calories * 100);
    ringValue.textContent = `${percentage}%`;
    ring.style.setProperty("--progress", `${percentage}%`);
  }
}

logButtons.forEach((button, index) => {
  const row = button.closest(".meal-card, .approved-menu-line");
  const mealName = row.querySelector("h3, p")?.textContent.trim() || `meal ${index + 1}`;
  const sync = () => {
    const logged = isMealLogged(index);
    row.classList.toggle("logged", logged);
    button.setAttribute("aria-pressed", String(logged));
    button.textContent = logged ? "✓ LOGGED" : "LOG MEAL";
    button.setAttribute("aria-label", `${logged ? "Remove" : "Log"} ${mealName}`);
  };
  sync();
  button.addEventListener("click", () => {
    const logging = !isMealLogged(index);
    if (!clientAccess.setDone("meals", mealKey(index), logging)) return window.LiftNotice.error("Could not update this meal on this device.");
    sync();
    updateProgress();
    window.LiftNotice.success(`${mealName} ${logging ? "logged" : "removed from today's log"}.`);
  });
});
updateProgress();

let mealVideoUrls = [];
const exampleMeals = new Map([
  ["greek yogurt & oat bowl", "ai_p-JJs_yw"],
  ["chicken & rice power plate", "9D0SS-BdO3s"],
  ["apple & peanut butter", "U_vrXvbviT0"],
  ["salmon, potatoes & greens", "N5_TEGENBCI"]
]);
async function renderMealVideos() {
  if (!window.LiftMealVideos) return;
  let videos;
  try { videos = await window.LiftMealVideos.all(); } catch { videos = []; }
  mealVideoUrls.forEach(url => URL.revokeObjectURL(url));
  mealVideoUrls = [];
  logButtons.forEach((button, index) => {
    const row = button.closest(".meal-card, .approved-menu-line");
    const rawName = approvedPlan.updatedAt
      ? row.querySelector("p").textContent
      : row.querySelector("h3").textContent;
    const name = rawName.replace(/^[^:]+:\s*/, "").trim();
    const exampleId = exampleMeals.get(name.toLowerCase());
    const guide = videos.find(item => item.meal === name.toLowerCase());
    let area = row.querySelector(".meal-prep-video");
    if (!area) {
      area = document.createElement("div");
      area.className = "meal-prep-video";
      row.append(area);
    }
    area.replaceChildren();
    const title = document.createElement("strong");
    title.textContent = "HOW TO PREPARE";
    area.append(title);
    if (guide) {
      const player = document.createElement("video");
      const url = URL.createObjectURL(guide.file);
      mealVideoUrls.push(url);
      player.src = url;
      player.controls = true;
      player.playsInline = true;
      player.preload = "metadata";
      player.setAttribute("aria-label", name + " preparation by Maya");
      const steps = document.createElement("p");
      steps.textContent = "Maya's preparation steps: " + guide.instructions;
      area.append(player, steps);
    } else if (exampleId) {
      const frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + exampleId;
      frame.title = name + " example preparation";
      frame.loading = "lazy";
      frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      const note = document.createElement("p");
      note.textContent = "Example recipe · Maya's video will replace it after upload";
      const link = document.createElement("a");
      link.href = "https://www.youtube.com/watch?v=" + exampleId;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Watch on YouTube ↗";
      area.append(frame, note, link);
    } else {
      const pending = document.createElement("p");
      pending.textContent = "Maya's preparation video awaiting upload";
      area.append(pending);
    }
  });
}
window.addEventListener("focus", renderMealVideos);
window.addEventListener("pagehide", () => mealVideoUrls.forEach(url => URL.revokeObjectURL(url)));
renderMealVideos();

function renderSpecialistGuidance() {
  if (!window.LiftNutritionGuidance) return;
  const notes = window.LiftNutritionGuidance.read();
  document.querySelector(".specialist-guidance")?.remove();
  if (!notes.length) return;
  const section = document.createElement("section");
  section.className = "specialist-guidance";
  section.innerHTML = '<p class="eyebrow">FROM NUTRITIONIST MAYA</p><h2>Guidance for your day</h2><div class="guidance-items"></div>';
  notes.forEach(note => {
    const card = document.createElement("article");
    const topic = document.createElement("span");
    topic.textContent = note.topic.toUpperCase();
    const title = document.createElement("h3");
    title.textContent = note.title;
    const body = document.createElement("p");
    body.textContent = note.body;
    card.append(topic, title, body);
    section.querySelector(".guidance-items").append(card);
  });
  document.querySelector(".nutrition-main").append(section);
}
window.addEventListener("storage", event => { if (event.key === window.LiftNutritionGuidance.key) renderSpecialistGuidance(); });
renderSpecialistGuidance();
}
