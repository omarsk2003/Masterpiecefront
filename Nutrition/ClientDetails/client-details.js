"use strict";

function renderDetails() {
  const plan = window.LiftNutritionPlan.readPublished();
  const targets = document.querySelectorAll(".target-row strong");
  [plan.calories.toLocaleString("en"), plan.protein + " g", plan.carbs + " g", plan.fats + " g"].forEach((value, index) => { targets[index].textContent = value; });
  document.querySelector(".profile-facts div:nth-child(3) dd").textContent = plan.calories.toLocaleString("en") + " kcal";
}
renderDetails();
window.addEventListener("storage", event => { if (event.key === "lift-alexander-nutrition-plan-v1") renderDetails(); });
