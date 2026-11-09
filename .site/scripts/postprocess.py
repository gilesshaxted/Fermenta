#!/usr/bin/env python3
"""Two small clean-ups around the Quartz build.
  postprocess.py prep <content-dir>   before the build: drop embeds the website cannot draw
  postprocess.py html <public-dir>    after the build: add the Fermenta top bar and mark planned pages
Neither touches the vault itself, only the temporary copy used to build the site."""
import os, re, sys, posixpath

def prep(content):
    embed = re.compile(r'^!\[\[(?:[^\]]*#(?:World )?Map|Hub Wines\.base|Region Map\.base)\]\]\s*$')
    heading = re.compile(r'^#{1,6}\s')
    n = 0
    for root, _, files in os.walk(content):
        for f in files:
            if not f.endswith(".md"):
                continue
            p = os.path.join(root, f)
            lines = open(p, encoding="utf-8").read().split("\n")
            out, changed = [], False
            for ln in lines:
                if embed.match(ln.strip()):
                    changed = True
                    # also drop the heading directly above it, if the section is now empty
                    j = len(out) - 1
                    while j >= 0 and not out[j].strip():
                        j -= 1
                    if j >= 0 and heading.match(out[j]):
                        out = out[:j]
                    continue
                out.append(ln)
            if changed:
                open(p, "w", encoding="utf-8").write("\n".join(out).rstrip("\n") + "\n")
                n += 1
    print("prep: cleaned %d notes" % n)

A_TAG = re.compile(r'<a href="([^"]+)" class="([^"]*\binternal\b[^"]*)"([^>]*)>(.*?)</a>', re.S)

def page_dir(rel):
    # directory a page's relative links are resolved against
    if rel.endswith("/index.html"):
        return posixpath.dirname(rel)
    return posixpath.dirname(rel)

def html(public):
    exists = set()
    for root, _, files in os.walk(public):
        for f in files:
            exists.add(os.path.relpath(os.path.join(root, f), public).replace(os.sep, "/"))
    def found(p):
        p = p.strip("/")
        return p == "" or p in exists or (p + ".html") in exists or (p + "/index.html") in exists
    planned = injected = 0
    for rel in sorted(exists):
        if not rel.endswith(".html") or rel in ("index.html", "404.html"):
            continue
        fp = os.path.join(public, rel)
        s = open(fp, encoding="utf-8").read()
        if "quartz-root" not in s:
            continue   # redirect stubs and the like
        here = posixpath.dirname(rel)
        # a page "a/b.html" is served at "a/b", so its links resolve from "a"; "a/b/index.html" is served at "a/b/"
        base = here if not rel.endswith("/index.html") and rel != "index.html" else here
        if rel.endswith("/index.html"):
            base = here
        def fix(m):
            nonlocal planned
            href, cls, rest, inner = m.groups()
            if "tag-link" in cls or "://" in href or href.startswith(("#", "mailto:")):
                return m.group(0)
            target = href.split("#")[0].split("?")[0]
            if not target:
                return m.group(0)
            if found(posixpath.normpath(posixpath.join(base, target))):
                return m.group(0)
            planned += 1
            return '<span class="fm-planned" title="Not written yet. This page is planned, and you can help write it.">%s</span>' % inner
        s2 = A_TAG.sub(fix, s)
        depth = rel.count("/")
        up = "../" * depth
        tag = '<link rel="stylesheet" href="%sfermenta-nav.css"/><script src="%scommon.js" defer></script></head>' % (up, up)
        if "fermenta-nav.css" not in s2:
            s2 = s2.replace("</head>", tag, 1)
            injected += 1
        if s2 != s:
            open(fp, "w", encoding="utf-8").write(s2)
    print("html: top bar added to %d pages, %d unwritten links marked as planned" % (injected, planned))

if __name__ == "__main__":
    {"prep": prep, "html": html}[sys.argv[1]](sys.argv[2])
