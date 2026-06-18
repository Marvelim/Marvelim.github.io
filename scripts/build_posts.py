#!/usr/bin/env python3
"""Scan content/posts/*.md and write content/posts.json (newest first).

Run from the project root:  python3 scripts/build_posts.py
The deploy workflow runs this automatically, so on the live site you only
need to drop a new Markdown file in content/posts/ — no manual edits.
"""
import glob
import json
import os
import re

POSTS_DIR = os.path.join("content", "posts")
OUT = os.path.join("content", "posts.json")


def parse_frontmatter(text):
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n?", text, re.S)
    meta = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                key, value = line.split(":", 1)
                meta[key.strip()] = value.strip()
    return meta


def main():
    posts = []
    for path in glob.glob(os.path.join(POSTS_DIR, "*.md")):
        slug = os.path.splitext(os.path.basename(path))[0]
        with open(path, encoding="utf-8") as f:
            meta = parse_frontmatter(f.read())
        tags = [t.strip() for t in meta.get("tags", "").split(",") if t.strip()]
        posts.append({
            "slug": slug,
            "title": meta.get("title", slug),
            "date": meta.get("date", ""),
            "tags": tags,
            "summary": meta.get("summary", ""),
        })
    posts.sort(key=lambda p: p["date"], reverse=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote {OUT} with {len(posts)} post(s).")


if __name__ == "__main__":
    main()
