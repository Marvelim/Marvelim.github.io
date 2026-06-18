/* ---------------------------------------------------------------
   Tiny client-side renderer + router.
   Routes (hash-based):
     #/            -> content/about.md
     #/misc        -> content/misc.md
     #/blog        -> blog index (from content/posts.json)
     #/blog/tag/x  -> blog index filtered by tag "x"
     #/post/<slug> -> content/posts/<slug>.md
   Add a normal page: drop content/<name>.md and link #/<name>.
   Add a blog post:   drop content/posts/<slug>.md (frontmatter:
                      title, date, tags, summary), then rebuild the
                      index (scripts/build_posts.py; the deploy
                      workflow does this automatically).
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

async function loadPosts() {
  try {
    return JSON.parse(await fetchText("content/posts.json"));
  } catch {
    return [];
  }
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

  if (seg[0] === "blog") {
    const tag = seg[1] === "tag" ? seg[2] : null;
    return renderBlogIndex(el, tag);
  }
  if (seg[0] === "post" && seg[1]) {
    return renderPost(el, safeSlug(seg[1]));
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

function tagLink(tag) {
  return `<a class="tag" href="#/blog/tag/${encodeURIComponent(tag)}">${escapeHtml(tag)}</a>`;
}

async function renderBlogIndex(el, activeTag) {
  el.className = "content page-blog";
  setActiveNav("blog");
  document.title = activeTag ? `Blog · ${activeTag}` : "Blog";

  const posts = await loadPosts();
  const tags = [...new Set(posts.flatMap((p) => p.tags || []))].sort();
  const shown = activeTag
    ? posts.filter((p) => (p.tags || []).includes(activeTag))
    : posts;

  const chip = (label, route, on) =>
    `<a class="tag-chip${on ? " active" : ""}" href="#/blog${route}">${escapeHtml(label)}</a>`;
  const filter =
    `<div class="tag-filter">` +
    chip("All", "", !activeTag) +
    tags.map((t) => chip(t, `/tag/${encodeURIComponent(t)}`, t === activeTag)).join("") +
    `</div>`;

  const list = shown.length
    ? `<ul class="post-list">` +
      shown
        .map(
          (p) => `<li>
            <a class="post-row" href="#/post/${encodeURIComponent(p.slug)}">
              <span class="post-title">${escapeHtml(p.title)}</span>
              <span class="post-date">${escapeHtml(p.date)}</span>
            </a>
            ${p.summary ? `<p class="post-summary">${escapeHtml(p.summary)}</p>` : ""}
            ${(p.tags || []).length ? `<div class="post-tags">${p.tags.map(tagLink).join("")}</div>` : ""}
          </li>`
        )
        .join("") +
      `</ul>`
    : `<p class="empty">No posts${
        activeTag ? ` tagged “${escapeHtml(activeTag)}”` : ""
      } yet.</p>`;

  el.innerHTML = `<h1>Blog</h1>${filter}${list}`;
  window.scrollTo(0, 0);
}

async function renderPost(el, slug) {
  el.className = "content page-post";
  setActiveNav("blog");
  const back = `<p class="back"><a href="#/blog">← Blog</a></p>`;
  try {
    const { meta, body } = parseFrontmatter(await fetchText(`content/posts/${slug}.md`));
    document.title = meta.title || "Blog";
    const tags = (meta.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
    const metaLine =
      `<p class="post-meta">` +
      (meta.date ? `<span class="post-date">${escapeHtml(meta.date)}</span>` : "") +
      (tags.length ? `<span class="post-tags">${tags.map(tagLink).join("")}</span>` : "") +
      `</p>`;
    el.innerHTML = back + marked.parse(body);
    const h1 = el.querySelector("h1");
    if (h1) h1.insertAdjacentHTML("afterend", metaLine);
    else el.insertAdjacentHTML("beforeend", metaLine);
  } catch {
    document.title = "Not found";
    el.innerHTML = back + notFound(`content/posts/${slug}.md`);
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", renderPage);
window.addEventListener("DOMContentLoaded", () => {
  configureMarked();
  renderPage();
});
