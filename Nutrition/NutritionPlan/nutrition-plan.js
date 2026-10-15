"use strict";

const form = document.getElementById("plan-form");
const feedback = document.getElementById("form-feedback");
const state = document.getElementById("plan-state");
function renderPlan() {
  const plan = window.LiftNutritionPlan.read();
  for (const field of ["calories", "protein", "carbs", "fats", "meals", "notes"]) form.elements[field].value = plan[field];
  state.textContent = plan.status === "approved" ? "APPROVED" : "NEEDS REVIEW";
  state.classList.toggle("pending", plan.status !== "approved");
}
function save(status) {
  if (!form.reportValidity()) return;
  const input = Object.fromEntries(new FormData(form).entries());
  if (!window.LiftNutritionPlan.save(input, status)) {
    feedback.textContent = "Could not save the plan on this device.";
    return;
  }
  renderPlan();
  feedback.textContent = status === "approved"
    ? "Nutrition plan approved. Alexander can see the updated targets and meal outline."
    : "Revision saved for specialist review. Alexander keeps the last approved plan.";
}
document.getElementById("save-draft").addEventListener("click", () => save("review"));
form.addEventListener("submit", event => { event.preventDefault(); save("approved"); });
renderPlan();
