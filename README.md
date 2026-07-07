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
- `/#/research`  → `content/research.md`

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

## Add a note

Drop a Markdown file in `content/notes/`, e.g. `content/notes/my-note.md`:

```markdown
---
title: My note
course: Machine Learning
date: 2026-06-18
summary: One line shown under the note on the index.
---

# My note

Write Markdown + LaTeX here, like $e^{i\pi}+1=0$.
```

The `course` field decides which block the note lands in — pick any course
name and notes sharing it are grouped together. Then rebuild the index:

```bash
python3 scripts/build_notes.py    # regenerates content/notes.json
```

The notes index (`#/notes`) groups notes into one block per course, newest-first,
with a course filter at the top (`#/notes/course/Machine%20Learning`); each note
lives at `#/note/<filename>`. On the live site the deploy workflow runs
`build_notes.py` for you, so you only need to commit the new `.md` file.

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

It rebuilds the blog index, mirrors the files into the git repo, and pushes to
`main`. GitHub Actions builds and deploys to https://marvelim.github.io (live
in about a minute). The repo path is set near the top of `push.sh`.
