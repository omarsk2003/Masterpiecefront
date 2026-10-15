"use strict";

// Demo specialists. Replace this catalogue with approved, available backend accounts later.
(() => {
  const coaches = [
    { id: "coach-sarah", name: "Sarah Chen", specialty: "Strength & muscle building", goals: ["muscle", "gain"], sports: [], levels: ["beginner", "intermediate", "advanced"], locations: ["gym", "home"], durations: [30, 45, 60, 90], capacity: 8, assigned: 3, status: "active", verified: true },
    { id: "coach-daniel", name: "Daniel Haddad", specialty: "Weight management & general fitness", goals: ["lose", "fitness", "maintain"], sports: [], levels: ["beginner", "intermediate"], locations: ["gym", "home", "field"], durations: [30, 45, 60], capacity: 7, assigned: 2, status: "active", verified: true },
    { id: "coach-yousef", name: "Yousef Mansour", specialty: "Football performance & conditioning", goals: ["performance"], sports: ["football"], levels: ["beginner", "intermediate", "advanced"], locations: ["field", "gym", "home"], durations: [30, 45, 60, 90], capacity: 6, assigned: 2, status: "active", verified: true },
    { id: "coach-rami", name: "Rami Saleh", specialty: "Multi-sport performance & conditioning", goals: ["performance"], sports: ["general"], levels: ["beginner", "intermediate", "advanced"], locations: ["field", "gym", "home"], durations: [30, 45, 60, 90], capacity: 8, assigned: 4, status: "active", verified: true },
    { id: "coach-omar", name: "Omar Khalil", specialty: "Weight management", goals: ["lose"], sports: [], levels: ["beginner"], locations: ["gym", "home"], durations: [30, 45, 60], capacity: 8, assigned: 0, status: "pending", verified: false }
  ];
  const nutritionists = [
    { id: "nutrition-maya", name: "Maya Haddad", specialty: "Muscle-building & everyday nutrition", goals: ["muscle", "gain", "fitness", "maintain"], sports: [], cookingStyles: ["home", "family", "delivery", "restaurant"], capacity: 9, assigned: 4, status: "active", verified: true },
    { id: "nutrition-dina", name: "Dina Nasser", specialty: "Weight-management nutrition", goals: ["lose"], sports: [], cookingStyles: ["home", "family", "delivery", "restaurant"], capacity: 8, assigned: 3, status: "active", verified: true },
    { id: "nutrition-leen", name: "Leen Faris", specialty: "Sports nutrition", goals: ["performance"], sports: ["football", "basketball", "running", "other"], cookingStyles: ["home", "family", "delivery", "restaurant"], capacity: 7, assigned: 2, status: "active", verified: true },
    { id: "nutrition-lina", name: "Lina Mansour", specialty: "Balanced nutrition", goals: ["fitness", "maintain"], sports: [], cookingStyles: ["home", "family"], capacity: 8, assigned: 0, status: "pending", verified: false }
  ];
  const goalLabels = {
    muscle: "building muscle",
    lose: "losing weight",
    gain: "healthy weight gain",
    maintain: "maintaining weight",
    fitness: "improving general fitness",
    performance: "sports performance"
  };
  const sportLabels = { football: "football", basketball: "basketball", running: "running", other: "your sport" };
  const available = person => person.status === "active" && person.verified === true && (person.capacity == null || person.assigned < person.capacity);

  function rankCoach(coach, profile) {
    if (!available(coach) || !coach.goals.includes(profile.goal)
      || !coach.levels.includes(profile.experience)
      || !coach.locations.includes(profile.location)
      || !coach.durations.includes(Number(profile.duration))) return null;
    const sportSpecific = profile.goal === "performance" && coach.sports.includes(profile.sport);
    const multiSport = profile.goal === "performance" && coach.sports.includes("general");
    if (profile.goal === "performance" && !sportSpecific && !multiSport) return null;
    const score = 100 + (sportSpecific ? 80 : 0) + (multiSport ? 25 : 0)
      + (coach.levels.includes(profile.experience) ? 20 : 0)
      + (coach.locations.includes(profile.location) ? 15 : 0)
      + (coach.durations.includes(Number(profile.duration)) ? 10 : 0)
      + (coach.capacity == null ? 0 : (coach.capacity - coach.assigned) / coach.capacity);
    return { person: coach, score, sportSpecific };
  }

  function rankNutritionist(nutritionist, profile) {
    if (!available(nutritionist) || !nutritionist.goals.includes(profile.goal)) return null;
    const score = 100 + (profile.goal === "performance" && nutritionist.sports.includes(profile.sport) ? 40 : 0)
      + (nutritionist.cookingStyles.includes(profile.cooking) ? 15 : 0)
      + (nutritionist.capacity == null ? 0 : (nutritionist.capacity - nutritionist.assigned) / nutritionist.capacity);
    return { person: nutritionist, score };
  }

  function best(catalogue, rank, profile) {
    return catalogue.map(person => rank(person, profile)).filter(Boolean)
      .sort((a, b) => b.score - a.score || a.person.id.localeCompare(b.person.id))[0] || null;
  }

  function matchPremium(profile) {
    if (profile.plan !== "premium") return { status: "not-premium", coach: null, nutritionist: null };
    const coachMatch = best(coaches, rankCoach, profile);
    const nutritionMatch = best(nutritionists, rankNutritionist, profile);
    const coach = coachMatch ? {
      id: coachMatch.person.id,
      name: coachMatch.person.name,
      specialty: coachMatch.person.specialty,
      reason: profile.goal === "performance"
        ? coachMatch.sportSpecific
          ? `Specializes in ${sportLabels[profile.sport] || "your sport"} performance and fits your training level, setting, and time.`
          : `Specializes in multi-sport conditioning and fits your ${sportLabels[profile.sport] || "sport"} goal.`
        : `Specializes in ${goalLabels[profile.goal] || "your goal"} and fits your training profile.`
    } : null;
    const nutritionist = nutritionMatch ? {
      id: nutritionMatch.person.id,
      name: nutritionMatch.person.name,
      specialty: nutritionMatch.person.specialty,
      reason: `Specializes in nutrition for ${goalLabels[profile.goal] || "your goal"} and considers your usual food routine.`
    } : null;
    const conditions = Array.isArray(profile.conditions) ? profile.conditions.filter(value => value !== "none") : [];
    return {
      status: coach && nutritionist ? "matched" : "needs-admin",
      coach,
      nutritionist,
      healthReview: conditions.length > 0,
      note: coach && nutritionist
        ? "Your AI plan drafts go to your assigned coach and nutritionist for review before approval."
        : "A suitable available specialist was not found. Admin review is needed before assignment."
    };
  }

  const api = { matchPremium, coaches, nutritionists, goalLabels, sportLabels };
  if (typeof window !== "undefined") window.LiftMatching = api;
  if (typeof module !== "undefined") module.exports = api;
})();
