import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Lock, Shield, Globe } from "lucide-react";
import { LangSwitcher } from "@/components/lang-switcher";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
const logoImg = "/logo.png";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

// Composant PasswordInput dédié - SOLUTION RADICALE
function PasswordInput({ value, onChange, placeholder, required, autoComplete, disabled }: any) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-stretch">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
        style={{ paddingRight: "2.5rem" }}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function LoginPage() {
  const { t, lang } = useI18n();
  const de = lang === "de";
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", fullName: "", email: "", phone: "" });

  // Auto-switch to register tab if URL hash is #inscription
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#inscription") {
      setIsRegister(true);
      // Scroll to the form
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ username: form.username, password: form.password, fullName: form.fullName, email: form.email, phone: form.phone || undefined });
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

  // Security badges
  const badges =
    lang === "de" ? ["AES-256 Verschlüsselung", "FINMA reguliert", "ISO 27001"] :
    lang === "en" ? ["AES-256 Encryption", "FINMA regulated", "ISO 27001"] :
    lang === "it" ? ["Crittografia AES-256", "Regolamentato FINMA", "ISO 27001"] :
    ["Chiffrement AES-256", "Régulé FINMA", "ISO 27001"];

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left panel — decorative, desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] flex-shrink-0 bg-gradient-to-br from-[hsl(222,40%,10%)] to-[hsl(222,35%,6%)] p-10 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-gold blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gold blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        {/* Logo */}
        <div className="relative flex items-center gap-2" style={{ whiteSpace: "nowrap" }}>
          <img src={logoImg} alt="SWIZKOTE" className="h-10 w-auto object-contain flex-shrink-0" />
          <span className="text-xl font-bold text-white tracking-widest uppercase" style={{ whiteSpace: "nowrap" }}>
            SWIZKOTE
          </span>
        </div>
        {/* Centre text */}
        <div className="relative space-y-6">
          <div>
            <p className="text-gold text-sm font-medium uppercase tracking-widest mb-3">
              {lang === "de" ? "Seit 2001" : lang === "en" ? "Since 2001" : lang === "it" ? "Dal 2001" : "Depuis 2001"}
            </p>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              {lang === "de"
                ? <>Die <span className="text-gold">Schweizer</span> Bankexzellenz<br />für Sie.</>
                : lang === "en"
                ? <><span className="text-gold">Swiss</span> banking excellence<br />for you.</>
                : lang === "it"
                ? <>L'eccellenza bancaria<br /><span className="text-gold">svizzera</span> per voi.</>
                : <>L'excellence bancaire<br /><span className="text-gold">suisse</span> pour vous.</>
              }
            </h2>
            <p className="text-[hsl(220,20%,65%)] mt-4 text-sm leading-relaxed">
              {lang === "de"
                ? "Verwalten Sie Ihr Vermögen sicher und einfach über unsere digitale Plattform. Zugang zu allen Ihren Konten, Überweisungen und mehr."
                : lang === "en"
                ? "Manage your wealth safely and easily via our digital platform. Access all your accounts, transfers and much more."
                : lang === "it"
                ? "Gestisci il tuo patrimonio in modo sicuro e semplice tramite la nostra piattaforma digitale. Accedi a tutti i tuoi conti, bonifici e molto altro."
                : "Gérez votre patrimoine en toute sécurité via notre plateforme digitale. Accédez à vos comptes, virements et bien plus encore."}
            </p>
          </div>
          {/* Switzerland highlight
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--gold))/15] border border-[hsl(var(--gold))/30]">
            <Shield className="w-4 h-4 text-gold flex-shrink-0" />
            <span className="text-gold font-bold text-sm tracking-wide">
              {lang === "de" ? "Schweiz" : lang === "en" ? "Switzerland" : lang === "it" ? "Svizzera" : "Suisse"}
            </span>
          </div> */}
        </div>
        {/* Bottom line */}
        <p className="relative text-[hsl(220,20%,40%)] text-xs">
          © 2024 SWIZKOTE SA
        </p>
      </div>

      {/* Right panel — form */}
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

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-6">
            {/* Mobile logo */}
            <div className="lg:hidden text-center space-y-2">
              <img src={logoImg} alt="SWIZKOTE" className="h-12 w-auto object-contain mx-auto" />
              <h1 className="text-xl font-bold tracking-widest uppercase" style={{ whiteSpace: "nowrap" }}>
                SWIZKOTE
              </h1>
              <p className="text-sm text-muted-foreground">{t("login_tagline")}</p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold tracking-tight">
                {isRegister
                  ? (lang === "de" ? "Konto erstellen" : lang === "en" ? "Create account" : lang === "it" ? "Crea account" : "Créer un compte")
                  : (lang === "de" ? "Willkommen zurück" : lang === "en" ? "Welcome back" : lang === "it" ? "Bentornato" : "Bon retour")
                }
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isRegister
                  ? (lang === "de" ? "Eröffnen Sie Ihr SWIZKOTE-Konto" : lang === "en" ? "Open your SWIZKOTE account" : lang === "it" ? "Apri il tuo conto SWIZKOTE" : "Ouvrez votre compte SWIZKOTE")
                  : (lang === "de" ? "Melden Sie sich in Ihrem Konto an" : lang === "en" ? "Sign in to your account" : lang === "it" ? "Accedi al tuo conto" : "Connectez-vous à votre espace")
                }
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl border p-1 gap-1 bg-muted/40">
              <button
                onClick={() => setIsRegister(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  !isRegister ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-login-tab"
              >
                {t("login_tab")}
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  isRegister ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-register-tab"
              >
                {t("login_register_tab")}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">{t("login_fullname")}</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                      placeholder={t("login_fullname_ph")}
                      required
                      data-testid="input-fullname"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder={t("login_email_ph")}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">{t("login_phone")}</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="+41 79 000 00 00"
                      data-testid="input-phone"
                    />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="username">{t("login_username")}</Label>
                <Input
                  id="username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder={t("login_username_ph")}
                  required
                  data-testid="input-username"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("login_password")}</Label>
                <PasswordInput
                  value={form.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value })}
                  placeholder={t("login_password_ph")}
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </div>
              <Button
                type="submit"
                className="w-full gold-gradient text-[hsl(222,40%,10%)] font-semibold"
                disabled={loading}
                data-testid="button-submit-auth"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-2" />{t("loading")}</>
                  : isRegister ? t("login_register_btn") : t("login_btn")
                }
              </Button>
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