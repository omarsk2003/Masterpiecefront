"use strict";

customElements.define("lift-nutrition-navbar", class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<header class="nutrition-navbar"><div class="nutrition-brand"><button type="button" class="nutrition-menu-toggle" aria-label="Open navigation" aria-controls="nutrition-sidebar" aria-expanded="false">☰</button><a href="../Dashboard/dashboard.html" aria-label="LIFT nutrition dashboard"><img src="../../Shared/Assets/Images/lift-logo.png" alt="LIFT"></a><span>NUTRITION WORKSPACE</span></div><div class="nutrition-account"><button type="button" class="nutrition-theme-toggle" data-theme-toggle aria-label="Switch theme"><span data-theme-icon aria-hidden="true">☼</span></button><div class="nutrition-account-wrap"><button class="nutrition-account-trigger" type="button" aria-label="Open account menu" aria-expanded="false"><span class="nutrition-account-name"><strong>Maya Haddad</strong><small>Nutrition specialist</small></span><span class="nutrition-avatar" aria-hidden="true">MH</span><span aria-hidden="true">⌄</span></button><div class="nutrition-account-menu" hidden><a href="../Profile/profile.html">Profile <span aria-hidden="true">↗</span></a><a href="../../Shared/Login/login.html">Log out <span aria-hidden="true">↗</span></a></div></div></div></header>`;
    const menuToggle = this.querySelector(".nutrition-menu-toggle");
    menuToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nutrition-nav-open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    const trigger = this.querySelector(".nutrition-account-trigger");
    const menu = this.querySelector(".nutrition-account-menu");
    const wrap = this.querySelector(".nutrition-account-wrap");
    const close = () => { trigger.setAttribute("aria-expanded", "false"); menu.hidden = true; };
    trigger.addEventListener("click", () => {
      const open = trigger.getAttribute("aria-expanded") !== "true";
      trigger.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    });
    document.addEventListener("click", event => { if (!wrap.contains(event.target)) close(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    const syncProfile = () => {
      let name = "Maya Haddad";
      try { name = window.LiftNutritionProfile?.read().name || JSON.parse(localStorage.getItem("lift-nutrition-profile-v1") || "{}").name || name; }
      catch { /* Static fallback. */ }
      const parts = name.trim().split(/\s+/);
      this.querySelector(".nutrition-account-name strong").textContent = name;
      this.querySelector(".nutrition-avatar").textContent = parts.map(part => part[0]).slice(0, 2).join("").toUpperCase();
    };
    syncProfile();
    document.addEventListener("lift:nutrition-profile-change", syncProfile);
    window.addEventListener("storage", event => { if (event.key === "lift-nutrition-profile-v1") syncProfile(); });
  }
});
