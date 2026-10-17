"use strict";
(() => {
  const security = window.LiftAccountSecurity;
  const notices = window.LiftNotice;
  const currentEmail = localStorage.getItem("lift-admin-session-email") || "admin@lift.demo";
  const addDialog = document.getElementById("add-admin-dialog");
  const passwordDialog = document.getElementById("admin-password-dialog");
  const initials = name => name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();

  function render() {
    const admins = [{ name: "Admin Root", email: "admin@lift.demo", status: "active", root: true }, ...security.admins()];
    document.getElementById("admin-stat-total").textContent = admins.length;
    for (const state of ["active", "suspended", "blocked"])
      document.getElementById(`admin-stat-${state}`).textContent = admins.filter(admin => admin.status === state).length;
    document.getElementById("admin-list-count").textContent = `${admins.length} ${admins.length === 1 ? "account" : "accounts"}`;
    const list = document.getElementById("admin-list");
    list.replaceChildren();
    for (const admin of admins) {
      const row = document.createElement("article"); row.className = "admin-account-row";
      const avatar = document.createElement("span"); avatar.className = "admin-account-avatar"; avatar.textContent = initials(admin.name);
      const identity = document.createElement("div"); identity.className = "admin-account-identity";
      const name = document.createElement("strong"); name.textContent = `${admin.name}${admin.email === currentEmail ? " · You" : ""}`;
      const email = document.createElement("small"); email.textContent = admin.email;
      identity.append(name, email);
      const badge = document.createElement("span"); badge.className = `admin-account-status ${admin.status}`; badge.textContent = admin.status;
      row.append(avatar, identity, badge);
      if (!admin.root && admin.email !== currentEmail) {
        const actions = document.createElement("div"); actions.className = "admin-account-actions";
        const choices = admin.status === "active" ? [["suspended", "Suspend"], ["blocked", "Block"]]
          : admin.status === "suspended" ? [["active", "Reactivate"], ["blocked", "Block"]]
          : [["active", "Unblock"]];
        for (const [state, label] of choices) {
          const button = document.createElement("button"); button.type = "button"; button.textContent = label;
          button.dataset.status = state;
          button.addEventListener("click", async () => {
            if (state !== "active" && !await notices.confirm(`${label} ${admin.name}'s admin account? They will not be able to sign in until access is restored.`, { confirmText: `${label} account` })) return;
            if (!security.setAdminStatus(admin.email, state)) return notices.error("Could not update this admin account.");
            render();
            notices[state === "active" ? "success" : "warning"](`${admin.name}'s account is now ${state}.`);
          });
          actions.append(button);
        }
        row.append(actions);
      }
      list.append(row);
    }
  }

  document.getElementById("open-add-admin").addEventListener("click", () => {
    document.getElementById("add-status").textContent = "";
    addDialog.showModal();
    addDialog.querySelector('input[name="name"]').focus();
  });
  document.getElementById("close-add-admin").addEventListener("click", () => addDialog.close());
  addDialog.addEventListener("click", event => { if (event.target === addDialog) addDialog.close(); });
  addDialog.addEventListener("close", () => document.getElementById("add-admin-form").reset());
  document.getElementById("add-admin-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, status = document.getElementById("add-status");
    if (!form.reportValidity()) return;
    let added;
    try { added = await security.addAdmin(form.elements.namedItem("name").value, form.elements.namedItem("email").value, form.elements.namedItem("password").value); }
    catch { status.textContent = "Could not add the admin on this device."; notices.error(status.textContent); return; }
    if (!added) { status.textContent = "This admin email already exists or the password is too short."; notices.warning(status.textContent); return; }
    addDialog.close();
    render();
    notices.success("Admin account created. They can sign in with the new password.");
  });

  document.getElementById("open-admin-password").addEventListener("click", () => {
    document.getElementById("password-status").textContent = "";
    passwordDialog.showModal();
  });
  document.getElementById("close-admin-password").addEventListener("click", () => passwordDialog.close());
  passwordDialog.addEventListener("click", event => { if (event.target === passwordDialog) passwordDialog.close(); });
  passwordDialog.addEventListener("close", () => document.getElementById("admin-password-form").reset());
  document.getElementById("admin-password-form").addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget, status = document.getElementById("password-status");
    if (form.elements.next.value !== form.elements.confirm.value) { status.textContent = "New passwords do not match."; notices.warning(status.textContent); return; }
    const admin = security.admins().find(item => item.email === currentEmail);
    const fallback = admin ? value => security.verifyAdmin(currentEmail, value) : "Lift2026!";
    let changed;
    try { changed = await security.change(currentEmail, form.elements.current.value, form.elements.next.value, fallback); }
    catch { status.textContent = "Could not change the password on this device."; notices.error(status.textContent); return; }
    status.textContent = changed ? "Password changed on this device." : "Current password is incorrect.";
    notices[changed ? "success" : "error"](status.textContent);
    if (changed) form.reset();
  });

  const toggle = document.querySelector(".admin-menu-toggle");
  toggle.addEventListener("click", () => { const open = document.querySelector("lift-admin-sidebar").classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); });
  window.addEventListener("storage", event => { if (event.key === window.LiftAccountStatus.key || event.key === "lift-admin-accounts-v1") render(); });
  render();
})();
