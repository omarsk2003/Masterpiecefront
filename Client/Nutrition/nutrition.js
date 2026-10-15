"use strict";
if (window.LiftClientAccess?.isPremium() !== false) {


const approvedPlan = window.LiftNutritionPlan.readPublished();
document.querySelector(".calorie-row strong").innerHTML = `${approvedPlan.calories.toLocaleString("en")} <small>kcal</small>`;
const macroValues = document.querySelectorAll(".macro-grid .macro strong");
[approvedPlan.protein, approvedPlan.carbs, approvedPlan.fats].forEach((value, index) => { macroValues[index].textContent = `${value} g`; });
if (approvedPlan.updatedAt) {
  document.querySelector(".meal-section").hidden = true;
  document.querySelector(".calorie-ring").hidden = true;
  document.querySelector(".calorie-row p").textContent = "Specialist-approved daily target";
  const menu = document.createElement("section");
  menu.className = "approved-menu";
  menu.innerHTML = '<p class="eyebrow">APPROVED BY MAYA</p><h2>Your updated meal outline</h2><div class="approved-menu-lines"></div><p class="approved-menu-note"></p>';
  approvedPlan.meals.split(/\n+/).filter(Boolean).forEach(line => {
    const item = document.createElement("p");
    item.textContent = line.trim();
    menu.querySelector(".approved-menu-lines").append(item);
  });
  menu.querySelector(".approved-menu-note").textContent = approvedPlan.notes;
  document.querySelector(".overview-card").after(menu);
}

const meals = [...document.querySelectorAll(".meal-card")];
const progress = document.getElementById("meal-progress");
const ring = document.querySelector(".calorie-ring");
const ringValue = document.getElementById("ring-value");

function updateProgress() {
  const completed = meals.filter((meal) => meal.classList.contains("logged")).length;
  const loggedCalories = meals.filter((meal) => meal.classList.contains("logged")).reduce((total, meal) => total + Number(meal.dataset.calories), 0);
  const percentage = Math.round(loggedCalories / approvedPlan.calories * 100);
  progress.textContent = `${completed} OF ${meals.length} LOGGED`;
  ringValue.textContent = `${percentage}%`;
  ring.style.setProperty("--progress", `${percentage}%`);
}

meals.forEach((meal) => {
  const button = meal.querySelector(".log-button");
  button.addEventListener("click", () => {
    const logged = meal.classList.toggle("logged");
    button.setAttribute("aria-pressed", String(logged));
    button.textContent = logged ? "✓ LOGGED" : "LOG MEAL";
    const mealName = meal.querySelector(".meal-top > span").textContent.trim().split(" ")[0].toLowerCase();
    button.setAttribute("aria-label", `${logged ? "Remove" : "Log"} ${mealName}`);
    updateProgress();
  });
});

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
