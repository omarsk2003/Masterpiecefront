"use strict";

(() => {
  const key = "lift-nutrition-profile-v1";
  const defaults = {
    name: "Maya Haddad",
    email: "nutritionist@lift.demo",
    phone: "",
    specialty: "Personal nutrition",
    experience: "5 years",
    bio: "I help clients build practical nutrition habits around their goals, food preferences and routines."
  };
  function read() {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(key) || "{}"), email: defaults.email }; }
    catch { return { ...defaults }; }
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
    document.dispatchEvent(new Event("lift:nutrition-profile-change"));
    return true;
  }
  window.LiftNutritionProfile = { key, read, save };
})();
