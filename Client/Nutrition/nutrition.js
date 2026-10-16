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
    clientAccess.setDone("meals", mealKey(index), !isMealLogged(index));
    sync();
    updateProgress();
  });
});
updateProgress();

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
