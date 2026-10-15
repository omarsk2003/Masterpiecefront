"use strict";

// Same-device meeting requests shared by the assigned coach and client pages.
(() => {
  const key = "lift-coach-meetings-v1";
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(saved) ? saved.filter(item => item && item.clientId === "alexander-drake") : [];
    } catch { return []; }
  }
  function write(meetings) {
    try { localStorage.setItem(key, JSON.stringify(meetings)); }
    catch { return false; }
    document.dispatchEvent(new Event("lift:meetings-change"));
    return true;
  }
  function create(input) {
    const meeting = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      clientId: "alexander-drake",
      clientName: "Alexander Drake",
      coachName: "Sarah Chen",
      start: input.start,
      minutes: Number(input.minutes),
      topic: input.topic.trim().slice(0, 160),
      link: input.link.trim(),
      status: "pending",
      createdAt: new Date().toISOString()
    };
    return write([meeting, ...read()]);
  }
  function setStatus(id, status) {
    if (!["accepted", "declined", "cancelled"].includes(status)) return false;
    const meetings = read();
    const meeting = meetings.find(item => item.id === id);
    if (!meeting || meeting.status !== "pending") return false;
    meeting.status = status;
    return write(meetings);
  }
  window.LiftCoachMeetings = { key, read, create, setStatus };
})();
