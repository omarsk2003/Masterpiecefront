"use strict";

// One local Premium-client plan for the current same-device frontend preview.
(() => {
  const key = "lift-alexander-workout-plan-v1";
  const initial = Object.freeze({
    clientId: "alexander-drake",
    coach: "Sarah Chen",
    status: "approved",
    goal: "Strength & muscle building",
    level: "Intermediate",
    location: "Commercial gym",
    days: 4,
    minutes: 45,
    split: "Mon: Upper body • Tue: Conditioning • Wed: Lower body • Fri: Upper body",
    dayExercises: "Mon | Barbell Back Squat | 3 sets × 8 reps\nMon | Romanian Deadlift | 3 sets × 10 reps\nTue | Conditioning | 30 minutes\nWed | Barbell Back Squat | 3 sets × 8 reps\nWed | Romanian Deadlift | 3 sets × 10 reps\nFri | Barbell Back Squat | 3 sets × 8 reps",
    coachNotes: "Keep sessions practical and progress at a steady pace.",
    updatedAt: null
  });
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      if (value && value.clientId === initial.clientId) return { ...initial, ...value };
    } catch { /* Use the original static plan. */ }
    return { ...initial };
  };
  const readPublished = () => {
    const current = read();
    return current.published ? { ...initial, ...current.published, status: "approved" } : { ...initial };
  };
  const save = (input, status) => {
    const next = {
      ...read(),
      goal: String(input.goal || initial.goal).trim().slice(0, 120),
      location: String(input.location || initial.location).trim().slice(0, 80),
      days: Math.min(7, Math.max(1, Number(input.days) || initial.days)),
      minutes: Math.min(180, Math.max(15, Number(input.minutes) || initial.minutes)),
      split: String(input.split || initial.split).trim().slice(0, 600),
      dayExercises: String(input.dayExercises ?? read().dayExercises ?? initial.dayExercises).trim().slice(0, 4000),
      coachNotes: String(input.coachNotes || "").trim().slice(0, 600),
      status,
      updatedAt: new Date().toISOString()
    };
    if (status === "approved") {
      const { published, ...snapshot } = next;
      next.published = snapshot;
    }
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { return false; }
    document.dispatchEvent(new Event("lift:coach-plan-change"));
    return true;
  };
  window.LiftCoachPlan = { read, readPublished, save };
})();
