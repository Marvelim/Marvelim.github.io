/* Markdown pages and a date-based notebook. No framework or build step. */

const DEFAULT_PAGE = "about";
let renderVersion = 0;
let postsRequest;

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
    .map((part) => {
      try { return decodeURIComponent(part); } catch { return ""; }
    });
}

function notFound(path) {
  return (
    `<h1>Not found</h1><p>Couldn’t load <code>${escapeHtml(path)}</code>. ` +
    `If you opened this file directly, serve it over HTTP — see the README.</p>`
  );
}

async function renderPage() {
  const version = ++renderVersion;
  const seg = parseHash();
  const el = document.getElementById("content");
  const wasCalendar = el.classList.contains("page-notes");
  if (seg[0] === "notes" || seg[0] === "note") {
    setActiveNav("notes");
    el.className = "content page-" + seg[0];
    document.title = "Notes — Mingyu Li";
    try {
      const posts = await loadPosts();
      if (version !== renderVersion) return;
      if (seg[0] === "note") {
        await renderPost(el, posts, seg[1], version);
        if (version === renderVersion) window.scrollTo(0, 0);
      } else {
        await renderCalendar(el, posts, seg[1], version);
        if (!wasCalendar && version === renderVersion) window.scrollTo(0, 0);
      }
    } catch {
      if (version !== renderVersion) return;
      el.innerHTML = '<h1>Notes</h1><p>The notes couldn’t be loaded. Please try again.</p><button class="notes-button" id="retry-notes">Try again</button>';
      el.querySelector("#retry-notes").onclick = renderPage;
    }
    return;
  }
  return renderMarkdownPage(el, safeSlug(seg[0] || DEFAULT_PAGE), version);
}

async function renderMarkdownPage(el, slug, version) {
  el.className = "content page-" + slug;
  setActiveNav(slug);
  try {
    const { meta, body } = parseFrontmatter(await fetchText(`content/${slug}.md`));
    if (version !== renderVersion) return;
    document.title = meta.title || "Mingyu Li";
    el.innerHTML = marked.parse(body);
  } catch {
    if (version !== renderVersion) return;
    document.title = "Not found";
    el.innerHTML = notFound(`content/${slug}.md`);
  }
  window.scrollTo(0, 0);
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function validDate(value) {
  if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && dateKey(date) === value;
}

function formatDate(value, options = { month: "long", day: "numeric", year: "numeric" }) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", options);
}

async function loadPosts() {
  if (!postsRequest) {
    postsRequest = fetchText("content/posts.json").then((text) => {
      const posts = JSON.parse(text);
      if (!Array.isArray(posts)) throw new Error("Invalid post index");
      return posts.filter((post) => typeof post.slug === "string" &&
        /^[a-zA-Z0-9_-]+$/.test(post.slug) && validDate(post.date))
        .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
    }).catch((error) => {
      postsRequest = undefined;
      throw error;
    });
  }
  return postsRequest;
}

function postBody(text, slug, title) {
  const { body } = parseFrontmatter(text);
  const template = document.createElement("template");
  template.innerHTML = marked.parse(body);
  const first = template.content.firstElementChild;
  if (first?.tagName === "H1" && first.textContent.trim() === title) first.remove();
  // Markdown assets are relative to the source file, not index.html.
  for (const element of template.content.querySelectorAll("[src], a[href]")) {
    const attribute = element.hasAttribute("src") ? "src" : "href";
    const value = element.getAttribute(attribute);
    if (value && !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value)) {
      element.setAttribute(attribute, new URL(value, new URL(`content/posts/${slug}.md`, location.href)).href);
    }
  }
  return template.innerHTML;
}

async function fillPostBodies(container, posts, version) {
  await Promise.all(posts.map(async (post) => {
    const target = container.querySelector(`[data-post-body="${post.slug}"]`);
    try {
      const text = await fetchText(`content/posts/${post.slug}.md`);
      if (version === renderVersion) target.innerHTML = postBody(text, post.slug, post.title);
    } catch {
      if (version !== renderVersion) return;
      target.innerHTML = '<p>This note couldn’t be loaded.</p><button class="notes-button">Try again</button>';
      target.querySelector("button").onclick = () => fillPostBodies(container, [post], version);
    }
  }));
}

function postMarkup(post, standalone = false) {
  const title = escapeHtml(post.title);
  return `<article class="journal-entry">
    <header>
      ${standalone ? `<h1>${title}</h1>` : `<h3><a href="#/note/${post.slug}" title="Open this note">${title}</a></h3>`}
      <a class="entry-date" href="#/notes/${post.date}"><time datetime="${post.date}">${formatDate(post.date)}</time></a>
    </header>
    <div class="entry-body" data-post-body="${post.slug}"><p class="notes-muted" role="status">Loading note…</p></div>
  </article>`;
}

async function renderPost(el, posts, slug, version) {
  const post = posts.find((item) => item.slug === slug);
  if (!post) {
    el.innerHTML = '<div class="back"><a href="#/notes">← Back to Notes</a></div><h1>Note not found</h1><p>This note is no longer available.</p>';
    return;
  }
  document.title = `${post.title} — Mingyu Li`;
  el.innerHTML = `<div class="back"><a href="#/notes/${post.date}">← Back to the calendar</a></div>${postMarkup(post, true)}`;
  await fillPostBodies(el, [post], version);
}

async function renderCalendar(el, posts, routeDate, version) {
  const today = dateKey(new Date());
  const selected = validDate(routeDate) ? routeDate :
    validDate(`${routeDate}-01`) ? `${routeDate}-01` : today;
  const date = new Date(`${selected}T12:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthKey = selected.slice(0, 7);
  const monthPosts = posts.filter((post) => post.date.startsWith(monthKey));
  const dayPosts = posts.filter((post) => post.date === selected);
  const byDate = new Map();
  for (const post of monthPosts) {
    byDate.set(post.date, [...(byDate.get(post.date) || []), post]);
  }
  const first = new Date(year, month, 1, 12);
  const offset = (first.getDay() + 6) % 7; // Monday first.
  const length = new Date(year, month + 1, 0).getDate();
  const total = Math.ceil((offset + length) / 7) * 7;
  let cells = "";
  for (let i = 0; i < total; i++) {
    const day = i - offset + 1;
    if (day < 1 || day > length) {
      cells += '<div class="calendar-blank" aria-hidden="true"></div>';
      continue;
    }
    const key = `${monthKey}-${String(day).padStart(2, "0")}`;
    const entries = byDate.get(key) || [];
    const count = entries.length;
    const label = `${formatDate(key)}${key === today ? ", today" : ""}, ${count} ${count === 1 ? "note" : "notes"}${count ? ": " + entries.map((p) => p.title).join("; ") : ""}`;
    cells += `<button type="button" class="calendar-day${count ? " has-notes" : ""}${key === today ? " is-today" : ""}"
      data-day="${key}" aria-label="${escapeHtml(label)}" aria-pressed="${key === selected}"
      ${key === today ? 'aria-current="date"' : ""} tabindex="${key === selected ? "0" : "-1"}">
      <span class="day-number">${day}</span>
      ${count ? `<span class="day-title" aria-hidden="true">${escapeHtml(entries[0].title)}${count > 1 ? `<span class="day-more"> +${count - 1}</span>` : ""}</span>
        <span class="day-dot" aria-hidden="true"></span>` : ""}
    </button>`;
  }
  const previousFocus = document.activeElement?.dataset.calendarControl;
  const dayHadFocus = document.activeElement?.hasAttribute("data-day");
  el.innerHTML = `<header class="notes-header">
      <h1>Notes<span class="notes-title-dot" aria-hidden="true">.</span></h1>
      <p>Thoughts, things I’m learning, and bits of everyday life.</p>
    </header>
    <section class="calendar" aria-label="Notes calendar">
      <div class="calendar-toolbar">
        <h2 id="calendar-month">${formatDate(selected, { month: "long" })} <span>${year}</span></h2>
        <div class="calendar-controls">
          <button class="notes-button" data-calendar-control="today">Today</button>
          <button class="notes-button month-arrow" data-calendar-control="previous" aria-label="Previous month" ${year === 1000 && month === 0 ? "disabled" : ""}>←</button>
          <button class="notes-button month-arrow" data-calendar-control="next" aria-label="Next month" ${year === 9999 && month === 11 ? "disabled" : ""}>→</button>
        </div>
      </div>
      <div class="calendar-weekdays" aria-hidden="true">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => `<span>${day}</span>`).join("")}</div>
      <p class="sr-only" id="calendar-help">Use the arrow keys to move between dates. Notes for the selected day appear below the calendar.</p>
      <div class="calendar-grid" role="group" aria-labelledby="calendar-month" aria-describedby="calendar-help">${cells}</div>
      <div class="calendar-caption">
        <span><span class="legend-dot" aria-hidden="true"></span>${monthPosts.length} ${monthPosts.length === 1 ? "note" : "notes"} this month</span>
        ${posts.length ? `<a href="#/notes/${posts[0].date}">Latest note ↗</a>` : '<span>One day at a time.</span>'}
      </div>
    </section>
    <section class="day-reading" aria-labelledby="day-heading">
      <div class="day-heading-row">
        <h2 id="day-heading">${formatDate(selected, { month: "long", day: "numeric" })}<span> / ${formatDate(selected, { weekday: "long" })}</span></h2>
        <span class="day-entry-count">${dayPosts.length ? `${dayPosts.length} ${dayPosts.length === 1 ? "entry" : "entries"}` : ""}</span>
      </div>
      <div id="day-entries" aria-live="polite" aria-busy="${Boolean(dayPosts.length)}">
        ${dayPosts.length ? dayPosts.map((post) => postMarkup(post)).join("") :
          `<div class="notes-empty"><p>${posts.length ? "No notes on this day." : "A little space for things worth keeping."}</p><span>${posts.length ? "Choose a marked date to read a note." : "The first note will appear here."}</span></div>`}
      </div>
    </section>`;

  const navigate = (key) => { location.hash = `/notes/${key}`; };
  el.querySelectorAll("[data-day]").forEach((button) => {
    button.onclick = () => navigate(button.dataset.day);
    button.onkeydown = (event) => {
      const shifts = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!(event.key in shifts)) return;
      event.preventDefault();
      const next = new Date(`${button.dataset.day}T12:00:00`);
      next.setDate(next.getDate() + shifts[event.key]);
      if (validDate(dateKey(next))) navigate(dateKey(next));
    };
  });
  el.querySelectorAll("[data-calendar-control]").forEach((button) => {
    button.onclick = () => {
      const control = button.dataset.calendarControl;
      navigate(control === "today" ? today : dateKey(new Date(year, month + (control === "previous" ? -1 : 1), 1, 12)));
    };
  });
  if (previousFocus) el.querySelector(`[data-calendar-control="${previousFocus}"]`)?.focus({ preventScroll: true });
  else if (dayHadFocus) el.querySelector(`[data-day="${selected}"]`)?.focus({ preventScroll: true });
  await fillPostBodies(el, dayPosts, version);
  if (version === renderVersion) el.querySelector("#day-entries").setAttribute("aria-busy", "false");
}

window.addEventListener("hashchange", renderPage);
window.addEventListener("DOMContentLoaded", () => {
  configureMarked();
  renderPage();
});
