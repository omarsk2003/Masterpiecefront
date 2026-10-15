"use strict";

const form = document.getElementById("status-form");
const result = document.getElementById("result");
form.addEventListener("submit", async event => {
  event.preventDefault();
  const email = document.getElementById("application-email").value.trim().toLowerCase();
  const title = document.createElement("strong");
  const detail = document.createElement("p");
  try {
    const applications = await window.LiftSpecialistApplications.all();
    const record = applications.find(item => item.role === "nutritionist" && item.email === email);
    if (!record) {
      title.textContent = "No application found";
      detail.textContent = "Check the email you used for nutrition specialist registration.";
    } else {
      title.textContent = ({ pending: "Awaiting admin review", active: "Approved and active", rejected: "Application not approved", blocked: "Account blocked" })[record.status] || "Application received";
      detail.textContent = record.status === "active"
        ? "Your account is active. You can sign in from the login page."
        : record.status === "pending"
          ? "The admin needs to review your professional details and certificates before activation."
          : "Contact LIFT Admin if you need clarification about this status.";
    }
  } catch {
    title.textContent = "Status unavailable";
    detail.textContent = "Local application storage could not be opened in this browser.";
  }
  result.replaceChildren(title, detail);
  result.hidden = false;
});
