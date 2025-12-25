/* ============================================================
   Automated Clarity™ — HVAC Opportunity Scan
   GHL-SAFE / SCROLL-SAFE / FINAL
   ============================================================ */

(function () {

  /* -------------------- HARD STOP GHL SCROLL -------------------- */
  document.addEventListener(
    "click",
    function (e) {
      const trigger = e.target.closest("#ac-survey-trigger");
      if (!trigger) return;

      // KILL EVERYTHING GHL TRIES TO DO
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      openSurvey();
      return false;
    },
    true // 👈 CAPTURE PHASE — THIS IS THE KEY
  );

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

  let overlay, bodyEl, stepEl;
  let step = 0;
  const answers = {};

  /* -------------------- STYLES -------------------- */

  function injectStyles() {
    if (document.getElementById("ac-survey-styles")) return;

    const s = document.createElement("style");
    s.id = "ac-survey-styles";
    s.textContent = `
      .ac-survey-overlay {
        position: fixed;
        inset: 0;
        background: rgba(3,11,26,.88);
        backdrop-filter: blur(14px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity .2s ease;
      }
      .ac-survey-overlay.open {
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
        overflow: hidden;
        box-shadow: 0 40px 120px rgba(0,0,0,.65);
      }
      .ac-header {
        padding: 22px 26px 14px;
        border-bottom: 1px solid rgba(148,163,184,.18);
      }
      .ac-title { font-size: 20px; font-weight: 600; }
      .ac-body { padding: 26px; }
      .ac-q { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
      .ac-help { font-size: 13px; color: #94a3b8; margin-bottom: 18px; }
      .ac-opt {
        border: 1px solid rgba(148,163,184,.25);
        border-radius: 14px;
        padding: 14px 16px;
        cursor: pointer;
        margin-bottom: 12px;
      }
      .ac-opt.selected {
        border-color: #a2dfe4;
        background: rgba(162,223,228,.06);
      }
      .ac-footer {
        padding: 16px 26px;
        display: flex;
        justify-content: space-between;
        border-top: 1px solid rgba(148,163,184,.18);
      }
      .ac-btn {
        border-radius: 999px;
        padding: 8px 18px;
        cursor: pointer;
      }
      .ac-btn.primary {
        background: #a2dfe4;
        color: #020617;
      }
    `;
    document.head.appendChild(s);
  }

  /* -------------------- BUILD -------------------- */

  function build() {
    overlay = document.createElement("div");
    overlay.className = "ac-survey-overlay";

    overlay.innerHTML = `
      <div class="ac-panel">
        <div class="ac-header">
          <div class="ac-title">HVAC Opportunity Scan</div>
        </div>
        <div class="ac-body"></div>
        <div class="ac-footer">
          <div id="ac-step"></div>
          <div>
            <button class="ac-btn" id="ac-back">Back</button>
            <button class="ac-btn primary" id="ac-next">Next</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    bodyEl = overlay.querySelector(".ac-body");
    stepEl = overlay.querySelector("#ac-step");

    overlay.querySelector("#ac-back").onclick = () => move(-1);
    overlay.querySelector("#ac-next").onclick = () => move(1);
  }

  function render() {
    const q = questions[step];
    bodyEl.innerHTML = `
      <div class="ac-q">${q.title}</div>
      <div class="ac-help">${q.help}</div>
      ${q.options
        .map(
          (o, i) =>
            `<div class="ac-opt ${answers[q.id] === i ? "selected" : ""}" data-i="${i}">${o}</div>`
        )
        .join("")}
    `;

    bodyEl.querySelectorAll(".ac-opt").forEach(el => {
      el.onclick = () => {
        answers[q.id] = Number(el.dataset.i);
        render();
      };
    });

    stepEl.textContent = `Step ${step + 1} of ${questions.length}`;
  }

  function move(dir) {
    if (dir > 0 && answers[questions[step].id] == null) return;
    step += dir;
    if (step >= questions.length) closeSurvey();
    else render();
  }

  function openSurvey() {
    injectStyles();
    if (!overlay) build();
    overlay.classList.add("open");
    document.documentElement.style.overflow = "hidden";
    step = 0;
    render();
  }

  function closeSurvey() {
    overlay.classList.remove("open");
    document.documentElement.style.overflow = "";
  }

})();
