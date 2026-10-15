"use strict";
// Add locally approved applicants to the static matching catalogue for this browser preview.
window.LiftSpecialistApplications.all().then(records => {
  for (const record of records) {
    if (record.status !== "active" || record.verified !== true) continue;
    const catalogue = record.role === "coach" ? window.LiftMatching.coaches : window.LiftMatching.nutritionists;
    if (!catalogue.some(person => person.id === record.id)) {
      const { certificates, bio, phone, email, ...matchingProfile } = record;
      catalogue.push(matchingProfile);
    }
  }
}).catch(() => {});
