# Telco Review – telcoreview.com.au

Static marketing website for Telco Review: independent telecommunications review and alternative provider advice for Australian business. Built for **Cloudflare Pages** with automatic deploys on push.

## Tech stack

- **HTML, CSS, JS** — no framework. Single stylesheet (`/css/style.css`) and script (`/js/main.js`).
- **Cloudflare Pages** — hosting and (optional) **Pages Functions** for the contact form.
- **Australian spelling** and terminology throughout.

## Edit locally

1. Clone the repo: `git clone https://github.com/daviddebono/telcoreview.git`
2. Open the project folder and edit files as needed.
3. Run a local server to test (root must be project folder so `/css/style.css` etc. resolve):
   - **Node:** `npx serve .` (serves current directory; default port 3000).
   - **Python 3:** `python -m http.server 8080`
4. Open e.g. `http://localhost:3000` (or 8080). The contact form will submit to `/api/contact`; that only works when deployed to Cloudflare Pages with the Function and env vars set (see below).

## Deploy

- **Cloudflare Pages:** Connect the GitHub repo in the Cloudflare dashboard. Build command: leave empty (static). Build output directory: `/` (root). Every push to `main` triggers a new deploy.
- After deploy, the live site is served from the repo root. Ensure **Pages Functions** are enabled so `/api/contact` works.

## Contact form and form endpoint

The contact form on `/contact.html` posts to **`/api/contact`** (method POST). That URL is handled by a **Cloudflare Pages Function** in this repo: `functions/api/contact.js`.

### How it works

1. User submits the form (name, email, phone, message). A honeypot field (`website`) is used for spam; if filled, the request is accepted but no email is sent.
2. The Function validates required fields, then sends an email via **SMTP2GO** to the addresses you configure. Recipients are **not** exposed in the site HTML or JS; they are set only in Cloudflare env.

### Where to set form behaviour

- **Form action** is in `contact.html`:  
  `action="/api/contact"`  
  Do not change this unless you use a different backend (e.g. third-party form service).
- **Recipient emails and SMTP2GO** are set in the **Cloudflare Pages** project:
  1. Dashboard → Pages → your project → **Settings** → **Environment variables**.
  2. Add (for **Production** and optionally **Preview**):

  | Variable             | Value (example)                                                                 | Notes                          |
  |----------------------|----------------------------------------------------------------------------------|--------------------------------|
  | `SMTP2GO_API_KEY`    | Your SMTP2GO API key                                                             | Required for email to send.   |
  | `CONTACT_RECIPIENTS` | `telco@circlebc.com.au,david.debono@circlebc.com.au,mj@circlebc.com.au`          | Comma-separated, no spaces.   |
  | `CONTACT_FROM`       | `noreply@telcoreview.com.au` (or your domain)                                     | Sender address in the email.  |

3. **Redeploy** after changing env vars (Deployments → ⋮ → Retry deployment) so the Function picks them up.

### Contact form not working (SMTP2GO checklist)

If the form shows "Something went wrong" or emails never arrive:

1. **Environment variables** — In Cloudflare Pages → your project → **Settings** → **Environment variables**, confirm for **Production** (and Preview if you test there): `SMTP2GO_API_KEY` (Encrypt: Yes), `CONTACT_RECIPIENTS` (comma-separated, no spaces), `CONTACT_FROM` (sender; verify in SMTP2GO if required).
2. **Redeploy** — After adding or changing env vars, trigger a new deploy. Functions only read env at deploy time.
3. **SMTP2GO dashboard** — Check API key is active, sender is allowed/verified, no blocks or rate limits.
4. **Cloudflare logs** — Pages → Functions → Logs; look for "SMTP2GO_API_KEY not set" or "SMTP2GO error" when you submit.
5. **Browser** — F12 → Network → submit form → check `/api/contact` request Status (200 = OK, 500 = config error, 502 = SMTP2GO rejected).

### If you don’t use the Function

- You can point the form elsewhere (e.g. Formspree, another serverless endpoint). Change `action="/api/contact"` in `contact.html` to your URL. The form sends standard `application/x-www-form-urlencoded` or `multipart/form-data` (current implementation uses FormData so it’s multipart).
- To avoid exposing recipient addresses, never put them in the HTML or client-side JS; keep them only in your backend or form provider config.

### Spam and CAPTCHA

- The form includes a **honeypot** field and basic required-field validation. For more protection you can add **Cloudflare Turnstile** (or similar) and validate the token in the same Function; that requires extra code in the form and in `functions/api/contact.js`.

## Capability statement

- **View / print:** `/capability-statement.html`. Users can use the browser **Print** (Ctrl+P / Cmd+P) and “Save as PDF” to get a PDF. There is no separate PDF file; the page is the capability statement.

## Blog: add a new post and update sitemap

1. **Create the post**  
   Copy `blog/template.html` to a new file, e.g. `blog/my-new-post.html`. Replace placeholders:
   - `ARTICLE_TITLE`, `ARTICLE_META_DESCRIPTION`, `ARTICLE_SLUG`, `ARTICLE_SUBTITLE_OR_DATE`, `ARTICLE_SUMMARY_ONE_OR_TWO_SENTENCES`, and the body/FAQ content. Use Australian spelling and internal links (e.g. to `/services/`, `/blog/`, `/contact.html`).

2. **Link from the blog index**  
   In `blog/index.html`, add a new list item in the `<ul class="blog-list">` with a link to `/blog/my-new-post.html` and a short meta line.

3. **Update the sitemap**  
   Open `sitemap.xml` and add a new `<url>` block for the post, e.g.:
   ```xml
   <url><loc>https://telcoreview.com.au/blog/my-new-post.html</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
   ```
   Keep the file valid XML and the existing `</urlset>` at the end.

4. **Optional:** Add more vendor or location pages and add their URLs to `sitemap.xml` the same way.

## Logo and hero image

- **Logo:** The site uses `/assets/logo.svg` (text “Telco Review”). To use the existing Telco Review logo from the current live site, replace `assets/logo.svg` with that file and keep the same path.
- **Hero:** The homepage hero uses `/assets/hero-office.svg` (placeholder). You can replace it with a photo (e.g. from Unsplash, with correct licensing and attribution). Recommended: max width 1920px, compress for web; update the `src` in `index.html` if you change the filename.

## Project structure (summary)

```
/
  index.html              # Homepage (hero, sections, CTAs)
  about.html
  services.html
  benefits.html
  case-studies.html
  contact.html
  capability-statement.html
  privacy.html
  terms.html
  sitemap.xml
  robots.txt
  css/style.css
  js/main.js
  assets/                 # tr-logo.png, favicon.svg, hero image
  blog/
    index.html
    template.html
    [post].html
  services/
    [service].html
  vendors/
    index.html
    [vendor].html
  locations/
    index.html
    [city].html
  functions/
    api/contact.js        # Pages Function for form → SMTP2GO
```

## Git

- After making changes, commit and push to your remote. Cloudflare Pages deploys from the connected branch (typically `main`).
- Do not commit secrets (e.g. SMTP2GO API key). Keep them only in Cloudflare environment variables.

---

**Telco Review** — Independent telecommunications review for Australian business.  
Australian spelling and terminology used throughout this site.
