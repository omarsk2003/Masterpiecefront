"use strict";
if (window.LiftClientAccess?.isPremium() !== false) {
  const access = window.LiftClientAccess;
  const plan = window.LiftCoachPlan.readPublished();
  const today = access.todayKey();
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(today + "T12:00:00").getDay()];
  const exercises = (plan.dayExercises || "").split(/\r?\n/).map(line => line.split("|").map(part => part.trim()))
    .filter(parts => parts.length >= 2 && parts[0].toLowerCase() === day.toLowerCase());
  const key = index => `premium-workout:${today}:exercise:${plan.updatedAt || "initial"}:${index}`;
  const done = index => Boolean(access.getActivity().workouts?.[key(index)]);
  document.querySelector(".schedule-card")?.remove();
  document.querySelector(".exercise-section")?.remove();
  document.querySelector(".page-heading h1").textContent = "Today's workout";
  const summary = document.createElement("section");
  summary.className = "approved-plan-summary";
  summary.innerHTML = "<span>COACH-APPROVED PLAN</span><strong></strong><p></p><small></small>";
  summary.querySelector("strong").textContent = plan.goal;
  summary.querySelector("p").textContent = plan.minutes + " minutes · " + plan.location;
  summary.querySelector("small").textContent = plan.coachNotes || "Follow your coach's approved exercises for today.";
  document.querySelector(".page-heading").after(summary);
  const section = document.createElement("section");
  section.className = "daily-exercises";
  section.innerHTML = '<div class="section-heading"><div><p class="eyebrow"></p><h2>Today\'s exercises</h2></div><span class="daily-count" aria-live="polite"></span></div><div class="daily-list"></div>';
  section.querySelector(".eyebrow").textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date(today + "T12:00:00")) + " · COACH PLAN";
  summary.after(section);
  const list = section.querySelector(".daily-list");
  const refreshCount = () => { section.querySelector(".daily-count").textContent = exercises.filter((_, index) => done(index)).length + " OF " + exercises.length + " COMPLETED"; };
  const cards = [];
  if (!exercises.length) {
    const rest = document.createElement("p");
    rest.className = "daily-empty";
    rest.textContent = "No exercises planned for today. Follow your coach's recovery guidance.";
    list.append(rest);
  }
  exercises.forEach(([, name, details], index) => {
    const card = document.createElement("article");
    card.className = "daily-exercise-card";
    const info = document.createElement("div");
    info.className = "daily-exercise-info";
    const heading = document.createElement("h3");
    heading.textContent = name;
    const description = document.createElement("p");
    description.textContent = details || "Follow your coach's instructions.";
    info.append(heading, description);
    const video = document.createElement("div");
    video.className = "daily-video";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "status-button";
    button.setAttribute("aria-label", "Mark " + name + " complete");
    const sync = () => {
      const completed = done(index);
      button.setAttribute("aria-pressed", String(completed));
      button.textContent = completed ? "✓ COMPLETED" : "MARK COMPLETE";
      button.classList.toggle("complete", completed);
    };
    sync();
    button.addEventListener("click", () => { access.setDone("workouts", key(index), !done(index)); sync(); refreshCount(); });
    card.append(info, video, button);
    list.append(card);
    cards.push({ name, video });
  });
  refreshCount();
  const details = document.querySelectorAll(".workout-sidebar .side-card:first-child dd");
  if (details.length >= 3) {
    details[0].textContent = plan.location;
    details[1].textContent = plan.minutes + " minutes";
    details[2].textContent = plan.goal;
  }
  let videoUrls = [];
  async function loadCoachVideos() {
    if (!window.LiftExerciseLibrary) return;
    let guides;
    try { guides = (await window.LiftExerciseLibrary.all()).filter(item => item.clientId === plan.clientId); }
    catch { return; }
    videoUrls.forEach(url => URL.revokeObjectURL(url));
    videoUrls = [];
    cards.forEach(({ name, video }) => {
      const guide = guides.find(item => item.exercise.toLowerCase() === name.toLowerCase());
      video.replaceChildren();
      if (!guide) {
        const pending = document.createElement("p");
        pending.className = "daily-video-state";
        pending.textContent = "Coach video awaiting upload";
        video.append(pending);
        return;
      }
      const player = document.createElement("video");
      const url = URL.createObjectURL(guide.file);
      videoUrls.push(url);
      player.src = url;
      player.controls = true;
      player.playsInline = true;
      player.preload = "metadata";
      player.setAttribute("aria-label", name + " demonstration by Coach Sarah");
      const cue = document.createElement("p");
      cue.textContent = guide.steps;
      video.append(player, cue);
    });
  }
  window.addEventListener("focus", loadCoachVideos);
  window.addEventListener("pagehide", () => videoUrls.forEach(url => URL.revokeObjectURL(url)));
  loadCoachVideos();
}
