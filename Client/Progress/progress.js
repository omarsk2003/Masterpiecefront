"use strict";
(() => {
  const access = window.LiftClientAccess;
  const activityChart = window.LiftActivityChart;
  const measurementCharts = window.LiftMeasurementCharts;
  const metricList = document.getElementById("metric-list");
  const form = document.getElementById("metric-form");
  const metricDialog = document.getElementById("metric-dialog");
  document.getElementById("open-metric-dialog").addEventListener("click", () => {
    document.getElementById("metric-error").hidden = true;
    metricDialog.showModal();
    document.getElementById("metric-weight").focus();
  });
  document.getElementById("close-metric-dialog").addEventListener("click", () => metricDialog.close());
  document.getElementById("cancel-metric-dialog").addEventListener("click", () => metricDialog.close());
  function render() {
    const activity = measurementCharts.readActivity(access.member?.email || "sample-premium");
    const rows = activityChart.series(activity);
    document.getElementById("workout-count").textContent = String(rows.reduce((total, row) => total + row.workouts, 0));
    document.getElementById("meal-count").textContent = String(rows.reduce((total, row) => total + row.meals, 0));
    measurementCharts.render(document.getElementById("progress-chart"), activity);
    const measurements = Array.isArray(activity.measurements) ? activity.measurements : [];
    metricList.replaceChildren();
    measurements.slice(-5).reverse().forEach(entry => {
      const item = document.createElement("li");
      const values = [entry.weight ? `${entry.weight} kg` : "", entry.fatPercent ? `${entry.fatPercent}% body fat` : "", entry.musclePercent ? `${entry.musclePercent}% muscle` : "", entry.bmi ? `BMI ${entry.bmi}` : ""].filter(Boolean);
      item.textContent = `${entry.date || "Recorded"} · ${values.join(" · ")}`;
      metricList.append(item);
    });
    document.getElementById("latest-metric").textContent = measurementCharts.latestText(activity);
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const weight = document.getElementById("metric-weight").value.trim();
    const fatPercent = document.getElementById("metric-fat").value.trim();
    const musclePercent = document.getElementById("metric-muscle").value.trim();
    const bmi = document.getElementById("metric-bmi").value.trim();
    const error = document.getElementById("metric-error");
    if (!weight || !fatPercent || !musclePercent || Number(weight) < 20 || Number(weight) > 500 || Number(fatPercent) < 1 || Number(fatPercent) > 80 || Number(musclePercent) < 1 || Number(musclePercent) > 90 || (bmi && (Number(bmi) < 10 || Number(bmi) > 80))) {
      error.textContent = "Enter weight, body fat percentage, and muscle percentage within the indicated ranges.";
      error.hidden = false;
      window.LiftNotice.warning(error.textContent);
      return;
    }
    error.hidden = true;
    const activity = access.getActivity();
    activity.measurements ||= [];
    activity.measurements.push({ date: access.todayKey(), weight, fatPercent, musclePercent, bmi: bmi || null });
    if (!access.saveActivity(activity)) return window.LiftNotice.error("Could not save your measurements on this device.");
    form.reset();
    metricDialog.close();
    window.LiftNotice.success("Body measurements saved to your progress.");
  });
  window.addEventListener("focus", render);
  window.addEventListener("storage", render);
  window.addEventListener("lift:activity-change", render);
  render();
  access.finishRender();
})();
