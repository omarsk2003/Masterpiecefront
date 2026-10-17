"use strict";

(() => {
  const memberKey = "lift-preview-member-v1";
  const avatarKey = email => `lift-client-avatar-${email}`;
  const initials = name => name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();

  function render(member) {
    const page = document.querySelector(".profile-page");
    const accounts = window.LiftClientAccounts;
    const registered = Boolean(accounts?.find(member.email));
    page.innerHTML = `<div class="page-heading"><div><p class="eyebrow">YOUR LIFT ACCOUNT</p><h1>My profile<span class="accent-dot">.</span></h1><p>Manage your account details and photo.</p></div></div>
      <section class="identity-card account-identity"><div class="identity-avatar" id="account-avatar" aria-hidden="true"></div><div class="identity-copy"><p class="eyebrow">MEMBER PROFILE</p><h2 id="account-name"></h2><p id="account-email"></p></div></section>
      <div class="account-grid"><section class="profile-card"><p class="eyebrow">APPEARANCE</p><h2>Profile photo</h2><p class="account-help">Choose a JPG, PNG, or WebP image up to 1 MB.</p><div class="account-photo-actions"><label class="account-button" for="account-photo">Upload photo</label><input id="account-photo" type="file" accept="image/jpeg,image/png,image/webp" hidden><button id="remove-photo" class="account-button secondary" type="button">Remove photo</button></div><p id="photo-status" class="account-status" role="status"></p></section>
      <section class="profile-card"><p class="eyebrow">ACCOUNT DETAILS</p><h2>Personal details</h2><form id="account-details-form" class="account-form"><label>Full name<input name="name" autocomplete="name" maxlength="80" required></label><label>Email address<input name="email" type="email" autocomplete="email" disabled></label><p class="account-help">Your sign-in email cannot be changed here.</p><button class="account-button primary" type="submit">Save details ↗</button><p id="details-status" class="account-status" role="status"></p></form></section>
      <section class="profile-card"><p class="eyebrow">SECURITY</p><h2>Password</h2><p class="account-help">Update the password you use to sign in.</p><button id="open-password-dialog" class="password-trigger" type="button">Change password ↗</button></section></div><dialog id="password-dialog" class="password-dialog" aria-labelledby="password-dialog-title"><div class="password-dialog-head"><div><p class="eyebrow">ACCOUNT SECURITY</p><h2 id="password-dialog-title">Change password</h2></div><button id="close-password-dialog" class="password-dialog-close" type="button" aria-label="Close password dialog">×</button></div><form id="password-form" class="account-form"><label>Current password<input name="current" type="password" autocomplete="current-password" required></label><label>New password<input name="next" type="password" autocomplete="new-password" minlength="8" required></label><label>Confirm new password<input name="confirm" type="password" autocomplete="new-password" minlength="8" required></label><button class="account-button primary" type="submit">Save new password ↗</button><p id="password-status" class="account-status" role="status"></p></form></dialog>`;

    const avatar = page.querySelector("#account-avatar");
    const nameDisplay = page.querySelector("#account-name");
    const emailDisplay = page.querySelector("#account-email");
    const details = page.querySelector("#account-details-form");
    const photoStatus = page.querySelector("#photo-status");
    const nav = document.querySelector("lift-client-navbar");
    const sync = () => {
      const photo = localStorage.getItem(avatarKey(member.email));
      avatar.replaceChildren();
      if (photo) {
        const image = document.createElement("img"); image.src = photo; image.alt = ""; avatar.append(image);
      } else avatar.textContent = initials(member.name);
      nameDisplay.textContent = member.name;
      emailDisplay.textContent = member.email;
      details.elements.name.value = member.name;
      details.elements.email.value = member.email;
      const navAvatar = nav?.querySelector(".client-avatar");
      if (navAvatar) { navAvatar.replaceChildren(); if (photo) { const image = document.createElement("img"); image.src = photo; image.alt = ""; navAvatar.append(image); } else navAvatar.textContent = initials(member.name); }
      if (nav?.querySelector(".client-display-name")) nav.querySelector(".client-display-name").textContent = member.name;
      if (nav?.querySelector(".client-account-caption")) nav.querySelector(".client-account-caption").textContent = `${member.name.toUpperCase()} · ${member.plan.toUpperCase()}`;
    };
    sync();

    page.querySelector("#account-photo").addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 1024 * 1024) { photoStatus.textContent = "Choose a JPG, PNG, or WebP image under 1 MB."; window.LiftNotice.warning(photoStatus.textContent); return; }
      const reader = new FileReader();
      reader.onload = () => { try { localStorage.setItem(avatarKey(member.email), reader.result); sync(); photoStatus.textContent = "Photo saved on this device."; window.LiftNotice.success(photoStatus.textContent); } catch { photoStatus.textContent = "Could not save the photo in this browser."; window.LiftNotice.error(photoStatus.textContent); } };
      reader.readAsDataURL(file);
    });
    page.querySelector("#remove-photo").addEventListener("click", async () => { if (!await window.LiftNotice.confirm("Remove your profile photo?", { confirmText: "Remove photo" })) return; try { localStorage.removeItem(avatarKey(member.email)); sync(); photoStatus.textContent = "Photo removed."; window.LiftNotice.success(photoStatus.textContent); } catch { window.LiftNotice.error("Could not remove your photo."); } });
    details.addEventListener("submit", event => {
      event.preventDefault();
      const status = page.querySelector("#details-status");
      const name = details.elements.name.value.trim();
      if (name.length < 2 || !details.reportValidity()) { status.textContent = "Enter a valid name."; window.LiftNotice.warning(status.textContent); return; }
      const updated = { ...member, name };
      try {
        if (registered) {
          const record = accounts.find(member.email);
          if (!accounts.replace(member.email, { ...record, name })) throw new Error("Account was not found");
        }
        localStorage.setItem(memberKey, JSON.stringify(updated));
        Object.assign(member, updated);
        sync(); status.textContent = "Account details saved."; window.LiftNotice.success(status.textContent);
      } catch { status.textContent = "Could not save your changes in this browser."; window.LiftNotice.error(status.textContent); }
    });
    const passwordDialog = page.querySelector("#password-dialog");
    page.querySelector("#open-password-dialog").addEventListener("click", () => { page.querySelector("#password-status").textContent = ""; passwordDialog.showModal(); });
    page.querySelector("#close-password-dialog").addEventListener("click", () => passwordDialog.close());
    passwordDialog.addEventListener("click", event => { if (event.target === passwordDialog) passwordDialog.close(); });
    passwordDialog.addEventListener("close", () => { page.querySelector("#password-form").reset(); });
    page.querySelector("#password-form")?.addEventListener("submit", async event => {
      event.preventDefault();
      const form = event.currentTarget, status = page.querySelector("#password-status");
      const current = form.elements.current.value, next = form.elements.next.value;
      if (next.length < 8 || next !== form.elements.confirm.value) { status.textContent = "New passwords must match and contain at least 8 characters."; window.LiftNotice.warning(status.textContent); return; }
      try {
        const record = accounts.find(member.email);
        const fallback = record ? value => accounts.verify(record, value) : "Lift2026!";
        if (!await window.LiftAccountSecurity.change(member.email, current, next, fallback)) { status.textContent = "Current password is incorrect."; window.LiftNotice.error(status.textContent); return; }
        form.reset(); status.textContent = "Password changed. Use the new password next time you sign in."; window.LiftNotice.success(status.textContent);
      } catch { status.textContent = "Could not change the password in this browser."; window.LiftNotice.error(status.textContent); }
    });
  }
  window.LiftAccountProfile = { render, avatarKey };
})();
