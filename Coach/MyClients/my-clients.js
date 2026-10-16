"use strict";

const clients = [{
  name: "Alexander Drake",
  initials: "AD",
  goal: "Strength & muscle building",
  level: "Intermediate",
  schedule: "4 training days · 45 min sessions",
  membership: "Premium",
  planStatus: "approved",
  planLabel: "Plan approved",
  activity: "Training plan active"
}];

const list = document.getElementById("client-list");
const search = document.getElementById("client-search");
const filters = [...document.querySelectorAll("[data-filter]")];
const empty = document.getElementById("list-empty");
let activeFilter = "all";

function renderClients() {
  const plan = window.LiftCoachPlan.read();
  clients[0].planStatus = plan.status === "approved" ? "approved" : "review";
  clients[0].planLabel = plan.status === "approved" ? "Plan approved" : "Needs review";
  clients[0].activity = plan.status === "approved" ? "Training plan active" : "Revision awaiting approval";
  document.querySelector('[data-filter="approved"] span').textContent = clients[0].planStatus === "approved" ? "1" : "0";
  document.querySelector('[data-filter="review"] span').textContent = clients[0].planStatus === "review" ? "1" : "0";
  const query = search.value.trim().toLowerCase();
  const visible = clients.filter(client =>
    (activeFilter === "all" || client.planStatus === activeFilter) &&
    [client.name, client.goal, client.level].some(value => value.toLowerCase().includes(query))
  );
  list.replaceChildren();
  visible.forEach(client => {
    const card = document.createElement("article");
    card.className = "roster-card";
    card.innerHTML = `<div class="roster-primary"><span class="roster-avatar" aria-hidden="true">${client.initials}</span><div><span class="roster-member">${client.membership.toUpperCase()} MEMBER</span><h3>${client.name}</h3><p>${client.goal}</p></div></div><div class="roster-info"><div><span>FITNESS LEVEL</span><strong>${client.level}</strong></div><div><span>TRAINING SCHEDULE</span><strong>${client.schedule}</strong></div></div><div class="roster-state"><span class="plan-status"><i aria-hidden="true"></i> ${client.planLabel}</span><small>${client.activity}</small></div><div class="roster-actions"><a class="details-link" href="../ClientDetails/client-details.html">View client ↗</a><button class="plan-link" type="button" data-open-plan>Review plan ↗</button><a class="plan-link" href="../Messages/messages.html">Message ↗</a><a class="plan-link" href="../Meetings/meetings.html">Meeting ↗</a></div>`;
    list.append(card);
  });
  empty.hidden = visible.length !== 0;
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
window.addEventListener("storage", renderClients);

const planDialog = document.getElementById("plan-dialog");
const planForm = document.getElementById("plan-form");
const planFeedback = document.getElementById("plan-feedback");
function openPlanDialog() {
  const plan = window.LiftCoachPlan.read();
  for (const name of ["goal", "location", "days", "minutes", "split", "dayExercises", "coachNotes"]) planForm.elements[name].value = plan[name];
  document.getElementById("plan-dialog-status").textContent = plan.status === "approved" ? "APPROVED" : "NEEDS REVIEW";
  planFeedback.textContent = "";
  planDialog.showModal();
}
function savePlan(status) {
  if (!planForm.reportValidity()) return;
  const lines = planForm.elements.dayExercises.value.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.every(line => /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*\|\s*[^|]+\s*\|\s*[^|]+$/i.test(line))) {
    planFeedback.textContent = "Use one line per exercise: Mon | Exercise name | Sets and reps.";
    return;
  }
  if (!window.LiftCoachPlan.save(Object.fromEntries(new FormData(planForm)), status)) {
    planFeedback.textContent = "Could not save on this device. Check browser storage.";
    return;
  }
  renderClients();
  document.getElementById("plan-dialog-status").textContent = status === "approved" ? "APPROVED" : "NEEDS REVIEW";
  planFeedback.textContent = status === "approved" ? "Plan approved. Alexander's workout page now shows this version." : "Revision saved for review. Alexander keeps the last approved plan until you approve it.";
}
document.addEventListener("click", event => { if (event.target.closest("[data-open-plan]")) openPlanDialog(); });
document.getElementById("close-plan-dialog").addEventListener("click", () => planDialog.close());
document.getElementById("save-plan-draft").addEventListener("click", () => savePlan("review"));
planForm.addEventListener("submit", event => { event.preventDefault(); savePlan("approved"); });
if (new URLSearchParams(location.search).has("review")) {
  openPlanDialog();
  history.replaceState(null, "", location.pathname + location.hash);
}
