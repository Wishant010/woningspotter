import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacybeleid | WoningSpotters',
  description: 'Lees hoe WoningSpotters omgaat met je persoonlijke gegevens en privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="px-4 py-8 pb-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacybeleid</h1>
        <p className="text-white/50 mb-8">Laatst bijgewerkt: december 2024</p>

        <div className="space-y-8 text-white/70">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Inleiding</h2>
            <p>
              WoningSpotters respecteert je privacy en zorgt ervoor dat je persoonlijke gegevens
              worden beschermd. In dit privacybeleid leggen we uit welke gegevens we verzamelen,
              waarom we dit doen en hoe we ermee omgaan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Welke gegevens verzamelen we?</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Accountgegevens:</strong> E-mailadres en wachtwoord bij registratie</li>
              <li><strong>Zoekgegevens:</strong> Je zoekopdrachten naar woningen</li>
              <li><strong>Betalingsgegevens:</strong> Via Mollie voor abonnementen (wij slaan geen creditcardgegevens op)</li>
              <li><strong>Voorkeuren:</strong> Opgeslagen favoriete woningen en zoekwaarschuwingen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Waarvoor gebruiken we je gegevens?</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Om je account te beheren en toegang te geven tot onze diensten</li>
              <li>Om zoekopdrachten uit te voeren en resultaten te tonen</li>
              <li>Om je favorieten en waarschuwingen op te slaan</li>
              <li>Om betalingen te verwerken voor abonnementen</li>
              <li>Om je te informeren over updates of wijzigingen in onze diensten</li>
              <li>Om onze diensten te verbeteren</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies</h2>
            <p>
              We gebruiken functionele cookies om onze website goed te laten werken.
              Analytische cookies worden alleen geplaatst met je toestemming via de cookie-banner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Delen van gegevens</h2>
            <p>
              We delen je gegevens niet met derden, behalve:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Mollie:</strong> Voor betalingsverwerking</li>
              <li><strong>Supabase:</strong> Voor veilige gegevensopslag</li>
              <li><strong>Resend:</strong> Voor het versturen van e-mails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Beveiliging</h2>
            <p>
              We nemen passende technische en organisatorische maatregelen om je gegevens te beschermen.
              Alle data wordt versleuteld opgeslagen en verzonden via HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Je rechten</h2>
            <p>Je hebt het recht om:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Inzage te vragen in je persoonlijke gegevens</li>
              <li>Je gegevens te laten corrigeren of verwijderen</li>
              <li>Je toestemming in te trekken</li>
              <li>Een klacht in te dienen bij de Autoriteit Persoonsgegevens</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Contact</h2>
            <p>
              Heb je vragen over dit privacybeleid? Neem dan contact met ons op via onze{' '}
              <Link href="/contact" className="text-[#FF7A00] hover:underline">contactpagina</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
