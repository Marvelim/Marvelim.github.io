/* Markdown + KaTeX renderer for About and Miscellaneous. */

const DEFAULT_PAGE = "about";

// Wire up Markdown -> KaTeX once the deferred scripts have loaded.
function configureMarked() {
  marked.setOptions({ gfm: true, breaks: false });
  if (typeof markedKatex === "function") {
    marked.use(markedKatex({ throwOnError: false, nonStandard: true }));
  }
}

// Pull a minimal `--- title: ... ---` block off the top, if present.
function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: text.slice(match[0].length) };
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const safeSlug = (s) => s.replace(/[^a-z0-9_-]/gi, "");

async function fetchText(path) {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) throw new Error(String(res.status));
  return res.text();
}

// Highlight the nav link for the current top-level section.
function setActiveNav(section) {
  document.querySelectorAll(".site-nav a").forEach((a) => {
    const route =
      a.getAttribute("href").replace(/^#\/?/, "").split("/")[0] || DEFAULT_PAGE;
    a.classList.toggle("active", route === section);
  });
}

function parseHash() {
  return location.hash
    .replace(/^#\/?/, "")
    .trim()
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);
}

function notFound(path) {
  return (
    `<h1>Not found</h1><p>Couldn’t load <code>${escapeHtml(path)}</code>. ` +
    `If you opened this file directly, serve it over HTTP — see the README.</p>`
  );
}

async function renderPage() {
  const seg = parseHash();
  const el = document.getElementById("content");

  // Retired note links return to the homepage.
  if (seg[0] === "notes" || seg[0] === "note") {
    history.replaceState(null, "", "#/");
    return renderMarkdownPage(el, DEFAULT_PAGE);
  }
  return renderMarkdownPage(el, safeSlug(seg[0] || DEFAULT_PAGE));
}

async function renderMarkdownPage(el, slug) {
  el.className = "content page-" + slug;
  setActiveNav(slug);
  try {
    const { meta, body } = parseFrontmatter(await fetchText(`content/${slug}.md`));
    document.title = meta.title || "Mingyu Li";
    el.innerHTML = marked.parse(body);
  } catch {
    document.title = "Not found";
    el.innerHTML = notFound(`content/${slug}.md`);
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", renderPage);
window.addEventListener("DOMContentLoaded", () => {
  configureMarked();
  renderPage();
});
