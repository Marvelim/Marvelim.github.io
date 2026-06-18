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

## Run locally

Browsers block `fetch()` of local files over `file://`, so serve over HTTP:

```bash
cd minimal-blog
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

It's fully static — push to a `username.github.io` repo (or any static host)
and it just works, no configuration needed.
