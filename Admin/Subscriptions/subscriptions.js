"use strict";
(() => {
  const pricing = window.LiftPricing;
  const notice = window.LiftNotice;
  const $ = selector => document.querySelector(selector);
  const plans = [
    { id: "free", name: "Free Plan", description: "Essential tracking and general guidance.", number: "01" },
    { id: "ai", name: "AI Plan", description: "Personalized training and nutrition guidance.", number: "02" },
    { id: "premium", name: "Premium", description: "AI guidance with coach and nutritionist support.", number: "03" }
  ];
  const money = value => `$${Number(value).toFixed(2)}`;
  const planLabel = promo => promo.plans?.length ? promo.plans.map(plan => plans.find(item => item.id === plan)?.name || plan).join(", ") : "All paid plans";
  const button = (label, action, value) => {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = label;
    element.dataset.action = action;
    element.dataset.value = value;
    element.className = action === "edit" ? "row-button edit-button" : "row-button";
    return element;
  };
  let selectedPlan = null;
  let selectedPromo = null;
  let promoMode = "view";

  function render() {
    const data = pricing.read();
    const prices = $("#prices-list");
    prices.replaceChildren();
    for (const plan of plans) {
      const card = document.createElement("article"); card.className = "price-card";
      const number = document.createElement("span"); number.className = "price-number"; number.textContent = `${plan.number} / MONTHLY PLAN`;
      const name = document.createElement("h3"); name.textContent = plan.name;
      const description = document.createElement("p"); description.textContent = plan.description;
      const amount = document.createElement("strong"); amount.className = "price-amount"; amount.textContent = money(data[plan.id]);
      const cadence = document.createElement("span"); cadence.className = "price-cadence"; cadence.textContent = "/ month";
      const value = document.createElement("div"); value.className = "price-value"; value.append(amount, cadence);
      const actions = document.createElement("div"); actions.className = "row-buttons";
      actions.append(button("Edit ↗", "edit", plan.id));
      card.append(number, name, description, value, actions); prices.append(card);
    }
    const list = $("#promo-list"); list.replaceChildren();
    if (!data.promos.length) {
      const empty = document.createElement("p"); empty.className = "promo-empty";
      empty.textContent = "No promo codes yet. Add a code to offer a discount on paid plans.";
      list.append(empty);
      return;
    }
    for (const promo of data.promos) {
      const row = document.createElement("article"); row.className = "promo-row";
      const identity = document.createElement("div"); identity.className = "promo-identity";
      const code = document.createElement("strong"); code.textContent = promo.code;
      const scope = document.createElement("small"); scope.textContent = planLabel(promo);
      identity.append(code, scope);
      const discount = document.createElement("strong"); discount.className = "promo-discount"; discount.textContent = `${promo.discount}% off`;
      const state = document.createElement("span"); state.className = `promo-state ${promo.active ? "active" : "inactive"}`; state.textContent = promo.active ? "Active" : "Inactive";
      const actions = document.createElement("div"); actions.className = "row-buttons";
      actions.append(button("View", "view-promo", promo.code), button("Edit ↗", "edit-promo", promo.code));
      row.append(identity, discount, state, actions); list.append(row);
    }
  }

  function openPrice(planId) {
    selectedPlan = plans.find(item => item.id === planId);
    if (!selectedPlan) return;
    const amount = pricing.read()[planId];
    $("#price-dialog-title").textContent = selectedPlan.name;
    $("#price-dialog-description").textContent = "Set the monthly price clients see for this plan.";
    $("#price-error").hidden = true;
    $("#price-form").elements.namedItem("amount").value = amount;
    $("#price-dialog").showModal();
    $("#price-form").elements.namedItem("amount").focus();
  }

  function openPromo(code, mode) {
    selectedPromo = code;
    promoMode = mode;
    const promo = pricing.read().promos.find(item => item.code === code);
    if (code && !promo) return;
    const form = $("#promo-form"); form.reset();
    $("#promo-error").hidden = true;
    $("#promo-dialog-title").textContent = mode === "add" ? "Add promo code" : code;
    $("#promo-dialog-description").textContent = mode === "view" ? "Current code details and availability." : mode === "edit" ? "Update the discount and plan availability." : "Create a discount clients can use when changing plans.";
    $("#promo-view").hidden = mode !== "view";
    $("#promo-view-actions").hidden = mode !== "view";
    $("#promo-fields").hidden = mode === "view";
    $("#save-promo").hidden = mode === "view";
    if (promo) {
      $("#toggle-promo").textContent = promo.active ? "Deactivate" : "Activate";
      $("#promo-view").replaceChildren();
      for (const [label, value] of [["Discount", `${promo.discount}% off`], ["Applies to", planLabel(promo)], ["Status", promo.active ? "Active" : "Inactive"]]) {
        const row = document.createElement("div");
        const key = document.createElement("span"); key.textContent = label;
        const detail = document.createElement("strong"); detail.textContent = value;
        row.append(key, detail); $("#promo-view").append(row);
      }
      form.elements.namedItem("code").value = promo.code;
      form.elements.namedItem("discount").value = promo.discount;
      form.elements.namedItem("plan").value = promo.plans?.[0] || "all";
    }
    form.elements.namedItem("code").readOnly = mode === "edit";
    $("#save-promo").textContent = mode === "add" ? "Add code ↗" : "Save changes ↗";
    $("#promo-dialog").showModal();
    if (mode === "add") form.elements.namedItem("code").focus();
  }

  $("#prices-list").addEventListener("click", event => {
    const control = event.target.closest("button[data-action]");
    if (control) openPrice(control.dataset.value);
  });
  $("#promo-list").addEventListener("click", event => {
    const control = event.target.closest("button[data-action]");
    if (control) openPromo(control.dataset.value, control.dataset.action === "edit-promo" ? "edit" : "view");
  });
  $("#add-promo").addEventListener("click", () => openPromo(null, "add"));
  $("#toggle-promo").addEventListener("click", () => {
    const next = pricing.read();
    const promo = next.promos.find(item => item.code === selectedPromo);
    if (!promo) return notice.error("This promo code is no longer available.");
    promo.active = !promo.active;
    if (!pricing.save(next)) return notice.error("Could not update this promo code.");
    $("#promo-dialog").close(); render();
    notice.success(`${promo.code} ${promo.active ? "activated" : "deactivated"}.`);
  });
  $("#remove-promo").addEventListener("click", async () => {
    if (!selectedPromo || !await notice.confirm(`Remove promo code ${selectedPromo}? Clients will no longer be able to use it.`, { confirmText: "Remove code" })) return;
    const next = pricing.read();
    next.promos = next.promos.filter(item => item.code !== selectedPromo);
    if (!pricing.save(next)) return notice.error("Could not remove this promo code.");
    $("#promo-dialog").close(); render();
    notice.success(`${selectedPromo} removed.`);
  });
  document.querySelectorAll("[data-close]").forEach(control => control.addEventListener("click", () => document.getElementById(control.dataset.close).close()));
  for (const dialog of document.querySelectorAll(".pricing-dialog")) dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

  $("#price-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!selectedPlan || !event.currentTarget.reportValidity()) return;
    const amount = Number(event.currentTarget.elements.namedItem("amount").value);
    if (!Number.isFinite(amount) || amount < 0) return;
    const next = pricing.read(); next[selectedPlan.id] = Math.round(amount * 100) / 100;
    if (!pricing.save(next)) return notice.error("Could not save this price on this device.");
    $("#price-dialog").close(); render();
    $("#price-status").textContent = `${selectedPlan.name} price saved.`;
    notice.success($("#price-status").textContent);
  });
  $("#promo-form").addEventListener("submit", event => {
    event.preventDefault();
    if (promoMode === "view" || !event.currentTarget.reportValidity()) return;
    const form = event.currentTarget;
    const code = form.elements.namedItem("code").value.trim().toUpperCase();
    const next = pricing.read();
    if (promoMode === "add" && next.promos.some(item => item.code === code)) {
      $("#promo-error").textContent = "That promo code already exists.";
      $("#promo-error").hidden = false;
      return notice.warning($("#promo-error").textContent);
    }
    const updated = { code, discount: Number(form.elements.namedItem("discount").value), plans: form.elements.namedItem("plan").value === "all" ? [] : [form.elements.namedItem("plan").value], active: true };
    if (promoMode === "edit") {
      const index = next.promos.findIndex(item => item.code === selectedPromo);
      if (index < 0) return notice.error("This promo code is no longer available.");
      updated.active = next.promos[index].active;
      next.promos[index] = updated;
    } else next.promos.push(updated);
    if (!pricing.save(next)) return notice.error("Could not save this promo code.");
    $("#promo-dialog").close(); render();
    $("#promo-status").textContent = `${code} ${promoMode === "add" ? "added" : "updated"}.`;
    notice.success($("#promo-status").textContent);
  });

  const toggle = $(".admin-menu-toggle");
  toggle.addEventListener("click", () => { const open = $("lift-admin-sidebar").classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); });
  window.addEventListener("storage", event => { if (event.key === pricing.key) render(); });
  render();
})();
