"use strict";

(() => {
  const access = window.LiftClientAccess;
  const root = document.getElementById("plan-content");
  if (!access || !root) return;

  const plans = [
    { id: "free", name: "Free Plan", price: "$0", description: "A simple starting point for tracking and general guidance.", features: ["Activity and basic progress tracking", "Manual workout and nutrition logging", "General workout and food guidance"] },
    { id: "ai", name: "AI Plan", price: "$19.99", description: "Personalized guidance that adapts to your life.", features: ["Everything in Free Plan", "AI workout and nutrition planning", "Schedule and progress aware adjustments"] },
    { id: "premium", name: "Premium", price: "$39.99", description: "AI planning with professional support from real people.", features: ["Everything in AI Plan", "Coach and Nutritionist review and support", "Professional messages and meetings"] }
  ];
  const tier = { free: 0, ai: 1, premium: 2 };
  let selected = null;

  const current = document.createElement("section");
  current.className = "tier-card wide plan-current";
  current.innerHTML = '<span class="tier-kicker">CURRENT PLAN</span><h2></h2><p class="plan-current-description"></p><p class="plan-status">Status: Active preview · Billing: Not connected</p>';
  current.querySelector("h2").textContent = access.labels[access.plan];
  current.querySelector(".plan-current-description").textContent = ({
    free: "Track activity and progress with basic workout and nutrition guidance.",
    ai: "Use personalized AI workout and nutrition guidance shaped by your lifestyle profile.",
    premium: "Use personalized AI guidance with Coach and Nutritionist support."
  })[access.plan];
  root.append(current);

  const grid = document.createElement("div");
  grid.className = "plan-options";
  grid.setAttribute("aria-label", "Compare LIFT plans");
  root.append(grid);

  const choice = document.createElement("div");
  choice.className = "plan-choice";
  choice.hidden = true;
  choice.innerHTML = '<p class="tier-kicker">SELECTED PLAN</p><strong class="plan-choice-name"></strong><p>Confirm this change to update your local preview membership. No payment is taken.</p><div class="tier-actions"><button type="button" class="primary plan-confirm">Confirm plan change ↗</button><button type="button" class="plan-cancel">Cancel</button></div>';
  root.append(choice);

  const render = () => {
    grid.replaceChildren();
    plans.forEach(plan => {
      const isCurrent = plan.id === access.plan;
      const isUpgrade = tier[plan.id] > tier[access.plan];
      const isSelected = selected === plan.id;
      const card = document.createElement("article");
      card.className = `tier-card plan-option${isCurrent ? " is-current" : ""}${isSelected ? " is-selected" : ""}`;
      const head = document.createElement("div");
      head.className = "plan-option-head";
      const status = document.createElement("span");
      status.className = "plan-option-status";
      status.textContent = isSelected ? "SELECTED" : isCurrent ? "CURRENT PLAN" : isUpgrade ? "UPGRADE" : "AVAILABLE";
      head.append(status);
      const title = document.createElement("h2");
      title.textContent = plan.name;
      const price = document.createElement("p");
      price.className = "plan-option-price";
      price.innerHTML = `<strong>${plan.price}</strong><small> / month</small>`;
      const description = document.createElement("p");
      description.textContent = plan.description;
      const list = document.createElement("ul");
      list.className = "plan-option-features";
      plan.features.forEach(feature => {
        const item = document.createElement("li");
        item.textContent = feature;
        list.append(item);
      });
      card.append(head, title, price, description, list);
      if (isUpgrade) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tier-action primary plan-option-action";
        button.textContent = isSelected ? "Selected ✓" : `Select ${plan.name} ↗`;
        button.setAttribute("aria-pressed", String(isSelected));
        button.addEventListener("click", () => {
          selected = plan.id;
          choice.hidden = false;
          choice.querySelector(".plan-choice-name").textContent = `${plan.name} · ${plan.price} / month`;
          render();
          choice.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        });
        card.append(button);
      } else {
        const note = document.createElement("span");
        note.className = "plan-option-note";
        note.textContent = isCurrent ? "Your active plan" : "Lower tier · plan changes coming with billing";
        card.append(note);
      }
      grid.append(card);
    });
  };

  choice.querySelector(".plan-confirm").addEventListener("click", () => {
    if (selected) access.setPlan(selected);
  });
  choice.querySelector(".plan-cancel").addEventListener("click", () => {
    selected = null;
    choice.hidden = true;
    render();
  });
  render();
  access.finishRender();
})();
