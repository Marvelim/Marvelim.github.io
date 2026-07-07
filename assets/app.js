/* ---------------------------------------------------------------
   Tiny client-side renderer + router.
   Routes (hash-based):
     #/               -> content/about.md
     #/misc           -> content/misc.md
     #/notes          -> notes index, grouped into course blocks
     #/notes/course/x -> notes index showing only course "x"
     #/note/<slug>    -> content/notes/<slug>.md
   Add a normal page: drop content/<name>.md and link #/<name>.
   Add a note:        drop content/notes/<slug>.md (frontmatter:
                      title, course, date, summary), then rebuild the
                      index (scripts/build_notes.py; the deploy
                      workflow does this automatically). The `course`
                      field decides which block the note lands in.
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

async function loadNotes() {
  try {
    return JSON.parse(await fetchText("content/notes.json"));
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

  if (seg[0] === "notes") {
    const course = seg[1] === "course" ? seg[2] : null;
    return renderNotesIndex(el, course);
  }
  if (seg[0] === "note" && seg[1]) {
    return renderNote(el, safeSlug(seg[1]));
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

async function renderNotesIndex(el, activeCourse) {
  el.className = "content page-notes";
  setActiveNav("notes");
  document.title = activeCourse ? `Notes · ${activeCourse}` : "Notes";

  const notes = await loadNotes();

  // Course names in the order their newest note appears (notes.json is
  // already newest-first), so busier courses tend to float to the top.
  const courses = [...new Set(notes.map((n) => n.course))];
  const shown = activeCourse ? courses.filter((c) => c === activeCourse) : courses;

  const chip = (label, route, on) =>
    `<a class="course-chip${on ? " active" : ""}" href="#/notes${route}">${escapeHtml(label)}</a>`;
  const filter =
    `<div class="course-filter">` +
    chip("All", "", !activeCourse) +
    courses
      .map((c) => chip(c, `/course/${encodeURIComponent(c)}`, c === activeCourse))
      .join("") +
    `</div>`;

  const noteRow = (n) => `<li>
        <a class="note-row" href="#/note/${encodeURIComponent(n.slug)}">
          <span class="note-title">${escapeHtml(n.title)}</span>
          ${n.date ? `<span class="note-date">${escapeHtml(n.date)}</span>` : ""}
        </a>
        ${n.summary ? `<p class="note-summary">${escapeHtml(n.summary)}</p>` : ""}
      </li>`;

  const block = (course) => {
    const items = notes.filter((n) => n.course === course);
    return `<section class="course-block">
        <h2 class="course-name">
          <a href="#/notes/course/${encodeURIComponent(course)}">${escapeHtml(course)}</a>
          <span class="course-count">${items.length}</span>
        </h2>
        <ul class="note-list">${items.map(noteRow).join("")}</ul>
      </section>`;
  };

  const blocks = shown.length
    ? shown.map(block).join("")
    : `<p class="empty">No notes${
        activeCourse ? ` in “${escapeHtml(activeCourse)}”` : ""
      } yet.</p>`;

  el.innerHTML = `<h1>Notes</h1>${filter}${blocks}`;
  window.scrollTo(0, 0);
}

async function renderNote(el, slug) {
  el.className = "content page-note";
  setActiveNav("notes");
  const back = `<p class="back"><a href="#/notes">← Notes</a></p>`;
  try {
    const { meta, body } = parseFrontmatter(await fetchText(`content/notes/${slug}.md`));
    document.title = meta.title || "Notes";
    const course = (meta.course || "").trim();
    const metaLine =
      `<p class="note-meta">` +
      (course
        ? `<a class="course-tag" href="#/notes/course/${encodeURIComponent(course)}">${escapeHtml(course)}</a>`
        : "") +
      (meta.date ? `<span class="note-date">${escapeHtml(meta.date)}</span>` : "") +
      `</p>`;
    el.innerHTML = back + marked.parse(body);
    const h1 = el.querySelector("h1");
    if (h1) h1.insertAdjacentHTML("afterend", metaLine);
    else el.insertAdjacentHTML("beforeend", metaLine);
  } catch {
    document.title = "Not found";
    el.innerHTML = back + notFound(`content/notes/${slug}.md`);
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", renderPage);
window.addEventListener("DOMContentLoaded", () => {
  configureMarked();
  renderPage();
});
