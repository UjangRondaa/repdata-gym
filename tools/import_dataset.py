"""Ubah exercises-dataset (hasaneyldrm) menjadi dataset.js untuk RepData.

Sumber: https://github.com/hasaneyldrm/exercises-dataset (data/exercises.json)
Hanya teks yang diambil (nama, alat, otot, langkah bahasa Inggris). Gambar dan
GIF di dataset itu milik Gym visual dan TIDAK termasuk lisensi MIT, jadi tidak
dipakai.

Jalankan dari folder repdata:
    curl -L -o /tmp/exercises.json \
      https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json
    python3 tools/import_dataset.py /tmp/exercises.json
"""
import json
import re
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "dataset.js"

LICENSE = """MIT License

Copyright (c) 2026 Hasan Emir Yıldırım

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation and data files (the "Software"),
to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE."""

# Alat di dataset -> id alat di data.js
EQUIP = {
    "barbell": "barbell", "olympic barbell": "barbell", "trap bar": "barbell",
    "dumbbell": "dumbbell",
    "cable": "kabel",
    "smith machine": "smith",
    "kettlebell": "kettlebell",
    "body weight": "berat-badan",
    "leverage machine": "mesin-lever",
    "band": "band", "resistance band": "band",
    "ez barbell": "ez-bar",
    "stability ball": "bola", "medicine ball": "bola", "bosu ball": "bola",
    "sled machine": "sled",
    "assisted": "bantuan",
    "weighted": "beban-tambahan",
    "rope": "tali",
    "roller": "roller", "wheel roller": "roller",
    "upper body ergometer": "kardio", "skierg machine": "kardio",
    "stationary bike": "kardio", "elliptical machine": "kardio",
    "stepmill machine": "kardio",
    "hammer": "lainnya", "tire": "lainnya",
}


def route(name, eq):
    """Pindahkan gerakan ke alat khusus yang sudah ada di RepData bila jelas."""
    if eq in ("body weight", "weighted") and re.search(r"pull-?ups?|chin-?ups?", name) \
            and "chest dip" not in name and "leg curl" not in name:
        return "pull-up"
    if eq in ("body weight", "weighted") and re.search(r"\bdips?\b", name) \
            and not re.search(r"bench|floor|ring|ball", name):
        return "dip"
    if eq in ("cable", "leverage machine") and "pulldown" in name \
            and not re.search(r"straight arm|standing|bicep curl|cross-over|kneeling", name):
        return "lat-pulldown"
    if eq in ("sled machine", "leverage machine") and "leg press" in name:
        return "leg-press"
    if eq == "leverage machine" and re.search(r"leg extension|leg curl", name):
        return "mesin-kaki"
    return EQUIP[eq]


# Otot di dataset -> kunci MUS di data.js (None = tidak ada di peta otot)
MUSCLE = {
    "abs": "perut", "abdominals": "perut", "core": "perut", "lower abs": "perut",
    "pectorals": "dada", "chest": "dada", "upper chest": "dada", "serratus anterior": "dada",
    "biceps": "bisep", "brachialis": "bisep",
    "triceps": "trisep",
    "delts": "bahu", "shoulders": "bahu", "deltoids": "bahu", "rear deltoids": "bahu",
    "rotator cuff": "bahu",
    "forearms": "lengan", "wrist flexors": "lengan", "wrist extensors": "lengan",
    "grip muscles": "lengan",
    "obliques": "oblik",
    "traps": "trap", "trapezius": "trap", "levator scapulae": "trap",
    "lats": "lats", "latissimus dorsi": "lats",
    "upper back": "upback", "rhomboids": "upback", "back": "upback",
    "spine": "lowback", "lower back": "lowback",
    "glutes": "glutes", "abductors": "glutes",
    "quads": "quads", "quadriceps": "quads",
    "hamstrings": "hams",
    "adductors": "adduktor", "groin": "adduktor", "inner thighs": "adduktor",
    "calves": "betis", "soleus": "betis",
}
# Otot yang tidak punya tempat di peta otot, ditampilkan sebagai teks
EXTRA = {
    "cardiovascular system": "Sistem kardiovaskular",
    "hip flexors": "Fleksor pinggul",
    "ankles": "Pergelangan kaki", "ankle stabilizers": "Pergelangan kaki",
    "feet": "Telapak kaki", "shins": "Tulang kering",
    "wrists": "Pergelangan tangan", "hands": "Tangan",
    "sternocleidomastoid": "Leher",
}
AREA = {
    "upper arms": "Lengan atas", "upper legs": "Paha", "back": "Punggung",
    "waist": "Perut & pinggang", "chest": "Dada", "shoulders": "Bahu",
    "lower legs": "Betis", "lower arms": "Lengan bawah", "cardio": "Kardio",
    "neck": "Leher",
}
UPPER = {"Ez": "EZ", "Pov": "POV", "Trx": "TRX", "Bosu": "BOSU", "V-Bar": "V-Bar"}


def nice_name(s):
    s = s.replace("в°", "°").strip()
    words = []
    for w in s.split():
        w = "-".join(p[:1].upper() + p[1:] for p in w.split("-"))
        if w.startswith("(") and len(w) > 1:
            w = "(" + w[1].upper() + w[2:]
        words.append(UPPER.get(w, w))
    return " ".join(words)


def muscles(x):
    m, extra = {}, []

    def add(raw, lvl):
        raw = raw.strip().lower()
        k = MUSCLE.get(raw)
        if k:
            m[k] = max(m.get(k, 0), lvl)
        elif raw in EXTRA and EXTRA[raw] not in extra:
            extra.append(EXTRA[raw])
        elif raw not in EXTRA:
            raise SystemExit(f"Otot belum dipetakan: {raw!r} (di {x['name']!r})")

    add(x["target"], 3)
    for s in x.get("secondary_muscles") or []:
        add(s, 2)
    return m, extra


def main(src):
    data = json.loads(Path(src).read_text(encoding="utf-8"))
    out = []
    for x in data:
        eq = x["equipment"].strip().lower()
        if eq not in EQUIP:
            raise SystemExit(f"Alat belum dipetakan: {eq!r} (di {x['name']!r})")
        name = x["name"].replace("в°", "°").strip().lower()
        m, extra = muscles(x)
        steps = [s.strip() for s in x["instruction_steps"]["en"] if s.strip()]
        item = {
            "id": "ds-" + x["id"],
            "eq": route(name, eq),
            "n": nice_name(x["name"]),
            "a": AREA.get(x["body_part"], x["body_part"]),
            "m": m,
            "st": steps,
        }
        if extra:
            item["mx"] = extra
        out.append(item)
    out.sort(key=lambda i: i["id"])

    body = ",\n".join(json.dumps(i, ensure_ascii=False, separators=(",", ":")) for i in out)
    header = (
        "/* FILE INI DIBUAT OTOMATIS oleh tools/import_dataset.py. Jangan diedit manual;\n"
        "   ubah skripnya lalu jalankan ulang.\n\n"
        "   Sumber: exercises-dataset, https://github.com/hasaneyldrm/exercises-dataset\n"
        "   Hanya teks (nama, alat, otot, langkah bahasa Inggris). Media Gym visual tidak dipakai.\n\n"
        + "\n".join("   " + l if l else "" for l in LICENSE.splitlines())
        + "\n*/\n"
    )
    OUT.write_text(header + "const DATASET = [\n" + body + "\n];\n", encoding="utf-8")
    per = {}
    for i in out:
        per[i["eq"]] = per.get(i["eq"], 0) + 1
    print(f"{len(out)} gerakan -> {OUT.name}")
    for k, v in sorted(per.items(), key=lambda kv: -kv[1]):
        print(f"  {k:16} {v}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
