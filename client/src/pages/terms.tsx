import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, ArrowLeft, FileText } from "lucide-react";
const logoImg = "/logo.png";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (<Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>);
}

const ARTICLES = {
  de: [
    { title: "Art. 1 — Begriffsbestimmungen und Anwendungsbereich", content: "Diese Allgemeinen Geschäftsbedingungen (nachfolgend «AGB») regeln sämtliche Vertragsbeziehungen zwischen der SwizKote Bank AG (nachfolgend «die Bank»), einer nach Schweizer Recht gegründeten Aktiengesellschaft mit Sitz an der Rue du Rhône 42, 1204 Genf, Schweiz, und jeder natürlichen oder juristischen Person (nachfolgend «der Kunde»), die die Bankdienstleistungen, die digitale Plattform und die damit verbundenen Anwendungen der SwizKote Bank nutzt.\n\nDie Bank ist lizenziert und steht unter der Aufsicht der Eidgenössischen Finanzmarktaufsicht (FINMA) gemäss dem Bundesgesetz über die Banken und Sparkassen (BankG) vom 8. November 1934.\n\nDie Nutzung jeglicher Dienste der SwizKote Bank setzt die vorbehaltlose Akzeptanz der vorliegenden AGB in ihrer Gesamtheit voraus." },
    { title: "Art. 2 — Kontoeröffnung und -verwaltung", content: "2.1 Eröffnungsvoraussetzungen. Die Eröffnung eines Kontos bei SwizKote Bank unterliegt der Vorlage gültiger Identitätsnachweise, der KYC-Prüfung (Know Your Customer) gemäss dem Bundesgesetz über die Bekämpfung der Geldwäscherei (GwG) und den geltenden FINMA-Richtlinien. Die Bank behält sich das Recht vor, jeden Kontoeröffnungsantrag ohne Begründungspflicht abzulehnen.\n\n2.2 Identifizierung. Der Kunde ist allein verantwortlich für die Vertraulichkeit seiner Zugangsdaten. Jeder mit den Zugangsdaten des Kunden getätigte Zugang gilt als von diesem vorgenommen, sofern nicht innerhalb von 48 Stunden nach Feststellung eines unbefugten Zugangs der Gegenbeweis erbracht wird." },
    { title: "Art. 3 — Bankdienstleistungen und Transaktionen", content: "3.1 Überweisungen. SEPA-Überweisungen werden gemäss den Standard-Fristen D+1 für bankinternen Zahlungsverkehr und D+2 für zwischenbanklichen Zahlungsverkehr, ausgenommen Feiertage, ausgeführt.\n\n3.2 Transaktionslimiten. Tägliche und wöchentliche Limits gelten für Überweisungen und Abhebungen, die in der Preisliste festgelegt sind.\n\n3.3 Widerruflichkeit. Eine Überweisung kann nur vor ihrer endgültigen Ausführung widerrufen werden.\n\n3.4 Haftung bei Betrug. Bei betrügerischen Transaktionen muss der Kunde die Bank unverzüglich und spätestens innerhalb von 13 Monaten nach dem Belastungsdatum informieren." },
    { title: "Art. 4 — Preise und Bankgebühren", content: "Die auf die verschiedenen Dienstleistungen anwendbaren Gebühren sind in der geltenden Preisliste festgelegt, die auf unserer Website verfügbar und dem Kunden bei der Kontoeröffnung ausgehändigt wird. SwizKote Bank behält sich das Recht vor, ihre Preise mit einer Vorankündigung von 30 Kalendertagen zu ändern." },
    { title: "Art. 5 — Kredite und Darlehen", content: "5.1 Kreditgewährung. Die Gewährung jedes Kredits ist von einer vorherigen Bonitätsprüfung des Kunden abhängig, einschliesslich der Abfrage bei Kreditinformationszentralen (ZEK, IKO). Die Bank behält sich das Recht vor, jeden Antrag ohne Begründungspflicht abzulehnen.\n\n5.2 Verzugszinsen. Bei Zahlungsverzug werden ab dem 10. Tag nach Fälligkeit automatisch Verzugszinsen zum gesetzlichen Zinssatz zuzüglich 2 Prozentpunkte fällig." },
    { title: "Art. 6 — Sicherheit und starke Authentifizierung", content: "6.1 Starke Authentifizierung (2FA). Die Bank wendet starke Kundenauthentifizierung (SCA) für alle Anmeldungen und Transaktionen gemäss den Empfehlungen der FINMA an. Der Kunde verpflichtet sich, seine OTP-Codes oder andere Authentifizierungsfaktoren niemals weiterzugeben.\n\n6.2 Meldung von Vorfällen. Jeder Sicherheitsvorfall oder verdächtige Zugang muss sofort über die sichere Nachrichtenübermittlung des Kundenportals oder telefonisch unter +41 22 000 00 00 gemeldet werden." },
    { title: "Art. 7 — Bankgeheimnis und Datenschutz", content: "7.1 Bankgeheimnis. SwizKote Bank unterliegt dem Schweizer Bankgeheimnis gemäss Artikel 47 des Bundesgesetzes über die Banken (BankG). Dieses Geheimnis schützt Informationen über Vermögen, Transaktionen und die finanzielle Situation des Kunden.\n\n7.2 Datenschutz. Gemäss dem revidierten Bundesgesetz über den Datenschutz (DSG) und der DSGVO für europäische Einwohner werden die persönlichen Daten des Kunden rechtmässig, in gutem Glauben und verhältnismässig verarbeitet.\n\n7.3 Aufbewahrung. Daten werden während der Dauer der Bankbeziehung und mindestens 10 Jahre nach Kontoauflösung aufbewahrt." },
    { title: "Art. 8 — Kündigung und Kontoauflösung", content: "Der Kunde kann den Bankvertrag jederzeit schriftlich kündigen und die Kontoauflösung beantragen, vorbehaltlich der Erfüllung aller laufenden Verpflichtungen. Die Bank führt die Auflösung innerhalb von 30 Tagen nach Eingang des vollständigen Antrags durch.\n\nDie Bank kann mit einer Vorankündigung von 30 Tagen kündigen bei Verletzung der vorliegenden AGB, begründetem Betrugsverdacht oder Kontolosigkeit während 5 aufeinanderfolgender Jahre." },
    { title: "Art. 9 — Anwendbares Recht und Gerichtsstand", content: "Die vorliegenden AGB und sämtliche Vertragsbeziehungen unterliegen ausschliesslich Schweizer Recht. Für alle Streitigkeiten vereinbaren die Parteien einen ausschliesslichen Gerichtsstand in Genf, vorbehaltlich des Rechts des Kunden, den Schweizerischen Bankombud (www.bankingombudsman.ch) anzurufen.\n\nDiese AGB wurden im November 2024 überarbeitet und treten am 1. Januar 2025 in Kraft." },
  ],
  fr: [
    { title: "Art. 1 — Définitions et champ d'application", content: "Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'ensemble des relations contractuelles entre SwizKote Bank SA et toute personne physique ou morale (ci-après « le Client ») utilisant les services bancaires et la plateforme digitale de SwizKote Bank.\n\nLa Banque est agréée et soumise à la surveillance de l'Autorité fédérale de surveillance des marchés financiers (FINMA), conformément à la Loi fédérale sur les banques (LB) du 8 novembre 1934.\n\nL'utilisation de tout service de SwizKote Bank implique l'acceptation sans réserve des présentes CGU dans leur intégralité." },
    { title: "Art. 2 — Ouverture et gestion de compte", content: "2.1 Conditions d'ouverture. L'ouverture d'un compte auprès de SwizKote Bank est soumise à la fourniture de documents d'identité valides, à la vérification KYC conformément à la LBA et aux directives FINMA.\n\n2.2 Identification. Le Client est seul responsable de la confidentialité de ses identifiants de connexion. Tout accès réalisé avec les identifiants du Client est présumé émanant de ce dernier, sauf preuve contraire apportée dans les 48 heures." },
    { title: "Art. 3 — Services bancaires et transactions", content: "3.1 Virements. Les virements SEPA sont exécutés selon les délais standards D+1 pour les opérations intrabancaires et D+2 pour les virements interbancaires.\n\n3.2 Limites de transactions. Des limites quotidiennes et hebdomadaires s'appliquent aux virements et retraits.\n\n3.3 Révocabilité. Un virement peut être révoqué uniquement avant son exécution définitive.\n\n3.4 Responsabilité en cas de fraude. En cas de transactions frauduleuses, le Client doit en informer la Banque dans les meilleurs délais et au plus tard dans les 13 mois." },
    { title: "Art. 4 — Tarification et frais bancaires", content: "Les frais applicables aux différents services sont définis dans la brochure tarifaire en vigueur. SwizKote Bank se réserve le droit de modifier sa tarification avec un préavis de 30 jours calendaires adressé au Client par voie électronique." },
    { title: "Art. 5 — Crédits et prêts bancaires", content: "5.1 Octroi de crédit. L'octroi de tout crédit est subordonné à une analyse de solvabilité préalable du Client, incluant la consultation des centrales d'information sur le crédit (ZEK, IKO).\n\n5.2 Défaut de paiement. En cas de défaut de paiement, des intérêts de retard au taux légal majoré de 2 points seront appliqués dès le 10ème jour suivant l'échéance." },
    { title: "Art. 6 — Sécurité et authentification forte", content: "6.1 Authentification forte (2FA). La Banque applique l'authentification forte (SCA) pour l'ensemble des connexions et transactions conformément aux recommandations de la FINMA. Le Client s'engage à ne jamais partager ses codes OTP.\n\n6.2 Signalement d'incidents. Tout incident de sécurité doit être signalé immédiatement via la messagerie sécurisée ou par téléphone au +41 22 000 00 00." },
    { title: "Art. 7 — Secret bancaire et protection des données", content: "7.1 Secret bancaire. SwizKote Bank est soumise au secret bancaire suisse tel que défini à l'article 47 de la LB.\n\n7.2 Traitement des données personnelles. Conformément à la LPD révisée et au RGPD, les données personnelles du Client sont traitées licitement, de bonne foi et de manière proportionnée.\n\n7.3 Conservation des données. Les données sont conservées pendant la durée de la relation bancaire et pendant 10 ans minimum après la clôture du compte." },
    { title: "Art. 8 — Résiliation et clôture de compte", content: "Le Client peut résilier le contrat bancaire et demander la clôture de son compte à tout moment par notification écrite. La Banque procède à la clôture effective dans un délai de 30 jours.\n\nLa Banque peut procéder à la résiliation unilatérale avec un préavis de 30 jours en cas de violation des présentes CGU." },
    { title: "Art. 9 — Droit applicable et for juridique", content: "Les présentes CGU sont régies exclusivement par le droit suisse. Les parties conviennent d'un for exclusif à Genève, sous réserve du droit du Client de saisir le Médiateur bancaire suisse (www.bankingombudsman.ch).\n\nCes CGU ont été révisées en novembre 2024 et entrent en vigueur le 1er janvier 2025." },
  ],
  en: [
    { title: "Art. 1 — Definitions and Scope", content: "These General Terms and Conditions (hereinafter 'GTC') govern all contractual relationships between SwizKote Bank SA (hereinafter 'the Bank'), a company incorporated under Swiss law with registered office at Rue du Rhône 42, 1204 Geneva, Switzerland, and any natural or legal person (hereinafter 'the Client') using the banking services and digital platform of SwizKote Bank.\\n\\nThe Bank is licensed and subject to the supervision of the Swiss Financial Market Supervisory Authority (FINMA) in accordance with the Federal Banking Act (BA) of November 8, 1934.\\n\\nThe use of any service of SwizKote Bank implies unconditional acceptance of these GTC in their entirety." },
    { title: "Art. 2 — Account Opening and Management", content: "2.1 Opening conditions. Opening an account with SwizKote Bank requires valid identity documents, KYC verification in accordance with the AMLA and FINMA guidelines. The Bank reserves the right to refuse any account opening request without giving reasons.\\n\\n2.2 Identification. The Client is solely responsible for the confidentiality of their login credentials. Any access made with the Client's credentials is presumed to be made by the Client, unless proven otherwise within 48 hours of discovering unauthorized access." },
    { title: "Art. 3 — Banking Services and Transactions", content: "3.1 Transfers. SEPA transfers are executed according to standard deadlines of D+1 for intra-bank transactions and D+2 for interbank transactions, excluding public holidays.\\n\\n3.2 Transaction limits. Daily and weekly limits apply to transfers and withdrawals as defined in the fee schedule.\\n\\n3.3 Revocability. A transfer can only be revoked before its final execution.\\n\\n3.4 Fraud liability. In case of fraudulent transactions, the Client must inform the Bank promptly and no later than 13 months after the debit date." },
    { title: "Art. 4 — Pricing and Banking Fees", content: "The fees applicable to the various services are set out in the current fee schedule available on our website and provided to the Client upon account opening. SwizKote Bank reserves the right to modify its pricing with 30 calendar days' notice." },
    { title: "Art. 5 — Credits and Loans", content: "5.1 Credit granting. The granting of any credit is subject to a prior creditworthiness assessment of the Client, including consultation of credit information bureaus (ZEK, IKO). The Bank reserves the right to refuse any application without giving reasons.\\n\\n5.2 Late payment interest. In case of payment default, late interest at the legal rate plus 2 percentage points will apply automatically from the 10th day after the due date." },
    { title: "Art. 6 — Security and Strong Authentication", content: "6.1 Strong Authentication (2FA). The Bank applies strong customer authentication (SCA) for all logins and transactions in accordance with FINMA recommendations. The Client undertakes never to share their OTP codes or other authentication factors.\\n\\n6.2 Incident reporting. Any security incident or suspicious access must be immediately reported via the secure messaging of the client portal or by telephone at +41 22 000 00 00." },
    { title: "Art. 7 — Banking Secrecy and Data Protection", content: "7.1 Banking secrecy. SwizKote Bank is subject to Swiss banking secrecy as defined in Article 47 of the Federal Banking Act. This secrecy protects information relating to the Client's assets, transactions, and financial situation.\\n\\n7.2 Data protection. In accordance with the revised Federal Data Protection Act (FDPA) and the GDPR for EU residents, the Client's personal data is processed lawfully, in good faith, and proportionately.\\n\\n7.3 Retention. Data is retained for the duration of the banking relationship and at least 10 years after account closure." },
    { title: "Art. 8 — Termination and Account Closure", content: "The Client may terminate the banking contract and request account closure at any time by written notice, subject to fulfillment of all outstanding obligations. The Bank proceeds with closure within 30 days of receiving the complete request.\\n\\nThe Bank may terminate with 30 days' notice in case of violation of these GTC, reasonable suspicion of fraud, or account inactivity for 5 consecutive years." },
    { title: "Art. 9 — Applicable Law and Jurisdiction", content: "These GTC and all contractual relationships are governed exclusively by Swiss law. The parties agree on an exclusive place of jurisdiction in Geneva, without prejudice to the Client's right to appeal to the Swiss Banking Ombudsman (www.bankingombudsman.ch).\\n\\nThese GTC were revised in November 2024 and come into force on January 1, 2025." },
  ],
  it: [
    { title: "Art. 1 — Definizioni e campo di applicazione", content: "Le presenti Condizioni Generali di Utilizzo (di seguito «CGU») disciplinano l'insieme dei rapporti contrattuali tra SwizKote Bank SA (di seguito «la Banca»), società di diritto svizzero con sede legale in Rue du Rhône 42, 1204 Ginevra, Svizzera, e qualsiasi persona fisica o giuridica (di seguito «il Cliente») che utilizza i servizi bancari e la piattaforma digitale di SwizKote Bank.\\n\\nLa Banca è autorizzata e sottoposta alla vigilanza dell'Autorità federale di vigilanza sui mercati finanziari (FINMA) ai sensi della Legge federale sulle banche (LBCR) dell'8 novembre 1934.\\n\\nL'utilizzo di qualsiasi servizio di SwizKote Bank implica l'accettazione senza riserve delle presenti CGU nella loro totalità." },
    { title: "Art. 2 — Apertura e gestione del conto", content: "2.1 Condizioni di apertura. L'apertura di un conto presso SwizKote Bank è subordinata alla presentazione di documenti d'identità validi, alla verifica KYC ai sensi della LRD e delle direttive FINMA. La Banca si riserva il diritto di rifiutare qualsiasi domanda di apertura di conto senza obbligo di motivazione.\\n\\n2.2 Identificazione. Il Cliente è l'unico responsabile della riservatezza delle proprie credenziali di accesso. Qualsiasi accesso effettuato con le credenziali del Cliente si presume provenire da quest'ultimo, salvo prova contraria entro 48 ore dalla constatazione di un accesso non autorizzato." },
    { title: "Art. 3 — Servizi bancari e transazioni", content: "3.1 Bonifici. I bonifici SEPA sono eseguiti secondo i termini standard D+1 per le operazioni intrabancarie e D+2 per i bonifici interbancari, esclusi i giorni festivi.\\n\\n3.2 Limiti di transazione. Limiti giornalieri e settimanali si applicano ai bonifici e ai prelievi come definiti nel tariffario.\\n\\n3.3 Revocabilità. Un bonifico può essere revocato solo prima della sua esecuzione definitiva.\\n\\n3.4 Responsabilità in caso di frode. In caso di transazioni fraudolente, il Cliente deve informare la Banca tempestivamente e al più tardi entro 13 mesi dalla data di addebito." },
    { title: "Art. 4 — Tariffazione e commissioni bancarie", content: "Le commissioni applicabili ai vari servizi sono definite nel tariffario vigente disponibile sul nostro sito web. SwizKote Bank si riserva il diritto di modificare la propria tariffazione con un preavviso di 30 giorni di calendario." },
    { title: "Art. 5 — Crediti e prestiti bancari", content: "5.1 Concessione del credito. La concessione di qualsiasi credito è subordinata a una preventiva analisi della solvibilità del Cliente, compresa la consultazione delle centrali di informazioni sul credito (ZEK, IKO). La Banca si riserva il diritto di rifiutare qualsiasi domanda senza obbligo di motivazione.\\n\\n5.2 Interessi di mora. In caso di inadempimento, si applicheranno automaticamente interessi di mora al tasso legale maggiorato di 2 punti percentuali a partire dal 10° giorno successivo alla scadenza." },
    { title: "Art. 6 — Sicurezza e autenticazione forte", content: "6.1 Autenticazione forte (2FA). La Banca applica l'autenticazione forte del cliente (SCA) per tutti gli accessi e le transazioni conformemente alle raccomandazioni FINMA. Il Cliente si impegna a non condividere mai i propri codici OTP o altri fattori di autenticazione.\\n\\n6.2 Segnalazione di incidenti. Qualsiasi incidente di sicurezza o accesso sospetto deve essere segnalato immediatamente tramite la messaggistica sicura del portale clienti o telefonicamente al +41 22 000 00 00." },
    { title: "Art. 7 — Segreto bancario e protezione dei dati", content: "7.1 Segreto bancario. SwizKote Bank è soggetta al segreto bancario svizzero come definito all'articolo 47 della LBCR. Questo segreto protegge le informazioni relative al patrimonio, alle transazioni e alla situazione finanziaria del Cliente.\\n\\n7.2 Protezione dei dati. In conformità con la Legge federale sulla protezione dei dati (LPD) revisionata e il GDPR per i residenti UE, i dati personali del Cliente sono trattati lecitamente, in buona fede e in modo proporzionato.\\n\\n7.3 Conservazione. I dati sono conservati per la durata del rapporto bancario e per almeno 10 anni dopo la chiusura del conto." },
    { title: "Art. 8 — Risoluzione e chiusura del conto", content: "Il Cliente può risolvere il contratto bancario e richiedere la chiusura del conto in qualsiasi momento mediante comunicazione scritta. La Banca procede alla chiusura entro 30 giorni dal ricevimento della domanda completa.\\n\\nLa Banca può recedere con un preavviso di 30 giorni in caso di violazione delle presenti CGU, ragionevole sospetto di frode o inattività del conto per 5 anni consecutivi." },
    { title: "Art. 9 — Legge applicabile e foro competente", content: "Le presenti CGU e tutti i rapporti contrattuali sono disciplinati esclusivamente dal diritto svizzero. Le parti concordano un foro esclusivo a Ginevra, fermo restando il diritto del Cliente di ricorrere al Mediatore bancario svizzero (www.bankingombudsman.ch).\\n\\nLe presenti CGU sono state riviste nel novembre 2024 ed entrano in vigore il 1° gennaio 2025." },
  ],
};

export default function TermsPage() {
  const { lang } = useI18n();
  const safeKey = (lang === "fr" || lang === "de" || lang === "en" || lang === "it") ? lang : "fr";
  const articles = ARTICLES[safeKey];
  const de = lang === "de";
  const en = lang === "en";
  const it = lang === "it";

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-4">
              <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" />
                {de ? "Zurück" : en ? "Back" : it ? "Indietro" : "Retour"}
              </Button></Link>
              <div className="flex items-center gap-1.5">
                <img src={logoImg} alt="SwizKote Bank" className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="text-base sm:text-lg font-bold tracking-tight" style={{ whiteSpace: "nowrap" }}>SwizKote <span className="text-gold">Bank</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2"><LangSwitcher /><ThemeToggle /></div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-gold" />
          <h1 className="text-3xl md:text-4xl font-bold">
            {de ? "Allgemeine Geschäftsbedingungen" : en ? "Terms and Conditions" : it ? "Termini e Condizioni" : "Conditions Générales d'Utilisation"}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
          <span>Version 3.2</span><span>·</span>
          <span>{de ? "Gültig ab 1. Januar 2025" : en ? "Effective January 1, 2025" : it ? "In vigore dal 1° gennaio 2025" : "En vigueur au 1er janvier 2025"}</span><span>·</span>
          <span>{de ? "SwizKote Bank AG" : "SwizKote Bank SA"}</span>
        </div>
        <div className="p-4 rounded-lg border border-gold/20 bg-gold/5 mb-8">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{de ? "Wichtig:" : en ? "Important:" : it ? "Importante:" : "Important :"}</strong>{" "}
            {de ? "Durch die Nutzung der Dienste der SwizKote Bank AG akzeptieren Sie diese Allgemeinen Geschäftsbedingungen vorbehaltlos. Bei Fragen: "
              : en ? "By using SwizKote Bank SA services, you unconditionally accept these terms and conditions. For questions: "
              : it ? "Utilizzando i servizi di SwizKote Bank SA, accetti senza riserve le presenti condizioni generali. Per domande: "
              : "En utilisant les services de SwizKote Bank SA, vous acceptez sans réserve les présentes conditions générales. Pour toute question : "}
            <a href="mailto:legal@swizkote.ch" className="text-gold hover:underline">legal@swizkote.ch</a>
          </p>
        </div>
        <div className="space-y-8">
          {articles.map((article, i) => (
            <article key={i} className="pb-8 border-b last:border-b-0">
              <h2 className="text-lg font-bold text-gold mb-4">{article.title}</h2>
              <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{article.content}</div>
            </article>
          ))}
        </div>
        <div className="mt-12 p-6 rounded-xl border bg-card text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {de ? "Bei Fragen zu diesen Bedingungen:" : en ? "For questions about these terms:" : it ? "Per domande su queste condizioni:" : "Pour toute question relative aux présentes conditions :"}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="mailto:legal@swizkote.ch" className="text-gold hover:underline">legal@swizkote.ch</a>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">+41 22 000 00 00</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">Rue du Rhône 42, 1204 {de ? "Genf" : en ? "Geneva" : it ? "Ginevra" : "Genève"}</span>
          </div>
        </div>
      </div>

      <footer className="border-t bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© 2026 {de ? "SwizKote Bank AG" : "SwizKote Bank SA"} —{" "}
            <Link href="/privacy" className="hover:text-foreground">{de ? "Datenschutz" : en ? "Privacy" : it ? "Privacy" : "Confidentialité"}</Link>
            {" · "}
            <Link href="/legal" className="hover:text-foreground">{de ? "Impressum" : en ? "Legal" : it ? "Note Legali" : "Mentions légales"}</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
