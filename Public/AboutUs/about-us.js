"use strict";
document.querySelectorAll(".faq-list details").forEach(question => question.addEventListener("toggle", () => {
  if (question.open) document.querySelectorAll(".faq-list details").forEach(other => { if (other !== question) other.open = false; });
}));
