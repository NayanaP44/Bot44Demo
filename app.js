// -----------------------------
// Mock Tickets (generic dataset)
// -----------------------------
const TICKETS = {
  user_creation: {
    id: "2601123",
    subject: "Request: Create new STS user for onboarding",
    requester: { name: "Fahd", email: "fahd@customer.com", org: "CustomerCo" },
    createdAtUtc: "2026-02-27T09:10:00Z",
    events: [
      { ts: "2026-02-27T09:10:00Z", by: "Requester", text: "Please create a new STS user for Priya Nair (priya.nair@customer.com). Role: Admin. Region: APAC. Manager: Rohan. Cost center: APAC-109." },
      { ts: "2026-02-27T09:11:10Z", by: "Automation", text: "Thanks for contacting support. An agent will respond soon." }
    ],
    classification: { category: "User Assistance", intent: "User Creation", sentiment: "Neutral", priority: "Medium" }
  },

  howto: {
    id: "2600871",
    subject: "How do I export shipment data for last month?",
    requester: { name: "Isaac", email: "isaac@customer.com", org: "FedEx" },
    createdAtUtc: "2026-02-25T12:02:00Z",
    events: [
      { ts: "2026-02-25T12:02:00Z", by: "Requester", text: "I need to export shipment data for last month. Where do I do it in the UI?" }
    ],
    classification: { category: "User Assistance", intent: "How-To Assistance", sentiment: "Positive", priority: "Low" }
  },

  bug: {
    id: "2600659",
    subject: "Ocean Visibility page loads blank for some users",
    requester: { name: "Mel", email: "mel@customer.com", org: "ShipperX" },
    createdAtUtc: "2026-02-23T16:30:00Z",
    events: [
      { ts: "2026-02-23T16:30:00Z", by: "Requester", text: "Ocean Visibility page loads blank. Started today. Browser: Chrome." },
      { ts: "2026-02-23T16:35:40Z", by: "Agent", text: "Can you share HAR file + console logs?" }
    ],
    classification: { category: "Incident", intent: "Bug Report", sentiment: "Neutral", priority: "High" }
  },

  access: {
    id: "2518307",
    subject: "Permissions request: enable feature access",
    requester: { name: "Isaac Dominguez Ortiz", email: "isaac.dominguez.ortiz@fedex.com", org: "FedEx" },
    createdAtUtc: "2025-06-20T07:34:03Z",
    events: [
      { ts: "2025-06-20T07:34:03Z", by: "Requester", text: "Please enable feature access for eric.lazell@fedex.com." },
      { ts: "2025-06-20T07:34:12Z", by: "Automation", text: "Thanks for contacting support. An agent will respond soon." }
    ],
    classification: { category: "User Assistance", intent: "Access/Permissions", sentiment: "Neutral", priority: "Low" }
  }
};

// Mock Jira links per ticket
const JIRA_BY_TICKET = {
  user_creation: [
    { key: "P44-21001", status: "To Do", assignee: "Access Ops", updated: "2026-02-27T09:14:00Z", note: "Admin role approvals required." }
  ],
  howto: [],
  bug: [
    { key: "P44-20911", status: "In Progress", assignee: "Ocean Team", updated: "2026-02-23T18:05:00Z", note: "Investigating blank page regression." }
  ],
  access: [
    { key: "P44-19321", status: "Done", assignee: "Ops Enablement", updated: "2025-06-20T08:40:10Z", note: "Permissions updated." }
  ]
};

// Mock KB entries
const KB = [
  { title: "User creation workflow (STS)", source: "internal", snippet: "Required fields, validations, approvals, and audit logging for creating STS users.", url: "https://www.project44.com/help-center/", tags: ["sts", "user_creation", "approvals"] },
  { title: "Export shipment data from UI", source: "helpcenter", snippet: "Steps to export shipments from filters and download CSV.", url: "https://www.project44.com/help-center/", tags: ["export", "shipments", "csv"] },
  { title: "Troubleshooting blank page issues", source: "internal", snippet: "Collect HAR + console logs, check feature flags, confirm permissions and org mapping.", url: "https://www.project44.com/help-center/", tags: ["troubleshooting", "har", "browser"] },
  { title: "Authentication and access control overview", source: "helpcenter", snippet: "How authentication impacts access to product features and what to check first.", url: "https://www.project44.com/help-center/", tags: ["authentication", "access_control"] }
];

// Mock side conversations per ticket
const SIDE_CONVO_BY_TICKET = {
  user_creation: [
    { ts: "2026-02-27T09:15:00Z", by: "Agent", text: "Need to confirm admin approval path for CustomerCo." },
    { ts: "2026-02-27T09:18:00Z", by: "Access Ops", text: "Admin role requires manager approval. Collect manager email." }
  ],
  howto: [
    { ts: "2026-02-25T12:05:00Z", by: "Agent", text: "Point user to export documentation + confirm permission to export." }
  ],
  bug: [
    { ts: "2026-02-23T17:10:00Z", by: "Ocean Team", text: "Looks like a recent release; check feature flag + console errors." }
  ],
  access: [
    { ts: "2025-06-20T08:21:18Z", by: "Access Team", text: "Add permission set; re-login required." }
  ]
};

// -----------------------------
// Helpers
// -----------------------------
const $ = (id) => document.getElementById(id);

function isoNow() { return new Date().toISOString(); }
function fmt(ts) { return new Date(ts).toLocaleString(); }
function rid() { return `REQ-${Math.random().toString(16).slice(2, 10).toUpperCase()}`; }
function safeLower(s) { return (s || "").toLowerCase(); }

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 2200);
}

// -----------------------------
// Observe Logs
// -----------------------------
let LOGS = [];
let ACTIVE_KEY = "user_creation";
let ACTIVE = TICKETS[ACTIVE_KEY];

function logEvent({ level="INFO", type="AI", message="", meta={} }) {
  LOGS.push({
    ts: isoNow(),
    level,
    type,
    ticketId: ACTIVE.id,
    actor: "agent@nayana (demo)",
    message,
    meta
  });
  renderLogs();
}

function renderLogs() {
  const filter = $("logFilter").value;
  const el = $("logs");
  const list = (filter === "ALL") ? LOGS : LOGS.filter(x => x.type === filter);

  if (!list.length) {
    el.innerHTML = `<div class="muted" style="padding:12px;">No logs yet. Use Refresh / Generate actions.</div>`;
    return;
  }

  el.innerHTML = list.slice().reverse().map(l => `
    <div class="logRow">
      <div class="logMeta">${escapeHtml(fmt(l.ts))}</div>
      <div><span class="logType ${escapeHtml(l.type)}">${escapeHtml(l.type)}</span></div>
      <div class="logMsg">
        ${escapeHtml(l.message)}
        ${l.meta && Object.keys(l.meta).length ? `<div class="muted small" style="margin-top:6px;">${escapeHtml(JSON.stringify(l.meta))}</div>` : ""}
      </div>
    </div>
  `).join("");
}

function exportLogs() {
  const blob = new Blob([JSON.stringify(LOGS, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `observe-logs-${ACTIVE.id}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  logEvent({ type: "ACTION", message: "Exported observe logs", meta: { count: LOGS.length } });
}

// -----------------------------
// Rail Navigation (replaces tabs)
// -----------------------------
document.querySelectorAll(".railItem").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".railItem").forEach(x => x.classList.remove("railItem--active"));
    btn.classList.add("railItem--active");

    const name = btn.dataset.tab;
    document.querySelectorAll(".tabPanel").forEach(p => p.classList.remove("tabPanel--active"));
    $(`tab-${name}`).classList.add("tabPanel--active");

    logEvent({ type: "AI", message: `Switched view: ${name}` });
  });
});

// -----------------------------
// Rendering blocks
// -----------------------------
function setChips(category, intent, sentiment, priority) {
  $("chipCategory").textContent = `Category: ${category}`;
  $("chipIntent").textContent = `Intent: ${intent}`;
  $("chipSentiment").textContent = `Sentiment: ${sentiment}`;
  $("chipPriority").textContent = `Priority: ${priority}`;
}

function renderTicketSummaryEmpty() {
  $("ticketSummary").innerHTML = `<div class="muted">Click <b>Generate Summary</b> to populate summary for the selected ticket.</div>`;
  setChips("—","—","—","—");
}

function renderTicketSummary() {
  const c = ACTIVE.classification;
  setChips(c.category, c.intent, c.sentiment, c.priority);

  const requester = `${ACTIVE.requester.name} (${ACTIVE.requester.email}) • Org: ${ACTIVE.requester.org}`;
  const timeline = ACTIVE.events.map(e => `• ${new Date(e.ts).toLocaleString()} — ${e.by}: ${e.text}`).join("\n");

  $("ticketSummary").innerHTML = `
    <div><b>Issue Summary</b></div>
    <div class="muted" style="margin-top:6px;">${escapeHtml(ACTIVE.subject)}</div>
    <div class="muted" style="margin-top:6px;">${escapeHtml(requester)}</div>

    <div style="margin-top:10px;"><b>Key Events</b></div>
    <pre style="margin-top:8px; border:1px solid #E3E8F2; border-radius:14px; padding:10px; background:#fff; overflow:auto; font-family: var(--mono); font-size: 12px; white-space: pre-wrap;">${escapeHtml(timeline)}</pre>
  `;

  logEvent({ type: "AI", message: "Generated ticket summary + classification (mock)", meta: { ...c } });
  toast("Summary generated");
}

function renderJira() {
  const links = JIRA_BY_TICKET[ACTIVE_KEY] || [];
  $("jiraLinks").innerHTML = links.length ? links.map(j => `
    <div class="item">
      <div class="item__top">
        <div class="item__t">${escapeHtml(j.key)}</div>
        <div class="kv">${escapeHtml(j.status)}</div>
      </div>
      <div class="item__m">${escapeHtml(j.note)}</div>
      <div class="item__kvs">
        <span class="kv">Assignee: ${escapeHtml(j.assignee)}</span>
        <span class="kv">Updated: ${escapeHtml(new Date(j.updated).toLocaleString())}</span>
      </div>
    </div>
  `).join("") : `<div class="muted">No linked Jira issues found.</div>`;

  logEvent({ type: "API", message: "Loaded linked Jira issues (mock)", meta: { count: links.length } });
}

function renderSeekerEmpty() {
  $("seeker").innerHTML = `
    <div class="item"><div class="item__t">Suggested Macros</div><div class="item__m muted">Run Seeker to get recommendations.</div></div>
    <div class="item"><div class="item__t">Similar Tickets</div><div class="item__m muted">Run Seeker to list similar tickets.</div></div>
  `;
}

function runSeeker() {
  const intent = ACTIVE.classification.intent;
  const isUserCreation = safeLower(intent).includes("user creation");

  const macros = isUserCreation
    ? "• Confirm required fields (name/email/role/region)\n• Mention approval process for Admin\n• Provide confirmation + requestId"
    : safeLower(intent).includes("bug")
      ? "• Acknowledge impact\n• Gather artifacts (HAR/console/screenshot)\n• Provide workaround if available\n• Set expectation + next update"
      : "• Acknowledge request\n• Provide steps\n• Ask for confirmation";

  const items = [
    {
      t: "Suggested Macros",
      m: macros,
      kvs: ["Macro: Acknowledge", "Macro: Next Steps", isUserCreation ? "Macro: Approval Needed" : "Macro: Gather Details"]
    },
    {
      t: "Similar Tickets",
      m: "• Similar ticket suggestions are mocked here.\n• Later: search by org/requester/tags.",
      kvs: [`Intent: ${intent}`, `Org: ${ACTIVE.requester.org}`]
    }
  ];

  $("seeker").innerHTML = items.map(x => `
    <div class="item">
      <div class="item__t">${escapeHtml(x.t)}</div>
      <div class="item__m" style="white-space:pre-wrap;">${escapeHtml(x.m)}</div>
      <div class="item__kvs">${x.kvs.map(k => `<span class="kv">${escapeHtml(k)}</span>`).join("")}</div>
    </div>
  `).join("");

  logEvent({ type: "AI", message: "Seeker recommendations generated (mock)", meta: { intent } });
  toast("Seeker ran");
}

function renderSideConvo() {
  const msgs = SIDE_CONVO_BY_TICKET[ACTIVE_KEY] || [];
  $("sideConvo").innerHTML = msgs.length ? msgs.map(m => `
    <div class="msg">
      <div class="msg__meta">${escapeHtml(m.by)} • ${escapeHtml(fmt(m.ts))}</div>
      <div class="msg__txt">${escapeHtml(m.text)}</div>
    </div>
  `).join("") : `<div class="muted">No side conversations found.</div>`;
}

function summarizeSideConvo() {
  const msgs = SIDE_CONVO_BY_TICKET[ACTIVE_KEY] || [];
  const summary =
    msgs.length
      ? `Side conversation summary:\n- ${msgs.map(m => m.text).join("\n- ")}`
      : "Side conversation summary:\n- No side conversations available.";

  $("sideConvo").insertAdjacentHTML("afterbegin", `
    <div class="msg" style="border-style:dashed;">
      <div class="msg__meta">Summary • ${escapeHtml(fmt(isoNow()))}</div>
      <div class="msg__txt" style="white-space:pre-wrap;">${escapeHtml(summary)}</div>
    </div>
  `);

  logEvent({ type: "AI", message: "Side conversations summarized (mock)" });
  toast("Side convo summarized");
}

function renderKbResults(items) {
  const el = $("kbResults");
  if (!items.length) {
    el.innerHTML = `
      <div class="kbItem">
        <div class="kbItem__t">No results</div>
        <div class="kbItem__m">Try: “user creation”, “permissions”, “export”, “HAR”</div>
      </div>`;
    return;
  }
  el.innerHTML = items.map(k => `
    <div class="kbItem">
      <div class="kbItem__t">${escapeHtml(k.title)}</div>
      <div class="kbItem__m">${escapeHtml(k.snippet)}</div>
      <div class="kbItem__a">
        <span class="badge">${escapeHtml(k.source)}</span>
        ${k.tags.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("")}
        <span class="link">${escapeHtml(k.url)}</span>
      </div>
    </div>
  `).join("");
}

function kbSearch(query, scope) {
  const q = safeLower(query).trim();
  if (!q) return [];

  return KB.filter(k => {
    if (scope !== "all" && k.source !== scope) return false;
    const hay = safeLower(k.title + " " + k.snippet + " " + k.tags.join(" "));
    return hay.includes(q) || q.split(/\s+/).some(w => w && hay.includes(w));
  });
}

// Opening / Closure
function openingMessage() {
  const text =
`Hi ${ACTIVE.requester.name},

Thanks for reaching out to project44 Support. I’m looking into: "${ACTIVE.subject}".

To proceed, could you confirm any missing details (e.g., user email/org, affected module, expected outcome)? Once confirmed, I’ll take the next steps.

Best regards,
Nayana`;
  $("openCloseOut").textContent = text;
  $("openCloseOut").classList.remove("empty");
  logEvent({ type: "AI", message: "Generated opening message (mock)" });
  toast("Opening generated");
}

function closureMessage() {
  const text =
`Hi ${ACTIVE.requester.name},

Thank you for confirming. We’ve completed the requested steps for "${ACTIVE.subject}".

If the issue persists or you need anything else, reply to this ticket and we’ll continue assisting.

Best regards,
Nayana`;
  $("openCloseOut").textContent = text;
  $("openCloseOut").classList.remove("empty");
  logEvent({ type: "AI", message: "Generated closure message (mock)" });
  toast("Closure generated");
}

// ASK ME
function askMe(question) {
  const q = safeLower(question);
  const intent = ACTIVE.classification.intent;

  const basicFacts = [
    `Ticket: ${ACTIVE.id}`,
    `Intent: ${intent}`,
    `Requester: ${ACTIVE.requester.name} (${ACTIVE.requester.email})`,
    `Org: ${ACTIVE.requester.org}`,
    `Subject: ${ACTIVE.subject}`
  ].join("\n");

  let ans = `Grounded on the current ticket:\n${basicFacts}\n\n`;

  if (q.includes("summarize") || q.includes("summary")) {
    ans += `Summary:\n- ${ACTIVE.events[0]?.text || "No events"}\n`;
    if (ACTIVE.events.length > 1) ans += `- Latest: ${ACTIVE.events[ACTIVE.events.length - 1].text}\n`;
    return ans;
  }

  if (q.includes("ask next") || q.includes("next question") || q.includes("clarify")) {
    if (safeLower(intent).includes("user creation")) {
      ans +=
`Suggested clarifying questions:
1) Confirm user’s first/last name and email
2) Confirm role + region
3) Confirm manager email (Admin approvals)
4) Confirm cost center / access template`;
      return ans;
    }
    if (safeLower(intent).includes("bug")) {
      ans +=
`Suggested clarifying questions:
1) Exact URL/page? When did it start?
2) Browser + version? Any extensions?
3) HAR file + console logs?
4) Does it reproduce for other users?`;
      return ans;
    }
    ans +=
`Suggested clarifying questions:
1) What exact screen/step are they on?
2) Any error message/screenshot?
3) One user or many?
4) Expected behavior?`;
    return ans;
  }

  if (q.includes("recommend") || q.includes("kb") || q.includes("article")) {
    const top = KB.slice(0, 3).map(k => `- ${k.title} (${k.source})`).join("\n");
    ans += `Recommended KB:\n${top}`;
    return ans;
  }

  ans +=
`I can help with:
- Ticket summary + classification
- KB suggestions
- Draft replies (opening/closure/full reply)
- Linked Jira summary
- Side conversation summary
- Observe logs (audit trail)`;
  return ans;
}

// Reply generator
function generateReply(lang) {
  const { name } = ACTIVE.requester;
  const intent = safeLower(ACTIVE.classification.intent);

  let body =
`Dear ${name},

Thank you for reaching out to the project44 Support team.

I understand your request regarding: "${ACTIVE.subject}".`;

  if (intent.includes("user creation")) {
    body += `

We can proceed with creating the requested user. If Admin access is required, an approval step may apply. Once confirmed, I’ll share the request ID and next steps.`;
  } else if (intent.includes("bug")) {
    body += `

To help us investigate, please share:
1) A screenshot of the issue
2) Browser version
3) HAR file + console logs (if possible)

Once received, we’ll continue troubleshooting.`;
  } else {
    body += `

Here are the next steps:
1) Please confirm the exact screen/flow you are using
2) Share any error messages or screenshots
3) Confirm if this impacts one user or multiple users`;
  }

  body += `

Best regards,
Nayana Ananda
Customer Support`;

  if (lang === "es") body = body.replace("Dear", "Hola").replace("Thank you for reaching out to the project44 Support team.", "Gracias por contactar al equipo de Soporte de project44.");
  if (lang === "fr") body = body.replace("Dear", "Bonjour").replace("Thank you for reaching out to the project44 Support team.", "Merci d’avoir contacté l’équipe Support project44.");

  return body;
}

function shortenDraft() {
  const { name } = ACTIVE.requester;
  return `Hi ${name},

Regarding "${ACTIVE.subject}": we’re on it. Please share any missing details (screenshot/errors/user email), and we’ll proceed.

Thanks,
Nayana`;
}

function formalDraft() {
  const { name } = ACTIVE.requester;
  return `Dear ${name},

This is to acknowledge your request regarding "${ACTIVE.subject}". Kindly provide any missing details (e.g., user email/org, screenshots, logs), and we will proceed with the appropriate next steps.

Sincerely,
Nayana Ananda
Customer Support`;
}

// Core UI
function refreshContext() {
  logEvent({ type: "API", message: "Fetched ticket context (mock)", meta: { ticketId: ACTIVE.id, requester: ACTIVE.requester.email } });
  renderJira();
  renderSideConvo();
  toast(`Refreshed: ${ACTIVE.id}`);
}

function resetDemoUI() {
  $("qaAnswer").textContent = "Ask a question to see an answer.";
  $("qaAnswer").classList.add("empty");

  $("openCloseOut").textContent = "Click Opening or Closure to generate text.";
  $("openCloseOut").classList.add("empty");

  $("draft").value = "";
  $("kbQuery").value = "";
  $("qaInput").value = "";

  renderTicketSummaryEmpty();
  renderSeekerEmpty();
  renderKbResults([]);
  renderJira();
  renderSideConvo();
  renderLogs();
}

function setActiveTicket(key) {
  ACTIVE_KEY = key;
  ACTIVE = TICKETS[key];

  LOGS = [];
  resetDemoUI();
  logEvent({ type: "API", message: "Switched active ticket (mock)", meta: { ticketId: ACTIVE.id, key } });
  toast(`Ticket set: ${ACTIVE.id}`);
}

/* =========================================================
   ✅ NEW: Zendesk Live Ticket Integration (no admin)
   Receives ticket content via p44-zendesk-bridge.js CustomEvent
   ========================================================= */
function classifyFromText(text) {
  const t = safeLower(text);
  if (t.includes("create") && t.includes("user")) return { category:"User Assistance", intent:"User Creation", sentiment:"Neutral", priority:"Medium" };
  if (t.includes("export") || t.includes("how do i") || t.includes("where do i")) return { category:"User Assistance", intent:"How-To Assistance", sentiment:"Neutral", priority:"Low" };
  if (t.includes("blank") || t.includes("error") || t.includes("bug") || t.includes("not working")) return { category:"Incident", intent:"Bug Report", sentiment:"Neutral", priority:"High" };
  if (t.includes("permission") || t.includes("enable") || t.includes("access")) return { category:"User Assistance", intent:"Access/Permissions", sentiment:"Neutral", priority:"Low" };
  return { category:"User Assistance", intent:"General Support", sentiment:"Neutral", priority:"Medium" };
}

function ensureLiveOption(label) {
  const sel = $("ticketSelect");
  const key = "zendesk_live";
  let opt = sel.querySelector(`option[value="${key}"]`);
  if (!opt) {
    opt = document.createElement("option");
    opt.value = key;
    opt.textContent = label;
    sel.appendChild(opt);
  } else {
    opt.textContent = label;
  }
  return key;
}

window.addEventListener("P44_ZD_TICKET_EVENT", (e) => {
  const zd = e.detail || {};
  const raw = zd.rawText || "";
  const subject = zd.subject || `Zendesk Ticket #${zd.id || "—"}`;

  const klass = classifyFromText(`${subject}\n${raw}`);

  // Build a live ticket in your existing structure
  const key = ensureLiveOption(`Zendesk Live • #${zd.id || "—"}`);

  TICKETS[key] = {
    id: String(zd.id || "—"),
    subject,
    requester: {
      name: zd.requesterName || "Requester",
      email: zd.requesterEmail || "",
      org: zd.org || "Zendesk Sandbox"
    },
    createdAtUtc: zd.createdAtUtc || isoNow(),
    events: [
      { ts: zd.createdAtUtc || isoNow(), by: "Ticket", text: raw || "(No text extracted from page)" }
    ],
    classification: klass
  };

  // Optional: also set side convo / jira mocks empty for live
  SIDE_CONVO_BY_TICKET[key] = SIDE_CONVO_BY_TICKET[key] || [];
  JIRA_BY_TICKET[key] = JIRA_BY_TICKET[key] || [];

  // Switch UI to live ticket
  $("ticketSelect").value = key;
  setActiveTicket(key);

  logEvent({ type: "API", message: "Loaded live Zendesk ticket via bookmarklet", meta: { ticketId: TICKETS[key].id } });
  toast(`Loaded Zendesk ticket #${TICKETS[key].id}`);
});

// Wire events
$("ticketSelect").addEventListener("change", (e) => setActiveTicket(e.target.value));
$("btnRefresh").addEventListener("click", refreshContext);

$("btnResetDemo").addEventListener("click", () => {
  LOGS = [];
  resetDemoUI();
  logEvent({ type: "API", message: "Reset demo state" });
  toast("Reset");
});

$("btnGenSummary").addEventListener("click", renderTicketSummary);
$("btnLoadJira").addEventListener("click", renderJira);
$("btnRunSeeker").addEventListener("click", runSeeker);
$("btnOpening").addEventListener("click", openingMessage);
$("btnClosure").addEventListener("click", closureMessage);
$("btnSummSide").addEventListener("click", summarizeSideConvo);

$("btnKbSearch").addEventListener("click", () => {
  const q = $("kbQuery").value;
  const scope = $("kbScope").value;
  logEvent({ type: "KB", message: "KB search executed (mock)", meta: { query: q, scope } });
  const results = kbSearch(q, scope);
  renderKbResults(results);
});

$("btnAsk").addEventListener("click", () => {
  const q = $("qaInput").value.trim();
  if (!q) return;
  logEvent({ type: "AI", message: "Follow-up question asked (mock)", meta: { question: q } });
  const ans = askMe(q);
  $("qaAnswer").textContent = ans;
  $("qaAnswer").classList.remove("empty");
});

$("btnGenReply").addEventListener("click", () => {
  const lang = $("lang").value;
  const requestId = rid();
  $("draft").value = generateReply(lang);
  logEvent({ type: "AI", message: "Generated draft reply (mock)", meta: { requestId, lang } });
  toast(`Draft generated • ${requestId}`);
});

$("btnShorten").addEventListener("click", () => {
  if (!$("draft").value.trim()) return;
  $("draft").value = shortenDraft();
  logEvent({ type: "AI", message: "Shortened draft (mock)" });
  toast("Draft shortened");
});

$("btnMoreFormal").addEventListener("click", () => {
  if (!$("draft").value.trim()) return;
  $("draft").value = formalDraft();
  logEvent({ type: "AI", message: "Adjusted draft to formal tone (mock)" });
  toast("Formal tone");
});

$("btnCopy").addEventListener("click", async () => {
  const t = $("draft").value;
  if (!t) return toast("Nothing to copy");
  await navigator.clipboard.writeText(t);
  logEvent({ type: "ACTION", message: "Copied draft to clipboard (mock)" });
  toast("Copied");
});

$("btnInsert").addEventListener("click", () => {
  const t = $("draft").value;
  if (!t) return toast("Nothing to insert");
  logEvent({ type: "ACTION", message: "Inserted reply into Zendesk editor (demo)", meta: { ticketId: ACTIVE.id } });
  toast("Inserted (demo)");
});

// Observe controls
$("logFilter").addEventListener("change", renderLogs);
$("btnClearLogs").addEventListener("click", () => {
  LOGS = [];
  renderLogs();
  toast("Logs cleared");
});
$("btnExportLogs").addEventListener("click", exportLogs);

// Init
function init() {
  renderTicketSummaryEmpty();
  renderSeekerEmpty();
  renderKbResults([]);
  renderJira();
  renderSideConvo();
  renderLogs();
  logEvent({ type: "API", message: "UI loaded (mock)", meta: { ticketId: ACTIVE.id } });
}
init();
