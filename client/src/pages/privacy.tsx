import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";
const logoImg = "/logo.png";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (<Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>);
}

const DATA_RIGHTS = {
  de: [
    { icon: Eye, title: "Auskunftsrecht", desc: "Sie können eine Kopie aller Ihrer bei SWIZKOTE gespeicherten persönlichen Daten anfordern." },
    { icon: UserCheck, title: "Recht auf Berichtigung", desc: "Sie können die Korrektur unrichtiger Sie betreffender Daten verlangen." },
    { icon: Database, title: "Recht auf Löschung", desc: "Unter bestimmten gesetzlichen Voraussetzungen können Sie die Löschung Ihrer Daten verlangen." },
    { icon: Lock, title: "Recht auf Einschränkung", desc: "In bestimmten Fällen können Sie die Einschränkung der Verarbeitung Ihrer Daten verlangen." },
    { icon: Shield, title: "Recht auf Datenübertragbarkeit", desc: "Sie können Ihre Daten in einem strukturierten, maschinenlesbaren Format erhalten." },
    { icon: Mail, title: "Widerspruchsrecht", desc: "Sie können der Verarbeitung Ihrer Daten für Direktmarketingzwecke widersprechen." },
  ],
  fr: [
    { icon: Eye, title: "Droit d'accès", desc: "Vous pouvez obtenir une copie de toutes vos données personnelles détenues par SWIZKOTE." },
    { icon: UserCheck, title: "Droit de rectification", desc: "Vous pouvez demander la correction de toute donnée inexacte vous concernant." },
    { icon: Database, title: "Droit à l'effacement", desc: "Dans certaines conditions légales, vous pouvez demander la suppression de vos données." },
    { icon: Lock, title: "Droit à la limitation", desc: "Vous pouvez demander la restriction du traitement de vos données dans certains cas." },
    { icon: Shield, title: "Droit à la portabilité", desc: "Vous pouvez recevoir vos données dans un format structuré et lisible par machine." },
    { icon: Mail, title: "Droit d'opposition", desc: "Vous pouvez vous opposer au traitement de vos données à des fins de marketing direct." },
  ],
  en: [
    { icon: Eye, title: "Right of Access", desc: "You can obtain a copy of all your personal data held by SWIZKOTE." },
    { icon: UserCheck, title: "Right of Rectification", desc: "You can request correction of any inaccurate data concerning you." },
    { icon: Database, title: "Right to Erasure", desc: "Under certain legal conditions, you can request deletion of your data." },
    { icon: Lock, title: "Right to Restriction", desc: "You can request restriction of the processing of your data in certain cases." },
    { icon: Shield, title: "Right to Data Portability", desc: "You can receive your data in a structured, machine-readable format." },
    { icon: Mail, title: "Right to Object", desc: "You can object to the processing of your data for direct marketing purposes." },
  ],
  it: [
    { icon: Eye, title: "Diritto di accesso", desc: "Puoi ottenere una copia di tutti i tuoi dati personali detenuti da SWIZKOTE." },
    { icon: UserCheck, title: "Diritto di rettifica", desc: "Puoi richiedere la correzione di qualsiasi dato inesatto che ti riguarda." },
    { icon: Database, title: "Diritto alla cancellazione", desc: "In determinate condizioni legali, puoi richiedere la cancellazione dei tuoi dati." },
    { icon: Lock, title: "Diritto alla limitazione", desc: "Puoi richiedere la limitazione del trattamento dei tuoi dati in alcuni casi." },
    { icon: Shield, title: "Diritto alla portabilità", desc: "Puoi ricevere i tuoi dati in un formato strutturato e leggibile da macchina." },
    { icon: Mail, title: "Diritto di opposizione", desc: "Puoi opporti al trattamento dei tuoi dati per finalità di marketing diretto." },
  ],
};

const DATA_CATS = {
  de: [
    { cat: "Identifikationsdaten", items: ["Name und Vorname","Geburtsdatum","Staatsangehörigkeit","Ausweisnummer","Post- und E-Mail-Adresse","Telefonnummer"] },
    { cat: "Finanzdaten", items: ["Kontoguthaben und -bewegungen","Transaktionshistorie","Kreditinformationen","Bankkartendate (teilweise)","Steuererklärungen (falls erforderlich)"] },
    { cat: "Technische Daten", items: ["IP-Adresse und Navigationsdaten","Gerätetyp und Betriebssystem","Anmeldedaten und Zugriffsprotokolle","Funktionale und analytische Cookies"] },
    { cat: "Verhaltensdaten", items: ["Nutzungsgewohnheiten der Dienste","Kontoeinstellungen und Präferenzen","Interaktionen mit unserem Kundendienst"] },
  ],
  fr: [
    { cat: "Données d'identification", items: ["Nom et prénom","Date de naissance","Nationalité","Numéro de pièce d'identité","Adresse postale et email","Numéro de téléphone"] },
    { cat: "Données financières", items: ["Soldes et mouvements de compte","Historique des transactions","Informations sur les prêts","Données de carte bancaire (partielles)","Déclarations fiscales (si requises)"] },
    { cat: "Données techniques", items: ["Adresse IP et données de navigation","Type d'appareil et système d'exploitation","Données de connexion et journaux d'accès","Cookies fonctionnels et analytiques"] },
    { cat: "Données comportementales", items: ["Habitudes d'utilisation des services","Préférences et paramètres du compte","Interactions avec notre service client"] },
  ],
  en: [
    { cat: "Identification data", items: ["Name and surname","Date of birth","Nationality","Identity document number","Postal and email address","Phone number"] },
    { cat: "Financial data", items: ["Account balances and movements","Transaction history","Loan information","Partial bank card data","Tax declarations (if required)"] },
    { cat: "Technical data", items: ["IP address and browsing data","Device type and operating system","Login data and access logs","Functional and analytical cookies"] },
    { cat: "Behavioral data", items: ["Service usage habits","Account preferences and settings","Interactions with customer service"] },
  ],
  it: [
    { cat: "Dati di identificazione", items: ["Nome e cognome","Data di nascita","Nazionalità","Numero del documento d'identità","Indirizzo postale ed email","Numero di telefono"] },
    { cat: "Dati finanziari", items: ["Saldi e movimenti del conto","Storico delle transazioni","Informazioni sui prestiti","Dati parziali della carta bancaria","Dichiarazioni fiscali (se richieste)"] },
    { cat: "Dati tecnici", items: ["Indirizzo IP e dati di navigazione","Tipo di dispositivo e sistema operativo","Dati di accesso e log","Cookie funzionali e analitici"] },
    { cat: "Dati comportamentali", items: ["Abitudini di utilizzo dei servizi","Preferenze e impostazioni del conto","Interazioni con il servizio clienti"] },
  ],
};

export default function PrivacyPage() {
  const { lang } = useI18n();
  const de = lang === "de";
  const safeKey = (lang === "fr" || lang === "de" || lang === "en" || lang === "it") ? lang : "fr";
  const en = lang === "en";
  const it = lang === "it";
  const rights = DATA_RIGHTS[safeKey];
  const cats = DATA_CATS[safeKey];

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
                <img src={logoImg} alt="SWIZKOTE" className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="text-base sm:text-lg font-bold tracking-tight" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</span>
              </div>
            </div>
            <div className="flex items-center gap-2"><LangSwitcher /><ThemeToggle /></div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-gold" />
          <h1 className="text-3xl md:text-4xl font-bold">
            {de ? "Datenschutzrichtlinie" : en ? "Privacy Policy" : it ? "Informativa sulla Privacy" : "Politique de Confidentialité"}
          </h1>
        </div>
        <div className="text-sm text-muted-foreground mb-8 pb-8 border-b">
          {de ? "Letzte Aktualisierung: 15. November 2024 · SWIZKOTE SA · Konform mit DSG (Schweiz) & DSGVO (EU)"
            : en ? "Last updated: November 15, 2024 · SWIZKOTE SA · Compliant with FADP (Switzerland) & GDPR (EU)"
            : it ? "Ultimo aggiornamento: 15 novembre 2024 · SWIZKOTE SA · Conforme LPD (Svizzera) & GDPR (UE)"
            : "Dernière mise à jour : 15 novembre 2024 · SWIZKOTE SA · Conforme LPD (Suisse) & RGPD (UE)"}
        </div>

        <div className="p-5 rounded-xl border border-gold/20 bg-gold/5 mb-10">
          <p className="text-sm leading-relaxed">
            {de ? "Bei SWIZKOTE hat der Schutz Ihrer Privatsphäre höchste Priorität. Diese Richtlinie erklärt transparent, welche Daten wir erheben, warum wir sie erheben und wie wir sie schützen."
              : en ? "At SWIZKOTE, protecting your privacy is an absolute priority. This policy transparently explains what data we collect, why we collect it, and how we protect it. SWIZKOTE SA is the data controller for the processing of your personal data under the revised FADP and GDPR for EU residents."
              : it ? "In SWIZKOTE, la protezione della tua privacy è una priorità assoluta. Questa politica spiega in modo trasparente quali dati raccogliamo, perché li raccogliamo e come li proteggiamo. SWIZKOTE SA è il responsabile del trattamento dei dati personali ai sensi della LPD revisionata e del GDPR per i residenti UE."
              : "Chez SWIZKOTE, la protection de votre vie privée est une priorité absolue. Cette politique explique de manière transparente quelles données nous collectons, pourquoi nous les collectons et comment nous les protégeons. SWIZKOTE SA est le responsable du traitement de vos données personnelles au sens de la LPD révisée et du RGPD pour les résidents de l'UE."}
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-gold mb-4">
              {de ? "1. Erhobene Daten" : en ? "1. Data Collected" : it ? "1. Dati raccolti" : "1. Données collectées"}
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              {de ? "Wir erheben nur die für die Erbringung unserer Bankdienstleistungen unbedingt erforderlichen Daten:"
                : en ? "We collect only data strictly necessary for providing our banking services:"
                : it ? "Raccogliamo solo i dati strettamente necessari per la fornitura dei nostri servizi bancari:"
                : "Nous collectons uniquement les données strictement nécessaires à la fourniture de nos services bancaires :"}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {cats.map((cat, i) => (
                <div key={i} className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-sm mb-3">{cat.cat}</h3>
                  <ul className="space-y-1">
                    {cat.items.map((item, j) => (
                      <li key={j} className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gold mb-4">
              {de ? "2. Rechtsgrundlagen der Verarbeitung" : en ? "2. Legal Bases for Processing" : it ? "2. Basi giuridiche del trattamento" : "2. Bases légales du traitement"}
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              {de ? <>
                <p><strong className="text-foreground">Vertragserfüllung:</strong> Die Verarbeitung ist zur Erfüllung des Bankvertrages erforderlich (Kontoverwaltung, Überweisungen, Kredit).</p>
                <p><strong className="text-foreground">Gesetzliche Verpflichtung:</strong> Einige Verarbeitungen sind gesetzlich vorgeschrieben (GwG, FATCA, CRS, FINMA).</p>
                <p><strong className="text-foreground">Berechtigtes Interesse:</strong> Betrugsverhinderung, Systemsicherheit und Serviceverbesserung.</p>
                <p><strong className="text-foreground">Einwilligung:</strong> Für Marketingkommunikation — jederzeit widerrufbar.</p>
              </> : en ? <>
                <p><strong className="text-foreground">Contract performance:</strong> Processing is necessary to perform the banking contract (account management, transfers, credit).</p>
                <p><strong className="text-foreground">Legal obligation:</strong> Some processing is required by law (AMLA, FATCA, CRS, FINMA requirements).</p>
                <p><strong className="text-foreground">Legitimate interest:</strong> Fraud prevention, system security and service improvement.</p>
                <p><strong className="text-foreground">Consent:</strong> For marketing communications only — revocable at any time.</p>
              </> : it ? <>
                <p><strong className="text-foreground">Esecuzione del contratto:</strong> Il trattamento è necessario per l'esecuzione del contratto bancario (gestione conto, bonifici, credito).</p>
                <p><strong className="text-foreground">Obbligo legale:</strong> Alcuni trattamenti sono imposti dalla legge (LRD, FATCA, CRS, requisiti FINMA).</p>
                <p><strong className="text-foreground">Interesse legittimo:</strong> Prevenzione frodi, sicurezza dei sistemi e miglioramento dei servizi.</p>
                <p><strong className="text-foreground">Consenso:</strong> Solo per comunicazioni marketing — revocabile in qualsiasi momento.</p>
              </> : <>
                <p><strong className="text-foreground">Exécution du contrat:</strong> Le traitement est nécessaire à l'exécution du contrat bancaire (gestion de compte, virements, crédit).</p>
                <p><strong className="text-foreground">Obligation légale:</strong> Certains traitements sont imposés par la loi (LBA, FATCA, CRS, exigences FINMA).</p>
                <p><strong className="text-foreground">Intérêt légitime:</strong> La prévention de la fraude, la sécurité des systèmes et l'amélioration de nos services.</p>
                <p><strong className="text-foreground">Consentement:</strong> Pour les communications marketing uniquement, révocable à tout moment.</p>
              </>}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gold mb-6">
              {de ? "3. Ihre Rechte" : en ? "3. Your Rights" : it ? "3. I tuoi diritti" : "3. Vos droits"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rights.map((right, i) => {
                const Icon = right.icon;
                return (
                  <div key={i} className="p-4 rounded-xl border bg-card">
                    <Icon className="w-5 h-5 text-gold mb-3" />
                    <h3 className="font-semibold text-sm mb-2">{right.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{right.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 p-4 rounded-lg border bg-muted/30 text-sm text-muted-foreground">
              {de ? "Zur Ausübung Ihrer Rechte kontaktieren Sie unseren Datenschutzbeauftragten (DSB):"
                : en ? "To exercise your rights, contact our Data Protection Officer (DPO):"
                : it ? "Per esercitare i tuoi diritti, contatta il nostro Responsabile della Protezione dei Dati (DPO):"
                : "Pour exercer vos droits, contactez notre Délégué à la Protection des Données (DPO) :"}
              <a href="mailto:dpo@swizkote.ch" className="text-gold hover:underline ml-1">dpo@swizkote.ch</a>
              <span className="mx-2">·</span>
              {de ? "Antwortfrist: maximal 30 Kalendertage."
                : en ? "Response time: maximum 30 calendar days."
                : it ? "Tempo di risposta: massimo 30 giorni di calendario."
                : "Délai de réponse : 30 jours calendaires maximum."}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gold mb-4">
              {de ? "4. Schweizer Bankgeheimnis — Formelles Engagement"
                : en ? "4. Swiss Banking Secrecy — Formal Commitment"
                : it ? "4. Segreto Bancario Svizzero — Impegno Formale"
                : "4. Secret Bancaire Suisse — Engagement Formel"}
            </h2>
            <div className="p-5 rounded-xl border border-gold/20 bg-gold/5 text-sm text-muted-foreground space-y-3">
              <p className="font-semibold text-foreground">
                {de ? "SCHWEIZER BANKGEHEIMNIS — FORMELLES ENGAGEMENT"
                  : en ? "SWISS BANKING SECRECY — FORMAL COMMITMENT"
                  : it ? "SEGRETO BANCARIO SVIZZERO — IMPEGNO FORMALE"
                  : "SECRET BANCAIRE SUISSE — ENGAGEMENT FORMEL"}
              </p>
              <p>{de ? "Die SWIZKOTE SA verpflichtet sich förmlich zur Wahrung des Schweizer Bankgeheimnisses gemäss Artikel 47 BankG. Alle Mitarbeitenden sind auch nach Beendigung ihres Arbeitsverhältnisses gebunden."
                : en ? "SWIZKOTE SA formally commits to upholding Swiss banking secrecy pursuant to Article 47 of the Banking Act. All employees are bound by banking secrecy, including after the end of their employment."
                : it ? "SWIZKOTE SA si impegna formalmente a rispettare il segreto bancario svizzero ai sensi dell'articolo 47 della LBCR. Tutti i dipendenti sono vincolati dal segreto bancario, anche dopo la cessazione del rapporto di lavoro."
                : "SWIZKOTE SA s'engage formellement à préserver le secret bancaire suisse conformément à l'article 47 de la Loi fédérale sur les banques. Tout collaborateur de la Banque est tenu par le secret bancaire, y compris après la fin de sa relation de travail."}</p>
              <p>{de ? "Ihre Finanzinformationen werden niemals an Dritte weitergegeben, ausser in gesetzlich vorgesehenen Fällen."
                : en ? "Your financial information will never be disclosed to third parties, except in cases provided for by law."
                : it ? "Le tue informazioni finanziarie non saranno mai divulgate a terzi, tranne nei casi previsti dalla legge."
                : "Vos informations financières ne seront jamais divulgués à des tiers, sauf dans les cas prévus par la loi suisse."}</p>
            </div>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-xl border bg-card text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {de ? "Fragen zum Datenschutz:" : en ? "Privacy questions:" : it ? "Domande sulla privacy:" : "Questions relatives à votre vie privée :"}
          </p>
          <a href="mailto:dpo@swizkote.ch" className="text-gold font-semibold hover:underline">dpo@swizkote.ch</a>
          <span className="text-muted-foreground mx-3">·</span>
          <span className="text-sm text-muted-foreground">
            {de ? "Datenschutzbeauftragter — SWIZKOTE SA"
              : en ? "Data Protection Officer — SWIZKOTE SA"
              : it ? "Responsabile della Protezione dei Dati — SWIZKOTE SA"
              : "Délégué à la Protection des Données — SWIZKOTE SA"}
          </span>
        </div>
      </div>

      <footer className="border-t bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© 2024 SWIZKOTE SA —{" "}
            <Link href="/terms" className="hover:text-foreground">{de ? "AGB" : en ? "Terms" : it ? "Termini" : "CGU"}</Link>
            {" · "}
            <Link href="/legal" className="hover:text-foreground">{de ? "Impressum" : en ? "Legal" : it ? "Note Legali" : "Mentions légales"}</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
