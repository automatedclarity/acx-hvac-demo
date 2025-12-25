/* ============================================================
   Automated Clarity™ — HVAC Opportunity Scan
   Overlay-only survey (NO snapshot yet)
   Netlify + GHL safe
   ============================================================ */

(function () {

  /* -------------------- QUESTIONS (LOCKED) -------------------- */

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
      help: "This won’t change your results — it just helps frame what you see next.",
      options: [
        "We’re busy — days are always full.",
        "I’m not sure where to start fixing things.",
        "We’ve tried systems before and they didn’t stick.",
        "The tech side feels overwhelming.",
        "I’ve been burned by marketers before."
      ]
    }
  ];

  /* -------------------- STATE -------------------- */

  let currentStep = 0;
  const answers = {};
  let overlay, bodyEl, stepLabel;

  /* -------------------- STYLES -------------------- */

  function injectStyles() {
    if (document.getElementById("ac-survey-styles")) return;

    const style = document.createElement("style");
    style.id = "ac-survey-styles";
    style.textContent = `
      .ac-survey-overlay {
        position: fixed;
        inset: 0;
        background: rgba(3,11,26,0.88);
        backdrop-filter: blur(14px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 200ms ease;
      }
      .ac-survey-overlay.open {
        opacity: 1;
        pointer-events: auto;
      }
      .ac-survey-panel {
        width: 100%;
        max-width: 760px;
        margin: 16px;
        background: #0b1220;
        color: #e5e7eb;
        border-radius: 22px;
        box-shadow: 0 40px 120px rgba(0,0,0,0.65);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .ac-survey-header {
        padding: 22px 26px 14px;
        border-bottom: 1px solid rgba(148,163,184,0.18);
      }
      .ac-eyebrow {
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #94a3b8;
        margin-bottom: 6px;
      }
      .ac-title {
        font-size: 20px;
        font-weight: 600;
      }
      .ac-survey-body {
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
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(148,163,184,0.25);
        border-radius: 14px;
        padding: 14px 16px;
        cursor: pointer;
        transition: all 160ms ease;
        font-size: 14px;
      }
      .ac-option:hover {
        border-color: #a2dfe4;
        box-shadow: 0 0 0 1px rgba(162,223,228,0.25);
      }
      .ac-option.selected {
        border-color: #a2dfe4;
        background: rgba(162,223,228,0.06);
      }
      .ac-survey-footer {
        padding: 16px 26px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(148,163,184,0.18);
      }
      .ac-steps {
        font-size: 12px;
        color: #94a3b8;
      }
      .ac-btn {
        border-radius: 999px;
        padding: 8px 18px;
        font-size: 14px;
        border: 1px solid rgba(148,163,184,0.35);
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
    document.head.appendChild(style);
  }

  /* -------------------- BUILD OVERLAY -------------------- */

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "ac-survey-overlay";

    overlay.innerHTML = `
      <div class="ac-survey-panel">
        <div class="ac-survey-header">
          <div class="ac-eyebrow">Automated Clarity™</div>
          <div class="ac-title">HVAC Opportunity Scan</div>
        </div>
        <div class="ac-survey-body"></div>
        <div class="ac-survey-footer">
          <div class="ac-steps"></div>
          <div>
            <button class="ac-btn" data-back>Back</button>
            <button class="ac-btn primary" data-next>Next</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    bodyEl = overlay.querySelector(".ac-survey-body");
    stepLabel = overlay.querySelector(".ac-steps");

    overlay.querySelector("[data-back]").onclick = () => step(-1);
    overlay.querySelector("[data-next]").onclick = () => step(1);
  }

  /* -------------------- RENDER -------------------- */

  function render() {
    const q = questions[currentStep];

    bodyEl.innerHTML = `
      <div class="ac-q-title">${q.title}</div>
      <div class="ac-q-help">${q.help}</div>
      <div class="ac-options">
        ${q.options.map((opt, i) => `
          <div class="ac-option ${answers[q.id] === i ? "selected" : ""}" data-i="${i}">
            ${opt}
          </div>
        `).join("")}
      </div>
    `;

    bodyEl.querySelectorAll(".ac-option").forEach(el => {
      el.onclick = () => {
        answers[q.id] = parseInt(el.dataset.i, 10);
        render();
      };
    });

    stepLabel.textContent = `Step ${currentStep + 1} of ${questions.length}`;
  }

  function step(dir) {
    if (dir > 0 && answers[questions[currentStep].id] == null) return;

    currentStep += dir;
    if (currentStep < 0) currentStep = 0;
    if (currentStep >= questions.length) {
      close();
      return;
    }
    render();
  }

  /* -------------------- OPEN / CLOSE -------------------- */

  function open() {
    injectStyles();
    if (!overlay) buildOverlay();
    overlay.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    currentStep = 0;
    render();
  }

  function close() {
    overlay.classList.remove("open");
    document.documentElement.style.overflow = "";
  }

  /* -------------------- TRIGGER (NO SCROLL JUMP) -------------------- */

  document.addEventListener("DOMContentLoaded", () => {
    const trigger = document.getElementById("ac-survey-trigger");
    if (trigger) {
      trigger.addEventListener("click", () => {
        open();
      });
    }
  });

})();
