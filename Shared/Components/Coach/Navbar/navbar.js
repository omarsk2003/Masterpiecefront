"use strict";

customElements.define("lift-coach-navbar", class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<header class="coach-navbar"><div class="coach-brand"><button class="coach-menu-toggle" type="button" aria-label="Open navigation" aria-controls="coach-sidebar" aria-expanded="false">☰</button><a href="../Dashboard/dashboard.html" aria-label="LIFT coach dashboard"><img src="../../Shared/Assets/Images/lift-logo.png" alt="LIFT"></a><span>COACH WORKSPACE</span></div><div class="coach-account"><button type="button" class="coach-theme-toggle" data-theme-toggle aria-label="Switch theme"><span data-theme-icon aria-hidden="true">☼</span></button><div class="coach-account-menu-wrap"><button type="button" class="coach-account-trigger" aria-label="Open account menu" aria-expanded="false"><span class="coach-account-name"><strong>Sarah Chen</strong><small>Training coach</small></span><span class="coach-account-avatar" aria-hidden="true">SC</span><span class="account-chevron" aria-hidden="true">⌄</span></button><div class="coach-account-dropdown" hidden><a href="../Profile/profile.html">Profile <span aria-hidden="true">↗</span></a><a href="../../Shared/Login/login.html">Log out <span aria-hidden="true">↗</span></a></div></div></div></header>`;
    const toggle = this.querySelector(".coach-menu-toggle");
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("coach-nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    const trigger = this.querySelector(".coach-account-trigger");
    const menu = this.querySelector(".coach-account-dropdown");
    const wrap = this.querySelector(".coach-account-menu-wrap");
    const close = () => { trigger.setAttribute("aria-expanded", "false"); menu.hidden = true; };
    trigger.addEventListener("click", () => {
      const open = trigger.getAttribute("aria-expanded") !== "true";
      trigger.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    });
    document.addEventListener("click", event => { if (!wrap.contains(event.target)) close(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    const syncName = () => {
      let name = "Sarah Chen";
      try { name = window.LiftCoachProfile?.read().name || JSON.parse(localStorage.getItem("lift-coach-profile-v1") || "{}").name || name; } catch { /* Static fallback. */ }
      const parts = name.trim().split(/\s+/);
      this.querySelector(".coach-account-name strong").textContent = name;
      this.querySelector(".coach-account-avatar").textContent = parts.map(part => part[0]).slice(0, 2).join("").toUpperCase();
    };
    syncName();
    document.addEventListener("lift:coach-profile-change", syncName);
    window.addEventListener("storage", event => { if (event.key === "lift-coach-profile-v1") syncName(); });
  }
});
