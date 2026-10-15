"use strict";

// Static preview data; changes remain in this page's memory only.
const users = [
  { id: 1, name: "Alexander Drake", email: "alexander@example.com", phone: "+962 79 000 0001", role: "client", detail: "Build Muscle", status: "active", profile: { plan: "premium", age: 28, weight: 78.2, height: 182, goal: "muscle", sport: "", experience: "intermediate", location: "gym", activity: "moderate", duration: "90", sleep: 7, work: 45, cooking: "home", days: ["mon", "wed", "fri"], conditions: ["none"], healthNote: "", foodPreferences: "" } },
  { id: 2, name: "Sarah Chen", email: "sarah@example.com", phone: "+962 79 000 0002", role: "coach", detail: "Strength & conditioning", status: "active" },
  { id: 3, name: "Maya Haddad", email: "maya@example.com", phone: "+962 79 000 0003", role: "nutritionist", detail: "Sports nutrition", status: "active" },
  { id: 4, name: "Omar Khalil", email: "omar@example.com", phone: "", role: "coach", detail: "Weight loss", status: "pending" },
  { id: 5, name: "Lina Mansour", email: "lina@example.com", phone: "", role: "nutritionist", detail: "Clinical nutrition", status: "pending" }
];
let nextId = 6;
let editingId = null;
let viewingId = null;
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const roleNames = { client: "Client", coach: "Coach", nutritionist: "Nutritionist" };
const statusNames = { active: "Active", pending: "Pending", suspended: "Suspended", blocked: "Blocked" };
const planNames = { free: "Free", ai: "AI Intelligence", premium: "Premium Co-Pilot" };
const goalNames = { muscle: "Build Muscle", lose: "Lose Weight", gain: "Gain Weight", maintain: "Maintain Weight", fitness: "Improve Fitness", performance: "Sports Performance" };
const optionNames = { football: "Football", basketball: "Basketball", running: "Running", other: "Other sport", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", gym: "Gym", home: "Home", field: "Outdoor / field", low: "Mostly Sitting", light: "Lightly Active", moderate: "Moderately Active", high: "Very Active", 30: "30 min", 45: "45 min", 60: "60 min", 90: "90+ min", family: "Family-cooked Meals", delivery: "Meal Prep Delivery", restaurant: "Restaurant / Takeout", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun", hypertension: "Hypertension", asthma: "Asthma", back: "Lower Back Pain", knee: "Knee Injury History", otherCondition: "Other", none: "None" };

function actionButtons(user) {
  const buttons = [{ action: "view", label: "View" }, { action: "edit", label: "Edit" }];
  if (user.status === "blocked") buttons.push({ action: "unblock", label: "Unblock" });
  else buttons.push({ action: "block", label: "Block" });
  return buttons.map(({ action, label }) => `<button type="button" data-action="${action}" data-id="${user.id}" class="row-action ${action === "block" ? "danger-action" : ""}" aria-label="${label} ${escapeHtml(user.name)}">${label}</button>`).join("");
}

function openView(user) {
  viewingId = user.id;
  $("#view-user-title").textContent = user.name;
  const fields = [
    ["ROLE", roleNames[user.role]],
    ["STATUS", statusNames[user.status]],
    ["EMAIL", user.email],
    ["PHONE", user.phone || "Not provided"],
    [user.role === "client" ? "FITNESS GOAL" : "SPECIALTY", user.detail || "Not provided"]
  ];
  if (user.role === "client") {
    const p = user.profile || {};
    fields.push(["SUBSCRIPTION", planNames[p.plan] || "Not set"], ["AGE", p.age ? `${p.age} years` : "Not set"], ["WEIGHT", p.weight ? `${p.weight} kg` : "Not set"], ["HEIGHT", p.height ? `${p.height} cm` : "Not set"], ["SPORT", p.sport ? optionNames[p.sport] : "Not applicable"], ["EXPERIENCE", optionNames[p.experience] || "Not set"], ["WORKOUT LOCATION", optionNames[p.location] || "Not set"], ["ACTIVITY", optionNames[p.activity] || "Not set"], ["WORKOUT WINDOW", optionNames[p.duration] || "Not set"], ["DAILY SLEEP", p.sleep !== undefined ? `${p.sleep} hours` : "Not set"], ["WEEKLY WORK", p.work !== undefined ? `${p.work} hours` : "Not set"], ["COOKING STYLE", optionNames[p.cooking] || "Not set"], ["WORKOUT DAYS", p.days?.map(day => optionNames[day]).join(", ") || "Not set"], ["HEALTH CONDITIONS", p.conditions?.map(condition => condition === "other" ? "Other" : optionNames[condition]).join(", ") || "Not set"], ["HEALTH NOTES", p.healthNote || "None"], ["FOOD PREFERENCES / ALLERGIES", p.foodPreferences || "None"]);
  }
  $("#view-user-details").innerHTML = fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  const statusAction = $("#view-status-user");
  statusAction.hidden = user.status === "pending" || user.status === "blocked";
  statusAction.textContent = user.status === "suspended" ? "Reactivate account" : "Suspend account";
  statusAction.dataset.action = user.status === "suspended" ? "reactivate" : "suspend";
  $("#view-user-dialog").showModal();
}

function render() {
  const query = $("#user-search").value.trim().toLowerCase();
  const role = $("#role-filter").value;
  const status = $("#status-filter").value;
  const shown = users.filter((user) => (role === "all" || user.role === role) && (status === "all" || user.status === status) && (!query || `${user.name} ${user.email}`.toLowerCase().includes(query)));
  $("#users-body").innerHTML = shown.map((user) => `<tr><td><div class="table-person"><span class="table-avatar" aria-hidden="true">${escapeHtml(user.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase())}</span><div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.email)}</small></div></div></td><td><span class="table-role">${roleNames[user.role]}</span></td><td class="detail-cell">${escapeHtml(user.role === "client" ? `${user.detail || "—"} · ${planNames[user.profile?.plan] || "No plan"}` : user.detail || "—")}</td><td><span class="table-status ${user.status}"><i aria-hidden="true"></i>${statusNames[user.status]}</span></td><td><div class="row-actions">${actionButtons(user)}</div></td></tr>`).join("");
  $("#directory-empty").hidden = shown.length !== 0;
  $("#result-count").textContent = `${shown.length} ${shown.length === 1 ? "account" : "accounts"}`;
  $("#stat-total").textContent = users.length;
  for (const state of ["active", "pending", "suspended", "blocked"]) $("#stat-" + state).textContent = users.filter((user) => user.status === state).length;
  for (const role of ["coach", "nutritionist"]) {
    const badge = $(`#sidebar-${role}-pending-count`);
    if (!badge) continue;
    const count = users.filter(user => user.role === role && user.status === "pending").length;
    badge.textContent = count;
    badge.hidden = count === 0;
  }
}

function updateRoleFields() {
  const specialist = $("#account-role").value !== "client";
  $("#specialist-fields").hidden = !specialist;
  $("#client-fields").hidden = specialist;
  $("#account-detail").required = specialist;
  for (const field of $("#client-fields").querySelectorAll("select, input[type=number]")) field.required = !specialist && field.id !== "account-sport";
  updateSportField();
  $("#role-note").textContent = editingId ? "Changes to account details keep its current status." : specialist ? "New specialists start Pending until an admin approves them." : "New client accounts start Active.";
}

function updateSportField() {
  const show = $("#account-role").value === "client" && $("#account-goal").value === "performance";
  $("#sport-label").hidden = !show;
  $("#account-sport").required = show;
  if (!show) $("#account-sport").value = "";
}

function openDialog(user = null) {
  editingId = user?.id ?? null;
  $("#user-form").reset();
  $("#form-error").hidden = true;
  $("#account-role").disabled = Boolean(user);
  $("#user-dialog-title").textContent = user ? "Edit user" : "Add user";
  $("#dialog-description").textContent = user ? `Update ${user.name}'s account details.` : "Create a new account for a client, coach, or nutritionist.";
  $("#save-user").innerHTML = user ? 'Save changes <span aria-hidden="true">↗</span>' : 'Add user <span aria-hidden="true">↗</span>';
  if (user) {
    $("#account-name").value = user.name;
    $("#account-email").value = user.email;
    $("#account-phone").value = user.phone;
    $("#account-role").value = user.role;
    $("#account-detail").value = user.role === "client" ? "" : user.detail;
    if (user.role === "client" && user.profile) {
      for (const key of ["plan", "age", "weight", "height", "goal", "sport", "experience", "location", "activity", "duration", "sleep", "work", "cooking", "healthNote", "foodPreferences"]) {
        const control = $("#user-form").elements.namedItem(key);
        if (control) control.value = user.profile[key] ?? "";
      }
      for (const key of ["days", "conditions"]) for (const checkbox of $("#user-form").querySelectorAll(`[name="${key}"]`)) checkbox.checked = (user.profile[key] || []).includes(checkbox.value);
    }
  }
  updateRoleFields();
  $("#user-dialog").showModal();
  $("#account-name").focus();
}

function setStatus(user, action) {
  if (action === "suspend" && user.status === "active") user.status = "suspended";
  else if (action === "reactivate" && user.status === "suspended") user.status = "active";
  else if (action === "block" && user.status !== "blocked") { user.previousStatus = user.status; user.status = "blocked"; }
  else if (action === "unblock" && user.status === "blocked") user.status = user.previousStatus || "active";
  else return;
  render();
  $("#user-action-status").textContent = `${user.name}: ${statusNames[user.status]}.`;
}

$("#add-user").addEventListener("click", () => openDialog());
$("#close-user-dialog").addEventListener("click", () => $("#user-dialog").close());
$("#cancel-user").addEventListener("click", () => $("#user-dialog").close());
$("#account-role").addEventListener("change", updateRoleFields);
$("#account-goal").addEventListener("change", updateSportField);
$("#user-form").querySelectorAll('[name="conditions"]').forEach(checkbox => checkbox.addEventListener("change", () => {
  if (!checkbox.checked) return;
  for (const peer of $("#user-form").querySelectorAll('[name="conditions"]')) if (checkbox.value === "none" ? peer !== checkbox : peer.value === "none") peer.checked = false;
}));
for (const filter of ["#user-search", "#role-filter", "#status-filter"]) $(filter).addEventListener(filter === "#user-search" ? "input" : "change", render);
$("#users-body").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const user = users.find((item) => item.id === Number(button.dataset.id));
  if (!user) return;
  if (button.dataset.action === "view") openView(user);
  else if (button.dataset.action === "edit") openDialog(user);
  else setStatus(user, button.dataset.action);
});
$("#close-view-user").addEventListener("click", () => $("#view-user-dialog").close());
$("#view-close-user").addEventListener("click", () => $("#view-user-dialog").close());
$("#view-edit-user").addEventListener("click", () => {
  const user = users.find((item) => item.id === viewingId);
  $("#view-user-dialog").close();
  if (user) openDialog(user);
});
$("#view-status-user").addEventListener("click", (event) => {
  const user = users.find((item) => item.id === viewingId);
  if (!user) return;
  setStatus(user, event.currentTarget.dataset.action);
  $("#view-user-dialog").close();
});
$("#user-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const name = $("#account-name").value.trim();
  const email = $("#account-email").value.trim().toLowerCase();
  const phone = $("#account-phone").value.trim();
  const role = $("#account-role").value;
  const profile = role === "client" ? Object.fromEntries(["plan", "age", "weight", "height", "goal", "sport", "experience", "location", "activity", "duration", "sleep", "work", "cooking", "healthNote", "foodPreferences"].map(key => [key, form.elements.namedItem(key).value.trim()])) : null;
  if (profile) {
    for (const key of ["age", "weight", "height", "sleep", "work"]) profile[key] = Number(profile[key]);
    for (const key of ["days", "conditions"]) profile[key] = [...form.querySelectorAll(`[name="${key}"]:checked`)].map(input => input.value);
  }
  const detail = role === "client" ? goalNames[profile.goal] : $("#account-detail").value.trim();
  $("#account-name").value = name;
  $("#account-email").value = email;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const error = $("#form-error");
  if (role === "client" && (!profile.days.length || !profile.conditions.length)) {
    error.textContent = !profile.days.length ? "Choose at least one available workout day." : "Choose a health condition or None.";
    error.hidden = false;
    return;
  }
  if (users.some((user) => user.email.toLowerCase() === email && user.id !== editingId)) {
    error.textContent = "This email address is already used by another account.";
    error.hidden = false;
    $("#account-email").focus();
    return;
  }
  error.hidden = true;
  if (editingId) Object.assign(users.find((user) => user.id === editingId), { name, email, phone, detail, ...(profile ? { profile } : {}) });
  else users.unshift({ id: nextId++, name, email, phone, role, detail, status: role === "client" ? "active" : "pending", ...(profile ? { profile } : {}) });
  $("#user-dialog").close();
  $("#user-search").value = "";
  $("#role-filter").value = "all";
  $("#status-filter").value = "all";
  render();
  $("#user-action-status").textContent = editingId ? `${name}'s account updated.` : `${name}'s account added.`;
});
const menuButton = $(".admin-menu-toggle");
menuButton?.addEventListener("click", () => {
  const opened = $("lift-admin-sidebar").classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(opened));
  menuButton.setAttribute("aria-label", opened ? "Close sidebar" : "Open sidebar");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { $("lift-admin-sidebar").classList.remove("open"); menuButton?.setAttribute("aria-expanded", "false"); }
});
render();

