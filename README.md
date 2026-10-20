# minimal-blog

A deliberately small, light, editorial personal site. Every page is written in
**Markdown + LaTeX** — there is no HTML to edit and no build step.

## How it works

```
minimal-blog/
├── index.html        # tiny shell (you rarely touch this)
├── assets/
│   ├── styles.css     # the whole look lives here
│   └── app.js         # loads a .md file and renders it (Markdown + KaTeX)
└── content/
    └── about.md       # ← your pages live here, in Markdown
```

`index.html` loads the Markdown file named by the URL hash:

- `/`            → `content/about.md`  (home)
- `/#/about`     → `content/about.md`
- `/#/notes`     → Notes calendar
- `/#/misc`      → `content/misc.md`

## Add a page

Drop a new file in `content/`, e.g. `content/research.md`:

```markdown
---
title: Research
---

# Research

Some prose with inline math $e^{i\pi} + 1 = 0$ and a display block:

$$\nabla \cdot \mathbf{E} = \frac{\rho}{\varepsilon_0}$$
```

Then link to it from any page with `[Research](#/research)`. That's it.

Math uses standard LaTeX delimiters: `$ ... $` inline, `$$ ... $$` display.

## Publish a calendar note

Create `content/posts/my-first-note.md` with a date and title:

```markdown
---
title: A small observation
date: 2026-10-20
summary: An optional short description.
---

Write your note here. Markdown, images, and LaTeX are supported.
```

Use letters, numbers, hyphens, or underscores in the filename. The date is the
calendar day on which the note appears. Several notes can share a date.
An optional `draft: true` keeps a post out of the calendar index, but files in
`content/posts/` are publicly accessible once deployed; keep private writing in
`content/notes/`.

Run `python3 scripts/build_posts.py` to refresh the calendar locally.
`./push.sh` runs this automatically before publishing. Click a date to read all
of that day's notes below the calendar; click a note title for its own link.
Month arrows, Today, and Latest note navigate the calendar. Arrow keys move
between dates when the calendar has focus. Date URLs can be bookmarked.

## Local notes

Notes are kept in the local `minimal-blog/content/notes/` folder for personal use.
These older private notes are separate from the public calendar.
`push.sh` excludes `content/notes/` and `content/notes.json`,
and deployment excludes them as well.

## Run locally

Browsers block `fetch()` of local files over `file://`, so serve over HTTP:

```bash
cd minimal-blog
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish

Edit your content in this folder, then run:

```bash
./push.sh                 # commit message defaults to a timestamp
./push.sh "new blog post" # or pass your own message
```

It mirrors the site files, excluding local notes, into the git repo and pushes to
`main`. GitHub Actions builds and deploys to https://marvelim.github.io (live
in about a minute). The repo path is set near the top of `push.sh`.
