"use strict";
(() => {
  const member = window.LiftClientAccess?.member || { name: "Alexander Drake", email: "client@lift.demo", plan: "premium", preview: true };
  window.LiftAccountProfile?.render(member);
  window.LiftClientAccess?.finishRender();
})();
