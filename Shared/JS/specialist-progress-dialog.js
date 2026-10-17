"use strict";
(() => {
  const chart = window.LiftActivityChart;
  const dialog = document.createElement("dialog");
  dialog.className = "specialist-progress-dialog";
  dialog.setAttribute("aria-labelledby", "progress-dialog-title");
  dialog.innerHTML = '<div class="progress-dialog-head"><div><p class="eyebrow">CLIENT PROGRESS</p><h2 id="progress-dialog-title">Progress</h2><p>Weight, body fat, and muscle trends.</p></div><button type="button" class="progress-dialog-close" aria-label="Close progress">×</button></div><div class="client-progress-grid"><div><strong data-progress-workouts>0</strong><span>Workout check-ins</span></div><div><strong data-progress-meals>0</strong><span>Meal check-ins</span></div></div><div data-progress-chart></div><p class="progress-dialog-metrics" data-progress-metrics>No body measurements recorded yet.</p>';
  document.body.append(dialog);
  dialog.querySelector(".progress-dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-open-progress]");
    if (!button) return;
    const activity = window.LiftMeasurementCharts.readActivity(button.dataset.clientEmail);
    const rows = chart.series(activity);
    dialog.querySelector("#progress-dialog-title").textContent = `${button.dataset.clientName || "Client"}'s progress`;
    dialog.querySelector("[data-progress-workouts]").textContent = rows.reduce((sum, row) => sum + row.workouts, 0);
    dialog.querySelector("[data-progress-meals]").textContent = rows.reduce((sum, row) => sum + row.meals, 0);
    window.LiftMeasurementCharts.render(dialog.querySelector("[data-progress-chart]"), activity);
    dialog.querySelector("[data-progress-metrics]").textContent = window.LiftMeasurementCharts.latestText(activity);
    dialog.showModal();
  });
})();
