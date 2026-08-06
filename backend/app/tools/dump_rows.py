"""One-off diagnostic: print the real row/cell shape of a Winning Form racecard."""

import re
import sys

import httpx
from bs4 import BeautifulSoup

URL = "https://legacy.winningform.co.za/KZN/2S260729_1.htm"
OUT = "row_dump.txt"

HEADER_WORDS = {"horse", "jockey", "trainer", "dr", "wgt", "mass", "no"}


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").replace("\xa0", " ")).strip()


def main() -> None:
    html = httpx.get(URL, timeout=30, follow_redirects=True).text
    soup = BeautifulSoup(html, "lxml")

    lines = [f"URL: {URL}", f"tables_total: {len(soup.find_all('table'))}", ""]

    for t_index, table in enumerate(soup.find_all("table")):
        rows = table.find_all("tr")

        header_row = None
        for r_index, row in enumerate(rows):
            cells = [clean(c.get_text(" ", strip=True)) for c in row.find_all(["td", "th"])]
            lowered = {c.lower().strip(" .") for c in cells}
            if len(lowered & HEADER_WORDS) >= 3:
                header_row = r_index
                break

        if header_row is None:
            continue

        lines.append("=" * 70)
        lines.append(f"TABLE {t_index}  rows={len(rows)}  header_row={header_row}")
        lines.append("=" * 70)

        for offset, row in enumerate(rows[header_row : header_row + 12]):
            tags = row.find_all(["td", "th"])
            cells = [clean(c.get_text(" ", strip=True)) for c in tags]
            lines.append(f"-- row {header_row + offset}  cells={len(cells)}")
            for c_index, cell in enumerate(cells):
                span = f"{tags[c_index].get('colspan', '')}/{tags[c_index].get('rowspan', '')}"
                lines.append(f"   [{c_index}] span={span} {cell[:45]!r}")
            lines.append("")

        break

    text = "\n".join(lines)
    with open(OUT, "w", encoding="utf-8") as handle:
        handle.write(text)

    sys.stdout.write(text[:6000])


if __name__ == "__main__":
    main()