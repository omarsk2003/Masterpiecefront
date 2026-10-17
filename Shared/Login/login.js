"use strict";

// Static preview accounts only. These are not real credentials or authentication.
// Never store real passwords in frontend code. Backend authentication comes later.
const previewAccounts = [
  { email: "client@lift.demo", password: "Lift2026!", page: "../../Client/Dashboard/dashboard.html", plan: "premium", name: "Alexander Drake" },
  { email: "client.free@lift.demo", password: "Lift2026!", page: "../../Client/Dashboard/dashboard.html", plan: "free", name: "Free Client" },
  { email: "client.ai@lift.demo", password: "Lift2026!", page: "../../Client/Dashboard/dashboard.html", plan: "ai", name: "AI Plan Client" },
  { email: "coach@lift.demo", password: "Lift2026!", page: "../../Coach/Dashboard/dashboard.html" },
  { email: "nutritionist@lift.demo", password: "Lift2026!", page: "../../Nutrition/Dashboard/dashboard.html" },
  { email: "admin@lift.demo", password: "Lift2026!", page: "../../Admin/Dashboard/dashboard.html" }
];

const form = document.getElementById("login-form");
const email = document.getElementById("email");
const password = document.getElementById("password");
const passwordToggle = document.getElementById("toggle-password");
const message = document.getElementById("form-message");
const submitButton = document.getElementById("sign-in");
const status = document.getElementById("sign-in-status");
const recoveryDialog = document.getElementById("recovery-dialog");
const journeyLine = document.querySelector(".route-line");
const journeyMarker = document.querySelector(".route-marker");
const journeyStage = document.getElementById("journey-stage");
let redirectTimer;

function updateJourney(stage) {
  const steps = {
    ready: { progress: 0, x: 0, y: 0, label: "READY TO CONTINUE" },
    email: { progress: 24, x: 150, y: -71, label: "FINDING YOUR PATH" },
    emailValid: { progress: 35, x: 210, y: -49, label: "FIRST STEP COMPLETE" },
    password: { progress: 52, x: 299, y: -11, label: "KEEP MOVING" },
    valid: { progress: 78, x: 466, y: -81, label: "NEXT STEP READY" },
    error: { progress: 24, x: 150, y: -71, label: "TAKE ANOTHER STEP" },
    success: { progress: 100, x: 571, y: -121, label: "CHECKPOINT REACHED" }
  };
  const next = steps[stage];
  journeyLine.style.strokeDasharray = `${next.progress} 100`;
  journeyMarker.style.transform = `translate(${next.x}px, ${next.y}px)`;
  journeyStage.textContent = next.label;
}

function syncJourney() {
  const validEmail = email.value.trim() && email.validity.valid;
  updateJourney(validEmail && password.value ? "valid" : password.value ? "password" : validEmail ? "emailValid" : email.value.trim() ? "email" : "ready");
}

function setError(input, text) {
  document.getElementById(input.id + "-error").textContent = text;
  input.setAttribute("aria-invalid", String(Boolean(text)));
}

function clearMessage() {
  message.hidden = true;
  message.textContent = "";
}

[email, password].forEach(input => {
  input.addEventListener("focus", () => updateJourney(input === email ? "email" : "password"));
  input.addEventListener("input", () => {
    setError(input, "");
    clearMessage();
    syncJourney();
  });
});

passwordToggle.addEventListener("click", () => {
  const visible = password.type === "password";
  password.type = visible ? "text" : "password";
  passwordToggle.setAttribute("aria-label", visible ? "Hide password" : "Show password");
  passwordToggle.setAttribute("aria-pressed", String(visible));
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (submitButton.disabled) return;
  clearMessage();
  const address = email.value.trim();
  email.value = address;
  const emailError = !address ? "Enter your email address." : email.validity.typeMismatch ? "Enter a valid email address." : "";
  const passwordError = !password.value ? "Enter your password." : "";
  setError(email, emailError);
  setError(password, passwordError);
  if (emailError || passwordError) {
    (emailError ? email : password).focus();
    updateJourney("error");
    return;
  }
  let account = null;
  const preview = previewAccounts.find(item => item.email === address.toLowerCase());
  if (preview && await window.LiftAccountSecurity.verify(address, password.value, preview.password)) account = preview;
  if (!account) {
    try {
      const registered = window.LiftClientAccounts.find(address);
      if (registered && await window.LiftAccountSecurity.verify(address, password.value, value => window.LiftClientAccounts.verify(registered, value))) {
        account = { ...registered, page: "../../Client/Dashboard/dashboard.html" };
      }
    } catch {
      message.textContent = "Local account storage is unavailable. Open LIFT on a local server and try again.";
      message.hidden = false;
      updateJourney("error");
      return;
    }
  }
  if (!account) {
    try {
      const applications = await window.LiftSpecialistApplications.all();
      const application = applications.find(item => item.email === address.toLowerCase());
      if (application && await window.LiftAccountSecurity.verify(address, password.value, value => window.LiftSpecialistApplications.verifyCredential(application, value))) {
        const applicationStatus = window.LiftAccountStatus.get(application.role, address, application.status);
        if (applicationStatus !== "active") {
          message.textContent = ({ pending: "Your application is awaiting admin review.", rejected: "Your application was not approved.", suspended: "This account is suspended.", blocked: "This account is blocked." })[applicationStatus] || "This account is not active.";
          message.hidden = false;
          updateJourney("error");
          return;
        }
        account = { page: application.role === "coach" ? "../../Coach/Dashboard/dashboard.html" : "../../Nutrition/Dashboard/dashboard.html" };
      }
    } catch {
      message.textContent = "Local account storage is unavailable in this browser. Try opening LIFT on a local server.";
      message.hidden = false;
      updateJourney("error");
      return;
    }
  }
  if (!account) {
    const admin = await window.LiftAccountSecurity.verifyAdmin(address, password.value);
    if (admin) account = { ...admin, page: "../../Admin/Dashboard/dashboard.html" };
  }
  if (account) {
    const role = account.plan ? "client" : account.page.includes("/Coach/") ? "coach" : account.page.includes("/Nutrition/") ? "nutritionist" : "admin";
    const state = role === "admin" && address.toLowerCase() === "admin@lift.demo" ? "active" : window.LiftAccountStatus.get(role, address, account.status || "active");
    if (state !== "active") {
      message.textContent = ({ pending: "This account is pending approval.", rejected: "This account was not approved.", suspended: "This account is suspended. Contact LIFT Admin.", blocked: "This account is blocked. Contact LIFT Admin." })[state] || "This account is not active.";
      message.hidden = false;
      updateJourney("error");
      return;
    }
  }
  if (account?.plan) {
    const member = { name: account.name, email: address.toLowerCase(), plan: account.plan,
      createdAt: account.createdAt, requiresPersonalization: Boolean(account.requiresPersonalization || account.createdAt), preview: true };
    try { localStorage.setItem("lift-preview-member-v1", JSON.stringify(member)); sessionStorage.removeItem("lift-preview-member-v1"); }
    catch {
      message.textContent = "Could not open this Client account because browser storage is unavailable.";
      message.hidden = false;
      updateJourney("error");
      return;
    }
  }
  if (!account) {
    message.textContent = "The email or password doesn't match. Please try again.";
    message.hidden = false;
    password.focus();
    updateJourney("error");
    return;
  }
  if (/\.\.\/\.\.\/(Coach|Nutrition)\//.test(account.page)) {
    localStorage.setItem("lift-specialist-session-email", address.toLowerCase());
    localStorage.setItem("lift-specialist-session-role", account.page.includes("/Coach/") ? "coach" : "nutritionist");
  }
  if (account.page.includes("../../Admin/")) localStorage.setItem("lift-admin-session-email", address.toLowerCase());
  updateJourney("success");
  submitButton.disabled = true;
  submitButton.querySelector(".button-arrow").hidden = true;
  submitButton.querySelector(".spinner").hidden = false;
  submitButton.querySelector("span").textContent = "Opening your dashboard";
  status.textContent = "Welcome back. Taking you to your dashboard…";
  redirectTimer = window.setTimeout(() => window.location.assign(account.page), 650);
});

document.getElementById("forgot-password").addEventListener("click", () => recoveryDialog.showModal());
document.getElementById("close-recovery").addEventListener("click", () => recoveryDialog.close());
recoveryDialog.addEventListener("click", event => {
  const rect = recoveryDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) recoveryDialog.close();
});
// Restore the form when navigating back from a preview dashboard.
window.addEventListener("pageshow", () => {
  clearTimeout(redirectTimer);
  submitButton.disabled = false;
  submitButton.querySelector(".button-arrow").hidden = false;
  submitButton.querySelector(".spinner").hidden = true;
  submitButton.querySelector("span").textContent = "Sign in";
  status.textContent = "";
  syncJourney();
});
const accountState = new URLSearchParams(location.search).get("account");
if (["suspended", "blocked", "rejected"].includes(accountState)) {
  message.textContent = accountState === "suspended" ? "This account is suspended. Contact LIFT Admin." : accountState === "blocked" ? "This account is blocked. Contact LIFT Admin." : "This account was not approved.";
  message.hidden = false;
}


