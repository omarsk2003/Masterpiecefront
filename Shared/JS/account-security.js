"use strict";
// Browser-local account controls for this frontend preview. Production needs server-side auth.
(() => {
  const overrideKey = "lift-password-overrides-v1";
  const adminsKey = "lift-admin-accounts-v1";
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; } };
  const hex = bytes => Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  const digest = async (value, salt) => hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${value}`))));
  const credential = async password => { const salt = hex(crypto.getRandomValues(new Uint8Array(16))); return { salt, hash: await digest(password, salt) }; };
  const matches = async (saved, password) => Boolean(saved?.salt && saved.hash === await digest(password, saved.salt));
  const normalize = email => String(email || "").trim().toLowerCase();
  async function verify(email, password, fallback) {
    const stored = read(overrideKey)[normalize(email)];
    return stored ? matches(stored, password) : typeof fallback === "function" ? Boolean(await fallback(password)) : password === fallback;
  }
  async function change(email, current, next, fallback) {
    if (next.length < 8 || !(await verify(email, current, fallback))) return false;
    const overrides = read(overrideKey);
    overrides[normalize(email)] = await credential(next);
    localStorage.setItem(overrideKey, JSON.stringify(overrides));
    return true;
  }
  const admins = () => { const value = read(adminsKey); return Array.isArray(value) ? value.map(item => ({ ...item, status: window.LiftAccountStatus?.get("admin", item.email, item.status || "active") || item.status || "active" })) : []; };
  async function addAdmin(name, email, password) {
    email = normalize(email);
    if (!email || email === "admin@lift.demo" || password.length < 8 || admins().some(item => item.email === email)) return false;
    const records = admins();
    records.push({ name: String(name).trim().slice(0, 80), email, ...(await credential(password)) });
    localStorage.setItem(adminsKey, JSON.stringify(records));
    return true;
  }
  async function verifyAdmin(email, password) {
    const record = admins().find(item => item.email === normalize(email));
    return record && await verify(email, password, value => matches(record, value)) ? record : null;
  }
  function removeAdmin(email) {
    const current = admins();
    const records = current.filter(item => item.email !== normalize(email));
    if (records.length === current.length) return false;
    try { localStorage.setItem(adminsKey, JSON.stringify(records)); return true; } catch { return false; }
  }
  function setAdminStatus(email, status) {
    if (!["active", "suspended", "blocked"].includes(status) || !admins().some(item => item.email === normalize(email))) return false;
    return window.LiftAccountStatus.set("admin", email, status);
  }
  window.LiftAccountSecurity = { verify, change, admins, addAdmin, removeAdmin, setAdminStatus, verifyAdmin };
})();
