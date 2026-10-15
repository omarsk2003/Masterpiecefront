"use strict";

// Theme preference and admin-approved site appearance are stored locally.
(() => {
  const key = "lift-color-theme";
  let theme = "dark";
  try {
    const saved = localStorage.getItem(key);
    if (saved === "light" || saved === "dark") theme = saved;
  } catch {
    // Storage can be unavailable when previewing local files.
  }

  function syncButtons() {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const next = theme === "dark" ? "light" : "dark";
      button.setAttribute("aria-label", `Switch to ${next} mode`);
      button.setAttribute("title", `Switch to ${next} mode`);
      const icon = button.querySelector("[data-theme-icon]");
      if (icon) icon.textContent = theme === "dark" ? "☼" : "☾";
    });
  }

  function setTheme(next) {
    if (next !== "light" && next !== "dark") return;
    theme = next;
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "light" ? "#F5F7F1" : "#07100D";
    try { localStorage.setItem(key, theme); } catch { /* UI still switches. */ }
    syncButtons();
    document.dispatchEvent(new CustomEvent("lift:theme-change", { detail: { theme } }));
  }

  // Apply before the body paints so navigation does not flash the wrong theme.
  document.documentElement.dataset.theme = theme;
  const initialMeta = document.querySelector('meta[name="theme-color"]');
  if (initialMeta) initialMeta.content = theme === "light" ? "#F5F7F1" : "#07100D";
  window.LiftTheme = { get: () => theme, set: setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-theme-toggle]")) window.LiftTheme.toggle();
  });

  document.addEventListener("DOMContentLoaded", () => {
    // Structural placeholder pages have no navigation yet.
    if (!document.querySelector("[data-theme-toggle]")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "floating-theme-toggle";
      button.setAttribute("data-theme-toggle", "");
      button.innerHTML = '<span data-theme-icon aria-hidden="true"></span>';
      document.body.append(button);
    }
    syncButtons();
  });
})();

// Admin-managed theme colors and selected landing-page copy.
(() => {
  const storageKey = "lift-site-settings-v1";
  const colorDefaults = {
    dark: { background: "#07100D", surface: "#0F1E18", accent: "#00E894", text: "#F2F5F1" },
    light: { background: "#F5F7F1", surface: "#FFFFFF", accent: "#2F6845", text: "#0A1711" }
  };
  const oldColorDefaults = {
    dark: { background: "#0D1613", surface: "#162822", accent: "#00F59B", text: "#FFFFFF" },
    light: { background: "#F8FAFA", surface: "#FFFFFF", accent: "#00F59B", text: "#0D1613" }
  };
  const copyFields = [
    { key: "heroKicker", section: "Hero", label: "Eyebrow", value: "LIFT / LIFESTYLE & INTELLIGENT FITNESS TECHNOLOGY" },
    { key: "heroTitleTop", section: "Hero", label: "Headline · first line", value: "YOUR LIFE" },
    { key: "heroTitleAccent", section: "Hero", label: "Headline · accent line", value: "SETS THE PACE." },
    { key: "heroDescription", section: "Hero", label: "Description", value: "Fitness should fit the life you live. LIFT turns your goals, schedule and daily reality into a plan that moves with you.", multiline: true },
    { key: "dayTitleTop", section: "Your day", label: "Headline · first line", value: "REAL LIFE IS" },
    { key: "dayTitleAccent", section: "Your day", label: "Headline · second line", value: "THE INPUT." },
    { key: "dayDescription", section: "Your day", label: "Description", value: "Home. Work. Movement. Food. Rest. We start with the whole day, because a plan only works when it has room to live.", multiline: true },
    { key: "goalsTitleTop", section: "Your direction", label: "Headline · first line", value: "YOU SET THE" },
    { key: "goalsTitleMiddle", section: "Your direction", label: "Headline · second line", value: "DIRECTION." },
    { key: "goalsTitleAccent", section: "Your direction", label: "Headline · accent line", value: "LIFT BUILDS THE WAY." },
    { key: "goalsDescription", section: "Your direction", label: "Description", value: "Different goals. Different starting points. One system that adapts to you.", multiline: true },
    { key: "inputsTitleTop", section: "How LIFT builds your plan", label: "Headline · first line", value: "YOUR LIFE IN." },
    { key: "inputsTitleAccent", section: "How LIFT builds your plan", label: "Headline · accent line", value: "YOUR PLAN OUT." },
    { key: "inputsDescription", section: "How LIFT builds your plan", label: "Description", value: "Tell LIFT about your goals, schedule, sleep, health, food habits and where you train. LIFT turns those details into a workout and nutrition plan built around your real life.", multiline: true },
    { key: "pillarsTitleTop", section: "Whole life approach", label: "Headline · first line", value: "MOVE. FUEL." },
    { key: "pillarsTitleAccent", section: "Whole life approach", label: "Headline · second line", value: "RECOVER. GROW." },
    { key: "pillarsDescription", section: "Whole life approach", label: "Description", value: "Training, nutrition, recovery and progress belong in one rhythm. Each part informs the next.", multiline: true },
    { key: "expertsTitleTop", section: "Experts", label: "Headline · first line", value: "TECHNOLOGY" },
    { key: "expertsTitleAccent", section: "Experts", label: "Headline · second line", value: "WITH PEOPLE IN IT." },
    { key: "expertsDescription", section: "Experts", label: "Description", value: "AI builds and adapts the foundation. With Premium, a coach can focus on training and a nutritionist can focus on food. You stay at the center of every decision.", multiline: true },
    { key: "ctaTitleTop", section: "Final call to action", label: "Headline · first line", value: "ONE LIFE." },
    { key: "ctaTitleAccent", section: "Final call to action", label: "Headline · accent line", value: "A PLAN BUILT AROUND IT." },
    { key: "ctaDescription", section: "Final call to action", label: "Description", value: "Start where you are. LIFT will meet you there.", multiline: true },
    { key: "plansTitleTop", section: "Plans overview", label: "Headline · first part", value: "See how the plans" },
    { key: "plansTitleAccent", section: "Plans overview", label: "Headline · accent part", value: "compare." },
    { key: "plansDescription", section: "Plans overview", label: "First paragraph", value: "Free covers tracking and general guidance. AI Plan adds personalized workout and nutrition plans shaped by your goals, schedule and progress.", multiline: true },
    { key: "plansDescriptionMore", section: "Plans overview", label: "Second paragraph", value: "Premium includes everything in AI Plan, plus a coach and nutritionist who review and support your plan.", multiline: true },
    { key: "freePlanTitle", section: "Free Plan", label: "Heading", value: "Build your foundation." },
    { key: "freePlanDescription", section: "Free Plan", label: "First paragraph", value: "Free Plan gives you a simple place to build consistency. You can record workouts and meals, follow your activity, and see how your progress changes over time. The workout and nutrition areas offer general guidance that helps you start and maintain a routine.", multiline: true },
    { key: "freePlanLimit", section: "Free Plan", label: "Second paragraph", value: "This plan works without a detailed lifestyle profile. Its guidance stays broad, so it does not create a workout or nutrition plan around your personal schedule, goals, or food preferences. A coach and nutritionist are not part of this level.", multiline: true },
    { key: "aiPlanTitle", section: "AI Plan", label: "Heading", value: "Make the plan yours." },
    { key: "aiPlanDescription", section: "AI Plan", label: "First paragraph", value: "AI Plan includes the activity and progress tools in Free Plan, then adds personalization. When you first use the AI Assistant, you provide your goals, fitness level, available days and time, training location, health considerations, and food habits. LIFT uses that context to shape workout and nutrition plan previews for your routine.", multiline: true },
    { key: "aiPlanLimit", section: "AI Plan", label: "Second paragraph", value: "As your schedule or progress changes, the guidance can reflect the details you have saved and the activity you log. You can update your context in the AI Assistant whenever your routine changes. This level gives you personalized AI guidance without professional review or specialist conversations.", multiline: true },
    { key: "premiumPlanTitle", section: "Premium", label: "Heading", value: "Add people to your plan." },
    { key: "premiumPlanDescription", section: "Premium", label: "First paragraph", value: "Premium includes the personalized AI experience and adds professional support. A coach focuses on your training plan, while a nutritionist focuses on your food plan. They can review the relevant guidance and help you adjust it when your needs change.", multiline: true },
    { key: "premiumPlanDetails", section: "Premium", label: "Second paragraph", value: "You can message each specialist separately about your training or nutrition. Your coach can also propose a meeting time, which you can accept or decline in the Meetings page. Premium is for people who want human guidance alongside the AI plan.", multiline: true },
    { key: "aboutTitleTop", section: "About teaser", label: "Headline · first part", value: "Fitness that starts" },
    { key: "aboutTitleAccent", section: "About teaser", label: "Headline · accent part", value: "with your life." },
    { key: "aboutDescription", section: "About teaser", label: "Description", value: "LIFT — Lifestyle & Intelligent Fitness Technology — is a personalized fitness and nutrition platform built around the way you actually live.", multiline: true },
    { key: "contactTitleTop", section: "Contact teaser", label: "Headline · first part", value: "Questions?" },
    { key: "contactTitleAccent", section: "Contact teaser", label: "Headline · accent part", value: "We’re here to help." },
    { key: "contactDescription", section: "Contact teaser", label: "Description", value: "Have a question about LIFT, your plan, or support options? Get in touch with us.", multiline: true }
  ];
  const defaults = () => ({
    copyVersion: 2,
    colors: { dark: { ...colorDefaults.dark }, light: { ...colorDefaults.light } },
    copy: Object.fromEntries(copyFields.map(field => [field.key, field.value]))
  });
  const validColor = value => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  function clean(input) {
    const next = defaults();
    for (const mode of ["dark", "light"]) {
      for (const token of ["background", "surface", "accent", "text"]) {
        const value = input?.colors?.[mode]?.[token];
        if (validColor(value) && value.toUpperCase() !== oldColorDefaults[mode][token]) next.colors[mode][token] = value.toUpperCase();
      }
    }
    if (input?.copyVersion === 2) {
      for (const field of copyFields) {
        const value = input?.copy?.[field.key];
        if (typeof value === "string" && value.trim()) next.copy[field.key] = value.trim().slice(0, field.multiline ? 500 : 140);
      }
    }
    return next;
  }
  let settings = defaults();
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) settings = clean(JSON.parse(stored));
  } catch { /* Use the original design if storage is unavailable. */ }
  const colorProperties = ["--bg", "--deep", "--surface", "--surface-2", "--panel", "--panel-2", "--input", "--text", "--text-primary", "--accent", "--brand", "--brand-hover", "--green", "--nav-bg"];
  function applyColors() {
    const style = document.documentElement.style;
    colorProperties.forEach(property => style.removeProperty(property));
    const mode = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const palette = settings.colors[mode];
    const customized = Object.keys(palette).some(key => palette[key].toLowerCase() !== colorDefaults[mode][key].toLowerCase());
    document.documentElement.dataset.siteCustom = String(customized);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = customized ? palette.background : mode === "light" ? "#F5F7F1" : "#07100D";
    if (!customized) return;
    style.setProperty("--bg", palette.background);
    style.setProperty("--deep", palette.background);
    style.setProperty("--surface", palette.surface);
    style.setProperty("--surface-2", `color-mix(in srgb, ${palette.surface} 85%, ${palette.accent})`);
    style.setProperty("--panel", palette.surface);
    style.setProperty("--panel-2", `color-mix(in srgb, ${palette.surface} 85%, ${palette.accent})`);
    style.setProperty("--input", palette.surface);
    style.setProperty("--text", palette.text);
    style.setProperty("--text-primary", palette.text);
    style.setProperty("--accent", palette.accent);
    style.setProperty("--brand", palette.accent);
    style.setProperty("--brand-hover", `color-mix(in srgb, ${palette.accent} 82%, ${palette.background})`);
    style.setProperty("--green", palette.accent);
    style.setProperty("--nav-bg", `color-mix(in srgb, ${palette.background} 90%, ${palette.text})`);
  }
  function applyCopy() {
    document.querySelectorAll("[data-site-copy]").forEach(node => {
      const value = settings.copy[node.dataset.siteCopy];
      if (value !== undefined) node.textContent = value;
    });
  }
  function save(input) {
    const next = clean(input);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { return false; }
    settings = next;
    applyColors();
    applyCopy();
    document.dispatchEvent(new Event("lift:site-settings-change"));
    return true;
  }
  function reset() {
    try { localStorage.removeItem(storageKey); }
    catch { return false; }
    settings = defaults();
    applyColors();
    applyCopy();
    document.dispatchEvent(new Event("lift:site-settings-change"));
    return true;
  }
  window.LiftSiteSettings = { get: () => clean(settings), defaults, copyFields, save, reset };
  applyColors();
  document.addEventListener("lift:theme-change", applyColors);
  window.addEventListener("storage", event => {
    if (event.key !== storageKey) return;
    try { settings = event.newValue ? clean(JSON.parse(event.newValue)) : defaults(); }
    catch { settings = defaults(); }
    applyColors();
    applyCopy();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyCopy);
  else applyCopy();
})();
