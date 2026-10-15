"use strict";

(() => {
  const ui = window.LiftOnboarding;
  const form = document.getElementById("personal-form");
  const sportField = document.getElementById("sport-field");
  form.querySelectorAll('[name="goal"]').forEach(input => input.addEventListener("change", () => {
    const performance = form.querySelector('[name="goal"]:checked')?.value === "performance";
    sportField.hidden = !performance;
    if (!performance) ui.groupError(form, "sport", "");
  }));
  function validate() {
    const performance = form.querySelector('[name="goal"]:checked')?.value === "performance";
    const checks = [
      ui.numberField("age", "your age"),
      ui.numberField("weight", "your weight"),
      ui.numberField("height", "your height"),
      ui.requireGroup(form, "goal", "your fitness goal"),
      performance ? ui.requireGroup(form, "sport", "your sport") : ui.groupError(form, "sport", ""),
      ui.requireGroup(form, "experience", "your experience level"),
      ui.requireGroup(form, "location", "your workout location"),
      ui.requireGroup(form, "activity", "your activity level"),
      ui.requireGroup(form, "days", "at least one workout day")
    ];
    if (checks.includes(false)) { ui.focusInvalid(form); return false; }
    return true;
  }
  ui.validators[1] = validate;
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (validate()) ui.goTo(2);
  });
})();


