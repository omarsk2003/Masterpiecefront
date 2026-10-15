"use strict";

// Static account examples. Approval changes only this page's in-memory state.
const specialists = [
  { id: 1, name: "Omar Khalil", role: "coach", specialty: "Fat loss & beginner fitness", experience: "5 years", email: "omar@lift.demo", applied: "08 Oct 2026", status: "pending", certificates: [{ title: "Certified Personal Trainer", issuer: "Sample Fitness Academy", year: "2021" }, { title: "Weight Management Coaching", issuer: "Sample Coaching Institute", year: "2023" }] },
  { id: 2, name: "Lina Mansour", role: "nutritionist", specialty: "Balanced nutrition", experience: "4 years", email: "lina@lift.demo", applied: "09 Oct 2026", status: "pending", certificates: [{ title: "Nutrition & Dietetics", issuer: "Sample Health University", year: "2020" }, { title: "Sports Nutrition Practice", issuer: "Sample Nutrition Academy", year: "2022" }] },
  { id: 3, name: "Sarah Chen", role: "coach", specialty: "Strength & conditioning", experience: "8 years", email: "sarah@lift.demo", applied: "02 Oct 2026", status: "active" },
  { id: 4, name: "Maya Haddad", role: "nutritionist", specialty: "Everyday nutrition", experience: "6 years", email: "maya@lift.demo", applied: "03 Oct 2026", status: "active" }
];

const requestList = document.getElementById("request-list");
const activeList = document.getElementById("active-list");
const credentialQueue = document.getElementById("credential-queue");
const dialog = document.getElementById("review-dialog");
const details = document.getElementById("review-details");
const approveButton = document.getElementById("approve-account");
const rejectButton = document.getElementById("reject-account");
const certificateDialog = document.getElementById("certificate-dialog");
let filter = "all";
let selectedId = null;
let viewedCertificates = new Set();

const roleName = role => role === "coach" ? "Coach" : "Nutritionist";
const initials = name => name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function personMarkup(person) {
  return `<div class="person-cell"><span class="person-avatar" aria-hidden="true">${escapeHtml(initials(person.name))}</span><div><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.email)}</small></div></div>`;
}
const managementUrl = person => person.role === "coach" ? "../CoachManagement/coach-management.html" : "../NutritionistManagement/nutritionist-management.html";

function render() {
  const pending = specialists.filter(person => person.status === "pending");
  const active = specialists.filter(person => person.status === "active");
  const visible = pending.filter(person => filter === "all" || person.role === filter);
  document.getElementById("pending-count").textContent = pending.length;
  document.getElementById("coach-count").textContent = active.filter(person => person.role === "coach").length;
  document.getElementById("nutrition-count").textContent = active.filter(person => person.role === "nutritionist").length;
  document.getElementById("all-filter-count").textContent = pending.length;
  for (const role of ["coach", "nutritionist"]) {
    const badge = document.getElementById(`sidebar-${role}-pending-count`);
    const count = pending.filter(person => person.role === role).length;
    badge.textContent = count;
    badge.hidden = count === 0;
  }
  document.getElementById("queue-count").textContent = `${pending.length} pending`;
  const total = active.length + 1;
  document.getElementById("total-accounts").textContent = `${total} active`;
  document.getElementById("breakdown-clients").textContent = 1;
  document.getElementById("breakdown-coaches").textContent = active.filter(person => person.role === "coach").length;
  document.getElementById("breakdown-nutritionists").textContent = active.filter(person => person.role === "nutritionist").length;
  document.getElementById("bar-clients").style.width = `${100 / total}%`;
  document.getElementById("bar-coaches").style.width = `${100 * active.filter(person => person.role === "coach").length / total}%`;
  document.getElementById("bar-nutritionists").style.width = `${100 * active.filter(person => person.role === "nutritionist").length / total}%`;
  document.getElementById("empty-state").hidden = visible.length !== 0;
  requestList.innerHTML = visible.map(person => `<article class="request-card">${personMarkup(person)}<div class="request-specialty"><span class="role-tag">${roleName(person.role).toUpperCase()}</span><strong>${escapeHtml(person.specialty)}</strong></div><div class="request-date"><small>APPLIED</small><strong>${escapeHtml(person.applied)}</strong></div>${person.isUploaded ? `<a class="review-button" href="${managementUrl(person)}?review=${encodeURIComponent(person.id)}">Review PDF ↗</a>` : `<button class="review-button" type="button" data-review="${person.id}" aria-label="Review ${escapeHtml(person.name)}">Review details ↗</button>`}</article>`).join("");
  credentialQueue.innerHTML = pending.length ? pending.map(person => `<article class="queue-item"><div><strong>${escapeHtml(person.name)}</strong><small>${roleName(person.role)} · ${escapeHtml(person.specialty)}</small></div>${person.isUploaded ? `<a href="${managementUrl(person)}?review=${encodeURIComponent(person.id)}">Review PDF</a>` : `<button type="button" data-review="${person.id}" aria-label="Review ${escapeHtml(person.name)}">Review</button>`}</article>`).join("") : '<p class="queue-empty">No pending specialist requests.</p>';
  activeList.innerHTML = active.map(person => `<article class="active-card">${personMarkup(person)}<span class="status-tag active"><i aria-hidden="true"></i> Active</span></article>`).join("");
}

document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
  filter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(item => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  render();
}));

function openReview(event) {
  const button = event.target.closest("[data-review]");
  if (!button) return;
  const person = specialists.find(item => item.id === Number(button.dataset.review) && item.status === "pending");
  if (!person) return;
  selectedId = person.id;
  viewedCertificates = new Set();
  approveButton.disabled = true;
  rejectButton.disabled = true;
  document.getElementById("review-hint").hidden = false;
  document.getElementById("review-hint").textContent = "Open every certificate preview to enable a decision.";
  document.getElementById("review-title").textContent = person.name;
  details.innerHTML = [
    ["ROLE", roleName(person.role)],
    ["SPECIALTY", person.specialty],
    ["EXPERIENCE", person.experience],
    ["EMAIL", person.email],
    ["APPLIED", person.applied],
    ["ACCOUNT STATUS", "Inactive · awaiting approval"]
  ].map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("");
  document.getElementById("certificate-count").textContent = `${person.certificates.length} submitted`;
  document.getElementById("certificate-list").innerHTML = person.certificates.map((certificate, index) => `<button type="button" class="certificate-item" data-certificate="${index}" aria-label="View sample certificate ${escapeHtml(certificate.title)}"><span class="certificate-icon" aria-hidden="true">▤</span><span><strong>${escapeHtml(certificate.title)}</strong><small>${escapeHtml(certificate.issuer)} · ${escapeHtml(certificate.year)}</small></span><b>View ↗</b></button>`).join("");
  dialog.showModal();
}
requestList.addEventListener("click", openReview);
credentialQueue.addEventListener("click", openReview);
document.getElementById("certificate-list").addEventListener("click", event => {
  const button = event.target.closest("[data-certificate]");
  if (!button) return;
  const person = specialists.find(item => item.id === selectedId && item.status === "pending");
  const certificate = person?.certificates[Number(button.dataset.certificate)];
  if (!certificate) return;
  document.getElementById("certificate-preview-title").textContent = certificate.title;
  document.getElementById("certificate-name").textContent = certificate.title;
  document.getElementById("certificate-holder").textContent = person.name;
  document.getElementById("certificate-issuer").textContent = certificate.issuer;
  document.getElementById("certificate-year").textContent = certificate.year;
  viewedCertificates.add(Number(button.dataset.certificate));
  button.classList.add("viewed");
  button.querySelector("b").textContent = "Viewed ✓";
  const reviewedAll = viewedCertificates.size === person.certificates.length;
  approveButton.disabled = !reviewedAll;
  rejectButton.disabled = !reviewedAll;
  document.getElementById("review-hint").textContent = reviewedAll ? "All sample certificates opened. You can now decide." : `Open every certificate preview to enable a decision (${viewedCertificates.size}/${person.certificates.length}).`;
  certificateDialog.showModal();
});
document.getElementById("close-certificate").addEventListener("click", () => certificateDialog.close());
document.getElementById("done-certificate").addEventListener("click", () => certificateDialog.close());

const sidebar = document.querySelector("lift-admin-sidebar");
const menuToggle = document.querySelector(".admin-menu-toggle");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close sidebar" : "Open sidebar");
  sidebar.classList.toggle("open", open);
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape" || !sidebar.classList.contains("open")) return;
  sidebar.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open sidebar");
  menuToggle.focus();
});

document.getElementById("close-review").addEventListener("click", () => dialog.close());
document.getElementById("cancel-review").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => { selectedId = null; });
dialog.addEventListener("click", event => {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});

approveButton.addEventListener("click", () => {
  if (approveButton.disabled) return;
  const person = specialists.find(item => item.id === selectedId && item.status === "pending");
  if (!person) return;
  person.status = "active";
  dialog.close();
  render();
  document.getElementById("approval-status").textContent = `${person.name} has moved to the active team.`;
});
rejectButton.addEventListener("click", () => {
  if (rejectButton.disabled) return;
  const person = specialists.find(item => item.id === selectedId && item.status === "pending");
  if (!person) return;
  person.status = "rejected";
  dialog.close();
  render();
  document.getElementById("approval-status").textContent = `${person.name}'s application was rejected.`;
});

render();
window.LiftSpecialistApplications.all().then(records => {
  for (const record of records) if (!specialists.some(person => person.id === record.id)) specialists.push({ ...record, isUploaded: true });
  render();
}).catch(() => {});

