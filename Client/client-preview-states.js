"use strict";

/* Reusable subscription views over one Client shell and one local activity store. */
(() => {
  const access = window.LiftClientAccess;
  if (!access) return;
  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = String(text);
    return element;
  };
  const activity = () => access.getActivity();
  const count = group => Object.values(activity()[group] || {}).filter(Boolean).length;
  const action = (label, href, primary = false) => {
    const anchor = make("a", primary ? "primary" : "", label + " ↗");
    anchor.href = href;
    return anchor;
  };
  const actions = (...anchors) => {
    const row = make("div", "tier-actions");
    row.append(...anchors);
    return row;
  };
  const card = (kicker, title, body, wide = false) => {
    const section = make("section", "tier-card" + (wide ? " wide" : ""));
    section.append(make("span", "tier-kicker", kicker), make("h2", "", title), make("p", "", body));
    return section;
  };
  const shell = (main, kicker, title, description) => {
    main.className = "tier-page";
    main.replaceChildren();
    const header = make("header", "tier-header");
    const heading = make("div");
    heading.append(make("span", "tier-kicker", kicker), make("h1", "", title), make("p", "", description));
    header.append(heading, make("span", "tier-badge", access.labels[access.plan]));
    const grid = make("div", "tier-grid");
    main.append(header, grid, make("p", "tier-footnote", "Frontend preview · Activity is stored in this browser. Live AI generation and account sync will connect later."));
    access.finishRender();
    return grid;
  };
  const stat = value => make("strong", "tier-stat", value);
  const progress = percent => {
    const track = make("div", "tier-progress");
    track.setAttribute("aria-hidden", "true");
    const fill = make("span");
    fill.style.width = percent + "%";
    track.append(fill);
    return track;
  };

  function renderDashboard() {
    if (access.isPremium()) return false;
    const main = document.querySelector(".dashboard-grid");
    if (!main) return false;
    const p = access.getPlan(), workouts = count("workouts"), meals = count("meals");
    const name = access.member.name?.split(" ")[0] || "there";
    const grid = shell(main, access.plan === "free" ? "YOUR SPACE / FREE PLAN" : "YOUR SPACE / AI PLAN", "Welcome, " + name + ".", access.plan === "free" ? "Build consistency with movement, food check-ins, and progress." : "Your plan follows your saved context and the progress you record here.");
    if (access.plan === "free") {
      const movement = card("ACTIVITY", "Movement logged", "Completed basic workouts.");
      movement.append(stat(workouts), actions(action("Open workouts", "../Workout/workout.html", true)));
      const food = card("DAILY HABITS", "Food and progress", meals + " meal check-ins saved on this device.");
      food.append(actions(action("Nutrition basics", "../Nutrition/nutrition.html"), action("View progress", "../Progress/progress.html")));
      const guidance = card("GUIDANCE", "Keep the next step small", "Choose a realistic movement window and keep a simple record of what works for you.");
      guidance.append(actions(action("General guidance", "../AIAssistant/ai-assistant.html")));
      const streak = card("CONSISTENCY", "Current activity streak", "Days in a row with a workout or meal check-in on this device.");
      streak.append(stat(access.getStreak() + (access.getStreak() === 1 ? " day" : " days")));
      const upgrade = card("WHEN YOU ARE READY", "Make your plan personal.", "Let LIFT use your goals, schedule, lifestyle, and progress to build and adapt your plan.");
      upgrade.append(actions(action("Upgrade to AI Plan", "../Subscription/subscription.html")));
      grid.append(movement, food, guidance, streak, upgrade);
    } else {
      const ready = Boolean(p.profile?.completed);
      const status = ready ? card("PLAN STATUS", "Your personal plan is ready", [p.goal, p.days.length + " available days", p.duration + " min", p.location].join(" · "), true) : null;
      if (ready) status.append(actions(action("Review AI plan", "../Workout/workout.html", true)));
      const training = card("TODAY'S AI WORKOUT", ready ? p.sessions[0] : "Your training", ready ? p.suggestedDuration + " minutes · " + p.location + " · " + p.volume + ". Based on your saved goal and fitness level." : "Open your workout area to see your sessions.");
      training.append(stat(workouts), actions(action("View workout", "../Workout/workout.html")));
      const nutrition = card("NUTRITION GUIDANCE", ready ? p.mealIdeas[1] : "Your nutrition", ready ? "Meal ideas follow your food habits and preferences. " + meals + " meal moments logged." : "Open your nutrition area to see food guidance.");
      nutrition.append(stat(meals), actions(action("View nutrition", "../Nutrition/nutrition.html")));
      const recommendation = card("TODAY'S RECOMMENDATION", "A manageable next step", ready ? p.adjusted + " Your usual window is " + p.duration + " minutes at " + p.location + "." : "Ask LIFT Engine for guidance when you are ready.", true);
      recommendation.append(actions(action("Ask LIFT Engine", "../AIAssistant/ai-assistant.html", true)));
      const tracking = card("PROGRESS", "See the pattern", "Your workout and meal check-ins are saved here.");
      tracking.append(actions(action("Track progress", "../Progress/progress.html")));
      const adaptation = card("PLAN ADAPTATION", ready ? "Adjusted to your current context" : "Ready when you are", ready ? p.adjusted : "Your saved sleep, available time, fitness level, and logged progress can shape the next suggestion.");
      const premium = card("OPTIONAL SUPPORT", "Add human expertise.", "Keep your AI-powered plan and add Coach and Nutritionist support.");
      premium.append(actions(action("Explore Premium", "../Subscription/subscription.html")));
      grid.append(...(status ? [status] : []), training, nutrition, recommendation, tracking, adaptation, premium);
    }
    return true;
  }

  function renderWorkout(main) {
    const p = access.getPlan(), ai = access.canUseAdvancedAI;
    const week = access.weekKey();
    const sessions = ai ? p.days.slice(0, 4).map((day, index) => ({ id: week + "-ai-" + day + "-" + index, day, title: p.sessions[index % p.sessions.length] }))
      : ["Movement basics", "Gentle cardio", "Mobility and recovery"].map((title, index) => ({ id: week + "-free-" + index, day: ["Mon", "Wed", "Fri"][index], title }));
    const draw = () => {
      const done = sessions.filter(item => activity().workouts?.[item.id]).length;
      const grid = shell(main, ai ? "AI PLAN / WORKOUT" : "FREE PLAN / WORKOUT", ai ? "Training built around your day." : "Keep moving, one session at a time.", ai ? (p.profile?.completed ? [p.goal, p.location, p.duration + " minutes available"].join(" · ") + ". Edit your profile to adjust the outline." : "Complete your lifestyle profile for personalized sessions.") : "A basic weekly routine you can follow at your own pace.");
      const week = card("THIS WEEK", done + " of " + sessions.length + " sessions completed", ai ? p.volume + " per session · " + p.suggestedDuration + " minutes suggested · " + p.location : "Choose a comfortable effort and mark each session when done.", true);
      week.append(progress(Math.round(done / sessions.length * 100)));
      const list = make("ul", "tier-list");
      sessions.forEach(item => {
        const row = make("li"), description = make("span");
        description.append(make("strong", "", item.day + " · " + item.title), make("br"), make("small", "", ai ? p.suggestedDuration + " min · " + p.location : "20–25 min · at your pace"));
        const button = make("button", "", activity().workouts?.[item.id] ? "✓ Completed" : "Mark complete");
        button.type = "button";
        button.setAttribute("aria-pressed", String(Boolean(activity().workouts?.[item.id])));
        button.addEventListener("click", () => { const completing = button.getAttribute("aria-pressed") !== "true"; if (!access.setDone("workouts", item.id, completing)) return window.LiftNotice.error("Could not update this workout on this device."); draw(); window.LiftNotice.success(`${item.title} ${completing ? "completed" : "marked incomplete"}.`); });
        row.append(description, button);
        list.append(row);
      });
      week.append(list);
      grid.append(week);
    };
    draw();
  }

  function renderNutrition(main) {
    const p = access.getPlan(), ai = access.canUseAdvancedAI, occasions = ["Breakfast", "Lunch", "Dinner", "Snack"];
    const key = name => access.todayKey() + "-" + name;
    const draw = () => {
      const done = occasions.filter(name => activity().meals?.[key(name)]).length;
      const grid = shell(main, ai ? "AI PLAN / NUTRITION" : "FREE PLAN / NUTRITION", ai ? "Food guidance for your routine." : "Build a simple food rhythm.", ai ? (p.profile?.completed ? p.goal + " · " + p.food + " · " + p.cooking + ". Edit your profile to refresh the guidance." : "Add your food habits and goals in your profile for tailored guidance.") : "Log meal moments and use broad guidance without a personalized target.");
      const checkIn = card("TODAY'S CHECK-IN", done + " of " + occasions.length + " meal moments logged", ai ? "Meal ideas follow your goal, cooking rhythm, and saved preferences. Live nutrition targets will connect when the planning service is available." : "A meal check-in records that you ate; it does not judge what you ate.", true);
      checkIn.append(progress(done * 25));
      const list = make("ul", "tier-list");
      occasions.forEach((name, index) => {
        const row = make("li"), button = make("button", "", activity().meals?.[key(name)] ? "✓ Logged" : "Log meal");
        button.type = "button";
        button.setAttribute("aria-pressed", String(Boolean(activity().meals?.[key(name)])));
        button.addEventListener("click", () => { const logging = button.getAttribute("aria-pressed") !== "true"; if (!access.setDone("meals", key(name), logging)) return window.LiftNotice.error("Could not update this meal on this device."); draw(); window.LiftNotice.success(`${name} ${logging ? "logged" : "removed from today's log"}.`); });
        const description = make("span");
        description.append(make("strong", "", name));
        if (ai) description.append(make("br"), make("small", "", p.mealIdeas[index]));
        row.append(description, button);
        list.append(row);
      });
      checkIn.append(list);
      const context = card(ai ? "YOUR FOOD CONTEXT" : "EVERYDAY BASICS", ai ? "What your plan considers" : "Keep it practical", ai ? "Food habits: " + p.food + ". Cooking: " + p.cooking + ". Dietary preferences: " + p.dietary + "." : "Include foods you enjoy, keep water nearby, and aim for regular meals when your day allows.");
      context.append(actions(action(ai ? "Open AI Assistant" : "See progress", ai ? "../AIAssistant/ai-assistant.html" : "../Progress/progress.html")));
      grid.append(checkIn, context);
    };
    draw();
  }

  function renderProgress(main) {
    const draw = () => {
      const grid = shell(main, access.labels[access.plan].toUpperCase() + " / PROGRESS", "See how your routine adds up.", "Movement and food check-ins stay together in this browser preview.");
      const workout = card("WORKOUTS", "Movement completed", "Sessions you marked complete.");
      workout.append(stat(count("workouts")), actions(action("Open workout", "../Workout/workout.html")));
      const meals = card("NUTRITION", "Meal check-ins", "Meal moments you recorded today.");
      meals.append(stat(count("meals")), actions(action("Open nutrition", "../Nutrition/nutrition.html")));
      grid.append(workout, meals);
    };
    draw();
  }

  function renderRestricted(main, page) {
    const grid = shell(main, "PREMIUM SUPPORT", page === "messages" ? "Professional messages are part of Premium." : "Specialist meetings are part of Premium.", "Your current plan includes platform support. Coach and nutritionist conversations become available with Premium.");
    const support = card("NEED HELP?", "Platform support is here", "Ask about your account or report a technical issue.", true);
    support.append(actions(action("Contact support", "../Support/support.html", true), action("Upgrade your plan", "../Subscription/subscription.html")));
    grid.append(support);
  }

  window.LiftClientTierUI = { renderDashboard };
  document.addEventListener("DOMContentLoaded", () => {
    if (access.isPremium()) return;
    const page = location.pathname.split("/").at(-1)?.replace(".html", "");
    const main = document.querySelector("main");
    if (!main) return;
    if (page === "workout") renderWorkout(main);
    else if (page === "nutrition") renderNutrition(main);
    else if (page === "messages" || page === "meetings") renderRestricted(main, page);
  });
})();
