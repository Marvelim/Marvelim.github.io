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

## Add a blog post

Drop a Markdown file in `content/posts/`, e.g. `content/posts/my-post.md`:

```markdown
---
title: My post
date: 2026-06-18
tags: math, notes
summary: One line shown on the blog index.
---

# My post

Write Markdown + LaTeX here, like $e^{i\pi}+1=0$.
```

Then rebuild the post index:

```bash
python3 scripts/build_posts.py    # regenerates content/posts.json
```

The blog index (`#/blog`) lists posts newest-first with a tag filter at the
top (`#/blog/tag/math`); each post lives at `#/post/<filename>`. On the live
site the deploy workflow runs `build_posts.py` for you, so you only need to
commit the new `.md` file.

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
