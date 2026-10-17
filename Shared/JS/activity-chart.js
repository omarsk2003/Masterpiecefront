"use strict";
(() => {
  const datePattern = /\d{4}-\d{2}-\d{2}/;
  const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dateFor = (activity, group, id) => activity?.completedAt?.[group]?.[id] || String(id).match(datePattern)?.[0] || null;
  const entries = (activity, group) => Object.entries(activity?.[group] || {}).filter(([, done]) => done).map(([id]) => ({ id, date: dateFor(activity, group, id) })).filter(entry => entry.date);
  const series = (activity, days = 7) => {
    const end = new Date(); end.setHours(0, 0, 0, 0);
    const rows = Array.from({ length: days }, (_, index) => {
      const date = new Date(end); date.setDate(end.getDate() - days + index + 1);
      return { date: localDate(date), label: date.toLocaleDateString("en", { month: "short", day: "numeric" }), workouts: 0, meals: 0 };
    });
    const byDate = new Map(rows.map(row => [row.date, row]));
    for (const group of ["workouts", "meals"]) for (const entry of entries(activity, group)) {
      const row = byDate.get(entry.date);
      if (row) row[group]++;
    }
    return rows;
  };
  const render = (host, activity, days = 7) => {
    if (!host) return;
    const rows = series(activity, days);
    const max = Math.max(1, ...rows.flatMap(row => [row.workouts, row.meals]));
    const width = 700, height = 210, top = 14, bottom = 178, left = 28, right = 678;
    const y = value => bottom - (value / max) * (bottom - top);
    const x = index => left + (index / Math.max(1, rows.length - 1)) * (right - left);
    const line = group => rows.map((row, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(row[group]).toFixed(1)}`).join(" ");
    const any = rows.some(row => row.workouts || row.meals);
    const grid = [0, 1, 2, 3].map(step => `<line x1="${left}" x2="${right}" y1="${top + step * (bottom - top) / 3}" y2="${top + step * (bottom - top) / 3}"/>`).join("");
    const markers = group => rows.map((row, index) => row[group] ? `<circle cx="${x(index)}" cy="${y(row[group])}" r="4"/>` : "").join("");
    host.innerHTML = `<div class="activity-chart-key"><span class="workout-key">Workouts</span><span class="meal-key">Meals</span></div><div class="activity-chart-frame"><span class="activity-chart-scale"><span>${max}</span><span>${Math.round(max / 2)}</span><span>0</span></span><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Workout and meal check-ins over the last ${days} days"><g class="activity-chart-grid">${grid}</g>${any ? `<path class="activity-workout-line" d="${line("workouts")}"/><path class="activity-meal-line" d="${line("meals")}"/><g class="activity-workout-points">${markers("workouts")}</g><g class="activity-meal-points">${markers("meals")}</g>` : ""}</svg></div><div class="activity-chart-dates"><span>${rows[0].label}</span><span>${rows.at(-1).label}</span></div><p class="activity-chart-empty" ${any ? "hidden" : ""}>No check-ins yet. Your chart will fill as you complete workouts and log meals.</p>`;
  };
  window.LiftActivityChart = Object.freeze({ dateFor, entries, series, render });
})();
