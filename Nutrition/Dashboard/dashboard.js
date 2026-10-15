"use strict";

// One assigned Premium client and an already approved nutrition plan are the
// current static preview state, matching Alexander's client nutrition page.
function renderNutritionDashboard() {
  const plan = window.LiftNutritionPlan.read();
  const approved = plan.status === "approved";
  const metrics = document.querySelectorAll(".metrics article");
  metrics[1].querySelector("strong").textContent = approved ? "01" : "00";
  metrics[1].querySelector("small").textContent = approved ? "Alexander's plan is active" : "A revision is awaiting approval";
  metrics[2].querySelector("strong").textContent = approved ? "00" : "01";
  metrics[2].querySelector("small").textContent = approved ? "All caught up for now" : "Alexander's update needs approval";
  document.getElementById("nutrition-review-summary").textContent = approved ? "Nutrition plan approved" : "Alexander’s revision needs review";
  document.querySelector(".approved-pill").lastChild.textContent = approved ? " Plan approved" : " Needs review";
  const published = window.LiftNutritionPlan.readPublished();
  document.querySelector(".energy strong").textContent = published.calories.toLocaleString("en");
  [published.protein, published.carbs, published.fats].forEach((value, index) => {
    document.querySelectorAll(".macro-list strong")[index].textContent = value + " g";
  });
}
function renderNutritionActivity() {
  const lastRead = Date.parse(localStorage.getItem("lift-nutrition-client-chat-read-v1") || "") || 0;
  const messages = window.LiftClientNutritionChat.read().filter(item => item.from === "client" && Date.parse(item.time) > lastRead);
  document.getElementById("nutrition-message-count").textContent = String(messages.length).padStart(2, "0");
  document.getElementById("nutrition-message-summary").textContent = messages.length ? `${messages.length} unread client ${messages.length === 1 ? "message" : "messages"}` : "No unread messages";
}
function renderNutritionName() {
  let name = "Maya Haddad";
  try { name = JSON.parse(localStorage.getItem("lift-nutrition-profile-v1") || "{}").name || name; }
  catch { /* Keep the sample name. */ }
  document.querySelector(".page-heading h1 em").textContent = name.split(/\s+/)[0] + ".";
}
renderNutritionDashboard();
renderNutritionName();
renderNutritionActivity();
document.addEventListener("lift:client-nutrition-chat-change", renderNutritionActivity);
window.addEventListener("storage", event => {
  if (event.key === window.LiftClientNutritionChat.key) renderNutritionActivity();
  if (event.key === "lift-alexander-nutrition-plan-v1") renderNutritionDashboard();
  if (event.key === "lift-nutrition-profile-v1") renderNutritionName();
});
