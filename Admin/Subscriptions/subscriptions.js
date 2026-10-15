"use strict";
const subscriptions = [{ id: 1, name: "Alexander Drake", email: "alexander@example.com", plan: "Premium", status: "active", started: "01 Oct 2026", renewal: "01 Nov 2026", coach: "Sarah Chen", nutritionist: "Maya Haddad" }];
const $ = selector => document.querySelector(selector);
const member = () => subscriptions.find(item => item.id === selectedId);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
let selectedId = null;
function render() {
  const query = $("#subscription-search").value.trim().toLowerCase();
  const status = $("#subscription-filter").value;
  const visible = subscriptions.filter(item => (status === "all" || item.status === status) && (!query || [item.name, item.email].join(" ").toLowerCase().includes(query)));
  $("#stat-total").textContent = subscriptions.length;
  $("#stat-active").textContent = subscriptions.filter(item => item.status === "active").length;
  $("#stat-paused").textContent = subscriptions.filter(item => item.status === "paused").length;
  $("#result-count").textContent = `${visible.length} shown`;
  $("#subscription-empty").hidden = visible.length > 0;
  $("#subscription-list").innerHTML = visible.map(item => `<article class="subscription-card"><span class="member-avatar" aria-hidden="true">AD</span><div class="member-identity"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.email)}</small></div><div class="member-cell"><span>PLAN</span><strong>${escapeHtml(item.plan)}</strong></div><span class="member-status ${item.status}">${item.status === "active" ? "Active" : "Paused"}</span><button type="button" data-view="${item.id}">View details ↗</button></article>`).join("");
}
function openDetails(item) {
  selectedId = item.id;
  $("#member-title").textContent = item.name;
  $("#member-email").textContent = item.email;
  $("#member-status").textContent = item.status === "active" ? "Active Premium" : "Paused Premium";
  $("#member-status").className = "member-status " + item.status;
  $("#member-details").innerHTML = [["PLAN", item.plan], ["STARTED", item.started], ["SAMPLE RENEWAL", item.renewal], ["COACH", item.coach], ["NUTRITIONIST", item.nutritionist], ["ACCESS", item.status === "active" ? "Enabled" : "Paused"]].map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  $("#member-messages").href = `../Messages/messages.html?member=${encodeURIComponent(item.email)}`;
  $("#toggle-subscription").textContent = item.status === "active" ? "Pause access" : "Reactivate access";
  $("#subscription-dialog").showModal();
}
$("#subscription-list").addEventListener("click", event => { const button = event.target.closest("[data-view]"); const item = button && subscriptions.find(entry => entry.id === Number(button.dataset.view)); if (item) openDetails(item); });
$("#subscription-search").addEventListener("input", render);
$("#subscription-filter").addEventListener("change", render);
$("#close-subscription").addEventListener("click", () => $("#subscription-dialog").close());
$("#toggle-subscription").addEventListener("click", () => { const item = member(); if (!item) return; item.status = item.status === "active" ? "paused" : "active"; $("#subscription-dialog").close(); render(); $("#subscription-action-status").textContent = `${item.name}: membership ${item.status}.`; });
const menuButton = $(".admin-menu-toggle");
menuButton.addEventListener("click", () => { const opened = $("lift-admin-sidebar").classList.toggle("open"); menuButton.setAttribute("aria-expanded", String(opened)); menuButton.setAttribute("aria-label", opened ? "Close sidebar" : "Open sidebar"); });
document.addEventListener("keydown", event => { if (event.key === "Escape") { $("lift-admin-sidebar").classList.remove("open"); menuButton.setAttribute("aria-expanded", "false"); } });
render();
const requestedMember = new URLSearchParams(location.search).get("member");
if (requestedMember) { const item = subscriptions.find(entry => entry.email.toLowerCase() === requestedMember.toLowerCase()); if (item) openDetails(item); }
