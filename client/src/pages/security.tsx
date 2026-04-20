import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, ArrowLeft, Shield, Lock, Eye, AlertTriangle, Fingerprint, Server, Bell, CheckCircle, PhoneCall, Mail } from "lucide-react";
const logoImg = "/logo.png";
const securityImg = "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=700&fit=crop&q=80";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (<Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>);
}

const PILLARS = {
  de: [
    { icon: Lock, title: "Ende-zu-Ende-Verschlüsselung", desc: "Alle Ihre Daten sind mit AES-256, dem militärischen Standard, verschlüsselt. Selbst im Fall einer Abfangung bleiben Ihre Informationen unleserlich.", badge: "AES-256" },
    { icon: Fingerprint, title: "Starke Authentifizierung (2FA)", desc: "Jede Anmeldung erfordert einen zweiten Faktor: OTP-Code per SMS, Authenticator-App oder biometrischen Schlüssel.", badge: "PSD2 / SCA" },
    { icon: Eye, title: "Echtzeit-Überwachung", desc: "Unser SOC (Security Operations Center) überwacht 24h/24 alle Transaktionen, um verdächtige Aktivitäten zu erkennen.", badge: "24/7 SOC" },
    { icon: Server, title: "Zertifizierte Infrastruktur", desc: "Ausschliessliches Hosting in ISO 27001-zertifizierten Schweizer Rechenzentren. Keine Daten verlassen das Schweizer Staatsgebiet.", badge: "ISO 27001" },
    { icon: Bell, title: "Sofortige Benachrichtigungen", desc: "Erhalten Sie für jede Transaktion, jeden Anmeldeversuch oder jede Kontoänderung eine Push- oder SMS-Benachrichtigung.", badge: "Push / SMS" },
    { icon: Shield, title: "Betrugsversicherung", desc: "Bei nachgewiesenem Betrug deckt SwizKote Bank Sie bis zu CHF 50.000 pro Vorfall ab, ohne Selbstbehalt.", badge: "CHF 50K" },
  ],
  fr: [
    { icon: Lock, title: "Chiffrement de bout en bout", desc: "Toutes vos données sont chiffrées avec AES-256, le standard militaire. Même en cas d'interception, vos informations restent illisibles.", badge: "AES-256" },
    { icon: Fingerprint, title: "Authentification forte (2FA)", desc: "Chaque connexion requiert un second facteur : code OTP par SMS, application d'authentification ou clé biométrique.", badge: "PSD2 / SCA" },
    { icon: Eye, title: "Surveillance temps réel", desc: "Notre SOC (Security Operations Center) surveille 24h/24 toutes les transactions pour détecter toute activité suspecte.", badge: "24/7 SOC" },
    { icon: Server, title: "Infrastructure certifiée", desc: "Hébergement exclusif dans des datacenters suisses certifiés ISO 27001. Aucune donnée ne quitte le territoire suisse.", badge: "ISO 27001" },
    { icon: Bell, title: "Alertes instantanées", desc: "Recevez une notification push ou SMS pour chaque transaction, tentative de connexion ou modification de compte.", badge: "Push / SMS" },
    { icon: Shield, title: "Assurance fraude", desc: "En cas de fraude avérée, SwizKote Bank vous couvre jusqu'à CHF 50 000 par incident, sans franchise.", badge: "CHF 50K" },
  ],
  en: [
    { icon: Lock, title: "End-to-End Encryption", desc: "All your data is encrypted with AES-256, the military standard. Even if intercepted, your information remains unreadable.", badge: "AES-256" },
    { icon: Fingerprint, title: "Strong Authentication (2FA)", desc: "Every login requires a second factor: OTP code via SMS, authenticator app or biometric key.", badge: "PSD2 / SCA" },
    { icon: Eye, title: "Real-time Monitoring", desc: "Our SOC (Security Operations Center) monitors all transactions 24/7 to detect suspicious activity.", badge: "24/7 SOC" },
    { icon: Server, title: "Certified Infrastructure", desc: "Exclusive hosting in ISO 27001-certified Swiss data centers. No data leaves Swiss territory.", badge: "ISO 27001" },
    { icon: Bell, title: "Instant Alerts", desc: "Receive a push or SMS notification for every transaction, login attempt or account change.", badge: "Push / SMS" },
    { icon: Shield, title: "Fraud Insurance", desc: "In case of proven fraud, SwizKote Bank covers you up to CHF 50,000 per incident, with no deductible.", badge: "CHF 50K" },
  ],
  it: [
    { icon: Lock, title: "Crittografia end-to-end", desc: "Tutti i tuoi dati sono crittografati con AES-256, lo standard militare. Anche se intercettati, le tue informazioni rimangono illeggibili.", badge: "AES-256" },
    { icon: Fingerprint, title: "Autenticazione forte (2FA)", desc: "Ogni accesso richiede un secondo fattore: codice OTP via SMS, app authenticator o chiave biometrica.", badge: "PSD2 / SCA" },
    { icon: Eye, title: "Monitoraggio in tempo reale", desc: "Il nostro SOC (Security Operations Center) monitora tutte le transazioni 24/7 per rilevare attività sospette.", badge: "24/7 SOC" },
    { icon: Server, title: "Infrastruttura certificata", desc: "Hosting esclusivo in data center svizzeri certificati ISO 27001. Nessun dato lascia il territorio svizzero.", badge: "ISO 27001" },
    { icon: Bell, title: "Avvisi istantanei", desc: "Ricevi una notifica push o SMS per ogni transazione, tentativo di accesso o modifica del conto.", badge: "Push / SMS" },
    { icon: Shield, title: "Assicurazione frodi", desc: "In caso di frode accertata, SwizKote Bank ti copre fino a CHF 50.000 per incidente, senza franchigia.", badge: "CHF 50K" },
  ],
};

const CERTS = [
  { name: "ISO/IEC 27001:2022", de: "Informationssicherheit", fr: "Sécurité de l'information", en: "Information Security", it: "Sicurezza delle informazioni" },
  { name: "PCI DSS Level 1", de: "Zahlungskartensicherheit", fr: "Sécurité des paiements cartes", en: "Payment Card Security", it: "Sicurezza pagamenti carte" },
  { name: "FINMA Circ. 2023/1", de: "Bankbetriebliche Risiken", fr: "Risques opérationnels bancaires", en: "Bank Operational Risks", it: "Rischi operativi bancari" },
  { name: "SOC 2 Type II", de: "Sicherheits- & Verfügbarkeitskontrollen", fr: "Contrôles sécurité & disponibilité", en: "Security & Availability Controls", it: "Controlli sicurezza & disponibilità" },
  { name: "TLS 1.3", de: "Kommunikationsverschlüsselung", fr: "Chiffrement des communications", en: "Communication Encryption", it: "Crittografia delle comunicazioni" },
  { name: "FIDO2 / WebAuthn", de: "Passwortlose Authentifizierung", fr: "Authentification sans mot de passe", en: "Passwordless Authentication", it: "Autenticazione senza password" },
];

const TIPS = {
  de: [
    "Teilen Sie Ihr Passwort niemals — auch nicht mit einem SwizKote-Berater. Wir werden Sie das niemals fragen.",
    "Prüfen Sie stets die URL vor dem Login: nur https://app.swizkote.ch.",
    "Aktivieren Sie Push-Benachrichtigungen, um über jede Transaktion in Echtzeit informiert zu werden.",
    "Verwenden Sie ein einzigartiges, starkes Passwort (mindestens 12 Zeichen, Gross- und Kleinbuchstaben, Zahlen, Symbole).",
    "Wenn Sie eine verdächtige E-Mail erhalten, klicken Sie auf keinen Link und melden Sie diese an sicherheit@swizkote.ch.",
    "Bei Verlust oder Diebstahl Ihres Telefons sperren Sie Ihre Karte sofort über die Web-App.",
  ],
  fr: [
    "Ne partagez jamais votre mot de passe, même avec un conseiller SwizKote Bank — nous ne vous le demanderons jamais.",
    "Vérifiez toujours l'adresse URL avant de vous connecter : https://app.swizkote.ch uniquement.",
    "Activez les notifications push pour être alerté de chaque transaction en temps réel.",
    "Utilisez un mot de passe unique et fort (minimum 12 caractères, majuscules, chiffres, symboles).",
    "Si vous recevez un email suspect, ne cliquez sur aucun lien et signalez-le à securite@swizkote.ch.",
    "En cas de perte ou vol de votre téléphone, bloquez immédiatement votre carte depuis l'application web.",
  ],
  en: [
    "Never share your password — even with a SwizKote advisor. We will never ask you for it.",
    "Always check the URL before logging in: only https://app.swizkote.ch.",
    "Enable push notifications to be informed of every transaction in real time.",
    "Use a unique, strong password (minimum 12 characters, uppercase, lowercase, numbers, symbols).",
    "If you receive a suspicious email, do not click on any link and report it to security@swizkote.ch.",
    "If your phone is lost or stolen, immediately block your card via the web app.",
  ],
  it: [
    "Non condividere mai la tua password — nemmeno con un consulente SwizKote. Non te la chiederemo mai.",
    "Controlla sempre l'URL prima di accedere: solo https://app.swizkote.ch.",
    "Attiva le notifiche push per essere informato di ogni transazione in tempo reale.",
    "Usa una password unica e robusta (minimo 12 caratteri, maiuscole, minuscole, numeri, simboli).",
    "Se ricevi un'email sospetta, non fare clic su alcun link e segnalala a sicurezza@swizkote.ch.",
    "In caso di smarrimento o furto del telefono, blocca immediatamente la carta tramite l'app web.",
  ],
};

const STATS = {
  de: [
    { label: "Plattform-Uptime (30T)", val: "99.99%", color: "text-green-500" },
    { label: "Sicherheitsvorfälle (2024)", val: "0", color: "text-green-500" },
    { label: "Ø Reaktionszeit bei Alarmen", val: "< 2 Min", color: "text-gold" },
    { label: "Jährliche Penetrationstests", val: "4", color: "text-gold" },
    { label: "Online-Betrugsdeckung", val: "CHF 50.000", color: "text-gold" },
    { label: "FINMA-Zertifizierung", val: "Aktiv", color: "text-green-500" },
  ],
  fr: [
    { label: "Uptime plateforme (30j)", val: "99.99%", color: "text-green-500" },
    { label: "Incidents sécurité majeurs (2024)", val: "0", color: "text-green-500" },
    { label: "Temps de réponse alertes", val: "< 2 min", color: "text-gold" },
    { label: "Tests de pénétration annuels", val: "4", color: "text-gold" },
    { label: "Couverture fraude en ligne", val: "CHF 50 000", color: "text-gold" },
    { label: "Certification FINMA", val: "Active", color: "text-green-500" },
  ],
  en: [
    { label: "Platform Uptime (30d)", val: "99.99%", color: "text-green-500" },
    { label: "Security Incidents (2024)", val: "0", color: "text-green-500" },
    { label: "Avg Alert Response Time", val: "< 2 min", color: "text-gold" },
    { label: "Annual Penetration Tests", val: "4", color: "text-gold" },
    { label: "Online Fraud Coverage", val: "CHF 50,000", color: "text-gold" },
    { label: "FINMA Certification", val: "Active", color: "text-green-500" },
  ],
  it: [
    { label: "Uptime piattaforma (30g)", val: "99.99%", color: "text-green-500" },
    { label: "Incidenti sicurezza (2024)", val: "0", color: "text-green-500" },
    { label: "Tempo medio risposta allerte", val: "< 2 min", color: "text-gold" },
    { label: "Test di penetrazione annuali", val: "4", color: "text-gold" },
    { label: "Copertura frodi online", val: "CHF 50.000", color: "text-gold" },
    { label: "Certificazione FINMA", val: "Attiva", color: "text-green-500" },
  ],
};

export default function SecurityPage() {
  const { t, lang } = useI18n();
  const de = lang === "de";
  const safeKey = (lang === "fr" || lang === "de" || lang === "en" || lang === "it") ? lang : "fr";
  const pillars = PILLARS[safeKey];
  const tips = TIPS[safeKey];
  const stats = STATS[safeKey];

  const getCertDesc = (cert: typeof CERTS[0]) => {
    if (lang === "de") return cert.de;
    if (lang === "en") return cert.en;
    if (lang === "it") return cert.it;
    return cert.fr;
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-4">
              <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" />{t("back")}</Button></Link>
              <div className="flex items-center gap-1.5">
                <img src={logoImg} alt="SwizKote Bank" className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="text-base sm:text-lg font-bold tracking-tight" style={{ whiteSpace: "nowrap" }}>SwizKote <span className="text-gold">Bank</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2"><LangSwitcher /><ThemeToggle /></div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[hsl(222,40%,6%)] py-24 md:py-32">
        <img src={securityImg} alt="Security" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,40%,6%,0.6)] to-[hsl(222,40%,6%,0.97)]" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            {t("security_hero_title")}
          </h1>
          <p className="text-[hsl(220,20%,75%)] text-xl max-w-2xl mx-auto leading-relaxed">
            {t("security_hero_subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {["AES-256","2FA / OTP","ISO 27001","FINMA","SOC 24/7","PCI DSS"].map((b, i) => (
              <span key={i} className="px-4 py-2 rounded-full border border-gold/30 bg-gold/10 text-gold text-sm font-medium">{b}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t("security_pillars_title")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {de ? "Mehrstufige Verteidigung für einen 360°-Schutz." 
                : lang === "en" ? "Multi-layered defense for 360° protection."
                : lang === "it" ? "Difesa a più livelli per una protezione a 360°."
                : "Une défense en profondeur pour une protection à 360°."}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="p-6 rounded-xl border bg-card hover:border-gold/40 transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors"><Icon className="w-6 h-6 text-gold" /></div>
                    <span className="px-2.5 py-1 rounded-full bg-muted text-xs font-bold text-gold border border-gold/20">{p.badge}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("security_certs_title")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CERTS.map((cert, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                <CheckCircle className="w-8 h-8 text-gold flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm">{cert.name}</div>
                  <div className="text-xs text-muted-foreground">{getCertDesc(cert)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                {t("security_tips_title")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {de ? "Sicherheit ist eine gemeinsame Aufgabe. Hier sind unsere Empfehlungen, um geschützt zu bleiben." 
                  : lang === "en" ? "Security is a shared responsibility. Here are our recommendations to stay protected."
                  : lang === "it" ? "La sicurezza è una responsabilità condivisa. Ecco i nostri consigli per rimanere protetti."
                  : "La sécurité est un effort partagé. Voici nos recommandations pour rester protégé."}
              </p>
              <div className="space-y-4">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gold text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <h3 className="font-bold text-amber-600 dark:text-amber-400">{t("security_report_title")}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {t("security_report_desc")}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><PhoneCall className="w-4 h-4 text-gold" /><span className="font-medium">+41 22 000 00 99</span><span className="text-muted-foreground text-xs">({de ? "Sicherheits-Notfall 24/7" : lang === "en" ? "Security Emergency 24/7" : lang === "it" ? "Emergenza sicurezza 24/7" : "Urgences sécurité 24/7"})</span></div>
                  <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-gold" /><a href="mailto:sicherheit@swizkote.ch" className="text-gold hover:underline">{de ? "sicherheit@swizkote.ch" : lang === "en" ? "security@swizkote.ch" : lang === "it" ? "sicurezza@swizkote.ch" : "securite@swizkote.ch"}</a></div>
                </div>
              </div>
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-bold mb-4">{t("security_dashboard_title")}</h3>
                <div className="space-y-3">
                  {stats.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className={`text-sm font-bold ${item.color}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl border border-gold/20 bg-gold/5 text-center">
                <Shield className="w-10 h-10 text-gold mx-auto mb-3" />
                <h3 className="font-bold mb-2">{t("security_access_title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{de ? "Überprüfen Sie Ihre Alarme, verwalten Sie vertrauenswürdige Geräte und konfigurieren Sie Ihre 2FA." : lang === "en" ? "Check your alerts, manage trusted devices and configure your 2FA." : lang === "it" ? "Controlla i tuoi avvisi, gestisci i dispositivi fidati e configura il tuo 2FA." : "Vérifiez vos alertes, gérez vos appareils de confiance et configurez votre 2FA."}</p>
                <Link href="/login"><Button className="gold-gradient text-[hsl(222,40%,10%)] font-semibold w-full">{t("land_login")}</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© 2026 SwizKote Bank SA — <Link href="/terms" className="hover:text-foreground">{lang === "de" ? "AGB" : lang === "en" ? "Terms" : lang === "it" ? "Termini" : "CGU"}</Link> · <Link href="/privacy" className="hover:text-foreground">{t("land_footer_privacy")}</Link> · <Link href="/legal" className="hover:text-foreground">{t("land_footer_legal")}</Link></p>
        </div>
      </footer>
    </div>
  );
}