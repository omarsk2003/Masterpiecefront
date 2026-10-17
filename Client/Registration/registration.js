"use strict";

// Frontend preview: only a salted password digest is stored for local sign-in.
(() => {
  const form = document.getElementById("account-form");
  const name = document.getElementById("full-name");
  const email = document.getElementById("register-email");
  const password = document.getElementById("register-password");
  const confirmation = document.getElementById("confirm-password");
  const terms = document.getElementById("terms");
  const visual = document.querySelector(".activation-scene");
  function fieldError(id, text) {
    const input = document.getElementById(id);
    input.setAttribute("aria-invalid", String(Boolean(text)));
    document.getElementById(id + "-error").textContent = text;
    return !text;
  }
  function syncVisual() {
    const progress = [name.value.trim().length >= 2, email.validity.valid && !!email.value,
      password.value.length >= 8, !!confirmation.value && confirmation.value === password.value,
      terms.checked].reduce((count, passed) => count + Number(passed), 0);
    visual.dataset.progress = String(progress);
    visual.querySelector(".activation-top span:last-child").textContent = `${String(progress).padStart(2, "0")} / 05`;
    visual.querySelectorAll(".activation-segment,.activation-point,.activation-end,.activation-label").forEach(item => {
      const index = Number(item.getAttribute("class")?.match(/(?:segment|point|label)-(\d)/)?.[1] || (item.classList.contains("activation-end") ? 5 : 0));
      item.classList.toggle("active", index > 0 && index <= progress);
    });
  }
  [name, email, password, confirmation].forEach(input => input.addEventListener("input", () => {
    fieldError(input.id, ""); syncVisual();
  }));
  terms.addEventListener("change", () => { fieldError("terms", ""); syncVisual(); });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    name.value = name.value.trim(); email.value = email.value.trim();
    const checks = [
      fieldError("full-name", name.value.length < 2 ? "Enter your full name." : ""),
      fieldError("register-email", !email.value ? "Enter your email address." : email.validity.typeMismatch ? "Enter a valid email address." : ""),
      fieldError("register-password", password.value.length < 8 ? "Use at least 8 characters." : ""),
      fieldError("confirm-password", !confirmation.value ? "Confirm your password." : confirmation.value !== password.value ? "Passwords do not match." : ""),
      fieldError("terms", terms.checked ? "" : "Review and accept the preview terms to continue.")
    ];
    if (checks.includes(false)) { form.querySelector('[aria-invalid="true"]')?.focus(); window.LiftNotice.warning("Please correct the highlighted fields."); return; }
    const address = email.value.toLowerCase();
    if (["client@lift.demo", "client.free@lift.demo", "client.ai@lift.demo", "coach@lift.demo", "nutritionist@lift.demo", "admin@lift.demo"].includes(address) || window.LiftClientAccounts.find(address)) {
      fieldError("register-email", "An account with this email already exists.");
      window.LiftNotice.warning("An account with this email already exists.");
      email.focus();
      return;
    }
    try {
      const credential = await window.LiftClientAccounts.createCredential(password.value);
      const createdAt = new Date().toISOString();
      const member = { name: name.value, email: address, plan: "free", createdAt, selectedAt: createdAt, requiresPersonalization: true, preview: true };
      window.LiftClientAccounts.save({ ...member, ...credential });
      localStorage.setItem("lift-preview-member-v1", JSON.stringify(member));
    } catch {
      fieldError("register-email", "Local account storage is unavailable. Open LIFT on a local server and try again.");
      window.LiftNotice.error("Could not create the account on this device.");
      return;
    }
    visual.dataset.progress = "complete";
    visual.querySelector(".activation-top span:last-child").textContent = "READY / 05";
    visual.querySelectorAll(".activation-segment,.activation-point,.activation-end,.activation-label").forEach(item => item.classList.add("active"));
    form.querySelector('button[type="submit"]').disabled = true;
    window.LiftNotice.flash("Account created. Welcome to LIFT.");
    window.setTimeout(() => location.assign("../Dashboard/dashboard.html"), 650);
  });
  document.querySelectorAll("[data-password]").forEach(button => button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.password);
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", (visible ? "Hide " : "Show ") + (input === confirmation ? "confirmation password" : "password"));
  }));
  const dialog = document.getElementById("terms-dialog");
  document.getElementById("open-terms").addEventListener("click", () => dialog.showModal());
  dialog.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => dialog.close()));
  syncVisual();
})();
