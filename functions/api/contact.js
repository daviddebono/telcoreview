/**
 * Cloudflare Pages Function: POST /api/contact
 * Forwards contact form submissions to SMTP2GO and sends email to configured recipients.
 *
 * Required environment variables (set in Cloudflare Pages dashboard):
 *   SMTP2GO_API_KEY  - Your SMTP2GO API key
 *   CONTACT_RECIPIENTS - Comma-separated list of recipient emails (e.g. telco@circlebc.com.au,david.debono@circlebc.com.au,mj@circlebc.com.au)
 *   CONTACT_FROM     - Sender email shown in the email (e.g. noreply@telcoreview.com.au or your domain)
 *
 * Form fields expected: name, email, phone, message (and optional honeypot "website")
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = ["https://telcoreview.com.au", "https://www.telcoreview.com.au", "http://localhost:8788", "http://127.0.0.1:8788"];
  const cors = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  try {
    const formData = await request.formData();
    const website = formData.get("website"); // honeypot
    if (website) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": cors } });
    }
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();
    if (!name || !email || !phone || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": cors } });
    }

    const apiKey = env.SMTP2GO_API_KEY;
    const recipients = env.CONTACT_RECIPIENTS || "telco@circlebc.com.au,david.debono@circlebc.com.au,mj@circlebc.com.au";
    const fromEmail = env.CONTACT_FROM || "noreply@telcoreview.com.au";
    if (!apiKey) {
      console.error("SMTP2GO_API_KEY not set");
      return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": cors } });
    }

    const toList = recipients.split(",").map((e) => e.trim()).filter(Boolean);
    const textBody = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`;
    const res = await fetch("https://api.smtp2go.com/v3/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Smtp2go-Api-Key": apiKey,
      },
      body: JSON.stringify({
        sender: fromEmail,
        to: toList,
        subject: `Telco Review enquiry from ${name}`,
        text_body: textBody,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("SMTP2GO error", res.status, err);
      return new Response(JSON.stringify({ error: "Failed to send" }), { status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": cors } });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": cors } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": cors } });
  }
}
