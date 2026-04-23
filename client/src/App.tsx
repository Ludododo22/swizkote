import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { LangSwitcher } from "@/components/lang-switcher";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import TransfersPage from "@/pages/transfers";
import TransferFinalizationPage from "@/pages/transfer-finalization";
import AccountsPage from "@/pages/accounts";
import CardsPage from "@/pages/cards";
import LoansPage from "@/pages/loans";
import VaultPage from "@/pages/vault";
import MessagesPage from "@/pages/messages";
import ProfilePage from "@/pages/profile";
import LoanRequestPage from "@/pages/loan-request";
import AdminPage from "@/pages/admin";
import AboutPage from "@/pages/about";
import CareersPage from "@/pages/careers";
import PressPage from "@/pages/press";
import PartnershipsPage from "@/pages/partnerships";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import LegalPage from "@/pages/legal";
import ServicesPage from "@/pages/services";
import SecurityPage from "@/pages/security";
import { useEffect, useState } from "react";
const logoImg = "/logo.png";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle">
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

function AppLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const steps = [
      { target: 30, delay: 100 },
      { target: 60, delay: 300 },
      { target: 80, delay: 600 },
      { target: 92, delay: 1000 },
    ];
    let timeout: ReturnType<typeof setTimeout>;
    const run = (i: number) => {
      if (i >= steps.length) return;
      timeout = setTimeout(() => {
        setProgress(steps[i].target);
        run(i + 1);
      }, steps[i].delay);
    };
    run(0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-8">
      <div className="flex flex-col items-center gap-5">
        {/* Spinning ring around logo */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-20 h-20 animate-spin"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ animationDuration: "1.6s", animationTimingFunction: "linear" }}
          >
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="3" strokeOpacity="0.1" />
            <path
              d="M40 4 A36 36 0 0 1 76 40"
              stroke="hsl(var(--gold))"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <img src={logoImg} alt="SWIZKOTE" className="w-12 h-12 object-contain" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold tracking-tight">SWIZKOTE</p>
          <p className="text-xs text-muted-foreground mt-0.5">Schweizer Bankexzellenz</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-52 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, hsl(var(--gold)), hsl(42 70% 40%))",
          }}
        />
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();
  const isAdmin = user?.role === "admin";
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Rediriger l'utilisateur vers le tableau de bord après connexion
    if (!isLoading && user && (location === "/" || location === "/login")) {
      setLocation("/dashboard");
    }
  }, [location, setLocation, user, isLoading]);

  // Afficher un loader pendant la vérification de l'utilisateur
  if (isLoading) {
    return <AppLoading />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="flex items-center justify-between gap-2 px-3 py-2 border-b flex-shrink-0 sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            {/* Logo centré cliquable — visible sur mobile uniquement — whitespace-nowrap prevents split */}
            <Link href="/dashboard" className="absolute left-1/2 -translate-x-1/2 md:hidden flex items-center gap-1.5 hover:opacity-80 transition-opacity" style={{ whiteSpace: "nowrap" }}>
              <img src={logoImg} alt="SWIZKOTE" className="w-6 h-6 object-contain flex-shrink-0" />
              <span className="text-sm font-bold tracking-tight" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</span>
            </Link>
            <div className="flex items-center gap-1.5 ml-auto">
              <LangSwitcher />
              <ThemeToggle />
            </div>
          </header>
          {/* pb-16 on mobile to avoid content hidden under bottom nav */}
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0 overflow-x-hidden">
            <Switch>
              {isAdmin ? (
                <>
                  {/* Route principale pour l'admin - capture toutes les sous-routes */}
                  <Route path="/dashboard" component={AdminPage} />
                  <Route path="/admin" component={AdminPage} />
                  <Route path="/admin/:rest*" component={AdminPage} />
                </>
              ) : (
                <>
                  <Route path="/dashboard" component={DashboardPage} />
                  <Route path="/transfers" component={TransfersPage} />
                  <Route path="/transfers/:id/finalization" component={TransferFinalizationPage} />
                  <Route path="/transfers/:id" component={TransfersPage} />
                  <Route path="/accounts" component={AccountsPage} />
                  <Route path="/cards" component={CardsPage} />
                  <Route path="/loans" component={LoansPage} />
                  <Route path="/loans/:id" component={LoansPage} />
                  <Route path="/vault" component={VaultPage} />
                  <Route path="/messages" component={MessagesPage} />
                  <Route path="/profile" component={ProfilePage} />
                  <Route path="/loan-request" component={LoanRequestPage} />
                </>
              )}
              <Route path="*" component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
      {/* Bottom nav visible only on mobile */}
      <MobileNav />
    </SidebarProvider>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    // Ne pas scroller si c'est une ancre sur la même page (ex: /#services)
    if (!location.includes("#")) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location]);
  return null;
}

function UnauthenticatedApp() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/press" component={PressPage} />
        <Route path="/partnerships" component={PartnershipsPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/legal" component={LegalPage} />
        <Route path="/services/:id" component={ServicesPage} />
        <Route path="/security" component={SecurityPage} />
        <Route path="/" component={LandingPage} />
        <Route path="*" component={LandingPage} />
      </Switch>
    </>
  );
}

function AppContent() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <AppLoading />;
  }

  // Utilisateur connecté - afficher l'application authentifiée
  if (isAuthenticated && user) {
    return <AuthenticatedApp />;
  }

  // Utilisateur non connecté - afficher la page d'accueil ou de connexion
  // Si l'utilisateur essaie d'accéder à une page protégée, rediriger vers login
  const protectedPaths = ['/dashboard', '/transfers', '/accounts', '/cards', '/loans', '/loan-request', '/vault', '/messages', '/admin', '/profile'];
  const isProtectedPath = protectedPaths.some(path => location.startsWith(path));
  
  if (isProtectedPath && location !== '/login') {
    // Rediriger vers login via le composant UnauthenticatedApp qui gère la route /login
    return <UnauthenticatedApp />;
  }

  return <UnauthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <TooltipProvider>
            <AuthProvider>
              <AppContent />
              <Toaster />
            </AuthProvider>
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;