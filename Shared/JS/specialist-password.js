"use strict";
(() => {
  const panel = document.querySelector(".account-panel");
  if (!panel) return;
  const role = location.pathname.includes("/Coach/") ? "coach" : "nutritionist";
  const demoEmail = role === "coach" ? "coach@lift.demo" : "nutritionist@lift.demo";
  const email = localStorage.getItem("lift-specialist-session-role") === role ? localStorage.getItem("lift-specialist-session-email") || demoEmail : demoEmail;
  const section = document.createElement("section");
  section.className = "specialist-password";
  section.innerHTML = '<h3>Account security</h3><button type="button" class="password-trigger" id="open-specialist-password">Change password ↗</button>';
  const logout = panel.querySelector(".logout-link");
  if (logout) logout.before(section);
  else panel.append(section);
  const dialog = document.createElement("dialog");
  dialog.className = "password-dialog";
  dialog.setAttribute("aria-labelledby", "specialist-password-title");
  dialog.innerHTML = '<div class="password-dialog-head"><div><p class="eyebrow">ACCOUNT SECURITY</p><h2 id="specialist-password-title">Change password</h2></div><button type="button" class="password-dialog-close" aria-label="Close password dialog">×</button></div><form id="specialist-password-form"><label>Current password<input name="current" type="password" autocomplete="current-password" required></label><label>New password<input name="next" type="password" autocomplete="new-password" minlength="8" required></label><label>Confirm new password<input name="confirm" type="password" autocomplete="new-password" minlength="8" required></label><button type="submit">Save new password ↗</button><p role="status"></p></form>';
  document.body.append(dialog);
  section.querySelector("#open-specialist-password").addEventListener("click", () => { dialog.querySelector("[role=status]").textContent = ""; dialog.showModal(); });
  dialog.querySelector(".password-dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => dialog.querySelector("form").reset());
  dialog.querySelector("form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, status = form.querySelector("[role=status]");
    const current = form.elements.current.value, next = form.elements.next.value;
    if (next !== form.elements.confirm.value || next.length < 8) { status.textContent = "New passwords must match and contain at least 8 characters."; window.LiftNotice.warning(status.textContent); return; }
    try {
      const apps = await window.LiftSpecialistApplications.all();
      const application = apps.find(item => item.email === email);
      const fallback = application ? value => window.LiftSpecialistApplications.verifyCredential(application, value) : "Lift2026!";
      if (!await window.LiftAccountSecurity.change(email, current, next, fallback)) { status.textContent = "Current password is incorrect."; window.LiftNotice.error(status.textContent); return; }
      form.reset(); status.textContent = "Password changed on this device."; window.LiftNotice.success(status.textContent);
    } catch { status.textContent = "Could not save the password in this browser."; window.LiftNotice.error(status.textContent); }
  });
})();
