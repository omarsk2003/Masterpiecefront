"use strict";
if (window.LiftClientAccess?.isPremium() !== false) {


// The member only sees the coach's last approved version, never an in-progress revision.
if (window.LiftCoachPlan) {
  const plan = window.LiftCoachPlan.readPublished();
  const heading = document.querySelector(".page-heading");
  if (heading) {
    const summary = document.createElement("section");
    summary.className = "approved-plan-summary";
    summary.setAttribute("aria-label", "Coach-approved training details");
    summary.innerHTML = "<span>COACH-APPROVED PLAN</span><strong></strong><p></p><small></small>";
    summary.querySelector("strong").textContent = plan.goal;
    summary.querySelector("p").textContent = plan.split;
    summary.querySelector("small").textContent = `${plan.days} days per week · ${plan.minutes} minutes per session · ${plan.location}`;
    heading.after(summary);
    if (plan.updatedAt) {
      // Keep the demonstration videos available without presenting the original
      // sample exercises as part of the coach's newly approved custom plan.
      document.querySelector(".schedule-card")?.remove();
      const guideSection = document.querySelector(".exercise-section");
      if (guideSection) {
        guideSection.classList.add("exercise-guide-section");
        guideSection.querySelector(".eyebrow").textContent = "GENERAL TECHNIQUE LIBRARY";
        guideSection.querySelector("h2").textContent = "Exercise video guides";
        guideSection.querySelector(".progress-count")?.remove();
        guideSection.querySelectorAll(".exercise-card").forEach(card => {
          card.querySelector(".status-button")?.remove();
          card.querySelector(".exercise-meta")?.remove();
          card.querySelector(".exercise-top p")?.remove();
        });
        const guidance = document.createElement("p");
        guidance.className = "exercise-guide-note";
        guidance.textContent = "These videos demonstrate general technique. Follow your coach's latest approved plan for your exercises, sets, and schedule.";
        guideSection.querySelector(".section-heading").after(guidance);
      }
      const note = document.createElement("p");
      note.className = "approved-plan-note";
      note.textContent = plan.coachNotes || "Ask your coach for more details about this approved update.";
      summary.append(note);
      const sessionDetails = document.querySelectorAll(".workout-sidebar .side-card:first-child dd");
      if (sessionDetails.length >= 3) {
        sessionDetails[0].textContent = plan.location;
        sessionDetails[1].textContent = `${plan.minutes} minutes`;
        sessionDetails[2].textContent = plan.goal;
      }
    }
  }
}

// Completion state is kept only in memory for this static preview.
const statusButtons = document.querySelectorAll(".status-button");
const progressCount = document.getElementById("progress-count");

function updateProgress() {
  const completed = document.querySelectorAll('.status-button[aria-pressed="true"]').length;
  if (progressCount) progressCount.textContent = `${completed} OF ${statusButtons.length} COMPLETED`;
}

statusButtons.forEach(button => {
  button.addEventListener("click", () => {
    const completed = button.getAttribute("aria-pressed") !== "true";
    const exercise = button.closest(".exercise-card").querySelector("h3").textContent;
    button.setAttribute("aria-pressed", String(completed));
    button.setAttribute("aria-label", `Mark ${exercise} as ${completed ? "pending" : "completed"}`);
    button.textContent = completed ? "COMPLETED" : "PENDING";
    button.classList.toggle("complete", completed);
    updateProgress();
  });
});

const videoDialog = document.getElementById("video-dialog");
const videoFrame = document.getElementById("video-frame");
const videoTitle = document.getElementById("video-title");
const youtubeLink = document.getElementById("watch-on-youtube");
const coachGuideMap = new Map();
let dialogCoachUrl = null;

document.querySelectorAll(".video-button").forEach(button => {
  button.addEventListener("click", () => {
    const exerciseName = button.closest(".exercise-card")?.querySelector("h3")?.textContent;
    const guide = coachGuideMap.get(exerciseName);
    if (guide) {
      videoTitle.textContent = `${guide.exercise} · Coach Sarah`;
      dialogCoachUrl = URL.createObjectURL(guide.file);
      const video = document.createElement("video");
      video.src = dialogCoachUrl;
      video.controls = true;
      video.playsInline = true;
      video.autoplay = true;
      videoFrame.replaceChildren(video);
      youtubeLink.hidden = true;
      document.querySelector(".dialog-footer p").textContent = `${guide.steps} Focus: ${guide.cues} Avoid: ${guide.mistakes}`;
      videoDialog.showModal();
      return;
    }
    const id = button.dataset.videoId;
    videoTitle.textContent = button.dataset.videoTitle;
    youtubeLink.hidden = false;
    document.querySelector(".dialog-footer p").textContent = "Follow your coach's approved plan and use the video to review technique.";
    youtubeLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`;
    frame.title = button.dataset.videoTitle;
    frame.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    videoFrame.replaceChildren(frame);
    videoDialog.showModal();
  });
});

document.getElementById("close-video").addEventListener("click", () => videoDialog.close());
videoDialog.addEventListener("close", () => {
  videoFrame.replaceChildren();
  if (dialogCoachUrl) URL.revokeObjectURL(dialogCoachUrl);
  dialogCoachUrl = null;
});
videoDialog.addEventListener("click", event => {
  const bounds = videoDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) videoDialog.close();
});

// Coach-recorded technique videos are shared locally with this Premium member.
let coachVideoUrls = [];
async function renderCoachVideos() {
  if (!window.LiftExerciseLibrary) return;
  let guides;
  try { guides = (await window.LiftExerciseLibrary.all()).filter(item => item.clientId === "alexander-drake"); }
  catch { return; }
  coachGuideMap.clear();
  guides.forEach(guide => { if (!coachGuideMap.has(guide.exercise)) coachGuideMap.set(guide.exercise, guide); });
  coachVideoUrls.forEach(url => URL.revokeObjectURL(url));
  coachVideoUrls = [];
  document.querySelector(".coach-video-section")?.remove();
  document.querySelectorAll(".exercise-card").forEach(card => {
    const button = card.querySelector(".video-button span");
    const hasCoachGuide = coachGuideMap.has(card.querySelector("h3")?.textContent);
    if (button) button.textContent = hasCoachGuide ? "Coach demonstration" : "How to perform";
    const source = card.querySelector(".exercise-actions>span");
    if (source) source.textContent = hasCoachGuide ? "COACH VIDEO · SARAH" : "VIDEO GUIDE · NASM";
  });
  if (!guides.length) return;
  const section = document.createElement("section");
  section.className = "coach-video-section";
  const heading = document.createElement("div");
  heading.className = "section-heading";
  heading.innerHTML = '<div><p class="eyebrow">FROM COACH SARAH</p><h2>Exercise technique videos</h2></div><span>COACH GUIDANCE</span>';
  const grid = document.createElement("div");
  grid.className = "coach-video-grid";
  guides.forEach(guide => {
    const card = document.createElement("article");
    card.className = "coach-video-card";
    const video = document.createElement("video");
    const url = URL.createObjectURL(guide.file);
    coachVideoUrls.push(url);
    video.src = url;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    const content = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = guide.exercise;
    const steps = document.createElement("p");
    steps.textContent = guide.steps;
    const cues = document.createElement("p");
    cues.textContent = "Coach's cues: " + guide.cues;
    const mistakes = document.createElement("p");
    mistakes.textContent = "Avoid: " + guide.mistakes;
    content.append(title, steps, cues, mistakes);
    card.append(video, content);
    grid.append(card);
  });
  section.append(heading, grid);
  const summary = document.querySelector(".approved-plan-summary");
  if (summary) summary.after(section);
  else document.querySelector(".workout-main").prepend(section);
}
window.addEventListener("pagehide", () => coachVideoUrls.forEach(url => URL.revokeObjectURL(url)));
window.addEventListener("focus", renderCoachVideos);
renderCoachVideos();
}
