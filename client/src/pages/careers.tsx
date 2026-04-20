import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/theme-provider";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, ArrowLeft, MapPin, Clock, Briefcase, TrendingUp, Users, Globe, Heart, Send, ChevronDown, ChevronUp } from "lucide-react";
const logoImg = "/logo.png";
const digitalWorkspaceImg = "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&h=700&fit=crop&q=80";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (<Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>);
}

const BENEFITS = {
  de: [
    { icon: TrendingUp, title: "Schnelle Entwicklung", desc: "Individuelle Karrierepläne und leistungsbasierte Beförderungen." },
    { icon: Globe, title: "Internationale Mobilität", desc: "Möglichkeiten in unseren Büros in Genf, Zürich, Luxemburg und Singapur." },
    { icon: Heart, title: "Wohlbefinden", desc: "Vollständige Versicherung, Fitnessstudio, flexibles Homeoffice und grosszügige Urlaubsregelungen." },
    { icon: Users, title: "Weiterbildung", desc: "Jährliches Weiterbildungsbudget von CHF 5.000 und Zugang zu internen Programmen." },
  ],
  fr: [
    { icon: TrendingUp, title: "Évolution rapide", desc: "Plans de carrière individualisés et promotions basées sur la performance." },
    { icon: Globe, title: "Mobilité internationale", desc: "Opportunités dans nos bureaux de Genève, Zurich, Luxembourg et Singapour." },
    { icon: Heart, title: "Bien-être", desc: "Assurance complète, salle de sport, télétravail flexible et congés généreux." },
    { icon: Users, title: "Formation continue", desc: "Budget formation annuel de CHF 5 000 et accès à nos programmes internes." },
  ],
  en: [
    { icon: TrendingUp, title: "Fast Growth", desc: "Individual career plans and performance-based promotions." },
    { icon: Globe, title: "International Mobility", desc: "Opportunities in our offices in Geneva, Zurich, Luxembourg and Singapore." },
    { icon: Heart, title: "Well-being", desc: "Full insurance, gym, flexible remote work and generous vacation policies." },
    { icon: Users, title: "Continuous Learning", desc: "Annual training budget of CHF 5,000 and access to internal programs." },
  ],
  it: [
    { icon: TrendingUp, title: "Crescita rapida", desc: "Piani di carriera individualizzati e promozioni basate sulle performance." },
    { icon: Globe, title: "Mobilità internazionale", desc: "Opportunità nei nostri uffici a Ginevra, Zurigo, Lussemburgo e Singapore." },
    { icon: Heart, title: "Benessere", desc: "Assicurazione completa, palestra, smart working flessibile e ferie generose." },
    { icon: Users, title: "Formazione continua", desc: "Budget annuale di CHF 5.000 per la formazione e accesso a programmi interni." },
  ],
};

const JOBS = {
  de: [
    { id: 1, title: "Senior Finanzanalyst", dept: "Vermögensverwaltung", location: "Genf", type: "Festanstellung", level: "Senior", desc: "Analyse und Verwaltung privater Kundenportfolios. Mindestens 5 Jahre Erfahrung im Private Banking.", skills: ["CFA","Bloomberg","Excel VBA"] },
    { id: 2, title: "Full-Stack-Entwickler", dept: "Digital & Innovation", location: "Zürich", type: "Festanstellung", level: "Mid", desc: "Entwicklung der digitalen Bankplattform. React, TypeScript, Node.js.", skills: ["React","TypeScript","PostgreSQL"] },
    { id: 3, title: "Compliance-Beauftragter (KYC/AML)", dept: "Compliance & Risiken", location: "Genf", type: "Festanstellung", level: "Mid", desc: "Verwaltung der KYC-Verfahren und regulatorische Überwachung FINMA/GwG.", skills: ["GwG","FINMA","Due Diligence"] },
    { id: 4, title: "Privatkundenberater", dept: "Retail Banking", location: "Lausanne", type: "Festanstellung", level: "Junior", desc: "Betreuung und Bindung vermögender Kunden.", skills: ["Kundenbeziehung","Investments","Kredit"] },
    { id: 5, title: "Cybersicherheitsingenieur", dept: "Sicherheit & IT", location: "Zürich", type: "Festanstellung", level: "Senior", desc: "Schutz der Bankdatensysteme vor Cyberbedrohungen.", skills: ["SIEM","Pentest","ISO 27001"] },
    { id: 6, title: "Digital-Projektleiter", dept: "Digital & Innovation", location: "Genf", type: "Festanstellung", level: "Mid", desc: "Steuerung der digitalen Transformationsprojekte der Bank.", skills: ["Agile","Scrum","JIRA"] },
  ],
  fr: [
    { id: 1, title: "Analyste Financier Senior", dept: "Gestion de Fortune", location: "Genève", type: "CDI", level: "Senior", desc: "Analyse et gestion de portefeuilles clients privés. Minimum 5 ans d'expérience en banque privée.", skills: ["CFA","Bloomberg","Excel VBA"] },
    { id: 2, title: "Développeur Full Stack", dept: "Digital & Innovation", location: "Zurich", type: "CDI", level: "Mid", desc: "Développement de la plateforme bancaire digitale. React, TypeScript, Node.js.", skills: ["React","TypeScript","PostgreSQL"] },
    { id: 3, title: "Chargé de Conformité (KYC/AML)", dept: "Compliance & Risques", location: "Genève", type: "CDI", level: "Mid", desc: "Gestion des procédures KYC et veille réglementaire FINMA/LBA.", skills: ["LBA","FINMA","Due Diligence"] },
    { id: 4, title: "Conseiller Clientèle Privée", dept: "Banque de Détail", location: "Lausanne", type: "CDI", level: "Junior", desc: "Accompagnement et fidélisation d'une clientèle patrimoniale.", skills: ["Relation client","Investissements","Crédit"] },
    { id: 5, title: "Ingénieur Cybersécurité", dept: "Sécurité & IT", location: "Zurich", type: "CDI", level: "Senior", desc: "Protection des systèmes d'information bancaires contre les cybermenaces.", skills: ["SIEM","Pentest","ISO 27001"] },
    { id: 6, title: "Gestionnaire de Projet Digital", dept: "Digital & Innovation", location: "Genève", type: "CDI", level: "Mid", desc: "Pilotage des projets de transformation digitale de la banque.", skills: ["Agile","Scrum","JIRA"] },
  ],
  en: [
    { id: 1, title: "Senior Financial Analyst", dept: "Wealth Management", location: "Geneva", type: "Permanent", level: "Senior", desc: "Analysis and management of private client portfolios. Minimum 5 years experience in private banking.", skills: ["CFA","Bloomberg","Excel VBA"] },
    { id: 2, title: "Full-Stack Developer", dept: "Digital & Innovation", location: "Zurich", type: "Permanent", level: "Mid", desc: "Development of the digital banking platform. React, TypeScript, Node.js.", skills: ["React","TypeScript","PostgreSQL"] },
    { id: 3, title: "Compliance Officer (KYC/AML)", dept: "Compliance & Risk", location: "Geneva", type: "Permanent", level: "Mid", desc: "Management of KYC procedures and regulatory oversight FINMA/AMLA.", skills: ["AMLA","FINMA","Due Diligence"] },
    { id: 4, title: "Private Client Advisor", dept: "Retail Banking", location: "Lausanne", type: "Permanent", level: "Junior", desc: "Support and retention of wealthy clients.", skills: ["Client Relations","Investments","Credit"] },
    { id: 5, title: "Cybersecurity Engineer", dept: "Security & IT", location: "Zurich", type: "Permanent", level: "Senior", desc: "Protection of bank data systems against cyber threats.", skills: ["SIEM","Pentest","ISO 27001"] },
    { id: 6, title: "Digital Project Manager", dept: "Digital & Innovation", location: "Geneva", type: "Permanent", level: "Mid", desc: "Management of the bank's digital transformation projects.", skills: ["Agile","Scrum","JIRA"] },
  ],
  it: [
    { id: 1, title: "Analista Finanziario Senior", dept: "Gestione Patrimonio", location: "Ginevra", type: "Tempo indeterminato", level: "Senior", desc: "Analisi e gestione di portafogli clienti privati. Minimo 5 anni di esperienza in private banking.", skills: ["CFA","Bloomberg","Excel VBA"] },
    { id: 2, title: "Sviluppatore Full-Stack", dept: "Digital & Innovation", location: "Zurigo", type: "Tempo indeterminato", level: "Mid", desc: "Sviluppo della piattaforma bancaria digitale. React, TypeScript, Node.js.", skills: ["React","TypeScript","PostgreSQL"] },
    { id: 3, title: "Responsabile Conformità (KYC/AML)", dept: "Conformità & Rischi", location: "Ginevra", type: "Tempo indeterminato", level: "Mid", desc: "Gestione delle procedure KYC e supervisione normativa FINMA/LRD.", skills: ["LRD","FINMA","Due Diligence"] },
    { id: 4, title: "Consulente Clientela Privata", dept: "Retail Banking", location: "Losanna", type: "Tempo indeterminato", level: "Junior", desc: "Supporto e fidelizzazione di clientela facoltosa.", skills: ["Relazioni clienti","Investimenti","Credito"] },
    { id: 5, title: "Ingegnere Cybersicurezza", dept: "Sicurezza & IT", location: "Zurigo", type: "Tempo indeterminato", level: "Senior", desc: "Protezione dei sistemi dati bancari dalle minacce informatiche.", skills: ["SIEM","Pentest","ISO 27001"] },
    { id: 6, title: "Project Manager Digitale", dept: "Digital & Innovation", location: "Ginevra", type: "Tempo indeterminato", level: "Mid", desc: "Gestione dei progetti di trasformazione digitale della banca.", skills: ["Agile","Scrum","JIRA"] },
  ],
};

export default function CareersPage() {
  const { t, lang } = useI18n();
  const de = lang === "de";
  const safeKey = (lang === "fr" || lang === "de" || lang === "en" || lang === "it") ? lang : "fr";
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const [applied, setApplied] = useState<number | null>(null);

  const benefits = BENEFITS[safeKey];
  const jobs = JOBS[safeKey];
  const levels = ["all", "Junior", "Mid", "Senior"];
  const filtered = filter === "all" ? jobs : jobs.filter(j => j.level === filter);

  const getLevelLabel = (level: string) => {
    if (lang === "de") return level;
    if (lang === "en") return level;
    if (lang === "it") return level;
    return level === "Junior" ? "Junior" : level === "Mid" ? "Confirmé" : "Senior";
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-4">
              <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" />{t("back")}</Button></Link>
              <div className="flex items-center gap-1.5">
                <img src={logoImg} alt="SWIZKOTE" className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="text-base sm:text-lg font-bold tracking-tight" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</span>
              </div>
            </div>
            <div className="flex items-center gap-2"><LangSwitcher /><ThemeToggle /></div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-[hsl(222,40%,6%)] py-20 md:py-28">
        <img src={digitalWorkspaceImg} alt="workspace" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,40%,6%,0.6)] to-[hsl(222,40%,6%,0.95)]" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            {t("careers_hero_title")} <span className="text-gold">{de ? "Team beitreten" : lang === "en" ? "the team" : lang === "it" ? "il team" : "l'équipe"}</span>
          </h1>
          <p className="text-[hsl(220,20%,75%)] text-xl max-w-2xl mx-auto">
            {t("careers_hero_subtitle")}
          </p>
          <div className="flex justify-center gap-6 mt-10">
            {[
              { n: "350+", de: "Mitarbeitende", fr: "Employés", en: "Employees", it: "Dipendenti" },
              { n: "4", de: "Büros", fr: "Bureaux", en: "Offices", it: "Uffici" },
              { n: "18", de: "Nationalitäten", fr: "Nationalités", en: "Nationalities", it: "Nazionalità" }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-gold">{s.n}</div>
                <div className="text-sm text-[hsl(220,20%,65%)]">
                  {lang === "de" ? s.de : lang === "en" ? s.en : lang === "it" ? s.it : s.fr}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("careers_benefits_title")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="p-6 rounded-xl border bg-card text-center">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mx-auto mb-4"><Icon className="w-6 h-6 text-gold" /></div>
                  <h3 className="font-bold mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <h2 className="text-3xl font-bold">
              {t("careers_jobs_title")}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {levels.map(l => (
                <button key={l} onClick={() => setFilter(l)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === l ? "bg-gold text-[hsl(222,40%,10%)] border-gold" : "border-border hover:border-gold/50"}`}>
                  {l === "all" ? t("careers_jobs_filter_all") : getLevelLabel(l)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {filtered.map(job => (
              <div key={job.id} className="rounded-xl border bg-card overflow-hidden">
                <button className="w-full p-6 text-left flex items-center justify-between gap-4" onClick={() => setExpanded(expanded === job.id ? null : job.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-bold text-lg">{job.title}</h3>
                      <Badge variant="outline" className="text-gold border-gold/40">{getLevelLabel(job.level)}</Badge>
                      <Badge variant="secondary">{job.dept}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.type}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.dept}</span>
                    </div>
                  </div>
                  {expanded === job.id ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                </button>
                {expanded === job.id && (
                  <div className="px-6 pb-6 border-t">
                    <p className="text-muted-foreground mt-4 mb-4">{job.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills.map(s => (<span key={s} className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium">{s}</span>))}
                    </div>
                    {applied === job.id ? (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm font-medium">
                        ✓ {t("careers_jobs_applied_message")}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input placeholder={lang === "de" ? "Ihr vollständiger Name" : lang === "en" ? "Your full name" : lang === "it" ? "Il tuo nome completo" : "Votre nom complet"} className="bg-background" />
                          <Input type="email" placeholder={lang === "de" ? "Ihre E-Mail" : lang === "en" ? "Your email" : lang === "it" ? "La tua email" : "Votre email"} className="bg-background" />
                        </div>
                        <Textarea placeholder={lang === "de" ? "Motivationsschreiben (optional)" : lang === "en" ? "Cover letter (optional)" : lang === "it" ? "Lettera di motivazione (opzionale)" : "Lettre de motivation (optionnel)"} className="bg-background min-h-[100px]" />
                        <Button className="gold-gradient text-[hsl(222,40%,10%)] font-semibold gap-2" onClick={() => setApplied(job.id)}>
                          <Send className="w-4 h-4" /> {t("careers_jobs_apply_button")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© 2026 SWIZKOTE SA — <Link href="/privacy" className="hover:text-foreground">{lang === "de" ? "Datenschutz" : lang === "en" ? "Privacy" : lang === "it" ? "Privacy" : "Confidentialité"}</Link> · <Link href="/legal" className="hover:text-foreground">{lang === "de" ? "Impressum" : lang === "en" ? "Legal" : lang === "it" ? "Note legali" : "Mentions légales"}</Link></p>
        </div>
      </footer>
    </div>
  );
}