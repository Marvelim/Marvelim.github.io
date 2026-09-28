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

## Local notes

Notes are kept in the local `minimal-blog/content/notes/` folder for personal use.
The Notes section is no longer published. `push.sh` excludes `content/notes/`
and `content/notes.json`, and deployment excludes them as well.

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
