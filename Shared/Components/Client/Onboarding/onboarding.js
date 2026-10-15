"use strict";

// Shared controller: steps stay in one document so Back preserves form fields.
// No localStorage, sessionStorage, cookies, fetch, JSON files or backend calls.
window.LiftOnboarding = (() => {
  const views = [...document.querySelectorAll("[data-step]")];
  const nav = [...document.querySelectorAll("[data-nav-step]")];
  const sidebar = document.getElementById("onboarding-sidebar");
  const labels = ["CREATE YOUR ACCOUNT", "ONBOARDING: FITNESS PROFILE", "ONBOARDING: HEALTH & LIFESTYLE", "SUBSCRIPTION SELECTION"];
  const hashes = ["account", "personal", "health", "plans"];
  const validators = [];
  let reached = 0;

  function goTo(index, focus = true) {
    reached = Math.max(reached, index);
    views.forEach(view => { view.hidden = Number(view.dataset.step) !== index; });
    sidebar.hidden = index === 0;
    document.getElementById("flow-label").textContent = labels[index];
    nav.forEach(button => {
      const number = Number(button.dataset.navStep);
      button.disabled = number > reached;
      button.classList.toggle("completed", number < index);
      button.querySelector("span").textContent = number < index ? "✓" : String(number);
      if (number === index) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    history.replaceState(null, "", "#" + hashes[index]);
    document.title = ["Create your account", "Fitness profile", "Health & lifestyle", "Choose your plan"][index] + " | LIFT";
    window.scrollTo({ top: 0, behavior: "instant" });
    if (focus) views[index].querySelector("h1, h2").focus({ preventScroll: true });
  }

  function fieldError(id, text) {
    const input = document.getElementById(id);
    const error = document.getElementById(id + "-error");
    if (error) error.textContent = text;
    if (input) {
      input.setAttribute("aria-invalid", String(Boolean(text)));
      input.setAttribute("aria-describedby", id + "-error");
    }
    return !text;
  }

  function groupError(form, name, text) {
    document.getElementById(name + "-error").textContent = text;
    form.querySelectorAll('[name="' + name + '"]').forEach(input => {
      input.setAttribute("aria-invalid", String(Boolean(text)));
      input.setAttribute("aria-describedby", name + "-error");
    });
    return !text;
  }

  function numberField(id, label) {
    const input = document.getElementById(id);
    let error = "";
    if (input.validity.badInput || input.value === "") error = "Enter " + label + ".";
    else if (!input.validity.valid) error = "Enter a value from " + input.min + " to " + input.max + " (step " + input.step + ").";
    return fieldError(id, error);
  }

  function requireGroup(form, name, label) {
    return groupError(form, name, form.querySelector('[name="' + name + '"]:checked') ? "" : "Choose " + label + ".");
  }

  function focusInvalid(form) {
    form.querySelector('[aria-invalid="true"]')?.focus();
  }

  document.querySelectorAll("[data-back]").forEach(button => button.addEventListener("click", () => goTo(Number(button.dataset.back))));
  nav.forEach(button => button.addEventListener("click", () => goTo(Number(button.dataset.navStep))));
  document.querySelectorAll("input, textarea").forEach(input => {
    const clearError = () => {
      if (input.id && document.getElementById(input.id + "-error")) fieldError(input.id, "");
      else if (input.name && document.getElementById(input.name + "-error")) groupError(input.form, input.name, "");
    };
    input.addEventListener("input", clearError);
    input.addEventListener("change", clearError);
    if (input.id && document.getElementById(input.id + "-error")) input.setAttribute("aria-describedby", input.id + "-error");
  });

  document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));

  // Direct links are useful for previewing individual designs. Finishing still
  // validates all four steps; a URL hash cannot bypass incomplete account fields.
  const initial = hashes.indexOf(location.hash.slice(1));
  goTo(initial >= 0 ? initial : 0, false);
  return { goTo, fieldError, groupError, numberField, requireGroup, focusInvalid, validators };
})();

