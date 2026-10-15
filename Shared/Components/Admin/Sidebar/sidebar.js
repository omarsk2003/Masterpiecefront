"use strict";

(() => {
  const root = new URL("../../../../", document.currentScript.src);
  const dashboard = new URL("Admin/Dashboard/dashboard.html", root).href;
  const manageUsers = new URL("Admin/ClientManagement/client-management.html", root).href;
  const coaches = new URL("Admin/CoachManagement/coach-management.html", root).href;
  const nutritionists = new URL("Admin/NutritionistManagement/nutritionist-management.html", root).href;
  const messages = new URL("Admin/Messages/messages.html", root).href;
  const subscriptions = new URL("Admin/Subscriptions/subscriptions.html", root).href;
  const siteStudio = new URL("Admin/HomePageManagement/home-page-management.html", root).href;
  const login = new URL("Shared/Login/login.html", root).href;
  const pendingKey = "lift-specialist-pending-counts";
  function savedCounts() {
    try { return JSON.parse(localStorage.getItem(pendingKey) || "null"); } catch { return null; }
  }
  class LiftAdminSidebar extends HTMLElement {
    connectedCallback() {
      const onUsers = location.pathname === new URL(manageUsers).pathname;
      const onCoaches = location.pathname === new URL(coaches).pathname;
      const onNutritionists = location.pathname === new URL(nutritionists).pathname;
      const onMessages = location.pathname === new URL(messages).pathname;
      const onSubscriptions = location.pathname === new URL(subscriptions).pathname;
      const onStudio = location.pathname === new URL(siteStudio).pathname;
      const onDashboard = !onUsers && !onCoaches && !onNutritionists && !onMessages && !onSubscriptions && !onStudio;
      this.innerHTML = `<aside class="admin-sidebar" id="admin-sidebar" aria-label="Admin sidebar"><nav aria-label="Admin sections"><a class="sidebar-link${onDashboard ? " current" : ""}" href="${dashboard}" data-section="overview"${onDashboard ? ' aria-current="page"' : ""}><span aria-hidden="true">▥</span> Overview</a><a class="sidebar-link${onUsers ? " current" : ""}" href="${manageUsers}" data-section="users"${onUsers ? ' aria-current="page"' : ""}><span aria-hidden="true">◫</span> Manage users</a><a class="sidebar-link${onCoaches ? " current" : ""}" href="${coaches}" data-section="coaches"${onCoaches ? ' aria-current="page"' : ""}><span aria-hidden="true">♧</span> Coaches <b id="sidebar-coach-pending-count">1</b></a><a class="sidebar-link${onNutritionists ? " current" : ""}" href="${nutritionists}" data-section="nutritionists"${onNutritionists ? ' aria-current="page"' : ""}><span aria-hidden="true">◈</span> Nutritionists <b id="sidebar-nutritionist-pending-count">1</b></a><a class="sidebar-link${onMessages ? " current" : ""}" href="${messages}" data-section="messages"${onMessages ? ' aria-current="page"' : ""}><span aria-hidden="true">✉</span> Messages</a><a class="sidebar-link${onSubscriptions ? " current" : ""}" href="${subscriptions}" data-section="subscriptions"${onSubscriptions ? ' aria-current="page"' : ""}><span aria-hidden="true">▤</span> Subscriptions</a><a class="sidebar-link${onStudio ? " current" : ""}" href="${siteStudio}" data-section="site-studio"${onStudio ? ' aria-current="page"' : ""}><span aria-hidden="true">◩</span> Site appearance</a></nav><div class="sidebar-bottom"><a href="${login}"><span aria-hidden="true">↪</span> Log out</a></div></aside>`;
      this.querySelectorAll(".sidebar-link").forEach(link => link.addEventListener("click", () => {
        this.classList.remove("open");
        const toggle = document.querySelector(".admin-menu-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }));
      const syncCounts = () => {
        const counts = savedCounts();
        if (!counts) return;
        for (const role of ["coach", "nutritionist"]) {
          const badge = this.querySelector(`#sidebar-${role}-pending-count`);
          const count = Number(counts[role]) || 0;
          badge.textContent = count;
          badge.hidden = count === 0;
        }
      };
      syncCounts();
      window.addEventListener("storage", event => { if (event.key === pendingKey) syncCounts(); });
      window.addEventListener("lift:application-counts", syncCounts);
    }
  }
  customElements.define("lift-admin-sidebar", LiftAdminSidebar);
})();

