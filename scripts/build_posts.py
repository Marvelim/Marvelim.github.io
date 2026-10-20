#!/usr/bin/env python3
"""Index public Markdown posts for the Notes calendar. Run from the site root."""
from datetime import date
from pathlib import Path
import json
import re

from build_notes import parse_frontmatter


def build_index(root=Path(".")):
    posts = []
    for path in sorted((root / "content/posts").glob("*.md")):
        meta = parse_frontmatter(path.read_text(encoding="utf-8"))
        if meta.get("draft", "").lower() == "true":
            continue
        if not re.fullmatch(r"[a-zA-Z0-9_-]+", path.stem):
            raise ValueError(f"{path}: use letters, numbers, hyphens or underscores in the filename.")
        day = meta.get("date", "")
        try:
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day):
                raise ValueError
            date.fromisoformat(day)
        except ValueError:
            raise ValueError(f"{path}: add a valid date in YYYY-MM-DD format.") from None
        posts.append({
            "slug": path.stem,
            "title": meta.get("title", "").strip() or path.stem,
            "date": day,
            "summary": meta.get("summary", ""),
        })
    posts.sort(key=lambda post: (post["date"], post["slug"]), reverse=True)
    (root / "content/posts.json").write_text(
        json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Indexed {len(posts)} public post(s).")


if __name__ == "__main__":
    build_index()
