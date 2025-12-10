// survey.js
// ACX HVAC Opportunity Scan – overlay survey

(function () {
  // --- CONFIG -------------------------------------------------------------

  const categories = {
    missed: { label: "Missed calls & voicemail" },
    quotes: { label: "Quote follow-up" },
    web: { label: "Web forms & lead sources" },
    dormant: { label: "Past customers & maintenance" },
    reviews: { label: "Reviews & reputation" },
  };

  const questions = [
    {
      id: "missed",
      title: "When a call is missed during business hours, what usually happens?",
      help: "No judgment — HVAC days are chaotic by design.",
      options: [
        {
          label: "Someone calls back within 5–10 minutes almost every time.",
          impacts: { missed: 0 },
        },
        {
          label: "We aim to return calls the same day, but it’s hit or miss.",
          impacts: { missed: 1 },
        },
        {
          label: "We mostly rely on voicemail and hope they call back.",
          impacts: { missed: 2 },
        },
      ],
    },
    {
      id: "quotes",
      title: "How are install / replacement quotes followed up?",
      help: "Think about big-ticket jobs — not quick service calls.",
      options: [
        {
          label:
            "Every quote goes into a set follow-up sequence (texts or emails).",
          impacts: { quotes: 0 },
        },
        {
          label:
            "CSRs or salespeople follow up manually when they remember or have time.",
          impacts: { quotes: 1 },
        },
        {
          label:
            "Once the quote is sent, we rarely follow up unless they contact us.",
          impacts: { quotes: 2 },
        },
      ],
    },
    {
      id: "web",
      title:
        "What happens to form submissions from your website and lead sources?",
      help: "Web forms, Google LSA, aggregators — anywhere a lead can appear.",
      options: [
        {
          label:
            "Everything drops into one place and someone reaches out quickly every time.",
          impacts: { web: 0 },
        },
        {
          label:
            "Submissions land in inboxes/spreadsheets that someone checks daily.",
          impacts: { web: 1 },
        },
        {
          label:
            "Different forms go to different inboxes and some definitely get missed.",
          impacts: { web: 2 },
        },
      ],
    },
    {
      id: "dormant",
      title:
        "How do you stay in front of past customers for maintenance and tune-ups?",
      help: "This is the long-tail revenue most shops never see clearly.",
      options: [
        {
          label:
            "We have regular reminders or campaigns to our customer list.",
          impacts: { dormant: 0 },
        },
        {
          label:
            "We reach out occasionally, but it isn’t consistent or automated.",
          impacts: { dormant: 1 },
        },
        {
          label:
            "We mostly wait for customers to get in touch when they need something.",
          impacts: { dormant: 2 },
        },
      ],
    },
    {
      id: "reviews",
      title: "What does your review and reputation process look like today?",
      help: "Google reviews are a lagging indicator of what the follow-up is doing.",
      options: [
        {
          label:
            "Reviews are requested automatically after jobs — same process every time.",
          impacts: { reviews: 0 },
        },
        {
          label:
            "Techs or office staff ask for reviews manually when they remember.",
          impacts: { reviews: 1 },
        },
        {
          label:
            "We don’t really have a structured review process right now.",
          impacts: { reviews: 2 },
        },
      ],
    },
  ];

  // --- STYLE --------------------------------------------------------------

  function injectStyles() {
    if (document.getElementById("acx-survey-styles")) return;
    const style = document.createElement("style");
    style.id = "acx-survey-styles";
    style.textContent = `
      .acx-survey-overlay {
        position: fixed;
        inset: 0;
        background: rgba(3, 11, 26, 0.78);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 220ms ease-out;
      }
      .acx-survey-overlay.acx-open {
        opacity: 1;
        pointer-events: auto;
      }
      .acx-survey-dialog {
        background: #ffffff;
        color: #0b1220;
        max-width: 720px;
        width: 100%;
        margin: 16px;
        border-radius: 24px;
        box-shadow:
          0 24px 60px rgba(15, 23, 42, 0.55),
          0 0 0 1px rgba(148, 163, 184, 0.35);
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        overflow: hidden;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
      }
      .acx-survey-header {
        padding: 18px 24px 10px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.35);
      }
      .acx-survey-title {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.01em;
        margin: 0 0 4px;
      }
      .acx-survey-subtitle {
        font-size: 13px;
        color: #64748b;
      }
      .acx-survey-body {
        padding: 20px 24px 16px;
        overflow-y: auto;
      }
      .acx-survey-q-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 6px;
        letter-spacing: -0.01em;
      }
      .acx-survey-q-help {
        font-size: 13px;
        color: #6b7280;
        margin-bottom: 14px;
      }
      .acx-survey-options {
        display: grid;
        gap: 10px;
      }
      .acx-survey-option {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.65);
        padding: 10px 12px;
        font-size: 14px;
        line-height: 1.4;
        cursor: pointer;
        transition: border-color 150ms ease-out, box-shadow 150ms ease-out, background 150ms ease-out;
        background: #ffffff;
      }
      .acx-survey-option:hover {
        border-color: #2563eb;
        box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35);
      }
      .acx-survey-option.acx-selected {
        border-color: #2563eb;
        background: rgba(37, 99, 235, 0.04);
        box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.35);
      }
      .acx-survey-footer {
        padding: 12px 24px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(148, 163, 184, 0.35);
        background: #f9fafb;
      }
      .acx-survey-steps {
        font-size: 13px;
        color: #6b7280;
      }
      .acx-survey-actions {
        display: flex;
        gap: 8px;
      }
      .acx-btn {
        border-radius: 999px;
        padding: 8px 18px;
        font-size: 14px;
        font-weight: 500;
        border: 1px solid transparent;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        transition: background 150ms ease-out, color 150ms ease-out, border-color 150ms ease-out;
      }
      .acx-btn-primary {
        background: #0f172a;
        color: #f9fafb;
        border-color: #0f172a;
      }
      .acx-btn-primary:hover {
        background: #020617;
        border-color: #020617;
      }
      .acx-btn-ghost {
        background: transparent;
        color: #374151;
        border-color: rgba(148, 163, 184, 0.6);
      }
      .acx-btn-ghost:hover {
        background: rgba(148, 163, 184, 0.08);
      }
      .acx-survey-close {
        position: absolute;
        top: 10px;
        right: 14px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        color: #9ca3af;
        transition: color 120ms ease-out;
      }
      .acx-survey-close:hover {
        color: #4b5563;
      }
      .acx-survey-header-inner {
        position: relative;
      }
      .acx-results-grid {
        display: grid;
        gap: 12px;
        margin-top: 10px;
      }
      .acx-result-card {
        border-radius: 16px;
        padding: 10px 12px;
        border: 1px solid rgba(148, 163, 184, 0.7);
        background: #ffffff;
      }
      .acx-result-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
      .acx-result-name {
        font-size: 14px;
        font-weight: 500;
      }
      .acx-pill {
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .acx-pill-good {
        background: rgba(16, 185, 129, 0.12);
        color: #047857;
      }
      .acx-pill-warn {
        background: rgba(245, 158, 11, 0.12);
        color: #b45309;
      }
      .acx-pill-bad {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
      }
      .acx-result-text {
        font-size: 13px;
        color: #4b5563;
      }
      .acx-results-intro {
        font-size: 14px;
        color: #111827;
        margin-bottom: 6px;
      }
      .acx-results-note {
        font-size: 12px;
        color: #6b7280;
        margin-top: 8px;
      }

      @media (max-width: 640px) {
        .acx-survey-dialog {
          margin: 8px;
          border-radius: 20px;
        }
        .acx-survey-header,
        .acx-survey-body,
        .acx-survey-footer {
          padding-left: 16px;
          padding-right: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // --- DOM CREATION -------------------------------------------------------

  let overlayEl, bodyEl, stepsLabelEl, nextBtn, backBtn;

  function createOverlay() {
    overlayEl = document.createElement("div");
    overlayEl.className = "acx-survey-overlay";
    overlayEl.setAttribute("role", "dialog");
    overlayEl.setAttribute("aria-modal", "true");

    const dialog = document.createElement("div");
    dialog.className = "acx-survey-dialog";

    const header = document.createElement("div");
    header.className = "acx-survey-header";

    const headerInner = document.createElement("div");
    headerInner.className = "acx-survey-header-inner";

    const title = document.createElement("h2");
    title.className = "acx-survey-title";
    title.textContent = "HVAC Opportunity Scan";

    const subtitle = document.createElement("p");
    subtitle.className = "acx-survey-subtitle";
    subtitle.textContent =
      "A short, no-pressure diagnostic that maps where ACX would quietly protect and recover revenue inside your shop.";

    const closeBtn = document.createElement("button");
    closeBtn.className = "acx-survey-close";
    closeBtn.setAttribute("aria-label", "Close scan");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", closeSurvey);

    headerInner.appendChild(title);
    headerInner.appendChild(subtitle);
    headerInner.appendChild(closeBtn);
    header.appendChild(headerInner);

    bodyEl = document.createElement("div");
    bodyEl.className = "acx-survey-body";

    const footer = document.createElement("div");
    footer.className = "acx-survey-footer";

    stepsLabelEl = document.createElement("div");
    stepsLabelEl.className = "acx-survey-steps";

    const actions = document.createElement("div");
    actions.className = "acx-survey-actions";

    backBtn = document.createElement("button");
    backBtn.type = "button";
    backBtn.className = "acx-btn acx-btn-ghost";
    backBtn.textContent = "Back";
    backBtn.addEventListener("click", () => goStep(-1));

    nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "acx-btn acx-btn-primary";
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", () => goStep(1));

    actions.appendChild(backBtn);
    actions.appendChild(nextBtn);

    footer.appendChild(stepsLabelEl);
    footer.appendChild(actions);

    dialog.appendChild(header);
    dialog.appendChild(bodyEl);
    dialog.appendChild(footer);

    overlayEl.appendChild(dialog);
    document.body.appendChild(overlayEl);
  }

  // --- STATE & RENDERING --------------------------------------------------

  let currentIndex = 0;
  const answers = {};
  const scores = {
    missed: 0,
    quotes: 0,
    web: 0,
    dormant: 0,
    reviews: 0,
  };

  function openSurvey(evt) {
    if (evt && evt.preventDefault) evt.preventDefault();
    if (!overlayEl) {
      injectStyles();
      createOverlay();
    }
    overlayEl.classList.add("acx-open");
    document.documentElement.style.overflow = "hidden";
    currentIndex = 0;
    renderStep();
  }

  function closeSurvey() {
    if (!overlayEl) return;
    overlayEl.classList.remove("acx-open");
    document.documentElement.style.overflow = "";
  }

  function goStep(delta) {
    if (currentIndex === questions.length && delta > 0) {
      closeSurvey();
      return;
    }

    const q = questions[currentIndex];
    if (delta > 0 && q && !answers[q.id]) {
      // require an answer before moving forward
      bodyEl.querySelectorAll(".acx-survey-option").forEach((opt) => {
        opt.classList.add("acx-needs-choice");
        setTimeout(() => opt.classList.remove("acx-needs-choice"), 300);
      });
      return;
    }

    currentIndex += delta;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > questions.length) currentIndex = questions.length;
    renderStep();
  }

  function selectOption(questionId, optionIndex) {
    answers[questionId] = optionIndex;
    renderStep(); // re-render to highlight selection
  }

  function computeScores() {
    for (const key in scores) scores[key] = 0;

    questions.forEach((q) => {
      const idx = answers[q.id];
      if (idx == null) return;
      const opt = q.options[idx];
      if (!opt || !opt.impacts) return;
      Object.entries(opt.impacts).forEach(([cat, val]) => {
        scores[cat] += val;
      });
    });

    return scores;
  }

  function severityForScore(v) {
    if (v <= 0) return { label: "Protected", className: "acx-pill-good" };
    if (v === 1) return { label: "Exposed", className: "acx-pill-warn" };
    return { label: "Leak detected", className: "acx-pill-bad" };
  }

  function messageFor(catKey, val) {
    if (val <= 0) {
      return "This lane is mostly covered. ACX would watch it in the background and keep it consistent on your busiest days.";
    }
    if (val === 1) {
      return "There’s a gap here when days get hectic. ACX would tighten this lane so enquiries are handled the same way every time.";
    }
    switch (catKey) {
      case "missed":
        return "Missed calls are likely turning into missed jobs. ACX would capture intent, respond automatically, and keep the conversation alive for your team.";
      case "quotes":
        return "Quotes are going quiet after send. ACX would follow up automatically, recover quiet quotes, and show you how much is sitting in limbo.";
      case "web":
        return "Forms and lead sources are fragmenting across inboxes. ACX would unify them and make sure every enquiry gets a response.";
      case "dormant":
        return "Past customers aren’t being re-engaged consistently. ACX would run quiet, automated touchpoints that bring work back without adding to your team’s workload.";
      case "reviews":
        return "You’re leaving reviews and local proof on the table. ACX would standardize the review ask so every good job has a chance to show up online.";
      default:
        return "ACX would quietly monitor and protect this lane so fewer opportunities slip through unseen.";
    }
  }

  function renderStep() {
    bodyEl.innerHTML = "";

    if (currentIndex < questions.length) {
      const q = questions[currentIndex];

      const title = document.createElement("div");
      title.className = "acx-survey-q-title";
      title.textContent = q.title;

      const help = document.createElement("div");
      help.className = "acx-survey-q-help";
      help.textContent = q.help || "";

      const optionsWrap = document.createElement("div");
      optionsWrap.className = "acx-survey-options";

      q.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "acx-survey-option";
        if (answers[q.id] === idx) {
          btn.classList.add("acx-selected");
        }
        btn.textContent = opt.label;
        btn.addEventListener("click", () => selectOption(q.id, idx));
        optionsWrap.appendChild(btn);
      });

      bodyEl.appendChild(title);
      bodyEl.appendChild(help);
      bodyEl.appendChild(optionsWrap);

      stepsLabelEl.textContent = `Step ${currentIndex + 1} of ${questions.length}`;
      backBtn.disabled = currentIndex === 0;
      nextBtn.textContent =
        currentIndex === questions.length - 1
          ? "See my clarity snapshot"
          : "Next";
    } else {
      computeScores();

      const heading = document.createElement("div");
      heading.className = "acx-survey-q-title";
      heading.textContent = "Here’s what ACX would watch inside your shop.";

      const intro = document.createElement("p");
      intro.className = "acx-results-intro";
      intro.textContent =
        "Based on your answers, these are the lanes where revenue is most at risk — and where a 24/7 Revenue Control Layer™ would quietly protect it for you.";

      const grid = document.createElement("div");
      grid.className = "acx-results-grid";

      Object.entries(categories).forEach(([key, meta]) => {
        const value = scores[key];
        const severity = severityForScore(value);

        const card = document.createElement("div");
        card.className = "acx-result-card";

        const row = document.createElement("div");
        row.className = "acx-result-label-row";

        const name = document.createElement("div");
        name.className = "acx-result-name";
        name.textContent = meta.label;

        const pill = document.createElement("span");
        pill.className = `acx-pill ${severity.className}`;
        pill.textContent = severity.label;

        row.appendChild(name);
        row.appendChild(pill);

        const text = document.createElement("div");
        text.className = "acx-result-text";
        text.textContent = messageFor(key, value);

        card.appendChild(row);
        card.appendChild(text);
        grid.appendChild(card);
      });

      const note = document.createElement("p");
      note.className = "acx-results-note";
      note.textContent =
        "This snapshot is private to you. No one from our side sees your answers until you choose to share them. ACX is built to remove pressure — not add more.";

      bodyEl.appendChild(heading);
      bodyEl.appendChild(intro);
      bodyEl.appendChild(grid);
      bodyEl.appendChild(note);

      stepsLabelEl.textContent = "Snapshot ready";
      backBtn.disabled = false;
      nextBtn.textContent = "Close";
    }
  }

  // --- INIT ---------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    createOverlay();
  });

  // expose globally so HTML can call it directly
  window.acxOpenSurvey = openSurvey;
})();
