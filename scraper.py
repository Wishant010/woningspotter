#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Huizen-scraper voor Apify (Playwright + Python)

- Scraped Funda (incl. detailpagina's voor aantal kamers).
- Scraped Pararius (alleen listing, geen detail voor nu).
- Ontworpen voor Apify Actor:
    * Leest input uit Actor input (INPUT_SCHEMA.json).
    * Schrijft resultaten naar Apify Dataset (CSV/JSON downloadbaar).

Benodigdheden (staan in requirements.txt):
    apify
    playwright
    beautifulsoup4
"""

import asyncio
import re
from dataclasses import asdict, dataclass
from typing import List, Optional

from bs4 import BeautifulSoup
from apify import Actor
from playwright.async_api import async_playwright, Page


# ===================== Datamodel =====================

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
    platform: str  # "Funda" of "Pararius"


# ===================== Scraper =====================

class PlaywrightScraper:
    def __init__(self, page: Page):
        self.page = page
        self.woningen: List[Woning] = []

    # ---------- Helpers ----------

    @staticmethod
    def _parse_postcode_plaats(tekst: str) -> tuple[str, str]:
        """
        Probeert uit een string een NL-postcode + plaatsnaam te halen.
        Voorbeeld: '1083 HH Amsterdam'
        """
        m = re.search(r"(\d{4}\s?[A-Z]{2})\s+(.+)", tekst)
        if m:
            return m.group(1), m.group(2)
        return "", ""

    async def _push_woning(self, woning: Woning):
        """Voeg woning toe aan lijst én push naar Apify dataset."""
        self.woningen.append(woning)
        await Actor.push_data(asdict(woning))

    # ===================== FUNDA =====================

    async def scrape_funda(self, plaats: str, paginas: int):
        log = Actor.log
        log.info(f"=== Scraping Funda voor {plaats} ===")

        basis_url = "https://www.funda.nl/zoeken/koop/"

        for pagina in range(1, paginas + 1):
            url = (
                f"{basis_url}?selected_area=%5B%22{plaats}%22%5D"
                f"&search_result={pagina}"
            )
            log.info(f"Funda lijstpagina {pagina}: {url}")

            try:
                await self.page.goto(url, wait_until="domcontentloaded", timeout=60_000)
            except Exception as e:
                log.warning(f"Fout bij laden Funda-pagina {pagina}: {e}")
                continue

            html = await self.page.content()
            soup = BeautifulSoup(html, "html.parser")

            # Alle links uit de pagina
            links = [a.get("href", "") for a in soup.find_all("a", href=True)]

            # Filter: funda detail-links
            detail_links = [href for href in links if "/detail/koop/" in href]

            # Uniek maken, absolute URLs
            unieke_links: List[str] = []
            seen = set()
            for href in detail_links:
                if href.startswith("/"):
                    href_full = "https://www.funda.nl" + href
                elif href.startswith("http"):
                    href_full = href
                else:
                    continue

                if href_full not in seen:
                    seen.add(href_full)
                    unieke_links.append(href_full)

            log.info(f"   {len(unieke_links)} unieke detail-links op pagina {pagina}")

            count_voordat = len(self.woningen)
            for detail_url in unieke_links:
                woning = await self._scrape_funda_detail(detail_url)
                if woning:
                    await self._push_woning(woning)

            nieuw = len(self.woningen) - count_voordat
            log.info(f"   >>> {nieuw} woningen verzameld van Funda pagina {pagina}")

        totaal_funda = sum(1 for w in self.woningen if w.platform == "Funda")
        log.info(f"TOTAAL Funda: {totaal_funda} woningen")

    async def _scrape_funda_detail(self, url: str) -> Optional[Woning]:
        """Haalt detail-data op, incl. aantal kamers en oppervlakte."""
        log = Actor.log
        try:
            await self.page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        except Exception as e:
            log.warning(f"   Fout bij openen Funda detail: {url} -> {e}")
            return None

        html = await self.page.content()
        soup = BeautifulSoup(html, "html.parser")

        # Titel
        titel_el = soup.select_one("h1") or soup.select_one("h1.object-header__title")
        titel = titel_el.get_text(strip=True) if titel_el else ""

        # Prijs (eerste tekst met € erin)
        prijs = ""
        prijs_el = soup.find(string=re.compile(r"€\s*\d"))
        if prijs_el:
            prijs = prijs_el.strip()

        # Adres / Postcode / Plaats
        adres = ""
        postcode = ""
        plaats = ""

        sub = soup.select_one("h2, .object-header__subtitle")
        if sub:
            sub_txt = " ".join(sub.get_text(" ", strip=True).split())
            postcode, plaats = self._parse_postcode_plaats(sub_txt)
            adres = sub_txt

        # Kenmerken (oppervlakte, kamers)
        oppervlakte = ""
        kamers = ""

        for dt in soup.select("dt"):
            label = dt.get_text(strip=True)
            dd = dt.find_next_sibling("dd")
            if not dd:
                continue
            value = dd.get_text(" ", strip=True)

            if "Aantal kamers" in label or label == "Kamers":
                kamers = value

            if (
                "Gebruiksoppervlakte wonen" in label
                or "Woonoppervlakte" in label
                or label == "Wonen"
            ):
                oppervlakte = value

        return Woning(
            titel=titel or adres or url,
            prijs=prijs,
            adres=adres,
            postcode=postcode,
            plaats=plaats,
            oppervlakte=oppervlakte,
            kamers=kamers,
            url=url,
            platform="Funda",
        )

    # ===================== PARARIUS =====================

    async def scrape_pararius(self, plaats: str, paginas: int):
        """
        Simpele listing-scraper voor Pararius.
        (Nog geen extra detail-bezoek / kamers.)
        """
        log = Actor.log
        log.info(f"=== Scraping Pararius voor {plaats} ===")

        base_url = f"https://www.pararius.nl/koopwoningen/{plaats}"

        for pagina in range(1, paginas + 1):
            if pagina == 1:
                url = base_url
            else:
                url = f"{base_url}/page-{pagina}"

            log.info(f"Pararius lijstpagina {pagina}: {url}")

            try:
                await self.page.goto(url, wait_until="domcontentloaded", timeout=60_000)
            except Exception as e:
                log.warning(f"   Fout bij laden Pararius-pagina {pagina}: {e}")
                break

            html = await self.page.content()
            soup = BeautifulSoup(html, "html.parser")

            # Kaarten / resultaten
            cards = soup.select("section.search-list__item, article")
            if not cards:
                log.info("   Geen kaarten gevonden; einde resultaten of geblokkeerd.")
                break

            count_voordat = len(self.woningen)

            for card in cards:
                a = card.find("a", href=True)
                if not a:
                    continue

                href = a["href"]
                if href.startswith("/"):
                    href = "https://www.pararius.nl" + href

                titel = a.get_text(strip=True)

                prijs_el = card.find(string=re.compile(r"€\s*\d"))
                prijs = prijs_el.strip() if prijs_el else ""

                woning = Woning(
                    titel=titel or href,
                    prijs=prijs,
                    adres="",
                    postcode="",
                    plaats=plaats.capitalize(),
                    oppervlakte="",
                    kamers="",
                    url=href,
                    platform="Pararius",
                )
                await self._push_woning(woning)

            nieuw = len(self.woningen) - count_voordat
            log.info(f"   >>> {nieuw} woningen op Pararius pagina {pagina}")

        totaal_pararius = sum(1 for w in self.woningen if w.platform == "Pararius")
        log.info(f"TOTAAL Pararius: {totaal_pararius} woningen")

    # ===================== Duplicaten =====================

    def verwijder_duplicaten(self):
        """Dedup op basis van (url, platform). (Alleen in self.woningen, dataset blijft alles hebben.)"""
        uniek = {}
        for w in self.woningen:
            key = (w.url, w.platform)
            if key not in uniek:
                uniek[key] = w
        oud = len(self.woningen)
        self.woningen = list(uniek.values())
        nieuw = len(self.woningen)
        Actor.log.info(f"Duplicaten in geheugen: {oud} -> {nieuw} unieke woningen")


# ===================== main (Apify) =====================

async def main() -> None:
    async with Actor:
        log = Actor.log

        actor_input = await Actor.get_input() or {}
        plaats = (actor_input.get("plaats") or "amsterdam").lower()
        paginas = int(actor_input.get("paginas") or 3)
        platforms_input = actor_input.get("platforms") or ["FUNDA", "PARARIUS"]

        # platforms_input kan string of lijst zijn
        if isinstance(platforms_input, str):
            platforms = [p.strip().upper() for p in platforms_input.split(",") if p.strip()]
        else:
            platforms = [str(p).strip().upper() for p in platforms_input]

        if not platforms:
            platforms = ["FUNDA", "PARARIUS"]

        log.info("============================================================")
        log.info("HUIZEN SCRAPER (Playwright / Apify)")
        log.info("============================================================")
        log.info(f"Plaats     : {plaats}")
        log.info(f"Paginas    : {paginas}")
        log.info(f"Platforms  : {', '.join(platforms)}")
        log.info("============================================================")

        # Playwright + browser starten
        async with async_playwright() as p:
            # Op Apify kun je proxies/stealth/captcha in Actor settings regelen
            browser = await p.chromium.launch(
                headless=True,  # Apify draait normaal headless
                args=["--disable-gpu", "--no-sandbox"],
            )
            context = await browser.new_context(
                viewport={"width": 1400, "height": 900},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                           "AppleWebKit/537.36 (KHTML, like Gecko) "
                           "Chrome/120.0.0.0 Safari/537.36",
            )
            page = await context.new_page()

            scraper = PlaywrightScraper(page)

            if "FUNDA" in platforms or "ALL" in platforms:
                await scraper.scrape_funda(plaats, paginas)

            if "PARARIUS" in platforms or "ALL" in platforms:
                await scraper.scrape_pararius(plaats, paginas)

            scraper.verwijder_duplicaten()

            await context.close()
            await browser.close()

        log.info("Scrapen klaar. Resultaten staan in de Apify dataset.")


if __name__ == "__main__":
    asyncio.run(main())
