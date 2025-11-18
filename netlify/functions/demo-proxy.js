// netlify/functions/demo-proxy.js

const DEFAULT_LOCATION_ID = "hvac-demo";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    }
  });
}

export default async (req, context) => {
  const url = new URL(req.url);

  if (req.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  if (req.method === "GET") {
    return handleSummaryGet(url);
  }

  if (req.method === "POST") {
    return handleDemoPost(req);
  }

  return jsonResponse({ ok: false, error: "Method Not Allowed" }, 405);
};

async function handleSummaryGet(url) {
  const locationId = url.searchParams.get("location_id") || DEFAULT_LOCATION_ID;

  const baseSummaryUrl =
    process.env.ACX_MATRIX_SUMMARY_URL ||
    `${url.origin}/.netlify/functions/acx-matrix-summary`;

  const summaryUrl = `${baseSummaryUrl}?location_id=${encodeURIComponent(locationId)}`;

  try {
    const headers = {};
    if (process.env.ACX_MATRIX_SUMMARY_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.ACX_MATRIX_SUMMARY_TOKEN}`;
    }

    const res = await fetch(summaryUrl, { headers });
    if (!res.ok) throw new Error(`Summary HTTP ${res.status}`);

    const raw = await res.json();
    const summary = raw.summary || raw;

    // Normalize to the fields the page expects
    const payload = {
      uptime: summary.uptime ?? "99.9",
      response_ms: summary.response_ms ?? 420,
      quotes_recovered: summary.quotes_recovered ?? 0,
      integrity: summary.integrity ?? "Optimal"
    };

    return jsonResponse({
      ok: true,
      location_id: locationId,
      summary: payload
    });
  } catch (err) {
    console.error("ACX demo-proxy summary error:", err);

    // Safe demo fallback
    return jsonResponse({
      ok: true,
      location_id: locationId,
      summary: {
        uptime: "99.9",
        response_ms: 420,
        quotes_recovered: 3,
        integrity: "Demo mode"
      },
      demoFallback: true
    });
  }
}

async function handleDemoPost(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (err) {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const type = body.type || "demo-click";
  const locationId = body.location_id || DEFAULT_LOCATION_ID;
  const phone = (body.phone || "").trim();
  const consent = !!body.consent;

  const matrixUrl = process.env.ACX_MATRIX_WEBHOOK_URL;
  const matrixSecret = process.env.ACX_WEBHOOK_SECRET;

  let matrixForwarded = false;
  let smsSent = false;

  // 1) Fire demo event into Matrix (writes to Blobs on your console side)
  if (matrixUrl && matrixSecret) {
    try {
      const payload = {
        account: "ACX HVAC Demo",
        location: locationId,
        uptime: "99.9",
        conversion: "0",
        response_ms: "420",
        quotes_recovered: "1",
        integrity: "demo-click",
        run_id: type === "demo-click" ? "demo-click" : type,
        meta: {
          source: "hvac-demo-page",
          demo: true,
          phone_present: !!phone
        }
      };

      const res = await fetch(matrixUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${matrixSecret}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.error("Matrix demo-forward failed:", res.status, await res.text());
      } else {
        matrixForwarded = true;
      }
    } catch (err) {
      console.error("Matrix demo-forward exception:", err);
    }
  } else {
    console.warn("Matrix webhook not configured in environment; skipping Matrix forward.");
  }

  // 2) If consented and properly configured, trigger a one-time GHL SMS webhook
  if (consent && phone) {
    const ghlUrl = process.env.ACX_GHL_SMS_WEBHOOK_URL;
    const ghlToken = process.env.ACX_GHL_SMS_WEBHOOK_TOKEN;

    if (ghlUrl) {
      try {
        const payload = {
          phone,
          location_id: locationId,
          channel: "hvac-demo",
          // These fields can be mapped inside GHL to fire the SMS template you configure.
          tag: "acx_hvac_demo_sms",
          note: "ACX HVAC 15-second demo SMS trigger"
        };

        const headers = {
          "Content-Type": "application/json"
        };
        if (ghlToken) {
          headers["Authorization"] = `Bearer ${ghlToken}`;
        }

        const res = await fetch(ghlUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          console.error("GHL SMS webhook failed:", res.status, await res.text());
        } else {
          smsSent = true;
        }
      } catch (err) {
        console.error("GHL SMS webhook exception:", err);
      }
    } else {
      console.warn("ACX_GHL_SMS_WEBHOOK_URL not configured; skipping SMS send.");
    }
  }

  return jsonResponse({
    ok: true,
    location_id: locationId,
    matrixForwarded,
    smsSent
  });
}
