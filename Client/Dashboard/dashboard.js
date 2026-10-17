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

})();
