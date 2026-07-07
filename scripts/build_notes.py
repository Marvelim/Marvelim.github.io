#!/usr/bin/env python3
"""Scan content/notes/*.md and write content/notes.json (newest first).

Run from the project root:  python3 scripts/build_notes.py
The deploy workflow runs this automatically, so on the live site you only
need to drop a new Markdown file in content/notes/ — no manual edits.
"""
import glob
import json
import os
import re

NOTES_DIR = os.path.join("content", "notes")
OUT = os.path.join("content", "notes.json")


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
    notes = []
    for path in glob.glob(os.path.join(NOTES_DIR, "*.md")):
        slug = os.path.splitext(os.path.basename(path))[0]
        with open(path, encoding="utf-8") as f:
            meta = parse_frontmatter(f.read())
        notes.append({
            "slug": slug,
            "title": meta.get("title", slug),
            "course": meta.get("course", "").strip() or "Uncategorized",
            "date": meta.get("date", ""),
            "summary": meta.get("summary", ""),
        })
    notes.sort(key=lambda n: n["date"], reverse=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(notes, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Wrote {OUT} with {len(notes)} note(s).")


if __name__ == "__main__":
    main()
