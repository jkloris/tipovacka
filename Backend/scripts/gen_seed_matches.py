import csv
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
csv_path = ROOT / "Client" / "fifa-world-cup-2026-UTC.csv"
out_path = Path(__file__).resolve().parents[1] / "app" / "seed_matches.py"

rows = []
with csv_path.open(encoding="utf-8-sig", newline="") as f:
    for row in csv.DictReader(f):
        n = int(row["Match Number"].strip())
        home = row["Home Team"].strip().replace("\\", "\\\\").replace('"', '\\"')
        away = row["Away Team"].strip().replace("\\", "\\\\").replace('"', '\\"')
        dt = datetime.strptime(row["Date"].strip(), "%d/%m/%Y %H:%M")
        rows.append((n, home, away, dt))
rows.sort(key=lambda r: r[0])

lines = [
    "from datetime import datetime",
    "",
    "# FIFA World Cup 2026 schedule (UTC). Generated once; edit here to change fixtures.",
    "MATCH_SEEDS: list[tuple[int, str, str, datetime]] = [",
]
for n, home, away, dt in rows:
    lines.append(
        f'    ({n}, "{home}", "{away}", datetime({dt.year}, {dt.month}, {dt.day}, {dt.hour}, {dt.minute})),'
    )
lines.append("]")
out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"wrote {len(rows)} matches to {out_path}")
