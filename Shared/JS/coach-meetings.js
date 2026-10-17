"use strict";

// Same-device meeting requests shared by the assigned coach and client pages.
(() => {
  const key = "lift-coach-meetings-v1";
  function demoMeeting() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    return { id: "lift-demo-meeting", clientId: "alexander-drake", clientName: "Alexander Drake", coachName: "Sarah Chen", start: tomorrow.toISOString(), minutes: 30, topic: "Demo: training plan check-in", room: "lift-demo-sarah-alexander-preview", link: "", status: "accepted", createdAt: new Date().toISOString(), demo: true };
  }
  function read() {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      const meetings = Array.isArray(saved) ? saved.filter(item => item && item.clientId === "alexander-drake") : [];
      return meetings.length ? meetings : [demoMeeting()];
    } catch { return [demoMeeting()]; }
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
      room: `lift-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)}`,
      link: "",
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
  function remove(id) { return write(read().filter(item => item.id !== id)); }
  window.LiftCoachMeetings = { key, read, create, setStatus, remove };
})();
