#!/usr/bin/env python3
"""
Builds posts/index.json from the Markdown files in the posts/ folder.

GitHub runs this for you every time you push (see .github/workflows/deploy.yml).
You can also run it on your own laptop:

    python scripts/build_posts.py

Rules:
  - Every post is a .md file in posts/ with a front matter block at the top
    (title, date, summary, and optionally tags, cover, slug, draft).
  - Files starting with "_" (like _template.md) are skipped.
  - Posts with "draft: true" are skipped.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "posts"
OUTPUT = POSTS_DIR / "index.json"

FRONT_MATTER = re.compile(r"^﻿?---[ \t]*\n(.*?)\n---[ \t]*\n?(.*)$", re.S)
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DATE_PREFIX = re.compile(r"^\d{4}-\d{2}-\d{2}-")


def parse_value(raw):
    value = raw.strip()
    if value.startswith("[") and value.endswith("]"):
        return [item.strip().strip("\"'") for item in value[1:-1].split(",") if item.strip()]
    value = value.strip("\"'")
    if value.lower() in ("true", "false"):
        return value.lower() == "true"
    return value


def parse_post(text):
    match = FRONT_MATTER.match(text.replace("\r\n", "\n"))
    if not match:
        return None, text
    meta = {}
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip().lower()] = parse_value(value)
    return meta, match.group(2)


def reading_time(body):
    text = re.sub(r"```.*?```", " ", body, flags=re.S)  # skip code blocks
    text = re.sub(r"<[^>]+>", " ", text)                 # skip HTML tags
    words = len(re.findall(r"\w+", text))
    return max(1, round(words / 200))


def main():
    posts, problems = [], []

    for path in sorted(POSTS_DIR.glob("*.md")):
        if path.name.startswith("_"):
            continue

        meta, body = parse_post(path.read_text(encoding="utf-8"))
        if meta is None:
            problems.append(f"{path.name}: missing the --- front matter --- block at the top")
            continue
        if meta.get("draft") is True:
            print(f"skip (draft): {path.name}")
            continue

        title = str(meta.get("title", "")).strip()
        date = str(meta.get("date", "")).strip()
        if not title:
            problems.append(f"{path.name}: 'title' is missing")
        if not DATE.match(date):
            problems.append(f"{path.name}: 'date' must look like 2026-10-20 (got '{date}')")
        if not title or not DATE.match(date):
            continue

        slug = str(meta.get("slug") or DATE_PREFIX.sub("", path.stem)).strip()
        tags = meta.get("tags") or []
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]

        post = {
            "slug": slug,
            "title": title,
            "date": date,
            "summary": str(meta.get("summary", "")).strip(),
            "tags": tags,
            "file": path.name,
            "reading_time": reading_time(body),
        }
        if meta.get("cover"):
            post["cover"] = str(meta["cover"]).strip()
        posts.append(post)
        print(f"added: {path.name}")

    slugs = [p["slug"] for p in posts]
    for slug in sorted({s for s in slugs if slugs.count(s) > 1}):
        problems.append(f"two posts share the same slug '{slug}', rename one of the files")

    if problems:
        print("\nPlease fix these before publishing:")
        for p in problems:
            print("  - " + p)
        sys.exit(1)

    posts.sort(key=lambda p: p["date"], reverse=True)
    OUTPUT.write_text(json.dumps({"posts": posts}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nWrote {OUTPUT.relative_to(ROOT)} with {len(posts)} post(s).")


if __name__ == "__main__":
    main()
