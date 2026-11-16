"""Vérifie un fichier JSON de תוספות.

1. Le JSON est valide.
2. La concaténation des segments == source.fullText (mot à mot, ni manque ni ajout).
3. Optionnel (--sefaria FICHIER) : fullText == texte Sefaria normalisé.
4. Chaque segment est rattaché à exactement un nœud de la structure, dans l'ordre.
5. Les sourceIds, tableIds et nodeId référencés existent.

Usage : python tools/check_tosafot.py data/bk56b_tosafot_behahi_hanaa.json [--sefaria raw.txt]
"""
import argparse
import difflib
import json
import re
import sys
import unicodedata


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    text = text.replace('"', "\u05f4").replace("'", "\u05f3")
    return re.sub(r"\s+", " ", text).strip()


def tokens(text: str) -> list[str]:
    return normalize(text).split(" ")


def walk(nodes, out):
    for n in nodes:
        out.append(n)
        walk(n.get("children", []), out)
    return out


def word_diff(expected, actual):
    msgs = []
    sm = difflib.SequenceMatcher(a=expected, b=actual, autojunk=False)
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == "equal":
            continue
        ctx = " ".join(expected[max(0, a1 - 3):a1])
        if op in ("delete", "replace"):
            msgs.append(f"  MANQUANT après «{ctx}» : {' '.join(expected[a1:a2])}")
        if op in ("insert", "replace"):
            msgs.append(f"  EN TROP après «{ctx}» : {' '.join(actual[b1:b2])}")
    return msgs


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser()
    p.add_argument("json_file")
    p.add_argument("--sefaria", help="fichier texte brut du תוספות (Sefaria)")
    args = p.parse_args()

    errors = []
    with open(args.json_file, encoding="utf-8") as f:
        data = json.load(f)
    print("OK  JSON valide")

    full = tokens(data["source"]["fullText"])
    segs = data["segments"]
    joined = [t for s in segs for t in tokens(s["he"])]
    if joined == full:
        print(f"OK  segments = texte complet ({len(full)} mots, {len(segs)} segments)")
    else:
        errors.append("Les segments ne reproduisent pas le texte :")
        errors += word_diff(full, joined)

    if args.sefaria:
        with open(args.sefaria, encoding="utf-8") as f:
            raw = tokens(f.read())
        if raw == full:
            print("OK  fullText = texte Sefaria")
        else:
            errors.append("fullText différent du texte Sefaria :")
            errors += word_diff(raw, full)

    nodes = walk(data["structure"], [])
    node_ids = {n["id"] for n in nodes}
    order = [sid for n in nodes for sid in n.get("segmentIds", [])]
    seg_ids = [s["id"] for s in segs]
    dup = {x for x in order if order.count(x) > 1}
    if dup:
        errors.append(f"Segments rattachés à plusieurs nœuds : {sorted(dup)}")
    missing = [x for x in seg_ids if x not in order]
    if missing:
        errors.append(f"Segments absents de la structure : {missing}")
    if not dup and not missing:
        if order == seg_ids:
            print("OK  structure couvre tous les segments, dans l'ordre")
        else:
            errors.append("La structure ne suit pas l'ordre du texte.")

    src_ids = {s["id"] for s in data["sources"]}
    tbl_ids = {t["id"] for t in data["tables"]}
    for s in segs:
        if s["nodeId"] not in node_ids:
            errors.append(f"{s['id']} : nodeId inconnu {s['nodeId']}")
        elif s["id"] not in next(n for n in nodes if n["id"] == s["nodeId"]).get("segmentIds", []):
            errors.append(f"{s['id']} : nodeId {s['nodeId']} ne le contient pas")
        for r in s.get("sourceIds", []):
            if r not in src_ids:
                errors.append(f"{s['id']} : source inconnue {r}")
        for r in s.get("tableIds", []):
            if r not in tbl_ids:
                errors.append(f"{s['id']} : table inconnue {r}")
    for r in data["context"].get("tableIds", []):
        if r not in tbl_ids:
            errors.append(f"context : table inconnue {r}")
    for e in data.get("visualSummary", {}).get("edges", []):
        for k in ("from", "to"):
            if e[k] not in node_ids:
                errors.append(f"edge : nœud inconnu {e[k]}")

    if errors:
        print("ÉCHEC")
        print("\n".join(errors))
        sys.exit(1)
    print("OK  références (nœuds, sources, tables)")


if __name__ == "__main__":
    main()
