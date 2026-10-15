"use strict";

// Current frontend scenario: one Premium client assigned to Maya.
const clients = [{
  name: "Alexander Drake",
  initials: "AD",
  goal: "Strength & muscle building",
  subscription: "Premium",
  dailyTarget: "2,400 kcal / day",
  status: "approved",
  statusLabel: "Plan approved"
}];
const list = document.getElementById("client-list");
const search = document.getElementById("client-search");
const filters = [...document.querySelectorAll("[data-filter]")];
let activeFilter = "all";
function renderClients() {
  const plan = window.LiftNutritionPlan.read();
  const published = window.LiftNutritionPlan.readPublished();
  clients[0].status = plan.status === "approved" ? "approved" : "review";
  clients[0].statusLabel = plan.status === "approved" ? "Plan approved" : "Needs review";
  clients[0].dailyTarget = published.calories.toLocaleString("en") + " kcal / day";
  document.querySelector('[data-filter="approved"] span').textContent = clients[0].status === "approved" ? "1" : "0";
  document.querySelector('[data-filter="review"] span').textContent = clients[0].status === "review" ? "1" : "0";
  const query = search.value.trim().toLowerCase();
  const visible = clients.filter(client =>
    (activeFilter === "all" || client.status === activeFilter) &&
    [client.name, client.goal].some(value => value.toLowerCase().includes(query))
  );
  list.replaceChildren();
  visible.forEach(client => {
    const card = document.createElement("article");
    card.className = "roster-card";
    card.innerHTML = `<div class="client-primary"><span class="roster-avatar" aria-hidden="true">${client.initials}</span><div><span class="member-type">${client.subscription.toUpperCase()} MEMBER</span><h3>${client.name}</h3><p>${client.goal}</p></div></div><div class="client-facts"><div><span>DAILY TARGET</span><strong>${client.dailyTarget}</strong></div><div><span>LATEST PLAN ACTIVITY</span><strong>${client.status === "approved" ? "Plan active" : "Revision awaiting approval"}</strong></div></div><div class="client-status"><span><i aria-hidden="true"></i> ${client.statusLabel}</span><small>Nutrition plan ${client.status === "approved" ? "active" : "in review"}</small></div><div class="roster-actions"><a class="details-button" href="../ClientDetails/client-details.html">View client ↗</a><button class="plan-link" type="button" data-open-plan>Review plan ↗</button><a class="plan-link" href="../Messages/messages.html">Message ↗</a></div>`;
    list.append(card);
  });
  document.getElementById("empty-roster").hidden = visible.length > 0;
  document.getElementById("visible-count").textContent = String(visible.length);
}
search.addEventListener("input", renderClients);
filters.forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  filters.forEach(item => {
    const selected = item === button;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  renderClients();
}));
renderClients();
window.addEventListener("storage", event => { if (event.key === "lift-alexander-nutrition-plan-v1") renderClients(); });

const planDialog = document.getElementById("plan-dialog");
const planForm = document.getElementById("plan-form");
const planFeedback = document.getElementById("plan-feedback");
function openPlanDialog() {
  const plan = window.LiftNutritionPlan.read();
  for (const name of ["calories", "protein", "carbs", "fats", "meals", "notes"]) planForm.elements[name].value = plan[name];
  document.getElementById("plan-dialog-status").textContent = plan.status === "approved" ? "APPROVED" : "NEEDS REVIEW";
  planFeedback.textContent = "";
  planDialog.showModal();
}
function savePlan(status) {
  if (!planForm.reportValidity()) return;
  if (!window.LiftNutritionPlan.save(Object.fromEntries(new FormData(planForm)), status)) {
    planFeedback.textContent = "Could not save the plan on this device.";
    return;
  }
  renderClients();
  document.getElementById("plan-dialog-status").textContent = status === "approved" ? "APPROVED" : "NEEDS REVIEW";
  planFeedback.textContent = status === "approved" ? "Nutrition plan approved. Alexander can see the updated targets and meals." : "Revision saved for review. Alexander keeps the last approved plan until you approve it.";
}
document.addEventListener("click", event => { if (event.target.closest("[data-open-plan]")) openPlanDialog(); });
document.getElementById("close-plan-dialog").addEventListener("click", () => planDialog.close());
document.getElementById("save-plan-draft").addEventListener("click", () => savePlan("review"));
planForm.addEventListener("submit", event => { event.preventDefault(); savePlan("approved"); });
if (new URLSearchParams(location.search).has("review")) {
  openPlanDialog();
  history.replaceState(null, "", location.pathname + location.hash);
}

