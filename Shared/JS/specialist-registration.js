"use strict";
(() => {
  const config = {
    coach: {
      title: "Coach", intro: "Help people train for the life and goals they actually have.",
      specialties: [["muscle", "Strength & muscle building"], ["weight", "Weight management & general fitness"], ["football", "Football performance & conditioning"], ["multisport", "Multi-sport performance & conditioning"]],
      extras: `<fieldset class="checkbox-group" data-required-group="levels"><legend>Client experience levels</legend><div class="checkbox-options"><label><input type="checkbox" name="levels" value="beginner"> Beginner</label><label><input type="checkbox" name="levels" value="intermediate"> Intermediate</label><label><input type="checkbox" name="levels" value="advanced"> Advanced</label></div></fieldset><fieldset class="checkbox-group" data-required-group="locations"><legend>Training locations</legend><div class="checkbox-options"><label><input type="checkbox" name="locations" value="gym"> Gym</label><label><input type="checkbox" name="locations" value="home"> Home</label><label><input type="checkbox" name="locations" value="field"> Outdoor / field</label></div></fieldset><fieldset class="checkbox-group" data-required-group="durations"><legend>Session lengths you support</legend><div class="checkbox-options"><label><input type="checkbox" name="durations" value="30"> 30 min</label><label><input type="checkbox" name="durations" value="45"> 45 min</label><label><input type="checkbox" name="durations" value="60"> 60 min</label><label><input type="checkbox" name="durations" value="90"> 90+ min</label></div></fieldset>`
    },
    nutritionist: {
      title: "Nutritionist", intro: "Make nutrition guidance practical, personal, and sustainable.",
      specialties: [["muscle", "Muscle-building & everyday nutrition"], ["weight", "Weight-management nutrition"], ["sports", "Sports nutrition"], ["balanced", "Balanced everyday nutrition"]],
      extras: `<fieldset class="checkbox-group" data-required-group="cookingStyles"><legend>Food routines you support</legend><div class="checkbox-options"><label><input type="checkbox" name="cookingStyles" value="home"> Cook at home</label><label><input type="checkbox" name="cookingStyles" value="family"> Family meals</label><label><input type="checkbox" name="cookingStyles" value="delivery"> Meal delivery</label><label><input type="checkbox" name="cookingStyles" value="restaurant"> Restaurant / takeout</label></div></fieldset>`
    }
  };
  const goalOptions = [["muscle", "Build Muscle"], ["lose", "Lose Weight"], ["gain", "Gain Weight"], ["maintain", "Maintain Weight"], ["fitness", "Improve Fitness"], ["performance", "Sports Performance"]];
  const sportOptions = [["football", "Football"], ["basketball", "Basketball"], ["running", "Running"], ["other", "Other sport"]];
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const checkboxes = (name, options) => `<div class="checkbox-options">${options.map(([value, label]) => `<label><input type="checkbox" name="${name}" value="${value}"> ${label}</label>`).join("")}</div>`;
  const chosen = (form, name) => [...form.querySelectorAll(`[name="${name}"]:checked`)].map(input => input.value);
  function init(role) {
    const details = config[role];
    const $ = selector => document.querySelector(selector);
    $("#registration-root").innerHTML = `<header class="register-header"><a href="../../Public/LandingPage/landing-page.html" aria-label="LIFT home"><img src="../../Shared/Assets/Images/lift-logo.png" alt="LIFT"></a><div class="header-actions"><button type="button" data-theme-toggle aria-label="Switch to light mode"><span data-theme-icon aria-hidden="true">☼</span></button><a href="../../Shared/Login/login.html">Already registered? Log in ↗</a></div></header><main class="registration-layout"><aside class="intro-panel"><p class="eyebrow">JOIN THE LIFT TEAM</p><h1>Your expertise.<br><em>Their progress.</em></h1><p>${details.intro} Submit your professional details and PDF certificates for admin review.</p><div class="process-list"><div><b>01</b> Complete your application</div><div><b>02</b> Admin reviews your certificates</div><div><b>03</b> Account activates after approval</div></div></aside><section class="application-card" aria-labelledby="form-title"><form id="application-form" novalidate><p class="eyebrow">${role.toUpperCase()} APPLICATION</p><h2 id="form-title">Join as a ${details.title.toLowerCase()}</h2><p>Applications remain pending until your PDF certificates are reviewed.</p><div class="form-section"><h3>Account details</h3><div class="field-grid"><label class="field">Full name<input name="name" autocomplete="name" maxlength="80" required></label><label class="field">Email address<input name="email" type="email" autocomplete="email" maxlength="120" required></label><label class="field">Phone number<input name="phone" type="tel" autocomplete="tel" maxlength="24" required></label><label class="field">Years of experience<input name="experienceYears" type="number" min="0" max="60" step="1" required></label><label class="field">Password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label><label class="field">Confirm password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></label></div></div><div class="form-section"><h3>Professional profile</h3><div class="field-grid"><label class="field">Primary specialty<select name="focus" required><option value="">Select your specialty</option>${details.specialties.map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label><label class="field wide">Professional bio<textarea name="bio" maxlength="500" rows="4" placeholder="Describe your approach and the clients you work with…" required></textarea></label></div><fieldset class="checkbox-group" data-required-group="goals"><legend>Goals you support</legend>${checkboxes("goals", goalOptions)}</fieldset><fieldset class="checkbox-group"><legend>Sports you support <small>(optional)</small></legend>${checkboxes("sports", sportOptions)}</fieldset>${details.extras}</div><div class="form-section"><h3>Certificates</h3><label class="upload-zone"><strong>Upload your certificate PDFs</strong><span>1–5 PDF files, up to 10 MB each</span><input id="certificate-files" name="certificates" type="file" accept="application/pdf,.pdf" multiple required aria-label="Upload PDF certificates"></label><ul class="upload-list" id="upload-list"></ul></div><p id="form-message" class="form-message" role="alert" hidden></p><div class="submit-row"><p>Your application is saved on this device for the current frontend preview.</p><button id="submit-application" type="submit">Submit application ↗</button></div></form><div class="success-panel" id="success-panel" hidden><span aria-hidden="true">✓</span><h2>Application sent for review.</h2><p>Your ${details.title.toLowerCase()} account is pending. The admin can open your uploaded PDF certificates before approving or rejecting it.</p><a href="../../Shared/Login/login.html">Back to login ↗</a></div></section></main>`;
    const form = $("#application-form");
    const fileInput = $("#certificate-files");
    const error = $("#form-message");
    function showError(message) { error.textContent = message; error.hidden = false; }
    fileInput.addEventListener("change", () => {
      $("#upload-list").innerHTML = [...fileInput.files].map(file => `<li><span>${escapeHtml(file.name)}</span><small>${(file.size / 1048576).toFixed(1)} MB</small></li>`).join("");
      error.hidden = true;
    });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      error.hidden = true;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      const data = new FormData(form);
      if (data.get("password") !== data.get("confirmPassword")) { showError("Passwords do not match."); return; }
      for (const group of form.querySelectorAll("[data-required-group]")) if (!chosen(form, group.dataset.requiredGroup).length) { showError(`Select at least one option for ${group.querySelector("legend").textContent.toLowerCase()}.`); group.scrollIntoView({ block: "center" }); return; }
      const files = [...fileInput.files];
      if (!files.length || files.length > 5) { showError("Upload between 1 and 5 PDF certificates."); return; }
      for (const file of files) {
        if (file.size > 10 * 1048576 || file.size < 5 || !file.name.toLowerCase().endsWith(".pdf")) { showError("Each certificate must be a PDF under 10 MB."); return; }
        const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
        if (header !== "%PDF-") { showError(`“${file.name}” is not a valid PDF file.`); return; }
      }
      const button = $("#submit-application");
      button.disabled = true;
      button.textContent = "Saving application…";
      try {
        const existing = await window.LiftSpecialistApplications.all();
        const email = String(data.get("email")).trim().toLowerCase();
        if (existing.some(item => item.email === email)) { showError("An application with this email already exists on this device."); return; }
        const focus = details.specialties.find(([value]) => value === data.get("focus"));
        const credential = await window.LiftSpecialistApplications.createCredential(String(data.get("password")));
        const record = {
          id: `${role}-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`, role, name: String(data.get("name")).trim(), email, phone: String(data.get("phone")).trim(),
          experienceYears: Number(data.get("experienceYears")), focus: focus[0], specialty: focus[1], bio: String(data.get("bio")).trim(),
          goals: chosen(form, "goals"), sports: chosen(form, "sports"),
          levels: role === "coach" ? chosen(form, "levels") : [], locations: role === "coach" ? chosen(form, "locations") : [], durations: role === "coach" ? chosen(form, "durations").map(Number) : [],
          cookingStyles: role === "nutritionist" ? chosen(form, "cookingStyles") : [],
          certificates: files.map(file => ({ title: file.name.replace(/\.pdf$/i, ""), issuer: "Uploaded PDF", year: "", fileName: file.name, blob: file })),
          applied: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()),
          status: "pending", verified: false, assigned: 0, capacity: null, ...credential
        };
        await window.LiftSpecialistApplications.put(record);
        form.hidden = true;
        $("#success-panel").hidden = false;
        $("#success-panel").scrollIntoView({ block: "center" });
      } catch { showError("Could not save the PDFs in this browser. Open LIFT on a local server and try again."); }
      finally { button.disabled = false; button.textContent = "Submit application ↗"; }
    });
  }
  window.LiftSpecialistRegistration = { init };
})();
