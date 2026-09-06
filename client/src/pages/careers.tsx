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
};

export default function CareersPage() {
  const { lang } = useI18n();
  const de = lang === "de";
  const safeKey = (lang === "fr" || lang === "de") ? lang : "fr";
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const [applied, setApplied] = useState<number | null>(null);

  const benefits = BENEFITS[safeKey];
  const jobs = JOBS[safeKey];
  const levels = ["all", "Junior", "Mid", "Senior"];
  const filtered = filter === "all" ? jobs : jobs.filter(j => j.level === filter);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-4">
              <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" />{de ? "Zurück" : "Retour"}</Button></Link>
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
            {de ? <>Dem <span className="text-gold">Team beitreten</span></> : <>Rejoignez <span className="text-gold">l'équipe</span></>}
          </h1>
          <p className="text-[hsl(220,20%,75%)] text-xl max-w-2xl mx-auto">
            {de ? "Bauen Sie mit uns die Bank von morgen. Aussergewöhnliche Chancen für aussergewöhnliche Talente." : "Construisez la banque de demain avec nous. Des opportunités exceptionnelles pour des talents exceptionnels."}
          </p>
          <div className="flex justify-center gap-6 mt-10">
            {[{ n: "350+", de: "Mitarbeitende", fr: "Employés" }, { n: "4", de: "Büros", fr: "Bureaux" }, { n: "18", de: "Nationalitäten", fr: "Nationalités" }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-gold">{s.n}</div>
                <div className="text-sm text-[hsl(220,20%,65%)]">{de ? s.de : s.fr}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {de ? <>Was wir <span className="text-gold">bieten</span></> : <>Ce que nous <span className="text-gold">offrons</span></>}
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
              {de ? <>Offene <span className="text-gold">Stellen</span></> : <>Postes <span className="text-gold">ouverts</span></>}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {levels.map(l => (
                <button key={l} onClick={() => setFilter(l)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${filter === l ? "bg-gold text-[hsl(222,40%,10%)] border-gold" : "border-border hover:border-gold/50"}`}>
                  {l === "all" ? (de ? "Alle" : "Tous") : l}
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
                      <Badge variant="outline" className="text-gold border-gold/40">{job.level}</Badge>
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
                        ✓ {de ? "Ihre Bewerbung wurde erfolgreich gesendet!" : "Votre candidature a été envoyée avec succès !"}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <Input placeholder={de ? "Ihr vollständiger Name" : "Votre nom complet"} className="bg-background" />
                          <Input type="email" placeholder={de ? "Ihre E-Mail" : "Votre email"} className="bg-background" />
                        </div>
                        <Textarea placeholder={de ? "Motivationsschreiben (optional)" : "Lettre de motivation (optionnel)"} className="bg-background min-h-[100px]" />
                        <Button className="gold-gradient text-[hsl(222,40%,10%)] font-semibold gap-2" onClick={() => setApplied(job.id)}>
                          <Send className="w-4 h-4" /> {de ? "Auf diese Stelle bewerben" : "Postuler à ce poste"}
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
          <p>{de ? "© 2026 SWIZKOTE SA — " : "© 2026 SWIZKOTE SA — "}<Link href="/privacy" className="hover:text-foreground">{de ? "Datenschutz" : "Confidentialité"}</Link> · <Link href="/legal" className="hover:text-foreground">{de ? "Impressum" : "Mentions légales"}</Link></p>
        </div>
      </footer>
    </div>
  );
}
