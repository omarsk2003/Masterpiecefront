"use strict";
// Browser-local preview accounts. A server must replace this for real authentication.
(() => {
  const key = "lift-client-accounts-v1";
  const read = () => {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
  };
  const hex = bytes => [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  const hash = async (password, salt) => hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${password}`))));
  const createCredential = async password => {
    const passwordSalt = hex(crypto.getRandomValues(new Uint8Array(16)));
    return { passwordSalt, passwordHash: await hash(password, passwordSalt) };
  };
  const verify = async (record, password) => Boolean(record?.passwordSalt && record.passwordHash === await hash(password, record.passwordSalt));
  const find = email => read().find(item => item.email === email.trim().toLowerCase());
  const save = member => {
    const records = read().filter(item => item.email !== member.email);
    records.push(member);
    localStorage.setItem(key, JSON.stringify(records));
  };
  const replace = (oldEmail, member) => {
    const records = read();
    const index = records.findIndex(item => item.email === oldEmail);
    if (index < 0) return false;
    records[index] = member;
    localStorage.setItem(key, JSON.stringify(records));
    return true;
  };
  window.LiftClientAccounts = { find, save, replace, createCredential, verify };
})();
