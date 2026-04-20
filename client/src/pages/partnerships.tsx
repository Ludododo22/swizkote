import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/components/theme-provider";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, ArrowLeft, Handshake, Building2, Code2, CreditCard, TrendingUp, Globe, Send, CheckCircle } from "lucide-react";
const logoImg = "/logo.png";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (<Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>);
}

const PARTNER_TYPES = {
  de: [
    { icon: Building2, title: "Finanzinstitutionen", desc: "Korrespondenzbanken, Versicherungen und Investmentfonds, die Clearing- und Co-Distributionslösungen suchen." },
    { icon: Code2, title: "FinTechs & Startups", desc: "Innovative Unternehmen, die unsere Bank-APIs integrieren oder von unserer FINMA-regulierten Infrastruktur profitieren möchten." },
    { icon: CreditCard, title: "Handelspartner", desc: "Einzelhändler, E-Commerce und Plattformen, die ihren Kunden Zahlungs- und Finanzierungslösungen anbieten möchten." },
    { icon: TrendingUp, title: "Vermögensverwalter", desc: "Family Offices und unabhängige Vermögensverwalter, die eine Referenz-Depotbank für ihre Kundenportfolios suchen." },
  ],
  fr: [
    { icon: Building2, title: "Institutions financières", desc: "Banques correspondantes, compagnies d'assurance et fonds d'investissement cherchant des solutions de compensation et co-distribution." },
    { icon: Code2, title: "FinTechs & Startups", desc: "Entreprises innovantes souhaitant intégrer nos APIs bancaires ou bénéficier de notre infrastructure réglementée FINMA." },
    { icon: CreditCard, title: "Partenaires commerciaux", desc: "Retailers, e-commerces et plateformes souhaitant proposer des solutions de paiement et financement à leurs clients." },
    { icon: TrendingUp, title: "Gestionnaires de fortune", desc: "Family offices et gérants indépendants cherchant une banque dépositaire de référence pour leurs portefeuilles clients." },
  ],
  en: [
    { icon: Building2, title: "Financial Institutions", desc: "Correspondent banks, insurance companies and investment funds seeking clearing and co-distribution solutions." },
    { icon: Code2, title: "FinTechs & Startups", desc: "Innovative companies wanting to integrate our banking APIs or benefit from our FINMA-regulated infrastructure." },
    { icon: CreditCard, title: "Commercial Partners", desc: "Retailers, e-commerce and platforms wishing to offer payment and financing solutions to their customers." },
    { icon: TrendingUp, title: "Wealth Managers", desc: "Family offices and independent asset managers looking for a reference custodian bank for their client portfolios." },
  ],
  it: [
    { icon: Building2, title: "Istituzioni finanziarie", desc: "Banche corrispondenti, compagnie assicurative e fondi d'investimento in cerca di soluzioni di compensazione e co-distribuzione." },
    { icon: Code2, title: "FinTech & Startup", desc: "Aziende innovative che desiderano integrare le nostre API bancarie o beneficiare della nostra infrastruttura regolamentata FINMA." },
    { icon: CreditCard, title: "Partner Commerciali", desc: "Retailer, e-commerce e piattaforme che desiderano offrire soluzioni di pagamento e finanziamento ai propri clienti." },
    { icon: TrendingUp, title: "Gestori patrimoniali", desc: "Family office e gestori patrimoniali indipendenti in cerca di una banca depositaria di riferimento per i portafogli clienti." },
  ],
};

const BENEFITS = {
  de: [
    "Zugang zu unserer FINMA-lizenzierten Bankinfrastruktur",
    "Dokumentierte REST-APIs für die technische Integration",
    "Dedizierter Support durch einen Relationship Manager",
    "Zugang zu Finanzmärkten über unser Korrespondentennetz",
    "Co-Branding und White-Label-Lösungen verfügbar",
    "Attraktives Vergütungsprogramm für Geschäftsvermittlungen",
  ],
  fr: [
    "Accès à notre infrastructure bancaire agréée FINMA",
    "APIs REST documentées pour l'intégration technique",
    "Support dédié d'un Relationship Manager",
    "Accès aux marchés financiers via notre réseau correspondant",
    "Co-branding et solutions white-label disponibles",
    "Programme de rémunération attractif sur apports d'affaires",
  ],
  en: [
    "Access to our FINMA-licensed banking infrastructure",
    "Documented REST APIs for technical integration",
    "Dedicated support from a Relationship Manager",
    "Access to financial markets via our correspondent network",
    "Co-branding and white-label solutions available",
    "Attractive compensation program for business referrals",
  ],
  it: [
    "Accesso alla nostra infrastruttura bancaria autorizzata FINMA",
    "API REST documentate per l'integrazione tecnica",
    "Supporto dedicato da un Relationship Manager",
    "Accesso ai mercati finanziari tramite la nostra rete di corrispondenti",
    "Co-branding e soluzioni white-label disponibili",
    "Programma di compensazione attraente per segnalazioni di affari",
  ],
};

const CURRENT_PARTNERS = ["Visa International","Mastercard Europe","SWIFT Network","SIX Group","Temenos","Finastra","Bloomberg LP","Reuters","Euroclear","Clearstream"];

const FORM_OPTS = {
  de: ["Finanzinstitution","FinTech / Startup","Handelspartner","Vermögensverwalter","Sonstiges"],
  fr: ["Institution financière","FinTech / Startup","Partenaire commercial","Gestionnaire de fortune","Autre"],
  en: ["Financial Institution","FinTech / Startup","Commercial Partner","Wealth Manager","Other"],
  it: ["Istituzione finanziaria","FinTech / Startup","Partner commerciale","Gestore patrimoniale","Altro"],
};

export default function PartnershipsPage() {
  const { t, lang } = useI18n();
  const de = lang === "de";
  const safeKey = (lang === "fr" || lang === "de" || lang === "en" || lang === "it") ? lang : "fr";
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ company: "", name: "", email: "", type: "", message: "" });

  const types = PARTNER_TYPES[safeKey];
  const benefits = BENEFITS[safeKey];
  const formOpts = FORM_OPTS[safeKey];

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
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6"><Handshake className="w-8 h-8 text-gold" /></div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
            {t("partnerships_hero_title")}
          </h1>
          <p className="text-[hsl(220,20%,75%)] text-lg max-w-2xl mx-auto">
            {de ? "Lassen Sie uns gemeinsam innovative Finanzlösungen entwickeln. SwizKote Bank ist offen für alle Formen strategischer Zusammenarbeit." 
              : lang === "en" ? "Let's build innovative financial solutions together. SwizKote Bank is open to all forms of strategic collaboration."
              : lang === "it" ? "Costruiamo insieme soluzioni finanziarie innovative. SwizKote Bank è aperta a tutte le forme di collaborazione strategica."
              : "Construisons ensemble des solutions financières innovantes. SwizKote Bank est ouverte à toutes les formes de collaboration stratégique."}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("partnerships_types_title")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {types.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="p-6 rounded-xl border bg-card hover:border-gold/30 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0"><Icon className="w-6 h-6 text-gold" /></div>
                    <div><h3 className="font-bold text-lg mb-2">{p.title}</h3><p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8">
                {t("partnerships_benefits_title")}
              </h2>
              <div className="space-y-4">
                {benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-xl mb-6">
                {t("partnerships_partners_title")}
              </h3>
              <div className="flex flex-wrap gap-3">
                {CURRENT_PARTNERS.map((p, i) => (
                  <div key={i} className="px-4 py-2 rounded-lg border bg-card text-sm font-medium flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-gold" />{p}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("partnerships_form_title")}
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            {t("partnerships_form_subtitle")}
          </p>
          {submitted ? (
            <div className="p-8 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">{t("partnerships_form_sent_title")}</h3>
              <p className="text-muted-foreground">{t("partnerships_form_sent_desc")}</p>
            </div>
          ) : (
            <div className="p-8 rounded-xl border bg-card space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium mb-1.5 block">{t("partnerships_form_company")}</label><Input placeholder={de ? "Name Ihres Unternehmens" : lang === "en" ? "Your company name" : lang === "it" ? "Nome della tua azienda" : "Nom de votre société"} value={form.company} onChange={e => setForm({...form, company: e.target.value})} /></div>
                <div><label className="text-sm font-medium mb-1.5 block">{t("partnerships_form_name")}</label><Input placeholder={de ? "Ihr Name" : lang === "en" ? "Your name" : lang === "it" ? "Il tuo nome" : "Votre nom"} value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("partnerships_form_email")}</label><Input type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("partnerships_form_type")}</label>
                <select className="w-full px-3 py-2 rounded-md border bg-background text-sm" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="">{de ? "Auswählen..." : lang === "en" ? "Select..." : lang === "it" ? "Seleziona..." : "Sélectionner..."}</option>
                  {formOpts.map((o, i) => <option key={i}>{o}</option>)}
                </select>
              </div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("partnerships_form_message")}</label><Textarea placeholder={de ? "Beschreiben Sie Ihren Partnerschaftsvorschlag..." : lang === "en" ? "Describe your partnership proposal..." : lang === "it" ? "Descrivi la tua proposta di partnership..." : "Décrivez votre proposition de partenariat..."} className="min-h-[120px]" value={form.message} onChange={e => setForm({...form, message: e.target.value})} /></div>
              <Button className="w-full gold-gradient text-[hsl(222,40%,10%)] font-semibold gap-2" disabled={!form.company || !form.name || !form.email} onClick={() => setSubmitted(true)}>
                <Send className="w-4 h-4" /> {t("partnerships_form_submit")}
              </Button>
            </div>
          )}
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