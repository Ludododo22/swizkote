import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
<<<<<<< HEAD
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Loan, LoanStep } from "@shared/schema";
import {
  CheckCircle2, Lock, Unlock, AlertTriangle, KeyRound,
  TrendingUp, ChevronRight, X, Banknote, FileText,
<<<<<<< HEAD
  CircleDashed, BadgeCheck, Phone, Mail, MessageSquare,
=======
  CircleDashed,
  BadgeCheck,
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
} from "lucide-react";
import { format } from "date-fns";
import { fr, de } from "date-fns/locale";
import { Link, useParams, useSearch } from "wouter";

type SafeLoanStep = Omit<LoanStep, "code">;

function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

// ─── Animated progress bar ────────────────────────────────────────────────────
function AnimatedBar({ value, color, height = 3 }: { value: number; color: string; height?: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const start = prevRef.current;
    const target = value;
    const t0 = performance.now();
    const raf = (now: number) => {
      const p = Math.min((now - t0) / 900, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (target - start) * e));
      if (p < 1) requestAnimationFrame(raf);
      else prevRef.current = target;
    };
    requestAnimationFrame(raf);
  }, [value]);
  return (
    <div className="relative rounded-full overflow-hidden bg-muted/60" style={{ height }}>
      <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${display}%`, background: color }} />
    </div>
  );
}

// ─── Type configs ─────────────────────────────────────────────────────────────
const TYPE_CFG = {
  transfer:     { Icon: Banknote,   gradient: "linear-gradient(135deg,#c9a84c,#e8c96a)", label: { fr: "Virement",         de: "Überweisung"      }, final: { fr: "Virement envoyé avec succès ✓",     de: "Überweisung erfolgreich gesendet ✓" } },
  loan_request: { Icon: FileText,   gradient: "linear-gradient(135deg,#3b82f6,#6366f1)", label: { fr: "Demande de prêt",  de: "Kreditantrag"     }, final: { fr: "Prêt accordé — Fonds versés ✓",      de: "Kredit gewährt — Mittel überwiesen ✓" } },
  loan_active:  { Icon: TrendingUp, gradient: "linear-gradient(135deg,#10b981,#059669)", label: { fr: "Prêt en cours",   de: "Laufender Kredit" }, final: { fr: "Prêt entièrement remboursé ✓",      de: "Kredit vollständig zurückgezahlt ✓" } },
} as const;

function getCfg(type: string, lang: string) {
  const k = (type in TYPE_CFG ? type : "transfer") as keyof typeof TYPE_CFG;
  const c = TYPE_CFG[k];
  const l = lang === "de" ? "de" : "fr";
  return { ...c, label: c.label[l], final: c.final[l] };
}

function StepDot({ status }: { status: string }) {
  if (status === "completed") return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>;
  if (status === "code_required") return <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 animate-pulse"><Lock className="w-3 h-3 text-white" /></div>;
  if (status === "active") return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-white animate-ping" /></div>;
  return <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center flex-shrink-0"><CircleDashed className="w-3 h-3 text-muted-foreground/40" /></div>;
}

// ─── Loan Request Form ────────────────────────────────────────────────────────

<<<<<<< HEAD
// ─── StepLoadingBar — animated loading bar for the active step ────────────────
function StepLoadingBar({ step, lang }: { step: SafeLoanStep; lang: string }) {
  const [pct, setPct] = useState(0);
  const [paused, setPaused] = useState(false);
  const pauseTarget = (step as any).interruptAt ?? null;
  const additionalMsg = (step as any).additionalInfoMessage ?? null;
  const additionalEnabled = (step as any).additionalInfoEnabled ?? false;
  const [additionalAnswer, setAdditionalAnswer] = useState("");
  const [answerSent, setAnswerSent] = useState(false);
  const raf = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (step.status === "code_required") {
      // Freeze at pause target or 35%
      setPct(pauseTarget ?? 35);
      setPaused(true);
      return;
    }
    if (step.status !== "active") return;

    setPct(0);
    setPaused(false);
    setAnswerSent(false);
    startRef.current = null;

    const DURATION = 12000; // 12s to fill the bar

    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min((elapsed / DURATION) * 100, 100);

      if (pauseTarget !== null && progress >= pauseTarget && !paused) {
        setPct(pauseTarget);
        setPaused(true);
        pausedAtRef.current = pauseTarget;
        return; // stop animation
      }

      setPct(progress);
      if (progress < 100) {
        raf.current = requestAnimationFrame(animate);
      }
    };

    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.status, step.id]);

  const isCodeReq = step.status === "code_required";
  const barColor = isCodeReq ? "#f59e0b" : paused ? "#a855f7" : "#22c55e";
  const label = paused && !isCodeReq
    ? (lang === "de" ? `Angehalten bei ${Math.round(pct)}% — Zusätzliche Informationen erforderlich` : `En attente à ${Math.round(pct)}% — Informations complémentaires requises`)
    : isCodeReq
    ? (lang === "de" ? `Code erforderlich — ${Math.round(pct)}%` : `Code requis — ${Math.round(pct)}%`)
    : (lang === "de" ? `Bearbeitung läuft… ${Math.round(pct)}%` : `Traitement en cours… ${Math.round(pct)}%`);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-white/70">
        <span>{label}</span>
        <span className="font-bold text-white">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/15 overflow-hidden">
        <div
          className="h-full rounded-full transition-none"
          style={{ width: `${pct}%`, background: barColor, transition: paused ? "none" : "width 100ms linear" }}
        />
      </div>

      {/* Info complémentaire box when paused by admin */}
      {paused && !isCodeReq && additionalEnabled && additionalMsg && (
        <div className="mt-2 rounded-xl bg-white/10 border border-white/30 p-3 space-y-2">
          <p className="text-xs font-semibold text-white">
            {lang === "de" ? "Informationsanfrage" : "Demande d'information"}
          </p>
          <p className="text-xs text-white/80 leading-relaxed">{additionalMsg}</p>
          {!answerSent ? (
            <div className="flex gap-2">
              <input
                className="flex-1 h-8 text-xs rounded-lg bg-white/20 text-white placeholder:text-white/40 px-2.5 border border-white/30 outline-none focus:border-white/60"
                placeholder={lang === "de" ? "Ihre Antwort…" : "Votre réponse…"}
                value={additionalAnswer}
                onChange={e => setAdditionalAnswer(e.target.value)}
              />
              <button
                className="h-8 px-3 text-xs font-semibold rounded-lg bg-white text-amber-700 hover:bg-white/90 disabled:opacity-50"
                disabled={!additionalAnswer.trim()}
                onClick={() => setAnswerSent(true)}
              >
                {lang === "de" ? "Senden" : "Envoyer"}
              </button>
            </div>
          ) : (
            <p className="text-xs text-green-300 font-medium">
              ✓ {lang === "de" ? "Antwort übermittelt — warten auf Bestätigung" : "Réponse transmise — en attente de validation"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
// ─── LoanDetail ───────────────────────────────────────────────────────────────
function LoanDetail({ loanId }: { loanId: string }) {
  const { toast } = useToast();
  const { lang } = useI18n();
  const [otpValue, setOtpValue] = useState("");
  const [showOtpFor, setShowOtpFor] = useState<string | null>(null);
  const locale = lang === "de" ? de : fr;

  const { data: loan, isLoading: lL } = useQuery<Loan>({
    queryKey: ["/api/loans", loanId], refetchInterval: 5000,
    queryFn: async () => { const r = await fetch(`/api/loans/${loanId}`, { credentials: "include" }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  });

  const { data: steps, isLoading: sL } = useQuery<SafeLoanStep[]>({
    queryKey: ["/api/loans", loanId, "steps"], refetchInterval: 5000,
    queryFn: async () => { const r = await fetch(`/api/loans/${loanId}/steps`, { credentials: "include" }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  });

  const validateCode = useMutation({
    mutationFn: async (code: string) => { const r = await apiRequest("POST", `/api/loans/${loanId}/validate-code`, { code }); if (!r.ok) throw new Error(await r.text()); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans", loanId] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans", loanId, "steps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({ title: lang === "de" ? "Code bestätigt ✓" : "Code validé ✓" });
      setOtpValue(""); setShowOtpFor(null);
    },
    onError: (err: any) => toast({ title: lang === "de" ? "Ungültiger Code" : "Code invalide", description: err.message, variant: "destructive" }),
  });

  if (lL || sL) return <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4"><Skeleton className="h-5 w-28" /><Skeleton className="h-36 w-full rounded-2xl" /><Skeleton className="h-60 w-full rounded-2xl" /></div>;

  if (!loan || !steps) return <div className="flex flex-col items-center py-20 gap-3"><AlertTriangle className="w-10 h-10 text-muted-foreground/30" /><p className="text-muted-foreground text-sm">{lang === "de" ? "Vorgang nicht gefunden" : "Dossier introuvable"}</p></div>;

  const cfg = getCfg((loan as any).type || "transfer", lang);
  const { Icon } = cfg;
  const completedCount = steps.filter(s => s.status === "completed").length;
  const totalCount = steps.length || 4;
  const globalPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isFinished = completedCount === totalCount && totalCount > 0;
  const hasCodeReq = steps.some(s => s.status === "code_required");

<<<<<<< HEAD
  // Active step index for the animated loading bar
  const activeStepIdx = steps.findIndex(s => s.status === "active" || s.status === "code_required");

=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <Link href="/loans">
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" />
          {lang === "de" ? "Zurück zur Übersicht" : "Retour aux dossiers"}
        </button>
      </Link>

<<<<<<< HEAD
      {/* Hero card */}
=======
      {/* Hero */}
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
      <div className="rounded-2xl p-5 text-white space-y-4" style={{ background: cfg.gradient }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-0.5">{cfg.label}</p>
              <h2 className="text-base font-bold leading-tight">{loan.label}</h2>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-bold">{formatCurrency(loan.amount, loan.currency)}</p>
            {isFinished
              ? <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full">{lang === "de" ? "Abgeschlossen" : "Terminé"}</span>
              : hasCodeReq
              ? <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded-full animate-pulse">{lang === "de" ? "Code erforderlich" : "Code requis"}</span>
              : <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full">{lang === "de" ? "In Bearbeitung" : "En cours"}</span>
            }
          </div>
        </div>
<<<<<<< HEAD

        {/* ── 4-step milestone progress bar ── */}
        <div className="space-y-3">
          {/* Step dots row */}
          <div className="relative">
            {/* Connecting line behind dots */}
            <div className="absolute top-3 left-0 right-0 h-px bg-white/20" />
            <div
              className="absolute top-3 left-0 h-px bg-white/70 transition-all duration-700"
              style={{ width: totalCount > 1 ? `${Math.min(globalPct, 100)}%` : "0%" }}
            />
            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const done = step.status === "completed";
                const active = step.status === "active" || step.status === "code_required";
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / totalCount}%` }}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10
                      ${done ? "bg-white border-white" : active ? "bg-white/30 border-white animate-pulse" : "bg-transparent border-white/30"}`}>
                      {done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        : active
                        ? <div className="w-2 h-2 rounded-full bg-white" />
                        : <span className="text-[9px] font-bold text-white/50">{idx + 1}</span>
                      }
                    </div>
                    <span className={`text-[9px] font-medium text-center leading-tight max-w-[60px] truncate
                      ${done ? "text-white" : active ? "text-white" : "text-white/40"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Animated loading bar for active step */}
          {!isFinished && activeStepIdx >= 0 && (
            <StepLoadingBar step={steps[activeStepIdx]} lang={lang} />
          )}

=======
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">{lang === "de" ? "Gesamtfortschritt" : "Progression globale"}</span>
            <span className="font-bold">{globalPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white/90 transition-all duration-1000 ease-out" style={{ width: `${globalPct}%` }} />
          </div>
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
          <p className="text-xs text-white/70">{completedCount}/{totalCount} {lang === "de" ? "Schritte" : "étapes"}
            {loan.updatedAt && <> · {format(new Date(loan.updatedAt), "d MMM", { locale })}</>}
          </p>
        </div>
      </div>

<<<<<<< HEAD
      {/* Detailed step list */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <span className="text-sm font-semibold">{lang === "de" ? "Détail des étapes" : "Détail des étapes"}</span>
=======
      {/* Steps */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <span className="text-sm font-semibold">{lang === "de" ? "Vorgangsschritte" : "Étapes du dossier"}</span>
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const done = step.status === "completed";
            const active = step.status === "active";
            const codeReq = step.status === "code_required";
            const pending = step.status === "pending";
<<<<<<< HEAD
            const pct = done ? 100 : active ? 60 : codeReq ? 35 : 0;
=======
            const pct = done ? 100 : active ? 55 : codeReq ? 30 : 0;
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
            const barCol = done ? "#22c55e" : codeReq ? "#f59e0b" : "#3b82f6";
            return (
              <div key={step.id} className="flex gap-3.5">
                <div className="flex flex-col items-center pt-1">
                  <StepDot status={step.status} />
                  {!isLast && <div className={`w-px flex-1 my-1 min-h-[16px] ${done ? "bg-green-400" : "bg-border"}`} />}
                </div>
                <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-sm font-semibold leading-tight ${pending ? "text-muted-foreground" : ""}`}>{step.label}</span>
                    <div className="flex-shrink-0">
                      {done && step.unlockedAt && <span className="text-[11px] text-muted-foreground">{format(new Date(step.unlockedAt), "d MMM · HH:mm", { locale })}</span>}
                      {active && <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-600 dark:text-blue-400 py-0">{lang === "de" ? "Aktiv" : "En cours"}</Badge>}
<<<<<<< HEAD
                      {codeReq && <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 py-0 animate-pulse">{lang === "de" ? "Code requis" : "Code requis"}</Badge>}
=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
                    </div>
                  </div>
                  {step.description && <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{step.description}</p>}
                  {!pending && <div className="mb-2.5"><AnimatedBar value={pct} color={barCol} height={3} /></div>}
<<<<<<< HEAD

                  {/* ── Code validation — enhanced UI ── */}
                  {codeReq && (
                    <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-3.5 mt-2">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                          <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                            {lang === "de" ? "Validierungscode des Virements" : "Code de validation du virement"}
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                            {lang === "de"
                              ? "Geben Sie den Validierungscode ein, den Ihr Finanzberater Ihnen mitgeteilt hat."
                              : "Saisissez le code de validation fourni par votre conseiller financier."}
                          </p>
                        </div>
                      </div>

                      {/* Contact service info */}
                      <div className="rounded-lg bg-amber-100/70 dark:bg-amber-900/30 px-3 py-2.5 flex items-center gap-2.5">
                        <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                            {lang === "de" ? "Bitte kontaktieren Sie den Finanzservice" : "Veuillez contacter le service financier"}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400">+41 22 000 00 00 · financement@swizkote.ch</p>
                        </div>
                      </div>

                      {/* OTP input or button */}
                      {showOtpFor === step.id ? (
                        <div className="space-y-3">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-xs text-muted-foreground">{lang === "de" ? "Code eingeben (6 Ziffern)" : "Saisir le code (6 chiffres)"}</p>
=======
                  {codeReq && (
                    <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3.5 space-y-3 mt-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-0.5">{lang === "de" ? "Validierungscode erforderlich" : "Code de validation requis"}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{lang === "de" ? "Kontaktieren Sie Ihren Berater, um diesen Code per E-Mail zu erhalten." : "Contactez votre conseiller pour recevoir ce code par email."}</p>
                        </div>
                      </div>
                      {showOtpFor === step.id ? (
                        <div className="space-y-3">
                          <div className="flex justify-center">
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
                            <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                              <InputOTPGroup>{Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
                            </InputOTP>
                          </div>
                          <div className="flex gap-2">
<<<<<<< HEAD
                            <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0 gap-1.5"
                              onClick={() => validateCode.mutate(otpValue)}
                              disabled={otpValue.length < 6 || validateCode.isPending}>
                              {validateCode.isPending
                                ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />{lang === "de" ? "Prüfung..." : "Vérification..."}</>
                                : <>{lang === "de" ? "Valider" : "Valider"}</>}
                            </Button>
                            <Button size="sm" variant="outline" className="border-amber-300" onClick={() => { setShowOtpFor(null); setOtpValue(""); }}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white border-0 gap-2"
                          onClick={() => setShowOtpFor(step.id)}>
                          <KeyRound className="w-3.5 h-3.5" />
                          {lang === "de" ? "Code eingeben & validieren" : "Saisir le code & valider"}
=======
                            <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0" onClick={() => validateCode.mutate(otpValue)} disabled={otpValue.length < 6 || validateCode.isPending}>
                              {validateCode.isPending ? (lang === "de" ? "Prüfung..." : "Vérification...") : (lang === "de" ? "Bestätigen" : "Valider")}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setShowOtpFor(null); setOtpValue(""); }}><X className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30" onClick={() => setShowOtpFor(step.id)}>
                          <Unlock className="w-3.5 h-3.5 mr-2" />{lang === "de" ? "Code eingeben" : "Saisir le code"}
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {loan.adminNote && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="py-3.5 px-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">{lang === "de" ? "Hinweis Ihres Beraters" : "Note de votre conseiller"}</p>
                <p className="text-sm">{loan.adminNote}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isFinished && (
        <Card className="border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0"><BadgeCheck className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-sm font-bold text-green-700 dark:text-green-400">{cfg.final}</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">{formatCurrency(loan.amount, loan.currency)} {lang === "de" ? "erfolgreich bearbeitet." : "traité avec succès."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <p className="text-center text-xs text-muted-foreground pb-2">
        {lang === "de" ? "Erstellt am" : "Créé le"} {loan.createdAt ? format(new Date(loan.createdAt), "d MMMM yyyy", { locale }) : "—"}
      </p>
    </div>
  );
}

// ─── LoanCard ────────────────────────────────────────────────────────────────
function LoanCard({ loan, lang }: { loan: Loan; lang: string }) {
  const cfg = getCfg((loan as any).type || "transfer", lang);
  const { Icon } = cfg;
  const progress = loan.totalSteps > 1 ? Math.round((loan.currentStep / (loan.totalSteps - 1)) * 100) : loan.currentStep > 0 ? 100 : 0;
  const isFinished = loan.currentStep >= loan.totalSteps - 1 && loan.totalSteps > 0;
  const locale = lang === "de" ? de : fr;
  return (
    <Link href={`/loans/${loan.id}`}>
      <Card className="hover-elevate cursor-pointer overflow-hidden">
        <CardContent className="p-0">
          <div className="h-1" style={{ background: cfg.gradient }} />
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.gradient }}><Icon className="w-4 h-4 text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{loan.label}</p>
                <p className="text-xs text-muted-foreground">{cfg.label} · {formatCurrency(loan.amount, loan.currency)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isFinished ? <Badge className="bg-green-500 text-white border-0 text-[10px] px-1.5">{lang === "de" ? "Fertig" : "Terminé"}</Badge> : <Badge variant="outline" className="text-[10px] px-1.5">{progress}%</Badge>}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <AnimatedBar value={isFinished ? 100 : progress} color={cfg.gradient} height={4} />
            <div className="flex justify-between mt-1.5">
              <p className="text-[11px] text-muted-foreground">{lang === "de" ? `Schritt ${loan.currentStep + 1}/${loan.totalSteps}` : `Étape ${loan.currentStep + 1}/${loan.totalSteps}`}</p>
              {loan.updatedAt && <p className="text-[11px] text-muted-foreground">{format(new Date(loan.updatedAt), "d MMM", { locale })}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


// ─── LoansPage ────────────────────────────────────────────────────────────────
export default function LoansPage() {
  const { lang } = useI18n();
  const params = useParams<{ id: string }>();

  const { data: loans, isLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"], refetchInterval: 8000, enabled: !params.id,
  });

  if (params.id) return <LoanDetail loanId={params.id} />;

  const transfers = loans?.filter(l => !(l as any).type || (l as any).type === "transfer") ?? [];
  const requests  = loans?.filter(l => (l as any).type === "loan_request") ?? [];
  const actives   = loans?.filter(l => (l as any).type === "loan_active") ?? [];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">{lang === "de" ? "Meine Vorgänge" : "Mes dossiers"}</h1>
          <p className="text-sm text-muted-foreground">
            {lang === "de" ? "Verfolgen Sie Ihre Überweisungen und Kredite" : "Suivez vos virements et demandes de prêt"}
          </p>
        </div>
        <a href="/loan-request">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30 text-[hsl(var(--gold))] text-xs font-semibold hover:bg-[hsl(var(--gold))]/20 transition-colors">
            <FileText className="w-3.5 h-3.5" />
            {lang === "de" ? "Kreditantrag" : "Demande de prêt"}
          </button>
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : !loans?.length ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground">{lang === "de" ? "Keine laufenden Vorgänge" : "Aucun dossier en cours"}</p>
          <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
            {lang === "de" ? "Ihre Vorgänge erscheinen hier." : "Vos dossiers apparaîtront ici."}
          </p>
          <a href="/loan-request">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold))] text-sm font-medium hover:bg-[hsl(var(--gold))]/10 transition-colors">
              <FileText className="w-4 h-4" />
              {lang === "de" ? "Kreditantrag stellen" : "Faire une demande de prêt"}
            </button>
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {transfers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="w-4 h-4 text-[hsl(var(--gold))]" />
                <h2 className="text-sm font-semibold">{lang === "de" ? "Überweisungen" : "Virements"}</h2>
                <Badge variant="outline" className="text-[10px] px-1.5">{transfers.length}</Badge>
              </div>
              <div className="space-y-3">{transfers.map(l => <LoanCard key={l.id} loan={l} lang={lang} />)}</div>
            </section>
          )}
          {requests.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold">{lang === "de" ? "Kreditanträge" : "Demandes de prêt"}</h2>
                <Badge variant="outline" className="text-[10px] px-1.5">{requests.length}</Badge>
              </div>
              <div className="space-y-3">{requests.map(l => <LoanCard key={l.id} loan={l} lang={lang} />)}</div>
            </section>
          )}
          {actives.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <h2 className="text-sm font-semibold">{lang === "de" ? "Laufende Kredite" : "Prêts en cours"}</h2>
                <Badge variant="outline" className="text-[10px] px-1.5">{actives.length}</Badge>
              </div>
              <div className="space-y-3">{actives.map(l => <LoanCard key={l.id} loan={l} lang={lang} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
