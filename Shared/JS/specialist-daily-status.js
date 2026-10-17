"use strict";
(() => {
  const dialog = document.createElement("dialog");
  dialog.className = "specialist-progress-dialog daily-status-dialog";
  dialog.setAttribute("aria-labelledby", "daily-status-title");
  dialog.innerHTML = '<div class="progress-dialog-head"><div><p class="eyebrow">TODAY\'S CHECK-INS</p><h2 id="daily-status-title"></h2><p id="daily-status-date"></p></div><button type="button" class="progress-dialog-close" aria-label="Close daily status">×</button></div><div class="daily-status-total" role="status"><strong id="daily-status-count"></strong><span id="daily-status-summary"></span></div><ul class="daily-status-list" id="daily-status-list"></ul>';
  document.body.append(dialog);
  dialog.querySelector(".progress-dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  const today = () => {
    const date = new Date();
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  };
  const readActivity = email => {
    try { return JSON.parse(localStorage.getItem(`lift-client-activity-${email}`) || "null") || {}; }
    catch { return {}; }
  };
  const workoutItems = date => {
    const plan = window.LiftCoachPlan.readPublished();
    const scheduled = (plan.dayExercises || "").split(/\r?\n/).map(line => line.split("|").map(part => part.trim())).filter(parts => parts.length >= 2);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const start = new Date(date + "T12:00:00");
    for (let offset = 0; offset < 7; offset++) {
      const candidate = new Date(start); candidate.setDate(start.getDate() + offset);
      const day = days[candidate.getDay()];
      const matches = scheduled.filter(parts => parts[0].toLowerCase() === day.toLowerCase());
      if (matches.length) return matches.map((parts, index) => ({ name: parts[1], id: `premium-workout:${date}:exercise:${plan.updatedAt || "initial"}:${index}`, borrowedFrom: offset ? day : null }));
    }
    return [];
  };
  const mealItems = date => {
    const plan = window.LiftNutritionPlan.readPublished();
    return (plan.meals || "").split(/\n+/).map(line => line.trim()).filter(Boolean)
      .map((name, index) => ({ name, id: `premium-meal:${date}:${plan.updatedAt || "initial"}:${index}` }));
  };
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-open-daily-status]");
    if (!button) return;
    const date = today();
    const kind = button.dataset.dailyKind;
    const items = kind === "workouts" ? workoutItems(date) : mealItems(date);
    const activity = readActivity(button.dataset.clientEmail);
    const completed = items.filter(item => Boolean(activity[kind]?.[item.id])).length;
    const remaining = items.length - completed;
    dialog.querySelector("#daily-status-title").textContent = `${button.dataset.clientName || "Client"}'s ${kind === "workouts" ? "exercises" : "meals"}`;
    dialog.querySelector("#daily-status-date").textContent = new Date(date + "T12:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" });
    dialog.querySelector("#daily-status-count").textContent = `${completed} / ${items.length}`;
    const summary = !items.length ? (kind === "workouts" ? "No exercises in the approved plan." : "No meals in the approved plan.") : remaining === 0 ? `All ${kind === "workouts" ? "exercises completed" : "meals logged"} today.` : `${remaining} ${kind === "workouts" ? "exercise" : "meal"}${remaining === 1 ? "" : "s"} remaining today.`;
    dialog.querySelector("#daily-status-summary").textContent = items[0]?.borrowedFrom ? `${summary} Using the ${items[0].borrowedFrom} exercise set today.` : summary;
    const list = dialog.querySelector("#daily-status-list");
    list.replaceChildren();
    items.forEach(item => {
      const row = document.createElement("li");
      const name = document.createElement("span");
      const state = document.createElement("strong");
      const done = Boolean(activity[kind]?.[item.id]);
      name.textContent = item.name;
      state.textContent = done ? (kind === "workouts" ? "Completed" : "Logged") : "Remaining";
      state.className = done ? "daily-done" : "daily-remaining";
      row.append(name, state);
      list.append(row);
    });
    dialog.showModal();
  });
})();
