"use strict";

function renderDetails() {
  const plan = window.LiftCoachPlan.read();
  document.getElementById("goal").textContent = plan.goal;
  document.getElementById("days").textContent = String(plan.days);
  document.getElementById("minutes").textContent = String(plan.minutes);
  document.getElementById("location").textContent = plan.location;
  document.getElementById("split").textContent = plan.split;
  document.getElementById("coach-notes").textContent = plan.coachNotes || "No coach notes added yet.";
  const approved = plan.status === "approved";
  const status = document.getElementById("plan-status");
  status.textContent = approved ? "Approved" : "Needs review";
  status.classList.toggle("pending", !approved);
  document.getElementById("plan-stage").textContent = approved ? "Approved for client" : "Coach review in progress";
}
renderDetails();
window.addEventListener("storage", renderDetails);
