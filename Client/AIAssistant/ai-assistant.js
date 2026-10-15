"use strict";

// Local responses keep the chat interactive until an API endpoint is available.
// Nothing is stored or sent over the network.
const form = document.getElementById("assistant-form");
const input = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const conversation = document.getElementById("conversation-scroll");
const needsProfile = () => Boolean(window.LiftClientAccess?.needsPersonalizationProfile());
document.querySelectorAll("[data-prompt]").forEach(button => button.addEventListener("click", () => {
  if (needsProfile()) return;
  input.value = button.dataset.prompt;
  input.focus();
}));

function clockTime() {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());
}

function addMessage(text, fromUser, upgrade = false) {
  const article = document.createElement("article");
  article.className = `chat-message ${fromUser ? "user-message" : "assistant-message"}`;
  const avatar = document.createElement("span");
  avatar.className = `chat-avatar ${fromUser ? "user-avatar" : "engine-avatar"}`;
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = fromUser ? (window.LiftPersonalization?.member?.name || "YOU").split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase() : "✳";
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  const heading = document.createElement("div");
  heading.className = "message-heading";
  const name = document.createElement("strong");
  name.textContent = fromUser ? (window.LiftPersonalization?.member?.name || "You") : "LIFT Engine";
  const time = document.createElement("time");
  time.dateTime = new Date().toISOString();
  time.textContent = clockTime();
  const content = document.createElement("p");
  content.textContent = text;
  heading.append(name, time);
  bubble.append(heading, content);
  if (upgrade) {
    const link = document.createElement("a");
    link.className = "assistant-upgrade-link";
    link.href = "../Subscription/subscription.html";
    link.textContent = "Upgrade to AI Plan ↗";
    bubble.append(link);
  }
  article.append(avatar, bubble);
  conversation.append(article);
  conversation.scrollTop = conversation.scrollHeight;
}
window.LiftChat = { addMessage };
if (!needsProfile()) addMessage("Hi. Tell me what is happening in your day, or choose a question above. I can discuss your routine here; live AI planning is not connected in this preview.", false);

function responseFor(message) {
  const text = message.toLowerCase();
  const access = window.LiftClientAccess;
  const profile = access?.canUseAdvancedAI ? window.LiftPersonalization?.getProfile() : null;
  const premium = window.LiftPersonalization?.member?.plan === "premium";
  const personalized = access?.isPersonalizationProfileComplete(profile) ? access?.getPlan() : null;
  if (access?.isFree() && (/(?:my|me|i |i'm|i have|i slept|my schedule|my goal|my plan).*(?:plan|workout|training|meal|nutrition|sleep|schedule|minute|week)|(?:build|create|adapt|adjust|personaliz|tailor).*(?:plan|workout|training|meal|nutrition)|(?:plan|workout|meal).*(?:for me|around my|to my)/.test(text) || /\b(?:i|my)\b.*(?:minutes?|slept|sleep|schedule|goal)|(?:minutes?|slept|sleep).*\b(?:i|my)\b/.test(text))) {
    return { text: "Personalized planning is part of AI Plan. Upgrade to let LIFT build and adapt a plan around your goals, schedule, and lifestyle.", upgrade: true };
  }
  if (/pain|injur|strain|shoulder|knee|back pain/.test(text)) {
    return "If movement causes pain, do not push through it. A qualified healthcare professional can assess an injury or ongoing pain." + (premium ? " Your coach can review training adjustments within their area." : "");
  }
  if (/food|meal|eat|diet|nutrition|calor|protein|cook/.test(text)) {
    return personalized ? `Your plan preview considers ${personalized.food} and ${personalized.cooking}. A busy day can still use familiar foods that fit ${personalized.dietary}. Edit your profile if this is a lasting change.` : "A simple meal can combine a protein source, plants, and an energy source you enjoy. AI Plan can use your saved food context for more specific guidance.";
  }
  if (/time|hour|minute|busy|schedule|workout|train|exercise|gym|day/.test(text)) {
    if (personalized) {
      const requested = Number(text.match(/\b(\d{1,3})\s*(?:min|minutes)\b/)?.[1]);
      const available = requested >= 10 && requested <= 180 ? Math.min(requested, personalized.duration) : personalized.duration;
      const poorSleep = /slept badly|poor sleep|bad sleep|little sleep|tired|exhausted/.test(text) || Number(personalized.sleep) < 6;
      const suggested = poorSleep ? Math.max(10, available - 10) : available;
      return `Based on your ${personalized.goal.toLowerCase()} goal, ${personalized.fitness.toLowerCase()} level, and ${personalized.location.toLowerCase()} setting, try ${suggested} minutes of ${personalized.sessions[0].toLowerCase()}${poorSleep ? " at an easier effort because sleep is limited" : " at a manageable effort"}. Your saved schedule is ${personalized.profile.schedule || personalized.days.join(", ")}. ${personalized.profile.health ? "Respect the movement limitations you saved; seek qualified advice for pain or symptoms. " : ""}This is a local plan preview; edit your profile for a lasting change.`;
    }
    return "For a busy day, try a short walk or a few basic movements at a comfortable effort. AI Plan can shape sessions around your available time.";
  }
  if (/coach|sarah|nutritionist|maya|specialist|premium/.test(text)) {
    return premium ? "Premium can add a coach for training and a nutritionist for food. Specialist assignment and review are not active in this local preview." : "Premium can add coach support for training and nutritionist support for food. Your current preview does not assign specialists.";
  }
  if (/progress|weight|goal|target/.test(text)) {
    return personalized ? `Your saved goal is ${personalized.goal}. You have marked ${Object.values(access.getActivity().workouts || {}).filter(Boolean).length} sessions complete in this local preview. Your plan uses that activity as context; live tracking is not connected yet.` : "Progress can start with a simple record of completed activity. AI Plan can use a saved goal and profile for a more personal outline.";
  }
  return profile ? `I can use your saved ${profile.goal} goal and routine as context for this preview. What part of your day would you like to discuss?` : "I can answer general training and nutrition questions. Set up your profile when you want a plan shaped around your real life.";
}

form.addEventListener("submit", event => {
  event.preventDefault();
  if (needsProfile()) return;
  const message = input.value.trim();
  if (!message || sendButton.disabled) return;
  addMessage(message, true);
  input.value = "";
  sendButton.disabled = true;

  const typing = document.createElement("div");
  typing.className = "chat-message assistant-message typing";
  typing.setAttribute("aria-label", "LIFT Engine is responding");
  typing.innerHTML = '<span class="chat-avatar engine-avatar" aria-hidden="true">✳</span><div class="chat-bubble" aria-hidden="true"><span></span><span></span><span></span></div>';
  conversation.append(typing);
  conversation.scrollTop = conversation.scrollHeight;

  window.setTimeout(() => {
    typing.remove();
    const reply = responseFor(message);
    addMessage(typeof reply === "string" ? reply : reply.text, false, Boolean(reply.upgrade));
    sendButton.disabled = false;
    input.focus();
  }, 650);
});

