"use strict";
(() => {
  const root = new URL("../../../../", document.currentScript.src);
  const landing = new URL("Public/LandingPage/landing-page.html",root).href;
  const about = new URL("Public/AboutUs/about-us.html",root).href;
  const contact = new URL("Public/ContactUs/contact-us.html",root).href;
  class LiftFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<footer class="public-footer"><div class="footer-top"><div class="footer-brand-block"><a class="footer-brand" href="${landing}" aria-label="LIFT home"><img src="${new URL("Shared/Assets/Images/lift-logo.png",root).href}" alt="LIFT"></a><p>A healthier life.<br>A rhythm that's yours.</p></div><div class="footer-column"><h2>EXPLORE LIFT</h2><a href="${about}">About LIFT</a><a href="${about}#real-life">Built for real life</a><a href="${about}#faq">FAQ</a><a href="${landing}#plans">Memberships</a></div><div class="footer-column"><h2>BUILD WITH US</h2><a href="${new URL("Coach/Registration/registration.html",root).href}">Become a coach ↗</a><a href="${new URL("Nutrition/Registration/registration.html",root).href}">Become a nutritionist ↗</a><a href="${contact}">Get in touch ↗</a></div><div class="footer-statement">A little progress.<br><em>Every single day.</em><span>✳</span></div></div><div class="footer-social"><span>SOCIAL PLATFORMS</span><div class="footer-social-links"><a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Instagram"><b aria-hidden="true">IG</b>Instagram <span aria-hidden="true">↗</span></a><a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Facebook"><b aria-hidden="true">f</b>Facebook <span aria-hidden="true">↗</span></a><a href="https://www.snapchat.com/" target="_blank" rel="noopener noreferrer" aria-label="Open Snapchat"><b aria-hidden="true">S</b>Snapchat <span aria-hidden="true">↗</span></a><a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="Open TikTok"><b aria-hidden="true">♪</b>TikTok <span aria-hidden="true">↗</span></a></div></div><div class="footer-bottom"><span>© 2026 LIFT. All rights reserved.</span><span>LIFESTYLE & INTELLIGENT FITNESS TECHNOLOGY</span><a href="${landing}#home">BACK TO TOP ↑</a></div></footer>`;
    }
  }
  customElements.define("lift-footer",LiftFooter);
})();


