import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden | WoningSpotters',
  description: 'Lees de algemene voorwaarden van WoningSpotters.',
};

export default function TermsPage() {
  return (
    <div className="px-4 py-8 pb-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Algemene Voorwaarden</h1>
        <p className="text-white/50 mb-8">Laatst bijgewerkt: december 2024</p>

        <div className="space-y-8 text-white/70">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Definities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>WoningSpotters:</strong> De aanbieder van de woningzoekdienst</li>
              <li><strong>Gebruiker:</strong> Iedere bezoeker of geregistreerde gebruiker van de dienst</li>
              <li><strong>Dienst:</strong> Het zoekplatform voor woningen aangeboden via woningspotters.nl</li>
              <li><strong>Abonnement:</strong> Een betaald pakket (Pro of Ultra) met extra functies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Toepasselijkheid</h2>
            <p>
              Deze algemene voorwaarden zijn van toepassing op elk gebruik van WoningSpotters.
              Door gebruik te maken van onze dienst, ga je akkoord met deze voorwaarden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Account en registratie</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Je moet minimaal 18 jaar oud zijn om een account aan te maken</li>
              <li>Je bent verantwoordelijk voor het geheimhouden van je inloggegevens</li>
              <li>Je mag je account niet delen met anderen</li>
              <li>We behouden het recht om accounts te blokkeren bij misbruik</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Abonnementen en betalingen</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Abonnementen worden maandelijks gefactureerd</li>
              <li>Betalingen worden verwerkt via Mollie</li>
              <li>Je kunt je abonnement op elk moment opzeggen</li>
              <li>Bij opzegging blijft het abonnement actief tot het einde van de betaalperiode</li>
              <li>Prijzen kunnen worden aangepast met 30 dagen kennisgeving</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Gebruik van de dienst</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>De dienst is bedoeld voor persoonlijk, niet-commercieel gebruik</li>
              <li>Je mag de dienst niet gebruiken voor scraping of geautomatiseerde toegang</li>
              <li>Je mag geen valse informatie invoeren</li>
              <li>We zijn niet verantwoordelijk voor de juistheid van woninggegevens</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Zoeklimieten</h2>
            <p>Elk abonnementsniveau heeft een dagelijkse zoeklimiet:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Gratis:</strong> 5 zoekopdrachten per dag</li>
              <li><strong>Pro:</strong> 30 zoekopdrachten per dag</li>
              <li><strong>Ultra:</strong> 100 zoekopdrachten per dag</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Aansprakelijkheid</h2>
            <p>
              WoningSpotters is niet aansprakelijk voor:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Onjuiste of verouderde woninginformatie</li>
              <li>Beslissingen genomen op basis van onze zoekresultaten</li>
              <li>Technische storingen of onderbrekingen van de dienst</li>
              <li>Schade door onbevoegd gebruik van je account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Intellectueel eigendom</h2>
            <p>
              Alle content, logo&apos;s, en software van WoningSpotters zijn eigendom van
              WoningSpotters en mogen niet worden gekopieerd of verspreid zonder toestemming.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Wijzigingen</h2>
            <p>
              We behouden het recht om deze voorwaarden te wijzigen.
              Belangrijke wijzigingen worden per e-mail gecommuniceerd.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p>
              Heb je vragen over deze voorwaarden? Neem dan contact met ons op via onze{' '}
              <Link href="/contact" className="text-[#FF7A00] hover:underline">contactpagina</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Toepasselijk recht</h2>
            <p>
              Op deze voorwaarden is Nederlands recht van toepassing.
              Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
