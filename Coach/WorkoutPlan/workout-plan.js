"use strict";

const form = document.getElementById("plan-form");
const status = document.getElementById("plan-status");
const feedback = document.getElementById("form-status");
function renderPlan() {
  const plan = window.LiftCoachPlan.read();
  for (const name of ["goal", "location", "days", "minutes", "split", "coachNotes"]) form.elements[name].value = plan[name];
  const approved = plan.status === "approved";
  status.textContent = approved ? "APPROVED" : "NEEDS REVIEW";
  status.classList.toggle("pending", !approved);
}
function save(statusValue) {
  if (!form.reportValidity()) return;
  const input = Object.fromEntries(new FormData(form).entries());
  if (!window.LiftCoachPlan.save(input, statusValue)) {
    feedback.textContent = "Could not save on this device. Check that browser storage is available.";
    return;
  }
  renderPlan();
  feedback.textContent = statusValue === "approved" ? "Plan approved. Alexander's workout page now shows the updated plan." : "Revision saved for coach review. Alexander keeps the last approved plan until you approve this update.";
}
document.getElementById("save-draft").addEventListener("click", () => save("review"));
form.addEventListener("submit", event => { event.preventDefault(); save("approved"); });
renderPlan();
