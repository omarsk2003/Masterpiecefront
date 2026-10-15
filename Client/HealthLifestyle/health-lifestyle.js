"use strict";

(() => {
  const ui = window.LiftOnboarding;
  const form = document.getElementById("health-form");
  const conditions = [...form.querySelectorAll('[name="conditions"]')];
  conditions.forEach(input => input.addEventListener("change", () => {
    if (input.checked && input.value === "none") conditions.forEach(other => { if (other !== input) other.checked = false; });
    else if (input.checked) form.querySelector('[value="none"]').checked = false;
    document.getElementById("health-note-field").hidden = !form.querySelector('[value="other"]').checked;
  }));
  function validate() {
    const checks = [
      ui.requireGroup(form, "conditions", "applicable conditions, or None"),
      ui.numberField("sleep", "your average sleep"),
      ui.numberField("work", "your weekly working hours"),
      ui.requireGroup(form, "duration", "your available workout time"),
      ui.requireGroup(form, "cooking", "your usual cooking or diet style")
    ];
    if (checks.includes(false)) { ui.focusInvalid(form); return false; }
    return true;
  }
  ui.validators[2] = validate;
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (validate()) ui.goTo(3);
  });
})();


