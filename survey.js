/* ============================================================
   Automated Clarity™ — HVAC Opportunity Scan
   FULL STANDALONE OVERLAY (GHL-SAFE)
   ============================================================ */

(function () {

  /* ---------------- QUESTIONS (LOCKED) ---------------- */

  const questions = [
    {
      id: "lead-entry",
      title: "When a new lead comes in from your website or ads, what usually happens?",
      help: "Think forms, Google Ads, LSAs — not phone calls.",
      options: [
        "Someone reaches out almost immediately, every time.",
        "It depends on how busy the office is that day.",
        "Some leads get delayed or missed altogether."
      ]
    },
    {
      id: "quote-followup",
      title: "How are install or replacement quotes followed up after they’re sent?",
      help: "Focus on larger jobs — not quick service calls.",
      options: [
        "Every quote follows a defined follow-up process.",
        "Follow-up depends on staff remembering or having time.",
        "Once sent, most quotes aren’t actively followed up."
      ]
    },
    {
      id: "response-speed",
      title: "On busy days, how consistent is your response speed to new inquiries?",
      help: "When calls stack, jobs run long, or emergencies hit.",
      options: [
        "Response speed stays consistent no matter the day.",
        "Response time slips when things get hectic.",
        "There’s no real consistency once the day gets busy."
      ]
    },
    {
      id: "past-customers",
      title: "How do past customers get re-engaged for maintenance or repeat work?",
      help: "Tune-ups, reminders, seasonal outreach.",
      options: [
        "We have a regular, reliable outreach process.",
        "We reach out occasionally, but it’s not consistent.",
        "We mostly wait until customers contact us again."
      ]
    },
    {
      id: "reviews",
      title: "What happens after a successful job when it comes to reviews?",
      help: "Google reviews reflect what follow-up is doing behind the scenes.",
      options: [
        "Reviews are requested the same way every time.",
        "Reviews depend on someone remembering to ask.",
        "There’s no structured review process."
      ]
    },
    {
      id: "headspace",
      title: "Which of these feels closest to where you are right now?",
      help: "This won’t change your results — it only frames what you see next.",
      options: [
        "We’re busy — days are always full.",
        "I’m not sure where to start fixing things.",
        "We’ve tried systems before and they didn’t stick.",
        "The tech side feels overwhelming.",
        "I’ve been burned by marketers before."
      ]
    }
  ];

  let currentStep = 0;
  const answers = {};
  let overlay, bodyEl, stepEl;

  /* ---------------- STYLES ---------------- */

  function injectStyles() {
    if (document.getElementById("ac-survey-styles")) return;

    const s = document.createElement("style");
    s.id = "ac-survey-styles";
    s.textContent = `
      .ac-overlay {
        position: fixed;
        inset: 0;
        background: rgba(3,11,26,0.88);
        backdrop-filter: blur(16px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity .2s ease;
      }
      .ac-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .ac-panel {
        max-width: 760px;
        width: 100%;
        margin: 16px;
        background: #0b1220;
        color: #e5e7eb;
        border-radius: 22px;
        box-shadow: 0 50px 140px rgba(0,0,0,.7);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .ac-header {
        padding: 22px 26px 14px;
        border-bottom: 1px solid rgba(148,163,184,.18);
      }
      .ac-eyebrow {
        font-size: 11px;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: #94a3b8;
        margin-bottom: 6px;
      }
      .ac-title {
        font-size: 20px;
        font-weight: 600;
      }
      .ac-body {
        padding: 26px;
      }
      .ac-q-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      .ac-q-help {
        font-size: 13px;
        color: #94a3b8;
        margin-bottom: 18px;
      }
      .ac-options {
        display: grid;
        gap: 12px;
      }
      .ac-option {
        border: 1px solid rgba(148,163,184,.28);
        border-radius: 14px;
        padding: 14px 16px;
        cursor: pointer;
        transition: all .15s ease;
      }
      .ac-option:hover {
        border-color: #a2dfe4;
        box-shadow: 0 0 0 1px rgba(162,223,228,.25);
      }
      .ac-option.selected {
        background: rgba(162,223,228,.06);
        border-color: #a2dfe4;
      }
      .ac-footer {
        padding: 16px 26px;
        border-top: 1px solid rgba(148,163,184,.18);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .ac-steps {
        font-size: 12px;
        color: #94a3b8;
      }
      .ac-actions {
        display: flex;
        gap: 10px;
      }
      .ac-btn {
        padding: 8px 18px;
        border-radius: 999px;
        border: 1px solid rgba(148,163,184,.35);
        background: transparent;
        color: #e5e7eb;
        cursor: pointer;
      }
      .ac-btn.primary {
        background: #a2dfe4;
        color: #020617;
        border-color: #a2dfe4;
      }
    `;
    document.head.appendChild(s);
  }

  /* ---------------- BUILD ---------------- */

  function build() {
    overlay = document.createElement("div");
    overlay.className = "ac-overlay";

    overlay.innerHTML = `
      <div class="ac-panel">
        <div class="ac-header">
          <div class="ac-eyebrow">Automated Clarity™</div>
          <div class="ac-title">HVAC Opportunity Scan</div>
        </div>
        <div class="ac-body"></div>
        <div class="ac-footer">
          <div class="ac-steps"></div>
          <div class="ac-actions">
            <div class="ac-btn" id="ac-back">Back</div>
            <div class="ac-btn primary" id="ac-next">Next</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    bodyEl = overlay.querySelector(".ac-body");
    stepEl = overlay.querySelector(".ac-steps");

    overlay.querySelector("#ac-back").onpointerdown = () => step(-1);
    overlay.querySelector("#ac-next").onpointerdown = () => step(1);
  }

  /* ---------------- RENDER ---------------- */

  function render() {
    const q = questions[currentStep];

    bodyEl.innerHTML = `
      <div class="ac-q-title">${q.title}</div>
      <div class="ac-q-help">${q.help}</div>
      <div class="ac-options">
        ${q.options.map((o,i)=>`
          <div class="ac-option ${answers[q.id]===i?'selected':''}" data-i="${i}">
            ${o}
          </div>
        `).join("")}
      </div>
    `;

    bodyEl.querySelectorAll(".ac-option").forEach(el=>{
      el.onpointerdown = ()=>{
        answers[q.id] = Number(el.dataset.i);
        render();
      };
    });

    stepEl.textContent = `Step ${currentStep+1} of ${questions.length}`;
  }

  function step(dir) {
    if (dir>0 && answers[questions[currentStep].id]==null) return;
    currentStep += dir;
    if (currentStep < 0) currentStep = 0;
    if (currentStep >= questions.length) {
      close();
      return;
    }
    render();
  }

  function open() {
    injectStyles();
    if (!overlay) build();
    overlay.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    currentStep = 0;
    render();
  }

  function close() {
    overlay.classList.remove("open");
    document.documentElement.style.overflow = "";
  }

  /* ---------------- TRIGGER (GHL SAFE) ---------------- */

  document.addEventListener("DOMContentLoaded", () => {
    const t = document.getElementById("ac-survey-trigger");
    if (!t) return;

    t.addEventListener("pointerdown", (e)=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      setTimeout(open, 0);
    }, true);
  });

})();
