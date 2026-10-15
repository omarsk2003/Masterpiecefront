"use strict";
if (window.LiftClientAccess?.isPremium() !== false) {


// Static sample entries live in this file; new measurements stay in memory.
const weekly = [
  { date: "2026-10-01", weight: 79.0 }, { date: "2026-10-02", weight: 78.9 },
  { date: "2026-10-03", weight: 78.8 }, { date: "2026-10-04", weight: 78.7 },
  { date: "2026-10-05", weight: 78.5 }, { date: "2026-10-06", weight: 78.4 },
  { date: "2026-10-07", weight: 78.2 }
];
const monthly = [
  { date: "2026-09-10", weight: 80.1 }, { date: "2026-09-17", weight: 79.8 },
  { date: "2026-09-23", weight: 79.4 }, { date: "2026-09-30", weight: 79.0 },
  { date: "2026-10-07", weight: 78.2 }
];
const measurements = [
  { date: "2026-10-07", weight: 78.2, waist: 84 },
  { date: "2026-09-30", weight: 79.0, waist: 85 },
  { date: "2026-09-23", weight: 79.4, waist: 85.5 }
];
let activeRange = "week";
const chart = document.getElementById("weight-chart");
const chartLine = document.getElementById("chart-line-path");
const chartFill = document.getElementById("chart-fill-path");
const chartPoints = document.getElementById("chart-points");
const chartLabels = document.getElementById("chart-labels");
const svgNS = "http://www.w3.org/2000/svg";

function displayDate(date, includeYear = false) {
  const [year, month, day] = date.split("-");
  const name = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(month) - 1];
  return `${day} ${name}${includeYear ? ` ${year}` : ""}`;
}

function renderChart() {
  const points = activeRange === "week" ? weekly : monthly;
  const values = points.map((point) => point.weight);
  const min = Math.floor((Math.min(...values) - .2) * 5) / 5;
  const max = Math.ceil((Math.max(...values) + .2) * 5) / 5;
  const span = Math.max(max - min, .4);
  const mapped = points.map((point, index) => ({
    x: points.length === 1 ? 350 : index / (points.length - 1) * 700,
    y: 200 - (point.weight - min) / span * 175,
    ...point
  }));
  const line = mapped.map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  chartLine.setAttribute("d", line);
  chartFill.setAttribute("d", `${line} L${mapped.at(-1).x.toFixed(1)} 200 L${mapped[0].x.toFixed(1)} 200 Z`);
  chartPoints.replaceChildren();
  mapped.forEach((point, index) => {
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", point.x.toFixed(1));
    circle.setAttribute("cy", point.y.toFixed(1));
    circle.setAttribute("r", index === mapped.length - 1 ? "6" : "4");
    circle.setAttribute("class", index === mapped.length - 1 ? "chart-point current" : "chart-point");
    const title = document.createElementNS(svgNS, "title");
    title.textContent = `${displayDate(point.date)}: ${point.weight.toFixed(1)} kg`;
    circle.append(title);
    chartPoints.append(circle);
  });
  document.getElementById("axis-high").textContent = max.toFixed(1);
  document.getElementById("axis-mid").textContent = ((max + min) / 2).toFixed(1);
  document.getElementById("axis-low").textContent = min.toFixed(1);
  chartLabels.replaceChildren();
  points.forEach((point) => {
    const label = document.createElement("span");
    label.textContent = activeRange === "week" ? new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(new Date(`${point.date}T12:00:00Z`)) : displayDate(point.date);
    chartLabels.append(label);
  });
  document.getElementById("chart-period").textContent = `${displayDate(points[0].date).toUpperCase()} – ${displayDate(points.at(-1).date).toUpperCase()}`;
  chart.setAttribute("aria-label", `Weight trend from ${points[0].weight.toFixed(1)} to ${points.at(-1).weight.toFixed(1)} kilograms over ${activeRange === "week" ? "seven" : "thirty"} days`);
}

function renderMeasurements() {
  measurements.sort((a, b) => b.date.localeCompare(a.date));
  const rows = document.getElementById("measurement-rows");
  rows.replaceChildren();
  measurements.slice(0, 5).forEach((entry, index) => {
    const row = document.createElement("tr");
    const previous = measurements[index + 1];
    const difference = previous ? entry.weight - previous.weight : null;
    const cells = [
      displayDate(entry.date, true),
      `${entry.weight.toFixed(1)} kg`,
      entry.waist == null ? "—" : `${entry.waist} cm`,
      difference == null ? "—" : `${difference < 0 ? "−" : difference > 0 ? "+" : ""}${Math.abs(difference).toFixed(1)} kg`
    ];
    cells.forEach((value, cellIndex) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      if (cellIndex === 3 && difference < 0) cell.className = "positive";
      row.append(cell);
    });
    rows.append(row);
  });
  const latest = measurements[0];
  const previous = measurements[1];
  document.getElementById("current-weight").innerHTML = `${latest.weight.toFixed(1)} <small>kg</small>`;
  const change = document.getElementById("weight-change");
  if (previous) {
    const difference = latest.weight - previous.weight;
    change.textContent = `${difference < 0 ? "↓" : difference > 0 ? "↑" : "→"} ${Math.abs(difference).toFixed(1)} kg from previous entry`;
    change.classList.toggle("positive", difference <= 0);
  }
}

document.querySelectorAll(".range-option").forEach((button) => {
  button.addEventListener("click", () => {
    activeRange = button.dataset.range;
    document.querySelectorAll(".range-option").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("active", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    renderChart();
  });
});

const dialog = document.getElementById("entry-dialog");
const entryForm = document.getElementById("entry-form");
const entryDate = document.getElementById("entry-date");
const now = new Date();
entryDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
entryDate.max = entryDate.value;
document.getElementById("open-entry").addEventListener("click", () => dialog.showModal());
document.getElementById("close-entry").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });

entryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const date = entryDate.value;
  const weight = Number(document.getElementById("entry-weight").value);
  const waistText = document.getElementById("entry-waist").value;
  const waist = waistText ? Number(waistText) : null;
  if (!date || !Number.isFinite(weight) || weight < 30 || weight > 300) return;
  const existing = measurements.find((entry) => entry.date === date);
  if (existing) Object.assign(existing, { weight, waist });
  else measurements.push({ date, weight, waist });
  [weekly, monthly].forEach((series) => {
    if (date < series[0].date) return;
    const point = series.find((entry) => entry.date === date);
    if (point) point.weight = weight;
    else series.push({ date, weight });
    series.sort((a, b) => a.date.localeCompare(b.date));
    series.splice(0, Math.max(0, series.length - (series === weekly ? 7 : 5)));
  });
  renderMeasurements();
  renderChart();
  entryForm.reset();
  entryDate.value = date;
  dialog.close();
});

renderChart();
renderMeasurements();
}
