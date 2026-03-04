// p44-zendesk-bridge.js
// Receives ticket data from Zendesk page via postMessage (bookmarklet)
// and forwards it to the app as a CustomEvent so your existing code can use it.

(function () {
  function nowIso() { return new Date().toISOString(); }

  function normalize(payload) {
    const p = payload || {};
    const idFromUrl = (() => {
      const m = String(p.url || "").match(/tickets\/(\d+)/);
      return m ? m[1] : "";
    })();

    return {
      id: String(p.id || idFromUrl || "—"),
      url: String(p.url || ""),
      subject: String(p.subject || "—"),
      rawText: String(p.rawText || p.description || ""),
      description: String(p.description || ""),
      requesterName: String(p.requesterName || "—"),
      requesterEmail: String(p.requesterEmail || ""),
      org: String(p.org || "Zendesk Sandbox"),
      createdAtUtc: String(p.createdAtUtc || nowIso()),
      tags: Array.isArray(p.tags) ? p.tags : [],
      priority: String(p.priority || "Medium")
    };
  }

  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (!msg || msg.type !== "P44_ZD_TICKET") return;

    const ticket = normalize(msg.payload);

    // Expose for debugging if needed
    window.P44_ZD_TICKET = ticket;

    // Dispatch app event
    window.dispatchEvent(new CustomEvent("P44_ZD_TICKET_EVENT", { detail: ticket }));
  });
})();
