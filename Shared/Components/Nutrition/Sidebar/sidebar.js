"use strict";

customElements.define("lift-nutrition-sidebar", class extends HTMLElement {
  connectedCallback() {
    const links = [
      ["Dashboard", "../Dashboard/dashboard.html", "▦"],
      ["My clients", "../MyClients/my-clients.html", "♙"],
      ["Nutrition guidance", "../NutritionCoaching/nutrition-coaching.html", "✳"],
      ["Messages", "../Messages/messages.html", "◉"],
      ["Profile", "../Profile/profile.html", "◌"]
    ];
    const current = location.pathname.split("/").filter(Boolean).at(-2)?.toLowerCase();
    this.innerHTML = `<aside class="nutrition-sidebar-nav" id="nutrition-sidebar"><p class="nav-label">WORKSPACE</p><nav aria-label="Nutrition specialist pages">${links.map(([label, href, icon]) => `<a href="${href}"${href.toLowerCase().includes(`/${current}/`) ? ' aria-current="page"' : ""}><span aria-hidden="true">${icon}</span>${label}</a>`).join("")}</nav><a class="nav-logout" href="../../Shared/Login/login.html">Log out <span aria-hidden="true">↗</span></a></aside>`;
  }
});
