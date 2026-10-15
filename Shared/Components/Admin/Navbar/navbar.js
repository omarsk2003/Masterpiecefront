"use strict";

(() => {
  const root = new URL("../../../../", document.currentScript.src);
  class LiftAdminNavbar extends HTMLElement {
    connectedCallback() {
      const logo = new URL("Shared/Assets/Images/lift-logo.png", root).href;
      const dashboard = new URL("Admin/Dashboard/dashboard.html", root).href;
      const login = new URL("Shared/Login/login.html", root).href;
      this.innerHTML = `<header class="admin-navbar"><a class="admin-brand" href="${dashboard}" aria-label="LIFT admin dashboard"><img src="${logo}" alt="LIFT"><span>ADMIN</span></a><nav class="admin-nav-links" aria-label="Admin navigation"><a href="${dashboard}" aria-current="page">Overview</a><a href="${dashboard}#approvals">Approvals</a><a href="${dashboard}#active-team">Active team</a></nav><div class="admin-nav-actions"><button class="admin-theme-toggle" type="button" data-theme-toggle aria-label="Switch to light mode"><span data-theme-icon aria-hidden="true">☼</span></button><span class="admin-avatar" aria-hidden="true">AD</span><span class="admin-name">Admin</span><a class="admin-logout" href="${login}">Log out</a></div></header>`;
      if (window.LiftTheme) {
        const next = window.LiftTheme.get() === "dark" ? "light" : "dark";
        this.querySelector("[data-theme-icon]").textContent = next === "light" ? "☼" : "☾";
        this.querySelector("[data-theme-toggle]").setAttribute("aria-label", `Switch to ${next} mode`);
      }
    }
  }
  customElements.define("lift-admin-navbar", LiftAdminNavbar);
})();

