"use strict";

const siteSettings = window.LiftSiteSettings;
const form = document.getElementById("settings-form");
const copyEditor = document.getElementById("copy-editor");
const status = document.getElementById("settings-status");
const modes = ["dark", "light"];
const tokens = ["background", "surface", "accent", "text"];

for (const section of [...new Set(siteSettings.copyFields.map(field => field.section))]) {
  const group = document.createElement("section");
  group.className = "copy-group";
  const header = document.createElement("div");
  header.className = "copy-group-head";
  const heading = document.createElement("h3");
  heading.textContent = section;
  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "reset-button section-reset";
  resetButton.textContent = "Set as default";
  resetButton.setAttribute("aria-label", `Restore default text for ${section}`);
  resetButton.dataset.resetSection = section;
  header.append(heading, resetButton);
  group.append(header);
  const fields = document.createElement("div");
  fields.className = "copy-fields";
  siteSettings.copyFields.filter(field => field.section === section).forEach(field => {
    const label = document.createElement("label");
    label.textContent = field.label;
    const input = document.createElement(field.multiline ? "textarea" : "input");
    input.name = field.key;
    input.required = true;
    input.maxLength = field.multiline ? 500 : 140;
    if (field.multiline) input.rows = 3;
    else input.type = "text";
    label.append(input);
    fields.append(label);
  });
  group.append(fields);
  copyEditor.append(group);
}

function updatePreview(mode) {
  const preview = document.getElementById(mode + "-preview");
  const values = Object.fromEntries(tokens.map(token => [token, form.elements.namedItem(mode + "-" + token).value]));
  preview.style.background = values.background;
  preview.style.color = values.text;
  preview.style.borderColor = values.surface;
  preview.querySelector("i").style.background = values.accent;
  const rgb = [1, 3, 5].map(index => parseInt(values.accent.slice(index, index + 2), 16) / 255);
  const luminance = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  preview.querySelector("i").style.color = luminance > 0.179 ? "#07100D" : "#FFFFFF";
  preview.querySelector("strong").style.background = values.surface;
  preview.querySelector("strong").style.color = values.text;
}

function fillForm(settings) {
  for (const mode of modes) {
    for (const token of tokens) form.elements.namedItem(mode + "-" + token).value = settings.colors[mode][token];
    updatePreview(mode);
  }
  for (const field of siteSettings.copyFields) form.elements.namedItem(field.key).value = settings.copy[field.key];
}

form.addEventListener("input", event => {
  const mode = event.target.name?.split("-")[0];
  if (modes.includes(mode)) updatePreview(mode);
  status.textContent = "Unsaved changes";
});

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const settings = siteSettings.get();
  for (const mode of modes) for (const token of tokens) settings.colors[mode][token] = form.elements.namedItem(mode + "-" + token).value;
  for (const field of siteSettings.copyFields) settings.copy[field.key] = form.elements.namedItem(field.key).value.trim();
  if (siteSettings.save(settings)) { status.textContent = "Saved locally. Open or refresh the landing page to see your changes."; window.LiftNotice.success(status.textContent); }
  else { status.textContent = "Browser storage is unavailable. Your changes could not be saved."; window.LiftNotice.error(status.textContent); }
});

document.getElementById("reset-colors").addEventListener("click", async () => {
  if (!await window.LiftNotice.confirm("Restore the original colors for both themes?", { confirmText: "Restore colors" })) return;
  const settings = siteSettings.get();
  const defaults = siteSettings.defaults();
  settings.colors = defaults.colors;
  if (!siteSettings.save(settings)) {
    status.textContent = "Browser storage is unavailable. Original colors could not be restored.";
    window.LiftNotice.error(status.textContent);
    return;
  }
  for (const mode of modes) {
    for (const token of tokens) form.elements.namedItem(mode + "-" + token).value = defaults.colors[mode][token];
    updatePreview(mode);
  }
  status.textContent = "Original Dark and Light colors restored. Landing page text was not changed.";
  window.LiftNotice.success(status.textContent);
});

copyEditor.addEventListener("click", async event => {
  const button = event.target.closest("[data-reset-section]");
  if (!button) return;
  const section = button.dataset.resetSection;
  if (!await window.LiftNotice.confirm(`Restore the original text in ${section}?`, { confirmText: "Restore text" })) return;
  const settings = siteSettings.get();
  const defaults = siteSettings.defaults();
  const fields = siteSettings.copyFields.filter(field => field.section === section);
  for (const field of fields) settings.copy[field.key] = defaults.copy[field.key];
  if (!siteSettings.save(settings)) {
    status.textContent = "Browser storage is unavailable. Section text could not be restored.";
    window.LiftNotice.error(status.textContent);
    return;
  }
  for (const field of fields) form.elements.namedItem(field.key).value = defaults.copy[field.key];
  status.textContent = `${section} text restored. Colors and other sections were not changed.`;
  window.LiftNotice.success(status.textContent);
});

const menuButton = document.querySelector(".admin-menu-toggle");
menuButton.addEventListener("click", () => {
  const opened = document.querySelector("lift-admin-sidebar").classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(opened));
  menuButton.setAttribute("aria-label", opened ? "Close sidebar" : "Open sidebar");
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelector("lift-admin-sidebar").classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

fillForm(siteSettings.get());

