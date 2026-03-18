const fs = require("fs");
const path = require("path");

const ROOT = path.join("c:\\", "Users", "debon", "Documents", "Telco Review");
const BLOG_DIR = path.join(ROOT, "blog");
const ASSETS_DIR = path.join(ROOT, "assets", "blog");

function readUtf8(p) {
  return fs.readFileSync(p, "utf8");
}

function writeUtf8(p, s) {
  fs.writeFileSync(p, s, "utf8");
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function imageForSlug(slug) {
  // Use 1200px wide image for OG/Twitter
  const rel = `/assets/blog/${slug}-1200.jpg`;
  return `https://telcoreview.com.au${rel}`;
}

function injectSocialMeta(html, canonicalUrl, title, description, ogImageUrl) {
  if (html.includes('property="og:image"') || html.includes("property='og:image'")) return html;

  const block =
`\n  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Telco Review">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(description)}">
  <meta property="og:url" content="${escapeAttr(canonicalUrl)}">
  <meta property="og:image" content="${escapeAttr(ogImageUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(title)}">
  <meta name="twitter:description" content="${escapeAttr(description)}">
  <meta name="twitter:image" content="${escapeAttr(ogImageUrl)}">\n`;

  return html.replace("</head>", `${block}</head>`);
}

function updateBlogIndexCards(indexHtml) {
  // Replace placeholder svg with per-article responsive JPGs, based on href slug.
  // Handles both /blog/<slug>.html and /<slug>/index.html style URLs.
  return indexHtml.replace(/<a class="blog-card__link" href="([^"]+)">[\s\S]*?<img class="blog-card__thumb"[^>]*?src="\/assets\/blog-thumb\.svg"[^>]*?>/g, (m, href) => {
    let slug = "";
    const blogMatch = href.match(/^\/blog\/([^\/]+)\.html$/);
    const rootMatch = href.match(/^\/([^\/]+)\/index\.html$/);
    if (blogMatch) slug = blogMatch[1];
    if (rootMatch) slug = rootMatch[1];
    if (!slug) return m;

    const src = `/assets/blog/${slug}-800.jpg`;
    const srcset = `/assets/blog/${slug}-480.jpg 480w, /assets/blog/${slug}-800.jpg 800w, /assets/blog/${slug}-1200.jpg 1200w`;
    const sizes = "(max-width: 719px) 100vw, (max-width: 1039px) 50vw, 33vw";
    const replacementImg = `<img class="blog-card__thumb" src="${src}" srcset="${srcset}" sizes="${sizes}" alt="" width="1200" height="675" loading="lazy" decoding="async">`;

    return m.replace(/<img class="blog-card__thumb"[\s\S]*?>/, replacementImg);
  });
}

function processArticle(filePath, slugHint) {
  const html = readUtf8(filePath);
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "";
  const desc = (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || "";
  const canon = (html.match(/<link rel="canonical" href="([^"]*)"/i) || [])[1] || "";
  if (!canon || !title || !desc) return;

  const slug = slugHint || (() => {
    const m = canon.match(/\/blog\/([^\/]+)\.html$/);
    if (m) return m[1];
    const m2 = canon.match(/\/([^\/]+)\/$/);
    if (m2) return m2[1];
    return "";
  })();

  if (!slug) return;

  const ogImage = imageForSlug(slug);
  const updated = injectSocialMeta(html, canon, title, desc, ogImage);
  if (updated !== html) writeUtf8(filePath, updated);
}

function main() {
  // Ensure assets exist for known posts before wiring up
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error("Missing assets/blog directory:", ASSETS_DIR);
    process.exit(1);
  }

  // Blog index cards: swap in responsive per-post thumbnails
  const blogIndexPath = path.join(BLOG_DIR, "index.html");
  const blogIndex = readUtf8(blogIndexPath);
  const updatedIndex = updateBlogIndexCards(blogIndex);
  if (updatedIndex !== blogIndex) writeUtf8(blogIndexPath, updatedIndex);

  // Blog articles under /blog/*.html
  const blogFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".html") && f !== "index.html" && f !== "template.html");
  for (const f of blogFiles) {
    const p = path.join(BLOG_DIR, f);
    const slug = f.replace(/\.html$/, "");
    processArticle(p, slug);
  }

  // Root-level article folders with index.html
  const roots = [
    { dir: path.join(ROOT, "telecommunications-review-work"), slug: "telecommunications-review-work" },
    { dir: path.join(ROOT, "mobile-phone-bill-review"), slug: "mobile-phone-bill-review" },
  ];
  for (const r of roots) {
    const p = path.join(r.dir, "index.html");
    if (fs.existsSync(p)) processArticle(p, r.slug);
  }

  console.log("Updated blog index thumbnails and added OG/Twitter meta to articles.");
}

main();

