import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, ArrowLeft, Download, ExternalLink, Calendar, Tag } from "lucide-react";
const logoImg = "/logo.png";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (<Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>);
}

const NEWS = {
  de: [
    { date: "15. November 2024", category: "Ergebnisse", title: "SwizKote Bank meldet 18% Wachstum der verwalteten Vermögen im Q3 2024", summary: "In einem herausfordernden Marktumfeld bestätigt SwizKote Bank ihre Resilienz mit einem signifikanten Wachstum der verwalteten Vermögen auf CHF 12,4 Milliarden.", source: "Offizielle Pressemitteilung" },
    { date: "3. Oktober 2024", category: "Innovation", title: "Einführung der neuen SwizKote Next-Gen Digitalplattform", summary: "SwizKote Bank stellt ihre nächste Generation der Bankplattform vor, die künstliche Intelligenz für ein optimiertes Kundenerlebnis und erhöhte Sicherheit integriert.", source: "Finews.ch" },
    { date: "22. September 2024", category: "Partnerschaft", title: "SwizKote Bank und FinTech Innovation Hub unterzeichnen strategische Kooperationsvereinbarung", summary: "Diese Partnerschaft zielt darauf ab, Innovationen bei Zahlungsdiensten und digitalem Vermögensmanagement zu beschleunigen.", source: "NZZ" },
    { date: "8. August 2024", category: "Auszeichnung", title: "SwizKote Bank als Beste Privatbank der Schweiz 2024 ausgezeichnet", summary: "Zum dritten Mal in Folge erhält SwizKote Bank den Preis der besten Schweizer Privatbank vom Magazin Euromoney.", source: "Euromoney Awards" },
    { date: "1. Juli 2024", category: "Compliance", title: "SwizKote Bank erhält ISO 27001-Zertifizierung für Informationssicherheit", summary: "Die Zertifizierung bestätigt das Exzellenzniveau von SwizKote Bank im Bereich Datenschutz und Cybersicherheit.", source: "Offizielle Pressemitteilung" },
  ],
  fr: [
    { date: "15 novembre 2024", category: "Résultats", title: "SwizKote Bank annonce une croissance de 18% de ses actifs sous gestion au T3 2024", summary: "Dans un environnement de marché challenging, SwizKote Bank confirme sa résilience avec une croissance significative des actifs atteignant CHF 12,4 milliards.", source: "Communiqué de presse officiel" },
    { date: "3 octobre 2024", category: "Innovation", title: "Lancement de la nouvelle plateforme digitale SwizKote Next-Gen", summary: "SwizKote Bank dévoile sa plateforme bancaire de nouvelle génération, intégrant l'intelligence artificielle pour une expérience client optimisée.", source: "Finews.ch" },
    { date: "22 septembre 2024", category: "Partenariat", title: "SwizKote Bank et FinTech Innovation Hub signent un accord de coopération stratégique", summary: "Ce partenariat vise à accélérer l'innovation dans les services de paiement et la gestion patrimoniale digitale.", source: "Le Temps" },
    { date: "8 août 2024", category: "Distinction", title: "SwizKote Bank élue Meilleure Banque Privée de Suisse 2024", summary: "Pour la troisième année consécutive, SwizKote Bank remporte le prix de la meilleure banque privée suisse décerné par Euromoney.", source: "Euromoney Awards" },
    { date: "1er juillet 2024", category: "Conformité", title: "SwizKote Bank obtient la certification ISO 27001 pour la sécurité de l'information", summary: "La certification confirme le niveau d'excellence de SwizKote Bank en matière de protection des données et de cybersécurité.", source: "Communiqué de presse officiel" },
  ],
  en: [
    { date: "November 15, 2024", category: "Results", title: "SwizKote Bank reports 18% growth in assets under management in Q3 2024", summary: "In a challenging market environment, SwizKote Bank confirms its resilience with significant growth in assets under management to CHF 12.4 billion.", source: "Official Press Release" },
    { date: "October 3, 2024", category: "Innovation", title: "Launch of the new SwizKote Next-Gen Digital Platform", summary: "SwizKote Bank unveils its next-generation banking platform, integrating artificial intelligence for an optimized customer experience and enhanced security.", source: "Finews.ch" },
    { date: "September 22, 2024", category: "Partnership", title: "SwizKote Bank and FinTech Innovation Hub sign strategic cooperation agreement", summary: "This partnership aims to accelerate innovation in payment services and digital wealth management.", source: "Financial Times" },
    { date: "August 8, 2024", category: "Award", title: "SwizKote Bank named Best Private Bank in Switzerland 2024", summary: "For the third consecutive year, SwizKote Bank wins the best Swiss private bank award from Euromoney magazine.", source: "Euromoney Awards" },
    { date: "July 1, 2024", category: "Compliance", title: "SwizKote Bank receives ISO 27001 certification for information security", summary: "The certification confirms SwizKote Bank's excellence in data protection and cybersecurity.", source: "Official Press Release" },
  ],
  it: [
    { date: "15 novembre 2024", category: "Risultati", title: "SwizKote Bank riporta una crescita del 18% degli attivi in gestione nel Q3 2024", summary: "In un contesto di mercato difficile, SwizKote Bank conferma la sua resilienza con una crescita significativa degli attivi in gestione a CHF 12,4 miliardi.", source: "Comunicato stampa ufficiale" },
    { date: "3 ottobre 2024", category: "Innovazione", title: "Lancio della nuova piattaforma digitale SwizKote Next-Gen", summary: "SwizKote Bank svela la sua piattaforma bancaria di nuova generazione, che integra l'intelligenza artificiale per un'esperienza cliente ottimizzata e una maggiore sicurezza.", source: "Finews.ch" },
    { date: "22 settembre 2024", category: "Partnership", title: "SwizKote Bank e FinTech Innovation Hub firmano un accordo di cooperazione strategica", summary: "Questa partnership mira ad accelerare l'innovazione nei servizi di pagamento e nella gestione patrimoniale digitale.", source: "Il Sole 24 Ore" },
    { date: "8 agosto 2024", category: "Premio", title: "SwizKote Bank eletta Migliore Banca Privata in Svizzera 2024", summary: "Per il terzo anno consecutivo, SwizKote Bank vince il premio di migliore banca privata svizzera dalla rivista Euromoney.", source: "Euromoney Awards" },
    { date: "1 luglio 2024", category: "Conformità", title: "SwizKote Bank riceve la certificazione ISO 27001 per la sicurezza delle informazioni", summary: "La certificazione conferma l'eccellenza di SwizKote Bank nella protezione dei dati e nella cybersecurity.", source: "Comunicato stampa ufficiale" },
  ],
};

const RESOURCES = {
  de: [
    { name: "Pressemappe 2024", desc: "Logos, Bilder und Lebensläufe der Geschäftsleitung", size: "12 MB" },
    { name: "Jahresbericht 2023", desc: "Konsolidierte Abschlüsse und Lagebericht", size: "4.2 MB" },
    { name: "Nachhaltigkeitsbericht 2023", desc: "ESG und Umweltverpflichtungen", size: "2.8 MB" },
    { name: "Corporate Design", desc: "Markennutzungsrichtlinien", size: "8 MB" },
  ],
  fr: [
    { name: "Kit presse 2024", desc: "Logos, visuels et biographies de direction", size: "12 MB" },
    { name: "Rapport annuel 2023", desc: "Comptes consolidés et rapport de gestion", size: "4.2 MB" },
    { name: "Rapport de durabilité 2023", desc: "ESG et engagements environnementaux", size: "2.8 MB" },
    { name: "Charte graphique", desc: "Directives d'utilisation de la marque", size: "8 MB" },
  ],
  en: [
    { name: "Press Kit 2024", desc: "Logos, visuals and executive biographies", size: "12 MB" },
    { name: "Annual Report 2023", desc: "Consolidated financial statements and management report", size: "4.2 MB" },
    { name: "Sustainability Report 2023", desc: "ESG and environmental commitments", size: "2.8 MB" },
    { name: "Brand Guidelines", desc: "Brand usage guidelines", size: "8 MB" },
  ],
  it: [
    { name: "Kit stampa 2024", desc: "Loghi, immagini e biografie della direzione", size: "12 MB" },
    { name: "Relazione annuale 2023", desc: "Bilancio consolidato e relazione sulla gestione", size: "4.2 MB" },
    { name: "Rapporto di sostenibilità 2023", desc: "ESG e impegni ambientali", size: "2.8 MB" },
    { name: "Linee guida del marchio", desc: "Linee guida per l'uso del marchio", size: "8 MB" },
  ],
};

const CAT_COLORS: Record<string, string> = {
  Ergebnisse: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Résultats: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Results: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Risultati: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Innovation: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Innovazione: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Partnerschaft: "bg-green-500/10 text-green-600 dark:text-green-400",
  Partenariat: "bg-green-500/10 text-green-600 dark:text-green-400",
  Partnership: "bg-green-500/10 text-green-600 dark:text-green-400",
  Auszeichnung: "bg-gold/10 text-gold",
  Distinction: "bg-gold/10 text-gold",
  Award: "bg-gold/10 text-gold",
  Premio: "bg-gold/10 text-gold",
  Compliance: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Conformité: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  Conformità: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

export default function PressPage() {
  const { t, lang } = useI18n();
  const de = lang === "de";
  const safeKey = (lang === "fr" || lang === "de" || lang === "en" || lang === "it") ? lang : "fr";
  const news = NEWS[safeKey];
  const resources = RESOURCES[safeKey];

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

      <section className="bg-[hsl(222,40%,6%)] py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            {t("press_hero_title")}
          </h1>
          <p className="text-[hsl(220,20%,75%)] text-lg max-w-2xl mx-auto mb-8">
            {de ? "Alle Pressemitteilungen, Neuigkeiten und Medienressourcen auf einen Blick." 
              : lang === "en" ? "All press releases, news and media resources at a glance."
              : lang === "it" ? "Tutti i comunicati stampa, le notizie e le risorse media a colpo d'occhio."
              : "Retrouvez tous nos communiqués de presse, actualités et ressources médias."}
          </p>
          <div className="inline-flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 text-sm text-[hsl(220,20%,70%)]">
            <span>{t("press_contact_title")}:</span>
            <a href="mailto:presse@swizkote.ch" className="text-gold font-semibold hover:underline">presse@swizkote.ch</a>
            <span>·</span>
            <span>+41 22 000 01 00</span>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-8">
                {t("press_news_title")}
              </h2>
              <div className="space-y-6">
                {news.map((item, i) => (
                  <article key={i} className="p-6 rounded-xl border bg-card hover:border-gold/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${CAT_COLORS[item.category] || "bg-muted text-muted-foreground"}`}><Tag className="w-3 h-3 inline mr-1" />{item.category}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{item.date}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 leading-snug">{item.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{item.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{t("press_source_label")}: {item.source}</span>
                      <Button variant="ghost" size="sm" className="text-gold hover:text-gold gap-1 text-xs">{de ? "Lesen" : lang === "en" ? "Read" : lang === "it" ? "Leggi" : "Lire"} <ExternalLink className="w-3 h-3" /></Button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-bold mb-4">{t("press_resources_title")}</h3>
                <div className="space-y-3">
                  {resources.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div><div className="text-sm font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.desc} · {r.size}</div></div>
                      <Button variant="ghost" size="icon" className="w-8 h-8 text-gold"><Download className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-xl border bg-card">
                <h3 className="font-bold mb-3">{t("press_contact_title")}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="font-medium text-foreground">Isabelle Renaud</span></p>
                  <p>{de ? "Kommunikationsdirektorin" : lang === "en" ? "Communications Director" : lang === "it" ? "Direttrice della Comunicazione" : "Directrice de la Communication"}</p>
                  <p><a href="mailto:presse@swizkote.ch" className="text-gold hover:underline">presse@swizkote.ch</a></p>
                  <p>+41 22 000 01 00</p>
                  <p className="text-xs pt-2">{de ? "Verfügbar Mo–Fr, 8–18 Uhr (MEZ)" : lang === "en" ? "Available Mon–Fri, 8am–6pm (CET)" : lang === "it" ? "Disponibile lun–ven, 8–18 (CET)" : "Disponible du lundi au vendredi, 8h–18h (CET)"}</p>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-gold/20 bg-gold/5">
                <h3 className="font-bold mb-3 text-gold">{t("press_accreditation_title")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{de ? "Sie sind Journalist und möchten über SwizKote Bank berichten?" : lang === "en" ? "Are you a journalist and want to cover SwizKote Bank?" : lang === "it" ? "Sei un giornalista e vuoi parlare di SwizKote Bank?" : "Vous êtes journaliste et souhaitez couvrir SwizKote Bank ?"}</p>
                <Button className="w-full gold-gradient text-[hsl(222,40%,10%)] font-semibold text-sm">{t("press_accreditation_button")}</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© 2026 SwizKote Bank SA — <Link href="/privacy" className="hover:text-foreground">{t("land_footer_privacy")}</Link> · <Link href="/legal" className="hover:text-foreground">{t("land_footer_legal")}</Link></p>
        </div>
      </footer>
    </div>
  );
}