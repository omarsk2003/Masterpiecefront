"use strict";

(() => {
  const key = "lift-alexander-nutrition-plan-v1";
  const initial = {
    clientId: "alexander-drake",
    specialist: "Maya Haddad",
    status: "approved",
    calories: 2400,
    protein: 180,
    carbs: 220,
    fats: 65,
    meals: "Breakfast: Greek yogurt & oat bowl\nLunch: Chicken & rice power plate\nSnack: Apple & peanut butter\nDinner: Salmon, potatoes & greens",
    notes: "Discuss meal preferences and schedule changes before updating this plan.",
    updatedAt: null
  };
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      return saved.clientId === initial.clientId ? { ...initial, ...saved } : { ...initial };
    } catch { return { ...initial }; }
  }
  function readPublished() {
    const current = read();
    return current.published ? { ...initial, ...current.published, status: "approved" } : { ...initial };
  }
  function save(input, status) {
    const next = {
      ...read(),
      calories: Math.min(10000, Math.max(500, Number(input.calories) || initial.calories)),
      protein: Math.min(1000, Math.max(0, Number(input.protein) || 0)),
      carbs: Math.min(1000, Math.max(0, Number(input.carbs) || 0)),
      fats: Math.min(1000, Math.max(0, Number(input.fats) || 0)),
      meals: String(input.meals || "").trim().slice(0, 1200),
      notes: String(input.notes || "").trim().slice(0, 600),
      status,
      updatedAt: new Date().toISOString()
    };
    if (status === "approved") {
      const { published, ...snapshot } = next;
      next.published = snapshot;
    }
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { return false; }
    document.dispatchEvent(new Event("lift:nutrition-plan-change"));
    return true;
  }
  window.LiftNutritionPlan = { read, readPublished, save };
})();
