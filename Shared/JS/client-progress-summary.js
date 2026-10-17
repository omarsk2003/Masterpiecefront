"use strict";
(() => {
  const main = document.querySelector(".detail-main");
  if (!main) return;
  const section = document.createElement("section");
  section.id = "client-progress";
  section.className = main.closest(".coach-shell") ? "detail-panel" : "detail-card";
  section.innerHTML = '<p class="eyebrow">CLIENT PROGRESS</p><h2>Body measurements</h2><div class="client-progress-grid"><div><strong id="client-workouts">0</strong><span>Workout check-ins</span></div><div><strong id="client-meals">0</strong><span>Meal check-ins</span></div></div><div id="specialist-progress-chart"></div><p id="specialist-latest-metric" class="client-progress-note">No body measurements recorded yet.</p><p class="client-progress-note">Activity is shared in this browser preview.</p>';
  main.append(section);
  if (location.hash === "#client-progress") requestAnimationFrame(() => section.scrollIntoView({ block: "start" }));
  function render() {
    const assigned = document.body.dataset.clientEmail || "client@lift.demo";
    const activity = window.LiftMeasurementCharts.readActivity(assigned);
    const rows = window.LiftActivityChart.series(activity);
    section.querySelector("#client-workouts").textContent = rows.reduce((total, row) => total + row.workouts, 0);
    section.querySelector("#client-meals").textContent = rows.reduce((total, row) => total + row.meals, 0);
    window.LiftMeasurementCharts.render(section.querySelector("#specialist-progress-chart"), activity);
    section.querySelector("#specialist-latest-metric").textContent = window.LiftMeasurementCharts.latestText(activity);
  }
  window.addEventListener("storage", render);
  window.addEventListener("focus", render);
  render();
})();
