/* ============================================================
   Automated Clarity™ — HVAC Opportunity Scan
   GHL-safe overlay trigger (NO SCROLL JUMP)
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

    const s = document.createElement("style");
    s.id = "ac-survey-styles";
    s.textContent = `
      .ac-overlay {
        position: fixed;
        inset: 0;
        background: rgba(3,11,26,0.88);
        backdrop-filter: blur(14px);
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
        background: #0b1220;
        color: #e5e7eb;
        width: 100%;
        max-width: 760px;
        margin: 16px;
        border-radius: 22px;
        box-shadow: 0 40px 120px rgba(0,0,0,.6);
        overflow: hidden;
      }
      .ac-head { padding: 22px 26px; border-bottom: 1px solid rgba(148,163,184,.18); }
      .ac-title { font-size: 20px; font-weight: 600; }
      .ac-body { padding: 26px; }
      .ac-q { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
      .ac-help { font-size: 13px; color: #94a3b8; margin-bottom: 18px; }
      .ac-options { display: grid; gap: 12px; }
      .ac-opt {
        border: 1px solid rgba(148,163,184,.25);
        border-radius: 14px;
        padding: 14px 16px;
        cursor: pointer;
      }
      .ac-opt.sel {
        border-color: #a2dfe4;
        background: rgba(162,223,228,.06);
      }
      .ac-foot {
        padding: 16px 26px;
        border-top: 1px solid rgba(148,163,184,.18);
        display: flex;
        justify-content: space-between;
      }
      .ac-btn {
        border-radius: 999px;
        padding: 8px 18px;
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

  /* -------------------- BUILD -------------------- */

  function build() {
    overlay = document.createElement("div");
    overlay.className = "ac-overlay";
    overlay.innerHTML = `
      <div class="ac-panel">
        <div class="ac-head"><div class="ac-title">HVAC Opportunity Scan</div></div>
        <div class="ac-body"></div>
        <div class="ac-foot">
          <div class="ac-steps"></div>
          <div>
            <button class="ac-btn" id="ac-back">Back</button>
            <button class="ac-btn primary" id="ac-next">Next</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    bodyEl = overlay.querySelector(".ac-body");
    stepLabel = overlay.querySelector(".ac-steps");

    overlay.querySelector("#ac-back").onclick = () => step(-1);
    overlay.querySelector("#ac-next").onclick = () => step(1);
  }

  function render() {
    const q = questions[currentStep];
    bodyEl.innerHTML = `
      <div class="ac-q">${q.title}</div>
      <div class="ac-help">${q.help}</div>
      <div class="ac-options">
        ${q.options.map((o,i)=>`
          <div class="ac-opt ${answers[q.id]===i?'sel':''}" data-i="${i}">${o}</div>
        `).join("")}
      </div>
    `;
    bodyEl.querySelectorAll(".ac-opt").forEach(el=>{
      el.onclick=()=>{answers[q.id]=+el.dataset.i;render();}
    });
    stepLabel.textContent = `Step ${currentStep+1} of ${questions.length}`;
  }

  function step(d) {
    if (d>0 && answers[questions[currentStep].id]==null) return;
    currentStep+=d;
    if (currentStep>=questions.length) close();
    else if (currentStep<0) currentStep=0;
    render();
  }

  function open() {
    injectStyles();
    if (!overlay) build();
    overlay.classList.add("open");
    document.documentElement.style.overflow="hidden";
    currentStep=0;
    render();
  }

  function close() {
    overlay.classList.remove("open");
    document.documentElement.style.overflow="";
  }

  /* -------------------- GHL-SAFE TRIGGER -------------------- */

  window.__AC_OPEN = false;

  document.addEventListener("click", e=>{
    if (e.target.closest("#ac-survey-trigger")) {
      window.__AC_OPEN = true;
    }
  });

  setInterval(()=>{
    if (window.__AC_OPEN) {
      window.__AC_OPEN=false;
      open();
    }
  },50);

})();
