"use strict";

(() => {
  const root = new URL("../../../../", document.currentScript.src);
  const links = [
    ["Dashboard", "Client/Dashboard/dashboard.html"],
    ["AI Assistant", "Client/AIAssistant/ai-assistant.html"],
    ["Workout", "Client/Workout/workout.html"],
    ["Nutrition", "Client/Nutrition/nutrition.html"],
    ["Progress", "Client/Progress/progress.html"],
    ["Messages", "Client/Messages/messages.html", "canUseProfessionalMessaging"],
    ["Meetings", "Client/Meetings/meetings.html", "canUseProfessionalMeetings"],
    ["Support", "Client/Support/support.html"]
  ];

  class LiftClientNavbar extends HTMLElement {
    connectedCallback() {
      const logo = new URL("Shared/Assets/Images/lift-logo.png", root).href;
      const access = window.LiftClientAccess;
      const items = links.filter(([, , feature]) => feature === "nonPremium" ? access?.isPremium() === false : !feature || access?.[feature] !== false).map(([label, path]) => {
        const href = new URL(path, root).href;
        const current = new URL(href).pathname === location.pathname ? ' aria-current="page"' : "";
        return `<a href="${href}"${current}>${label}</a>`;
      }).join("");
      const profile = new URL("Client/Profile/profile.html", root).href;
      const previewMember = access?.member || null;
      const displayName = previewMember?.name || "Alexander Drake";
      const initials = displayName.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
      const profileHref = profile;
      const tier = ({free:"FREE",ai:"AI PLAN",premium:"PREMIUM"})[previewMember?.plan] || "PREMIUM";
      const subscription = new URL("Client/Subscription/subscription.html", root).href;
      const upgrade = access?.plan === "free" || access?.plan === "ai";
      const login = new URL("Shared/Login/login.html", root).href;
      this.innerHTML = `<header class="client-navbar"><a class="client-brand" href="${new URL("Client/Dashboard/dashboard.html", root).href}" aria-label="LIFT dashboard"><img src="${logo}" alt="LIFT"></a><nav class="client-nav-links" id="client-navigation" aria-label="Client navigation">${items}</nav><div class="client-nav-end">${upgrade ? `<a class="client-upgrade-link" href="${subscription}">Upgrade your plan ↗</a>` : ""}<button class="client-theme-toggle" type="button" data-theme-toggle aria-label="Switch to light mode"><span data-theme-icon aria-hidden="true">☼</span></button><div class="client-account"><button class="client-profile-trigger" type="button" aria-label="Open account menu" aria-expanded="false" aria-haspopup="true"><span class="client-avatar" aria-hidden="true">${initials}</span><span class="client-display-name"></span><span class="client-plan-badge">${tier}</span><span class="client-profile-chevron" aria-hidden="true">⌄</span></button><div class="client-account-menu" hidden><span class="client-account-caption"></span><a href="${profileHref}">My Profile <span aria-hidden="true">↗</span></a><a href="${login}">Log out <span aria-hidden="true">↗</span></a></div></div></div><button class="client-menu-toggle" type="button" aria-label="Open navigation" aria-controls="client-navigation" aria-expanded="false"><span></span><span></span><span></span></button></header>`;
      this.querySelector(".client-display-name").textContent = displayName;
      this.querySelector(".client-account-caption").textContent = `${displayName.toUpperCase()} · ${tier}`;
      if (previewMember?.email) {
        try {
          const photo = localStorage.getItem(`lift-client-avatar-${previewMember.email}`);
          if (photo) {
            const avatar = this.querySelector(".client-avatar");
            const image = document.createElement("img");
            image.src = photo;
            image.alt = "";
            avatar.replaceChildren(image);
          }
        } catch { /* Initials remain available. */ }
      }
      if (previewMember) this.querySelector('.client-account-menu a[href="' + login + '"]').addEventListener("click", () => {
        try { localStorage.removeItem("lift-preview-member-v1"); sessionStorage.removeItem("lift-preview-member-v1"); sessionStorage.removeItem("lift-profile-prompt-dismissed"); } catch { /* Navigation still works. */ }
      });
      if (window.LiftTheme) {
        const icon = this.querySelector("[data-theme-icon]");
        const next = window.LiftTheme.get() === "dark" ? "light" : "dark";
        icon.textContent = next === "light" ? "☼" : "☾";
        icon.parentElement.setAttribute("aria-label", `Switch to ${next} mode`);
      }
      const button = this.querySelector(".client-menu-toggle");
      const nav = this.querySelector(".client-nav-links");
      button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(open));
        button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
        nav.classList.toggle("open", open);
      });
      nav.addEventListener("click", event => {
        if (!event.target.closest("a")) return;
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open navigation");
        nav.classList.remove("open");
      });
      const account = this.querySelector(".client-account");
      const trigger = this.querySelector(".client-profile-trigger");
      const menu = this.querySelector(".client-account-menu");
      const closeAccount = () => {
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-label", "Open account menu");
        menu.hidden = true;
      };
      trigger.addEventListener("click", () => {
        const open = trigger.getAttribute("aria-expanded") !== "true";
        trigger.setAttribute("aria-expanded", String(open));
        trigger.setAttribute("aria-label", open ? "Close account menu" : "Open account menu");
        menu.hidden = !open;
      });
      document.addEventListener("click", event => {
        if (!account.contains(event.target)) closeAccount();
      });
      document.addEventListener("keydown", event => {
        if (event.key !== "Escape" || menu.hidden) return;
        closeAccount();
        trigger.focus();
      });
    }
  }
  customElements.define("lift-client-navbar", LiftClientNavbar);
})();


