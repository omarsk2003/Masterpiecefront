"use strict";
// Browser-local application records and PDF Blobs for this frontend preview.
(() => {
  const databaseName = "lift-specialist-applications";
  const storeName = "applications";
  const badgeKey = "lift-specialist-pending-counts";
  const hex = bytes => [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
  async function passwordHash(password, salt) {
    const data = new TextEncoder().encode(`${salt}:${password}`);
    return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", data)));
  }
  async function createCredential(password) {
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    return { passwordSalt: salt, passwordHash: await passwordHash(password, salt) };
  }
  async function verifyCredential(record, password) {
    return Boolean(record.passwordSalt && record.passwordHash && record.passwordHash === await passwordHash(password, record.passwordSalt));
  }
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function all() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => reject(transaction.error);
    });
  }
  async function put(application) {
    const db = await open();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(application);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
    await refreshBadges();
  }
  async function refreshBadges() {
    const records = await all();
    const counts = { coach: 1, nutritionist: 1 }; // Existing static preview applicants.
    for (const record of records) if (record.status === "pending" && counts[record.role] !== undefined) counts[record.role]++;
    try { localStorage.setItem(badgeKey, JSON.stringify(counts)); } catch { /* Records are still in IndexedDB. */ }
    window.dispatchEvent(new CustomEvent("lift:application-counts", { detail: counts }));
    return counts;
  }
  window.LiftSpecialistApplications = { all, put, refreshBadges, createCredential, verifyCredential, badgeKey };
})();
