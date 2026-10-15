(function(){ const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)");
// Sections remain readable without JavaScript or IntersectionObserver.
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  document.documentElement.classList.add("js-reveal");
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: .08 });
  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
}

const steps = [
  {
    tag: "A PLAN STARTS WITH A PERSON",
    title: "Your life is the starting point.",
    description: "Tell LIFT about your goals, daily routine, available time and food preferences. The AI conversation fills in the details — so your plan starts with understanding.",
    labels: ["My goal", "My time", "My meals"],
    values: ["Feel stronger ↗", "45 minutes a day", "Made at home"],
    note: "A little context. A much better plan."
  },
  {
    tag: "INTELLIGENCE WITH INTENTION",
    title: "A plan that moves with you.",
    description: "Your AI creates workouts and nutrition guidance around your actual routine. Train at home or at the gym. Work with meals you already enjoy. Make progress at a pace you can sustain.",
    labels: ["Your movement", "Your nutrition", "Your rhythm"],
    values: ["A tailored workout", "Practical portions", "Built around your week"],
    note: "Less guesswork. More time for you."
  },
  {
    tag: "THE PREMIUM EXPERIENCE",
    title: "Real people. On your side.",
    description: "LIFT matches you with a coach and nutritionist suited to your goals. They review your AI drafts, talk through your needs, make adjustments and approve each plan before you start.",
    labels: ["Your coach", "Your nutritionist", "Your plan"],
    values: ["Matched to your goals", "Matched to your goals", "Reviewed, then approved"],
    note: "Your experts. Your conversations. Your progress."
  }
];
const tabs = [...document.querySelectorAll(".step-tab")];
function chooseStep(index) {
  const step = steps[index];
  tabs.forEach((tab, number) => {
    tab.classList.toggle("active", number === index);
    tab.setAttribute("aria-selected", String(number === index));
    tab.tabIndex = number === index ? 0 : -1;
  });
  document.getElementById("journey-panel").setAttribute("aria-labelledby", "step-tab-" + index);
  document.getElementById("journey-tag").textContent = step.tag;
  document.getElementById("journey-title").textContent = step.title;
  document.getElementById("journey-description").textContent = step.description;
  document.querySelectorAll(".demo-line").forEach((line, number) => {
    line.querySelector("span").textContent = step.labels[number];
    line.querySelector("strong").textContent = step.values[number];
  });
  document.querySelector(".demo-bottom").innerHTML = '<span class="spark" aria-hidden="true">✳</span>' + step.note;
  if (!reduceMotion.matches) document.querySelector(".profile-demo").animate([
    { opacity: .25, transform: "translateY(12px) rotate(0deg)" },
    { opacity: 1, transform: "translateY(0) rotate(0deg)" }
  ], { duration: 420, easing: "ease-out" });
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => chooseStep(index));
  tab.addEventListener("keydown", event => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    chooseStep(next);
    tabs[next].focus();
  });
});


})();