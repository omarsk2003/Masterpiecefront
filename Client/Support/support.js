"use strict";

const form = document.getElementById("support-form");
const category = document.getElementById("support-category");
const subject = document.getElementById("support-subject");
const description = document.getElementById("support-description");
const preview = document.getElementById("request-preview");
const topicButtons = [...document.querySelectorAll(".topic-card")];

function updateSelectedTopic() {
  topicButtons.forEach((button) => {
    const selected = button.dataset.category === category.value;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

topicButtons.forEach((button) => {
  button.addEventListener("click", () => {
    category.value = button.dataset.category;
    updateSelectedTopic();
    document.getElementById("request-section").scrollIntoView({ behavior: "smooth", block: "start" });
    subject.focus({ preventScroll: true });
  });
});

category.addEventListener("change", updateSelectedTopic);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  document.getElementById("preview-category").textContent = category.selectedOptions[0].textContent;
  document.getElementById("preview-subject").textContent = subject.value.trim();
  document.getElementById("preview-description").textContent = description.value.trim();
  if (!subject.value.trim() || !description.value.trim()) return window.LiftNotice.warning("Add a subject and description before continuing.");
  form.hidden = true;
  preview.hidden = false;
  document.querySelector(".request-number").textContent = "02 / 02";
  preview.scrollIntoView({ behavior: "smooth", block: "nearest" });
  window.LiftNotice.show("Your support request preview is ready. It has not been sent.");
});

document.getElementById("edit-request").addEventListener("click", () => {
  preview.hidden = true;
  form.hidden = false;
  document.querySelector(".request-number").textContent = "01 / 02";
  subject.focus();
});

const clientAccess = window.LiftClientAccess;
if (clientAccess && !clientAccess.isPremium()) {
  document.querySelector(".support-layout").classList.add("tier-support");
  const title = document.querySelector(".page-heading h1");
  title.textContent = `How can we help, ${clientAccess.member.name.split(" ")[0]}?`;
  document.querySelector(".page-heading .eyebrow").textContent = `${clientAccess.labels[clientAccess.plan].toUpperCase()} / MEMBER SUPPORT`;
  document.querySelector(".page-heading .premium-badge").textContent = clientAccess.labels[clientAccess.plan].toUpperCase() + " MEMBER";
  document.querySelector(".page-heading p:last-child").textContent = "Find answers or prepare a platform support request.";
  document.querySelector('[data-category="account"] > span:not(.topic-icon)').textContent = "Access, profile, or membership questions.";
  document.querySelector('[data-category="meetings"]').remove();
  category.querySelector('[value="meetings"]').remove();
  document.querySelector(".support-aside").remove();
  const faq = document.querySelector(".faq-list");
  faq.replaceChildren();
  [["What can I access with my plan?", clientAccess.plan === "free" ? "Free includes basic activity, workout, nutrition, progress, and general guidance." : "AI Plan includes personalized plan previews, LIFT Engine, workout, nutrition, and progress. Professional support is part of Premium."], ["How do I update my plan context?", clientAccess.plan === "free" ? "Basic activity does not require a full personalization profile. AI Plan adds profile-based guidance." : "Open AI Assistant and choose Change My Plan to update your saved context."], ["How do I report an issue?", "Choose Account & billing or Technical issue above, then prepare a support request."]].forEach(([question, answer]) => {
    const item = document.createElement("details"), summary = document.createElement("summary"), body = document.createElement("p");
    summary.textContent = question + " +"; body.textContent = answer; item.append(summary, body); faq.append(item);
  });
  clientAccess.finishRender();
}

