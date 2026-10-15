"use strict";

// Theme preference and admin-approved site appearance are stored locally.
(() => {
  const key = "lift-landing-test-theme";
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
    if (meta) meta.content = theme === "light" ? "#FFFFFF" : "#090D0E";
    try { localStorage.setItem(key, theme); } catch { /* UI still switches. */ }
    syncButtons();
    document.dispatchEvent(new CustomEvent("lift:theme-change", { detail: { theme } }));
  }

  // Apply before the body paints so navigation does not flash the wrong theme.
  document.documentElement.dataset.theme = theme;
  const initialMeta = document.querySelector('meta[name="theme-color"]');
  if (initialMeta) initialMeta.content = theme === "light" ? "#FFFFFF" : "#090D0E";
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
    dark: { background: "#0D1613", surface: "#162822", accent: "#00F59B", text: "#FFFFFF" },
    light: { background: "#F8FAFA", surface: "#FFFFFF", accent: "#00F59B", text: "#0D1613" }
  };
  const copyFields = [
    { key: "heroKicker", section: "Hero", label: "Eyebrow", value: "INTELLIGENCE MEETS HUMAN POTENTIAL" },
    { key: "heroTitleTop", section: "Hero", label: "Headline · first line", value: "Fitness that" },
    { key: "heroTitleAccent", section: "Hero", label: "Headline · accent line", value: "fits your life." },
    { key: "heroDescription", section: "Hero", label: "Description", value: "LIFT understands your goals, lifestyle, schedule and health to build workout and nutrition plans designed around you — with real experts by your side.", multiline: true },
    { key: "approachTitleTop", section: "Approach", label: "Headline · first line", value: "Life isn't one-size-fits-all." },
    { key: "approachTitleAccent", section: "Approach", label: "Headline · second line", value: "Your plan shouldn't be either." },
    { key: "approachDescription", section: "Approach", label: "Description", value: "Work runs late. Dinner is whatever’s at home. Some days, you only have twenty minutes. LIFT starts with your real life, then builds a way forward.", multiline: true },
    { key: "expertsTitleTop", section: "Experts", label: "Headline · first line", value: "Powered by AI." },
    { key: "expertsTitleAccent", section: "Experts", label: "Headline · second line", value: "Grounded in people." },
    { key: "expertsDescription", section: "Experts", label: "Description", value: "A good plan gets even better with a conversation. Premium connects you with a coach and a nutritionist who review, discuss and refine your plans before approving them.", multiline: true },
    { key: "plansTitleTop", section: "Plans", label: "Headline · first line", value: "Your next chapter." },
    { key: "plansTitleAccent", section: "Plans", label: "Headline · second line", value: "Your kind of support." },
    { key: "plansDescription", section: "Plans", label: "Description", value: "One account. Three ways to move forward." },
    { key: "ctaTitleTop", section: "Final call to action", label: "Headline · first line", value: "Make room" },
    { key: "ctaTitleAccent", section: "Final call to action", label: "Headline · accent line", value: "a better you." }
  ];
  const defaults = () => ({
    colors: { dark: { ...colorDefaults.dark }, light: { ...colorDefaults.light } },
    copy: Object.fromEntries(copyFields.map(field => [field.key, field.value]))
  });
  const validColor = value => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  function clean(input) {
    const next = defaults();
    for (const mode of ["dark", "light"]) {
      for (const token of ["background", "surface", "accent", "text"]) {
        const value = input?.colors?.[mode]?.[token];
        if (validColor(value)) next.colors[mode][token] = value.toUpperCase();
      }
    }
    for (const field of copyFields) {
      const value = input?.copy?.[field.key];
      if (typeof value === "string" && value.trim()) next.copy[field.key] = value.trim().slice(0, field.multiline ? 500 : 140);
    }
    return next;
  }
  let settings = defaults();
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) settings = clean(JSON.parse(stored));
  } catch { /* Use the original design if storage is unavailable. */ }
  const colorProperties = ["--bg", "--deep", "--surface", "--surface-2", "--panel", "--panel-2", "--input", "--text", "--accent", "--green", "--nav-bg"];
  function applyColors() {
    const style = document.documentElement.style;
    colorProperties.forEach(property => style.removeProperty(property));
    const mode = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const palette = settings.colors[mode];
    const customized = Object.keys(palette).some(key => palette[key].toLowerCase() !== colorDefaults[mode][key].toLowerCase());
    document.documentElement.dataset.siteCustom = String(customized);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = customized ? palette.background : mode === "light" ? "#FFFFFF" : "#090D0E";
    if (!customized) return;
    style.setProperty("--bg", palette.background);
    style.setProperty("--deep", palette.background);
    style.setProperty("--surface", palette.surface);
    style.setProperty("--surface-2", `color-mix(in srgb, ${palette.surface} 85%, ${palette.accent})`);
    style.setProperty("--panel", palette.surface);
    style.setProperty("--panel-2", `color-mix(in srgb, ${palette.surface} 85%, ${palette.accent})`);
    style.setProperty("--input", palette.surface);
    style.setProperty("--text", palette.text);
    style.setProperty("--accent", palette.accent);
    if (mode === "dark") style.setProperty("--green", palette.accent);
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
    document.dispatchEvent(new Event("lift:site-settings-change"));
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyCopy);
  else applyCopy();
})();
