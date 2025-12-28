'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, X } from 'lucide-react';

type ModalType = 'privacy' | 'voorwaarden' | 'cookies' | null;

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function PolicyModal({ isOpen, onClose, title, children }: PolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#1e1e3f] border border-[#FF6B35]/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-[#1e1e3f] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="prose prose-invert prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// COOKIE BELEID - Volledige juridische tekst
// =============================================================================
function CookiesContent() {
  return (
    <div className="space-y-6 text-gray-300">
      <p className="text-white/70 text-sm">Laatst bijgewerkt: December 2024</p>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Cookies en vergelijkbare technieken</h3>
        <p>
          Deze website, woningspotters.nl, wordt beheerd door WoningSpotters (&quot;wij&quot; of &quot;ons&quot;).
          Wij maken gebruik van cookies en vergelijkbare technieken om onze website goed te laten werken
          en om het gebruik van de website te analyseren.
        </p>
        <p className="mt-3">
          Een cookie is een klein tekstbestand dat bij een bezoek aan onze website op je apparaat wordt
          geplaatst. Cookies maken het mogelijk om je browser te herkennen en bepaalde informatie te bewaren,
          zoals je voorkeuren.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Soorten cookies die wij gebruiken</h3>
        <p>Wij gebruiken de volgende categorieën cookies:</p>

        <div className="mt-4 space-y-4">
          <div className="bg-[#2a2a4a] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">1. Noodzakelijke cookies</h4>
            <p className="text-sm">
              Deze cookies zijn technisch noodzakelijk om de website goed te laten functioneren
              (bijvoorbeeld om je cookievoorkeuren op te slaan). Voor deze cookies is geen toestemming vereist.
            </p>
            <p className="text-xs text-white/50 mt-2">Rechtsgrond: Gerechtvaardigd belang (art. 6 lid 1 sub f AVG)</p>
          </div>

          <div className="bg-[#2a2a4a] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">2. Analytische cookies (met toestemming)</h4>
            <p className="text-sm">
              Met jouw toestemming gebruiken wij Google Analytics 4 (&quot;GA4&quot;) om statistieken bij te houden
              over het gebruik van onze website. De tracking-scripts voor Google Analytics 4 worden pas
              geactiveerd nadat je hiervoor toestemming hebt gegeven via onze cookiebanner.
            </p>
            <p className="text-xs text-white/50 mt-2">Rechtsgrond: Toestemming (art. 6 lid 1 sub a AVG)</p>
            <p className="text-xs text-white/50">Bewaartermijn: Maximaal 26 maanden</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Google Analytics 4 via Google Tag Manager</h3>
        <p>
          Wij gebruiken Google Analytics 4, dat wordt geladen via Google Tag Manager. Hiermee krijgen wij
          inzicht in onder andere:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>welke pagina&apos;s worden bezocht;</li>
          <li>hoe bezoekers op onze website terechtkomen;</li>
          <li>welke apparaten en browsers worden gebruikt.</li>
        </ul>
        <p className="mt-3">
          Wij gebruiken deze informatie uitsluitend om de prestaties en gebruiksvriendelijkheid van onze
          website te verbeteren.
        </p>
        <p className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm">
          <strong className="text-green-400">Belangrijk:</strong> Zolang je geen toestemming geeft, blijven alle
          analytische cookies geblokkeerd en worden er geen meetgegevens naar Google gestuurd op basis van cookies.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Google Consent Mode v2</h3>
        <p>
          Wij maken gebruik van Google Consent Mode v2. Dit betekent dat de manier waarop Google-tags
          (zoals Google Analytics 4) worden geladen, afhankelijk is van de toestemmingskeuze die jij
          in de cookiebanner maakt.
        </p>
        <p className="mt-3">
          Zolang je geen toestemming hebt gegeven, staan de volgende toestemmingscategorieën standaard
          op &quot;geweigerd&quot;:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><code className="bg-[#1a1a2e] px-2 py-0.5 rounded text-xs">analytics_storage</code> - opslag van analytische gegevens</li>
          <li><code className="bg-[#1a1a2e] px-2 py-0.5 rounded text-xs">ad_storage</code> - opslag van advertentiegegevens</li>
          <li><code className="bg-[#1a1a2e] px-2 py-0.5 rounded text-xs">ad_user_data</code> - verzending van gebruikersgegevens voor advertenties</li>
          <li><code className="bg-[#1a1a2e] px-2 py-0.5 rounded text-xs">ad_personalization</code> - gepersonaliseerde advertenties</li>
        </ul>
        <p className="mt-3">
          Pas wanneer jij in de banner &quot;Accepteer alles&quot; kiest of specifieke categorieën inschakelt,
          worden de bijbehorende tags geactiveerd. Hierdoor worden er geen analytische of advertentiecookies
          geplaatst voordat jij daar expliciet mee instemt.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Rechtsgrond</h3>
        <p>
          Voor het plaatsen en uitlezen van analytische cookies baseren wij ons op jouw toestemming
          (art. 6 lid 1 sub a AVG). Voor noodzakelijke cookies baseren wij ons op ons gerechtvaardigd
          belang bij een goed werkende en veilige website (art. 6 lid 1 sub f AVG).
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Bewaartermijnen</h3>
        <p>
          Google Analytics 4 hanteert standaard bewaartermijnen voor gegevens op gebruikers- en eventniveau.
          Wij stellen deze zo in dat gegevens niet langer worden bewaard dan nodig is voor het analyseren
          van het websitegebruik.
        </p>
        <div className="mt-3 bg-[#2a2a4a] rounded-lg p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-white">Cookie</th>
                <th className="text-left py-2 text-white">Doel</th>
                <th className="text-left py-2 text-white">Bewaartermijn</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-2 font-mono text-xs">_ga</td>
                <td className="py-2">Onderscheid maken tussen gebruikers</td>
                <td className="py-2">2 jaar</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 font-mono text-xs">_ga_*</td>
                <td className="py-2">Sessiestatus behouden</td>
                <td className="py-2">2 jaar</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">cookie_consent</td>
                <td className="py-2">Jouw cookievoorkeuren opslaan</td>
                <td className="py-2">1 jaar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Derden</h3>
        <p>
          De analytische gegevens die via Google Analytics worden verzameld, worden verwerkt door
          Google Ireland Limited. Met Google zijn passende afspraken gemaakt voor de verwerking van
          deze gegevens conform de AVG.
        </p>
        <p className="mt-3">Wij maken gebruik van de volgende diensten van derden:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Google Tag Manager</strong> - voor het beheren van tags en scripts</li>
          <li><strong>Google Analytics 4</strong> - voor websiteanalyse (alleen na toestemming)</li>
          <li><strong>Mollie</strong> - voor betalingsverwerking</li>
          <li><strong>Supabase</strong> - voor authenticatie en database</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Je keuzes: toestemming beheren en intrekken</h3>
        <p>Je kunt je cookievoorkeuren op elk moment aanpassen:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>via de cookie-instellingen op onze website (de cookiebanner verschijnt bij je eerste bezoek);</li>
          <li>door je localStorage te wissen in je browser;</li>
          <li>door cookies handmatig te verwijderen via de instellingen van je browser.</li>
        </ul>
        <p className="mt-3">
          Trek je je toestemming in, dan worden analytische cookies niet langer gebruikt en worden de
          bijbehorende tags niet meer geactiveerd.
        </p>

        <div className="mt-4 bg-[#2a2a4a] rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Cookies verwijderen in je browser</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Chrome:</strong> Instellingen → Privacy en beveiliging → Cookies</li>
            <li><strong>Firefox:</strong> Instellingen → Privacy & Beveiliging → Cookies</li>
            <li><strong>Safari:</strong> Voorkeuren → Privacy → Beheer websitedata</li>
            <li><strong>Edge:</strong> Instellingen → Privacy → Browsegegevens wissen</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Vragen</h3>
        <p>
          Heb je vragen over ons gebruik van cookies of over deze verklaring? Neem dan contact met ons
          op via <a href="mailto:info@woningspotter.nl" className="text-[#FF6B35] hover:underline">info@woningspotter.nl</a>.
        </p>
      </section>
    </div>
  );
}

// =============================================================================
// PRIVACYBELEID - Volledige juridische tekst
// =============================================================================
function PrivacyContent() {
  return (
    <div className="space-y-6 text-gray-300">
      <p className="text-white/70 text-sm">Laatst bijgewerkt: December 2024</p>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">1. Inleiding</h3>
        <p>
          WoningSpotters (&quot;wij&quot;, &quot;ons&quot; of &quot;onze&quot;) respecteert jouw privacy en zet zich in voor
          de bescherming van jouw persoonsgegevens. Dit privacybeleid informeert je over hoe wij omgaan
          met jouw persoonsgegevens wanneer je onze website woningspotters.nl bezoekt en onze diensten
          gebruikt, en vertelt je over jouw privacyrechten en hoe de wet je beschermt.
        </p>
        <p className="mt-3">
          Wij verwerken persoonsgegevens in overeenstemming met de Algemene Verordening Gegevensbescherming
          (AVG) en overige toepasselijke privacywetgeving.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">2. Wie zijn wij?</h3>
        <p>
          WoningSpotters is de verwerkingsverantwoordelijke voor de persoonsgegevens die via onze website
          worden verzameld. Dit betekent dat wij bepalen voor welke doeleinden en met welke middelen jouw
          persoonsgegevens worden verwerkt.
        </p>
        <div className="mt-3 bg-[#2a2a4a] rounded-lg p-4">
          <p className="text-sm"><strong className="text-white">Contactgegevens:</strong></p>
          <p className="text-sm mt-1">WoningSpotters</p>
          <p className="text-sm">Amsterdam, Nederland</p>
          <p className="text-sm">E-mail: info@woningspotter.nl</p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">3. Welke persoonsgegevens verzamelen wij?</h3>
        <p>Wij kunnen de volgende categorieën persoonsgegevens verzamelen en verwerken:</p>

        <div className="mt-4 space-y-3">
          <div className="bg-[#2a2a4a] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Accountgegevens</h4>
            <p className="text-sm">E-mailadres, wachtwoord (versleuteld), en eventuele profielinformatie die je verstrekt bij het aanmaken van een account.</p>
          </div>

          <div className="bg-[#2a2a4a] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Zoekvoorkeuren</h4>
            <p className="text-sm">Jouw opgeslagen zoekcriteria, favoriete woningen, en notificatievoorkeuren.</p>
          </div>

          <div className="bg-[#2a2a4a] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Betalingsgegevens</h4>
            <p className="text-sm">Bij het afsluiten van een abonnement verwerken wij betalingsgegevens. De daadwerkelijke betaling wordt verwerkt door onze betalingsprovider Mollie.</p>
          </div>

          <div className="bg-[#2a2a4a] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Technische gegevens</h4>
            <p className="text-sm">IP-adres, browsertype en -versie, tijdzone, besturingssysteem, en informatie over hoe je onze website gebruikt (alleen na toestemming voor analytische cookies).</p>
          </div>

          <div className="bg-[#2a2a4a] rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Communicatiegegevens</h4>
            <p className="text-sm">Correspondentie wanneer je contact met ons opneemt via e-mail of het contactformulier.</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">4. Waarvoor gebruiken wij jouw gegevens?</h3>
        <p>Wij gebruiken jouw persoonsgegevens voor de volgende doeleinden:</p>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm bg-[#2a2a4a] rounded-lg">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-white">Doel</th>
                <th className="text-left p-3 text-white">Rechtsgrond (AVG)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="p-3">Leveren van onze diensten (zoeken, favorieten, notificaties)</td>
                <td className="p-3">Uitvoering overeenkomst (art. 6.1.b)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3">Aanmaken en beheren van jouw account</td>
                <td className="p-3">Uitvoering overeenkomst (art. 6.1.b)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3">Verwerken van betalingen</td>
                <td className="p-3">Uitvoering overeenkomst (art. 6.1.b)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3">Sturen van service-e-mails (bijv. nieuwe woningen)</td>
                <td className="p-3">Uitvoering overeenkomst (art. 6.1.b)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3">Analyseren van websitegebruik (Google Analytics)</td>
                <td className="p-3">Toestemming (art. 6.1.a)</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="p-3">Beantwoorden van vragen en support bieden</td>
                <td className="p-3">Gerechtvaardigd belang (art. 6.1.f)</td>
              </tr>
              <tr>
                <td className="p-3">Voldoen aan wettelijke verplichtingen</td>
                <td className="p-3">Wettelijke verplichting (art. 6.1.c)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">5. Delen van gegevens met derden</h3>
        <p>
          Wij delen jouw persoonsgegevens alleen met derden wanneer dit noodzakelijk is voor het leveren
          van onze diensten, of wanneer wij hiertoe wettelijk verplicht zijn. Wij verkopen jouw gegevens
          nooit aan derden.
        </p>
        <p className="mt-3">Wij maken gebruik van de volgende verwerkers:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Supabase</strong> - voor authenticatie en database-opslag</li>
          <li><strong>Mollie</strong> - voor het verwerken van betalingen</li>
          <li><strong>Google Analytics</strong> - voor websiteanalyse (alleen na toestemming)</li>
          <li><strong>Vercel</strong> - voor hosting van de website</li>
        </ul>
        <p className="mt-3">
          Met al deze partijen hebben wij verwerkersovereenkomsten gesloten om de veiligheid en
          vertrouwelijkheid van jouw gegevens te waarborgen.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">6. Internationale doorgifte</h3>
        <p>
          Sommige van onze verwerkers zijn gevestigd buiten de Europese Economische Ruimte (EER).
          In die gevallen zorgen wij ervoor dat er passende waarborgen zijn, zoals:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Adequaatheidsbesluiten van de Europese Commissie</li>
          <li>Standaard contractbepalingen (SCC&apos;s) van de Europese Commissie</li>
          <li>Aanvullende technische en organisatorische maatregelen waar nodig</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">7. Bewaartermijnen</h3>
        <p>
          Wij bewaren jouw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor
          zij zijn verzameld:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>Accountgegevens:</strong> Tot je je account verwijdert, plus een korte periode voor back-ups</li>
          <li><strong>Betalingsgegevens:</strong> 7 jaar (wettelijke bewaarplicht)</li>
          <li><strong>Analytische gegevens:</strong> Maximaal 26 maanden</li>
          <li><strong>Correspondentie:</strong> 2 jaar na afhandeling</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">8. Beveiliging</h3>
        <p>
          Wij nemen passende technische en organisatorische maatregelen om jouw persoonsgegevens te
          beschermen tegen ongeautoriseerde toegang, verlies of diefstal. Dit omvat onder andere:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Versleutelde verbindingen (HTTPS/TLS)</li>
          <li>Versleutelde opslag van wachtwoorden</li>
          <li>Beperkte toegang tot persoonsgegevens</li>
          <li>Regelmatige beveiligingsupdates</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">9. Jouw rechten</h3>
        <p>Op grond van de AVG heb je de volgende rechten:</p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li><strong>Recht op inzage:</strong> Je kunt opvragen welke persoonsgegevens wij van je verwerken.</li>
          <li><strong>Recht op rectificatie:</strong> Je kunt onjuiste of onvolledige gegevens laten corrigeren.</li>
          <li><strong>Recht op verwijdering:</strong> Je kunt verzoeken om verwijdering van jouw gegevens (&quot;recht om vergeten te worden&quot;).</li>
          <li><strong>Recht op beperking:</strong> Je kunt vragen om de verwerking van jouw gegevens te beperken.</li>
          <li><strong>Recht op dataportabiliteit:</strong> Je kunt jouw gegevens in een gestructureerd formaat ontvangen.</li>
          <li><strong>Recht van bezwaar:</strong> Je kunt bezwaar maken tegen verwerking op basis van gerechtvaardigd belang.</li>
          <li><strong>Recht om toestemming in te trekken:</strong> Je kunt eerder gegeven toestemming op elk moment intrekken.</li>
        </ul>
        <p className="mt-3">
          Om een van deze rechten uit te oefenen, neem je contact met ons op via{' '}
          <a href="mailto:info@woningspotter.nl" className="text-[#FF6B35] hover:underline">info@woningspotter.nl</a>.
          Wij reageren binnen 30 dagen op jouw verzoek.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">10. Klachten</h3>
        <p>
          Als je een klacht hebt over de manier waarop wij met jouw persoonsgegevens omgaan, horen wij
          dit graag. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens (AP), de
          Nederlandse toezichthoudende autoriteit voor gegevensbescherming.
        </p>
        <p className="mt-2 text-sm">
          Website: <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">autoriteitpersoonsgegevens.nl</a>
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">11. Wijzigingen</h3>
        <p>
          Wij kunnen dit privacybeleid van tijd tot tijd wijzigen. De meest recente versie is altijd
          beschikbaar op onze website. Bij belangrijke wijzigingen zullen wij je hierover informeren
          via e-mail of een melding op de website.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">12. Contact</h3>
        <p>
          Heb je vragen over dit privacybeleid of over de verwerking van jouw persoonsgegevens?
          Neem dan contact met ons op:
        </p>
        <div className="mt-3 bg-[#2a2a4a] rounded-lg p-4">
          <p className="text-sm">E-mail: <a href="mailto:info@woningspotter.nl" className="text-[#FF6B35] hover:underline">info@woningspotter.nl</a></p>
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// ALGEMENE VOORWAARDEN - Volledige juridische tekst
// =============================================================================
function VoorwaardenContent() {
  return (
    <div className="space-y-6 text-gray-300">
      <p className="text-white/70 text-sm">Laatst bijgewerkt: December 2024</p>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 1 - Definities</h3>
        <p>In deze algemene voorwaarden wordt verstaan onder:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>WoningSpotters:</strong> de aanbieder van de diensten via woningspotters.nl.</li>
          <li><strong>Gebruiker:</strong> iedere natuurlijke of rechtspersoon die gebruik maakt van de Website of Diensten.</li>
          <li><strong>Website:</strong> de website woningspotters.nl en alle bijbehorende subdomeinen.</li>
          <li><strong>Diensten:</strong> alle diensten die WoningSpotters aanbiedt, waaronder het doorzoeken van woningaanbod en het versturen van notificaties.</li>
          <li><strong>Account:</strong> de persoonlijke omgeving van de Gebruiker op de Website.</li>
          <li><strong>Abonnement:</strong> een betaalde toegang tot premium functies van de Diensten.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 2 - Toepasselijkheid</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>Deze algemene voorwaarden zijn van toepassing op elk gebruik van de Website en Diensten van WoningSpotters.</li>
          <li>Door gebruik te maken van de Website of Diensten, ga je akkoord met deze algemene voorwaarden.</li>
          <li>Afwijkingen van deze voorwaarden zijn alleen geldig indien schriftelijk overeengekomen.</li>
          <li>WoningSpotters behoudt zich het recht voor deze voorwaarden te wijzigen. De meest recente versie is altijd van toepassing.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 3 - Diensten</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>WoningSpotters biedt een platform waarmee Gebruikers woningen kunnen zoeken en vergelijken van verschillende Nederlandse woningsites.</li>
          <li>WoningSpotters aggregeert openbaar beschikbare informatie van woningsites en is niet verantwoordelijk voor de juistheid, volledigheid of actualiteit van de brongegevens.</li>
          <li>WoningSpotters is geen makelaar of bemiddelaar en is niet betrokken bij de daadwerkelijke verhuur of verkoop van woningen.</li>
          <li>De beschikbaarheid en functionaliteit van de Diensten kan variëren. WoningSpotters spant zich in om de Diensten beschikbaar te houden, maar geeft geen garanties.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 4 - Account en registratie</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>Voor bepaalde functies is het aanmaken van een Account vereist.</li>
          <li>Je bent verantwoordelijk voor het geheimhouden van jouw inloggegevens en voor alle activiteiten die onder jouw Account plaatsvinden.</li>
          <li>Je dient correcte en actuele informatie te verstrekken bij registratie.</li>
          <li>Je mag slechts één Account aanmaken, tenzij WoningSpotters anders toestaat.</li>
          <li>WoningSpotters behoudt zich het recht voor om Accounts te blokkeren of te verwijderen bij (vermoeden van) misbruik of overtreding van deze voorwaarden.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 5 - Abonnementen en betalingen</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>Voor bepaalde premium functies is een betaald Abonnement vereist.</li>
          <li>De prijzen en voorwaarden van Abonnementen worden op de Website vermeld.</li>
          <li>Betalingen worden verwerkt via onze betalingspartner Mollie. Door een betaling te doen, ga je ook akkoord met de voorwaarden van Mollie.</li>
          <li>Abonnementen worden automatisch verlengd aan het einde van de abonnementsperiode, tenzij je voor die tijd opzegt.</li>
          <li>Opzegging kan via je accountinstellingen of door contact op te nemen met onze klantenservice.</li>
          <li>Bij opzegging behoud je toegang tot premium functies tot het einde van de lopende abonnementsperiode.</li>
          <li>Restitutie is alleen mogelijk binnen 14 dagen na afsluiten van een nieuw Abonnement, mits je geen gebruik hebt gemaakt van de premium functies.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 6 - Gebruiksregels</h3>
        <p>Bij het gebruik van de Website en Diensten is het niet toegestaan om:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>De Website of Diensten te gebruiken voor onwettige doeleinden;</li>
          <li>De werking van de Website te verstoren of te proberen ongeautoriseerde toegang te verkrijgen;</li>
          <li>Geautomatiseerde systemen (bots, scrapers) te gebruiken zonder toestemming;</li>
          <li>Content te plaatsen die inbreuk maakt op rechten van derden;</li>
          <li>De Diensten te gebruiken voor commerciële doeleinden zonder toestemming;</li>
          <li>Valse of misleidende informatie te verstrekken.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 7 - Intellectueel eigendom</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>Alle intellectuele eigendomsrechten op de Website, inclusief maar niet beperkt tot teksten, afbeeldingen, logo&apos;s, software en het ontwerp, berusten bij WoningSpotters of haar licentiegevers.</li>
          <li>Het is niet toegestaan om content van de Website te kopiëren, verspreiden of op andere wijze te gebruiken zonder voorafgaande schriftelijke toestemming.</li>
          <li>De woninginformatie die via de Diensten wordt getoond, is afkomstig van externe bronnen. WoningSpotters claimt geen eigendom over deze informatie.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 8 - Aansprakelijkheid</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>WoningSpotters is niet aansprakelijk voor schade die voortvloeit uit het gebruik van de Website of Diensten, tenzij deze schade is veroorzaakt door opzet of grove schuld.</li>
          <li>WoningSpotters is niet aansprakelijk voor:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>De juistheid of volledigheid van woninginformatie van externe bronnen;</li>
              <li>Beslissingen die je neemt op basis van informatie op de Website;</li>
              <li>Technische storingen of onderbrekingen van de Diensten;</li>
              <li>Handelen of nalaten van derden, waaronder woningsites en makelaars.</li>
            </ul>
          </li>
          <li>Indien WoningSpotters ondanks het voorgaande aansprakelijk mocht zijn, is deze aansprakelijkheid beperkt tot het bedrag dat je in de 12 maanden voorafgaand aan de schadeclaim aan WoningSpotters hebt betaald, met een maximum van € 100,-.</li>
          <li>Indirecte schade, gevolgschade of gederfde winst wordt nimmer vergoed.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 9 - Vrijwaring</h3>
        <p>
          Je vrijwaart WoningSpotters tegen alle aanspraken van derden die verband houden met jouw
          gebruik van de Website of Diensten of een overtreding van deze voorwaarden.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 10 - Privacy</h3>
        <p>
          Wij verwerken persoonsgegevens in overeenstemming met ons Privacybeleid. Door gebruik te
          maken van de Diensten, ga je akkoord met de verwerking van jouw gegevens zoals beschreven
          in het Privacybeleid.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 11 - Wijzigingen</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>WoningSpotters behoudt zich het recht voor om deze voorwaarden te wijzigen.</li>
          <li>Materiële wijzigingen worden minimaal 30 dagen van tevoren aangekondigd via e-mail of een melding op de Website.</li>
          <li>Als je niet akkoord gaat met de wijzigingen, kun je je Account opzeggen voordat de wijzigingen ingaan.</li>
          <li>Voortgezet gebruik van de Diensten na inwerkingtreding van de wijzigingen geldt als acceptatie.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 12 - Beëindiging</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>Je kunt je Account op elk moment beëindigen via de accountinstellingen of door contact op te nemen.</li>
          <li>WoningSpotters kan je Account beëindigen of opschorten bij overtreding van deze voorwaarden.</li>
          <li>Bij beëindiging vervalt je recht om de Diensten te gebruiken. Bepalingen die naar hun aard bestemd zijn om voort te duren, blijven van kracht.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 13 - Overige bepalingen</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>Indien een bepaling van deze voorwaarden nietig of vernietigbaar is, blijven de overige bepalingen onverminderd van kracht.</li>
          <li>Het nalaten van WoningSpotters om een recht uit te oefenen, betekent geen afstand van dat recht.</li>
          <li>Je kunt rechten en verplichtingen uit deze overeenkomst niet overdragen zonder schriftelijke toestemming.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 14 - Toepasselijk recht en geschillen</h3>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>Op deze voorwaarden en alle overeenkomsten met WoningSpotters is Nederlands recht van toepassing.</li>
          <li>Geschillen worden bij uitsluiting voorgelegd aan de bevoegde rechter in Amsterdam.</li>
          <li>Voordat je een geschil voorlegt aan de rechter, verzoeken wij je eerst contact met ons op te nemen om te proberen het geschil in onderling overleg op te lossen.</li>
        </ol>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-3">Artikel 15 - Contact</h3>
        <p>
          Heb je vragen over deze algemene voorwaarden? Neem dan contact met ons op:
        </p>
        <div className="mt-3 bg-[#2a2a4a] rounded-lg p-4">
          <p className="text-sm">E-mail: <a href="mailto:info@woningspotter.nl" className="text-[#FF6B35] hover:underline">info@woningspotter.nl</a></p>
        </div>
      </section>
    </div>
  );
}

export function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="relative z-10 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & beschrijving */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src="/logo.svg" alt="WoningSpotters" width={32} height={32} />
                <span className="font-bold text-lg">WoningSpotters</span>
              </Link>
              <p className="text-white/50 text-sm">
                Vind jouw droomwoning in heel Nederland. Alle woningsites op één plek.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Navigatie</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-white/50 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-white/50 hover:text-white transition-colors">
                    Prijzen
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white/50 hover:text-white transition-colors">
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/50 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Juridisch */}
            <div>
              <h4 className="font-semibold mb-4">Juridisch</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-white/50 hover:text-white transition-colors">
                    Privacybeleid
                  </Link>
                </li>
                <li>
                  <Link href="/voorwaarden" className="text-white/50 hover:text-white transition-colors">
                    Algemene Voorwaarden
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => openModal('cookies')}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    Cookie Beleid
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-white/50">
                  <Mail className="w-4 h-4 text-[#FF7A00]" />
                  info@woningspotter.nl
                </li>
                <li className="flex items-center gap-2 text-white/50">
                  <Phone className="w-4 h-4 text-[#FF7A00]" />
                  +31 20 123 4567
                </li>
                <li className="flex items-center gap-2 text-white/50">
                  <MapPin className="w-4 h-4 text-[#FF7A00]" />
                  Amsterdam, NL
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} WoningSpotters. Alle rechten voorbehouden.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-white/40 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/voorwaarden" className="text-white/40 hover:text-white transition-colors">
                Voorwaarden
              </Link>
              <button
                onClick={() => openModal('cookies')}
                className="text-white/40 hover:text-white transition-colors"
              >
                Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PolicyModal
        isOpen={activeModal === 'privacy'}
        onClose={closeModal}
        title="Privacybeleid"
      >
        <PrivacyContent />
      </PolicyModal>

      <PolicyModal
        isOpen={activeModal === 'voorwaarden'}
        onClose={closeModal}
        title="Algemene Voorwaarden"
      >
        <VoorwaardenContent />
      </PolicyModal>

      <PolicyModal
        isOpen={activeModal === 'cookies'}
        onClose={closeModal}
        title="Cookie Beleid"
      >
        <CookiesContent />
      </PolicyModal>
    </>
  );
}
