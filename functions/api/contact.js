/**
 * Cloudflare Pages Function: POST /api/contact
 * Forwards contact form submissions to SMTP2GO and sends email to configured recipients.
 *
 * Required environment variables (set in Cloudflare Pages dashboard):
 *   SMTP2GO_API_KEY  - Your SMTP2GO API key
 *   CONTACT_RECIPIENTS - Comma-separated list of recipient emails
 *   CONTACT_FROM     - Sender email (must be verified in SMTP2GO if required)
 *
 * Form fields expected: name, email, phone, message (and optional honeypot "website")
 */

const ALLOWED_ORIGINS = ["https://telcoreview.com.au", "https://www.telcoreview.com.au", "http://localhost:8788", "http://127.0.0.1:8788"];
const CORS_HEADERS = (origin) => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
});

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: CORS_HEADERS(origin || "") });
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS(origin),
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "";

  try {
    const formData = await request.formData();
    const website = formData.get("website"); // honeypot
    if (website) {
      return jsonResponse({ ok: true }, 200, origin);
    }
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    // Basic timing check: drop submissions that arrive unrealistically fast
    const startedAtRaw = (formData.get("form_started_at") || "").toString().trim();
    if (startedAtRaw) {
      const startedAt = Number(startedAtRaw);
      if (!Number.isNaN(startedAt)) {
        const now = Date.now();
        const elapsedMs = now - startedAt;
        if (elapsedMs > 0 && elapsedMs < 3000) {
          // Submitted in under 3 seconds – likely a bot
          return jsonResponse({ ok: true }, 200, origin);
        }
      }
    }

    // Light content-based spam checks
    const lowerMessage = message.toLowerCase();
    const urlMatches = lowerMessage.match(/https?:\/\//g);
    if (urlMatches && urlMatches.length > 2) {
      return jsonResponse({ ok: true }, 200, origin);
    }
    if (message.length < 40 && /https?:\/\//.test(lowerMessage)) {
      return jsonResponse({ ok: true }, 200, origin);
    }

    const emailDomain = email.split("@")[1] || "";
    const blockedDomains = [
      "mailinator.com",
      "guerrillamail.com",
      "10minutemail.com",
      "tempmail.com",
    ];
    if (blockedDomains.some((d) => emailDomain.toLowerCase().endsWith(d))) {
      return jsonResponse({ ok: true }, 200, origin);
    }

    if (!name || !email || !phone || !message) {
      return jsonResponse({ error: "Missing required fields" }, 400, origin);
    }

    const apiKey = env.SMTP2GO_API_KEY;
    const recipients = env.CONTACT_RECIPIENTS || "telco@circlebc.com.au,david.debono@circlebc.com.au,mj@circlebc.com.au";
    const fromEmail = env.CONTACT_FROM || "noreply@telcoreview.com.au";
    if (!apiKey) {
      console.error("SMTP2GO_API_KEY not set in Cloudflare Pages environment variables");
      return jsonResponse({ error: "Server configuration error" }, 500, origin);
    }

    const toList = recipients.split(",").map((e) => e.trim()).filter(Boolean);
    const textBody = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`;
    const payload = {
      api_key: apiKey,
      sender: fromEmail,
      to: toList,
      subject: `Telco Review enquiry from ${name}`,
      text_body: textBody,
    };
    const res = await fetch("https://au-api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Smtp2go-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("SMTP2GO error", res.status, err);
      return jsonResponse({ error: "Failed to send" }, 502, origin);
    }
    return jsonResponse({ ok: true }, 200, origin);
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: "Server error" }, 500, origin);
  }
}
