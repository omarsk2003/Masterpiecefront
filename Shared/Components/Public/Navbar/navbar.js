"use strict";
(() => {
  const root = new URL("../../../../", document.currentScript.src);
  const landing = new URL("Public/LandingPage/landing-page.html", root).href;
  const about = new URL("Public/AboutUs/about-us.html", root).href;
  const contact = new URL("Public/ContactUs/contact-us.html", root).href;
  class LiftNavbar extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<header class="public-navbar"><a class="public-brand" href="${landing}" aria-label="LIFT home"><img src="${new URL("Shared/Assets/Images/lift-logo.png",root).href}" alt="LIFT"></a><nav class="public-nav-links" id="public-navigation" aria-label="Main navigation"><a href="${landing}">Home</a><a href="${about}">About</a><a href="${contact}">Contact</a></nav><div class="public-nav-actions"><button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to light mode"><span data-theme-icon aria-hidden="true">☼</span></button><a class="nav-login" href="${new URL("Shared/Login/login.html",root).href}">Log in</a><a class="nav-start" href="${new URL("Client/Registration/registration.html",root).href}">Start your journey <span>↗</span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="public-navigation" aria-label="Open menu"><span></span><span></span></button></div></header>`;
      const updateCurrent = () => this.querySelectorAll(".public-nav-links a").forEach(link => {
        const url = new URL(link.href);
        const current = url.pathname === location.pathname && url.hash === location.hash;
        if (current) link.setAttribute("aria-current", url.hash ? "location" : "page");
        else link.removeAttribute("aria-current");
      });
      updateCurrent();
      window.addEventListener("hashchange", updateCurrent);
      const toggle = this.querySelector(".menu-toggle");
      const links = this.querySelector(".public-nav-links");
      const close = () => { toggle.setAttribute("aria-expanded","false"); toggle.setAttribute("aria-label","Open menu"); links.classList.remove("open"); };
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        links.classList.toggle("open", open);
      });
      links.addEventListener("click", event => { if(event.target.closest("a")) close(); });
      this.addEventListener("keydown", event => { if(event.key === "Escape") { close(); toggle.focus(); } });
    }
  }
  customElements.define("lift-navbar", LiftNavbar);
})();


