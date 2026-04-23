import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Lock, Shield, Globe, ChevronLeft, ChevronRight, User, Calendar, Flag, CreditCard, MapPin, Phone, ChevronDown } from "lucide-react";
import { LangSwitcher } from "@/components/lang-switcher";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
const logoImg = "/logo.png";

// ─── Liste des pays d'Europe pour la nationalité ──────────────────────────────
const EUROPEAN_COUNTRIES = [
  { code: "AL", name: "Albanie", fr: "Albanie", de: "Albanien", en: "Albania", it: "Albania", flag: "🇦🇱" },
  { code: "DE", name: "Allemagne", fr: "Allemagne", de: "Deutschland", en: "Germany", it: "Germania", flag: "🇩🇪" },
  { code: "AD", name: "Andorre", fr: "Andorre", de: "Andorra", en: "Andorra", it: "Andorra", flag: "🇦🇩" },
  { code: "AT", name: "Autriche", fr: "Autriche", de: "Österreich", en: "Austria", it: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Belgique", fr: "Belgique", de: "Belgien", en: "Belgium", it: "Belgio", flag: "🇧🇪" },
  { code: "BY", name: "Biélorussie", fr: "Biélorussie", de: "Weißrussland", en: "Belarus", it: "Bielorussia", flag: "🇧🇾" },
  { code: "BA", name: "Bosnie-Herzégovine", fr: "Bosnie-Herzégovine", de: "Bosnien und Herzegowina", en: "Bosnia and Herzegovina", it: "Bosnia ed Erzegovina", flag: "🇧🇦" },
  { code: "BG", name: "Bulgarie", fr: "Bulgarie", de: "Bulgarien", en: "Bulgaria", it: "Bulgaria", flag: "🇧🇬" },
  { code: "HR", name: "Croatie", fr: "Croatie", de: "Kroatien", en: "Croatia", it: "Croazia", flag: "🇭🇷" },
  { code: "DK", name: "Danemark", fr: "Danemark", de: "Dänemark", en: "Denmark", it: "Danimarca", flag: "🇩🇰" },
  { code: "ES", name: "Espagne", fr: "Espagne", de: "Spanien", en: "Spain", it: "Spagna", flag: "🇪🇸" },
  { code: "EE", name: "Estonie", fr: "Estonie", de: "Estland", en: "Estonia", it: "Estonia", flag: "🇪🇪" },
  { code: "FI", name: "Finlande", fr: "Finlande", de: "Finnland", en: "Finland", it: "Finlandia", flag: "🇫🇮" },
  { code: "FR", name: "France", fr: "France", de: "Frankreich", en: "France", it: "Francia", flag: "🇫🇷" },
  { code: "GE", name: "Géorgie", fr: "Géorgie", de: "Georgien", en: "Georgia", it: "Georgia", flag: "🇬🇪" },
  { code: "GR", name: "Grèce", fr: "Grèce", de: "Griechenland", en: "Greece", it: "Grecia", flag: "🇬🇷" },
  { code: "HU", name: "Hongrie", fr: "Hongrie", de: "Ungarn", en: "Hungary", it: "Ungheria", flag: "🇭🇺" },
  { code: "IE", name: "Irlande", fr: "Irlande", de: "Irland", en: "Ireland", it: "Irlanda", flag: "🇮🇪" },
  { code: "IS", name: "Islande", fr: "Islande", de: "Island", en: "Iceland", it: "Islanda", flag: "🇮🇸" },
  { code: "IT", name: "Italie", fr: "Italie", de: "Italien", en: "Italy", it: "Italia", flag: "🇮🇹" },
  { code: "XK", name: "Kosovo", fr: "Kosovo", de: "Kosovo", en: "Kosovo", it: "Kosovo", flag: "🇽🇰" },
  { code: "LV", name: "Lettonie", fr: "Lettonie", de: "Lettland", en: "Latvia", it: "Lettonia", flag: "🇱🇻" },
  { code: "LI", name: "Liechtenstein", fr: "Liechtenstein", de: "Liechtenstein", en: "Liechtenstein", it: "Liechtenstein", flag: "🇱🇮" },
  { code: "LT", name: "Lituanie", fr: "Lituanie", de: "Litauen", en: "Lithuania", it: "Lituania", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", fr: "Luxembourg", de: "Luxemburg", en: "Luxembourg", it: "Lussemburgo", flag: "🇱🇺" },
  { code: "MK", name: "Macédoine du Nord", fr: "Macédoine du Nord", de: "Nordmazedonien", en: "North Macedonia", it: "Macedonia del Nord", flag: "🇲🇰" },
  { code: "MT", name: "Malte", fr: "Malte", de: "Malta", en: "Malta", it: "Malta", flag: "🇲🇹" },
  { code: "MD", name: "Moldavie", fr: "Moldavie", de: "Moldawien", en: "Moldova", it: "Moldavia", flag: "🇲🇩" },
  { code: "MC", name: "Monaco", fr: "Monaco", de: "Monaco", en: "Monaco", it: "Monaco", flag: "🇲🇨" },
  { code: "ME", name: "Monténégro", fr: "Monténégro", de: "Montenegro", en: "Montenegro", it: "Montenegro", flag: "🇲🇪" },
  { code: "NO", name: "Norvège", fr: "Norvège", de: "Norwegen", en: "Norway", it: "Norvegia", flag: "🇳🇴" },
  { code: "NL", name: "Pays-Bas", fr: "Pays-Bas", de: "Niederlande", en: "Netherlands", it: "Paesi Bassi", flag: "🇳🇱" },
  { code: "PL", name: "Pologne", fr: "Pologne", de: "Polen", en: "Poland", it: "Polonia", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", fr: "Portugal", de: "Portugal", en: "Portugal", it: "Portogallo", flag: "🇵🇹" },
  { code: "CZ", name: "République tchèque", fr: "République tchèque", de: "Tschechien", en: "Czech Republic", it: "Repubblica Ceca", flag: "🇨🇿" },
  { code: "RO", name: "Roumanie", fr: "Roumanie", de: "Rumänien", en: "Romania", it: "Romania", flag: "🇷🇴" },
  { code: "GB", name: "Royaume-Uni", fr: "Royaume-Uni", de: "Vereinigtes Königreich", en: "United Kingdom", it: "Regno Unito", flag: "🇬🇧" },
  { code: "RU", name: "Russie", fr: "Russie", de: "Russland", en: "Russia", it: "Russia", flag: "🇷🇺" },
  { code: "SM", name: "Saint-Marin", fr: "Saint-Marin", de: "San Marino", en: "San Marino", it: "San Marino", flag: "🇸🇲" },
  { code: "RS", name: "Serbie", fr: "Serbie", de: "Serbien", en: "Serbia", it: "Serbia", flag: "🇷🇸" },
  { code: "SK", name: "Slovaquie", fr: "Slovaquie", de: "Slowakei", en: "Slovakia", it: "Slovacchia", flag: "🇸🇰" },
  { code: "SI", name: "Slovénie", fr: "Slovénie", de: "Slowenien", en: "Slovenia", it: "Slovenia", flag: "🇸🇮" },
  { code: "SE", name: "Suède", fr: "Suède", de: "Schweden", en: "Sweden", it: "Svezia", flag: "🇸🇪" },
  { code: "CH", name: "Suisse", fr: "Suisse", de: "Schweiz", en: "Switzerland", it: "Svizzera", flag: "🇨🇭" },
  { code: "UA", name: "Ukraine", fr: "Ukraine", de: "Ukraine", en: "Ukraine", it: "Ucraina", flag: "🇺🇦" },
  { code: "VA", name: "Vatican", fr: "Vatican", de: "Vatikan", en: "Vatican City", it: "Città del Vaticano", flag: "🇻🇦" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

/* ── Sélecteur de pays européen personnalisé ── */
function CountrySelect({ id, value, onChange, required, disabled, lang }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCountryName = (country: typeof EUROPEAN_COUNTRIES[0]) => {
    if (lang === "de") return country.de;
    if (lang === "en") return country.en;
    if (lang === "it") return country.it;
    return country.fr;
  };

  const selectedCountry = EUROPEAN_COUNTRIES.find(c => c.code === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
        data-testid="button-country-select"
      >
        <span className={!selectedCountry ? "text-muted-foreground" : "flex items-center gap-2"}>
          {selectedCountry ? (
            <>
              <span className="text-base">{selectedCountry.flag}</span>
              <span>{getCountryName(selectedCountry)}</span>
            </>
          ) : (
            lang === "de" ? "Nationalität wählen" : 
            lang === "en" ? "Select nationality" : 
            lang === "it" ? "Seleziona nazionalità" : 
            "Sélectionner la nationalité"
          )}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {EUROPEAN_COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                onChange({ target: { id, value: country.code } } as any);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                value === country.code ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <span className="text-base">{country.flag}</span>
              <span>{getCountryName(country)}</span>
            </button>
          ))}
        </div>
      )}
      <input type="hidden" id={id} value={value} required={required} />
    </div>
  );
}

/* ── Password field with show/hide toggle ── */
function PasswordInput({ value, onChange, placeholder, required, autoComplete, disabled }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-stretch">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ paddingRight: "2.5rem" }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/* ── Select field styled to match inputs ── */
function SelectField({ id, value, onChange, required, disabled, children }: any) {
  return (
    <select
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

/* ── Main page ── */
export default function LoginPage() {
  const { t, lang } = useI18n();
  const de = lang === "de";
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const termsScrollRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthdate: "",
    nationality: "",
    accountType: "particular",
    address: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  /* Auto-switch to register tab on #inscription hash */
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#inscription") {
      setIsRegister(true);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    }
  }, []);

  /* Reset terms state when switching tabs */
  useEffect(() => {
    setTermsAccepted(false);
    setTermsScrolled(false);
  }, [isRegister]);

  const handleTermsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 40;
    if (atBottom) setTermsScrolled(true);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTermsPopup(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !termsAccepted) {
      setShowTermsPopup(true);
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        const fullName = `${form.firstName} ${form.lastName}`.trim();
        await register({
          username: form.username,
          password: form.password,
          fullName,
          email: form.email,
          phone: form.phone || undefined,
        });
        toast({ title: t("login_welcome"), description: t("login_welcome_desc") });
      } else {
        await login(form.username, form.password);
        toast({ title: t("login_success"), description: t("login_success_desc") });
      }
    } catch (err: any) {
      toast({ title: t("login_error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ── Terms & Conditions content by lang ── */
  const termsTitle = lang === "de" ? "Allgemeine Geschäftsbedingungen" : lang === "en" ? "Terms and Conditions" : lang === "it" ? "Termini e Condizioni" : "Conditions Générales d'Utilisation";
  const termsContent = lang === "de" ? [
    { title: "1. Vertragsgegenstand", body: "Diese Allgemeinen Geschäftsbedingungen regeln die Nutzung der digitalen Bankdienstleistungen der SWIZKOTE SA, einer nach Schweizer Recht gegründeten Gesellschaft mit Sitz in Genf. Mit der Eröffnung eines Kontos erkennen Sie diese Bedingungen vollumfänglich an." },
    { title: "2. Kontoeröffnung & Identitätsprüfung", body: "Die Kontoeröffnung setzt eine vollständige Identitätsprüfung (KYC) gemäss dem Geldwäschereigesetz (GwG) voraus. Sie verpflichten sich, wahrheitsgemässe und vollständige Angaben zu machen. SWIZKOTE behält sich vor, die Aktivierung des Kontos zu verzögern, bis die Prüfung abgeschlossen ist." },
    { title: "3. Nutzung der Dienstleistungen", body: "Die bereitgestellten Bankdienstleistungen dürfen ausschliesslich für legale Zwecke genutzt werden. Jede Verwendung im Zusammenhang mit Geldwäsche, Terrorismusfinanzierung oder sonstigen rechtswidrigen Aktivitäten ist streng untersagt und wird den zuständigen Behörden gemeldet." },
    { title: "4. Sicherheit & Zugangsdaten", body: "Sie sind verantwortlich für die Geheimhaltung Ihrer Zugangsdaten (Benutzername und Passwort). SWIZKOTE wird Sie niemals per E-Mail oder Telefon nach Ihrem Passwort fragen. Bei Verdacht auf unbefugten Zugriff sind Sie verpflichtet, uns unverzüglich zu informieren." },
    { title: "5. Überweisungen & Transaktionen", body: "Überweisungsaufträge sind nach ihrer Ausführung unwiderruflich. SWIZKOTE haftet nicht für Schäden, die durch fehlerhafte Angaben des Kunden entstehen. Internationale Überweisungen können zusätzlichen Prüfungen unterliegen und Gebühren anfallen." },
    { title: "6. Gebühren & Konditionen", body: "Die aktuellen Gebühren und Konditionen sind in unserem Preisverzeichnis auf der Website einsehbar. SWIZKOTE behält sich vor, diese mit einer Vorankündigung von 30 Tagen zu ändern. Die weitere Nutzung des Kontos gilt als Zustimmung zu den neuen Konditionen." },
    { title: "7. Datenschutz", body: "Die Verarbeitung Ihrer personenbezogenen Daten erfolgt gemäss der Datenschutzerklärung von SWIZKOTE und dem Schweizer Bundesgesetz über den Datenschutz (DSG). Ihre Daten werden nicht an Dritte verkauft. Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten." },
    { title: "8. Kündigung & Kontoauflösung", body: "Sie können Ihr Konto jederzeit kündigen, sofern kein negativer Saldo besteht. SWIZKOTE kann das Konto bei Verdacht auf missbräuchliche Nutzung oder bei Verstoss gegen diese Bedingungen mit sofortiger Wirkung sperren oder auflösen." },
    { title: "9. Geltendes Recht & Gerichtsstand", body: "Diese Bedingungen unterliegen dem Schweizer Recht. Ausschliesslicher Gerichtsstand für alle Streitigkeiten ist Genf, Schweiz. Zwingend anwendbare Konsumentenschutzbestimmungen bleiben vorbehalten." },
  ] : lang === "en" ? [
    { title: "1. Subject of the Agreement", body: "These Terms and Conditions govern the use of the digital banking services of SWIZKOTE SA, a company incorporated under Swiss law with its registered office in Geneva. By opening an account, you fully accept these terms." },
    { title: "2. Account Opening & Identity Verification", body: "Account opening requires full identity verification (KYC) in compliance with the Anti-Money Laundering Act. You undertake to provide truthful and complete information. SWIZKOTE reserves the right to delay account activation until verification is complete." },
    { title: "3. Use of Services", body: "The banking services provided may only be used for lawful purposes. Any use related to money laundering, terrorism financing or other illegal activities is strictly prohibited and will be reported to the relevant authorities." },
    { title: "4. Security & Access Credentials", body: "You are responsible for keeping your login credentials (username and password) confidential. SWIZKOTE will never ask for your password by email or phone. In case of suspected unauthorized access, you are required to inform us immediately." },
    { title: "5. Transfers & Transactions", body: "Transfer orders are irrevocable once executed. SWIZKOTE is not liable for damages caused by incorrect information provided by the customer. International transfers may be subject to additional checks and fees." },
    { title: "6. Fees & Conditions", body: "Current fees and conditions are available in our fee schedule on the website. SWIZKOTE reserves the right to amend these with 30 days' prior notice. Continued use of the account constitutes acceptance of the new conditions." },
    { title: "7. Privacy Policy", body: "Your personal data is processed in accordance with SWIZKOTE's Privacy Policy and the Swiss Federal Act on Data Protection (FADP). Your data is not sold to third parties. You have the right to access, rectify and delete your data." },
    { title: "8. Termination & Account Closure", body: "You may close your account at any time, provided there is no negative balance. SWIZKOTE may immediately suspend or close the account in case of suspected misuse or violation of these terms." },
    { title: "9. Applicable Law & Jurisdiction", body: "These terms are governed by Swiss law. The exclusive place of jurisdiction for all disputes is Geneva, Switzerland. Mandatory consumer protection provisions remain reserved." },
  ] : lang === "it" ? [
    { title: "1. Oggetto del Contratto", body: "I presenti Termini e Condizioni disciplinano l'utilizzo dei servizi bancari digitali di SWIZKOTE SA, società costituita ai sensi del diritto svizzero con sede a Ginevra. Aprendo un conto, si accettano integralmente le presenti condizioni." },
    { title: "2. Apertura del Conto e Verifica dell'Identità", body: "L'apertura del conto richiede una completa verifica dell'identità (KYC) in conformità con la legge antiriciclaggio. L'utente si impegna a fornire informazioni veritiere e complete. SWIZKOTE si riserva il diritto di ritardare l'attivazione del conto fino al completamento della verifica." },
    { title: "3. Utilizzo dei Servizi", body: "I servizi bancari forniti possono essere utilizzati solo per scopi leciti. Qualsiasi utilizzo legato al riciclaggio di denaro, al finanziamento del terrorismo o ad altre attività illegali è severamente vietato e verrà segnalato alle autorità competenti." },
    { title: "4. Sicurezza e Credenziali di Accesso", body: "L'utente è responsabile della riservatezza delle proprie credenziali di accesso (nome utente e password). SWIZKOTE non chiederà mai la password via email o telefono. In caso di accesso non autorizzato sospetto, l'utente è tenuto a informarci immediatamente." },
    { title: "5. Bonifici e Transazioni", body: "Gli ordini di bonifico sono irrevocabili una volta eseguiti. SWIZKOTE non è responsabile per danni causati da informazioni errate fornite dal cliente. I bonifici internazionali possono essere soggetti a controlli aggiuntivi e commissioni." },
    { title: "6. Commissioni e Condizioni", body: "Le commissioni e condizioni vigenti sono disponibili nel listino prezzi sul sito web. SWIZKOTE si riserva il diritto di modificarle con un preavviso di 30 giorni. Il continuo utilizzo del conto costituisce accettazione delle nuove condizioni." },
    { title: "7. Protezione dei Dati", body: "I dati personali vengono trattati conformemente alla Privacy Policy di SWIZKOTE e alla Legge federale svizzera sulla protezione dei dati (LPD). I dati non vengono venduti a terzi. L'utente ha il diritto di accedere, rettificare e cancellare i propri dati." },
    { title: "8. Risoluzione e Chiusura del Conto", body: "L'utente può chiudere il proprio conto in qualsiasi momento, a condizione che non vi sia saldo negativo. SWIZKOTE può sospendere o chiudere il conto immediatamente in caso di sospetto utilizzo improprio o violazione dei presenti termini." },
    { title: "9. Legge Applicabile e Foro Competente", body: "I presenti termini sono disciplinati dal diritto svizzero. Il foro esclusivo per tutte le controversie è Ginevra, Svizzera. Restano riservate le disposizioni imperative a tutela dei consumatori." },
  ] : [
    { title: "1. Objet du Contrat", body: "Les présentes Conditions Générales d'Utilisation régissent l'utilisation des services bancaires numériques de SWIZKOTE SA, société constituée selon le droit suisse et dont le siège est à Genève. En ouvrant un compte, vous acceptez intégralement les présentes conditions." },
    { title: "2. Ouverture de Compte & Vérification d'Identité", body: "L'ouverture de compte nécessite une vérification complète de votre identité (KYC) conformément à la loi sur le blanchiment d'argent. Vous vous engagez à fournir des informations véridiques et complètes. SWIZKOTE se réserve le droit de retarder l'activation du compte jusqu'à la fin de la vérification." },
    { title: "3. Utilisation des Services", body: "Les services bancaires fournis ne peuvent être utilisés qu'à des fins légales. Toute utilisation liée au blanchiment d'argent, au financement du terrorisme ou à toute autre activité illégale est strictement interdite et sera signalée aux autorités compétentes." },
    { title: "4. Sécurité & Identifiants d'Accès", body: "Vous êtes responsable de la confidentialité de vos identifiants (nom d'utilisateur et mot de passe). SWIZKOTE ne vous demandera jamais votre mot de passe par e-mail ou téléphone. En cas de suspicion d'accès non autorisé, vous êtes tenu de nous informer immédiatement." },
    { title: "5. Virements & Transactions", body: "Les ordres de virement sont irrévocables une fois exécutés. SWIZKOTE n'est pas responsable des dommages causés par des informations incorrectes fournies par le client. Les virements internationaux peuvent faire l'objet de vérifications supplémentaires et engendrer des frais." },
    { title: "6. Frais & Conditions Tarifaires", body: "Les frais et conditions en vigueur sont consultables dans notre grille tarifaire sur le site web. SWIZKOTE se réserve le droit de les modifier avec un préavis de 30 jours. La poursuite de l'utilisation du compte vaut acceptation des nouvelles conditions." },
    { title: "7. Protection des Données", body: "Vos données personnelles sont traitées conformément à la Politique de Confidentialité de SWIZKOTE et à la Loi fédérale suisse sur la protection des données (LPD). Vos données ne sont pas vendues à des tiers. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données." },
    { title: "8. Résiliation & Clôture de Compte", body: "Vous pouvez clôturer votre compte à tout moment, sous réserve qu'il ne présente pas de solde négatif. SWIZKOTE peut suspendre ou clôturer immédiatement le compte en cas de suspicion d'utilisation abusive ou de violation des présentes conditions." },
    { title: "9. Droit Applicable & For Juridique", body: "Les présentes conditions sont régies par le droit suisse. Le for exclusif pour tout litige est Genève, Suisse. Les dispositions impératives de protection des consommateurs demeurent réservées." },
  ];

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">

      {/* ── Terms & Conditions Popup ── */}
      {showTermsPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-card border border-gold/30 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" style={{ maxHeight: "90dvh" }}>
            {/* Gold top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-gold via-yellow-400 to-gold flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">{termsTitle}</h2>
                  <p className="text-xs text-muted-foreground">SWIZKOTE SA — {lang === "de" ? "Lesen Sie bitte vollständig" : lang === "en" ? "Please read in full" : lang === "it" ? "Si prega di leggere per intero" : "Veuillez lire intégralement"}</p>
                </div>
              </div>
              <button onClick={() => setShowTermsPopup(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div
              ref={termsScrollRef}
              onScroll={handleTermsScroll}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm"
              style={{ minHeight: 0 }}
            >
              <p className="text-xs text-muted-foreground italic">
                {lang === "de" ? `Gültig ab 1. Januar 2026 — SWIZKOTE SA, Route de Chêne 30, 1208 Genf, Schweiz` :
                 lang === "en" ? `Effective 1 January 2026 — SWIZKOTE SA, Route de Chêne 30, 1208 Geneva, Switzerland` :
                 lang === "it" ? `In vigore dal 1° gennaio 2026 — SWIZKOTE SA, Route de Chêne 30, 1208 Ginevra, Svizzera` :
                 `En vigueur au 1er janvier 2026 — SWIZKOTE SA, Route de Chêne 30, 1208 Genève, Suisse`}
              </p>
              {termsContent.map((section, i) => (
                <div key={i} className="space-y-1.5">
                  <h3 className="text-xs font-bold text-gold uppercase tracking-wide">{section.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{section.body}</p>
                </div>
              ))}
              {/* Scroll indicator */}
              {!termsScrolled && (
                <div className="sticky bottom-0 left-0 right-0 flex justify-center pt-2 pb-1 pointer-events-none">
                  <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1 bg-card/90 px-2 py-1 rounded-full border border-border/50">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                    {lang === "de" ? "Bis zum Ende scrollen" : lang === "en" ? "Scroll to the end" : lang === "it" ? "Scorri fino in fondo" : "Faites défiler jusqu'en bas"}
                  </span>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t flex-shrink-0 space-y-3">
              {!termsScrolled && (
                <p className="text-xs text-amber-500 text-center">
                  {lang === "de" ? "⚠️ Bitte lesen Sie die Bedingungen vollständig durch, bevor Sie akzeptieren." :
                   lang === "en" ? "⚠️ Please read the full terms before accepting." :
                   lang === "it" ? "⚠️ Si prega di leggere per intero prima di accettare." :
                   "⚠️ Veuillez lire les conditions en entier avant d'accepter."}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTermsPopup(false)}
                  className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                  {lang === "de" ? "Abbrechen" : lang === "en" ? "Cancel" : lang === "it" ? "Annulla" : "Annuler"}
                </button>
                <button
                  onClick={handleAcceptTerms}
                  disabled={!termsScrolled}
                  className={`flex-1 h-9 rounded-lg text-sm font-semibold transition-all ${
                    termsScrolled
                      ? "bg-gold text-[hsl(222,40%,10%)] hover:opacity-90 cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  }`}
                >
                  {lang === "de" ? "Akzeptieren" : lang === "en" ? "Accept" : lang === "it" ? "Accetto" : "J'accepte"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Left panel with fixed image ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] flex-shrink-0 relative overflow-hidden">
        {/* Image fixe */}
        <div className="absolute inset-0">
          <img
            src="https://img.freepik.com/photos-premium/personnes-loisirs-communication-manger-boire-concept-couple-heureux-smartphone-buvant-du-the-du-cafe-au-cafe_380164-87761.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Happy couple using smartphone at cafe"
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: "center 45%" }}
          />
          {/* Overlay sombre pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        </div>

        {/* Content on top of image */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-2" style={{ whiteSpace: "nowrap" }}>
            <img src={logoImg} alt="SWIZKOTE" className="h-10 w-auto object-contain flex-shrink-0" />
            <span className="text-xl font-bold text-white tracking-widest uppercase" style={{ whiteSpace: "nowrap" }}>
              SWIZKOTE
            </span>
          </div>

          {/* Centre text */}
          <div className="space-y-6">
            <div>
              <p className="text-gold text-sm font-medium uppercase tracking-widest mb-3">
                {lang === "de" ? "Seit 2001" : lang === "en" ? "Since 2001" : lang === "it" ? "Dal 2001" : "Depuis 2001"}
              </p>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
                {lang === "de" ? <>Die <span className="text-gold">Schweizer</span> Bankexzellenz<br />für Sie.</> :
                 lang === "en" ? <><span className="text-gold">Swiss</span> banking excellence<br />for you.</> :
                 lang === "it" ? <>L'eccellenza bancaria<br /><span className="text-gold">svizzera</span> per voi.</> :
                 <>L'excellence bancaire<br /><span className="text-gold">suisse</span> pour vous.</>}
              </h2>
              <p className="text-[hsl(220,20%,70%)] mt-4 text-sm leading-relaxed">
                {lang === "de" ? "Verwalten Sie Ihr Vermögen sicher und einfach über unsere digitale Plattform." :
                 lang === "en" ? "Manage your wealth safely and easily via our digital platform." :
                 lang === "it" ? "Gestisci il tuo patrimonio in modo sicuro tramite la nostra piattaforma digitale." :
                 "Gérez votre patrimoine en toute sécurité via notre plateforme digitale."}
              </p>
            </div>
            
          </div>

          <p className="text-[hsl(220,20%,35%)] text-xs">© 2026 SWIZKOTE SA</p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b lg:border-b-0">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{t("back")}</span>
            </Button>
          </Link>
          <div className="flex items-center gap-1.5">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center p-6">
          <div className="w-full max-w-md space-y-5 py-4">

            {/* Mobile logo */}
            <div className="lg:hidden text-center space-y-2">
              <img src={logoImg} alt="SWIZKOTE" className="h-12 w-auto object-contain mx-auto" />
              <h1 className="text-xl font-bold tracking-widest uppercase" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</h1>
              <p className="text-sm text-muted-foreground">{t("login_tagline")}</p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold tracking-tight">
                {isRegister
                  ? (lang === "de" ? "Konto erstellen" : lang === "en" ? "Create account" : lang === "it" ? "Crea account" : "Créer un compte")
                  : (lang === "de" ? "Willkommen zurück" : lang === "en" ? "Welcome back" : lang === "it" ? "Bentornato" : "Bon retour")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isRegister
                  ? (lang === "de" ? "Eröffnen Sie Ihr SWIZKOTE-Konto" : lang === "en" ? "Open your SWIZKOTE account" : lang === "it" ? "Apri il tuo conto SWIZKOTE" : "Ouvrez votre compte SWIZKOTE")
                  : (lang === "de" ? "Melden Sie sich in Ihrem Konto an" : lang === "en" ? "Sign in to your account" : lang === "it" ? "Accedi al tuo conto" : "Connectez-vous à votre espace")}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl border p-1 gap-1 bg-muted/40">
              <button
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${!isRegister ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="button-login-tab"
              >
                {t("login_tab")}
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${isRegister ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                data-testid="button-register-tab"
              >
                {t("login_register_tab")}
              </button>
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── REGISTRATION FIELDS ── */}
              {isRegister && (
                <>
                  {/* Section: Identité */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gold uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      {lang === "de" ? "Persönliche Daten" : lang === "en" ? "Personal Information" : lang === "it" ? "Dati personali" : "Informations personnelles"}
                    </p>
                  </div>

                  {/* Prénom + Nom */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">{t("login_firstname")} *</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={set("firstName")}
                        placeholder={t("login_firstname_ph")}
                        required
                        data-testid="input-firstname"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">{t("login_lastname")} *</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={set("lastName")}
                        placeholder={t("login_lastname_ph")}
                        required
                        data-testid="input-lastname"
                      />
                    </div>
                  </div>

                  {/* Date de naissance */}
                  <div className="space-y-1.5">
                    <Label htmlFor="birthdate" className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {t("login_birthdate")} *
                    </Label>
                    <Input
                      id="birthdate"
                      type="date"
                      value={form.birthdate}
                      onChange={set("birthdate")}
                      required
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                      data-testid="input-birthdate"
                    />
                  </div>

                  {/* Nationalité - Menu déroulant Europe */}
                  <div className="space-y-1.5">
                    <Label htmlFor="nationality" className="flex items-center gap-1.5">
                      <Flag className="w-3 h-3 text-muted-foreground" />
                      {t("login_nationality")} *
                    </Label>
                    <CountrySelect
                      id="nationality"
                      value={form.nationality}
                      onChange={set("nationality")}
                      required
                      lang={lang}
                      data-testid="input-nationality"
                    />
                  </div>

                  {/* Type de compte */}
                  <div className="space-y-1.5">
                    <Label htmlFor="accountType" className="flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3 text-muted-foreground" />
                      {t("login_account_type")} *
                    </Label>
                    <SelectField
                      id="accountType"
                      value={form.accountType}
                      onChange={set("accountType")}
                      required
                    >
                      <option value="particular">{t("login_account_particular")}</option>
                      <option value="private">{t("login_account_private")}</option>
                    </SelectField>
                  </div>

                  {/* Adresse */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {t("login_address")} *
                    </Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={set("address")}
                      placeholder={t("login_address_ph")}
                      required
                      data-testid="input-address"
                    />
                  </div>

                  {/* Divider: Contact */}
                  <div className="space-y-1 pt-1">
                    <p className="text-xs font-semibold text-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      {lang === "de" ? "Kontaktdaten" : lang === "en" ? "Contact Details" : lang === "it" ? "Dati di contatto" : "Coordonnées"}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t("email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder={t("login_email_ph")}
                      required
                      data-testid="input-email"
                    />
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">{t("login_phone_required")}</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+41 79 000 00 00"
                      required
                      data-testid="input-phone"
                    />
                  </div>

                  {/* Divider: Connexion */}
                  <div className="space-y-1 pt-1">
                    <p className="text-xs font-semibold text-gold uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3 h-3" />
                      {lang === "de" ? "Zugangsdaten" : lang === "en" ? "Login Credentials" : lang === "it" ? "Credenziali di accesso" : "Identifiants de connexion"}
                    </p>
                  </div>
                </>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username">{t("login_username")}</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={set("username")}
                  placeholder={t("login_username_ph")}
                  required
                  data-testid="input-username"
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("login_password")}</Label>
                <PasswordInput
                  value={form.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder={t("login_password_ph")}
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </div>

              {/* Acceptation CGU (register only) */}
              {isRegister && (
                <div className="pt-1 space-y-2">
                  {termsAccepted ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium flex-1">
                        {lang === "de" ? "AGB und Datenschutzrichtlinie akzeptiert" :
                         lang === "en" ? "Terms and Privacy Policy accepted" :
                         lang === "it" ? "Termini e Privacy accettati" :
                         "CGU et Politique de Confidentialité acceptées"}
                      </p>
                      <button
                        type="button"
                        onClick={() => { setTermsAccepted(false); setTermsScrolled(false); }}
                        className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                      >
                        {lang === "de" ? "Ändern" : lang === "en" ? "Change" : lang === "it" ? "Modifica" : "Modifier"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setTermsScrolled(false); setShowTermsPopup(true); }}
                      className="w-full flex items-center justify-between gap-2 p-3 rounded-lg border border-gold/40 bg-gold/5 hover:bg-gold/10 transition-colors group"
                      data-testid="button-open-terms"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded border-2 border-gold/50 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-left">
                          {lang === "de" ? "AGB und Datenschutzrichtlinie lesen & akzeptieren *" :
                           lang === "en" ? "Read & accept Terms and Privacy Policy *" :
                           lang === "it" ? "Leggi e accetta Termini e Privacy *" :
                           "Lire et accepter les CGU et la Politique de Confidentialité *"}
                        </span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold flex-shrink-0"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gold-gradient text-[hsl(222,40%,10%)] font-semibold"
                disabled={loading}
                data-testid="button-submit-auth"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-2" />{t("loading")}</>
                  : isRegister ? t("login_register_btn") : t("login_btn")}
              </Button>
              {isRegister && !termsAccepted && (
                <p className="text-[10px] text-center text-muted-foreground/70">
                  {lang === "de" ? "* Die AGB müssen vor der Registrierung akzeptiert werden." :
                   lang === "en" ? "* Terms must be accepted before registering." :
                   lang === "it" ? "* I termini devono essere accettati prima della registrazione." :
                   "* Les CGU doivent être acceptées avant l'inscription."}
                </p>
              )}
            </form>

            {/* Security footer */}
            <div className="pt-2 border-t text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3 text-gold" />
                {t("login_secured")}
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/60">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" />FINMA</span>
                <span>·</span>
                <span>ISO 27001</span>
                <span>·</span>
                <span>AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}