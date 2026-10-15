"use strict";

customElements.define("lift-coach-sidebar", class extends HTMLElement {
  connectedCallback() {
    const links = [
      ["Dashboard", "../Dashboard/dashboard.html", "▦"],
      ["My clients", "../MyClients/my-clients.html", "♙"],
      ["Exercise coaching", "../ExerciseCoaching/exercise-coaching.html", "✳"],
      ["Messages", "../Messages/messages.html", "◉"],
      ["Meetings", "../Meetings/meetings.html", "▣"],
      ["Profile", "../Profile/profile.html", "◌"]
    ];
    const current = location.pathname.split("/").filter(Boolean).at(-2)?.toLowerCase();
    this.innerHTML = `<aside class="coach-sidebar" id="coach-sidebar"><div class="sidebar-label">WORKSPACE</div><nav aria-label="Coach pages">${links.map(([label, href, icon]) => `<a href="${href}"${href.toLowerCase().includes(`/${current}/`) ? ' aria-current="page"' : ""}><span class="sidebar-icon" aria-hidden="true">${icon}</span>${label}</a>`).join("")}</nav><a class="sidebar-logout" href="../../Shared/Login/login.html">Log out <span aria-hidden="true">↗</span></a></aside>`;
  }
});
