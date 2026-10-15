"use strict";

(() => {
  const key = "lift-coach-profile-v1";
  const defaults = {
    name: "Sarah Chen",
    email: "coach@lift.demo",
    phone: "",
    specialty: "Strength & conditioning",
    experience: "6 years",
    bio: "I help clients build strength with training plans that fit their goals and available time."
  };
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "{}");
      return { ...defaults, ...saved, email: defaults.email };
    } catch { return { ...defaults }; }
  }
  function save(input) {
    const next = {
      ...read(),
      name: String(input.name).trim().replace(/\s+/g, " ").slice(0, 80),
      phone: String(input.phone).trim().slice(0, 24),
      specialty: String(input.specialty).trim().slice(0, 90),
      experience: String(input.experience).trim().slice(0, 40),
      bio: String(input.bio).trim().slice(0, 500)
    };
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { return false; }
    document.dispatchEvent(new Event("lift:coach-profile-change"));
    return true;
  }
  window.LiftCoachProfile = { key, read, save };
})();
