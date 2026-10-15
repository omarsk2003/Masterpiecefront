"use strict";

(() => {
const previewMember = window.LiftClientAccess?.member || null;
if (previewMember && (previewMember.preview || previewMember.plan !== "premium")) {
  window.LiftAccountProfile?.render(previewMember);
  window.LiftClientAccess?.finishRender();
  return;
}

// Profile edits are kept in memory for the current preview only.
// Email and membership details remain fixed until real account storage exists.
const profile = { name: "Alexander Drake", phone: "", goal: "Build strength" };
const editButton = document.getElementById("edit-profile");
const cancelButton = document.getElementById("cancel-edit");
const form = document.getElementById("profile-form");
const details = document.getElementById("profile-details");
const status = document.getElementById("save-status");
const nameInput = document.getElementById("profile-name");
const phoneInput = document.getElementById("profile-phone");
const goalInput = document.getElementById("profile-goal");
function displayProfile() {
  document.getElementById("member-name").textContent = profile.name;
  document.getElementById("display-name").textContent = profile.name;
  document.getElementById("display-phone").textContent = profile.phone || "Not added";
  document.getElementById("display-goal").textContent = profile.goal;
  const parts = profile.name.split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts.at(-1)[0]}` : parts[0].slice(0, 2);
  document.querySelector(".identity-avatar").textContent = initials.toUpperCase();
  const trigger = document.querySelector(".client-profile-trigger");
  if (trigger) {
    trigger.querySelector(".client-avatar").textContent = initials.toUpperCase();
    trigger.querySelector(".client-avatar + span").textContent = parts.length > 1 ? `${parts[0][0]}. ${parts.at(-1)}` : profile.name;
    document.querySelector(".client-account-caption").textContent = `${profile.name.toUpperCase()} · PREMIUM`;
  }
}

function closeEditor() {
  form.hidden = true;
  details.hidden = false;
  editButton.setAttribute("aria-expanded", "false");
  editButton.textContent = "Edit profile ↗";
}

editButton.addEventListener("click", () => {
  if (!form.hidden) return closeEditor();
  nameInput.value = profile.name;
  phoneInput.value = profile.phone;
  goalInput.value = profile.goal;
  nameInput.setCustomValidity("");
  phoneInput.setCustomValidity("");
  status.hidden = true;
  details.hidden = true;
  form.hidden = false;
  editButton.setAttribute("aria-expanded", "true");
  editButton.textContent = "Close editor ×";
  nameInput.focus();
});

cancelButton.addEventListener("click", () => {
  closeEditor();
  editButton.focus();
});

nameInput.addEventListener("input", () => nameInput.setCustomValidity(""));
phoneInput.addEventListener("input", () => phoneInput.setCustomValidity(""));

form.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameInput.value.trim().replace(/\s+/g, " ");
  const phone = phoneInput.value.trim();
  if (!name) {
    nameInput.setCustomValidity("Enter your full name.");
    nameInput.reportValidity();
    return;
  }
  if (phone && !/^[+()\d\s-]{7,24}$/.test(phone)) {
    phoneInput.setCustomValidity("Enter a valid phone number or leave it blank.");
    phoneInput.reportValidity();
    return;
  }
  profile.name = name;
  profile.phone = phone;
  profile.goal = goalInput.value;
  displayProfile();
  closeEditor();
  status.hidden = false;
  editButton.focus();
});
})();



