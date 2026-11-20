"""Fail if a relative markdown link points to a file that does not exist."""
import pathlib
import re
import sys

bad = []
for p in pathlib.Path(".").rglob("*.md"):
    if ".git" in p.parts:
        continue
    text = p.read_text(encoding="utf-8", errors="ignore")
    for m in re.finditer(r"\]\(([^)#\s]+)", text):
        target = m.group(1)
        if target.startswith(("http", "mailto:")):
            continue
        if not (p.parent / target).exists():
            bad.append(f"{p}: {target}")

print("\n".join(bad))
sys.exit(1 if bad else 0)
