"use strict";
(() => {
  const database = "lift-meal-video-library-v1";
  const store = "videos";
  const open = () => new Promise((resolve, reject) => {
    const request = indexedDB.open(database, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(store, { keyPath: "meal" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  async function all() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const request = db.transaction(store, "readonly").objectStore(store).getAll();
      request.onsuccess = () => { db.close(); resolve(request.result); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  }
  async function save(meal, file, instructions) {
    if (!(file instanceof Blob) || !["video/mp4", "video/webm", "video/ogg"].includes(file.type) || file.size > 80 * 1024 * 1024) {
      throw new Error("Choose an MP4, WebM or Ogg video up to 80 MB.");
    }
    const record = { meal: meal.trim().toLowerCase(), file, instructions: instructions.trim().slice(0, 1000), updatedAt: new Date().toISOString() };
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
  window.LiftMealVideos = { all, save };
})();
