"use strict";

const assert = require("node:assert/strict");
const { matchPremium, coaches, nutritionists } = require("../Shared/JS/matching.js");

const profile = {
  plan: "premium", goal: "muscle", sport: null, experience: "intermediate",
  location: "gym", duration: 45, cooking: "home", conditions: ["none"]
};

assert.equal(matchPremium(profile).coach.name, "Sarah Chen");
assert.equal(matchPremium(profile).nutritionist.name, "Maya Haddad");

const football = matchPremium({ ...profile, goal: "performance", sport: "football", location: "field" });
assert.equal(football.coach.name, "Yousef Mansour");
assert.equal(football.nutritionist.name, "Leen Faris");
assert.match(football.coach.reason, /football/);

const basketball = matchPremium({ ...profile, goal: "performance", sport: "basketball", location: "field" });
assert.equal(basketball.coach.name, "Rami Saleh");
assert.equal(basketball.nutritionist.name, "Leen Faris");

const weightLoss = matchPremium({ ...profile, goal: "lose", experience: "beginner" });
assert.equal(weightLoss.coach.name, "Daniel Haddad");
assert.equal(weightLoss.nutritionist.name, "Dina Nasser");
assert.notEqual(weightLoss.coach.name, "Omar Khalil"); // Pending cannot be assigned.

const fullCoach = coaches.find(person => person.id === "coach-yousef");
fullCoach.assigned = fullCoach.capacity;
assert.equal(matchPremium({ ...profile, goal: "performance", sport: "football", location: "field" }).coach.name, "Rami Saleh");
fullCoach.assigned = 2;

const noSuitableCoach = matchPremium({ ...profile, goal: "lose", experience: "advanced" });
assert.equal(noSuitableCoach.status, "needs-admin");
assert.equal(noSuitableCoach.coach, null);
assert.equal(noSuitableCoach.nutritionist.name, "Dina Nasser");

const healthReview = matchPremium({ ...profile, conditions: ["asthma"] });
assert.equal(healthReview.healthReview, true);
assert.equal(matchPremium({ ...profile, plan: "free" }).status, "not-premium");
assert.equal(nutritionists.find(person => person.name === "Lina Mansour").status, "pending");

process.stdout.write("Matching scenarios passed.\n");
