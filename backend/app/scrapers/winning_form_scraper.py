from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import date, datetime
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup

from app.core.config import get_settings
from app.core.logging import get_logger
from app.utils.datetime_utils import parse_date_text

logger = get_logger(__name__)
settings = get_settings()

# e.g. 2S260729_1.htm -> prefix=2, track=S, yymmdd=260729, race=1
RACE_FILE_RE = re.compile(
    r"^(?P<prefix>\d*)(?P<track>[A-Z])(?P<yymmdd>\d{6})_(?P<race>\d{1,2})\.htm$",
    re.IGNORECASE,
)

# Header cell text -> logical column
HEADER_ALIASES = {
    "no": "number",
    "no.": "number",
    "horse": "name",
    "horse name": "name",
    "len beh": "length_behind",
    "speed index": "speed_index",
    "pred time": "predicted_time",
    "pred": "predicted_time",
    "time": "time",
    "merit rated": "merit",
    "mr": "merit",
    "mass": "weight",
    "wgt": "weight",
    "weight": "weight",
    "dr": "draw",
    "draw": "draw",
    "jockey": "jockey",
    "trainer": "trainer",
    "fin": "previous_run",
}

NON_RUNNER_NAMES = {
    "horse",
    "horse name",
    "rns",
    "tot rns",
    "reserve",
    "reserves",
    "scratchings",
    "total",
    "average",
    "field statistics",
}


@dataclass
class ScrapedHorse:
    external_id: str
    name: str
    trainer_name: str | None = None
    jockey_name: str | None = None
    draw_number: int | None = None
    weight_value: float | None = None
    previous_run_rating: float | None = None
    trainer_jockey_win_percent: float | None = None
    speed_index: float | None = None
    predicted_time: float | None = None
    scratched: bool = False
    status: str | None = None
    notes: str | None = None
    odds: str | None = None
    equipment: str | None = None
    pedigree_description: str | None = None
    dob: str | None = None
    silks: str | None = None
    stakes: str | None = None
    sale_price: str | None = None


@dataclass
class ScrapedRace:
    external_id: str
    source_url: str
    venue: str
    meeting_external_id: str
    meeting_date: date | None
    race_number: int
    race_time: datetime | None = None
    distance: str | None = None
    surface: str | None = None
    course: str | None = None
    field_size: int | None = None
    status: str | None = None
    title: str | None = None
    conditions: str | None = None
    course_record: str | None = None
    horses: list[ScrapedHorse] = field(default_factory=list)


class WinningFormScraper:
    def __init__(self) -> None:
        self.client = httpx.AsyncClient(
    timeout=settings.request_timeout_seconds,
    follow_redirects=True,
    verify=False,
    headers={
        "User-Agent": "HorseRacingPredictor/1.0 (+legacy.winningform.co.za reader)"
    },
)

    async def close(self) -> None:
        await self.client.aclose()

    # ------------------------------------------------------------------
    # Discovery
    # ------------------------------------------------------------------

    async def fetch_index(self) -> tuple[str, list[str]]:
        """Return the root HTML (for checksum) plus any frame targets."""
        response = await self.client.get(settings.website_url)
        response.raise_for_status()
        html = response.text

        frames = self._frame_targets(settings.website_url, html)
        logger.info("fetch_index_frames=%s", frames)
        return html, frames

    def _frame_targets(self, page_url: str, html: str) -> list[str]:
        soup = BeautifulSoup(html, "lxml")
        urls: list[str] = []
        for frame in soup.find_all(["frame", "iframe"], src=True):
            src = frame.get("src", "").strip()
            if not src:
                continue
            absolute = urljoin(page_url, src)
            if absolute not in urls:
                urls.append(absolute)
        return urls

    async def scrape_all_race_links(self) -> list[str]:
        """Collect every race-card URL from the index pages.

        legacy.winningform.co.za has no per-meeting page: guide.htm and
        cover.htm both list all races for all current meetings.
        """
        base = f"{settings.website_url}/"
        index_pages = [
            settings.website_url,
            urljoin(base, "guide.htm"),
            urljoin(base, "cover.htm"),
        ]

        # Follow framesets one level deep.
        for page_url in list(index_pages):
            try:
                response = await self.client.get(page_url)
                response.raise_for_status()
            except httpx.HTTPError as exc:
                logger.warning("index_fetch_failed url=%s error=%s", page_url, exc)
                continue
            for frame_url in self._frame_targets(page_url, response.text):
                if frame_url not in index_pages:
                    index_pages.append(frame_url)

        race_urls: list[str] = []

        for page_url in index_pages:
            try:
                response = await self.client.get(page_url)
                response.raise_for_status()
            except httpx.HTTPError as exc:
                logger.warning("index_fetch_failed url=%s error=%s", page_url, exc)
                continue

            html = response.text
            soup = BeautifulSoup(html, "lxml")

            hrefs = [a.get("href", "").strip() for a in soup.find_all("a", href=True)]
            hrefs.extend(
                re.findall(r"""["']([^"']+\.htm(?:\?[^"']*)?)["']""", html, re.IGNORECASE)
            )

            for href in hrefs:
                if not href:
                    continue
                absolute = urljoin(page_url, href.strip()).split("?")[0]
                if not self._is_race_url(absolute):
                    continue
                if absolute not in race_urls:
                    race_urls.append(absolute)

        logger.info("race_links_total=%s", len(race_urls))
        logger.info(
            "meetings_seen=%s",
            sorted({self._meeting_code(url) for url in race_urls}),
        )
        return race_urls

    def _is_race_url(self, url: str) -> bool:
        filename = urlparse(url).path.rsplit("/", 1)[-1]
        return bool(RACE_FILE_RE.match(filename))

    def _meeting_code(self, url: str) -> str:
        parts = [p for p in urlparse(url).path.split("/") if p]
        folder = parts[0].upper() if len(parts) >= 2 else "UNK"
        match = RACE_FILE_RE.match(parts[-1]) if parts else None
        if not match:
            return folder.lower()
        return f"{folder}-{match.group('track')}{match.group('yymmdd')}".lower()

    # ------------------------------------------------------------------
    # Race page
    # ------------------------------------------------------------------

    async def scrape_race_page(
        self,
        url: str,
        meeting_label: str | None = None,
    ) -> ScrapedRace | None:
        response = await self.client.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")
        compact = " ".join(soup.get_text(" ", strip=True).split())

        race_number = self._extract_race_number(url, compact)
        if race_number is None:
            logger.warning("race_number_unparsed url=%s", url)
            return None

        page_venue, page_date = self._extract_venue_and_date(compact)
        venue = page_venue or self._venue_from_label(meeting_label) or self._venue_from_url(url)
        meeting_date = page_date or self._date_from_filename(url)

        header = self._extract_header(compact)
        stated_runners = self._extract_field_size(compact)

        race = ScrapedRace(
            external_id=url.split("/")[-1].replace(".htm", ""),
            source_url=url,
            venue=venue,
            meeting_external_id=self._meeting_code(url),
            meeting_date=meeting_date,
            race_number=race_number,
            race_time=self._extract_race_time(meeting_date, compact),
            distance=header.get("distance"),
            surface=self._extract_surface(compact),
            course=header.get("course"),
            field_size=None,
            status="Open",
            title=header.get("title"),
            conditions=header.get("conditions"),
            course_record=header.get("course_record"),
            horses=[],
        )

        race.horses = self._extract_horses(soup, race.external_id, stated_runners)
        counted = len([h for h in race.horses if not h.scratched])
        race.field_size = stated_runners or (counted or None)

        logger.info(
            "race_parsed url=%s venue=%s date=%s race=%s stated=%s parsed=%s",
            url,
            race.venue,
            race.meeting_date,
            race.race_number,
            stated_runners,
            counted,
        )
        logger.info("horse_names=%s", [h.name for h in race.horses])
        return race

    # ------------------------------------------------------------------
    # Column-driven runner extraction
    # ------------------------------------------------------------------

    def _extract_horses(
        self,
        soup: BeautifulSoup,
        race_external_id: str,
        stated_runners: int | None,
    ) -> list[ScrapedHorse]:
        candidates: list[tuple[dict, list[ScrapedHorse]]] = []
        combo_win_percentages = self._extract_trainer_jockey_combo_win_percentages(soup)
        extended_data = self._extract_extended_horse_data(soup)

        for table in soup.find_all("table"):
            # Wrapper tables flatten every nested cell into one row. Skip them.
            if table.find("table") is not None:
                continue

            rows = table.find_all("tr")
            header_index = None
            col_map: dict[str, int] = {}

            for index, row in enumerate(rows):
                cells = self._row_cells(row)
                if len(cells) < 6:
                    continue

                mapping: dict[str, int] = {}
                for position, cell in enumerate(cells):
                    key = HEADER_ALIASES.get(cell.lower().strip(" ."))
                    if key and key not in mapping:
                        mapping[key] = position

                if "name" in mapping and len(mapping) >= 4:
                    header_index = index
                    col_map = mapping
                    break

            if header_index is None:
                continue

            horses = self._rows_to_horses(
                rows[header_index + 1 :],
                col_map,
                race_external_id,
                stated_runners,
                combo_win_percentages,
                extended_data,
            )
            if horses:
                candidates.append((col_map, horses))

        if not candidates:
            logger.warning("no_runner_table_found race=%s", race_external_id)
            return []

        if stated_runners:
            col_map, horses = min(
                candidates,
                key=lambda item: abs(len(item[1]) - stated_runners),
            )
        else:
            col_map, horses = max(candidates, key=lambda item: len(item[1]))

        logger.info(
            "runner_table_used columns=%s extracted=%s stated=%s",
            col_map,
            len(horses),
            stated_runners,
        )
        return horses

    def _rows_to_horses(
        self,
        rows,
        col_map: dict[str, int],
        race_external_id: str,
        stated_runners: int | None = None,
        combo_win_percentages: dict[int, float] | None = None,
        extended_data: dict[str, dict] | None = None,
    ) -> list[ScrapedHorse]:
        horses: list[ScrapedHorse] = []
        seen: set[str] = set()
        name_col = col_map["name"]
        limit = stated_runners or 30

        for row in rows:
            if len(horses) >= limit:
                break

            cells = self._row_cells(row)
            if len(cells) <= name_col:
                continue

            raw_name = cells[name_col]
            if not self._is_runner_name(raw_name):
                continue

            key = raw_name.lower()
            if key in seen:
                continue
            seen.add(key)

            joined = " | ".join(cells)
            scratched = bool(
                re.search(r"\bscr(?:atch(?:ed|ing)?)?\b", joined, re.IGNORECASE)
            )

            previous_run_cell = self._cell(cells, col_map.get("previous_run"))
            runner_number = self._as_int(self._cell(cells, col_map.get("number")), 1, 30)
            speed_index = self._as_float(
                self._cell(cells, col_map.get("speed_index")), 0, 200
            )
            predicted_time = self._as_float(
                self._cell(cells, col_map.get("predicted_time")), 0, 300
            )

            ext = extended_data.get(self._pretty_name(raw_name).lower(), {}) if extended_data else {}

            horses.append(
                ScrapedHorse(
                    external_id=f"{race_external_id}-{len(horses) + 1}",
                    name=self._pretty_name(raw_name),
                    trainer_name=self._cell(cells, col_map.get("trainer")),
                    jockey_name=self._cell(cells, col_map.get("jockey")),
                    draw_number=self._as_int(
                        self._cell(cells, col_map.get("draw")), 1, 24
                    ),
                    weight_value=self._as_float(
                        self._cell(cells, col_map.get("weight")), 40, 70
                    ),
                    previous_run_rating=self._as_float(previous_run_cell, 0, 30),
                    trainer_jockey_win_percent=(
                        combo_win_percentages.get(runner_number)
                        if combo_win_percentages and runner_number is not None
                        else None
                    ),
                    speed_index=speed_index,
                    predicted_time=predicted_time,
                    scratched=scratched,
                    status="Scratched" if scratched else "Active",
                    notes=(
                        "Read from the legacy.winningform.co.za predicted-finish "
                        "and trainer/jockey combination tables. Missing values are "
                        "left empty rather than estimated."
                    ),
                    odds=ext.get("odds"),
                    equipment=ext.get("equipment"),
                    pedigree_description=ext.get("pedigree_description"),
                    dob=ext.get("dob"),
                    silks=ext.get("silks"),
                    stakes=ext.get("stakes"),
                    sale_price=ext.get("sale_price"),
                )
            )

        return horses

    def _extract_extended_horse_data(self, soup: BeautifulSoup) -> dict[str, dict]:
        horses = {}
        for div_b4 in soup.find_all("div", class_="b4"):
            try:
                td_container = div_b4.parent
                if td_container.name != "td":
                    continue
                div_b1_odds = td_container.find("div", class_="b1")
                odds = div_b1_odds.get_text(strip=True) if div_b1_odds else None
                
                next_td = td_container.find_next_sibling("td")
                if not next_td:
                    continue
                name_td = next_td.find("td", class_="b1")
                if not name_td:
                    continue
                name = self._pretty_name(name_td.get_text(strip=True))
                
                eq_td = name_td.find_next_sibling("td")
                equipment = eq_td.get_text(strip=True) if eq_td else None
                
                dob_td = next_td.find(string=re.compile(r"dob:"))
                pedigree_desc = None
                dob = None
                if dob_td:
                    dob = dob_td.strip().replace("dob:", "").strip()
                    ped_td = dob_td.parent.find_previous_sibling("td")
                    if ped_td:
                        pedigree_desc = ped_td.get_text(strip=True)
                
                parent_tr = td_container.parent
                next_tr = parent_tr.find_next_sibling("tr")
                silks = None
                if next_tr:
                    small_td = next_tr.find("td", id="small")
                    if small_td:
                        text_nodes = list(small_td.stripped_strings)
                        if text_nodes:
                            silks = text_nodes[-1]
                
                stakes = None
                sale_price = None
                if next_tr:
                    for bld_td in next_tr.find_all("td"):
                        text = bld_td.get_text(strip=True)
                        if text.startswith("Stakes:"):
                            stakes_val_td = bld_td.find_next_sibling("td")
                            if stakes_val_td:
                                stakes = stakes_val_td.get_text(strip=True)
                        elif text.startswith("SalePrc:"):
                            sale_val_td = bld_td.find_next_sibling("td")
                            if sale_val_td:
                                sale_price = sale_val_td.get_text(strip=True)
                
                horses[name.lower()] = {
                    "odds": odds,
                    "equipment": equipment,
                    "pedigree_description": pedigree_desc,
                    "dob": dob,
                    "silks": silks,
                    "stakes": stakes,
                    "sale_price": sale_price
                }
            except Exception as e:
                logger.warning("Error parsing extended horse block: %s", e)
                continue
        return horses

    def _extract_trainer_jockey_combo_win_percentages(
        self, soup: BeautifulSoup
    ) -> dict[int, float]:
        compact = " ".join(soup.get_text(" ", strip=True).split())
        if "Trainer/Jockey Combinations" not in compact:
            return {}

        result: dict[int, float] = {}
        pattern = re.compile(
            r"(?P<number>\d{1,2})\s+"
            r"(?P<trainer>[A-Za-z][A-Za-z' .-]{0,30})\s+"
            r"(?P<jockey>(?:SCRATCHED|[A-Za-z][A-Za-z' .-]{0,30}))\s+"
            r"(?P<runs>\d{1,3})\s+"
            r"(?P<first>\d{1,3})\s+"
            r"(?P<second>\d{1,3})\s+"
            r"(?P<third>\d{1,3})\s+"
            r"(?P<win>\d{1,3})\s+"
            r"(?P<place>\d{1,3})(?=\s+\d{1,2}\s+[A-Za-z]|\s*$)",
            re.IGNORECASE,
        )

        section = compact.split("Trainer/Jockey Combinations", 1)[1]
        section = section.split("CUMULATIVE", 1)[0]
        for match in pattern.finditer(section):
            runner_number = int(match.group("number"))
            win_percent = float(match.group("win"))
            if 0 <= win_percent <= 100:
                result[runner_number] = win_percent

        return result

    def _pretty_name(self, value: str) -> str:
        text = self._clean_text(value).lower()
        return re.sub(
            r"(^|[\s\-(])([a-z])",
            lambda match: match.group(1) + match.group(2).upper(),
            text,
        )
    
    def _row_cells(self, row) -> list[str]:
        return [
            self._clean_text(cell.get_text(" ", strip=True))
            for cell in row.find_all(["td", "th"])
        ]

    def _cell(self, cells: list[str], position: int | None) -> str | None:
        if position is None or position >= len(cells):
            return None
        value = cells[position].strip()
        return value or None

    def _as_int(self, value: str | None, low: int, high: int) -> int | None:
        if not value:
            return None
        match = re.search(r"\d{1,2}", value)
        if not match:
            return None
        number = int(match.group(0))
        return number if low <= number <= high else None

    def _as_float(self, value: str | None, low: float, high: float) -> float | None:
        if not value:
            return None
        match = re.search(r"\d{1,3}(?:\.\d+)?", value)
        if not match:
            return None
        number = float(match.group(0))
        return number if low <= number <= high else None

    def _is_runner_name(self, value: str | None) -> bool:
        if not value:
            return False

        candidate = self._clean_text(value)

        if len(candidate) < 3 or len(candidate) > 40:
            return False

        if candidate.lower() in NON_RUNNER_NAMES:
            return False

        if not re.search(r"[A-Za-z]{3}", candidate):
            return False

        # Reject pedigree lines like "2 Y.O. B F." and stat rows
        if re.search(r"\b\d\s*Y\.?O\.?\b", candidate, re.IGNORECASE):
            return False

        if re.match(r"^R\s?\d", candidate, re.IGNORECASE):
            return False

        if candidate.startswith("*"):
            return False

        return True

    # ------------------------------------------------------------------
    # Header / metadata
    # ------------------------------------------------------------------

    def _extract_venue_and_date(self, compact: str) -> tuple[str | None, date | None]:
        match = re.search(
            r"([A-Z][A-Za-z'\-]*(?:\s+[A-Z][A-Za-z'\-]*){0,4})\s+(\d{2}/\d{2}/\d{4})",
            compact,
        )
        if not match:
            return None, None

        venue = self._clean_text(match.group(1))
        words = venue.split()
        if len(words) > 5:
            venue = " ".join(words[-5:])

        parsed = parse_date_text(match.group(2))
        return (venue or None), parsed

    def _extract_header(self, compact: str) -> dict:
        result: dict[str, str | None] = {
            "title": None,
            "distance": None,
            "course": None,
            "conditions": None,
            "course_record": None,
        }

        match = re.search(
            r"([A-Z][A-Za-z0-9''&.\-\s]{4,80}?)\s+(\d{3,4})\s*Metres(?:\s*\(([A-Z])\))?",
            compact,
        )
        if match:
            title = self._clean_text(match.group(1))
            title = re.sub(r"^(?:\d{1,2}\.\d{2}|\d+)\s*", "", title).strip()
            result["title"] = title or None
            result["distance"] = f"{match.group(2)} Metres"
            result["course"] = match.group(3)
        else:
            fallback = re.search(r"\b(\d{3,4})\s*Metres\b", compact, re.IGNORECASE)
            if fallback:
                result["distance"] = f"{fallback.group(1)} Metres"

        parts: list[str] = []

        race_class = re.search(
            r"\b((?:Maiden|Graduation|Novice|Progress|Juvenile|Handicap|Classified|"
            r"Claiming|Conditions|Assessment)[A-Za-z\s]{0,40}?"
            r"(?:Plate|Handicap|Stakes|Cup|Race))\b",
            compact,
        )
        if race_class:
            parts.append(self._clean_text(race_class.group(1)))

        allowance = re.search(
            r"\b((?:Apprentice|Jockey)[^.(]{0,70}?may be claimed)",
            compact,
            re.IGNORECASE,
        )
        if allowance:
            parts.append(self._clean_text(allowance.group(1)))

        if parts:
            result["conditions"] = " · ".join(dict.fromkeys(parts))

        record = re.search(r"Course Record\s*:\s*([^)]+)\)", compact, re.IGNORECASE)
        if record:
            result["course_record"] = self._clean_text(record.group(1))

        if not result["title"]:
            result["title"] = result["conditions"]

        return result

    def _extract_field_size(self, compact: str) -> int | None:
        match = re.search(r"\b(\d{1,2})\s*Runners?\b", compact, re.IGNORECASE)
        if match:
            value = int(match.group(1))
            if 1 <= value <= 30:
                return value
        return None

    def _extract_race_number(self, url: str, compact: str) -> int | None:
        filename = urlparse(url).path.rsplit("/", 1)[-1]
        match = RACE_FILE_RE.match(filename)
        if match:
            return int(match.group("race"))

        match = re.search(r"\brace\s*(\d{1,2})\b", compact, re.IGNORECASE)
        return int(match.group(1)) if match else None

    def _date_from_filename(self, url: str) -> date | None:
        filename = urlparse(url).path.rsplit("/", 1)[-1]
        match = RACE_FILE_RE.match(filename)
        if not match:
            return None
        raw = match.group("yymmdd")
        try:
            return date(2000 + int(raw[0:2]), int(raw[2:4]), int(raw[4:6]))
        except ValueError:
            return None

    def _extract_race_time(self, meeting_date: date | None, compact: str) -> datetime | None:
        if not meeting_date:
            return None
        match = re.search(r"\b([01]?\d|2[0-3])\.([0-5]\d)\b", compact)
        if not match:
            return None
        return datetime.combine(meeting_date, datetime.min.time()).replace(
            hour=int(match.group(1)),
            minute=int(match.group(2)),
        )

    def _extract_surface(self, compact: str) -> str | None:
        if re.search(r"\bturf\b", compact, re.IGNORECASE):
            return "Turf"
        if re.search(r"\bpoly(?:track)?\b", compact, re.IGNORECASE):
            return "Polytrack"
        if re.search(r"\bsand\b", compact, re.IGNORECASE):
            return "Sand"
        return None

    def _venue_from_label(self, label: str | None) -> str | None:
        if not label:
            return None
        cleaned = re.sub(
            r"\s*\d{1,2}/\d{1,2}(?:/\d{2,4})?\s*$", "", self._clean_text(label)
        ).strip()
        noise = ("no-frames", "race ", "indexes", "guide", "best bets", "how to read")
        if any(term in cleaned.lower() for term in noise):
            return None
        return cleaned if 3 <= len(cleaned) <= 60 else None

    def _venue_from_url(self, url: str) -> str:
        parts = [p for p in urlparse(url).path.split("/") if p]
        code = parts[0].upper() if parts else "UNK"
        return f"{code} (venue unconfirmed)"

    def _clean_text(self, value: str) -> str:
        value = (value or "").replace("\xa0", " ")
        return re.sub(r"\s+", " ", value).strip()
