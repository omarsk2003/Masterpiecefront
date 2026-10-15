"use strict";
(() => {
  if (window.LiftClientAccess && !window.LiftClientAccess.isPremium()) {
    window.LiftClientTierUI?.renderDashboard();
    return;
  }
  const member = window.LiftClientAccess?.member || null;
  // Keep the existing Premium dashboard and specialist flow.
  if (member?.preview && member.plan === "premium") {
    document.querySelector("#welcome-title").firstChild.textContent = `Welcome back, ${member.name.split(" ")[0]}`;
  }
  const engineForm = document.getElementById("engine-form");
  const engineResponse = document.getElementById("engine-response");
  const sampleMatch = window.LiftMatching.matchPremium({
    plan: "premium", goal: "muscle", sport: null, experience: "intermediate",
    location: "gym", duration: 45, cooking: "home", conditions: ["none"]
  });
  if (sampleMatch.status === "matched") {
    const cards = document.querySelectorAll(".team-member");
    for (const [card, person] of [[cards[0], sampleMatch.coach], [cards[1], sampleMatch.nutritionist]]) {
      card.querySelector(".team-avatar").textContent = person.name.split(" ").map(part => part[0]).slice(0, 2).join("");
      card.querySelector("strong").textContent = person.name;
      card.querySelector("small").textContent = person.specialty;
    }
    document.getElementById("dashboard-match-reason").textContent = `Matched for your muscle-building goal: ${sampleMatch.coach.name} for training and ${sampleMatch.nutritionist.name} for nutrition.`;
  }
  engineForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!engineForm.reportValidity()) return;
    engineResponse.hidden = false;
    engineResponse.innerHTML = '<strong>Preview response:</strong> This is a fixed sample response, not live AI advice. Open the AI Assistant to discuss your plan context.';
  });
})();
