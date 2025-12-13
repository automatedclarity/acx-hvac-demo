(() => {
  "use strict";

  // ------------------------------------------------------------
  // CONFIG
  // ------------------------------------------------------------
  const BRAND = {
    name: "Automated Clarity™",
    productLine: "HVAC Opportunity Scan",
    accent: "#2F4CFF", // indigo (used in gradients and rings)
    accentSoft: "rgba(47, 76, 255, 0.14)",
    ink: "#0B1220",
    ink2: "#111A2E",
    paper: "#FFFFFF",
    paper2: "#F6F8FF",
    border: "rgba(15, 23, 42, 0.10)",
  };

  // If you have an endpoint later, you can wire tags here.
  // For now we store tags in memory for future use.
  function applyTags(tags) {
    if (!tags || !tags.length) return;
    state.tags = state.tags || [];
    tags.forEach((t) => {
      if (!state.tags.includes(t)) state.tags.push(t);
    });
    // Optional: expose for debugging / future workflow wiring
    window.AutomatedClarityScanTags = state.tags.slice();
  }

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------
  const state = {
    stepIndex: 0,
    answers: {},
    tags: [],
  };

  // ------------------------------------------------------------
  // SCREENS (FLOW)
  // ------------------------------------------------------------
  const screens = [
    {
      id: "intro",
      type: "statement",
      title: BRAND.productLine,
      body: [
        "This scan doesn’t grade your shop.",
        "It reveals what happens underneath it on busy days.",
      ],
      note: "Takes about 60 seconds. No contact info required.",
      cta: "Continue",
    },
    {
      id: "orientation",
      type: "statement",
      body: [
        "Every HVAC shop looks organized from the outside.",
        "Underneath, outcomes depend on what still happens when no one is watching.",
      ],
      cta: "Continue",
    },
    {
      id: "quote_followup",
      type: "choice",
      question: "How are install or replacement quotes actually followed up?",
      helper: "Think about higher-value jobs — not quick service calls.",
      options: [
        {
          label: "Every quote automatically enters a follow-up sequence.",
          value: "automated",
          tags: ["followup_automated", "decay_risk_low"],
        },
        {
          label: "Follow-up depends on staff remembering or having time.",
          value: "manual",
          tags: ["followup_manual", "decay_risk_high"],
        },
        {
          label: "Once a quote is sent, follow-up is inconsistent or rare.",
          value: "rare",
          tags: ["followup_inconsistent", "decay_risk_high"],
        },
      ],
      cta: "Continue",
    },
    {
      id: "translation",
      type: "dynamic_statement",
      getTitle: () => "What this typically creates",
      getBody: (s) => {
        const v = s.answers.quote_followup;
        if (v === "automated") {
          return [
            "When follow-up is automated, quotes stay active longer —",
            "regardless of how busy the shop gets.",
          ];
        }
        return [
          "In shops where follow-up depends on memory,",
          "quotes usually go quiet between days 3–7 — even when homeowners are still deciding.",
        ];
      },
      footer:
        "This pattern isn’t about effort. It’s about what runs automatically — and what doesn’t.",
      cta: "Continue",
    },
    {
      id: "exposure",
      type: "statement",
      title: "What happens underneath most HVAC shops",
      body: [
        "Busy days delay responses — unintentionally.",
        "Quotes decay quietly — not instantly.",
        "Decision windows close whether follow-up happens or not.",
      ],
      footer: "None of this shows up on a dashboard. It only appears in outcomes.",
      cta: "Continue",
    },
    {
      id: "absence",
      type: "statement",
      title: "There’s a missing layer.",
      body: [
        "Most shops rely on people to remember what matters most —",
        "on the days when remembering is hardest.",
      ],
      footer: "When that layer is missing, revenue exposure becomes normal.",
      cta: "Continue",
    },
    {
      id: "system_preview",
      type: "statement",
      title: "When the gap is closed",
      body: [
        "Quotes continue to receive follow-up without anyone checking a list.",
        "Enquiries get acknowledged even when phones are slammed.",
        "Review requests go out consistently — not selectively.",
        "Nothing new is added to your team’s day.",
      ],
      footer: "This doesn’t replace people. It removes dependence on perfect days.",
      cta: "Continue",
    },
    {
      id: "inevitability",
      type: "statement",
      title: "This isn’t about growth.",
      body: [
        "It’s about insulation.",
        "The question isn’t whether your shop is capable.",
        "It’s whether outcomes should depend on memory at all.",
      ],
      footer:
        "Most shops never install this layer — not because it’s complex, but because it’s invisible.",
      cta: "Add the missing layer",
      ctaStyle: "primary",
    },
  ];

  // ------------------------------------------------------------
  // DOM (overlay)
  // ------------------------------------------------------------
  let overlayEl = null;
  let panelEl = null;
  let contentEl = null;

  function injectStyles() {
    if (document.getElementById("ac-survey-styles")) return;

    const style = document.createElement("style");
    style.id = "ac-survey-styles";
    style.textContent = `
/* ------------------------------------------------------------
   Automated Clarity™ Scan Overlay — Premium White/Indigo
------------------------------------------------------------ */
:root{
  --ac-ink: ${BRAND.ink};
  --ac-ink2: ${BRAND.ink2};
  --ac-paper: ${BRAND.paper};
  --ac-paper2: ${BRAND.paper2};
  --ac-border: ${BRAND.border};
  --ac-accent: ${BRAND.accent};
  --ac-accentSoft: ${BRAND.accentSoft};
  --ac-shadow: 0 24px 80px rgba(2, 8, 23, 0.22);
  --ac-shadow2: 0 10px 28px rgba(2, 8, 23, 0.12);
  --ac-radius: 22px;
  --ac-radius2: 16px;
  --ac-font: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
}

#acScanOverlay{
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  display: none;
  background: radial-gradient(1200px 900px at 20% 10%, rgba(47,76,255,0.16), rgba(255,255,255,0.0) 52%),
              radial-gradient(900px 700px at 85% 20%, rgba(47,76,255,0.12), rgba(255,255,255,0.0) 54%),
              rgba(7, 12, 24, 0.40);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

#acScanOverlay.ac-open{ display:block; }

#acScanWrap{
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
}

@media (max-width: 720px){
  #acScanWrap{ padding: 14px; align-items: flex-end; }
}

#acScanPanel{
  width: min(860px, 100%);
  max-height: min(760px, calc(100vh - 44px));
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,248,255,0.96));
  border: 1px solid var(--ac-border);
  border-radius: var(--ac-radius);
  box-shadow: var(--ac-shadow);
  overflow: hidden;
  transform: translateY(12px) scale(0.99);
  opacity: 0;
  transition: transform 260ms ease, opacity 260ms ease;
}

#acScanOverlay.ac-open #acScanPanel{
  transform: translateY(0) scale(1);
  opacity: 1;
}

#acScanTop{
  padding: 18px 22px 14px;
  border-bottom: 1px solid rgba(15,23,42,0.08);
  background: linear-gradient(90deg, rgba(47,76,255,0.08), rgba(255,255,255,0) 40%);
}

@media (max-width: 720px){
  #acScanPanel{ max-height: calc(100vh - 16px); border-radius: 18px; }
  #acScanTop{ padding: 16px 16px 12px; }
}

#acScanBrandRow{
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
}

#acScanBrand{
  display:flex;
  flex-direction: column;
  gap: 2px;
}

#acScanKicker{
  font-family: var(--ac-font);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(11,18,32,0.62);
}

#acScanTitle{
  font-family: var(--ac-font);
  font-size: 18px;
  font-weight: 620;
  color: var(--ac-ink);
  line-height: 1.2;
}

#acScanClose{
  appearance:none;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.8);
  color: rgba(11,18,32,0.70);
  width: 38px;
  height: 38px;
  border-radius: 12px;
  cursor: pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
}
#acScanClose:hover{ transform: translateY(-1px); border-color: rgba(47,76,255,0.22); background: rgba(255,255,255,0.95); }
#acScanClose:active{ transform: translateY(0px) scale(0.98); }

#acScanProgressRow{
  margin-top: 12px;
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 10px;
}

#acScanDots{
  display:flex;
  align-items:center;
  gap: 6px;
}

.ac-dot{
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(11,18,32,0.12);
}
.ac-dot.ac-on{
  background: var(--ac-accent);
  box-shadow: 0 0 0 4px rgba(47,76,255,0.14);
}

#acScanStepText{
  font-family: var(--ac-font);
  font-size: 12px;
  color: rgba(11,18,32,0.58);
  white-space: nowrap;
}

#acScanBody{
  padding: 22px;
  overflow: auto;
  max-height: calc(760px - 170px);
}

@media (max-width: 720px){
  #acScanBody{ padding: 16px; max-height: calc(100vh - 210px); }
}

.ac-card{
  background: rgba(255,255,255,0.85);
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: var(--ac-radius2);
  box-shadow: var(--ac-shadow2);
  padding: 18px 18px;
}

.ac-h1{
  font-family: var(--ac-font);
  font-size: 26px;
  font-weight: 650;
  color: var(--ac-ink);
  line-height: 1.15;
  margin: 0 0 10px 0;
}

@media (max-width: 720px){
  .ac-h1{ font-size: 22px; }
}

.ac-p{
  font-family: var(--ac-font);
  font-size: 16px;
  color: rgba(11,18,32,0.78);
  line-height: 1.55;
  margin: 0;
}

.ac-lines{
  display:flex;
  flex-direction: column;
  gap: 8px;
}

.ac-note{
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(47,76,255,0.06);
  border: 1px solid rgba(47,76,255,0.14);
  color: rgba(11,18,32,0.70);
  font-family: var(--ac-font);
  font-size: 13px;
  line-height: 1.45;
}

.ac-footer{
  margin-top: 14px;
  color: rgba(11,18,32,0.62);
  font-family: var(--ac-font);
  font-size: 13px;
  line-height: 1.45;
}

.ac-qwrap{ display:flex; flex-direction: column; gap: 14px; }
.ac-qtitle{
  font-family: var(--ac-font);
  font-size: 18px;
  font-weight: 640;
  color: var(--ac-ink);
  line-height: 1.3;
  margin: 0;
}
.ac-qhelp{
  font-family: var(--ac-font);
  font-size: 13px;
  color: rgba(11,18,32,0.62);
  line-height: 1.4;
  margin-top: -8px;
}

.ac-options{
  display:flex;
  flex-direction: column;
  gap: 10px;
}

.ac-opt{
  width: 100%;
  text-align:left;
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.88);
  border-radius: 16px;
  padding: 14px 14px;
  cursor: pointer;
  display:flex;
  align-items:flex-start;
  gap: 12px;
  transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
}

.ac-opt:hover{
  transform: translateY(-1px);
  border-color: rgba(47,76,255,0.20);
  box-shadow: 0 14px 40px rgba(2,8,23,0.10);
  background: rgba(255,255,255,0.96);
}

.ac-radio{
  width: 18px; height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(11,18,32,0.18);
  margin-top: 2px;
  display:flex;
  align-items:center;
  justify-content:center;
  flex: 0 0 auto;
}
.ac-radio::after{
  content:"";
  width: 8px; height: 8px;
  border-radius: 999px;
  background: var(--ac-accent);
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 140ms ease, transform 140ms ease;
}

.ac-opt.ac-selected{
  border-color: rgba(47,76,255,0.34);
  box-shadow: 0 18px 52px rgba(47,76,255,0.14);
  background: rgba(47,76,255,0.06);
}

.ac-opt.ac-selected .ac-radio{
  border-color: rgba(47,76,255,0.45);
}
.ac-opt.ac-selected .ac-radio::after{
  opacity: 1;
  transform: scale(1);
}

.ac-opttext{
  font-family: var(--ac-font);
  font-size: 15px;
  color: rgba(11,18,32,0.82);
  line-height: 1.45;
}

#acScanBottom{
  padding: 16px 22px;
  border-top: 1px solid rgba(15,23,42,0.08);
  background: rgba(255,255,255,0.70);
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 720px){
  #acScanBottom{ padding: 14px 16px; flex-direction: column; align-items: stretch; }
}

#acScanBack{
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.85);
  color: rgba(11,18,32,0.74);
  border-radius: 14px;
  padding: 12px 14px;
  font-family: var(--ac-font);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
}

#acScanBack:hover{ transform: translateY(-1px); border-color: rgba(47,76,255,0.18); background: rgba(255,255,255,0.95); }
#acScanBack:active{ transform: translateY(0) scale(0.99); }

#acScanNext{
  border: none;
  background: linear-gradient(135deg, rgba(47,76,255,1), rgba(31,55,205,1));
  color: white;
  border-radius: 14px;
  padding: 12px 16px;
  font-family: var(--ac-font);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 18px 50px rgba(47,76,255,0.22);
  transition: transform 140ms ease, filter 140ms ease;
  display:flex;
  align-items:center;
  justify-content:center;
  gap: 10px;
}

#acScanNext:hover{ transform: translateY(-1px); filter: brightness(1.02); }
#acScanNext:active{ transform: translateY(0) scale(0.99); }

#acScanNext[disabled]{
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
  filter: none !important;
}

.ac-arrow{
  display:inline-block;
  width: 10px;
  height: 10px;
  border-right: 2px solid rgba(255,255,255,0.92);
  border-bottom: 2px solid rgba(255,255,255,0.92);
  transform: rotate(-45deg);
  margin-top: 1px;
}

.ac-fade{
  animation: acFadeIn 220ms ease both;
}
@keyframes acFadeIn{
  from{ opacity: 0; transform: translateY(6px); }
  to{ opacity: 1; transform: translateY(0); }
}
`;
    document.head.appendChild(style);
  }

  function createOverlay() {
    if (overlayEl) return;

    overlayEl = document.createElement("div");
    overlayEl.id = "acScanOverlay";

    overlayEl.innerHTML = `
      <div id="acScanWrap" role="dialog" aria-modal="true" aria-label="${BRAND.productLine}">
        <div id="acScanPanel">
          <div id="acScanTop">
            <div id="acScanBrandRow">
              <div id="acScanBrand">
                <div id="acScanKicker">${BRAND.name}</div>
                <div id="acScanTitle">${BRAND.productLine}</div>
              </div>
              <button id="acScanClose" type="button" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6L18 18" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
                  <path d="M18 6L6 18" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
                </svg>
              </button>
            </div>

            <div id="acScanProgressRow">
              <div id="acScanDots" aria-hidden="true"></div>
              <div id="acScanStepText"></div>
            </div>
          </div>

          <div id="acScanBody"></div>

          <div id="acScanBottom">
            <button id="acScanBack" type="button">Back</button>
            <button id="acScanNext" type="button">
              <span id="acScanNextLabel">Continue</span>
              <span class="ac-arrow" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);

    panelEl = document.getElementById("acScanPanel");
    contentEl = document.getElementById("acScanBody");

    // Close interactions
    document.getElementById("acScanClose").addEventListener("click", closeSurvey);
    overlayEl.addEventListener("click", (e) => {
      if (e.target === overlayEl) closeSurvey();
    });

    // Nav buttons
    document.getElementById("acScanBack").addEventListener("click", () => go(-1));
    document.getElementById("acScanNext").addEventListener("click", () => next());

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (!overlayEl.classList.contains("ac-open")) return;
      if (e.key === "Escape") closeSurvey();
    });

    render();
  }

  function openSurvey(evt) {
    if (evt && evt.preventDefault) evt.preventDefault();
    if (evt && evt.stopPropagation) evt.stopPropagation();

    if (!overlayEl) {
      injectStyles();
      createOverlay();
    }

    overlayEl.classList.add("ac-open");
    document.body.style.overflow = "hidden";

    // Focus next for accessibility
    setTimeout(() => {
      const nextBtn = document.getElementById("acScanNext");
      if (nextBtn) nextBtn.focus();
    }, 10);
  }

  function closeSurvey() {
    if (!overlayEl) return;
    overlayEl.classList.remove("ac-open");
    document.body.style.overflow = "";
  }

  function go(delta) {
    const nextIndex = state.stepIndex + delta;
    if (nextIndex < 0) return;
    if (nextIndex >= screens.length) return;

    state.stepIndex = nextIndex;
    render();
  }

  function next() {
    const screen = screens[state.stepIndex];

    // Enforce choice selection
    if (screen.type === "choice") {
      const key = screen.id;
      const selected = state.answers[key];
      if (!selected) return; // Next stays disabled anyway
    }

    // Finish action on last
    if (state.stepIndex === screens.length - 1) {
      // Optional: expose full scan state for next step wiring
      window.AutomatedClarityScanState = JSON.parse(JSON.stringify(state));
      closeSurvey();

      // OPTIONAL: if you want to redirect to an order/next page later:
      // window.location.href = "/next-step.html";
      return;
    }

    state.stepIndex += 1;
    render();
  }

  function setNextLabel(text) {
    const el = document.getElementById("acScanNextLabel");
    if (el) el.textContent = text || "Continue";
  }

  function setNextDisabled(disabled) {
    const btn = document.getElementById("acScanNext");
    if (!btn) return;
    btn.disabled = !!disabled;
  }

  function renderProgress() {
    const dotsEl = document.getElementById("acScanDots");
    const textEl = document.getElementById("acScanStepText");
    if (!dotsEl || !textEl) return;

    const total = screens.length;
    const idx = state.stepIndex + 1;

    dotsEl.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const d = document.createElement("div");
      d.className = "ac-dot" + (i <= state.stepIndex ? " ac-on" : "");
      dotsEl.appendChild(d);
    }

    textEl.textContent = `Step ${idx} of ${total}`;
  }

  function render() {
    if (!contentEl) return;

    renderProgress();

    const screen = screens[state.stepIndex];
    const backBtn = document.getElementById("acScanBack");

    if (backBtn) {
      backBtn.style.visibility = state.stepIndex === 0 ? "hidden" : "visible";
    }

    // Default Next label
    setNextLabel(screen.cta || "Continue");

    // Build content
    let html = "";
    if (screen.type === "statement") {
      html = renderStatement(screen);
      setNextDisabled(false);
    } else if (screen.type === "dynamic_statement") {
      html = renderDynamicStatement(screen);
      setNextDisabled(false);
    } else if (screen.type === "choice") {
      html = renderChoice(screen);
      const selected = state.answers[screen.id];
      setNextDisabled(!selected);
    } else {
      html = `<div class="ac-card"><div class="ac-p">Unknown screen type.</div></div>`;
      setNextDisabled(false);
    }

    contentEl.innerHTML = `<div class="ac-fade">${html}</div>`;

    // Bind choice clicks if needed
    if (screen.type === "choice") bindChoice(screen);
  }

  function renderStatement(screen) {
    const title = screen.title ? `<h2 class="ac-h1">${escapeHtml(screen.title)}</h2>` : "";
    const lines = (screen.body || [])
      .map((l) => `<p class="ac-p">${escapeHtml(l)}</p>`)
      .join("");

    const note = screen.note ? `<div class="ac-note">${escapeHtml(screen.note)}</div>` : "";
    const footer = screen.footer ? `<div class="ac-footer">${escapeHtml(screen.footer)}</div>` : "";

    return `
      <div class="ac-card">
        ${title}
        <div class="ac-lines">${lines}</div>
        ${note}
        ${footer}
      </div>
    `;
  }

  function renderDynamicStatement(screen) {
    const title = screen.getTitle ? screen.getTitle(state) : "";
    const body = screen.getBody ? screen.getBody(state) : [];

    const titleHtml = title ? `<h2 class="ac-h1">${escapeHtml(title)}</h2>` : "";
    const lines = (body || []).map((l) => `<p class="ac-p">${escapeHtml(l)}</p>`).join("");
    const footer = screen.footer ? `<div class="ac-footer">${escapeHtml(screen.footer)}</div>` : "";

    return `
      <div class="ac-card">
        ${titleHtml}
        <div class="ac-lines">${lines}</div>
        ${footer}
      </div>
    `;
  }

  function renderChoice(screen) {
    const selected = state.answers[screen.id] || "";
    const opts = (screen.options || [])
      .map((opt) => {
        const isOn = selected === opt.value;
        return `
          <button type="button"
            class="ac-opt ${isOn ? "ac-selected" : ""}"
            data-opt="${escapeAttr(opt.value)}">
            <span class="ac-radio" aria-hidden="true"></span>
            <span class="ac-opttext">${escapeHtml(opt.label)}</span>
          </button>
        `;
      })
      .join("");

    const helper = screen.helper ? `<div class="ac-qhelp">${escapeHtml(screen.helper)}</div>` : "";

    return `
      <div class="ac-card">
        <div class="ac-qwrap">
          <div>
            <div class="ac-qtitle">${escapeHtml(screen.question)}</div>
            ${helper}
          </div>
          <div class="ac-options">${opts}</div>
        </div>
      </div>
    `;
  }

  function bindChoice(screen) {
    const buttons = contentEl.querySelectorAll("[data-opt]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = btn.getAttribute("data-opt");
        state.answers[screen.id] = value;

        // Apply tags (silent system behavior)
        const chosen = (screen.options || []).find((o) => o.value === value);
        if (chosen && chosen.tags) applyTags(chosen.tags);

        // Re-render to show selection + enable Next
        render();
      });
    });
  }

  // ------------------------------------------------------------
  // PATCH CTA (GHL/Nuxt safe)
  // ------------------------------------------------------------
  function patchScanTrigger() {
    // Mark any element containing the CTA text as trigger (supports anchors/buttons)
    const targets = Array.from(document.querySelectorAll("a,button,div,span"))
      .filter((el) => {
        const t = (el.textContent || "").replace(/\s+/g, " ").trim();
        return t === "Run HVAC Opportunity Scan" || t.includes("Run HVAC Opportunity Scan");
      });

    // Prefer clickable elements
    let target = targets.find((el) => el.tagName === "A" || el.tagName === "BUTTON");
    if (!target) target = targets[0];
    if (!target) return;

    target.setAttribute("data-acx-scan", "1");

    // If it's an anchor that jumps, neutralize it
    if (target.tagName === "A") {
      const href = target.getAttribute("href");
      if (href && (href === "#" || href === "/" || href === "")) {
        target.setAttribute("href", "javascript:void(0)");
      }
    }
  }

  // ------------------------------------------------------------
  // UTIL
  // ------------------------------------------------------------
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function escapeAttr(str) {
    return String(str || "").replace(/"/g, "&quot;");
  }

  // ------------------------------------------------------------
  // BOOTSTRAP
  // ------------------------------------------------------------
  document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    createOverlay();

    // Optional global hook
    window.acxOpenSurvey = openSurvey;

    // Patch CTA a few times to survive hydration
    patchScanTrigger();
    setTimeout(patchScanTrigger, 200);
    setTimeout(patchScanTrigger, 900);

    // Global click handler for any scan trigger
    document.addEventListener("click", function (evt) {
      const trigger = evt.target.closest("[data-acx-scan]");
      if (!trigger) return;

      if (evt.preventDefault) evt.preventDefault();
      if (evt.stopPropagation) evt.stopPropagation();

      openSurvey(evt);
    });
  });
})();
