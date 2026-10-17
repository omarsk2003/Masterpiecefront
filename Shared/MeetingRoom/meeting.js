"use strict";
(() => {
  const room = new URLSearchParams(location.search).get("room") || "";
  const status = document.getElementById("meeting-status");
  if (document.referrer.startsWith(location.origin) && new URL(document.referrer).pathname.includes("/Coach/Meetings/")) {
    document.getElementById("back-link").href = "../../Coach/Meetings/meetings.html";
  }
  if (!/^lift-[a-z0-9-]{8,80}$/i.test(room)) { status.textContent = "This meeting link is invalid."; return; }
  if (typeof JitsiMeetExternalAPI !== "function") { status.textContent = "The video service could not load. Check your connection and try again."; return; }
  try {
    const api = new JitsiMeetExternalAPI("meet.jit.si", {
      roomName: room,
      width: "100%",
      height: Math.max(500, Math.min(window.innerHeight * .75, 760)),
      parentNode: document.getElementById("meet"),
      userInfo: { displayName: "LIFT participant" }
    });
    api.addListener("videoConferenceJoined", () => { status.textContent = "You are in the meeting."; });
    api.addListener("readyToClose", () => { status.textContent = "You left the meeting."; });
  } catch { status.textContent = "The video meeting could not start. Please reload this page."; }
})();
