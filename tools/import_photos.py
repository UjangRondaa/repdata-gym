"""Cocokkan gerakan RepData dengan foto dari free-exercise-db, lalu tulis photos.js.

Sumber: https://github.com/yuhonas/free-exercise-db (Unlicense / domain publik)
Fotonya tidak disalin ke repo ini. Halaman memuatnya lewat jsDelivr dari commit
yang dikunci (COMMIT di bawah), jadi isinya tidak bisa berubah diam-diam.

Pencocokan sengaja ketat: nama harus sama persis setelah dinormalisasi (urutan
kata, jamak, tanda baca diabaikan) DAN jenis alatnya harus sama. Lebih baik
tanpa foto daripada foto gerakan yang salah. Gerakan buatan sendiri di data.js
yang namanya berbeda dicocokkan lewat MANUAL, yang sudah dicek fotonya satu per satu.

Jalankan dari folder repdata, setelah tools/import_dataset.py:
    curl -L -o /tmp/fedb.json \
      https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json
    python3 tools/import_photos.py /tmp/fedb.json
Kalau mengganti COMMIT, pakai commit yang sama dengan file JSON yang diunduh.
"""
import collections
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "photos.js"
COMMIT = "f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5"
BASE = f"https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@{COMMIT}/exercises/"

# Gerakan data.js -> nama di free-exercise-db (sudah dicek visual)
MANUAL = {
    "bb-back-squat": "Barbell Squat",
    "bb-deadlift": "Barbell Deadlift",
    "bb-bench": "Barbell Bench Press - Medium Grip",
    "bb-ohp": "Standing Military Press",
    "db-lateral-raise": "Side Lateral Raise",
    "db-oh-triceps": "Standing Dumbbell Triceps Extension",
    "cb-fly": "Cable Crossover",
    "cb-kickback": "One-Legged Cable Kickback",
    "cb-woodchop": "Standing Cable Wood Chop",
    "lat-wide": "Wide-Grip Lat Pulldown",
    "lat-close": "V-Bar Pulldown",
    "lat-reverse": "Underhand Cable Pulldowns",
    "lat-single": "One Arm Lat Pulldown",
    "lp-standard": "Leg Press",
    "lp-low-narrow": "Narrow Stance Leg Press",
    "sm-incline": "Smith Machine Incline Bench Press",
    "sm-split": "Smith Single-Leg Split Squat",
    "sm-inverted-row": "Inverted Row",
    "kb-tgu": "Kettlebell Turkish Get-Up (Lunge style)",
    "kb-clean": "One-Arm Kettlebell Clean",
    "pu-pullup": "Pullups",
    "dip-chest": "Dips - Chest Version",
    "dip-triceps": "Dips - Triceps Version",
}
# Pasangan otomatis yang ternyata salah (id RepData)
SKIP = {
    "lp-calf",  # foto: mesin calf press duduk, bukan di leg press
}

FILLER = {"with", "the", "on", "a"}
# Kata alat yang boleh diabaikan, HANYA bila memang alat gerakan itu sendiri.
# ("Rack Pull with Bands" pada barbell tetap berbeda dari "Rack Pull".)
KIND_WORDS = {"barbell": {"barbell"}, "dumbbell": {"dumbbell"}, "cable": {"cable"},
              "smith": {"smith", "machine"}, "machine": {"machine", "lever", "leverage"},
              "kettlebell": {"kettlebell"}, "band": {"band", "resistance"}, "ez": {"ez", "bar", "barbell"},
              "ball": {"ball", "exercise", "stability"}, "roller": {"roller", "foam", "roll"},
              "body": {"bodyweight", "body", "only"}}


def tokens(name, kind):
    drop = FILLER | KIND_WORDS.get(kind, set())
    s = name.lower().replace("°", "").replace("¾", "3/4").replace("e-z", "ez")
    s = re.sub(r"\((male|female|back pov|side pov)\)", "", s)
    s = re.sub(r"\bv\.\s*\d+\b", "", s)
    for a, b in (("pullup", "pull up"), ("chinup", "chin up"), ("situp", "sit up"), ("pushup", "push up")):
        s = s.replace(a, b)
    s = re.sub(r"[^a-z0-9/ ]", " ", s)
    out = set()
    for w in s.split():
        if len(w) > 3 and w.endswith("es") and w[:-2].endswith(("ss", "sh", "ch", "x")):
            w = w[:-2]
        elif len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
            w = w[:-1]
        if w not in drop:
            out.add(w)
    return frozenset(out)


def fe_kind(x):
    if "smith" in x["name"].lower():
        return "smith"
    return {"barbell": "barbell", "dumbbell": "dumbbell", "cable": "cable", "machine": "machine",
            "kettlebells": "kettlebell", "bands": "band", "e-z curl bar": "ez",
            "medicine ball": "ball", "exercise ball": "ball", "foam roll": "roller"}.get(x.get("equipment"), "body")


RD_KIND = {"barbell": {"barbell"}, "dumbbell": {"dumbbell"}, "kabel": {"cable"}, "smith": {"smith"},
           "kettlebell": {"kettlebell"}, "mesin-lever": {"machine"}, "leg-press": {"machine"},
           "sled": {"machine"}, "mesin-kaki": {"machine"}, "lat-pulldown": {"cable", "machine"},
           "band": {"band"}, "ez-bar": {"ez"}, "bola": {"ball"}, "roller": {"roller"}}


def repdata_moves():
    """(id, nama, id alat) dari data.js dan dataset.js."""
    moves = []
    eq = None
    for line in (ROOT / "data.js").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\{id:'([^']+)',n:'[^']*',icon:", line)
        if m:
            eq = m.group(1)
            continue
        m = re.match(r"\s+\{id:'([^']+)',n:'((?:[^'\\]|\\.)*)',s:", line)
        if m and eq:
            moves.append((m.group(1), m.group(2).replace("\\'", "'"), eq))
    src = (ROOT / "dataset.js").read_text(encoding="utf-8")
    for line in src.split("const DATASET = [\n")[1].split("\n];")[0].splitlines():
        d = json.loads(line.rstrip(","))
        moves.append((d["id"], d["n"], d["eq"]))
    return moves


def main(src):
    fe = [x for x in json.loads(Path(src).read_text(encoding="utf-8")) if x.get("images")]
    by_name = {x["name"]: x for x in fe}
    index = collections.defaultdict(list)
    for x in fe:
        k = fe_kind(x)
        index[(tokens(x["name"], k), k)].append(x)

    photos = {}
    for mid, name, eq in repdata_moves():
        if mid in SKIP:
            continue
        if mid in MANUAL:
            photos[mid] = by_name[MANUAL[mid]]["id"]
            continue
        for kind in RD_KIND.get(eq, {"body"}):
            t = tokens(name, kind)
            if t and (t, kind) in index:
                photos[mid] = index[(t, kind)][0]["id"]
                break
    for x in fe:  # semua entri memakai pola <folder>/0.jpg dan <folder>/1.jpg
        assert x["images"] == [x["id"] + "/0.jpg", x["id"] + "/1.jpg"], x["id"]

    body = json.dumps(dict(sorted(photos.items())), ensure_ascii=False, indent=0)
    OUT.write_text(
        "/* FILE INI DIBUAT OTOMATIS oleh tools/import_photos.py. Jangan diedit manual.\n"
        "   Foto: free-exercise-db, https://github.com/yuhonas/free-exercise-db (Unlicense).\n"
        "   Nilai = nama folder; fotonya <PHOTO_BASE><folder>/0.jpg dan /1.jpg. */\n"
        f"const PHOTO_BASE = '{BASE}';\n"
        f"const PHOTOS = {body};\n",
        encoding="utf-8",
    )
    cur = sum(1 for k in photos if not k.startswith("ds-"))
    print(f"{len(photos)} gerakan punya foto ({cur} dari data.js, {len(photos) - cur} dari dataset) -> {OUT.name}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
