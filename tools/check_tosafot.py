"""Vérifie un fichier JSON de תוספות.

1. Le JSON est valide.
2. La concaténation des segments == source.fullText (mot à mot, ni manque ni ajout).
3. Optionnel (--sefaria FICHIER) : fullText == texte Sefaria normalisé.
4. Chaque segment est rattaché à exactement un nœud de la structure, dans l'ordre.
5. Les sourceIds, tableIds et nodeId référencés existent.
6. Chaque terme (segments[].terms[].he) est une suite de mots du texte du segment,
   et les termes d'un même segment ne se chevauchent pas.
7. Les ids référencés existent : abbreviations[].bySegment, segments[].peopleIds,
   people[].teachers/students/colleagues, segments[].glossaryRefs, synthesis.review[].segmentIds ;
   people[].segmentIds est l'inverse de segments[].peopleIds ; glossary[].id est unique ;
   sources[].quote a une ref.
8. Optionnel (--previous ANCIEN.json) : aucun id de l'ancienne version n'a disparu
   et source.fullText n'a pas changé.

Usage : python tools/check_tosafot.py data/bk56b_tosafot_behahi_hanaa.json
            [--sefaria raw.txt] [--previous ancien.json]
"""
import argparse
import difflib
import json
import re
import sys
import unicodedata

PUNCT = ".,:;()[]-–"
PREFIXES = set("ודהכלבמש")


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", text)
    text = text.replace('"', "\u05f4").replace("'", "\u05f3")
    return re.sub(r"\s+", " ", text).strip()


def tokens(text: str) -> list[str]:
    return normalize(text).split(" ")


def match_words(text: str) -> list[str]:
    """Mots pour la recherche de termes : ponctuation retirée, mots vides ignorés."""
    out = []
    for w in tokens(text):
        w = w.strip(PUNCT)
        if w:
            out.append(w)
    return out


def first_word_ok(word: str, first: str) -> bool:
    """Le premier mot d'un terme peut porter 1 ou 2 lettres préfixes (ו ד ה כ ל ב מ ש)."""
    if word == first:
        return True
    extra = len(word) - len(first)
    return extra in (1, 2) and word.endswith(first) and all(c in PREFIXES for c in word[:extra])


def find_matches(words: list[str], term_words: list[str]) -> list[int]:
    """Positions où la suite term_words commence dans words."""
    n = len(term_words)
    if n == 0:
        return []
    return [i for i in range(len(words) - n + 1)
            if first_word_ok(words[i], term_words[0]) and words[i + 1:i + n] == term_words[1:]]


def check_terms(seg) -> list[str]:
    errs = []
    words = match_words(seg["he"])
    used = set()
    for t in seg.get("terms", []):
        tw = match_words(t["he"])
        pos = find_matches(words, tw)
        if not pos:
            errs.append(f"{seg['id']} : terme introuvable dans le texte « {t['he']} »")
            continue
        free = [i for i in pos if not used & set(range(i, i + len(tw)))]
        if not free:
            errs.append(f"{seg['id']} : le terme « {t['he']} » chevauche un autre terme")
            continue
        used |= set(range(free[0], free[0] + len(tw)))
    return errs


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


def all_ids(data) -> dict[str, set]:
    return {
        "segments": {s["id"] for s in data.get("segments", [])},
        "structure": {n["id"] for n in walk(data.get("structure", []), [])},
        "tables": {t["id"] for t in data.get("tables", [])},
        "sources": {s["id"] for s in data.get("sources", [])},
        "people": {p["id"] for p in data.get("people", [])},
        "glossary": {g["id"] for g in data.get("glossary", []) if "id" in g},
    }


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser()
    p.add_argument("json_file")
    p.add_argument("--sefaria", help="fichier texte brut du תוספות (Sefaria)")
    p.add_argument("--previous", help="version précédente du JSON (ids stables, texte inchangé)")
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
    seg_set = set(seg_ids)
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

    n_err = len(errors)
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
    if len(errors) == n_err:
        print("OK  références (nœuds, sources, tables)")

    # Termes
    n_err = len(errors)
    n_terms = 0
    for s in segs:
        n_terms += len(s.get("terms", []))
        errors += check_terms(s)
    if len(errors) == n_err:
        print(f"OK  termes présents dans le texte, sans chevauchement ({n_terms} termes)")

    # Ids des champs de liens
    n_err = len(errors)
    for a in data.get("abbreviations", []):
        for k in a.get("bySegment", {}):
            if k not in seg_set:
                errors.append(f"abréviation {a['he']} : segment inconnu {k}")
    people = data.get("people", [])
    person_ids = {x["id"] for x in people}
    inverse = {pid: [] for pid in person_ids}
    for s in segs:
        for pid in s.get("peopleIds", []):
            if pid not in person_ids:
                errors.append(f"{s['id']} : personne inconnue {pid}")
            else:
                inverse[pid].append(s["id"])
    for x in people:
        if "segmentIds" in x and x["segmentIds"] != inverse[x["id"]]:
            errors.append(f"personne {x['id']} : segmentIds {x['segmentIds']} ≠ inverse de peopleIds {inverse[x['id']]}")
        for k in ("teachers", "students", "colleagues"):
            for r in x.get(k, []):
                if r not in person_ids:
                    errors.append(f"personne {x['id']} : {k} inconnu {r}")
    gl_ids = [g["id"] for g in data.get("glossary", []) if "id" in g]
    gdup = {x for x in gl_ids if gl_ids.count(x) > 1}
    if gdup:
        errors.append(f"glossary : ids en double {sorted(gdup)}")
    for s in segs:
        for r in s.get("glossaryRefs", []):
            if r not in gl_ids:
                errors.append(f"{s['id']} : glossaire inconnu {r}")
    for i, q in enumerate(data.get("synthesis", {}).get("review", [])):
        for r in q.get("segmentIds", []):
            if r not in seg_set:
                errors.append(f"review[{i}] : segment inconnu {r}")
    for src in data["sources"]:
        if "quote" in src and not src["quote"].get("ref"):
            errors.append(f"source {src['id']} : quote sans ref")
    if len(errors) == n_err:
        print("OK  liens (abréviations, personnes, glossaire, révision, citations)")

    # Version précédente
    if args.previous:
        n_err = len(errors)
        with open(args.previous, encoding="utf-8") as f:
            old = json.load(f)
        new_ids = all_ids(data)
        for kind, ids in all_ids(old).items():
            lost = sorted(ids - new_ids[kind])
            if lost:
                errors.append(f"ids disparus ({kind}) par rapport à la version précédente : {lost}")
        if old["source"]["fullText"] != data["source"]["fullText"]:
            errors.append("source.fullText a changé par rapport à la version précédente")
        if len(errors) == n_err:
            print("OK  ids stables et texte inchangé par rapport à la version précédente")

    if errors:
        print("ÉCHEC")
        print("\n".join(errors))
        sys.exit(1)


if __name__ == "__main__":
    main()
