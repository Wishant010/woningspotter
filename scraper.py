#!/usr/bin/env python3
import csv
import json
import re
import time
from dataclasses import dataclass, asdict
from typing import List, Dict

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.common.exceptions import (
    WebDriverException,
    NoSuchElementException,
    TimeoutException,
)
from bs4 import BeautifulSoup


@dataclass
class Woning:
    titel: str
    prijs: str
    adres: str
    postcode: str
    plaats: str
    oppervlakte: str
    kamers: str
    url: str
    platform: str


class SeleniumScraper:
    def __init__(self, headless: bool = True) -> None:
        self.headless = headless
        self.driver: webdriver.Chrome | None = None
        self.woningen: List[Woning] = []
        self._pararius_cookies_geaccepteerd = False

    # -------------- browser --------------

    def start_browser(self) -> None:
        print("Browser starten...")
        options = Options()
        if self.headless:
            options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--window-size=1200,900")

        self.driver = webdriver.Chrome(options=options)
        print("Browser gestart!\n")

    def stop_browser(self) -> None:
        if self.driver is not None:
            self.driver.quit()
            self.driver = None
            print("Browser gestopt")

    def _load_url(self, url: str, beschrijving: str = "") -> str:
        """
        Veilig een URL laden en HTML teruggeven.
        """
        assert self.driver is not None, "Driver niet gestart"

        try:
            self.driver.get(url)
            time.sleep(2)  # simpele wacht, kan evt. met WebDriverWait
            html = self.driver.page_source
            if beschrijving:
                print(f"   Pagina geladen ({beschrijving}), {len(html)} karakters")
            return html
        except WebDriverException as e:
            print(f"   FOUT bij laden van {beschrijving or url}: {e}")
            return ""

    # -------------- helpers --------------

    @staticmethod
    def _zoek_eerste(patronen: List[str], text: str) -> str:
        for pat in patronen:
            m = re.search(pat, text, flags=re.IGNORECASE)
            if m:
                return m.group(1).strip()
        return ""

    @staticmethod
    def _normaliseer_spaties(s: str) -> str:
        return re.sub(r"\s+", " ", s).strip()

    # -------------- FUNDA --------------

    def scrape_funda(self, plaats: str, paginas: int) -> None:
        print(f"=== Scraping Funda voor {plaats} ===\n")
        base = "https://www.funda.nl"

        for page in range(1, paginas + 1):
            url = (
                f"{base}/zoeken/koop/?selected_area=%5B%22{plaats}%22%5D"
                f"&search_result={page}"
            )
            print(f"   Pagina {page}: {url}")
            html = self._load_url(url, beschrijving=f"Funda lijst {page}")
            if not html:
                continue

            # zoek alle detail-links
            # voorbeeld in jouw CSV: /detail/koop/amsterdam/appartement-.../89508413/
            detail_links = sorted(
                set(
                    re.findall(
                        r'href="(/detail/koop/[^"]+)"',
                        html,
                        flags=re.IGNORECASE,
                    )
                )
            )
            print(f"   >>> {len(detail_links)} detail-links gevonden op pagina {page}")

            count_ok = 0
            for href in detail_links:
                detail_url = base + href
                w = self._scrape_funda_detail(detail_url)
                if w:
                    self.woningen.append(w)
                    count_ok += 1

            print(f"   >>> {count_ok} woningen verzameld van pagina {page}\n")

        print(f"   TOTAAL Funda: {sum(1 for w in self.woningen if w.platform == 'Funda')} woningen\n")

    def _scrape_funda_detail(self, url: str) -> Woning | None:
        html = self._load_url(url, beschrijving="Funda detail")
        if not html:
            return None

        soup = BeautifulSoup(html, "html.parser")

        # Titel / adres / plaats / postcode
        h1 = soup.find("h1")
        titel = h1.get_text(strip=True) if h1 else ""
        titel = self._normaliseer_spaties(titel)

        # Vaak staat adres + postcode/plaats bij/onder de titel
        full_text = soup.get_text(" ", strip=True)
        # Postcode + plaats, bv. "1083 HH Amsterdam"
        postcode = self._zoek_eerste(
            [r"\b(\d{4}\s?[A-Z]{2})\b"], full_text
        )
        plaats = ""
        if postcode:
            # neem wat woorden ná de postcode als plaats
            m = re.search(
                r"\b" + re.escape(postcode) + r"\b\s+([A-Za-zÀ-ÖØ-öø-ÿ\-\s]+)",
                full_text,
            )
            if m:
                plaats = m.group(1).split()[0]  # eerste woord na postcode

        # prijs: eerste "€ xxx" met optioneel k.k./v.o.n.
        prijs = self._zoek_eerste(
            [r"(€\s*[\d\.\,]+\s*(?:k\.k\.|v\.o\.n\.)?)"], full_text
        )

        # Opp (m²) en kamers
        opp = self._zoek_eerste(
            [
                r"(\d+)\s*m²",  # meest voorkomend
            ],
            full_text,
        )
        if opp:
            opp = f"{opp} m2"

        kamers = self._zoek_eerste(
            [
                r"Aantal kamers\s*:?\s*(\d+)",
                r"(\d+)\s+kamers\b",
            ],
            full_text,
        )
        if kamers:
            kamers = f"{kamers} kamers"

        # adres – als we minstens postcode hebben, bouw iets.
        if postcode and plaats:
            adres = f"{titel}, {postcode} {plaats}"
        else:
            adres = titel

        return Woning(
            titel=titel or adres or url,
            prijs=prijs,
            adres=adres,
            postcode=postcode,
            plaats=plaats,
            oppervlakte=opp,
            kamers=kamers,
            url=url,
            platform="Funda",
        )

    # -------------- PARARIUS --------------

    def scrape_pararius(self, plaats: str, paginas: int) -> None:
        print(f"=== Scraping Pararius voor {plaats} ===")

        base = "https://www.pararius.nl"
        plaats_url = plaats.lower().replace(" ", "-")

        for page in range(1, paginas + 1):
            url = f"{base}/koopwoningen/{plaats_url}?page={page}"
            print(f"   Pagina {page}... ({url})")

            html = self._load_url(url, beschrijving=f"Pararius lijst {page}")
            if not html:
                continue

            # cookies 1x accepteren
            if not self._pararius_cookies_geaccepteerd and self.driver:
                try:
                    btn = self.driver.find_element(By.ID, "onetrust-accept-btn-handler")
                    btn.click()
                    time.sleep(1)
                    self._pararius_cookies_geaccepteerd = True
                    print("   Cookies geaccepteerd (#onetrust-accept-btn-handler)")
                except NoSuchElementException:
                    pass

            # detail-links zoeken
            # typische detail-URL's: /koopwoningen/amsterdam/appartement-...
            detail_links = sorted(
                set(
                    re.findall(
                        r'href="(/koopwoningen/[^"]+)"',
                        html,
                        flags=re.IGNORECASE,
                    )
                )
            )

            # vaak zitten er ook navigatie-links in; we filteren grofweg op
            # stukken met minimaal 4 segmenten (plaats + type + adres)
            detail_links = [
                href for href in detail_links if href.count("/") >= 3
            ]

            print(f"   >>> {len(detail_links)} detail-links gevonden")

            count_ok = 0
            for href in detail_links:
                detail_url = base + href
                w = self._scrape_pararius_detail(detail_url, plaats)
                if w:
                    self.woningen.append(w)
                    count_ok += 1

            print(f"   >>> {count_ok} woningen op pagina {page}\n")

        print(
            f"   TOTAAL Pararius: {sum(1 for w in self.woningen if w.platform == 'Pararius')} woningen\n"
        )

    def _scrape_pararius_detail(self, url: str, default_plaats: str) -> Woning | None:
        html = self._load_url(url, beschrijving="Pararius detail")
        if not html:
            return None

        soup = BeautifulSoup(html, "html.parser")
        full_text = soup.get_text(" ", strip=True)

        # Titel
        h1 = soup.find("h1")
        titel = self._normaliseer_spaties(h1.get_text(strip=True)) if h1 else ""

        # prijs
        prijs = self._zoek_eerste(
            [r"(€\s*[\d\.\,]+\s*(?:k\.k\.|v\.o\.n\.)?)"], full_text
        )

        # opp & kamers
        opp = self._zoek_eerste(
            [
                r"(\d+)\s*m²",  # 109 m²
            ],
            full_text,
        )
        if opp:
            opp = f"{opp} m2"

        kamers = self._zoek_eerste(
            [
                r"Aantal kamers\s*:?\s*(\d+)",
                r"(\d+)\s+kamers\b",
            ],
            full_text,
        )
        if kamers:
            kamers = f"{kamers} kamers"

        # postcode + plaats
        postcode = self._zoek_eerste([r"\b(\d{4}\s?[A-Z]{2})\b"], full_text)
        plaats = default_plaats.capitalize()
        if postcode:
            m = re.search(
                r"\b" + re.escape(postcode) + r"\b\s+([A-Za-zÀ-ÖØ-öø-ÿ\-\s]+)",
                full_text,
            )
            if m:
                plaats = m.group(1).split()[0]

        # adres (titel bevat meestal adres)
        if postcode and plaats:
            adres = f"{titel}, {postcode} {plaats}"
        else:
            adres = titel

        return Woning(
            titel=titel or adres or url,
            prijs=prijs,
            adres=adres,
            postcode=postcode,
            plaats=plaats,
            oppervlakte=opp,
            kamers=kamers,
            url=url,
            platform="Pararius",
        )

    # -------------- HUISLIJN --------------

    def scrape_huislijn(self, plaats: str, paginas: int) -> None:
        print(f"=== Scraping Huislijn voor {plaats} ===")

        base = "https://www.huislijn.nl"
        plaats_url = plaats.lower().replace(" ", "-")

        for page in range(1, paginas + 1):
            # simpele URL-vorm; kan per site veranderen
            url = f"{base}/koopwoningen/{plaats_url}?pagina={page}"
            print(f"   Pagina {page}... ({url})")

            html = self._load_url(url, beschrijving=f"Huislijn lijst {page}")
            if not html:
                continue

            # detail-links; typische vorm: /koopwoning/.../amsterdam/...
            detail_links = sorted(
                set(
                    re.findall(
                        r'href="(/koopwoning/[^"]+)"',
                        html,
                        flags=re.IGNORECASE,
                    )
                )
            )

            print(f"   >>> {len(detail_links)} detail-links gevonden")

            count_ok = 0
            for href in detail_links:
                detail_url = base + href
                w = self._scrape_huislijn_detail(detail_url, plaats)
                if w:
                    self.woningen.append(w)
                    count_ok += 1

            print(f"   >>> {count_ok} woningen op pagina {page}\n")

        print(
            f"   TOTAAL Huislijn: {sum(1 for w in self.woningen if w.platform == 'Huislijn')} woningen\n"
        )

    def _scrape_huislijn_detail(self, url: str, default_plaats: str) -> Woning | None:
        html = self._load_url(url, beschrijving="Huislijn detail")
        if not html:
            return None

        soup = BeautifulSoup(html, "html.parser")
        full_text = soup.get_text(" ", strip=True)

        # Titel / adres
        h1 = soup.find("h1")
        titel = self._normaliseer_spaties(h1.get_text(strip=True)) if h1 else ""

        # prijs
        prijs = self._zoek_eerste(
            [r"(€\s*[\d\.\,]+\s*(?:k\.k\.|v\.o\.n\.)?)"], full_text
        )

        # opp & kamers – vaak bij "Kenmerken / Algemeen"
        opp = self._zoek_eerste(
            [
                r"Woon oppervlakte\s*:?[\s\-]*?(\d+)",  # bv. "Woon oppervlakte 42"
                r"(\d+)\s*m²",
            ],
            full_text,
        )
        if opp:
            opp = f"{opp} m2"

        kamers = self._zoek_eerste(
            [
                r"Aantal kamers\s*:?[\s\-]*?(\d+)",
                r"(\d+)\s+kamers\b",
            ],
            full_text,
        )
        if kamers:
            kamers = f"{kamers} kamers"

        # postcode + plaats
        postcode = self._zoek_eerste([r"\b(\d{4}\s?[A-Z]{2})\b"], full_text)
        plaats = default_plaats.capitalize()
        if postcode:
            m = re.search(
                r"\b" + re.escape(postcode) + r"\b\s+([A-Za-zÀ-ÖØ-öø-ÿ\-\s]+)",
                full_text,
            )
            if m:
                plaats = m.group(1).split()[0]

        if postcode and plaats:
            adres = f"{titel}, {postcode} {plaats}"
        else:
            adres = titel

        return Woning(
            titel=titel or adres or url,
            prijs=prijs,
            adres=adres,
            postcode=postcode,
            plaats=plaats,
            oppervlakte=opp,
            kamers=kamers,
            url=url,
            platform="Huislijn",
        )

    # -------------- RESULTAAT / EXPORT --------------

    def verwijder_duplicaten(self) -> None:
        print("Verwijder duplicaten (op basis van URL)...")
        unique: Dict[str, Woning] = {}
        for w in self.woningen:
            unique[w.url] = w
        self.woningen = list(unique.values())
        print(f"   Na deduplicatie: {len(self.woningen)} woningen\n")

    def toon_resultaten(self) -> None:
        per_platform: Dict[str, int] = {}
        for w in self.woningen:
            per_platform[w.platform] = per_platform.get(w.platform, 0) + 1

        print("============================================================")
        print("RESULTATEN")
        print("============================================================")
        for platform, cnt in per_platform.items():
            print(f"   {platform}: {cnt}")
        print(f"   TOTAAL: {len(self.woningen)}\n")

        print("Eerste 5 woningen:\n")
        for i, w in enumerate(self.woningen[:5], start=1):
            print(
                f"{i}. [{w.platform}] {w.titel}\n"
                f"   {w.prijs} | {w.plaats} | {w.oppervlakte} | {w.kamers}\n"
            )

    def exporteer(self, basisnaam: str) -> None:
        print(f"Opgeslagen wordt als {basisnaam}.csv / .json + per-platform CSV's...")

        # totaal CSV
        with open(f"{basisnaam}.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(
                ["Titel", "Prijs", "Adres", "Postcode", "Plaats", "Oppervlakte", "Kamers", "URL", "Platform"]
            )
            for w in self.woningen:
                writer.writerow(
                    [
                        w.titel,
                        w.prijs,
                        w.adres,
                        w.postcode,
                        w.plaats,
                        w.oppervlakte,
                        w.kamers,
                        w.url,
                        w.platform,
                    ]
                )

        # JSON
        with open(f"{basisnaam}.json", "w", encoding="utf-8") as f:
            json.dump([asdict(w) for w in self.woningen], f, ensure_ascii=False, indent=2)

        # per platform CSV
        per_platform: Dict[str, List[Woning]] = {}
        for w in self.woningen:
            per_platform.setdefault(w.platform, []).append(w)

        for platform, lijst in per_platform.items():
            filename = f"{basisnaam}_{platform.lower()}.csv"
            with open(filename, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(
                    ["Titel", "Prijs", "Adres", "Postcode", "Plaats", "Oppervlakte", "Kamers", "URL", "Platform"]
                )
                for w in lijst:
                    writer.writerow(
                        [
                            w.titel,
                            w.prijs,
                            w.adres,
                            w.postcode,
                            w.plaats,
                            w.oppervlakte,
                            w.kamers,
                            w.url,
                            w.platform,
                        ]
                    )
            print(f"   {len(lijst):4d} woningen naar {filename}")

        print(f"\nOpgeslagen: {basisnaam}.csv, {basisnaam}.json en per-platform CSV's.\n")


# -------------- main --------------


def main():
    print("============================================================")
    print("HUIZEN SCRAPER")
    print("============================================================\n")
    print("1. Funda\n2. Pararius\n3. Huislijn\nA. ALLE")

    keuze = input("\nKeuze: ").strip().upper() or "A"
    plaats = input("Stad (bijv. amsterdam): ").strip().lower() or "amsterdam"
    paginas = int(input("Paginas (standaard 5): ").strip() or "5")
    headless = input("Browser verbergen? (j/n): ").strip().lower() == "j"

    scraper = SeleniumScraper(headless=headless)

    try:
        scraper.start_browser()

        if keuze == "A":
            scraper.scrape_funda(plaats, paginas)
            scraper.scrape_pararius(plaats, paginas)
            scraper.scrape_huislijn(plaats, paginas)
        else:
            if "1" in keuze:
                scraper.scrape_funda(plaats, paginas)
            if "2" in keuze:
                scraper.scrape_pararius(plaats, paginas)
            if "3" in keuze:
                scraper.scrape_huislijn(plaats, paginas)

        scraper.verwijder_duplicaten()
        scraper.toon_resultaten()
        scraper.exporteer("woningen")

    finally:
        scraper.stop_browser()


if __name__ == "__main__":
    main()
