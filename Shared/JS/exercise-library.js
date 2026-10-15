"use strict";

// Local video files are stored as Blobs in IndexedDB so the client page on this
// device can play the coach's technique demonstrations without an upload server.
(() => {
  const database = "lift-exercise-library-v1";
  const store = "videos";
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(database, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(store, { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function all() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readonly");
      const request = transaction.objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error);
    });
  }
  async function add(input) {
    const file = input.file;
    if (!(file instanceof Blob) || !["video/mp4", "video/webm", "video/ogg"].includes(file.type)) throw new Error("Choose an MP4, WebM or Ogg video.");
    if (file.size > 80 * 1024 * 1024) throw new Error("The video must be 80 MB or smaller.");
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      clientId: "alexander-drake",
      coachName: "Sarah Chen",
      exercise: input.exercise.trim().slice(0, 100),
      steps: input.steps.trim().slice(0, 1000),
      cues: input.cues.trim().slice(0, 600),
      mistakes: input.mistakes.trim().slice(0, 600),
      fileName: file.name || "coach-video",
      mimeType: file.type,
      file,
      createdAt: new Date().toISOString()
    };
    const db = await open();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readwrite");
      transaction.objectStore(store).put(record);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    return record;
  }
  async function remove(id) {
    const db = await open();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(store, "readwrite");
      transaction.objectStore(store).delete(id);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  }
  window.LiftExerciseLibrary = { all, add, remove };
})();
