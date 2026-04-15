import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { useEffect } from "react";
import {
  Sun, Moon, ArrowLeft, ArrowRight, CreditCard, TrendingUp,
  Shield, Wallet, PiggyBank, Home, CheckCircle, Building2,
  Briefcase, Landmark, Store, ShoppingBag, Car, Wrench,
  GraduationCap, Heart, PlaneTakeoff, Lightbulb, Users,
} from "lucide-react";
const logoImg = "/logo.png";

// ─── Royalty-free Unsplash images — no watermark ──────────────────────────────
const IMG_GIROKONTO     = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=700&fit=crop&q=80";
const IMG_SPARKONTO     = "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=1200&h=700&fit=crop&q=80";
const IMG_KARTEN        = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=700&fit=crop&q=80";
const IMG_KREDITE       = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=700&fit=crop&q=80";
const IMG_VERMOEGEN     = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=700&fit=crop&q=80";
const IMG_SICHERHEIT    = "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=700&fit=crop&q=80";

// ─── Theme toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

// ─── Business loan types ──────────────────────────────────────────────────────
const BUSINESS_LOANS = {
  de: [
    { icon: Building2,  name: "Investitionskredit",   desc: "Finanzierung von Maschinen, Anlagen und Betriebsmitteln",       rate: "ab 3,2%",  max: "CHF 5 Mio."    },
    { icon: Briefcase,  name: "Betriebskredit",        desc: "Liquiditätssicherung und Betriebsmittelfinanzierung",           rate: "ab 4,5%",  max: "CHF 2 Mio."    },
    { icon: Landmark,   name: "Gewerbeimmobilien",     desc: "Finanzierung von Geschäftsräumen und Gewerbeliegenschaften",    rate: "ab 2,2%",  max: "CHF 10 Mio."   },
    { icon: TrendingUp, name: "Startup-Finanzierung",  desc: "Gründungsfinanzierung für junge Unternehmen",                  rate: "ab 5,9%",  max: "CHF 500.000"   },
    { icon: Store,      name: "Lombardkredit",         desc: "Wertschriftenbasierte Finanzierung",                            rate: "ab 1,8%",  max: "CHF 2 Mio."    },
  ],
  fr: [
    { icon: Building2,  name: "Crédit d'investissement", desc: "Financement de machines, équipements et fonds de roulement",    rate: "dès 3,2%", max: "CHF 5 Mio."    },
    { icon: Briefcase,  name: "Crédit d'exploitation",   desc: "Sécurisation de liquidité et financement du fonds de roulement", rate: "dès 4,5%", max: "CHF 2 Mio."    },
    { icon: Landmark,   name: "Immobilier commercial",   desc: "Financement de locaux professionnels et propriétés commerciales",rate: "dès 2,2%", max: "CHF 10 Mio."   },
    { icon: TrendingUp, name: "Financement startup",     desc: "Financement de création pour jeunes entreprises",               rate: "dès 5,9%", max: "CHF 500.000"   },
    { icon: Store,      name: "Crédit lombard",          desc: "Financement basé sur titres",                                   rate: "dès 1,8%", max: "CHF 2 Mio."    },
  ],
  en: [
    { icon: Building2,  name: "Investment Loan",        desc: "Financing for machinery, equipment and working capital",        rate: "from 3.2%", max: "CHF 5 Mio."   },
    { icon: Briefcase,  name: "Operating Loan",         desc: "Liquidity security and working capital financing",             rate: "from 4.5%", max: "CHF 2 Mio."   },
    { icon: Landmark,   name: "Commercial Real Estate", desc: "Financing for business premises and commercial properties",     rate: "from 2.2%", max: "CHF 10 Mio."  },
    { icon: TrendingUp, name: "Startup Financing",      desc: "Startup financing for young companies",                        rate: "from 5.9%", max: "CHF 500,000"  },
    { icon: Store,      name: "Lombard Loan",           desc: "Securities-based financing",                                    rate: "from 1.8%", max: "CHF 2 Mio."   },
  ],
  it: [
    { icon: Building2,  name: "Credito d'investimento", desc: "Finanziamento per macchinari, attrezzature e capitale circolante", rate: "dal 3,2%", max: "CHF 5 Mio."    },
    { icon: Briefcase,  name: "Credito d'esercizio",    desc: "Garanzia di liquidità e finanziamento del capitale circolante",   rate: "dal 4,5%", max: "CHF 2 Mio."    },
    { icon: Landmark,   name: "Immobili Commerciali",   desc: "Finanziamento per locali commerciali e proprietà aziendali",     rate: "dal 2,2%", max: "CHF 10 Mio."   },
    { icon: TrendingUp, name: "Finanziamento Startup",  desc: "Finanziamento per giovani imprese",                              rate: "dal 5,9%", max: "CHF 500.000"   },
    { icon: Store,      name: "Credito Lombard",        desc: "Finanziamento basato su titoli",                                 rate: "dal 1,8%", max: "CHF 2 Mio."    },
  ],
};

// ─── Personal loan types ──────────────────────────────────────────────────────
const PERSONAL_LOANS = {
  de: [
    { icon: Home,          name: "Hypothekarkredit",    desc: "Finanzierung von Wohneigentum und Immobilien",                    rate: "ab 1,5%",  max: "CHF 2 Mio."    },
    { icon: ShoppingBag,   name: "Konsumkredit",        desc: "Flexible Finanzierung für persönliche Anschaffungen",             rate: "ab 4,9%",  max: "CHF 250.000"   },
    { icon: Car,           name: "Autokredit",          desc: "Finanzierung von Neufahrzeugen und Gebrauchtwagen",               rate: "ab 2,9%",  max: "CHF 200.000"   },
    { icon: Wrench,        name: "Renovierungskredit",  desc: "Finanzierung von Sanierungs- und Modernisierungsprojekten",       rate: "ab 2,2%",  max: "CHF 300.000"   },
    { icon: GraduationCap, name: "Bildungskredit",      desc: "Finanzierung von Studiengängen und Weiterbildung",                rate: "ab 3,5%",  max: "CHF 100.000"   },
    { icon: Heart,         name: "Gesundheitskredit",   desc: "Finanzierung von medizinischen Behandlungen und Zahnarzt",        rate: "ab 4,5%",  max: "CHF 50.000"    },
    { icon: PlaneTakeoff,  name: "Reisekredit",         desc: "Finanzierung für Traumreisen und Hochzeiten",                     rate: "ab 5,9%",  max: "CHF 30.000"    },
    { icon: Lightbulb,     name: "Energiekredit",       desc: "Finanzierung für energetische Sanierungen",                       rate: "ab 1,9%",  max: "CHF 150.000"   },
  ],
  fr: [
    { icon: Home,          name: "Crédit hypothécaire", desc: "Financement de la propriété et de l'immobilier",                  rate: "dès 1,5%", max: "CHF 2 Mio."    },
    { icon: ShoppingBag,   name: "Crédit consommation", desc: "Financement flexible pour achats personnels",                     rate: "dès 4,9%", max: "CHF 250.000"   },
    { icon: Car,           name: "Crédit automobile",   desc: "Financement de véhicules neufs et d'occasion",                    rate: "dès 2,9%", max: "CHF 200.000"   },
    { icon: Wrench,        name: "Crédit rénovation",   desc: "Financement de projets de rénovation et modernisation",           rate: "dès 2,2%", max: "CHF 300.000"   },
    { icon: GraduationCap, name: "Crédit formation",    desc: "Financement d'études et formation continue",                      rate: "dès 3,5%", max: "CHF 100.000"   },
    { icon: Heart,         name: "Crédit santé",        desc: "Financement de traitements médicaux et dentaires",                rate: "dès 4,5%", max: "CHF 50.000"    },
    { icon: PlaneTakeoff,  name: "Crédit voyage",       desc: "Financement pour voyages de rêve et mariages",                    rate: "dès 5,9%", max: "CHF 30.000"    },
    { icon: Lightbulb,     name: "Crédit énergie",      desc: "Financement pour rénovations énergétiques",                       rate: "dès 1,9%", max: "CHF 150.000"   },
  ],
  en: [
    { icon: Home,          name: "Mortgage Loan",       desc: "Financing for home ownership and real estate",                    rate: "from 1.5%",  max: "CHF 2 Mio."   },
    { icon: ShoppingBag,   name: "Consumer Loan",       desc: "Flexible financing for personal purchases",                       rate: "from 4.9%",  max: "CHF 250,000"  },
    { icon: Car,           name: "Car Loan",            desc: "Financing for new and used vehicles",                             rate: "from 2.9%",  max: "CHF 200,000"  },
    { icon: Wrench,        name: "Renovation Loan",     desc: "Financing for renovation and modernization projects",             rate: "from 2.2%",  max: "CHF 300,000"  },
    { icon: GraduationCap, name: "Education Loan",      desc: "Financing for studies and continuing education",                  rate: "from 3.5%",  max: "CHF 100,000"  },
    { icon: Heart,         name: "Health Loan",         desc: "Financing for medical treatments and dental care",                rate: "from 4.5%",  max: "CHF 50,000"   },
    { icon: PlaneTakeoff,  name: "Travel Loan",         desc: "Financing for dream vacations and weddings",                      rate: "from 5.9%",  max: "CHF 30,000"   },
    { icon: Lightbulb,     name: "Energy Loan",         desc: "Financing for energy-efficient renovations",                      rate: "from 1.9%",  max: "CHF 150,000"  },
  ],
  it: [
    { icon: Home,          name: "Mutuo Immobiliare",   desc: "Finanziamento per l'acquisto di casa e immobili",                 rate: "dal 1,5%",  max: "CHF 2 Mio."    },
    { icon: ShoppingBag,   name: "Prestito Personale",  desc: "Finanziamento flessibile per acquisti personali",                  rate: "dal 4,9%",  max: "CHF 250.000"   },
    { icon: Car,           name: "Prestito Auto",       desc: "Finanziamento per veicoli nuovi e usati",                         rate: "dal 2,9%",  max: "CHF 200.000"   },
    { icon: Wrench,        name: "Prestito Ristrutturazione", desc: "Finanziamento per progetti di ristrutturazione",            rate: "dal 2,2%",  max: "CHF 300.000"   },
    { icon: GraduationCap, name: "Prestito Studio",     desc: "Finanziamento per studi e formazione continua",                   rate: "dal 3,5%",  max: "CHF 100.000"   },
    { icon: Heart,         name: "Prestito Sanitario",  desc: "Finanziamento per cure mediche e odontoiatriche",                 rate: "dal 4,5%",  max: "CHF 50.000"    },
    { icon: PlaneTakeoff,  name: "Prestito Viaggi",     desc: "Finanziamento per viaggi da sogno e matrimoni",                   rate: "dal 5,9%",  max: "CHF 30.000"    },
    { icon: Lightbulb,     name: "Prestito Energetico", desc: "Finanziamento per ristrutturazioni energetiche",                  rate: "dal 1,9%",  max: "CHF 150.000"   },
  ],
};

// ─── Service catalogue - COMPLETE 4 LANGUAGES ─────────────────────────────────
export const SERVICES = {
  de: [
    {
      id: "girokonto",
      icon: Wallet,
      title: "Girokonto",
      tagline: "Ihr tägliches Konto ohne Grenzen",
      img: IMG_GIROKONTO,
      color: "from-blue-900 to-blue-800",
      desc: "Unser Girokonto bietet eine reibungslose Finanzverwaltung mit 24-Stunden-Zugang über unsere mobile App und die Online-Plattform. Keine Kontoführungsgebühren bei Guthaben über CHF 1.000.",
      features: [
        "Visa-Debitkarte inklusive",
        "Sofortige SEPA-Überweisungen",
        "Echtzeit-Benachrichtigungen",
        "Mobile App für iOS & Android",
        "Prioritärer Kundenservice",
        "Kostenlose elektronische Kontoauszüge",
      ],
      conditions: [
        ["Mindestguthaben",          "CHF 0"],
        ["Kontoführungsgebühr",      "CHF 12/Monat (entfällt bei > CHF 1.000)"],
        ["Debitkarte",               "Inklusive"],
        ["SEPA-Überweisungen",       "Kostenlos"],
        ["Internationale Überweisungen", "CHF 15 pro Vorgang"],
        ["Bankomat Schweiz",         "Kostenlos bis 5×/Monat"],
      ],
    },
    {
      id: "sparkonto",
      icon: PiggyBank,
      title: "Sparkonto",
      tagline: "Lassen Sie Ihr Vermögen sicher wachsen",
      img: IMG_SPARKONTO,
      color: "from-green-900 to-green-800",
      desc: "Unser verzinstes Sparkonto ermöglicht es Ihnen, Ihr Kapital mit wettbewerbsfähigen, garantierten Zinsen zu vermehren, die durch die Schweizer Einlagengarantie bis CHF 100.000 geschützt sind.",
      features: [
        "Attraktiver Zinssatz bis 1,8% p.a.",
        "Kein Risiko — Kapital garantiert",
        "esisuisse-Schutz CHF 100.000",
        "Automatische monatliche Überweisung vom Girokonto",
        "Individuell anpassbare Sparziele",
        "Zinsen monatlich gutgeschrieben",
      ],
      conditions: [
        ["Zinssatz",          "1,20% – 1,80% p.a. je nach Guthaben"],
        ["Mindesteinlage",    "CHF 100"],
        ["Garantiertes Limit","CHF 100.000 (esisuisse)"],
        ["Abhebungen",        "Frei (D+1)"],
        ["Gebühren",          "Keine"],
        ["Zinsen",            "Monatlich gutgeschrieben"],
      ],
    },
    {
      id: "premium-karten",
      icon: CreditCard,
      title: "Premium-Karten",
      tagline: "Visa Infinite & Mastercard Gold — Prestige auf Knopfdruck",
      img: IMG_KARTEN,
      color: "from-yellow-900 to-amber-800",
      desc: "Unsere Premium-Karten bieten ein aussergewöhnliches Zahlungserlebnis mit exklusiven Vorteilen, einer umfassenden Reiseversicherung und einem 24/7-Concierge-Service.",
      features: [
        "Visa Infinite mit Allgefahren-Reiseversicherung",
        "Mastercard Gold mit 1% Cashback",
        "Privater Concierge 24/7",
        "VIP-Lounge in 1.200 Flughäfen",
        "Kaufschutz und erweiterte Garantie",
        "Kontaktlose NFC-Zahlung",
      ],
      conditions: [
        ["Visa Infinite",         "CHF 450/Jahr"],
        ["Mastercard Gold",       "CHF 150/Jahr"],
        ["Monatliches Limit",     "Bis CHF 50.000"],
        ["Weltweite ATM-Abhebung","Unbegrenzt (Drittbank-Gebühren)"],
        ["Reiseversicherung",     "Inklusive (bis CHF 500.000)"],
        ["Mastercard Cashback",   "1% auf alle Einkäufe"],
      ],
    },
    {
      id: "kredite",
      icon: Home,
      title: "Kredite & Darlehen",
      tagline: "Privat- und Unternehmensfinanzierung",
      img: IMG_KREDITE,
      color: "from-purple-900 to-purple-800",
      desc: "SwizKote Bank finanziert Ihre Lebens- und Unternehmensprojekte mit flexiblen Kreditlösungen, wettbewerbsfähigen Zinsen und einer raschen Antwort innerhalb von 48 Stunden.",
      businessLoans: BUSINESS_LOANS.de,
      personalLoans: PERSONAL_LOANS.de,
      features: [
        "Unternehmensfinanzierung: Investitions-, Betriebs-, Gewerbeimmobilien- und Startup-Kredite",
        "Privatfinanzierung: Hypothekarkredite, Konsum-, Auto-, Renovierungs- und Bildungskredite",
        "Lombardkredit auf Wertpapierportfolio",
        "Grundsatzbescheid innerhalb 48h",
        "Keine Vorfälligkeitsentschädigung (nach 5 Jahren)",
        "Flexible Laufzeiten und Tilgungsoptionen",
      ],
      conditions: [
        ["Unternehmensfinanzierung",          "2,2% – 7% p.a."],
        ["Privatfinanzierung",                "1,5% – 5,9% p.a."],
        ["Max. Laufzeit Unternehmen",         "15 Jahre"],
        ["Max. Laufzeit Privat",              "30 Jahre"],
        ["Max. Betrag Unternehmen",           "CHF 10.000.000"],
        ["Max. Betrag Privat",                "CHF 2.000.000"],
        ["Antwortfrist",                      "Grundsatzbescheid in 48h"],
      ],
    },
    {
      id: "vermoegensverwaltung",
      icon: TrendingUp,
      title: "Vermögensverwaltung",
      tagline: "Ihr Vermögen in den besten Händen",
      img: IMG_VERMOEGEN,
      color: "from-slate-900 to-slate-800",
      desc: "Unser Team CFA-zertifizierter Vermögensverwalter betreut Ihr Vermögen mit einem personalisierten Ansatz, der Kapitalerhalt, Diversifikation und Steueroptimierung vereint.",
      features: [
        "Persönlicher Vermögensberater",
        "Massgeschneiderte Anlagestrategie",
        "Globales diversifiziertes Portfolio",
        "Monatliches detailliertes Reporting",
        "Steuer- und Nachfolgeoptimierung",
        "Zugang zu Primärmärkten (IPO)",
      ],
      conditions: [
        ["Mindestvermögen",    "CHF 500.000"],
        ["Verwaltungshonorar", "0,80% – 1,20% p.a. je nach Vermögen"],
        ["Performance Fee",    "10% über Benchmark"],
        ["Reporting",         "Monatlich und vierteljährlich"],
        ["Bilanzbesprechung", "Mind. halbjährlich"],
        ["Sprachen",          "Deutsch, Französisch, Englisch"],
      ],
    },
    {
      id: "sicherheit",
      icon: Shield,
      title: "Sicherheit & Schutz",
      tagline: "Ihre Sicherheit — unser absolutes Engagement",
      img: IMG_SICHERHEIT,
      color: "from-red-900 to-red-800",
      desc: "SwizKote Bank setzt die fortschrittlichsten Sicherheitstechnologien ein, um Ihr Vermögen und Ihre persönlichen Daten vor jeder Bedrohung zu schützen.",
      features: [
        "Starke Authentifizierung (2FA) obligatorisch",
        "Ende-zu-Ende AES-256-Verschlüsselung",
        "24/7-Transaktionsüberwachung",
        "Sofortige Kartensperre über die App",
        "Versicherung gegen Online-Betrug",
        "Dediziertes SOC-Sicherheitszentrum",
      ],
      conditions: [
        ["Verschlüsselung",   "AES-256 (Übertragung & Speicherung)"],
        ["Authentifizierung", "2FA / OTP obligatorisch"],
        ["Überwachung",       "24h/24, 7 Tage/Woche"],
        ["Betrugsdeckung",    "Bis CHF 50.000/Jahr"],
        ["Zertifizierung",    "ISO 27001"],
        ["Verfügbarkeit",     "99,99% (SLA)"],
      ],
    },
  ],
  fr: [
    {
      id: "compte-courant",
      icon: Wallet,
      title: "Compte Courant",
      tagline: "Votre compte du quotidien, sans limites",
      img: IMG_GIROKONTO,
      color: "from-blue-900 to-blue-800",
      desc: "Notre compte courant offre une gestion fluide de vos finances avec un accès 24h/24 via notre application mobile et la plateforme en ligne. Aucun frais de tenue de compte dès CHF 1.000 de solde.",
      features: [
        "Carte de débit Visa incluse",
        "Virements SEPA instantanés",
        "Notifications en temps réel",
        "Application mobile iOS & Android",
        "Service client prioritaire",
        "Relevés électroniques gratuits",
      ],
      conditions: [
        ["Solde minimum",             "CHF 0"],
        ["Frais de tenue",            "CHF 12/mois (offerts si > CHF 1 000)"],
        ["Carte de débit",            "Incluse"],
        ["Virements SEPA",            "Gratuits"],
        ["Virements internationaux",  "CHF 15 par opération"],
        ["Retrait DAB Suisse",        "Gratuit jusqu'à 5×/mois"],
      ],
    },
    {
      id: "epargne",
      icon: PiggyBank,
      title: "Compte Épargne",
      tagline: "Faites fructifier votre patrimoine en toute sécurité",
      img: IMG_SPARKONTO,
      color: "from-green-900 to-green-800",
      desc: "Notre compte épargne rémunéré vous permet de faire croître votre capital avec des taux compétitifs, garantis et protégés par la garantie des dépôts suisse jusqu'à CHF 100 000.",
      features: [
        "Taux d'intérêt attractif jusqu'à 1,8% p.a.",
        "Aucun risque — capital garanti",
        "Protection esisuisse CHF 100 000",
        "Virement automatique mensuel depuis le compte courant",
        "Objectifs d'épargne personnalisables",
        "Intérêts crédités mensuellement",
      ],
      conditions: [
        ["Taux d'intérêt",    "1,20% à 1,80% p.a. selon solde"],
        ["Dépôt minimum",     "CHF 100"],
        ["Plafond garanti",   "CHF 100 000 (esisuisse)"],
        ["Retraits",          "Libres (D+1)"],
        ["Frais",             "Aucun"],
        ["Intérêts",          "Crédités mensuellement"],
      ],
    },
    {
      id: "cartes",
      icon: CreditCard,
      title: "Cartes Bancaires",
      tagline: "Visa Infinite & Mastercard Gold — Le prestige à portée de main",
      img: IMG_KARTEN,
      color: "from-yellow-900 to-amber-800",
      desc: "Nos cartes premium vous offrent une expérience de paiement exceptionnelle, avec des avantages exclusifs, une assurance voyage complète et un service conciergerie disponible 24h/24.",
      features: [
        "Visa Infinite avec assurance voyage tous risques",
        "Mastercard Gold avec cashback 1%",
        "Conciergerie privée 24/7",
        "Accès salons VIP dans 1 200 aéroports",
        "Protection achat et garantie étendue",
        "Paiements sans contact NFC",
      ],
      conditions: [
        ["Visa Infinite",          "CHF 450/an"],
        ["Mastercard Gold",        "CHF 150/an"],
        ["Plafond mensuel",        "Jusqu'à CHF 50 000"],
        ["Retrait DAB monde",      "Illimité (frais tiers)"],
        ["Assurance voyage",       "Incluse (jusqu'à CHF 500 000)"],
        ["Cashback Mastercard",    "1% sur tous les achats"],
      ],
    },
    {
      id: "credits",
      icon: Home,
      title: "Crédits & Prêts",
      tagline: "Financement particulier et d'entreprises",
      img: IMG_KREDITE,
      color: "from-purple-900 to-purple-800",
      desc: "SwizKote Bank finance vos projets de vie et d'entreprise avec des solutions de crédit flexibles, des taux compétitifs et une réponse rapide sous 48 heures ouvrables.",
      businessLoans: BUSINESS_LOANS.fr,
      personalLoans: PERSONAL_LOANS.fr,
      features: [
        "Financement entreprise : crédits d'investissement, d'exploitation, immobilier commercial et startup",
        "Financement particulier : crédits hypothécaires, consommation, automobile, rénovation et formation",
        "Crédit lombard sur portefeuille titres",
        "Décision de principe sous 48h",
        "Pas de pénalité de remboursement anticipé (après 5 ans)",
        "Durées et options de remboursement flexibles",
      ],
      conditions: [
        ["Financement entreprise",    "2,2% – 7% p.a."],
        ["Financement particulier",   "1,5% – 5,9% p.a."],
        ["Durée max entreprise",      "15 ans"],
        ["Durée max particulier",     "30 ans"],
        ["Montant max entreprise",    "CHF 10.000.000"],
        ["Montant max particulier",   "CHF 2.000.000"],
        ["Délai de réponse",          "Accord de principe sous 48h"],
      ],
    },
    {
      id: "gestion-fortune",
      icon: TrendingUp,
      title: "Gestion de Fortune",
      tagline: "Votre patrimoine entre les meilleures mains",
      img: IMG_VERMOEGEN,
      color: "from-slate-900 to-slate-800",
      desc: "Notre équipe de gérants certifiés CFA gère votre patrimoine avec une approche personnalisée, alliant préservation du capital, diversification et optimisation fiscale.",
      features: [
        "Gestionnaire de patrimoine dédié",
        "Stratégie d'investissement personnalisée",
        "Portefeuille diversifié global",
        "Reporting mensuel détaillé",
        "Optimisation fiscale et successorale",
        "Accès aux marchés primaires (IPO)",
      ],
      conditions: [
        ["Patrimoine minimum", "CHF 500 000"],
        ["Honoraires gestion", "0,80% à 1,20% p.a."],
        ["Performance fee",    "10% au-dessus du benchmark"],
        ["Reporting",         "Mensuel et trimestriel"],
        ["Réunion bilan",     "Semestrielle minimum"],
        ["Langues",           "Français, Allemand, Anglais"],
      ],
    },
    {
      id: "securite",
      icon: Shield,
      title: "Sécurité & Protection",
      tagline: "Votre sécurité, notre engagement absolu",
      img: IMG_SICHERHEIT,
      color: "from-red-900 to-red-800",
      desc: "SwizKote Bank déploie les technologies de sécurité les plus avancées pour protéger vos avoirs et vos données personnelles contre toute menace.",
      features: [
        "Authentification forte (2FA) obligatoire",
        "Chiffrement AES-256 de bout en bout",
        "Surveillance des transactions 24/7",
        "Blocage instantané de carte depuis l'app",
        "Assurance contre la fraude en ligne",
        "Centre SOC dédié",
      ],
      conditions: [
        ["Chiffrement",       "AES-256 transit et stockage"],
        ["Authentification",  "2FA / OTP obligatoire"],
        ["Surveillance",      "24h/24, 7j/7"],
        ["Couverture fraude", "Jusqu'à CHF 50 000/an"],
        ["Certification",     "ISO 27001"],
        ["Disponibilité",     "99,99% (SLA)"],
      ],
    },
  ],
  en: [
    {
      id: "current-account",
      icon: Wallet,
      title: "Current Account",
      tagline: "Your daily account without limits",
      img: IMG_GIROKONTO,
      color: "from-blue-900 to-blue-800",
      desc: "Our current account offers seamless financial management with 24/7 access via our mobile app and online platform. No account maintenance fees with a balance over CHF 1,000.",
      features: [
        "Visa debit card included",
        "Instant SEPA transfers",
        "Real-time notifications",
        "Mobile app for iOS & Android",
        "Priority customer service",
        "Free electronic statements",
      ],
      conditions: [
        ["Minimum balance",          "CHF 0"],
        ["Account maintenance fee",  "CHF 12/month (waived if > CHF 1,000)"],
        ["Debit card",               "Included"],
        ["SEPA transfers",           "Free"],
        ["International transfers",  "CHF 15 per transaction"],
        ["ATM Switzerland",          "Free up to 5x/month"],
      ],
    },
    {
      id: "savings-account",
      icon: PiggyBank,
      title: "Savings Account",
      tagline: "Grow your wealth safely",
      img: IMG_SPARKONTO,
      color: "from-green-900 to-green-800",
      desc: "Our interest-bearing savings account allows you to grow your capital with competitive, guaranteed interest rates protected by the Swiss deposit guarantee up to CHF 100,000.",
      features: [
        "Attractive interest rate up to 1.8% p.a.",
        "No risk — capital guaranteed",
        "esisuisse protection CHF 100,000",
        "Automatic monthly transfer from current account",
        "Customizable savings goals",
        "Interest credited monthly",
      ],
      conditions: [
        ["Interest rate",          "1.20% – 1.80% p.a. depending on balance"],
        ["Minimum deposit",        "CHF 100"],
        ["Guaranteed limit",       "CHF 100,000 (esisuisse)"],
        ["Withdrawals",            "Free (D+1)"],
        ["Fees",                   "None"],
        ["Interest",               "Credited monthly"],
      ],
    },
    {
      id: "premium-cards",
      icon: CreditCard,
      title: "Premium Cards",
      tagline: "Visa Infinite & Mastercard Gold — Prestige at your fingertips",
      img: IMG_KARTEN,
      color: "from-yellow-900 to-amber-800",
      desc: "Our premium cards offer an exceptional payment experience with exclusive benefits, comprehensive travel insurance and a 24/7 concierge service.",
      features: [
        "Visa Infinite with all-risk travel insurance",
        "Mastercard Gold with 1% cashback",
        "Private concierge 24/7",
        "VIP lounge access at 1,200 airports",
        "Purchase protection and extended warranty",
        "Contactless NFC payment",
      ],
      conditions: [
        ["Visa Infinite",          "CHF 450/year"],
        ["Mastercard Gold",        "CHF 150/year"],
        ["Monthly limit",          "Up to CHF 50,000"],
        ["Worldwide ATM withdrawal","Unlimited (third-party fees apply)"],
        ["Travel insurance",       "Included (up to CHF 500,000)"],
        ["Mastercard cashback",    "1% on all purchases"],
      ],
    },
    {
      id: "loans",
      icon: Home,
      title: "Loans & Mortgages",
      tagline: "Personal and business financing",
      img: IMG_KREDITE,
      color: "from-purple-900 to-purple-800",
      desc: "SwizKote Bank finances your life and business projects with flexible loan solutions, competitive interest rates and a quick response within 48 hours.",
      businessLoans: BUSINESS_LOANS.en,
      personalLoans: PERSONAL_LOANS.en,
      features: [
        "Business financing: investment, operating, commercial real estate and startup loans",
        "Personal financing: mortgages, consumer, car, renovation and education loans",
        "Lombard loan on securities portfolio",
        "Preliminary decision within 48h",
        "No early repayment penalty (after 5 years)",
        "Flexible terms and repayment options",
      ],
      conditions: [
        ["Business financing",          "2.2% – 7% p.a."],
        ["Personal financing",          "1.5% – 5.9% p.a."],
        ["Max term business",           "15 years"],
        ["Max term personal",           "30 years"],
        ["Max amount business",         "CHF 10,000,000"],
        ["Max amount personal",         "CHF 2,000,000"],
        ["Response time",               "Preliminary decision within 48h"],
      ],
    },
    {
      id: "wealth-management",
      icon: TrendingUp,
      title: "Wealth Management",
      tagline: "Your wealth in the best hands",
      img: IMG_VERMOEGEN,
      color: "from-slate-900 to-slate-800",
      desc: "Our team of CFA-certified wealth managers manages your assets with a personalized approach combining capital preservation, diversification and tax optimization.",
      features: [
        "Personal wealth manager",
        "Tailored investment strategy",
        "Globally diversified portfolio",
        "Monthly detailed reporting",
        "Tax and succession optimization",
        "Access to primary markets (IPO)",
      ],
      conditions: [
        ["Minimum assets",     "CHF 500,000"],
        ["Management fee",     "0.80% – 1.20% p.a. depending on assets"],
        ["Performance fee",    "10% above benchmark"],
        ["Reporting",          "Monthly and quarterly"],
        ["Review meeting",     "At least semi-annually"],
        ["Languages",          "German, French, English"],
      ],
    },
    {
      id: "security",
      icon: Shield,
      title: "Security & Protection",
      tagline: "Your security — our absolute commitment",
      img: IMG_SICHERHEIT,
      color: "from-red-900 to-red-800",
      desc: "SwizKote Bank deploys the most advanced security technologies to protect your assets and personal data from any threat.",
      features: [
        "Strong authentication (2FA) mandatory",
        "End-to-end AES-256 encryption",
        "24/7 transaction monitoring",
        "Instant card blocking via app",
        "Online fraud insurance",
        "Dedicated SOC security center",
      ],
      conditions: [
        ["Encryption",         "AES-256 (transit & storage)"],
        ["Authentication",     "2FA / OTP mandatory"],
        ["Monitoring",         "24/7, 7 days a week"],
        ["Fraud coverage",     "Up to CHF 50,000/year"],
        ["Certification",      "ISO 27001"],
        ["Availability",       "99.99% (SLA)"],
      ],
    },
  ],
  it: [
    {
      id: "conto-corrente",
      icon: Wallet,
      title: "Conto Corrente",
      tagline: "Il tuo conto quotidiano senza limiti",
      img: IMG_GIROKONTO,
      color: "from-blue-900 to-blue-800",
      desc: "Il nostro conto corrente offre una gestione finanziaria fluida con accesso 24/7 tramite la nostra app mobile e piattaforma online. Nessuna commissione di gestione con saldo superiore a CHF 1.000.",
      features: [
        "Carta di debito Visa inclusa",
        "Bonifici SEPA istantanei",
        "Notifiche in tempo reale",
        "App mobile per iOS e Android",
        "Servizio clienti prioritario",
        "Estratti conto elettronici gratuiti",
      ],
      conditions: [
        ["Saldo minimo",               "CHF 0"],
        ["Commissione di gestione",    "CHF 12/mese (gratis se > CHF 1.000)"],
        ["Carta di debito",            "Inclusa"],
        ["Bonifici SEPA",              "Gratuiti"],
        ["Bonifici internazionali",    "CHF 15 per operazione"],
        ["Prelievi ATM Svizzera",      "Gratuiti fino a 5×/mese"],
      ],
    },
    {
      id: "conto-risparmio",
      icon: PiggyBank,
      title: "Conto Risparmio",
      tagline: "Fai crescere il tuo patrimonio in sicurezza",
      img: IMG_SPARKONTO,
      color: "from-green-900 to-green-800",
      desc: "Il nostro conto risparmio remunerato ti consente di far crescere il tuo capitale con tassi competitivi, garantiti e protetti dalla garanzia dei depositi svizzera fino a CHF 100.000.",
      features: [
        "Tasso d'interesse fino all'1,8% annuo",
        "Nessun rischio — capitale garantito",
        "Protezione esisuisse CHF 100.000",
        "Bonifico automatico mensile dal conto corrente",
        "Obiettivi di risparmio personalizzabili",
        "Interessi accreditati mensilmente",
      ],
      conditions: [
        ["Tasso d'interesse",    "1,20% – 1,80% annuo in base al saldo"],
        ["Deposito minimo",      "CHF 100"],
        ["Limite garantito",     "CHF 100.000 (esisuisse)"],
        ["Prelievi",             "Liberi (D+1)"],
        ["Commissioni",          "Nessuna"],
        ["Interessi",            "Accreditati mensilmente"],
      ],
    },
    {
      id: "carte-premium",
      icon: CreditCard,
      title: "Carte Premium",
      tagline: "Visa Infinite & Mastercard Gold — Il prestigio a portata di mano",
      img: IMG_KARTEN,
      color: "from-yellow-900 to-amber-800",
      desc: "Le nostre carte premium offrono un'esperienza di pagamento eccezionale con vantaggi esclusivi, assicurazione di viaggio completa e servizio di concierge 24/7.",
      features: [
        "Visa Infinite con assicurazione di viaggio tutti i rischi",
        "Mastercard Gold con cashback 1%",
        "Concierge privato 24/7",
        "Accesso alle lounge VIP in 1.200 aeroporti",
        "Protezione acquisti e garanzia estesa",
        "Pagamento contactless NFC",
      ],
      conditions: [
        ["Visa Infinite",          "CHF 450/anno"],
        ["Mastercard Gold",        "CHF 150/anno"],
        ["Limite mensile",         "Fino a CHF 50.000"],
        ["Prelievi ATM mondiali",  "Illimitati (commissioni di terzi)"],
        ["Assicurazione viaggio",  "Inclusa (fino a CHF 500.000)"],
        ["Cashback Mastercard",    "1% su tutti gli acquisti"],
      ],
    },
    {
      id: "prestiti",
      icon: Home,
      title: "Prestiti & Mutui",
      tagline: "Finanziamenti personali e aziendali",
      img: IMG_KREDITE,
      color: "from-purple-900 to-purple-800",
      desc: "SwizKote Bank finanzia i tuoi progetti di vita e aziendali con soluzioni di credito flessibili, tassi competitivi e una risposta rapida entro 48 ore.",
      businessLoans: BUSINESS_LOANS.it,
      personalLoans: PERSONAL_LOANS.it,
      features: [
        "Finanziamento aziendale: crediti d'investimento, d'esercizio, immobili commerciali e startup",
        "Finanziamento personale: mutui, prestiti personali, auto, ristrutturazione e formazione",
        "Credito Lombard su portafoglio titoli",
        "Decisione di principio entro 48h",
        "Nessuna penale di rimborso anticipato (dopo 5 anni)",
        "Durata e opzioni di rimborso flessibili",
      ],
      conditions: [
        ["Finanziamento aziendale",    "2,2% – 7% annuo"],
        ["Finanziamento personale",    "1,5% – 5,9% annuo"],
        ["Durata max aziendale",       "15 anni"],
        ["Durata max personale",       "30 anni"],
        ["Importo max aziendale",      "CHF 10.000.000"],
        ["Importo max personale",      "CHF 2.000.000"],
        ["Tempo di risposta",          "Decisione di principio entro 48h"],
      ],
    },
    {
      id: "gestione-patrimonio",
      icon: TrendingUp,
      title: "Gestione Patrimonio",
      tagline: "Il tuo patrimonio nelle migliori mani",
      img: IMG_VERMOEGEN,
      color: "from-slate-900 to-slate-800",
      desc: "Il nostro team di gestori patrimoniali certificati CFA gestisce il tuo patrimonio con un approccio personalizzato che combina conservazione del capitale, diversificazione e ottimizzazione fiscale.",
      features: [
        "Consulente patrimoniale personale",
        "Strategia d'investimento personalizzata",
        "Portafoglio globalmente diversificato",
        "Reporting mensile dettagliato",
        "Ottimizzazione fiscale e successoria",
        "Accesso ai mercati primari (IPO)",
      ],
      conditions: [
        ["Patrimonio minimo",    "CHF 500.000"],
        ["Commissione gestione", "0,80% – 1,20% annuo in base al patrimonio"],
        ["Performance fee",      "10% sopra il benchmark"],
        ["Reporting",            "Mensile e trimestrale"],
        ["Incontro di bilancio", "Almeno semestrale"],
        ["Lingue",               "Tedesco, Francese, Inglese"],
      ],
    },
    {
      id: "sicurezza",
      icon: Shield,
      title: "Sicurezza & Protezione",
      tagline: "La tua sicurezza — il nostro impegno assoluto",
      img: IMG_SICHERHEIT,
      color: "from-red-900 to-red-800",
      desc: "SwizKote Bank implementa le tecnologie di sicurezza più avanzate per proteggere il tuo patrimonio e i tuoi dati personali da qualsiasi minaccia.",
      features: [
        "Autenticazione forte (2FA) obbligatoria",
        "Crittografia end-to-end AES-256",
        "Monitoraggio transazioni 24/7",
        "Blocco istantaneo della carta tramite app",
        "Assicurazione contro frodi online",
        "Centro di sicurezza SOC dedicato",
      ],
      conditions: [
        ["Crittografia",         "AES-256 (transito e archiviazione)"],
        ["Autenticazione",       "2FA / OTP obbligatoria"],
        ["Monitoraggio",         "24/7, 7 giorni su 7"],
        ["Copertura frodi",      "Fino a CHF 50.000/anno"],
        ["Certificazione",       "ISO 27001"],
        ["Disponibilità",        "99,99% (SLA)"],
      ],
    },
  ],
};

// ─── Complete bidirectional ID mapping (without duplicates) ───────────────────
// Canonical service groups: maps any service ID to a canonical index (0-5)
const SERVICE_CANONICAL: Record<string, number> = {
  // de
  "girokonto": 0, "sparkonto": 1, "premium-karten": 2, "kredite": 3, "vermoegensverwaltung": 4, "sicherheit": 5,
  // fr
  "compte-courant": 0, "epargne": 1, "cartes": 2, "credits": 3, "gestion-fortune": 4, "securite": 5,
  // en
  "current-account": 0, "savings-account": 1, "premium-cards": 2, "loans": 3, "wealth-management": 4, "security": 5,
  // it
  "conto-corrente": 0, "conto-risparmio": 1, "carte-premium": 2, "prestiti": 3, "gestione-patrimonio": 4, "sicurezza": 5,
};

const ID_MAP: Record<string, string> = {
  "girokonto": "compte-courant",
  "sparkonto": "epargne",
  "premium-karten": "cartes",
  "kredite": "credits",
  "vermoegensverwaltung": "gestion-fortune",
  "sicherheit": "securite",
  "compte-courant": "girokonto",
  "epargne": "sparkonto",
  "cartes": "premium-karten",
  "credits": "kredite",
  "gestion-fortune": "vermoegensverwaltung",
  "securite": "sicherheit",
  "current-account": "girokonto",
  "savings-account": "sparkonto",
  "premium-cards": "premium-karten",
  "loans": "kredite",
  "wealth-management": "vermoegensverwaltung",
  "security": "sicherheit",
  "conto-corrente": "girokonto",
  "conto-risparmio": "sparkonto",
  "carte-premium": "premium-karten",
  "prestiti": "kredite",
  "gestione-patrimonio": "vermoegensverwaltung",
  "sicurezza": "sicherheit",
};

// Helper function to get the correct service ID for current language
function getLocalizedServiceId(serviceId: string, targetLang: string): string {
  const targetServices = SERVICES[targetLang as keyof typeof SERVICES];
  // If the serviceId already exists in the target language, use it directly
  if (targetServices?.some(s => s.id === serviceId)) {
    return serviceId;
  }
  // Use canonical index to find the equivalent service in the target language
  const canonicalIdx = SERVICE_CANONICAL[serviceId];
  if (canonicalIdx !== undefined && targetServices?.[canonicalIdx]) {
    return targetServices[canonicalIdx].id;
  }
  // Fallback to ID_MAP
  const mapped = ID_MAP[serviceId];
  if (mapped && targetServices?.some(s => s.id === mapped)) {
    return mapped;
  }
  return serviceId;
}

// ─── Service detail page ──────────────────────────────────────────────────────
function ServiceDetail({ serviceId }: { serviceId: string }) {
  const { lang } = useI18n();
  const [, setLocation] = useLocation();

  const safeKey = (lang === "fr" || lang === "de" || lang === "en" || lang === "it") ? lang : "fr";
  const services = SERVICES[safeKey];

  // Resolve the correct service for the current language using canonical index
  const localizedId = getLocalizedServiceId(serviceId, safeKey);

  // Update URL to reflect the current language's service ID (without causing a loop)
  useEffect(() => {
    if (localizedId !== serviceId) {
      setLocation(`/services/${localizedId}`, { replace: true });
    }
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  // Find service: try localizedId first, then serviceId, then canonical fallback
  let service = services.find(s => s.id === localizedId) || services.find(s => s.id === serviceId);
  if (!service) {
    const canonicalIdx = SERVICE_CANONICAL[serviceId] ?? SERVICE_CANONICAL[localizedId];
    if (canonicalIdx !== undefined) service = services[canonicalIdx];
  }

  const isLoanService = !!(service && (service as any).businessLoans);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [serviceId]);

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-4">
            {lang === "de" ? "Dienst nicht gefunden." : 
             lang === "en" ? "Service not found." : 
             lang === "it" ? "Servizio non trovato." : 
             "Service introuvable."}
          </p>
          <Link href="/#services">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {lang === "de" ? "Zurück zur Startseite" : 
               lang === "en" ? "Back to home" : 
               lang === "it" ? "Torna alla home" : 
               "Retour à l'accueil"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = service.icon;
  const svc = service as any;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 h-16">
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Link href="/#services">
                <Button variant="ghost" size="sm" className="gap-1.5 px-2 sm:px-3">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {lang === "de" ? "Startseite" : 
                     lang === "en" ? "Home" : 
                     lang === "it" ? "Home" : 
                     "Accueil"}
                  </span>
                </Button>
              </Link>
              <div className="flex items-center gap-1.5 flex-shrink-0" style={{ whiteSpace: "nowrap" }}>
                <img src={logoImg} alt="SWIZKOTE" className="w-6 h-6 object-contain flex-shrink-0" />
                <span className="text-base font-bold tracking-tight" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <LangSwitcher />
              <ThemeToggle />
              <Link href="/login">
                <Button size="sm" className="hidden sm:inline-flex text-xs px-3">
                  {lang === "de" ? "Anmelden" : 
                   lang === "en" ? "Login" : 
                   lang === "it" ? "Accedi" : 
                   "Connexion"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className={`relative bg-gradient-to-br ${service.color} overflow-hidden`}>
        <img src={service.img} alt={service.title} className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center backdrop-blur-sm">
              <Icon className="w-7 h-7 text-gold" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 max-w-3xl">{service.title}</h1>
          <p className="text-[hsl(220,20%,75%)] text-lg md:text-xl max-w-2xl leading-relaxed">{service.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login">
              <Button className="gold-gradient text-[hsl(222,40%,10%)] font-semibold gap-2">
                {lang === "de" ? "Konto eröffnen" : 
                 lang === "en" ? "Open account" : 
                 lang === "it" ? "Apri conto" : 
                 "Ouvrir un compte"} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#details">
              <Button variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20">
                {lang === "de" ? "Details entdecken" : 
                 lang === "en" ? "Discover details" : 
                 lang === "it" ? "Scopri i dettagli" : 
                 "Découvrir les détails"}
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="details" className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {lang === "de" ? "Über diesen Service" : 
                   lang === "en" ? "About this service" : 
                   lang === "it" ? "Informazioni su questo servizio" : 
                   "À propos de ce service"}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{service.desc}</p>
              </div>
              <div className="rounded-2xl overflow-hidden border">
                <img src={service.img} alt={service.title} className="w-full h-64 md:h-80 object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-6">
                  {lang === "de" ? <><span className="text-gold">Enthaltene</span> Funktionen</> :
                   lang === "en" ? <><span className="text-gold">Included</span> features</> :
                   lang === "it" ? <><span className="text-gold">Funzionalità</span> incluse</> :
                   <>Fonctionnalités <span className="text-gold">incluses</span></>}
                </h2>
                {isLoanService && svc.businessLoans && svc.personalLoans ? (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gold" />
                        </div>
                        <h3 className="text-lg font-semibold">
                          {lang === "de" ? "Unternehmensfinanzierung" : 
                           lang === "en" ? "Business financing" : 
                           lang === "it" ? "Finanziamento aziendale" : 
                           "Financement entreprise"}
                        </h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {svc.businessLoans.map((loan: any, i: number) => {
                          const LoanIcon = loan.icon;
                          return (
                            <div key={i} className="p-3 rounded-xl border bg-card hover:border-gold/40 transition-all group">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                                  <LoanIcon className="w-4 h-4 text-gold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm mb-0.5">{loan.name}</h4>
                                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{loan.desc}</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">{loan.rate}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {lang === "de" ? "bis" : lang === "en" ? "up to" : lang === "it" ? "fino a" : "jusqu'à"} {loan.max}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-gold" />
                        </div>
                        <h3 className="text-lg font-semibold">
                          {lang === "de" ? "Privatfinanzierung" : 
                           lang === "en" ? "Personal financing" : 
                           lang === "it" ? "Finanziamento personale" : 
                           "Financement particulier"}
                        </h3>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {svc.personalLoans.map((loan: any, i: number) => {
                          const LoanIcon = loan.icon;
                          return (
                            <div key={i} className="p-3 rounded-xl border bg-card hover:border-gold/40 transition-all group">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                                  <LoanIcon className="w-4 h-4 text-gold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm mb-0.5">{loan.name}</h4>
                                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{loan.desc}</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">{loan.rate}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {lang === "de" ? "bis" : lang === "en" ? "up to" : lang === "it" ? "fino a" : "jusqu'à"} {loan.max}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {service.features.map((f: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl border bg-card hover:border-gold/30 transition-colors">
                        <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-2xl border bg-card sticky top-24">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gold" />
                  {lang === "de" ? "Konditionen & Tarife" : 
                   lang === "en" ? "Conditions & Fees" : 
                   lang === "it" ? "Condizioni & Tariffe" : 
                   "Conditions & Tarifs"}
                </h3>
                <div className="space-y-0 divide-y divide-border">
                  {service.conditions.map((condition: string[], i: number) => (
                    <div key={i} className="flex justify-between items-start gap-3 py-3">
                      <span className="text-sm text-muted-foreground flex-1">{condition[0]}</span>
                      <span className="text-sm font-medium text-right flex-1">{condition[1]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t space-y-3">
                  <Link href="/login">
                    <Button className="w-full gold-gradient text-[hsl(222,40%,10%)] font-semibold gap-2">
                      {lang === "de" ? "Konto eröffnen" : 
                       lang === "en" ? "Open account" : 
                       lang === "it" ? "Apri conto" : 
                       "Ouvrir un compte"} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/#contact">
                    <Button variant="outline" className="w-full gap-2">
                      {lang === "de" ? "Berater kontaktieren" : 
                       lang === "en" ? "Contact advisor" : 
                       lang === "it" ? "Contatta consulente" : 
                       "Contacter un conseiller"}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="p-5 rounded-2xl border bg-card/50">
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  {lang === "de" ? "Weitere Dienstleistungen" : 
                   lang === "en" ? "Other services" : 
                   lang === "it" ? "Altri servizi" : 
                   "Autres services"}
                </h4>
                <div className="space-y-2">
                  {services.filter(s => s.id !== service.id).slice(0, 4).map(s => {
                    const SIcon = s.icon;
                    return (
                      <Link key={s.id} href={`/services/${s.id}`}>
                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                            <SIcon className="w-4 h-4 text-gold" />
                          </div>
                          <span className="text-sm font-medium group-hover:text-gold transition-colors">{s.title}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card/50 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5" style={{ whiteSpace: "nowrap" }}>
            <img src={logoImg} alt="SWIZKOTE" className="w-5 h-5 object-contain flex-shrink-0" />
            <span className="font-medium" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</span>
          </div>
          <p>
            {lang === "de" ? "© 2024 SWIZKOTE AG — Alle Rechte vorbehalten" : 
             lang === "en" ? "© 2024 SWIZKOTE SA — All rights reserved" : 
             lang === "it" ? "© 2024 SWIZKOTE SA — Tutti i diritti riservati" : 
             "© 2024 SWIZKOTE SA — Tous droits réservés"}
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gold transition-colors">
              {lang === "de" ? "AGB" : lang === "en" ? "Terms" : lang === "it" ? "Termini" : "CGU"}
            </Link>
            <Link href="/privacy" className="hover:text-gold transition-colors">
              {lang === "de" ? "Datenschutz" : lang === "en" ? "Privacy" : lang === "it" ? "Privacy" : "Confidentialité"}
            </Link>
            <Link href="/legal" className="hover:text-gold transition-colors">
              {lang === "de" ? "Impressum" : lang === "en" ? "Legal" : lang === "it" ? "Note legali" : "Mentions légales"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const params = useParams<{ id?: string }>();
  const { lang } = useI18n();

  if (params.id) return <ServiceDetail serviceId={params.id} />;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Link href="/#services">
        <Button className="gold-gradient text-[hsl(222,40%,10%)] font-semibold gap-2">
          <ArrowLeft className="w-4 h-4" />
          {lang === "de" ? "Zurück zur Startseite" : 
           lang === "en" ? "Back to home" : 
           lang === "it" ? "Torna alla home" : 
           "Retour à l'accueil"}
        </Button>
      </Link>
    </div>
  );
}