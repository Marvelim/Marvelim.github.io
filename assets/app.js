/* ---------------------------------------------------------------
   Tiny client-side renderer.
   - Every page is a Markdown file in /content (with LaTeX math).
   - The hash picks the page:  #/about -> content/about.md
   - Home (no hash) falls back to "about".
   Add a page by dropping a new .md file in /content. No HTML needed.
   --------------------------------------------------------------- */

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

// Highlight the nav link for the current page.
function setActiveNav(slug) {
  document.querySelectorAll(".site-nav a").forEach((a) => {
    const route =
      a.getAttribute("href").replace(/^#\/?/, "").trim() || DEFAULT_PAGE;
    a.classList.toggle("active", route === slug);
  });
}

async function renderPage() {
  const slug = (location.hash.replace(/^#\/?/, "").trim() || DEFAULT_PAGE)
    .replace(/[^a-z0-9_-]/gi, ""); // keep it to safe filenames
  const el = document.getElementById("content");
  el.className = "content page-" + slug; // lets CSS target a specific page
  setActiveNav(slug);

  try {
    const res = await fetch(`content/${slug}.md`, { cache: "no-cache" });
    if (!res.ok) throw new Error(String(res.status));
    const { meta, body } = parseFrontmatter(await res.text());
    document.title = meta.title ? meta.title : "Mingyu Li";
    el.innerHTML = marked.parse(body);
  } catch (err) {
    document.title = "Not found";
    el.innerHTML =
      `<h1>Page not found</h1><p>Couldn’t load <code>content/${slug}.md</code>. ` +
      `If you opened this file directly, serve it over HTTP — see the README.</p>`;
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", renderPage);
window.addEventListener("DOMContentLoaded", () => {
  configureMarked();
  renderPage();
});
