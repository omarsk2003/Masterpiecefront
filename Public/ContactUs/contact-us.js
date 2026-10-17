"use strict";
(() => {
  const form = document.getElementById("landing-contact-form");
  const status = document.getElementById("contact-status");
  const showStatus = (message, state) => {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
    window.LiftNotice[state === "success" ? "success" : "error"](message);
  };
  form.addEventListener("input", () => { status.hidden = true; });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const endpoint = form.dataset.endpoint?.trim();
    if (!endpoint) {
      showStatus("Message sending is not available yet. Your details remain in this form and have not been sent.", "error");
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      if (!response.ok) throw new Error(`Contact service returned ${response.status}`);
      form.reset();
      showStatus("Your message has been sent. We’ll get back to you.", "success");
    } catch {
      showStatus("We could not send your message. Please try again later.", "error");
    } finally {
      button.disabled = false;
    }
  });
})();
