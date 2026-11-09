#!/usr/bin/env python3
"""Read the Fermenta vault and write site-extras/data.json for the web Home and Map pages.

Usage: build_data.py <vault-folder> <output-json> [public-folder-to-verify-urls]
"""
import json, os, re, sys, yaml

vault, out = sys.argv[1], sys.argv[2]
public = sys.argv[3] if len(sys.argv) > 3 else None
SKIP = {".git", ".obsidian", "Templates", "node_modules"}

def slug_part(s):
    # Mirrors Quartz's slug rules for a path segment
    s = s.replace(" ", "-").replace("&", "-and-").replace("%", "-percent").replace("#", "-sharp").replace("?", "")
    return s

def url_for(rel):
    rel = rel[:-3] if rel.endswith(".md") else rel
    parts = [slug_part(p) for p in rel.split("/")]
    if len(parts) > 1 and parts[-1] == parts[-2]:
        return "/" + "/".join(parts[:-1]) + "/"   # Folder/Folder.md becomes the folder index
    return "/" + "/".join(parts)

def front(path):
    with open(path, encoding="utf-8") as f:
        t = f.read()
    if not t.startswith("---"):
        return None
    end = t.find("\n---", 3)
    if end < 0:
        return None
    try:
        return yaml.safe_load(t[3:end]) or {}
    except Exception:
        return None

def clean(v):
    if isinstance(v, str):
        return re.sub(r"\[\[([^\]|]+)(\|[^\]]+)?\]\]", r"\1", v).strip()
    return v

def lst(v):
    if v is None: return []
    if isinstance(v, list): return [clean(x) for x in v if x is not None]
    return [clean(v)]

recs, bad = [], []
for root, dirs, files in os.walk(vault):
    dirs[:] = [d for d in dirs if d not in SKIP and not d.startswith(".")]
    for fn in files:
        if not fn.endswith(".md"): continue
        p = os.path.join(root, fn)
        rel = os.path.relpath(p, vault).replace(os.sep, "/")
        fm = front(p)
        if not fm or "type" not in fm: continue
        t = fm["type"]
        if t not in ("grape", "region", "style", "producer", "shop", "country", "continent"): continue
        name = fn[:-3]
        r = {"t": t, "n": name, "u": url_for(rel)}
        if t == "grape":
            r.update(c=fm.get("colour"), b=fm.get("body"), a=fm.get("acidity"), tn=fm.get("tannin"),
                     o=clean(fm.get("origin")), f=lst(fm.get("flavours")), r=lst(fm.get("regions")), al=lst(fm.get("aliases")))
        elif t == "region":
            co = fm.get("coordinates")
            if isinstance(co, str) and "," in co:
                try:
                    la, ln = [float(x) for x in co.split(",")[:2]]
                    r["ll"] = [la, ln]
                except ValueError:
                    pass
            r.update(co=fm.get("country"), ct=fm.get("continent"), lv=fm.get("level"), cl=fm.get("climate"), g=[g for g in lst(fm.get("grapes"))][:6])
        elif t == "style":
            r.update(c=fm.get("colour"), cat=fm.get("category"), al=lst(fm.get("aliases")))
        elif t == "producer":
            r.update(co=fm.get("country"), cat=fm.get("category"), g=lst(fm.get("grapes"))[:4])
        elif t == "shop":
            r.update(cat=fm.get("category"), ar=fm.get("area"))
        elif t == "country":
            r.update(co=fm.get("country"), ct=fm.get("continent"))
        r["nc"] = 1 if fm.get("needs-checking") else 0
        r = {k: v for k, v in r.items() if v not in (None, [], "")}
        if public:
            base = r["u"].lstrip("/")
            f = os.path.join(public, base + "index.html") if base.endswith("/") else os.path.join(public, base + ".html")
            if not os.path.exists(f):
                bad.append((r["n"], r["u"]))
        recs.append(r)

recs.sort(key=lambda r: (r["t"], r["n"].lower()))
os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
with open(out, "w", encoding="utf-8") as f:
    json.dump(recs, f, ensure_ascii=False, separators=(",", ":"))
from collections import Counter
print(len(recs), dict(Counter(r["t"] for r in recs)), "bytes", os.path.getsize(out))
if public:
    print("missing pages:", len(bad), bad[:15])
