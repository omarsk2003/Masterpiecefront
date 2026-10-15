"use strict";

/* One frontend subscription model. The backend can replace readMember/readProfile later. */
(() => {
  const memberKey = "lift-preview-member-v1";
  const validPlans = new Set(["free", "ai", "premium"]);
  const readJson = (store, key) => {
    try { return JSON.parse(store.getItem(key) || "null"); } catch { return null; }
  };
  const rawMember = readJson(localStorage, memberKey) || readJson(sessionStorage, memberKey);
  const rawPlan = String(rawMember?.plan || rawMember?.subscription || "").toLowerCase().replace(/[\s-]+/g, "_");
  const normalizedPlan = ({ free_plan: "free", ai_plan: "ai" })[rawPlan] || rawPlan;
  const member = rawMember && validPlans.has(normalizedPlan) ? { ...rawMember, plan: normalizedPlan } : null;
  const plan = member?.plan || "premium"; // Existing unregistered sample remains Premium.
  const preview = Boolean(member?.preview);
  const identity = member?.email || "sample-premium";
  const profileKey = `lift-profile-session-${member?.email || "preview"}`;
  const requiresPersonalizationProfile = Boolean(member?.requiresPersonalization || member?.createdAt);
  const activityKey = `lift-client-activity-${identity}`;
  const capabilities = Object.freeze({
    canUseAdvancedAI: plan !== "free",
    canUsePersonalizedAI: plan !== "free",
    canUseAdaptiveWorkout: plan !== "free",
    canUseAdaptiveNutrition: plan !== "free",
    canUseCoach: plan === "premium",
    canUseNutritionist: plan === "premium",
    canUseProfessionalMessaging: plan === "premium",
    canUseProfessionalMeetings: plan === "premium"
  });
  const getProfile = () => readJson(sessionStorage, profileKey) || readJson(localStorage, profileKey);
  const isPersonalizationProfileComplete = profile => {
    if (!profile || profile.completed !== true) return false;
    const filled = value => typeof value === "string" && value.trim().length > 0;
    const inRange = (value, min, max) => filled(String(value ?? "")) && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
    const isOneOf = (value, choices) => choices.includes(value);
    return isOneOf(profile.goal, ["Build strength", "Lose weight", "Improve endurance", "Stay active", "Improve general fitness"])
      && inRange(profile.age, 13, 120) && inRange(profile.weight, 20, 500) && inRange(profile.height, 80, 250)
      && isOneOf(profile.fitness, ["Beginner", "Intermediate", "Advanced"])
      && isOneOf(profile.activity, ["Mostly sitting", "Lightly active", "Moderately active", "Very active"])
      && isOneOf(profile.location, ["Home", "Gym", "Outdoor", "Flexible"])
      && Array.isArray(profile.days) && profile.days.length > 0
      && profile.days.every(day => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].includes(day))
      && isOneOf(String(profile.duration), ["20", "30", "45", "60", "90"])
      && inRange(profile.sleep, 1, 24)
      && [profile.schedule, profile.health, profile.foodHabits, profile.dietary].every(filled);
  };
  const needsPersonalizationProfile = () => requiresPersonalizationProfile && !isPersonalizationProfileComplete(getProfile());
  if (needsPersonalizationProfile()) document.documentElement.dataset.clientNeedsProfile = "true";
  const getActivity = () => readJson(localStorage, activityKey) || { workouts: {}, meals: {}, measurements: [] };
  const saveActivity = activity => {
    try { localStorage.setItem(activityKey, JSON.stringify(activity)); } catch { /* Preview still works for this page. */ }
    window.dispatchEvent(new CustomEvent("lift:activity-change", { detail: activity }));
  };
  const setDone = (group, id, done) => {
    const activity = getActivity();
    activity[group] ||= {};
    activity[group][id] = Boolean(done);
    if (done) { activity.activeDays ||= {}; activity.activeDays[todayKey()] = true; }
    saveActivity(activity);
  };
  const labels = { free: "Free Plan", ai: "AI Plan", premium: "Premium" };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const todayKey = () => {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
  };
  const weekKey = () => {
    const monday = new Date();
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
    return [monday.getFullYear(), String(monday.getMonth() + 1).padStart(2, "0"), String(monday.getDate()).padStart(2, "0")].join("-");
  };
  const getStreak = () => {
    const days = getActivity().activeDays || {};
    const date = new Date();
    if (!days[todayKey()]) date.setDate(date.getDate() - 1);
    let streak = 0;
    while (streak < 365) {
      const key = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
      if (!days[key]) break;
      streak++;
      date.setDate(date.getDate() - 1);
    }
    return streak;
  };
  const getPlan = () => {
    const profile = getProfile();
    const goal = profile?.goal || "Stay active";
    const duration = clamp(Number(profile?.duration) || 25, 15, 90);
    const days = profile?.days?.length ? profile.days : ["Mon", "Wed", "Fri"];
    const location = profile?.location || "Home";
    const fitness = profile?.fitness || "Beginner";
    const activity = getActivity();
    const workoutCount = Object.values(activity.workouts || {}).filter(Boolean).length;
    const sessions = goal === "Build strength"
      ? ["Full-body strength", "Strength and mobility", "Lower-body strength", "Upper-body strength"]
      : goal === "Improve endurance"
        ? ["Easy aerobic movement", "Steady intervals", "Longer easy session", "Mobility and recovery"]
        : goal === "Lose weight"
          ? ["Full-body movement", "Low-impact conditioning", "Strength basics", "Easy walk and mobility"]
          : ["Movement foundations", "Strength basics", "Everyday cardio", "Mobility and recovery"];
    const volume = fitness === "Beginner" ? "2 rounds" : fitness === "Advanced" ? "4 rounds" : "3 rounds";
    const shortSleep = Number(profile?.sleep) > 0 && Number(profile.sleep) < 6;
    const suggestedDuration = shortSleep ? Math.max(15, duration - 10) : duration;
    const baseAdjustment = shortSleep
      ? "Your saved sleep is under six hours, so this preview suggests a shorter session. Adjust to how you feel."
      : workoutCount >= 2
        ? "You have logged a couple of sessions. Keep the next one manageable and leave room for recovery."
        : "Start with a steady effort and adjust the session length if your day changes.";
    const adjusted = baseAdjustment + (profile?.health ? " Consider the movement limitations in your profile; seek qualified advice for pain or symptoms." : "");
    const dietary = String(profile?.dietary || "").toLowerCase();
    const plantBased = /vegan|vegetarian|no meat/.test(dietary);
    const noDairy = /vegan|dairy.free|no dairy|lactose/.test(dietary);
    const noNuts = /nut allergy|no nuts|avoid nuts|peanut|tree nut/.test(dietary);
    const noEggs = /egg allergy|no eggs|avoid eggs/.test(dietary);
    const noGluten = /gluten.free|no gluten|celiac/.test(dietary);
    const quick = profile?.cooking === "Rarely";
    const mealIdeas = [
      noGluten ? noDairy ? "Fruit and a familiar gluten-free breakfast" : "Yogurt and fruit" : noDairy ? "Oats and fruit" : "Yogurt, oats, and fruit",
      plantBased ? "Bean and rice bowl with vegetables" : quick ? "Prepared chicken or bean rice bowl" : "Chicken or bean rice bowl with vegetables",
      plantBased ? "Tofu, potatoes, and greens" : quick ? noEggs || noGluten ? "Tofu, potatoes, and salad" : "Egg or tofu wrap with salad" : "Chicken or tofu, potatoes, and greens",
      noNuts ? "Fruit and a familiar nut-free snack" : "Fruit and nuts or a familiar snack"
    ];
    return { profile, goal, duration, suggestedDuration, days, location, fitness, sessions, volume, adjusted,
      food: profile?.foodHabits || "Your usual meals", dietary: profile?.dietary || "No dietary preferences saved", mealIdeas,
      cooking: profile?.cooking || "Your normal cooking rhythm", sleep: profile?.sleep || null };
  };
  const setPlan = next => {
    if (!member || !validPlans.has(next)) return false;
    const updated = { ...member, plan: next, selectedAt: new Date().toISOString() };
    try {
      localStorage.setItem(memberKey, JSON.stringify(updated));
      sessionStorage.removeItem(memberKey);
      const accountKey = "lift-client-accounts-v1";
      const accounts = readJson(localStorage, accountKey);
      if (Array.isArray(accounts)) {
        const account = accounts.find(item => item.email === member.email);
        if (account) { account.plan = next; localStorage.setItem(accountKey, JSON.stringify(accounts)); }
      }
    }
    catch { sessionStorage.setItem(memberKey, JSON.stringify(updated)); }
    location.reload();
    return true;
  };
  const page = location.pathname.match(/\/Client\/([^/]+)\//)?.[1];
  if (member && plan !== "premium" && ["Coaches", "Nutritionists", "SpecialistDetails"].includes(page)) {
    document.documentElement.dataset.clientRendering = "true";
    document.addEventListener("DOMContentLoaded", () => {
      const main = document.querySelector("main");
      if (!main) return;
      document.documentElement.lang = "en";
      main.dir = "ltr";
      main.className = "tier-page";
      main.innerHTML = '<span class="tier-kicker">PREMIUM SUPPORT</span><h1>Human support is available with Premium.</h1><p>Coach and Nutritionist support is available with Premium. Your current plan still includes its own workout, nutrition, and progress tools.</p><div class="tier-actions"><a class="primary" href="../Subscription/subscription.html">Upgrade your plan ↗</a><a href="../Dashboard/dashboard.html">Back to dashboard</a></div>';
      delete document.documentElement.dataset.clientRendering;
    });
  }
  if (member && plan !== "premium" && ["Dashboard", "Workout", "Nutrition", "Progress", "Messages", "Meetings", "Support", "Profile"].includes(page)) {
    document.documentElement.dataset.clientRendering = "true";
  }
  document.documentElement.dataset.clientPlan = plan;
  window.LiftClientAccess = Object.freeze({ member, plan, preview, labels, ...capabilities, getProfile, isPersonalizationProfileComplete, needsPersonalizationProfile, getActivity, saveActivity, setDone, getStreak, getPlan, setPlan, todayKey, weekKey,
    isFree: () => plan === "free", isAIPlan: () => plan === "ai", isPremium: () => plan === "premium", finishRender: () => { delete document.documentElement.dataset.clientRendering; } });
})();
