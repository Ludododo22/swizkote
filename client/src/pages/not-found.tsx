import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
const logoImg = "/logo.png";

export default function NotFound() {
  const { lang } = useI18n();
  const de = lang === "de";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10" style={{ whiteSpace: "nowrap" }}>
        <img src={logoImg} alt="SwizKote Bank" className="w-8 h-8 object-contain flex-shrink-0" />
        <span className="text-xl font-bold tracking-tight" style={{ whiteSpace: "nowrap" }}>
          SwizKote <span className="text-gold">Bank</span>
        </span>
      </div>

      {/* Error card */}
      <div className="text-center max-w-md w-full">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-6xl font-bold text-gold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-3">
          {de ? "Seite nicht gefunden" : "Page introuvable"}
        </h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {de
            ? "Die von Ihnen gesuchte Seite existiert nicht oder wurde verschoben."
            : "La page que vous recherchez n'existe pas ou a été déplacée."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button className="gold-gradient text-[hsl(222,40%,10%)] font-semibold gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              {de ? "Zur Startseite" : "Retour à l'accueil"}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {de ? "Zurück" : "Retour"}
          </Button>
        </div>
      </div>
    </div>
  );
}
