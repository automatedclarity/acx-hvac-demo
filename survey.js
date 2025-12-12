// survey.js
// Automated Clarity™ – HVAC Opportunity Scan + Path B–F headspace

(function () {
  // --- HVAC LANE CONFIG ---------------------------------------------------

  const categories = {
    missed: { label: "Missed calls & voicemail" },
    quotes: { label: "Quote follow-up" },
    web: { label: "Web forms & lead sources" },
    dormant: { label: "Past customers & maintenance" },
    reviews: { label: "Reviews & reputation" },
  };

  const hvacQuestions = [
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

  // --- PATH B–F HEADSPACE OPTIONS ----------------------------------------

  const headspaceOptions = [
    {
      key: "b",
      label: "I’m already too busy — I can’t take on more complexity.",
      helper:
        "Your days are full. You’re not looking for another project — you want something that quietly handles the work.",
    },
    {
      key: "c",
      label: "I’m not even sure where to start with fixing this.",
      helper:
        "You know there are leaks, but the first step hasn’t been clear. You want a simple, guided starting point.",
    },
    {
      key: "d",
      label: "I’ve tried to fix this before — it never really stuck.",
      helper:
        "You’ve done CRMs, campaigns, maybe even agencies. Pieces worked, but nothing held together long-term.",
    },
    {
      key: "e",
      label: "The tech and tools side of this feels overwhelming.",
      helper:
        "You’re not trying to become a software company. You want this handled without a pile of dashboards.",
    },
    {
      key: "f",
      label: "I’m wary — I don’t fully trust systems and promises like this.",
      helper:
        "You’ve seen big claims before. You’d rather see proof quietly working than hear a pitch.",
    },
  ];

  // --- STYLE INJECTION ----------------------------------------------------

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
        text-align: left;
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
      .acx-survey-option-label {
        font-size: 14px;
        margin-bottom: 2px;
      }
      .acx-survey-option-helper {
        font-size: 12px;
        color: #6b7280;
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
      .acx-error-text {
        font-size: 12px;
        color: #b91c1c;
        margin-top: 6px;
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

  // --- STATE --------------------------------------------------------------

  let overlayEl, bodyEl, stepsLabelEl, nextBtn, backBtn, subtitleEl, errorEl;

  const scores = {
    missed: 0,
    quotes: 0,
    web: 0,
    dormant: 0,
    reviews: 0,
  };

  let mode = "questions"; // "questions" | "headspace" | "results"
  let currentQuestionIndex = 0;
  const answers = {};
  let selectedPathKey = null;
  let submitStarted = false;
  let submitError = "";

  // --- HELPERS ------------------------------------------------------------

  function resetState() {
    mode = "questions";
    currentQuestionIndex = 0;
    for (const k in scores) scores[k] = 0;
    for (const k in answers) delete answers[k];
    selectedPathKey = null;
    submitStarted = false;
    submitError = "";
  }

  function severityForScore(v) {
    if (v <= 0) return { label: "Protected", className: "acx-pill-good" };
    if (v === 1) return { label: "Exposed", className: "acx-pill-warn" };
    return { label: "Leak detected", className: "acx-pill-bad" };
  }

  function messageFor(catKey, val) {
    if (val <= 0) {
      return "This lane is mostly covered. Automated Clarity™ quietly watches it in the background and keeps it consistent on your busiest days.";
    }
    if (val === 1) {
      return "There’s a gap here when days get hectic. Automated Clarity™ tightens this lane so enquiries are handled the same way every time.";
    }
    switch (catKey) {
      case "missed":
        return "Missed calls are likely turning into missed jobs. Automated Clarity™ captures intent, responds instantly, and keeps conversations alive for your team.";
      case "quotes":
        return "Quotes are going quiet after send. Automated Clarity™ follows up for you, revives quiet quotes, and brings decisions forward.";
      case "web":
        return "Forms and lead sources are fragmenting across inboxes. Automated Clarity™ unifies submissions into one stream and ensures responses happen fast.";
      case "dormant":
        return "Past customers aren’t being re-engaged consistently. Automated Clarity™ automates maintenance touchpoints and brings repeat work back without adding to your team’s workload.";
      case "reviews":
        return "You’re leaving reviews and local proof on the table. Automated Clarity™ standardizes review requests so every 5-star job has a chance to show up online.";
      default:
        return "Automated Clarity™ quietly monitors and protects this lane so fewer opportunities slip through unseen.";
    }
  }

  function computeScores() {
    for (const key in scores) scores[key] = 0;

    hvacQuestions.forEach((q) => {
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

  function hvacSummaryString() {
    const parts = [];
    Object.entries(categories).forEach(([key, meta]) => {
      const sev = severityForScore(scores[key]);
      parts.push(`${meta.label}: ${sev.label}`);
    });
    return parts.join(" • ");
  }

  // --- DOM CREATION -------------------------------------------------------

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
    title.textContent = "Automated Clarity™ — HVAC Opportunity Scan";

    subtitleEl = document.createElement("p");
    subtitleEl.className = "acx-survey-subtitle";
    subtitleEl.textContent =
      "A short diagnostic that reveals where Automated Clarity™ quietly protects revenue, recovers missed work, and keeps follow-up consistent — automatically.";

    const closeBtn = document.createElement("button");
    closeBtn.className = "acx-survey-close";
    closeBtn.setAttribute("aria-label", "Close scan");
    closeBtn.innerHTML = "&times;";
    closeBtn.addEventListener("click", closeSurvey);

    headerInner.appendChild(title);
    headerInner.appendChild(subtitleEl);
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

    errorEl = document.createElement("div");
    errorEl.className = "acx-error-text";
    errorEl.style.display = "none";
    footer.appendChild(errorEl);

    dialog.appendChild(header);
    dialog.appendChild(bodyEl);
    dialog.appendChild(footer);

    overlayEl.appendChild(dialog);
    document.body.appendChild(overlayEl);
  }

  // --- FLOW CONTROL -------------------------------------------------------

  function openSurvey(evt) {
    if (evt && evt.preventDefault) evt.preventDefault();
    injectStyles();
    if (!overlayEl) {
      createOverlay();
    }
    resetState();
    overlayEl.classList.add("acx-open");
    document.documentElement.style.overflow = "hidden";
    render();
  }

  function closeSurvey() {
    if (!overlayEl) return;
    overlayEl.classList.remove("acx-open");
    document.documentElement.style.overflow = "";
  }

  function goStep(delta) {
    errorEl.style.display = "none";
    submitError = "";

    if (mode === "questions") {
      const q = hvacQuestions[currentQuestionIndex];
      if (delta > 0 && q && answers[q.id] == null) {
        // Require an answer
        errorEl.textContent = "Choose the option that feels closest to how your shop actually runs.";
        errorEl.style.display = "block";
        return;
      }

      currentQuestionIndex += delta;

      if (currentQuestionIndex < 0) currentQuestionIndex = 0;

      if (currentQuestionIndex >= hvacQuestions.length && delta > 0) {
        // Move into headspace step
        mode = "headspace";
        render();
        return;
      }

      render();
      return;
    }

    if (mode === "headspace") {
      if (delta > 0 && !selectedPathKey) {
        errorEl.textContent = "Pick the option that feels closest — there’s no wrong answer.";
        errorEl.style.display = "block";
        return;
      }

      if (delta < 0) {
        mode = "questions";
        currentQuestionIndex = hvacQuestions.length - 1;
        render();
        return;
      }

      // Move into results
      mode = "results";
      render();
      return;
    }

    if (mode === "results") {
      if (delta < 0) {
        mode = "headspace";
        render();
        return;
      }
      // Close on forward from results
      closeSurvey();
    }
  }

  function selectOption(questionId, optionIndex) {
    answers[questionId] = optionIndex;
    errorEl.style.display = "none";
    render();
  }

  function selectHeadspace(key) {
    selectedPathKey = key;
    errorEl.style.display = "none";
    render();
  }

  // --- RENDER -------------------------------------------------------------

  function render() {
    bodyEl.innerHTML = "";

    if (mode === "questions") {
      const q = hvacQuestions[currentQuestionIndex];

      subtitleEl.textContent =
        "First, we’ll map where opportunities are currently slipping — then we’ll show you what Automated Clarity™ would quietly watch for you.";

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

        const labelEl = document.createElement("div");
        labelEl.className = "acx-survey-option-label";
        labelEl.textContent = opt.label;

        btn.appendChild(labelEl);
        btn.addEventListener("click", () => selectOption(q.id, idx));
        optionsWrap.appendChild(btn);
      });

      bodyEl.appendChild(title);
      bodyEl.appendChild(help);
      bodyEl.appendChild(optionsWrap);

      const stepNum = currentQuestionIndex + 1;
      const totalSteps = hvacQuestions.length + 2; // + headspace + snapshot
      stepsLabelEl.textContent = `Step ${stepNum} of ${totalSteps}`;
      backBtn.disabled = currentQuestionIndex === 0;
      nextBtn.textContent =
        currentQuestionIndex === hvacQuestions.length - 1
          ? "Continue"
          : "Next";
      return;
    }

    if (mode === "headspace") {
      subtitleEl.textContent =
        "Now, let’s anchor where this actually lands for you. There’s no wrong answer — just pick what feels closest.";

      const title = document.createElement("div");
      title.className = "acx-survey-q-title";
      title.textContent = "Which of these feels closest to where you are right now?";

      const help = document.createElement("div");
      help.className = "acx-survey-q-help";
      help.textContent =
        "This helps Automated Clarity™ respond in a way that matches your reality — whether you’re overloaded, skeptical, or simply unsure where to start.";

      const optionsWrap = document.createElement("div");
      optionsWrap.className = "acx-survey-options";

      headspaceOptions.forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "acx-survey-option";
        if (selectedPathKey === opt.key) {
          btn.classList.add("acx-selected");
        }

        const labelEl = document.createElement("div");
        labelEl.className = "acx-survey-option-label";
        labelEl.textContent = opt.label;

        const helperEl = document.createElement("div");
        helperEl.className = "acx-survey-option-helper";
        helperEl.textContent = opt.helper;

        btn.appendChild(labelEl);
        btn.appendChild(helperEl);
        btn.addEventListener("click", () => selectHeadspace(opt.key));
        optionsWrap.appendChild(btn);
      });

      bodyEl.appendChild(title);
      bodyEl.appendChild(help);
      bodyEl.appendChild(optionsWrap);

      const stepNum = hvacQuestions.length + 1;
      const totalSteps = hvacQuestions.length + 2;
      stepsLabelEl.textContent = `Step ${stepNum} of ${totalSteps}`;
      backBtn.disabled = false;
      nextBtn.textContent = "See my clarity snapshot";

      return;
    }

    // RESULTS MODE
    subtitleEl.textContent =
      "Here’s how Automated Clarity™ would quietly sit underneath your shop — watching, protecting, and recovering revenue without adding to your team’s workload.";

    computeScores();

    const heading = document.createElement("div");
    heading.className = "acx-survey-q-title";
    heading.textContent =
      "Here’s what Automated Clarity™ would watch inside your shop.";

    const intro = document.createElement("p");
    intro.className = "acx-results-intro";
    intro.textContent =
      "Based on your answers, these are the lanes where revenue is most exposed — and where the Automated Clarity™ Revenue Control Layer™ quietly protects it 24/7.";

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
      "This snapshot is private to you. No one from our side sees your answers unless you choose to share them. Automated Clarity™ is designed to remove pressure from owners and staff — no dashboards, no task lists, no new habits required.";

    bodyEl.appendChild(heading);
    bodyEl.appendChild(intro);
    bodyEl.appendChild(grid);
    bodyEl.appendChild(note);

    const stepNum = hvacQuestions.length + 2;
    const totalSteps = hvacQuestions.length + 2;
    stepsLabelEl.textContent = `Step ${stepNum} of ${totalSteps}`;
    backBtn.disabled = false;
    nextBtn.textContent = "Close";

    if (!submitStarted) {
      submitStarted = true;
      sendResultsToBackend().catch(() => {
        // fail silently in UI, show small hint
        errorEl.textContent =
          "Your snapshot couldn’t be saved in the background, but the on-screen results are accurate.";
        errorEl.style.display = "block";
      });
    }
  }

  // --- BACKEND CALL -------------------------------------------------------

  async function sendResultsToBackend() {
    try {
      const scoresCopy = { ...scores };
      const summary = hvacSummaryString();

      // optional hook for later: if you wire in email/name fields,
      // you can read them from the page and pass through here.
      const payload = {
        hvac_scores: scoresCopy,
        path_key: selectedPathKey || null,
        snapshot_summary: summary,
        page_url: window.location.href || "",
      };

      await fetch("/.netlify/functions/hvac-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // swallow; caller will show a soft message
      console.error("Failed to send HVAC survey results:", err);
      throw err;
    }
  }

  // --- BOOTSTRAP ----------------------------------------------------------

  document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    createOverlay();

    const triggers = document.querySelectorAll("[data-acx-scan]");
    triggers.forEach(function (el) {
      el.addEventListener("click", function (evt) {
        openSurvey(evt);
      });
    });
  });
})();
