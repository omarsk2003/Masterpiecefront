"use strict";

// Shared UI for the two professional directories. Account changes are saved in this browser.
(() => {
  const pdfAssets = new URL("../../Shared/Vendor/pdfjs/", document.currentScript.src);
  let pdfLibraryPromise;
  const sampleProfiles = {
    "coach-sarah": { email: "coach@lift.demo", experienceYears: 8, applied: "02 Oct 2026", bio: "Strength and conditioning coach focused on sustainable muscle-building plans.", certificates: [["Certified Strength Coach", "Sample Fitness Academy", "2020"], ["Exercise Programming", "Sample Training Institute", "2022"]] },
    "coach-daniel": { email: "daniel@lift.demo", experienceYears: 6, applied: "03 Oct 2026", bio: "Helps beginners build a realistic fitness routine and work toward weight-management goals.", certificates: [["Personal Training", "Sample Fitness Academy", "2019"]] },
    "coach-yousef": { email: "yousef@lift.demo", experienceYears: 7, applied: "04 Oct 2026", bio: "Football conditioning coach focused on sport-specific strength, speed, and endurance.", certificates: [["Sports Performance Coaching", "Sample Sports Academy", "2020"], ["Football Conditioning", "Sample Coaching Institute", "2023"]] },
    "coach-rami": { email: "rami@lift.demo", experienceYears: 5, applied: "05 Oct 2026", bio: "Works with athletes across team and individual sports on general conditioning.", certificates: [["Athletic Performance", "Sample Sports Academy", "2021"]] },
    "coach-omar": { email: "omar@lift.demo", experienceYears: 5, applied: "08 Oct 2026", bio: "Coach applicant focused on weight-management training for beginners.", certificates: [["Certified Personal Trainer", "Sample Fitness Academy", "2021"], ["Weight Management Coaching", "Sample Coaching Institute", "2023"]] },
    "nutrition-maya": { email: "nutritionist@lift.demo", experienceYears: 6, applied: "03 Oct 2026", bio: "Builds practical everyday nutrition plans around muscle-building goals and food routines.", certificates: [["Nutrition & Dietetics", "Sample Health University", "2019"]] },
    "nutrition-dina": { email: "dina@lift.demo", experienceYears: 6, applied: "04 Oct 2026", bio: "Supports sustainable weight-management nutrition and realistic meal planning.", certificates: [["Nutrition Practice", "Sample Health University", "2020"]] },
    "nutrition-leen": { email: "leen@lift.demo", experienceYears: 5, applied: "05 Oct 2026", bio: "Sports nutritionist supporting training and competition routines.", certificates: [["Sports Nutrition", "Sample Nutrition Academy", "2021"], ["Performance Nutrition", "Sample Sports Academy", "2023"]] },
    "nutrition-lina": { email: "lina@lift.demo", experienceYears: 4, applied: "09 Oct 2026", bio: "Nutritionist applicant focused on balanced meal planning.", certificates: [["Nutrition & Dietetics", "Sample Health University", "2020"], ["Sports Nutrition Practice", "Sample Nutrition Academy", "2022"]] }
  };
  const focusOptions = {
    coach: [
      { key: "muscle", label: "Strength & muscle building", goals: ["muscle", "gain"], sports: [] },
      { key: "weight", label: "Weight management & general fitness", goals: ["lose", "fitness", "maintain"], sports: [] },
      { key: "football", label: "Football performance & conditioning", goals: ["performance"], sports: ["football"] },
      { key: "multisport", label: "Multi-sport performance & conditioning", goals: ["performance"], sports: ["general"] }
    ],
    nutritionist: [
      { key: "muscle", label: "Muscle-building & everyday nutrition", goals: ["muscle", "gain", "fitness", "maintain"], sports: [] },
      { key: "weight", label: "Weight-management nutrition", goals: ["lose"], sports: [] },
      { key: "sports", label: "Sports nutrition", goals: ["performance"], sports: ["football", "basketball", "running", "other"] },
      { key: "balanced", label: "Balanced everyday nutrition", goals: ["fitness", "maintain"], sports: [] }
    ]
  };
  const initialFocus = {
    "coach-sarah": "muscle", "coach-daniel": "weight", "coach-yousef": "football", "coach-rami": "multisport", "coach-omar": "weight",
    "nutrition-maya": "muscle", "nutrition-dina": "weight", "nutrition-leen": "sports", "nutrition-lina": "balanced"
  };
  const statusLabels = { active: "Active", pending: "Pending", suspended: "Suspended", blocked: "Blocked", rejected: "Rejected" };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const initials = name => name.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase();

  function init(role) {
    const people = role === "coach" ? window.LiftMatching.coaches : window.LiftMatching.nutritionists;
    const accountStatus = window.LiftAccountStatus;
    let pdfUrl = null;
    let pdfRenderVersion = 0;
    for (const person of people) {
      const extra = sampleProfiles[person.id];
      Object.assign(person, {
        email: extra.email, experienceYears: extra.experienceYears, applied: extra.applied,
        bio: extra.bio, certificates: extra.certificates.map(([title, issuer, year]) => ({ title, issuer, year })),
        focus: initialFocus[person.id]
      });
      person.status = accountStatus.get(role, person.email, person.status);
      person.verified = person.status === "active";
    }
    const $ = selector => document.querySelector(selector);
    let selectedId = null;
    let viewed = new Set();
    const selectedPerson = () => people.find(person => person.id === selectedId);
    const headingActions = document.createElement("div");
    headingActions.className = "specialist-heading-actions";
    const headingPill = $(".specialist-heading .heading-pill");
    headingPill.replaceWith(headingActions);
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "add-specialist-button";
    addButton.textContent = role === "coach" ? "Add coach ↗" : "Add nutritionist ↗";
    headingActions.append(headingPill, addButton);
    const filterOption = document.createElement("option");
    filterOption.value = "suspended";
    filterOption.textContent = "Suspended";
    $("#status-filter option[value='blocked']").before(filterOption);
    for (const state of ["suspended", "blocked"]) {
      const card = document.createElement("article");
      const label = document.createElement("span"); label.textContent = state.toUpperCase();
      const value = document.createElement("strong"); value.id = `stat-${state}`;
      card.append(label, value);
      $(".specialist-stats").append(card);
    }
    const suspendButton = document.createElement("button");
    suspendButton.id = "suspend-profile";
    suspendButton.type = "button";
    suspendButton.className = "secondary-action";
    suspendButton.hidden = true;
    $("#block-profile").before(suspendButton);
    const addDialog = document.createElement("dialog");
    addDialog.className = "edit-dialog add-specialist-dialog";
    addDialog.setAttribute("aria-labelledby", "add-specialist-title");
    addDialog.innerHTML = `<form id="add-specialist-form"><div class="dialog-heading"><div><p class="eyebrow">TEAM ACCESS</p><h2 id="add-specialist-title">Add ${role === "coach" ? "coach" : "nutritionist"}</h2></div><button id="close-add-specialist" type="button" aria-label="Close form">×</button></div><p class="add-specialist-intro">Create an active account with an initial password. The specialist can change it in their profile.</p><div class="edit-grid"><label>Full name<input name="name" maxlength="80" required></label><label>Email<input name="email" type="email" maxlength="120" required></label><label>Initial password<input name="password" type="password" minlength="8" autocomplete="new-password" required></label><label>Primary specialty<select name="focus" required></select></label><label>Experience (years)<input name="experienceYears" type="number" min="0" max="60" required></label><label>Client capacity<input name="capacity" type="number" min="1" max="100" required></label><label class="wide">Professional bio<textarea name="bio" maxlength="500" rows="3" required></textarea></label></div><p id="add-specialist-error" class="edit-error" role="alert" hidden></p><div class="edit-actions"><button type="button" class="secondary-action" id="cancel-add-specialist">Cancel</button><button type="submit" class="approve-action">Create account ↗</button></div></form>`;
    document.body.append(addDialog);
    const addForm = addDialog.querySelector("form");
    addForm.elements.namedItem("focus").innerHTML = focusOptions[role].map(option => `<option value="${option.key}">${escapeHtml(option.label)}</option>`).join("");
    addButton.addEventListener("click", () => { addForm.reset(); addDialog.querySelector("#add-specialist-error").hidden = true; addDialog.showModal(); addForm.elements.namedItem("name").focus(); });
    addDialog.querySelector("#close-add-specialist").addEventListener("click", () => addDialog.close());
    addDialog.querySelector("#cancel-add-specialist").addEventListener("click", () => addDialog.close());
    addForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (!addForm.reportValidity()) return;
      const name = addForm.elements.namedItem("name").value.trim();
      const email = addForm.elements.namedItem("email").value.trim().toLowerCase();
      const error = addDialog.querySelector("#add-specialist-error");
      const fail = message => { error.textContent = message; error.hidden = false; window.LiftNotice.warning(message); };
      if (name.length < 2) return fail("Enter the specialist's full name.");
      if (!addForm.elements.namedItem("bio").value.trim()) return fail("Enter a professional bio.");
      try {
        const records = await window.LiftSpecialistApplications.all();
        const reserved = ["admin@lift.demo", "client@lift.demo", "client.free@lift.demo", "client.ai@lift.demo", "coach@lift.demo", "nutritionist@lift.demo"];
        let clientAccounts = [], adminAccounts = [];
        try { clientAccounts = JSON.parse(localStorage.getItem("lift-client-accounts-v1") || "[]"); adminAccounts = JSON.parse(localStorage.getItem("lift-admin-accounts-v1") || "[]"); } catch { /* Existing records are still checked below. */ }
        if (reserved.includes(email) || records.some(item => item.email === email) || Object.values(sampleProfiles).some(item => item.email === email) || clientAccounts.some(item => item.email === email) || adminAccounts.some(item => item.email === email)) return fail("This email already belongs to a LIFT account.");
        const focus = focusOptions[role].find(option => option.key === addForm.elements.namedItem("focus").value);
        const credential = await window.LiftSpecialistApplications.createCredential(addForm.elements.namedItem("password").value);
        const record = {
          id: `${role}-admin-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
          role, name, email, phone: "", experienceYears: Number(addForm.elements.namedItem("experienceYears").value),
          focus: focus.key, specialty: focus.label, bio: addForm.elements.namedItem("bio").value.trim(),
          goals: [...focus.goals], sports: [...focus.sports],
          levels: role === "coach" ? ["beginner", "intermediate", "advanced"] : [],
          locations: role === "coach" ? ["gym", "home", "field"] : [],
          durations: role === "coach" ? [30, 45, 60, 90] : [],
          cookingStyles: role === "nutritionist" ? ["home", "family", "delivery", "restaurant"] : [],
          certificates: [], applied: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          status: "active", verified: true, assigned: 0, capacity: Number(addForm.elements.namedItem("capacity").value),
          createdByAdmin: true, isUploaded: true, ...credential
        };
        await window.LiftSpecialistApplications.put(record);
        accountStatus.set(role, email, "active");
        people.push(record);
        addDialog.close();
        render();
        window.LiftNotice.success(`${name}'s ${role === "coach" ? "coach" : "nutritionist"} account was created.`);
      } catch {
        fail("Could not create this account on this device. Please try again.");
      }
    });
    async function persist(person) {
      if (person.isUploaded) await window.LiftSpecialistApplications.put(person);
      if (!accountStatus.set(role, person.email, person.status)) throw new Error("Account status could not be saved");
    }
    async function loadApplications() {
      try {
        const records = await window.LiftSpecialistApplications.all();
        for (const record of records.filter(item => item.role === role)) {
          if (!people.some(person => person.id === record.id)) people.push({ ...record, status: accountStatus.get(role, record.email, record.status), isUploaded: true });
        }
        render();
        const requested = new URLSearchParams(location.search).get("review");
        const person = people.find(item => item.id === requested);
        if (person) openProfile(person);
      } catch {
        $("#specialist-action-status").textContent = "Local applications could not be loaded in this browser.";
      }
    }
    function releasePdf() {
      pdfRenderVersion++;
      $("#pdf-preview").replaceChildren();
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      pdfUrl = null;
    }
    async function showPdf(blob) {
      const version = ++pdfRenderVersion;
      const preview = $("#pdf-preview");
      preview.textContent = "Loading PDF pages…";
      try {
        pdfLibraryPromise ||= import(new URL("pdf.min.mjs", pdfAssets).href);
        const pdfjs = await pdfLibraryPromise;
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdf.worker.min.mjs", pdfAssets).href;
        const documentTask = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
        const pdf = await documentTask.promise;
        if (version !== pdfRenderVersion) return;
        preview.replaceChildren();
        for (let number = 1; number <= Math.min(pdf.numPages, 15); number++) {
          const page = await pdf.getPage(number);
          if (version !== pdfRenderVersion) return;
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: Math.min(1.5, 800 / base.width) });
          const ratio = Math.min(window.devicePixelRatio || 1, 2);
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width * ratio);
          canvas.height = Math.floor(viewport.height * ratio);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          const context = canvas.getContext("2d");
          context.setTransform(ratio, 0, 0, ratio, 0, 0);
          preview.append(canvas);
          await page.render({ canvasContext: context, viewport }).promise;
        }
        if (pdf.numPages > 15) {
          const notice = document.createElement("p");
          notice.textContent = "Showing the first 15 pages. Open the original PDF to review the remaining pages.";
          preview.append(notice);
        }
      } catch (error) {
        console.error("PDF preview failed", error);
        if (version === pdfRenderVersion) preview.textContent = "This browser could not render the PDF here. Open the original PDF above to review it.";
      }
    }

    function render() {
      const query = $("#specialist-search").value.trim().toLowerCase();
      const status = $("#status-filter").value;
      const visible = people.filter(person => (status === "all" || person.status === status)
        && (!query || [person.name, person.email, person.specialty].join(" ").toLowerCase().includes(query)))
        .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"));
      $("#stat-total").textContent = people.length;
      $("#stat-active").textContent = people.filter(person => person.status === "active").length;
      $("#stat-pending").textContent = people.filter(person => person.status === "pending").length;
      $("#stat-suspended").textContent = people.filter(person => person.status === "suspended").length;
      $("#stat-blocked").textContent = people.filter(person => person.status === "blocked").length;
      $("#stat-slots").textContent = people.filter(person => person.status === "active" && person.capacity != null)
        .reduce((total, person) => total + Math.max(0, person.capacity - person.assigned), 0);
      $("#result-count").textContent = `${visible.length} ${visible.length === 1 ? "profile" : "profiles"}`;
      $("#directory-empty").hidden = visible.length !== 0;
      $("#specialist-list").innerHTML = visible.map(person => `<article class="specialist-card"><span class="specialist-avatar" aria-hidden="true">${escapeHtml(initials(person.name))}</span><div class="specialist-identity"><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.email)}</small></div><div class="specialist-focus"><span>PRIMARY SPECIALTY</span><strong>${escapeHtml(person.specialty)}</strong></div><div class="specialist-capacity">${person.isUploaded ? "" : `<span>CLIENTS</span><strong>${person.assigned} / ${person.capacity}</strong>`}</div><span class="specialist-status ${person.status}">${statusLabels[person.status]}</span><button class="view-profile" type="button" data-view="${escapeHtml(person.id)}">View profile ↗</button></article>`).join("");
      const badge = $(`#sidebar-${role}-pending-count`);
      if (badge) {
        const count = people.filter(person => person.status === "pending").length;
        badge.textContent = count;
        badge.hidden = count === 0;
      }
    }

    function updateReviewControls(person) {
      const pending = person.status === "pending";
      $("#approve-profile").hidden = !pending;
      $("#reject-profile").hidden = !pending;
      $("#suspend-profile").hidden = !["active", "suspended"].includes(person.status);
      $("#suspend-profile").textContent = person.status === "suspended" ? "Reactivate account" : "Suspend account";
      $("#block-profile").hidden = !["active", "suspended", "blocked"].includes(person.status);
      $("#block-profile").textContent = person.status === "blocked" ? "Unblock account" : "Block account";
      const allViewed = person.certificates.length > 0 && viewed.size === person.certificates.length;
      $("#approve-profile").disabled = !allViewed;
      $("#reject-profile").disabled = !allViewed;
      $("#review-progress").hidden = !pending;
      $("#review-progress").textContent = allViewed
        ? `All ${person.isUploaded ? "uploaded PDFs" : "sample certificates"} opened. You can now approve or reject this application.`
        : `Open every certificate preview before deciding (${viewed.size}/${person.certificates.length}).`;
    }

    function openProfile(person) {
      selectedId = person.id;
      viewed = new Set();
      $("#profile-title").textContent = person.name;
      $("#profile-status").textContent = statusLabels[person.status];
      $("#profile-status").className = "profile-status " + person.status;
      $("#profile-bio").textContent = person.bio;
      const rows = [
        ["EMAIL", person.email],
        ["PRIMARY SPECIALTY", person.specialty],
        ["EXPERIENCE", person.experienceYears + " years"],
        ["APPLIED", person.applied],
        ["ACCOUNT STATUS", statusLabels[person.status]]
      ];
      if (!person.isUploaded || person.createdByAdmin) rows.splice(3, 0, ["CLIENT CAPACITY", `${person.assigned} assigned / ${person.capacity} total`]);
      if (person.phone) rows.splice(1, 0, ["PHONE", person.phone]);
      if (person.isUploaded) {
        rows.push(["SUPPORTED GOALS", person.goals.map(goal => window.LiftMatching.goalLabels[goal] || goal).join(", ")], ["SPORTS", person.sports.length ? person.sports.map(sport => window.LiftMatching.sportLabels[sport] || sport).join(", ") : "General" ]);
        if (role === "coach") rows.push(["CLIENT LEVELS", person.levels.join(", ")], ["TRAINING LOCATIONS", person.locations.join(", ")], ["SESSION LENGTHS", person.durations.map(value => `${value} min`).join(", ")]);
        else rows.push(["FOOD ROUTINES", person.cookingStyles.join(", ")]);
      }
      $("#profile-details").innerHTML = rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
      $("#certificate-count").textContent = person.createdByAdmin ? "Created by admin" : `${person.certificates.length} ${person.isUploaded ? "uploaded PDF" : "sample"} ${person.certificates.length === 1 ? "certificate" : "certificates"}`;
      $(".profile-certificates>p").textContent = person.createdByAdmin ? "This account was created by an admin without an application or uploaded certificates." : person.isUploaded ? "Open each uploaded PDF before making a decision." : "Sample certificate previews for this static frontend; no uploaded files are connected.";
      $("#certificate-list").innerHTML = person.certificates.map((certificate, index) =>
        `<button type="button" class="certificate-item" data-certificate="${index}"><span aria-hidden="true">▤</span><span><strong>${escapeHtml(certificate.title)}</strong><small>${escapeHtml(person.isUploaded ? certificate.fileName : `${certificate.issuer} · ${certificate.year}`)}</small></span><b>View ↗</b></button>`).join("");
      updateReviewControls(person);
      $("#profile-dialog").showModal();
    }

    $("#specialist-list").addEventListener("click", event => {
      const button = event.target.closest("[data-view]");
      const person = button && people.find(item => item.id === button.dataset.view);
      if (person) openProfile(person);
    });
    $("#specialist-search").addEventListener("input", render);
    $("#status-filter").addEventListener("change", render);
    $("#close-profile").addEventListener("click", () => $("#profile-dialog").close());
    $("#certificate-list").addEventListener("click", event => {
      const button = event.target.closest("[data-certificate]");
      const person = selectedPerson();
      const certificate = button && person?.certificates[Number(button.dataset.certificate)];
      if (!certificate) return;
      $("#certificate-title").textContent = certificate.title;
      $("#certificate-name").textContent = certificate.title;
      $("#certificate-holder").textContent = person.name;
      $("#certificate-issuer").textContent = certificate.issuer;
      $("#certificate-year").textContent = certificate.year;
      releasePdf();
      const uploaded = Boolean(person.isUploaded && certificate.blob);
      $("#sample-certificate").hidden = uploaded;
      $("#pdf-preview").hidden = !uploaded;
      $("#pdf-actions").hidden = !uploaded;
      $("#certificate-caution").textContent = uploaded ? "Original PDF uploaded by the applicant. Review its contents before deciding." : "Sample content only. This is not an uploaded or verified document.";
      if (uploaded) {
        pdfUrl = URL.createObjectURL(certificate.blob);
        $("#open-pdf").href = pdfUrl;
        $("#download-pdf").href = pdfUrl;
        $("#download-pdf").download = certificate.fileName;
        showPdf(certificate.blob);
      }
      viewed.add(Number(button.dataset.certificate));
      button.classList.add("viewed");
      button.querySelector("b").textContent = "Viewed ✓";
      updateReviewControls(person);
      $("#certificate-dialog").showModal();
    });
    $("#certificate-dialog").addEventListener("close", releasePdf);
    $("#close-certificate").addEventListener("click", () => $("#certificate-dialog").close());
    $("#done-certificate").addEventListener("click", () => $("#certificate-dialog").close());
    async function decide(status) {
      const person = selectedPerson();
      if (!person || person.status !== "pending" || person.certificates.length === 0 || viewed.size !== person.certificates.length) return;
      if (status === "rejected" && !await window.LiftNotice.confirm(`Reject ${person.name}'s application?`, { confirmText: "Reject application" })) return;
      const previousStatus = person.status;
      const previousVerified = person.verified;
      person.status = status;
      person.verified = status === "active";
      try { await persist(person); } catch { person.status = previousStatus; person.verified = previousVerified; $("#specialist-action-status").textContent = "Decision could not be saved. Please try again."; window.LiftNotice.error($("#specialist-action-status").textContent); return; }
      $("#profile-dialog").close();
      render();
      $("#specialist-action-status").textContent = `${person.name}: ${statusLabels[status]}.`;
      window.LiftNotice[status === "rejected" ? "warning" : "success"]($("#specialist-action-status").textContent);
    }
    $("#approve-profile").addEventListener("click", () => decide("active"));
    $("#reject-profile").addEventListener("click", () => decide("rejected"));
    $("#suspend-profile").addEventListener("click", async () => {
      const person = selectedPerson();
      if (!person || !["active", "suspended"].includes(person.status)) return;
      const next = person.status === "active" ? "suspended" : "active";
      if (next === "suspended" && !await window.LiftNotice.confirm(`Suspend ${person.name}'s account? They will not be able to sign in until reactivated.`, { confirmText: "Suspend account" })) return;
      const previousStatus = person.status, previousVerified = person.verified;
      person.status = next;
      person.verified = next === "active";
      try { await persist(person); } catch { person.status = previousStatus; person.verified = previousVerified; window.LiftNotice.error("Account status could not be saved."); return; }
      $("#profile-dialog").close();
      render();
      window.LiftNotice[next === "active" ? "success" : "warning"](`${person.name}'s account is now ${next}.`);
    });
    $("#block-profile").addEventListener("click", async () => {
      const person = selectedPerson();
      if (!person || !["active", "suspended", "blocked"].includes(person.status)) return;
      if (person.status !== "blocked" && !await window.LiftNotice.confirm(`Block ${person.name}'s account? They will not be able to sign in until unblocked.`, { confirmText: "Block account" })) return;
      const previousStatus = person.status;
      const previousVerified = person.verified;
      person.status = person.status === "blocked" ? "active" : "blocked";
      person.verified = person.status === "active";
      try { await persist(person); } catch { person.status = previousStatus; person.verified = previousVerified; $("#specialist-action-status").textContent = "Account status could not be saved."; window.LiftNotice.error($("#specialist-action-status").textContent); return; }
      $("#profile-dialog").close();
      render();
      $("#specialist-action-status").textContent = `${person.name}: ${statusLabels[person.status]}.`;
      window.LiftNotice[person.status === "blocked" ? "warning" : "success"]($("#specialist-action-status").textContent);
    });

    const focusSelect = $("#focus-select");
    focusSelect.innerHTML = focusOptions[role].map(option => `<option value="${option.key}">${escapeHtml(option.label)}</option>`).join("");
    $("#edit-profile").addEventListener("click", () => {
      const person = selectedPerson();
      if (!person) return;
      const form = $("#edit-form");
      form.elements.namedItem("name").value = person.name;
      form.elements.namedItem("email").value = person.email;
      form.elements.namedItem("email").readOnly = !person.isUploaded;
      form.elements.namedItem("focus").value = person.focus;
      form.elements.namedItem("experienceYears").value = person.experienceYears;
      form.elements.namedItem("capacity").value = person.capacity;
      $("#capacity-label").hidden = person.isUploaded && !person.createdByAdmin;
      form.elements.namedItem("capacity").required = !person.isUploaded || person.createdByAdmin;
      if (person.isUploaded && !person.createdByAdmin) form.elements.namedItem("capacity").value = "";
      form.elements.namedItem("bio").value = person.bio;
      $("#edit-error").hidden = true;
      $("#edit-title").textContent = "Edit " + person.name;
      $("#profile-dialog").close();
      $("#edit-dialog").showModal();
    });
    $("#close-edit").addEventListener("click", () => $("#edit-dialog").close());
    $("#cancel-edit").addEventListener("click", () => $("#edit-dialog").close());
    $("#edit-form").addEventListener("submit", async event => {
      event.preventDefault();
      const person = selectedPerson();
      const form = event.currentTarget;
      if (!person || !form.reportValidity()) return;
      const name = form.elements.namedItem("name").value.trim();
      const email = form.elements.namedItem("email").value.trim().toLowerCase();
      const bio = form.elements.namedItem("bio").value.trim();
      const capacity = person.isUploaded && !person.createdByAdmin ? null : Number(form.elements.namedItem("capacity").value);
      const error = $("#edit-error");
      if (!name || !bio || (capacity != null && capacity < person.assigned) || people.some(item => item !== person && item.email.toLowerCase() === email)) {
        error.textContent = capacity < person.assigned ? "Capacity cannot be lower than current assigned clients." : "Enter a name, bio, and unique email address.";
        error.hidden = false;
        window.LiftNotice.warning(error.textContent);
        return;
      }
      const focus = focusOptions[role].find(option => option.key === form.elements.namedItem("focus").value);
      const previous = { ...person };
      Object.assign(person, {
        name, email, bio, capacity,
        experienceYears: Number(form.elements.namedItem("experienceYears").value),
        focus: focus.key, specialty: focus.label,
        goals: person.isUploaded && focus.key === person.focus ? person.goals : [...focus.goals],
        sports: person.isUploaded && focus.key === person.focus ? person.sports : [...focus.sports]
      });
      try { await persist(person); } catch { Object.assign(person, previous); error.textContent = "Changes could not be saved."; error.hidden = false; window.LiftNotice.error(error.textContent); return; }
      $("#edit-dialog").close();
      render();
      $("#specialist-action-status").textContent = `${person.name}'s professional profile updated.`;
      window.LiftNotice.success($("#specialist-action-status").textContent);
      openProfile(person);
    });

    const menuButton = $(".admin-menu-toggle");
    menuButton.addEventListener("click", () => {
      const opened = $("lift-admin-sidebar").classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(opened));
      menuButton.setAttribute("aria-label", opened ? "Close sidebar" : "Open sidebar");
    });
    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;
      $("lift-admin-sidebar").classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
    render();
    loadApplications();
  }
  window.LiftSpecialistManagement = { init };
})();
