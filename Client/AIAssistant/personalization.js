"use strict";
(() => {
  let member = window.LiftClientAccess?.member || null;
  member ||= { name: "Preview member", plan: "premium", preview: true };
  const access = window.LiftClientAccess;
  const key = `lift-profile-session-${member.email || "preview"}`;
  const read = () => access?.getProfile() || null;
  const save = value => {
    try { localStorage.setItem(key, JSON.stringify(value)); sessionStorage.removeItem(key); return true; }
    catch { try { sessionStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
  };
  window.LiftPersonalization = { member, getProfile: read };

  const tier = document.getElementById("member-tier");
  tier.textContent = ({ free: "FREE MEMBER", ai: "AI PLAN MEMBER", premium: "PREMIUM MEMBER" })[member.plan] || "PREVIEW MEMBER";
  document.getElementById("premium-team").hidden = member.plan !== "premium";
  const gateButton = document.getElementById("complete-profile");
  const build = document.getElementById("build-plan");
  const edit = document.getElementById("edit-profile");
  const note = document.getElementById("profile-usage-note");
  const dialog = document.createElement("dialog");
  dialog.className = "profile-dialog";
  dialog.setAttribute("aria-labelledby", "profile-title");
  dialog.innerHTML = `<div class="profile-top"><span>LIFT / PERSONALIZATION</span><button type="button" id="close-profile" aria-label="Close setup">×</button></div><div class="profile-progress" aria-label="Setup progress"><i></i></div><div id="profile-step"></div>`;
  document.body.append(dialog);
  const stepHost = dialog.querySelector("#profile-step");
  const progress = dialog.querySelector(".profile-progress i");
  const stages = ["YOUR GOAL", "YOUR STARTING POINT", "YOUR REAL LIFE", "REVIEW"];
  let step = 0;
  let draft = read() || {};
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const options = (name, values) => values.map(([value,label]) => `<option value="${value}" ${draft[name] === value ? "selected" : ""}>${label}</option>`).join("");
  const field = (label,name,type="text",extra="") => `<label>${label}<input name="${name}" type="${type}" value="${esc(draft[name])}" ${extra}></label>`;
  const select = (label,name,values) => `<label>${label}<select name="${name}" required><option value="">Choose one</option>${options(name,values)}</select></label>`;
  const textarea = (label,name,placeholder="",required=false) => `<label>${label}<textarea name="${name}" rows="2" placeholder="${placeholder}" ${required ? "required" : ""}>${esc(draft[name])}</textarea></label>`;
  const choice = (label,name,values) => `<fieldset><legend>${label}</legend><div class="profile-choices">${values.map(([value,text]) => `<label><input type="checkbox" name="${name}" value="${value}" ${(draft[name] || []).includes(value) ? "checked" : ""}><span>${text}</span></label>`).join("")}</div></fieldset>`;

  function render() {
    progress.style.width = `${(step + 1) * 25}%`;
    let body = "";
    if (step === 0) body = `${select("Primary goal","goal",[["Build strength","Build strength"],["Lose weight","Lose weight"],["Improve endurance","Improve endurance"],["Stay active","Stay active"],["Improve general fitness","Improve general fitness"]])}${textarea("What matters most? (optional)","goalNote","A detail that would make this goal meaningful")}`;
    if (step === 1) body = `<div class="profile-grid">${field("Age","age","number",'min="13" max="120" required')}${field("Weight (kg)","weight","number",'min="20" max="500" step="0.1" required')}${field("Height (cm)","height","number",'min="80" max="250" step="0.1" required')}</div><div class="profile-grid">${select("Fitness level","fitness",[["Beginner","Beginner"],["Intermediate","Intermediate"],["Advanced","Advanced"]])}${select("Activity level","activity",[["Mostly sitting","Mostly sitting"],["Lightly active","Lightly active"],["Moderately active","Moderately active"],["Very active","Very active"]])}</div>`;
    if (step === 2) body = `${select("Workout location","location",[["Home","Home"],["Gym","Gym"],["Outdoor","Outdoor / field"],["Flexible","Flexible"]])}${choice("Available workout days","days",[["Mon","Mon"],["Tue","Tue"],["Wed","Wed"],["Thu","Thu"],["Fri","Fri"],["Sat","Sat"],["Sun","Sun"]])}<div class="profile-grid">${select("Typical available time","duration",[["20","20 min"],["30","30 min"],["45","45 min"],["60","60 min"],["90","90+ min"]])}${select("Preferred training time","trainingTime",[["Morning","Morning"],["Afternoon","Afternoon"],["Evening","Evening"],["Flexible","Flexible"]])}${field("Typical sleep (hours)","sleep","number",'min="1" max="24" step="0.5" required')}${select("Cooking frequency","cooking",[["Most days","Most days"],["Some days","Some days"],["Rarely","Rarely"]])}</div>${field("Work / school schedule","schedule","text",'placeholder="For example, weekdays 9–5" required')}${textarea("Health or movement limitations","health","Enter None if you have no limitations",true)}${textarea("Food habits","foodHabits","How you usually eat",true)}${textarea("Dietary preferences","dietary","Enter No preference if none",true)}`;
    if (step === 3) {
      const groups = [["GOAL",`${draft.goal || "—"}${draft.goalNote ? ` · ${draft.goalNote}` : ""}`,0],["STARTING POINT",`${draft.fitness || "—"} · ${draft.activity || "—"} · Age ${draft.age || "—"} · ${draft.weight || "—"} kg · ${draft.height || "—"} cm`,1],["TRAINING",`${(draft.days || []).join(", ") || "—"} · ${draft.location || "—"} · ${draft.duration || "—"} min · ${draft.trainingTime || "—"}`,2],["REAL LIFE",`Sleep: ${draft.sleep || "—"} h · Schedule: ${draft.schedule || "—"} · Health: ${draft.health || "None noted"} · Food: ${draft.foodHabits || "—"} · Cooking: ${draft.cooking || "—"} · Dietary: ${draft.dietary || "—"}`,2]];
      body = `<div class="review-list">${groups.map(([heading,text,index]) => `<div><span>${heading}</span><p>${esc(text)}</p><button type="button" data-edit="${index}">Edit ↗</button></div>`).join("")}</div>`;
    }
    const required = dialog.dataset.required === "true";
    const backOrLater = step > 0 ? '<button type="button" data-back>← BACK</button>' : required ? "" : '<button type="button" data-later>SAVE FOR LATER</button>';
    stepHost.innerHTML = `<div class="profile-heading"><p>STEP ${String(step+1).padStart(2,"0")} / 04 · ${stages[step]}</p><h2 id="profile-title">${step === 3 ? "Here's what LIFT knows about you." : ["What are you working toward?","Where are you starting?","How does your day work?"][step]}</h2><span>${step === 3 ? "Review what you shared before continuing to AI." : "A few details help LIFT fit guidance to your real life."}</span></div><form id="profile-form">${body}<p class="profile-error" id="profile-error" role="alert" hidden></p><div class="profile-actions">${backOrLater}<button type="submit">${step === 3 ? "SAVE & CONTINUE TO AI" : "CONTINUE"} ↗</button></div>${step === 3 && !required ? '<button class="save-later" type="button" data-later>SAVE FOR LATER</button>' : ""}</form>`;
    stepHost.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => { step = Number(button.dataset.edit); render(); }));
    stepHost.querySelector("[data-back]")?.addEventListener("click", () => { step--; render(); });
    stepHost.querySelectorAll("[data-later]").forEach(button => button.addEventListener("click", () => { capture(); if (!access?.isPersonalizationProfileComplete(draft)) draft.completed = false; save(draft); dialog.close(); refresh(); }));
    stepHost.querySelector("#profile-form").addEventListener("submit", event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form.reportValidity()) return;
      capture();
      if (step === 2 && !draft.days?.length) { const error = form.querySelector("#profile-error"); error.textContent = "Choose at least one workout day."; error.hidden = false; return; }
      if (step < 3) { step++; render(); return; }
      const complete = { ...draft, completed: true, updatedAt: new Date().toISOString() };
      if (!access?.isPersonalizationProfileComplete(complete)) { const error = form.querySelector("#profile-error"); error.textContent = "Complete every required detail before continuing. Use Edit to return to a section."; error.hidden = false; return; }
      if (!save(complete)) { const error = form.querySelector("#profile-error"); error.textContent = "Your profile could not be saved in this browser. Please try again."; error.hidden = false; return; }
      draft = complete; dialog.close(); refresh();
      window.LiftChat?.addMessage("You're all set. I'll use your profile to keep my guidance relevant to your goals and real life.", false);
      document.getElementById("message-input").focus();
    });
  }
  function capture() {
    const form = stepHost.querySelector("#profile-form");
    if (!form || step === 3) return;
    const data = new FormData(form);
    for (const [name,value] of data) if (name !== "days") draft[name] = String(value).trim();
    if (step === 2) draft.days = data.getAll("days");
  }
  function openSetup(target=0) {
    draft = read() || draft;
    step = target;
    dialog.dataset.required = String(Boolean(access?.needsPersonalizationProfile()));
    render();
    if (!dialog.open) dialog.showModal();
  }
  function refresh() {
    const profile = read();
    const complete = Boolean(access?.isPersonalizationProfileComplete(profile));
    const required = Boolean(access?.needsPersonalizationProfile());
    document.documentElement.dataset.clientNeedsProfile = required ? "true" : "false";
    document.getElementById("profile-summary").textContent = complete ? `${profile.goal} · ${profile.fitness} · ${profile.location} · ${profile.duration} min` : "Add your context when you are ready for a personal plan.";
    document.getElementById("profile-updated").textContent = profile?.updatedAt ? `Last updated ${new Date(profile.updatedAt).toLocaleDateString()}` : "Not set up yet";
    note.textContent = member.plan === "free" ? "General guidance only. Personalized planning is available with AI Plan." : complete ? "Your saved profile informs this conversation." : "Add your context before personalized planning.";
    document.getElementById("message-input").disabled = required;
    document.getElementById("send-button").disabled = required;
    document.querySelectorAll("[data-prompt]").forEach(button => { button.disabled = required; });
    build.disabled = required;
  }
  function requestPlan() {
    if (access?.needsPersonalizationProfile()) { openSetup(0); return; }
    if (member.plan === "free") { window.LiftChat?.addMessage("Personalized planning is available with AI Plan. Open Plan & Billing to upgrade your plan when you are ready.", false); return; }
    const profile = read();
    if (!access?.isPersonalizationProfileComplete(profile)) { openSetup(0); return; }
    const current = access?.getPlan();
    window.LiftChat?.addMessage(`Your plan preview uses your ${profile.goal} goal, ${profile.duration}-minute workout window, and ${profile.location} location. Your next session is ${current?.sessions[0] || "movement"}. Update your profile when your routine changes; live AI generation will connect later.`, false);
  }
  gateButton.addEventListener("click", () => openSetup());
  build.addEventListener("click", requestPlan);
  edit.addEventListener("click", () => openSetup());
  dialog.querySelector("#close-profile").addEventListener("click", () => { if (dialog.dataset.required !== "true") dialog.close(); });
  dialog.addEventListener("cancel", event => { if (dialog.dataset.required === "true") event.preventDefault(); });
  document.getElementById("assistant-form").addEventListener("submit", event => {
    if (access?.needsPersonalizationProfile()) { event.preventDefault(); event.stopImmediatePropagation(); openSetup(0); return; }
    if (member.plan === "free") return;
    if (/build (my|a) plan|personalized plan|create (my|a) plan/i.test(document.getElementById("message-input").value) && !access?.isPersonalizationProfileComplete(read())) {
      event.preventDefault(); event.stopImmediatePropagation(); openSetup(0);
    }
  }, true);
  if (member.plan === "free") {
    build.hidden = true;
    document.querySelector(".assistant-sidebar .profile-card").hidden = true;
    document.querySelector(".assistant-sidebar .capabilities").hidden = true;
  }
  refresh();
  if (new URLSearchParams(location.search).get("profile") === "edit") openSetup();
})();
