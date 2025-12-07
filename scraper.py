#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Huizen-scraper voor Apify (Playwright + Python)
- Met Apify Proxy ondersteuning
- Cookie consent handling
- Stealth mode
"""

import asyncio
import re
from dataclasses import asdict, dataclass
from typing import List, Optional

from bs4 import BeautifulSoup
from apify import Actor
from playwright.async_api import async_playwright, Page


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


class PlaywrightScraper:
    def __init__(self, page: Page):
        self.page = page
        self.woningen: List[Woning] = []

    @staticmethod
    def _parse_postcode_plaats(tekst: str) -> tuple[str, str]:
        m = re.search(r"(\d{4}\s?[A-Z]{2})\s+(.+)", tekst)
        if m:
            return m.group(1), m.group(2)
        return "", ""

    async def _push_woning(self, woning: Woning):
        self.woningen.append(woning)
        await Actor.push_data(asdict(woning))

    async def _handle_cookie_consent(self):
        """Accepteer cookies als de banner verschijnt."""
        log = Actor.log
        try:
            # Wacht kort op cookie banner
            await self.page.wait_for_timeout(2000)
            
            # Probeer verschillende cookie accept knoppen
            selectors = [
                "button:has-text('Accepteren')",
                "button:has-text('Akkoord')",
                "button:has-text('Accept')",
                "button:has-text('Alle cookies accepteren')",
                "[data-testid='accept-cookies']",
                "#accept-cookies",
                ".cookie-accept",
                "button[id*='accept']",
            ]
            
            for selector in selectors:
                try:
                    button = self.page.locator(selector).first
                    if await button.is_visible(timeout=1000):
                        await button.click()
                        log.info("   Cookie consent geaccepteerd")
                        await self.page.wait_for_timeout(1000)
                        return
                except:
                    continue
        except Exception as e:
            log.debug(f"   Geen cookie banner gevonden: {e}")

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
                
                # Handle cookies op eerste pagina
                if pagina == 1:
                    await self._handle_cookie_consent()
                
                # Wacht op content
                await self.page.wait_for_timeout(3000)
                
            except Exception as e:
                log.warning(f"Fout bij laden Funda-pagina {pagina}: {e}")
                continue

            html = await self.page.content()
            soup = BeautifulSoup(html, "html.parser")

            # Debug: toon pagina titel
            title = soup.find("title")
            log.info(f"   Pagina titel: {title.get_text() if title else 'geen'}")

            # Alle links uit de pagina
            links = [a.get("href", "") for a in soup.find_all("a", href=True)]

            # Filter: funda detail-links
            detail_links = [href for href in links if "/detail/koop/" in href or "/koop/" in href and "/huis-" in href]

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

                # Skip non-detail links
                if "zoeken" in href_full or "kaart" in href_full:
                    continue

                if href_full not in seen:
                    seen.add(href_full)
                    unieke_links.append(href_full)

            log.info(f"   {len(unieke_links)} unieke detail-links op pagina {pagina}")

            count_voordat = len(self.woningen)
            for detail_url in unieke_links[:15]:  # Max 15 per pagina om snelheid te houden
                woning = await self._scrape_funda_detail(detail_url)
                if woning:
                    await self._push_woning(woning)
                # Kleine pauze tussen requests
                await self.page.wait_for_timeout(1500)

            nieuw = len(self.woningen) - count_voordat
            log.info(f"   >>> {nieuw} woningen verzameld van Funda pagina {pagina}")

        totaal_funda = sum(1 for w in self.woningen if w.platform == "Funda")
        log.info(f"TOTAAL Funda: {totaal_funda} woningen")

    async def _scrape_funda_detail(self, url: str) -> Optional[Woning]:
        log = Actor.log
        try:
            await self.page.goto(url, wait_until="domcontentloaded", timeout=60_000)
            await self.page.wait_for_timeout(2000)
        except Exception as e:
            log.warning(f"   Fout bij openen Funda detail: {url} -> {e}")
            return None

        html = await self.page.content()
        soup = BeautifulSoup(html, "html.parser")

        # Titel
        titel_el = soup.select_one("h1")
        titel = titel_el.get_text(strip=True) if titel_el else ""

        # Prijs
        prijs = ""
        prijs_el = soup.find(string=re.compile(r"€\s*[\d\.,]+"))
        if prijs_el:
            prijs = prijs_el.strip()

        # Adres / Postcode / Plaats
        adres = ""
        postcode = ""
        plaats = ""

        sub = soup.select_one("h2, .object-header__subtitle, [class*='subtitle']")
        if sub:
            sub_txt = " ".join(sub.get_text(" ", strip=True).split())
            postcode, plaats = self._parse_postcode_plaats(sub_txt)
            adres = sub_txt

        # Kenmerken
        oppervlakte = ""
        kamers = ""

        for dt in soup.select("dt"):
            label = dt.get_text(strip=True)
            dd = dt.find_next_sibling("dd")
            if not dd:
                continue
            value = dd.get_text(" ", strip=True)

            if "kamers" in label.lower():
                kamers = value
            if "oppervlakte" in label.lower() or "wonen" in label.lower():
                oppervlakte = value

        # Alternatief: zoek in spans/divs met class namen
        if not oppervlakte:
            opp_el = soup.find(string=re.compile(r"\d+\s*m²"))
            if opp_el:
                oppervlakte = opp_el.strip()

        log.info(f"   ✓ {titel[:40]}... - {prijs}")

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
                
                if pagina == 1:
                    await self._handle_cookie_consent()
                
                await self.page.wait_for_timeout(3000)
                
            except Exception as e:
                log.warning(f"   Fout bij laden Pararius-pagina {pagina}: {e}")
                break

            html = await self.page.content()
            soup = BeautifulSoup(html, "html.parser")

            # Debug
            title = soup.find("title")
            log.info(f"   Pagina titel: {title.get_text() if title else 'geen'}")

            # Zoek listings
            cards = soup.select("li.search-list__item--listing, section.listing-search-item, article, .listing-search-item")
            
            if not cards:
                # Alternatieve selector
                cards = soup.find_all("a", href=re.compile(r"/koopwoningen/.+/[a-z]"))
                
            log.info(f"   Gevonden kaarten: {len(cards)}")

            if not cards:
                log.info("   Geen kaarten gevonden; einde resultaten of geblokkeerd.")
                break

            count_voordat = len(self.woningen)

            for card in cards:
                try:
                    # Link vinden
                    if card.name == "a":
                        a = card
                    else:
                        a = card.find("a", href=True)
                    
                    if not a:
                        continue

                    href = a.get("href", "")
                    if not href or "javascript" in href:
                        continue
                        
                    if href.startswith("/"):
                        href = "https://www.pararius.nl" + href

                    # Skip non-listing links
                    if "/koopwoningen/" not in href:
                        continue

                    titel = a.get_text(strip=True)[:100]

                    # Prijs zoeken
                    prijs = ""
                    prijs_el = card.find(string=re.compile(r"€\s*[\d\.,]+"))
                    if prijs_el:
                        prijs = prijs_el.strip()

                    # Oppervlakte zoeken
                    opp = ""
                    opp_el = card.find(string=re.compile(r"\d+\s*m²"))
                    if opp_el:
                        opp = opp_el.strip()

                    woning = Woning(
                        titel=titel or href,
                        prijs=prijs,
                        adres="",
                        postcode="",
                        plaats=plaats.capitalize(),
                        oppervlakte=opp,
                        kamers="",
                        url=href,
                        platform="Pararius",
                    )
                    await self._push_woning(woning)
                except Exception as e:
                    log.debug(f"   Error parsing card: {e}")
                    continue

            nieuw = len(self.woningen) - count_voordat
            log.info(f"   >>> {nieuw} woningen op Pararius pagina {pagina}")
            
            # Pauze tussen pagina's
            await self.page.wait_for_timeout(2000)

        totaal_pararius = sum(1 for w in self.woningen if w.platform == "Pararius")
        log.info(f"TOTAAL Pararius: {totaal_pararius} woningen")

    def verwijder_duplicaten(self):
        uniek = {}
        for w in self.woningen:
            key = (w.url, w.platform)
            if key not in uniek:
                uniek[key] = w
        oud = len(self.woningen)
        self.woningen = list(uniek.values())
        nieuw = len(self.woningen)
        Actor.log.info(f"Duplicaten in geheugen: {oud} -> {nieuw} unieke woningen")


async def main() -> None:
    async with Actor:
        log = Actor.log

        actor_input = await Actor.get_input() or {}
        plaats = (actor_input.get("plaats") or "amsterdam").lower()
        paginas = int(actor_input.get("paginas") or 3)
        platforms_input = actor_input.get("platforms") or ["FUNDA", "PARARIUS"]

        if isinstance(platforms_input, str):
            platforms = [p.strip().upper() for p in platforms_input.split(",") if p.strip()]
        else:
            platforms = [str(p).strip().upper() for p in platforms_input]

        if not platforms:
            platforms = ["FUNDA", "PARARIUS"]

        log.info("============================================================")
        log.info("HUIZEN SCRAPER (Playwright / Apify) - MET PROXY")
        log.info("============================================================")
        log.info(f"Plaats     : {plaats}")
        log.info(f"Paginas    : {paginas}")
        log.info(f"Platforms  : {', '.join(platforms)}")
        log.info("============================================================")

        # Proxy configuratie voor Apify
        proxy_configuration = await Actor.create_proxy_configuration(
            groups=["RESIDENTIAL"],  # Of ["DATACENTER"] voor goedkoper
            country_code="NL",
        )
        
        proxy_url = None
        if proxy_configuration:
            proxy_url = await proxy_configuration.new_url()
            log.info(f"Proxy actief: {proxy_url[:50]}...")

        async with async_playwright() as p:
            # Browser launch opties
            launch_options = {
                "headless": True,
                "args": [
                    "--disable-gpu",
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                ],
            }

            browser = await p.chromium.launch(**launch_options)
            
            # Context met proxy (als beschikbaar)
            context_options = {
                "viewport": {"width": 1920, "height": 1080},
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "locale": "nl-NL",
                "timezone_id": "Europe/Amsterdam",
            }
            
            if proxy_url:
                context_options["proxy"] = {"server": proxy_url}

            context = await browser.new_context(**context_options)
            
            # Stealth: verberg webdriver
            await context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """)
            
            page = await context.new_page()
            scraper = PlaywrightScraper(page)

            if "FUNDA" in platforms or "ALL" in platforms:
                await scraper.scrape_funda(plaats, paginas)

            if "PARARIUS" in platforms or "ALL" in platforms:
                await scraper.scrape_pararius(plaats, paginas)

            scraper.verwijder_duplicaten()

            await context.close()
            await browser.close()

        log.info("============================================================")
        log.info(f"KLAAR! Totaal: {len(scraper.woningen)} woningen")
        log.info("Resultaten staan in de Apify dataset.")
        log.info("============================================================")


if __name__ == "__main__":
    asyncio.run(main())