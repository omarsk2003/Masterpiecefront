"use strict";

const editButton = document.getElementById("edit-profile");
const form = document.getElementById("profile-form");
const details = document.getElementById("profile-details");
const feedback = document.getElementById("profile-feedback");
function initials(name) { return name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase(); }
function renderProfile() {
  const profile = window.LiftNutritionProfile.read();
  document.getElementById("profile-avatar").textContent = initials(profile.name);
  document.getElementById("profile-name").textContent = profile.name;
  document.getElementById("profile-specialty").textContent = profile.specialty;
  for (const field of ["name", "phone", "specialty", "experience", "bio"]) {
    document.getElementById("display-" + field).textContent = profile[field] || "Not added";
    form.elements[field].value = profile[field];
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
  details.hidden = true;
  form.hidden = false;
  editButton.setAttribute("aria-expanded", "true");
  editButton.textContent = "Close editor ×";
  feedback.textContent = "";
  form.elements.name.focus();
});
document.getElementById("cancel-edit").addEventListener("click", () => { renderProfile(); closeEditor(); });
form.addEventListener("submit", event => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form).entries());
  if (!input.name.trim() || !input.specialty.trim() || !input.experience.trim() || !input.bio.trim()) {
    feedback.textContent = "Complete the required profile fields.";
    window.LiftNotice.warning(feedback.textContent);
    return;
  }
  if (input.phone && !/^[+()\d\s-]{7,24}$/.test(input.phone.trim())) {
    feedback.textContent = "Enter a valid phone number or leave it blank.";
    window.LiftNotice.warning(feedback.textContent);
    form.elements.phone.focus();
    return;
  }
  if (!window.LiftNutritionProfile.save(input)) {
    feedback.textContent = "Could not save changes on this device.";
    window.LiftNotice.error(feedback.textContent);
    return;
  }
  renderProfile();
  closeEditor();
  feedback.textContent = "Profile saved on this device.";
  window.LiftNotice.success(feedback.textContent);
});
renderProfile();
