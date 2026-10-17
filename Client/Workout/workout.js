"use strict";
if (window.LiftClientAccess?.isPremium() !== false) {
  const access = window.LiftClientAccess;
  const plan = window.LiftCoachPlan.readPublished();
  const today = access.todayKey();
  const scheduled = (plan.dayExercises || "").split(/\r?\n/).map(line => line.split("|").map(part => part.trim())).filter(parts => parts.length >= 2);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const start = new Date(today + "T12:00:00");
  let sessionDate = start;
  let exercises = [];
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + offset);
    const matching = scheduled.filter(parts => parts[0].toLowerCase() === dayNames[candidate.getDay()].toLowerCase());
    if (matching.length) { sessionDate = candidate; exercises = matching; break; }
  }
  const borrowedSession = sessionDate.getTime() !== start.getTime();
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
  section.innerHTML = '<div class="section-heading"><div><p class="eyebrow"></p><h2></h2></div><span class="daily-count" aria-live="polite"></span></div><div class="daily-list"></div>';
  section.querySelector(".eyebrow").textContent = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(start) + " · COACH PLAN";
  section.querySelector("h2").textContent = "Today's exercises";
  if (borrowedSession) {
    const note = document.createElement("p");
    note.className = "daily-session-note";
    note.textContent = `No session was scheduled for today, so you can use the ${new Intl.DateTimeFormat("en", { weekday: "long" }).format(sessionDate)} exercise set. Completing it counts toward today.`;
    section.querySelector(".section-heading").after(note);
  }
  summary.after(section);
  const list = section.querySelector(".daily-list");
  const refreshCount = () => { section.querySelector(".daily-count").textContent = exercises.filter((_, index) => done(index)).length + " OF " + exercises.length + " COMPLETED"; };
  const cards = [];
  if (!exercises.length) {
    const rest = document.createElement("p");
    rest.className = "daily-empty";
    rest.textContent = "No exercises have been added to the approved plan yet.";
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
    button.addEventListener("click", () => { const completing = !done(index); if (!access.setDone("workouts", key(index), completing)) return window.LiftNotice.error("Could not update this exercise on this device."); sync(); refreshCount(); window.LiftNotice.success(`${name} ${completing ? "marked complete" : "marked incomplete"}.`); });
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
  const exampleVideos = {
    "barbell back squat": "-bJIpOq-LWk",
    "romanian deadlift": "xgusDooVfKU",
    "dumbbell bench press": "4_QuyfOCI5U",
    "lat pulldown": "JGeRYIZdojU",
    "push-up": "WDIpL0pjun0"
  };
  async function loadCoachVideos() {
    let guides = [];
    try { guides = (await window.LiftExerciseLibrary?.all() || []).filter(item => item.clientId === plan.clientId || item.clientId === "all" || item.clientIds?.includes(plan.clientId)); }
    catch { /* The example videos remain available if local uploads cannot be read. */ }
    videoUrls.forEach(url => URL.revokeObjectURL(url));
    videoUrls = [];
    cards.forEach(({ name, video }) => {
      const guide = guides.find(item => item.exercise.toLowerCase() === name.toLowerCase());
      video.replaceChildren();
      if (!guide) {
        const id = exampleVideos[name.toLowerCase()];
        if (id) {
          const frame = document.createElement("iframe");
          frame.src = "https://www.youtube-nocookie.com/embed/" + id;
          frame.title = name + " example demonstration";
          frame.loading = "lazy";
          frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
          frame.allowFullscreen = true;
          const source = document.createElement("p");
          source.textContent = "Example video · coach video will replace it after upload";
          const link = document.createElement("a");
          link.href = "https://www.youtube.com/watch?v=" + id;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Watch on YouTube ↗";
          video.append(frame, source, link);
        } else {
          const pending = document.createElement("p");
          pending.className = "daily-video-state";
          pending.textContent = "Coach video awaiting upload";
          video.append(pending);
        }
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
      cue.textContent = "Coach Sarah · " + guide.steps;
      video.append(player, cue);
    });
  }
  window.addEventListener("focus", loadCoachVideos);
  window.addEventListener("pagehide", () => videoUrls.forEach(url => URL.revokeObjectURL(url)));
  loadCoachVideos();
}
