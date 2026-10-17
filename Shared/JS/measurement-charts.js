"use strict";
(() => {
  const metrics = [
    { key: "weight", title: "Weight", unit: "kg", color: "var(--brand)" },
    { key: "fatPercent", title: "Body fat", unit: "%", color: "#c27d55" },
    { key: "musclePercent", title: "Muscle", unit: "%", color: "#4a9caa" }
  ];
  const valid = value => value !== "" && value != null && Number.isFinite(Number(value));
  const pointsFor = (activity, key) => (Array.isArray(activity?.measurements) ? activity.measurements : [])
    .filter(item => valid(item[key]) && item.date)
    .map(item => ({ date: item.date, value: Number(item[key]) }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);
  const latestText = activity => {
    const entries = Array.isArray(activity?.measurements) ? activity.measurements : [];
    const latest = entries.at(-1);
    if (!latest) return "No body measurements recorded yet.";
    const values = metrics.filter(metric => valid(latest[metric.key])).map(metric => `${metric.title} ${latest[metric.key]} ${metric.unit}`);
    if (valid(latest.bmi)) values.push(`BMI ${latest.bmi}`);
    return values.length ? `Latest · ${values.join(" · ")}` : "No weight, body fat, or muscle values recorded yet.";
  };
  const readActivity = email => {
    let activity;
    try { activity = JSON.parse(localStorage.getItem(`lift-client-activity-${email}`) || "null"); } catch { /* Empty state. */ }
    activity ||= { workouts: {}, meals: {}, measurements: [] };
    if (email === "client@lift.demo" && !activity.demoMetricsSeeded) {
      activity.measurements ||= [];
      if (!activity.measurements.length) {
        [[-28, 84.2, 25.4, 37.8], [-21, 83.7, 24.9, 38.2], [-14, 83.1, 24.3, 38.7], [-7, 82.8, 23.9, 39.1], [0, 82.4, 23.5, 39.6]].forEach(([offset, weight, fatPercent, musclePercent]) => {
          const date = new Date(); date.setDate(date.getDate() + offset);
          activity.measurements.push({ date: [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"), weight, fatPercent, musclePercent, demo: true });
        });
      }
      activity.demoMetricsSeeded = true;
      try { localStorage.setItem(`lift-client-activity-${email}`, JSON.stringify(activity)); } catch { /* Preview remains visible. */ }
    }
    return activity;
  };
  const render = (host, activity) => {
    if (!host) return;
    host.replaceChildren();
    host.classList.add("measurement-charts");
    metrics.forEach(metric => {
      const points = pointsFor(activity, metric.key);
      const card = document.createElement("article");
      card.className = "measurement-chart-card";
      const head = document.createElement("div");
      head.className = "measurement-chart-head";
      const title = document.createElement("h3"); title.textContent = metric.title;
      const latest = document.createElement("strong"); latest.textContent = points.length ? `${points.at(-1).value} ${metric.unit}` : "No data yet";
      head.append(title, latest);
      card.append(head);
      if (!points.length) {
        const empty = document.createElement("div");
        empty.className = "measurement-chart-empty";
        empty.textContent = `Add ${metric.title.toLowerCase()} measurements to see the trend.`;
        card.append(empty);
      } else {
        const minValue = Math.min(...points.map(point => point.value));
        const maxValue = Math.max(...points.map(point => point.value));
        const padding = Math.max(metric.unit === "kg" ? 1 : .5, (maxValue - minValue) * .3);
        const low = Math.max(0, minValue - padding), high = maxValue + padding;
        const x = index => 22 + (points.length === 1 ? 288 : index * 576 / (points.length - 1));
        const y = value => 150 - ((value - low) / (high - low)) * 120;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 620 180");
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", `${metric.title} trend from ${points[0].date} to ${points.at(-1).date}`);
        svg.innerHTML = `<g class="measurement-grid"><line x1="22" x2="598" y1="30" y2="30"/><line x1="22" x2="598" y1="90" y2="90"/><line x1="22" x2="598" y1="150" y2="150"/></g><path d="${points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)} ${y(point.value).toFixed(1)}`).join(" ")}"/><g>${points.map((point, index) => `<circle cx="${x(index).toFixed(1)}" cy="${y(point.value).toFixed(1)}" r="4"/>`).join("")}</g>`;
        svg.style.setProperty("--metric-color", metric.color);
        const dates = document.createElement("div");
        dates.className = "measurement-chart-dates";
        const first = document.createElement("span"); first.textContent = points[0].date;
        const last = document.createElement("span"); last.textContent = points.at(-1).date;
        dates.append(first, last);
        card.append(svg, dates);
      }
      host.append(card);
    });
  };
  window.LiftMeasurementCharts = Object.freeze({ metrics, pointsFor, latestText, render, readActivity });
})();
