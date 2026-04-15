import { useState, useEffect, useRef, SetStateAction } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/lib/i18n";
import { LangSwitcher } from "@/components/lang-switcher";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, Globe, CreditCard, TrendingUp, Building2, ArrowRight, ChevronRight,
  Sun, Moon, Landmark, FileCheck, Users, Phone, Mail, MapPin, Clock,
  Shield, Wallet, BarChart3, Send, PiggyBank, Home, Briefcase, Award,
  Sparkles, Zap, Smartphone, Headphones, Laptop, LineChart, PieChart,
  Database, CheckCircle2, Star, Heart, Fingerprint, Timer, RefreshCw,
  Gift, Coffee, Plane, Car, Wifi, BatteryCharging, Settings, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
const logoImg = "/logo.png";

// Free stock images from Unsplash for all sections (royalty-free, no watermark)
const HERO_IMG = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&q=80";
const ADVISOR_IMG = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=1080&fit=crop&q=80";
const SWISS_LANDSCAPE_IMG = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80";
const SECURITY_IMG = "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1920&h=1080&fit=crop&q=80";
const MOBILE_BANKING_IMG = "https://images.unsplash.com/photo-1616077168712-fc6c788db4af?w=800&h=600&fit=crop&q=80";
const DIGITAL_WORKSPACE_IMG = "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&h=600&fit=crop&q=80";
const ZURICH_SKYLINE_IMG = "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&h=1080&fit=crop&q=80";
const BANKING_INTERIOR_IMG = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop&q=80";
const WEALTH_MANAGEMENT_IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&q=80";

// Royalty-free service images (Unsplash only - no watermark) — synced with services.tsx
const GIROKONTO_IMG          = "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&q=80";
const SPARKONTO_IMG          = "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=600&fit=crop&q=80";
const PREMIUM_KARTEN_IMG     = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80";
const KREDITE_IMG            = "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80";
const VERMOEGENSVERWALTUNG_IMG = "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&q=80";
const SICHERHEIT_IMG         = "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&fit=crop&q=80";

// Service images array for easy access
const SERVICE_IMAGES = [
  GIROKONTO_IMG,
  SPARKONTO_IMG,
  PREMIUM_KARTEN_IMG,
  KREDITE_IMG,
  VERMOEGENSVERWALTUNG_IMG,
  SICHERHEIT_IMG,
];

// Testimonial profile images
const TESTIMONIAL_IMAGES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",   // Dr. Markus Weber — homme
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop",   // Claudia Meier — femme
  "https://www.sog.unc.edu/sites/default/files/styles/large/public/profiles/Thomas_Eric_292_2023_web.jpg?w=150&h=150&fit=crop",       // Thomas Schmid — homme (nouveau)
  "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop",       // Sabine Keller — femme (nouveau)
];

// Feature section images
const FEATURE_IMAGES = [
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle-landing">
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

function formatCHF(amount: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", minimumFractionDigits: 0 }).format(amount);
}

// Fade In Animation Component
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Scroll Animation Hook
function useScrollAnimation() {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;
        if (isVisible) {
          el.classList.add('animated');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Smooth scroll helper
const scrollToElement = (elementId: string) => {
  const element = document.querySelector(elementId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// ── Hero Simulator with 30 years max duration (FULLY TRANSLATED) ──
function HeroCalculator() {
  const { t, lang } = useI18n();

  // Two main modes
  type SimMode = "business" | "personal";
  const [mode, setMode] = useState<SimMode>("personal");

  // Personal sub-type
  type PersonalType = "mortgage" | "consumer";
  const [personalType, setPersonalType] = useState<PersonalType>("mortgage");

  // Business sub-type
  type BusinessType = "investment" | "operating" | "real_estate";
  const [businessType, setBusinessType] = useState<BusinessType>("investment");

  const [amount, setAmount] = useState(500000);
  const [duration, setDuration] = useState(25);

  const handleModeChange = (m: SimMode) => {
    setMode(m);
    if (m === "personal") { setAmount(500000); setDuration(25); setPersonalType("mortgage"); }
    else { setAmount(200000); setDuration(7); setBusinessType("investment"); }
  };

  const handlePersonalTypeChange = (pt: PersonalType) => {
    setPersonalType(pt);
    if (pt === "mortgage") { setAmount(500000); setDuration(25); }
    else { setAmount(20000); setDuration(5); }
  };

  const handleBusinessTypeChange = (bt: BusinessType) => {
    setBusinessType(bt);
    if (bt === "investment") { setAmount(200000); setDuration(7); }
    else if (bt === "operating") { setAmount(100000); setDuration(3); }
    else { setAmount(1000000); setDuration(20); }
  };

  // Compute rate and limits based on type
  let rate: number;
  let minAmount: number, maxAmount: number, stepAmount: number;
  let minDuration: number, maxDuration: number;

  if (mode === "personal") {
    if (personalType === "mortgage") {
      rate = 1.5; minAmount = 100000; maxAmount = 2000000; stepAmount = 10000;
      minDuration = 5; maxDuration = 30;
    } else {
      rate = 4.9; minAmount = 1000; maxAmount = 250000; stepAmount = 1000;
      minDuration = 1; maxDuration = 30;
    }
  } else {
    if (businessType === "investment") {
      rate = 3.2; minAmount = 50000; maxAmount = 5000000; stepAmount = 10000;
      minDuration = 1; maxDuration = 30;
    } else if (businessType === "operating") {
      rate = 4.5; minAmount = 10000; maxAmount = 2000000; stepAmount = 5000;
      minDuration = 1; maxDuration = 30;
    } else {
      rate = 2.2; minAmount = 500000; maxAmount = 10000000; stepAmount = 50000;
      minDuration = 5; maxDuration = 30;
    }
  }

  const adjustedAmount = Math.max(minAmount, Math.min(maxAmount, amount));
  const adjustedDuration = Math.max(minDuration, Math.min(maxDuration, duration));
  const monthlyRate = rate / 100 / 12;
  const totalMonths = adjustedDuration * 12;
  const monthlyPayment =
    (adjustedAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalInterest = monthlyPayment * totalMonths - adjustedAmount;

  // Traductions complètes
  const personalLabel = t("land_calc_personal_label");
  const businessLabel = t("land_calc_business_label");

  const personalTypes = [
    { key: "mortgage" as PersonalType, label: t("land_calc_mortgage_label") },
    { key: "consumer" as PersonalType, label: t("land_calc_consumer_label") },
  ];

  const businessTypes = [
    { key: "investment" as BusinessType, label: t("land_calc_investment_label") },
    { key: "operating" as BusinessType, label: t("land_calc_operating_label") },
    { key: "real_estate" as BusinessType, label: t("land_calc_real_estate_label") },
  ];

  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-6 space-y-4 animate-on-scroll" data-testid="hero-calculator">
      <div className="mb-1">
        <span className="text-sm font-semibold text-white tracking-wide">{t("land_calc_title")}</span>
      </div>

      {/* Mode tabs: Personal vs Business */}
      <div className="flex border-b border-white/[0.08]">
        <button
          onClick={() => handleModeChange("personal")}
          className={`flex-1 pb-2.5 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center justify-center gap-1.5 ${mode === "personal" ? "border-[hsl(42,80%,55%)] text-white" : "border-transparent text-white/40 hover:text-white/60"}`}
          data-testid="calc-tab-personal"
        >
          <Users className="w-3 h-3" />{personalLabel}
        </button>
        <button
          onClick={() => handleModeChange("business")}
          className={`flex-1 pb-2.5 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center justify-center gap-1.5 ${mode === "business" ? "border-[hsl(42,80%,55%)] text-white" : "border-transparent text-white/40 hover:text-white/60"}`}
          data-testid="calc-tab-business"
        >
          <Briefcase className="w-3 h-3" />{businessLabel}
        </button>
      </div>

      {/* Sub-type selector */}
      <div className="flex gap-2 flex-wrap">
        {mode === "personal"
          ? personalTypes.map(pt => (
            <button
              key={pt.key}
              onClick={() => handlePersonalTypeChange(pt.key)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${personalType === pt.key ? "bg-[hsl(42,80%,55%,0.2)] text-gold border border-gold/30" : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"}`}
            >
              {pt.label}
            </button>
          ))
          : businessTypes.map(bt => (
            <button
              key={bt.key}
              onClick={() => handleBusinessTypeChange(bt.key)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${businessType === bt.key ? "bg-[hsl(42,80%,55%,0.2)] text-gold border border-gold/30" : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"}`}
            >
              {bt.label}
            </button>
          ))
        }
      </div>

      {/* Amount slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-white/50">{t("land_calc_amount")}</span>
          <span className="text-xs font-semibold text-gold" data-testid="hero-calc-amount">{formatCHF(adjustedAmount)}</span>
        </div>
        <Slider
          value={[adjustedAmount]}
          onValueChange={(v: SetStateAction<number>[]) => setAmount(v[0])}
          min={minAmount} max={maxAmount} step={stepAmount}
          className="[&_[role=slider]]:bg-[hsl(42,80%,55%)] [&_[role=slider]]:border-[hsl(42,80%,55%)] [&_.relative>div]:bg-[hsl(42,80%,55%)]"
          data-testid="hero-calc-slider-amount"
        />
      </div>

      {/* Duration slider - max 30 years */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-white/50">{t("land_calc_duration")}</span>
          <span className="text-xs font-semibold text-white/90" data-testid="hero-calc-duration">{adjustedDuration} {t("land_calc_years")}</span>
        </div>
        <Slider
          value={[adjustedDuration]}
          onValueChange={(v: SetStateAction<number>[]) => setDuration(v[0])}
          min={minDuration} max={30} step={1}
          className="[&_[role=slider]]:bg-[hsl(42,80%,55%)] [&_[role=slider]]:border-[hsl(42,80%,55%)] [&_.relative>div]:bg-[hsl(42,80%,55%)]"
          data-testid="hero-calc-slider-duration"
        />
      </div>

      {/* Rate */}
      <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-md border border-white/[0.06] bg-white/[0.03]">
        <span className="text-xs text-white/50">{t("land_calc_rate")}</span>
        <span className="text-xs font-bold text-gold">{rate}%</span>
      </div>

      {/* Results */}
      <div className="pt-2 pb-1 border-t border-white/[0.06] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-white/60">{t("land_calc_monthly")}</span>
          <span className="text-xl font-bold text-gold" data-testid="hero-calc-monthly">{formatCHF(Math.round(monthlyPayment))}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-white/40">{t("land_calc_interest")}</span>
          <span className="text-xs text-white/60" data-testid="hero-calc-interest">{formatCHF(Math.round(totalInterest))}</span>
        </div>
      </div>

      <Link href="/login">
        <Button className="w-full gold-gradient text-[hsl(222,40%,10%)] border-[hsl(42,70%,45%)] font-semibold text-sm" data-testid="hero-calc-cta">
          {t("land_calc_cta")} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </Link>
    </div>
  );
}

// Services section data per language with custom images - COMPLETE 4 LANGUAGES
const SERVICES_DE = [
  { id: "girokonto", icon: Wallet, title: "Girokonto", desc: "Tägliches Konto mit 24/7-Zugang, Debitkarte und kostenlose SEPA-Überweisungen.", img: SERVICE_IMAGES[0], features: ["Kostenlose Debitkarte", "Echtzeit-Benachrichtigungen", "Mobile App"] },
  { id: "sparkonto", icon: PiggyBank, title: "Sparkonto", desc: "Verzinstes Sparkonto bis 1,8% p.a. mit Kapitalgarantie und esisuisse-Schutz.", img: SERVICE_IMAGES[1], features: ["Zins bis 1,8% p.a.", "Kapitalgarantie", "esisuisse-Schutz"] },
  { id: "premium-karten", icon: CreditCard, title: "Premium-Karten", desc: "Visa Infinite & Mastercard Gold mit Reiseversicherung und Concierge-Service.", img: SERVICE_IMAGES[2], features: ["Reiseversicherung", "Concierge 24/7", "Cashback"] },
  { id: "kredite", icon: Home, title: "Kredite & Darlehen", desc: "Privat-und firmenfinanzierung mit Antwort in 48h.", img: SERVICE_IMAGES[3], features: ["Hypothek ab 1,5%", "Privatkredit bis CHF 250k", "Entscheid in 48h"] },
  { id: "vermoegensverwaltung", icon: TrendingUp, title: "Vermögensverwaltung", desc: "CFA-zertifizierte Berater für Ihre massgeschneiderte Vermögensstrategie.", img: SERVICE_IMAGES[4], features: ["Persönlicher Berater", "Massgeschneiderte Strategie", "Globales Portfolio"] },
  { id: "sicherheit", icon: Shield, title: "Sicherheit & Schutz", desc: "AES-256-Verschlüsselung, 2FA und 24/7-SOC-Überwachung.", img: SERVICE_IMAGES[5], features: ["AES-256", "2FA Authentifizierung", "24/7 SOC"] },
];

const SERVICES_FR = [
  { id: "compte-courant", icon: Wallet, title: "Compte Courant", desc: "Compte du quotidien avec accès 24/7, carte de débit et virements SEPA gratuits.", img: SERVICE_IMAGES[0], features: ["Carte débit gratuite", "Notifications temps réel", "App mobile"] },
  { id: "epargne", icon: PiggyBank, title: "Compte Épargne", desc: "Compte rémunéré jusqu'à 1,8% p.a. avec capital garanti et protection esisuisse.", img: SERVICE_IMAGES[1], features: ["Intérêt jusqu'à 1,8%", "Capital garanti", "Protection esisuisse"] },
  { id: "cartes", icon: CreditCard, title: "Cartes Bancaires", desc: "Visa Infinite & Mastercard Gold avec assurance voyage et conciergerie.", img: SERVICE_IMAGES[2], features: ["Assurance voyage", "Conciergerie 24/7", "Cashback"] },
  { id: "credits", icon: Home, title: "Crédits & Prêts", desc: "Financement particulier et entreprise avec réponse en 48h.", img: SERVICE_IMAGES[3], features: ["Hypothèque dès 1,5%", "Prêt perso jusqu'à CHF 250k", "Décision en 48h"] },
  { id: "gestion-fortune", icon: TrendingUp, title: "Gestion de Fortune", desc: "Gérants certifiés CFA pour une stratégie patrimoniale personnalisée.", img: SERVICE_IMAGES[4], features: ["Conseiller dédié", "Stratégie personnalisée", "Portefeuille global"] },
  { id: "securite", icon: Shield, title: "Sécurité & Protection", desc: "Chiffrement AES-256, 2FA et surveillance SOC 24h/24.", img: SERVICE_IMAGES[5], features: ["AES-256", "Authentification 2FA", "SOC 24/7"] },
];

const SERVICES_EN = [
  { id: "current-account", icon: Wallet, title: "Current Account", desc: "Daily account with 24/7 access, debit card and free SEPA transfers.", img: SERVICE_IMAGES[0], features: ["Free debit card", "Real-time notifications", "Mobile app"] },
  { id: "savings-account", icon: PiggyBank, title: "Savings Account", desc: "Interest-bearing savings account up to 1.8% p.a. with capital guarantee and esisuisse protection.", img: SERVICE_IMAGES[1], features: ["Interest up to 1.8% p.a.", "Capital guarantee", "esisuisse protection"] },
  { id: "premium-cards", icon: CreditCard, title: "Premium Cards", desc: "Visa Infinite & Mastercard Gold with travel insurance and concierge service.", img: SERVICE_IMAGES[2], features: ["Travel insurance", "24/7 concierge", "Cashback"] },
  { id: "loans", icon: Home, title: "Loans & Mortgages", desc: "Personal and business financing with response within 48 hours.", img: SERVICE_IMAGES[3], features: ["Mortgage from 1.5%", "Personal loan up to CHF 250k", "48h decision"] },
  { id: "wealth-management", icon: TrendingUp, title: "Wealth Management", desc: "CFA-certified advisors for your tailored wealth strategy.", img: SERVICE_IMAGES[4], features: ["Personal advisor", "Tailored strategy", "Global portfolio"] },
  { id: "security", icon: Shield, title: "Security & Protection", desc: "AES-256 encryption, 2FA and 24/7 SOC monitoring.", img: SERVICE_IMAGES[5], features: ["AES-256", "2FA authentication", "24/7 SOC"] },
];

const SERVICES_IT = [
  { id: "conto-corrente", icon: Wallet, title: "Conto Corrente", desc: "Conto quotidiano con accesso 24/7, carta di debito e bonifici SEPA gratuiti.", img: SERVICE_IMAGES[0], features: ["Carta di debito gratuita", "Notifiche in tempo reale", "App mobile"] },
  { id: "conto-risparmio", icon: PiggyBank, title: "Conto Risparmio", desc: "Conto di risparmio remunerato fino all'1,8% annuo con garanzia del capitale e protezione esisuisse.", img: SERVICE_IMAGES[1], features: ["Interesse fino all'1,8%", "Garanzia del capitale", "Protezione esisuisse"] },
  { id: "carte-premium", icon: CreditCard, title: "Carte Premium", desc: "Visa Infinite & Mastercard Gold con assicurazione di viaggio e servizio di concierge.", img: SERVICE_IMAGES[2], features: ["Assicurazione viaggio", "Concierge 24/7", "Cashback"] },
  { id: "prestiti", icon: Home, title: "Prestiti & Mutui", desc: "Finanziamenti personali e aziendali con risposta entro 48 ore.", img: SERVICE_IMAGES[3], features: ["Mutuo dall'1,5%", "Prestito personale fino a CHF 250k", "Decisione in 48h"] },
  { id: "gestione-patrimonio", icon: TrendingUp, title: "Gestione Patrimonio", desc: "Consulenti certificati CFA per la tua strategia patrimoniale personalizzata.", img: SERVICE_IMAGES[4], features: ["Consulente personale", "Strategia personalizzata", "Portafoglio globale"] },
  { id: "sicurezza", icon: Shield, title: "Sicurezza & Protezione", desc: "Crittografia AES-256, 2FA e monitoraggio SOC 24/7.", img: SERVICE_IMAGES[5], features: ["AES-256", "Autenticazione 2FA", "SOC 24/7"] },
];

// Modern features - COMPLETE 4 LANGUAGES
const MODERN_FEATURES_DE = [
  { icon: Smartphone, title: "Mobile Banking der nächsten Generation", desc: "Verwalten Sie Ihre Finanzen jederzeit und überall mit unserer intuitiven App. Biometrische Authentifizierung, Widgets und Echtzeit-Benachrichtigungen.", img: FEATURE_IMAGES[0] },
  { icon: Fingerprint, title: "Biometrische Sicherheit", desc: "Sichere Anmeldung per Fingerabdruck oder Face ID. Keine Passwörter mehr – nur Sie haben Zugriff auf Ihr Vermögen.", img: FEATURE_IMAGES[1] },
  { icon: Timer, title: "Echtzeit-Überweisungen", desc: "Sofortige SEPA-Überweisungen rund um die Uhr. Geldtransfer in Sekundenschnelle – auch am Wochenende und Feiertagen.", img: FEATURE_IMAGES[2] },
  { icon: RefreshCw, title: "Automatisches Sparen", desc: "Intelligente Sparfunktionen, die automatisch kleine Beträge auf Ihr Sparkonto übertragen. Sparen ohne nachzudenken.", img: FEATURE_IMAGES[3] },
  { icon: Headphones, title: "24/7 Premium Support", desc: "Ihr persönlicher Berater ist rund um die Uhr erreichbar. Per Telefon, Chat oder Video-Konferenz – ganz nach Ihren Wünschen.", img: FEATURE_IMAGES[4] },
  { icon: PieChart, title: "KI-gestützte Finanzanalyse", desc: "Erhalten Sie personalisierte Einblicke in Ihre Ausgaben und Sparpotenziale. Künstliche Intelligenz hilft Ihnen, finanziell zu optimieren.", img: FEATURE_IMAGES[5] },
];

const MODERN_FEATURES_FR = [
  { icon: Smartphone, title: "Mobile Banking nouvelle génération", desc: "Gérez vos finances à tout moment avec notre application intuitive. Authentification biométrique, widgets et notifications en temps réel.", img: FEATURE_IMAGES[0] },
  { icon: Fingerprint, title: "Sécurité biométrique", desc: "Connexion sécurisée par empreinte digitale ou Face ID. Plus de mots de passe – seulement vous avez accès à votre patrimoine.", img: FEATURE_IMAGES[1] },
  { icon: Timer, title: "Virements en temps réel", desc: "Virements SEPA instantanés 24h/24. Transfert d'argent en quelques secondes – même le week-end et les jours fériés.", img: FEATURE_IMAGES[2] },
  { icon: RefreshCw, title: "Épargne automatique", desc: "Fonctions d'épargne intelligentes qui transfèrent automatiquement de petits montants vers votre compte épargne.", img: FEATURE_IMAGES[3] },
  { icon: Headphones, title: "Support Premium 24/7", desc: "Votre conseiller personnel est disponible 24h/24. Par téléphone, chat ou visioconférence – selon vos préférences.", img: FEATURE_IMAGES[4] },
  { icon: PieChart, title: "Analyse financière IA", desc: "Obtenez des insights personnalisés sur vos dépenses et potentiels d'épargne. L'IA vous aide à optimiser vos finances.", img: FEATURE_IMAGES[5] },
];

const MODERN_FEATURES_EN = [
  { icon: Smartphone, title: "Next Generation Mobile Banking", desc: "Manage your finances anytime, anywhere with our intuitive app. Biometric authentication, widgets and real-time notifications.", img: FEATURE_IMAGES[0] },
  { icon: Fingerprint, title: "Biometric Security", desc: "Secure login with fingerprint or Face ID. No more passwords – only you have access to your wealth.", img: FEATURE_IMAGES[1] },
  { icon: Timer, title: "Real-time Transfers", desc: "Instant SEPA transfers 24/7. Money transfer in seconds – even on weekends and holidays.", img: FEATURE_IMAGES[2] },
  { icon: RefreshCw, title: "Automatic Savings", desc: "Intelligent savings features that automatically transfer small amounts to your savings account. Save without thinking.", img: FEATURE_IMAGES[3] },
  { icon: Headphones, title: "24/7 Premium Support", desc: "Your personal advisor is available around the clock. By phone, chat or video conference – as you wish.", img: FEATURE_IMAGES[4] },
  { icon: PieChart, title: "AI-powered Financial Analysis", desc: "Get personalized insights into your spending and savings potential. AI helps you optimize your finances.", img: FEATURE_IMAGES[5] },
];

const MODERN_FEATURES_IT = [
  { icon: Smartphone, title: "Mobile Banking di nuova generazione", desc: "Gestisci le tue finanze sempre e ovunque con la nostra app intuitiva. Autenticazione biometrica, widget e notifiche in tempo reale.", img: FEATURE_IMAGES[0] },
  { icon: Fingerprint, title: "Sicurezza biometrica", desc: "Accesso sicuro con impronta digitale o Face ID. Niente più password – solo tu hai accesso al tuo patrimonio.", img: FEATURE_IMAGES[1] },
  { icon: Timer, title: "Bonifici in tempo reale", desc: "Bonifici SEPA istantanei 24/7. Trasferimento di denaro in secondi – anche nei fine settimana e nei giorni festivi.", img: FEATURE_IMAGES[2] },
  { icon: RefreshCw, title: "Risparmio automatico", desc: "Funzioni di risparmio intelligenti che trasferiscono automaticamente piccoli importi sul tuo conto di risparmio.", img: FEATURE_IMAGES[3] },
  { icon: Headphones, title: "Supporto Premium 24/7", desc: "Il tuo consulente personale è disponibile 24 ore su 24. Per telefono, chat o videoconferenza – come preferisci.", img: FEATURE_IMAGES[4] },
  { icon: PieChart, title: "Analisi finanziaria con IA", desc: "Ottieni approfondimenti personalizzati sulle tue spese e potenziale di risparmio. L'IA ti aiuta a ottimizzare le tue finanze.", img: FEATURE_IMAGES[5] },
];

// Awards and recognitions - COMPLETE 4 LANGUAGES
const AWARDS_DE = [
  { name: "Beste Privatbank Schweiz", year: "2024", issuer: "Euromoney", icon: Award },
  { name: "Innovation im Digital Banking", year: "2024", issuer: "Finews", icon: Sparkles },
  { name: "Top Arbeitgeber Finanzsektor", year: "2024", issuer: "Great Place to Work", icon: Users },
  { name: "Beste Kundenzufriedenheit", year: "2024", issuer: "Swiss Banking Report", icon: Heart },
];

const AWARDS_FR = [
  { name: "Meilleure Banque Privée Suisse", year: "2024", issuer: "Euromoney", icon: Award },
  { name: "Innovation en Digital Banking", year: "2024", issuer: "Finews", icon: Sparkles },
  { name: "Top Employeur Secteur Financier", year: "2024", issuer: "Great Place to Work", icon: Users },
  { name: "Meilleure Satisfaction Client", year: "2024", issuer: "Swiss Banking Report", icon: Heart },
];

const AWARDS_EN = [
  { name: "Best Private Bank Switzerland", year: "2024", issuer: "Euromoney", icon: Award },
  { name: "Innovation in Digital Banking", year: "2024", issuer: "Finews", icon: Sparkles },
  { name: "Top Employer Financial Sector", year: "2024", issuer: "Great Place to Work", icon: Users },
  { name: "Best Customer Satisfaction", year: "2024", issuer: "Swiss Banking Report", icon: Heart },
];

const AWARDS_IT = [
  { name: "Miglior Banca Privata Svizzera", year: "2024", issuer: "Euromoney", icon: Award },
  { name: "Innovazione nel Digital Banking", year: "2024", issuer: "Finews", icon: Sparkles },
  { name: "Miglior Datore di Lavoro Settore Finanziario", year: "2024", issuer: "Great Place to Work", icon: Users },
  { name: "Miglior Soddisfazione Clienti", year: "2024", issuer: "Swiss Banking Report", icon: Heart },
];

// Testimonials with images - COMPLETE 4 LANGUAGES
const TESTIMONIALS_DE = [
  { name: "Dr. Markus Weber", role: "Unternehmer", text: "Die digitale Transformation bei SWIZKOTE ist beeindruckend. Von der Kontoeröffnung bis zur Finanzierung – alles reibungslos und professionell.", rating: 5, img: TESTIMONIAL_IMAGES[0] },
  { name: "Claudia Meier", role: "Privatkundin", text: "Die persönliche Beratung und die moderne App machen den Alltag so einfach. Ich bin seit Jahren begeisterte Kundin und kann die Bank wärmstens empfehlen.", rating: 5, img: TESTIMONIAL_IMAGES[1] },
  { name: "Thomas Schmid", role: "Immobilieninvestor", text: "Die Hypothekarkonditionen sind unschlagbar. Schnelle Entscheidungen, faire Zinsen und erstklassiger Service. Absolut empfehlenswert.", rating: 5, img: TESTIMONIAL_IMAGES[2] },
  { name: "Sabine Keller", role: "Finanzberaterin", text: "Als professionelle Anlegerin schätze ich die exzellente Plattform, die transparenten Gebühren und den erstklassigen Support.", rating: 5, img: TESTIMONIAL_IMAGES[3] },
];

const TESTIMONIALS_FR = [
  { name: "Dr. Markus Weber", role: "Entrepreneur", text: "La transformation digitale chez SWIZKOTE est impressionnante. De l'ouverture de compte au financement – tout est fluide et professionnel.", rating: 5, img: TESTIMONIAL_IMAGES[0] },
  { name: "Claudia Meier", role: "Cliente privée", text: "Le conseil personnalisé et l'application moderne simplifient mon quotidien. Cliente fidèle depuis des années, je recommande vivement.", rating: 5, img: TESTIMONIAL_IMAGES[1] },
  { name: "Thomas Schmid", role: "Investisseur immobilier", text: "Les conditions hypothécaires sont imbattables. Décisions rapides, taux équitables et service de premier ordre. Très recommandable.", rating: 5, img: TESTIMONIAL_IMAGES[2] },
  { name: "Sabine Keller", role: "Conseillère financière", text: "En tant qu'investisseuse professionnelle, j'apprécie la plateforme excellente, la transparence des frais et le support de qualité.", rating: 5, img: TESTIMONIAL_IMAGES[3] },
];

const TESTIMONIALS_EN = [
  { name: "Dr. Markus Weber", role: "Entrepreneur", text: "The digital transformation at SWIZKOTE is impressive. From account opening to financing – everything is smooth and professional.", rating: 5, img: TESTIMONIAL_IMAGES[0] },
  { name: "Claudia Meier", role: "Private Client", text: "The personal advice and the modern app make everyday life so easy. I have been a delighted customer for years and can warmly recommend the bank.", rating: 5, img: TESTIMONIAL_IMAGES[1] },
  { name: "Thomas Schmid", role: "Real Estate Investor", text: "The mortgage conditions are unbeatable. Fast decisions, fair interest rates and first-class service. Absolutely recommended.", rating: 5, img: TESTIMONIAL_IMAGES[2] },
  { name: "Sabine Keller", role: "Financial Advisor", text: "As a professional investor, I appreciate the excellent platform, transparent fees and first-class support.", rating: 5, img: TESTIMONIAL_IMAGES[3] },
];

const TESTIMONIALS_IT = [
  { name: "Dr. Markus Weber", role: "Imprenditore", text: "La trasformazione digitale di SWIZKOTE è impressionante. Dall'apertura del conto al finanziamento – tutto è fluido e professionale.", rating: 5, img: TESTIMONIAL_IMAGES[0] },
  { name: "Claudia Meier", role: "Cliente Privata", text: "La consulenza personalizzata e l'app moderna semplificano la vita quotidiana. Sono una cliente soddisfatta da anni e consiglio vivamente la banca.", rating: 5, img: TESTIMONIAL_IMAGES[1] },
  { name: "Thomas Schmid", role: "Investitore Immobiliare", text: "Le condizioni dei mutui sono imbattibili. Decisioni rapide, tassi equi e servizio di prim'ordine. Assolutamente raccomandato.", rating: 5, img: TESTIMONIAL_IMAGES[2] },
  { name: "Sabine Keller", role: "Consulente Finanziaria", text: "Come investitrice professionista, apprezzo l'eccellente piattaforma, le commissioni trasparenti e il supporto di prim'ordine.", rating: 5, img: TESTIMONIAL_IMAGES[3] },
];

export default function LandingPage() {
  const { t, lang } = useI18n();

  useScrollAnimation();

  // Select data based on language
  const getServices = () => {
    switch(lang) {
      case "de": return SERVICES_DE;
      case "en": return SERVICES_EN;
      case "it": return SERVICES_IT;
      default: return SERVICES_FR;
    }
  };

  const getModernFeatures = () => {
    switch(lang) {
      case "de": return MODERN_FEATURES_DE;
      case "en": return MODERN_FEATURES_EN;
      case "it": return MODERN_FEATURES_IT;
      default: return MODERN_FEATURES_FR;
    }
  };

  const getAwards = () => {
    switch(lang) {
      case "de": return AWARDS_DE;
      case "en": return AWARDS_EN;
      case "it": return AWARDS_IT;
      default: return AWARDS_FR;
    }
  };

  const getTestimonials = () => {
    switch(lang) {
      case "de": return TESTIMONIALS_DE;
      case "en": return TESTIMONIALS_EN;
      case "it": return TESTIMONIALS_IT;
      default: return TESTIMONIALS_FR;
    }
  };

  const services = getServices();
  const modernFeatures = getModernFeatures();
  const awards = getAwards();
  const testimonials = getTestimonials();

  const featTitles  = t("land_feat_titles")    as unknown as string[];
  const statsVals   = t("land_stats")          as unknown as string[];
  const statsLbls   = t("land_stats_labels")   as unknown as string[];
  const kpiVals     = t("land_kpi_vals")       as unknown as string[];
  const kpiLbls     = t("land_kpi_labels")     as unknown as string[];
  const kpiDescs    = t("land_kpi_descs")      as unknown as string[];
  const advisorItems = t("land_advisor_items") as unknown as string[];
  const secItems    = t("land_security_items") as unknown as string[];
  const secDescs    = t("land_security_descs") as unknown as string[];
  const secLbls     = t("land_secure_labels")  as unknown as string[];
  const secVals     = t("land_secure_vals")    as unknown as string[];
  const ctaItems    = t("land_cta_items")      as unknown as string[];
  const cntLbls     = t("land_contact_labels") as unknown as string[];
  const cntVals     = t("land_contact_values") as unknown as string[];

  const kpiIcons  = [Users, Wallet, Shield, Award];
  const ctaIcons  = [Clock, Globe, Shield, CreditCard];
  const cntIcons  = [MapPin, Phone, Mail, Clock];

  const aboutLabel = t("land_nav_about");
  const discoverLabel = lang === "de" ? "Entdecken" : lang === "en" ? "Discover" : lang === "it" ? "Scopri" : "Découvrir";

  // Contact form
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ firstname: "", lastname: "", email: "", message: "" });
  const [contactSending, setContactSending] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.firstname || !contactForm.email || !contactForm.message) return;
    setContactSending(true);
    setTimeout(() => {
      setContactSending(false);
      setContactForm({ firstname: "", lastname: "", email: "", message: "" });
      toast({
        title: lang === "de" ? "Nachricht gesendet ✓" : lang === "en" ? "Message sent ✓" : lang === "it" ? "Messaggio inviato ✓" : "Message envoyé ✓",
        description: lang === "de"
          ? "Wir werden uns so schnell wie möglich bei Ihnen melden."
          : lang === "en"
          ? "We will get back to you as soon as possible."
          : lang === "it"
          ? "Ti risponderemo il prima possibile."
          : "Nous vous répondrons dans les plus brefs délais.",
      });
    }, 800);
  };

  // Refresh page function
  const handleLogoClick = () => {
    window.location.reload();
  };

  // Handler pour les ancres avec scroll fluide
  const handleServicesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToElement("#services");
  };

  const handleFeaturesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToElement("#features");
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToElement("#contact");
  };

  const handleHeroDiscoverClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToElement("#services");
  };

  const handleAdvisorCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToElement("#contact");
  };

  // Footer data per language
  const footerSrvDE = ["Girokonto","Sparkonto","Premium-Karten","Kredite","Vermögensverwaltung","Sicherheit"];
  const footerSrvFR = ["Compte Courant","Compte Épargne","Cartes Premium","Crédits","Gestion de Fortune","Sécurité"];
  const footerSrvEN = ["Current Account","Savings Account","Premium Cards","Loans","Wealth Management","Security"];
  const footerSrvIT = ["Conto Corrente","Conto Risparmio","Carte Premium","Prestiti","Gestione Patrimonio","Sicurezza"];

  const footerCmpDE = ["Über uns","Karriere","Presse","Partnerschaften","Kontakt"];
  const footerCmpFR = ["À propos","Carrières","Presse","Partenariats","Contact"];
  const footerCmpEN = ["About","Careers","Press","Partnerships","Contact"];
  const footerCmpIT = ["Chi siamo","Carriere","Stampa","Partnership","Contatto"];

  const getFooterSrv = () => {
    switch(lang) {
      case "de": return footerSrvDE;
      case "en": return footerSrvEN;
      case "it": return footerSrvIT;
      default: return footerSrvFR;
    }
  };

  const getFooterCmp = () => {
    switch(lang) {
      case "de": return footerCmpDE;
      case "en": return footerCmpEN;
      case "it": return footerCmpIT;
      default: return footerCmpFR;
    }
  };

  const footerSrvLinks = {
    de: ["/services/girokonto","/services/sparkonto","/services/premium-karten","/services/kredite","/services/vermoegensverwaltung","/services/sicherheit"],
    fr: ["/services/compte-courant","/services/epargne","/services/cartes","/services/credits","/services/gestion-fortune","/services/securite"],
    en: ["/services/current-account","/services/savings-account","/services/premium-cards","/services/loans","/services/wealth-management","/services/security"],
    it: ["/services/conto-corrente","/services/conto-risparmio","/services/carte-premium","/services/prestiti","/services/gestione-patrimonio","/services/sicurezza"],
  };

  const getFooterLinks = (index: number) => {
    switch(lang) {
      case "de": return footerSrvLinks.de[index];
      case "en": return footerSrvLinks.en[index];
      case "it": return footerSrvLinks.it[index];
      default: return footerSrvLinks.fr[index];
    }
  };

  const footerCompanyLinks = {
    de: ["/about","/careers","/press","/partnerships","/contact"],
    fr: ["/about","/careers","/press","/partnerships","/contact"],
    en: ["/about","/careers","/press","/partnerships","/contact"],
    it: ["/about","/careers","/press","/partnerships","/contact"],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 h-16">
            {/* Logo - always stays together */}
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" 
              onClick={handleLogoClick}
              data-testid="logo-click"
              style={{ whiteSpace: "nowrap" }}
            >
              <img src={logoImg} alt="SWIZKOTE" className="h-8 w-auto object-contain flex-shrink-0" />
              <span className="text-base sm:text-lg font-bold tracking-tight" style={{ whiteSpace: "nowrap" }} data-testid="text-landing-brand">
                SWIZKOTE
              </span>
            </div>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
              <a 
                href="#services" 
                onClick={handleServicesClick}
                className="hover:text-foreground transition-colors cursor-pointer" 
                data-testid="link-services"
              >
                {t("land_nav_services")}
              </a>
              <a 
                href="#features" 
                onClick={handleFeaturesClick}
                className="hover:text-foreground transition-colors cursor-pointer"
              >
                {t("land_nav_features")}
              </a>
              <a 
                href="#contact" 
                onClick={handleContactClick}
                className="hover:text-foreground transition-colors cursor-pointer" 
                data-testid="link-contact"
              >
                {t("land_nav_contact")}
              </a>
              <Link href="/about" className="hover:text-foreground transition-colors">{aboutLabel}</Link>
            </div>
            {/* Right actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <LangSwitcher />
              <ThemeToggle />
              <Link href="/login">
                <Button variant="outline" size="sm" data-testid="button-login-nav" className="text-xs px-3">{t("land_login")}</Button>
              </Link>
              <Link href="/login#inscription">
                <Button size="sm" data-testid="button-open-account-nav" className="hidden sm:inline-flex text-xs px-3">{t("land_open_account")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <img src={HERO_IMG} alt="SWIZKOTE" className="absolute inset-0 w-full h-full object-cover" data-testid="img-hero-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222,40%,6%,0.92)] via-[hsl(222,35%,8%,0.85)] to-[hsl(222,30%,10%,0.7)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,40%,6%,0.6)] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <FadeIn delay={0}>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[hsl(42,80%,55%,0.3)] bg-[hsl(42,80%,55%,0.08)] text-[hsl(42,80%,70%)] text-sm mb-4 backdrop-blur-sm" data-testid="badge-hero">
                  <Landmark className="w-3.5 h-3.5" />
                  {t("land_hero_badge")}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-3" data-testid="text-hero-title">
                  {t("land_hero_title1")}<br />
                  <span className="text-gold">{t("land_hero_title2")}</span>
                </h1>
                <p className="text-lg md:text-xl text-[hsl(220,20%,78%)] mb-6 max-w-2xl leading-relaxed" data-testid="text-hero-desc">
                  {t("land_hero_desc")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/login#inscription">
                    <Button size="lg" className="gold-gradient text-[hsl(222,40%,10%)] border-[hsl(42,70%,45%)] font-semibold" data-testid="button-hero-cta">
                      {t("land_hero_cta")} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <a 
                    href="#services" 
                    onClick={handleHeroDiscoverClick}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-10 px-4 py-2 text-white border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                    data-testid="button-hero-discover"
                  >
                    {t("land_hero_discover")} <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="hidden lg:block"><HeroCalculator /></div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x">
            {statsVals.map((val, i) => (
              <div key={i} className="py-8 md:py-10 px-4 md:px-6 text-center animate-on-scroll" data-testid={`stat-item-${i}`}>
                <div className="text-2xl md:text-3xl font-bold text-gold mb-1">{val}</div>
                <div className="text-sm text-muted-foreground">{statsLbls[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Section with custom images ── */}
      <section id="services" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0}>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                {lang === "de" ? "Unsere Dienstleistungen" : lang === "en" ? "Our Services" : lang === "it" ? "I Nostri Servizi" : "Nos services"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" data-testid="text-services-title">
                {t("land_services_title")} <span className="text-gold">Premium</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("land_services_sub")}</p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <FadeIn key={svc.id} delay={idx * 100}>
                  <Link href={getFooterLinks(idx)}>
                    <Card className="hover-elevate group overflow-hidden cursor-pointer h-full hover:border-gold/40 transition-all duration-300 hover:-translate-y-1" data-testid={`card-service-${svc.id}`}>
                      <div className="h-48 overflow-hidden rounded-t-md relative">
                        <img
                          src={svc.img}
                          alt={svc.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <div className="w-10 h-10 rounded-md gold-gradient flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[hsl(222,40%,10%)]" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-gold transition-colors">{svc.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">{svc.desc}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                          {svc.features.slice(0, 2).map((f, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-muted/50">{f}</span>
                          ))}
                        </div>
                        <div className="flex items-center text-gold text-sm font-medium gap-1">
                          {discoverLabel} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Modern Banking Features with images ── */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                {lang === "de" ? "Banking der Zukunft" : lang === "en" ? "Banking of the Future" : lang === "it" ? "La banca del futuro" : "La banque du futur"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {lang === "de" ? "Modernes Banking für Ihr Leben" : lang === "en" ? "Modern Banking for Your Life" : lang === "it" ? "Banking moderno per la tua vita" : "Une banque moderne pour votre vie"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {lang === "de" ? "Innovative Technologien und persönliche Betreuung – vereint in einer nahtlosen Banking-Experience." : lang === "en" ? "Innovative technologies and personal support – combined in a seamless banking experience." : lang === "it" ? "Tecnologie innovative e supporto personale – combinati in un'esperienza bancaria fluida." : "Technologies innovantes et accompagnement personnalisé – réunis dans une expérience bancaire fluide."}
              </p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {modernFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <FadeIn key={idx} delay={idx * 100}>
                  <div className="group flex flex-col items-start p-6 rounded-xl border bg-card hover:border-gold/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden relative">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <img src={feat.img} alt={feat.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-card/80" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-[hsl(222,40%,10%)]" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Advisor ── */}
      <section className="relative overflow-hidden">
        <img src={ADVISOR_IMG} alt="Advisor" className="absolute inset-0 w-full h-full object-cover" data-testid="img-advisor-section" />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222,40%,6%,0.93)] via-[hsl(222,35%,8%,0.88)] to-[hsl(222,30%,10%,0.75)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/30 text-gold text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                {lang === "de" ? "Persönliche Betreuung" : lang === "en" ? "Personal Support" : lang === "it" ? "Supporto personale" : "Accompagnement personnalisé"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6" data-testid="text-advisor-title">
                {t("land_advisor_title")} <span className="text-gold">{t("land_advisor_gold")}</span> {t("land_advisor_end")}
              </h2>
              <p className="text-[hsl(220,20%,75%)] text-lg leading-relaxed mb-8">{t("land_advisor_desc")}</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {advisorItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[hsl(220,20%,80%)]">
                    <div className="w-6 h-6 rounded-md bg-[hsl(42,80%,55%,0.15)] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <a 
                href="#contact" 
                onClick={handleAdvisorCtaClick}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[hsl(42,80%,55%)] text-[hsl(222,40%,10%)] border-[hsl(42,70%,45%)] font-semibold hover:bg-[hsl(42,80%,50%)] transition-colors min-h-10 px-4 py-2"
                data-testid="button-advisor-cta"
              >
                {t("land_advisor_cta")} <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Awards Section ── */}
      <section id="awards" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                {lang === "de" ? "Auszeichnungen & Anerkennungen" : lang === "en" ? "Awards & Recognitions" : lang === "it" ? "Premi & Riconoscimenti" : "Distinctions & Reconnaissances"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {lang === "de" ? "Von Experten ausgezeichnet" : lang === "en" ? "Awarded by experts" : lang === "it" ? "Premiato dagli esperti" : "Récompensé par les experts"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {lang === "de" ? "Unser Engagement für Exzellenz wird durch renommierte Auszeichnungen bestätigt." : lang === "en" ? "Our commitment to excellence is confirmed by prestigious awards." : lang === "it" ? "Il nostro impegno per l'eccellenza è confermato da prestigiosi riconoscimenti." : "Notre engagement pour l'excellence est confirmé par des distinctions prestigieuses."}
              </p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {awards.map((award, idx) => {
              const Icon = award.icon;
              return (
                <FadeIn key={idx} delay={idx * 100}>
                  <div className="text-center p-6 rounded-xl border bg-card hover:border-gold/40 transition-all duration-300 hover:-translate-y-1">
                    <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
                      <Icon className="w-7 h-7 text-[hsl(222,40%,10%)]" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{award.name}</h3>
                    <p className="text-sm text-gold font-semibold">{award.year}</p>
                    <p className="text-xs text-muted-foreground mt-1">{award.issuer}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials with images ── */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                {lang === "de" ? "Kundenstimmen" : lang === "en" ? "Testimonials" : lang === "it" ? "Testimonianze" : "Témoignages"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                {lang === "de" ? "Was unsere Kunden sagen" : lang === "en" ? "What our customers say" : lang === "it" ? "Cosa dicono i nostri clienti" : "Ce que nos clients disent"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {lang === "de" ? "Über 50.000 zufriedene Kunden vertrauen auf SWIZKOTE." : lang === "en" ? "Over 50,000 satisfied customers trust SWIZKOTE." : lang === "it" ? "Oltre 50.000 clienti soddisfatti si fidano di SWIZKOTE." : "Plus de 50.000 clients satisfaits font confiance à SWIZKOTE."}
              </p>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div className="p-6 rounded-xl border bg-card hover:border-gold/40 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={t.img} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gold"
                    />
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">"{t.text}"</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section id="security" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <FadeIn delay={0}>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-4">
                  <Lock className="w-4 h-4" />
                  {lang === "de" ? "Höchste Sicherheitsstandards" : lang === "en" ? "Highest security standards" : lang === "it" ? "Standard di sicurezza elevati" : "Standards de sécurité élevés"}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6" data-testid="text-security-title">
                  {t("land_security_title")} <span className="text-gold">{t("land_security_gold")}</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{t("land_security_desc")}</p>
                <div className="space-y-5">
                  {secItems.map((title, i) => (
                    <div key={i} className="flex gap-4" data-testid={`security-item-${i}`}>
                      <div className="w-8 h-8 rounded-md bg-[hsl(42,80%,55%,0.12)] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-4 h-4 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-0.5">{title}</h4>
                        <p className="text-sm text-muted-foreground">{secDescs[i]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="relative">
                <div className="rounded-md overflow-hidden">
                  <img src={SECURITY_IMG} alt="Security" className="w-full h-64 object-cover rounded-md mb-4" data-testid="img-security-visual" />
                </div>
                <div className="rounded-md overflow-hidden border bg-gradient-to-br from-[hsl(222,40%,10%)] to-[hsl(222,35%,6%)] p-8">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md gold-gradient flex items-center justify-center">
                        <Lock className="w-5 h-5 text-[hsl(222,40%,10%)]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">SWIZKOTE Secure</div>
                        <div className="text-[hsl(220,20%,60%)] text-sm">{t("land_secure_sub")}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {secLbls.map((label, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-[hsl(220,20%,70%)]">{label}</span>
                          <span className="text-gold font-semibold">{secVals[i]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px bg-[hsl(222,30%,18%)]" />
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {["SSL/TLS","2FA","FINMA"].map((badge, i) => (
                        <div key={i} className="py-2 rounded-md bg-[hsl(222,35%,14%)] border border-[hsl(222,30%,20%)] text-xs text-[hsl(220,20%,70%)] font-medium">{badge}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Numbers ── */}
      <section id="numbers" className="relative overflow-hidden">
        <img src={ZURICH_SKYLINE_IMG} alt="Zürich" className="absolute inset-0 w-full h-full object-cover" data-testid="img-chiffres-background" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,40%,6%,0.92)] via-[hsl(222,35%,8%,0.85)] to-[hsl(222,40%,6%,0.92)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center mb-14">
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/30 text-gold text-sm font-medium mb-4">
                <BarChart3 className="w-4 h-4" />
                {lang === "de" ? "In Zahlen" : lang === "en" ? "By the numbers" : lang === "it" ? "In numeri" : "En chiffres"}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4" data-testid="text-chiffres-title">
                {t("land_numbers_title")}<span className="text-gold">{t("land_numbers_gold")}</span>
              </h2>
              <p className="text-[hsl(220,20%,75%)] max-w-2xl mx-auto text-lg">{t("land_numbers_sub")}</p>
            </FadeIn>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiVals.map((val, i) => {
              const KpiIcon = kpiIcons[i];
              return (
                <FadeIn key={i} delay={i * 100}>
                  <div className="text-center p-6 rounded-md border border-white/10 bg-white/[0.04] backdrop-blur-sm transition-all duration-300 hover:scale-105" data-testid={`chiffre-item-${i}`}>
                    <div className="w-12 h-12 rounded-md gold-gradient flex items-center justify-center mx-auto mb-4">
                      <KpiIcon className="w-6 h-6 text-[hsl(222,40%,10%)]" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{val}</div>
                    <div className="text-gold font-semibold text-sm mb-1">{kpiLbls[i]}</div>
                    <div className="text-[hsl(220,20%,60%)] text-xs">{kpiDescs[i]}</div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <FadeIn delay={0}>
              <div className="relative">
                <div className="rounded-md overflow-hidden">
                  <img src={MOBILE_BANKING_IMG} alt="Mobile banking" className="w-full h-72 object-cover rounded-md" data-testid="img-mobile-banking" />
                </div>
                <div className="mt-4 rounded-md overflow-hidden">
                  <img src={DIGITAL_WORKSPACE_IMG} alt="Digital workspace" className="w-full h-48 object-cover rounded-md" data-testid="img-digital-workspace" />
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  {lang === "de" ? "Jetzt starten" : lang === "en" ? "Get started" : lang === "it" ? "Inizia ora" : "Commencez maintenant"}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" data-testid="text-cta-title">
                  {t("land_cta_title")} <span className="text-gold">{t("land_cta_gold")}</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{t("land_cta_desc")}</p>
                <div className="space-y-4 mb-8">
                  {ctaItems.map((item, i) => {
                    const CtaIcon = ctaIcons[i];
                    return (
                      <div key={i} className="flex items-center gap-3" data-testid={`cta-benefit-${i}`}>
                        <div className="w-8 h-8 rounded-md bg-[hsl(42,80%,55%,0.12)] flex items-center justify-center flex-shrink-0">
                          <CtaIcon className="w-4 h-4 text-gold" />
                        </div>
                        <span className="text-sm">{item}</span>
                      </div>
                    );
                  })}
                </div>
                <Link href="/login#inscription">
                  <Button size="lg" className="gold-gradient text-[hsl(222,40%,10%)] border-[hsl(42,70%,45%)] font-semibold" data-testid="button-cta-open">
                    {t("land_cta_btn")} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="relative overflow-hidden">
        <img src={SWISS_LANDSCAPE_IMG} alt="Switzerland" className="absolute inset-0 w-full h-full object-cover" data-testid="img-contact-background" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,40%,6%,0.93)] via-[hsl(222,35%,8%,0.88)] to-[hsl(222,40%,6%,0.95)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <FadeIn delay={0}>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/30 text-gold text-sm font-medium mb-4">
                  <Mail className="w-4 h-4" />
                  {lang === "de" ? "Kontaktieren Sie uns" : lang === "en" ? "Contact us" : lang === "it" ? "Contattaci" : "Contactez-nous"}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4" data-testid="text-contact-title">
                  {t("land_contact_title")} <span className="text-gold">{t("land_contact_gold")}</span>
                </h2>
                <p className="text-[hsl(220,20%,75%)] text-lg mb-8 leading-relaxed">{t("land_contact_desc")}</p>
                <div className="space-y-5 mb-8">
                  {cntLbls.map((label, i) => {
                    const CntIcon = cntIcons[i];
                    return (
                      <div key={i} className="flex items-start gap-4" data-testid={`contact-info-${i}`}>
                        <div className="w-10 h-10 rounded-md bg-[hsl(42,80%,55%,0.12)] flex items-center justify-center flex-shrink-0">
                          <CntIcon className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{label}</div>
                          <div className="text-[hsl(220,20%,70%)] text-sm">{cntVals[i]}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div>
                <div className="rounded-md border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 md:p-8">
                  <h3 className="text-white font-semibold text-lg mb-5" data-testid="text-contact-form-title">{t("land_form_title")}</h3>
                  <form className="space-y-4" onSubmit={handleContactSubmit}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[hsl(220,20%,70%)] text-sm mb-1.5 block">{t("land_form_firstname")}</label>
                        <Input className="bg-white/[0.06] border-white/10 text-white placeholder:text-[hsl(220,20%,45%)]" placeholder={t("land_form_firstname_ph")} value={contactForm.firstname} onChange={(e: { target: { value: any; }; }) => setContactForm({ ...contactForm, firstname: e.target.value })} required data-testid="input-contact-firstname" />
                      </div>
                      <div>
                        <label className="text-[hsl(220,20%,70%)] text-sm mb-1.5 block">{t("land_form_lastname")}</label>
                        <Input className="bg-white/[0.06] border-white/10 text-white placeholder:text-[hsl(220,20%,45%)]" placeholder={t("land_form_lastname_ph")} value={contactForm.lastname} onChange={(e: { target: { value: any; }; }) => setContactForm({ ...contactForm, lastname: e.target.value })} data-testid="input-contact-lastname" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[hsl(220,20%,70%)] text-sm mb-1.5 block">{t("land_form_email")}</label>
                      <Input type="email" className="bg-white/[0.06] border-white/10 text-white placeholder:text-[hsl(220,20%,45%)]" placeholder="hans@beispiel.ch" value={contactForm.email} onChange={(e: { target: { value: any; }; }) => setContactForm({ ...contactForm, email: e.target.value })} required data-testid="input-contact-email" />
                    </div>
                    <div>
                      <label className="text-[hsl(220,20%,70%)] text-sm mb-1.5 block">{t("land_form_message")}</label>
                      <Textarea className="bg-white/[0.06] border-white/10 text-white placeholder:text-[hsl(220,20%,45%)] min-h-[120px]" placeholder={t("land_form_message_ph")} value={contactForm.message} onChange={(e: { target: { value: any; }; }) => setContactForm({ ...contactForm, message: e.target.value })} required data-testid="input-contact-message" />
                    </div>
                    <Button type="submit" className="w-full gold-gradient text-[hsl(222,40%,10%)] border-[hsl(42,70%,45%)] font-semibold" disabled={contactSending} data-testid="button-contact-submit">
                      {contactSending ? (lang === "de" ? "Wird gesendet..." : lang === "en" ? "Sending..." : lang === "it" ? "Invio in corso..." : "Envoi en cours...") : <>{t("land_form_submit")} <Send className="w-4 h-4 ml-2" /></>}
                    </Button>
                  </form>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-card/50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div 
                className="flex items-center gap-1.5 mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={handleLogoClick}
                style={{ whiteSpace: "nowrap" }}
              >
                <img src={logoImg} alt="SWIZKOTE" className="h-6 w-auto object-contain flex-shrink-0" />
                <span className="font-bold" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("land_footer_tagline")}</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-all hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                {/* X / Twitter */}
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X"
                  className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-black/10 hover:text-foreground dark:hover:bg-white/10 transition-all hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                  className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-[#E1306C]/10 hover:text-[#E1306C] transition-all hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                {/* LinkedIn */}
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                  className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-all hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                {/* YouTube */}
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                  className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-[#FF0000]/10 hover:text-[#FF0000] transition-all hover:scale-110">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                {/* Newsletter */}
                <a href="#newsletter" aria-label="Newsletter"
                  className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:bg-gold/20 hover:text-gold transition-all hover:scale-110">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t("land_footer_services")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {getFooterSrv().map((label, i) => (
                  <li key={i}><Link href={getFooterLinks(i)} className="hover:text-gold transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t("land_footer_company")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {getFooterCmp().map((label, i) => {
                  const hrefs = lang === "de" ? footerCompanyLinks.de : lang === "en" ? footerCompanyLinks.en : lang === "it" ? footerCompanyLinks.it : footerCompanyLinks.fr;
                  return <li key={i}><Link href={hrefs[i]} className="hover:text-gold transition-colors">{label}</Link></li>;
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">{t("land_footer_contact")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +41 22 000 00 00</li>
                <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {lang === "de" ? "Genf, Schweiz" : lang === "en" ? "Geneva, Switzerland" : lang === "it" ? "Ginevra, Svizzera" : "Genève, Suisse"}</li>
                <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> kontakt@swizkote.ch</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span data-testid="text-footer-copyright">{t("land_footer_copyright")}</span>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-gold transition-colors">{t("land_footer_tos")}</Link>
              <Link href="/privacy" className="hover:text-gold transition-colors">{t("land_footer_privacy")}</Link>
              <Link href="/legal" className="hover:text-gold transition-colors">{t("land_footer_legal")}</Link>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-on-scroll.animated {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}