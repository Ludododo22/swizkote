import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calculator, Send, Loader2, BadgeCheck, FileText,
  TrendingUp, Home, Car, Briefcase, Wrench, ShoppingBag,
  ChevronRight, Info,
} from "lucide-react";

function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

const LOAN_TYPES = [
  { value: "immo",    rate: 1.5,  icon: Home,        labelDe: "Immobilienkredit",  labelFr: "Prêt immobilier",   max: 2000000, durMax: 360 },
  { value: "conso",   rate: 4.9,  icon: ShoppingBag, labelDe: "Konsumkredit",      labelFr: "Prêt consommation", max: 100000,  durMax: 84  },
  { value: "auto",    rate: 2.9,  icon: Car,         labelDe: "Autokredit",        labelFr: "Prêt automobile",   max: 200000,  durMax: 84  },
  { value: "pro",     rate: 3.5,  icon: Briefcase,   labelDe: "Geschäftskredit",   labelFr: "Prêt professionnel",max: 500000,  durMax: 120 },
  { value: "travaux", rate: 2.2,  icon: Wrench,      labelDe: "Renovierungskredit",labelFr: "Prêt travaux",      max: 300000,  durMax: 120 },
];

export default function LoanRequestPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  const [selectedType, setSelectedType] = useState(LOAN_TYPES[0]);
  const [amount, setAmount] = useState(200000);
  const [duration, setDuration] = useState(120);
  const [purpose, setPurpose] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const rate = selectedType.rate;
  const mr = rate / 100 / 12;
  const monthly = amount > 0 && duration > 0 && mr > 0
    ? (amount * mr * Math.pow(1 + mr, duration)) / (Math.pow(1 + mr, duration) - 1)
    : amount / duration;
  const totalCost = monthly * duration;
  const totalInterest = totalCost - amount;

  const sendRequest = useMutation({
    mutationFn: async () => {
      const typeLabel = lang === "de" ? selectedType.labelDe : selectedType.labelFr;
      const content = lang === "de"
        ? `📋 KREDITANTRAG\n\nArt: ${typeLabel}\nBetrag: ${formatCurrency(amount)}\nLaufzeit: ${duration} Monate\nZinssatz: ${rate}% p.a.\nGeschätzte Monatsrate: ${formatCurrency(monthly)}\nGesamtkosten: ${formatCurrency(totalCost)}\nZweck: ${purpose || "—"}`
        : `📋 DEMANDE DE PRÊT\n\nType : ${typeLabel}\nMontant : ${formatCurrency(amount)}\nDurée : ${duration} mois\nTaux : ${rate}% p.a.\nMensualité estimée : ${formatCurrency(monthly)}\nCoût total : ${formatCurrency(totalCost)}\nObjet : ${purpose || "—"}`;
      const r = await apiRequest("POST", "/api/messages", { content, userId: "", fromAdmin: false });
      if (!r.ok) throw new Error(await r.text());
    },
    onSuccess: () => {
      toast({ title: t("loans_request_sent"), description: t("loans_request_sent_desc") });
      setSubmitted(true);
    },
    onError: (err: any) => toast({ title: t("error"), description: err.message, variant: "destructive" }),
  });

  if (submitted) return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
        <div className="w-20 h-20 rounded-2xl bg-green-500/15 flex items-center justify-center">
          <BadgeCheck className="w-10 h-10 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-green-700 dark:text-green-400">{t("loans_request_sent")}</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">{t("loans_request_sent_desc")}</p>
        </div>
        <div className="w-full max-w-sm space-y-3 pt-2">
          <Button className="w-full" variant="outline" onClick={() => setSubmitted(false)}>
            {lang === "de" ? "Neuen Antrag stellen" : "Nouvelle demande"}
          </Button>
          <a href="/loans">
            <Button className="w-full gap-2">
              <TrendingUp className="w-4 h-4" />
              {lang === "de" ? "Meine Vorgänge ansehen" : "Voir mes dossiers"}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{lang === "de" ? "Kreditantrag" : "Demande de prêt"}</h1>
        <p className="text-sm text-muted-foreground">
          {lang === "de" ? "Simulieren und stellen Sie Ihren Finanzierungsantrag" : "Simulez et soumettez votre demande de financement"}
        </p>
      </div>

      {/* Step 1 — Loan type */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
          <h2 className="text-sm font-semibold">{lang === "de" ? "Kreditart wählen" : "Choisir le type de prêt"}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {LOAN_TYPES.map(lt => {
            const Icon = lt.icon;
            const isActive = selectedType.value === lt.value;
            return (
              <button
                key={lt.value}
                onClick={() => {
                  setSelectedType(lt);
                  setAmount(Math.min(amount, lt.max));
                  setDuration(Math.min(duration, lt.durMax));
                }}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 text-center transition-all ${
                  isActive
                    ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold))]/8"
                    : "border-border hover:border-[hsl(var(--gold))]/40 bg-card"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? "bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))]" : "bg-muted text-muted-foreground"
                }`}>
                  <Icon className="w-4.5 h-4.5 w-5 h-5" />
                </div>
                <span className="text-xs font-semibold leading-tight">
                  {lang === "de" ? lt.labelDe : lt.labelFr}
                </span>
                <span className="text-[10px] text-muted-foreground">{lt.rate}% p.a.</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — Simulator */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
          <h2 className="text-sm font-semibold">{lang === "de" ? "Betrag und Laufzeit" : "Montant et durée"}</h2>
        </div>
        <Card>
          <CardContent className="pt-5 space-y-6">
            {/* Amount slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{lang === "de" ? "Gewünschter Betrag" : "Montant souhaité"}</Label>
                <span className="text-lg font-bold text-[hsl(var(--gold))]">{formatCurrency(amount)}</span>
              </div>
              <Slider
                value={[amount]}
                min={5000}
                max={selectedType.max}
                step={selectedType.value === "immo" ? 10000 : selectedType.value === "pro" ? 5000 : 1000}
                onValueChange={([v]) => setAmount(v)}
                className="[&_[role=slider]]:bg-[hsl(var(--gold))] [&_[role=slider]]:border-[hsl(var(--gold))] [&_.relative>div]:bg-[hsl(var(--gold))]"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>CHF 5'000</span>
                <span>{formatCurrency(selectedType.max)}</span>
              </div>
            </div>

            {/* Duration slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{lang === "de" ? "Laufzeit" : "Durée"}</Label>
                <span className="text-lg font-bold text-[hsl(var(--gold))]">
                  {duration} {lang === "de" ? "Monate" : "mois"}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({Math.round(duration / 12 * 10) / 10} {lang === "de" ? "Jahre" : "ans"})
                  </span>
                </span>
              </div>
              <Slider
                value={[duration]}
                min={12}
                max={selectedType.durMax}
                step={6}
                onValueChange={([v]) => setDuration(v)}
                className="[&_[role=slider]]:bg-[hsl(var(--gold))] [&_[role=slider]]:border-[hsl(var(--gold))] [&_.relative>div]:bg-[hsl(var(--gold))]"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>12 {lang === "de" ? "Monate" : "mois"}</span>
                <span>{selectedType.durMax} {lang === "de" ? "Monate" : "mois"}</span>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/20 p-3 text-center">
                <p className="text-[10px] text-[hsl(var(--gold))]/80 mb-1.5 font-medium uppercase tracking-wide">
                  {lang === "de" ? "Monatsrate" : "Mensualité"}
                </p>
                <p className="text-base font-bold text-[hsl(var(--gold))]">{formatCurrency(monthly)}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                  {lang === "de" ? "Gesamtkosten" : "Coût total"}
                </p>
                <p className="text-base font-bold">{formatCurrency(totalCost)}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">
                  {lang === "de" ? "Gesamtzinsen" : "Total intérêts"}
                </p>
                <p className="text-base font-bold">{formatCurrency(totalInterest)}</p>
              </div>
            </div>

            {/* Rate info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {lang === "de"
                  ? `Richtzinssatz: ${rate}% p.a. (effektiver Jahreszins). Tatsächlicher Zinssatz nach individueller Bonitätsprüfung.`
                  : `Taux indicatif : ${rate}% p.a. (TAEG). Taux réel déterminé après étude personnalisée de votre dossier.`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 3 — Submission */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
          <h2 className="text-sm font-semibold">{lang === "de" ? "Antrag einreichen" : "Soumettre la demande"}</h2>
        </div>
        <Card>
          <CardContent className="pt-5 space-y-4">
            {/* Summary */}
            <div className="rounded-xl bg-muted/50 p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {lang === "de" ? "Zusammenfassung" : "Récapitulatif"}
              </p>
              {[
                [lang === "de" ? "Kreditart" : "Type", lang === "de" ? selectedType.labelDe : selectedType.labelFr],
                [lang === "de" ? "Betrag" : "Montant", formatCurrency(amount)],
                [lang === "de" ? "Laufzeit" : "Durée", `${duration} ${lang === "de" ? "Monate" : "mois"}`],
                [lang === "de" ? "Zinssatz" : "Taux", `${rate}% p.a.`],
                [lang === "de" ? "Monatsrate" : "Mensualité", formatCurrency(monthly)],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-xs font-semibold">{v}</span>
                </div>
              ))}
            </div>

            {/* Purpose */}
            <div className="space-y-1.5">
              <Label className="text-sm">{t("loans_request_purpose")}</Label>
              <Textarea
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder={t("loans_request_purpose_ph")}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-3">
              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                {lang === "de"
                  ? "Ihre Anfrage wird direkt an Ihren persönlichen Berater übermittelt, der sich innerhalb von 24 Stunden bei Ihnen meldet. Sie können den Fortschritt in \"Meine Vorgänge\" verfolgen."
                  : "Votre demande sera transmise directement à votre conseiller dédié qui vous contactera dans les 24h. Vous pourrez suivre l'avancement dans \"Mes dossiers\"."}
              </p>
            </div>

            {/* Submit */}
            <Button
              className="w-full gap-2 bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold))]/90 text-[hsl(222,40%,10%)] border-0 font-bold"
              onClick={() => sendRequest.mutate()}
              disabled={sendRequest.isPending}
            >
              {sendRequest.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />{t("loans_request_submitting")}</>
                : <><Send className="w-4 h-4" />{t("loans_request_submit")}</>
              }
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {lang === "de"
                ? "Ihre Daten werden vertraulich behandelt · FINMA-zugelassen"
                : "Vos données sont traitées confidentiellement · Agréé FINMA"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
