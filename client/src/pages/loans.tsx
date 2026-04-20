import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Loan, LoanStep } from "@shared/schema";
import {
  CheckCircle2, Lock, AlertTriangle, KeyRound,
  TrendingUp, ChevronRight, X, Banknote, FileText,
  CircleDashed, BadgeCheck, Phone, MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { fr, de, enGB, it } from "date-fns/locale";
import { Link, useParams } from "wouter";

type SafeLoanStep = Omit<LoanStep, "code">;

function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

function AnimatedBar({ value, color, height = 3 }: { value: number; color: string; height?: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const start = prevRef.current;
    const t0 = performance.now();
    const raf = (now: number) => {
      const p = Math.min((now - t0) / 900, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (value - start) * e));
      if (p < 1) requestAnimationFrame(raf);
      else prevRef.current = value;
    };
    requestAnimationFrame(raf);
  }, [value]);
  return (
    <div className="relative rounded-full overflow-hidden bg-muted/60" style={{ height }}>
      <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${display}%`, background: color }} />
    </div>
  );
}

const TYPE_CFG = {
  transfer:     { Icon: Banknote,   gradient: "linear-gradient(135deg,#c9a84c,#e8c96a)", label: { fr: "Virement", de: "Überweisung", en: "Transfer", it: "Bonifico" }, final: { fr: "Virement envoyé avec succès", de: "Überweisung erfolgreich gesendet", en: "Transfer successfully sent", it: "Bonifico inviato con successo" } },
  loan_request: { Icon: FileText,   gradient: "linear-gradient(135deg,#3b82f6,#6366f1)", label: { fr: "Demande de prêt", de: "Kreditantrag", en: "Loan Request", it: "Richiesta prestito" }, final: { fr: "Prêt accordé — Fonds versés", de: "Kredit gewährt — Mittel überwiesen", en: "Loan granted — Funds disbursed", it: "Prestito accordato — Fondi erogati" } },
  loan_active:  { Icon: TrendingUp, gradient: "linear-gradient(135deg,#10b981,#059669)", label: { fr: "Prêt en cours", de: "Laufender Kredit", en: "Active Loan", it: "Prestito attivo" }, final: { fr: "Prêt entièrement remboursé", de: "Kredit vollständig zurückgezahlt", en: "Loan fully repaid", it: "Prestito completamente rimborsato" } },
} as const;

function getLang(lang: string): "fr" | "de" | "en" | "it" {
  if (lang === "de") return "de";
  if (lang === "en") return "en";
  if (lang === "it") return "it";
  return "fr";
}

function getCfg(type: string, lang: string) {
  const k = (type in TYPE_CFG ? type : "transfer") as keyof typeof TYPE_CFG;
  const c = TYPE_CFG[k];
  const l = getLang(lang);
  return { ...c, label: c.label[l], final: c.final[l] };
}

// ── i18n strings for loans page ──
const LOAN_I18N = {
  fr: {
    back: "Retour aux dossiers",
    steps_label: (done: number, total: number) => `${done}/${total} étapes`,
    created: "Créé le",
    step_detail: "Détail des étapes",
    step_inprogress: "En cours",
    step_info_required: "Info requise",
    step_answer_sent: "Réponse envoyée ✓",
    step_code_required: "Code requis",
    bar_waiting: "En attente de validation...",
    bar_validated: "Étape validée ✓",
    bar_code_req: "Code requis",
    bar_code_msg: "Votre conseiller a demandé un code de validation. Consultez le détail des étapes ci-dessous.",
    otp_label: "Saisir le code (6 chiffres)",
    otp_validate: "Valider",
    contact_title: "Contacter le service financier",
    contact_sub: "Saisissez le code fourni par votre conseiller financier.",
    enter_code: "Saisir le code et valider",
    advisor_note: "Note de votre conseiller",
    info_required_title: "Information complémentaire requise",
    reply_sent: "Réponse transmise — en attente de validation",
    reply_placeholder: "Votre réponse…",
    reply_send: "Envoyer",
    pending_title: "Demande de prêt en cours d'examen",
    pending_sub: "Votre conseiller examine votre dossier. Vous serez notifié(e) dès son activation.",
    pending_badge: "En attente",
    rejected_title: "Demande refusée",
    rejected_reason: "Motif : ",
    my_files: "Mes dossiers",
    my_files_sub: "Suivez vos virements et demandes de prêt",
    loan_request_btn: "Demande de prêt",
    transfers_section: "Virements",
    requests_section: "Demandes de prêt",
    active_section: "Prêts en cours",
    empty: "Aucun dossier en cours",
    empty_btn: "Faire une demande de prêt",
    step: "Étape",
    finished: "Terminé",
    completed: "Terminé",
    processing: "En cours de traitement",
    validated_success: "Validé avec succès",
    all_validated: "Toutes les étapes validées",
    code_validated: "Code validé",
    months: "mois",
  },
  de: {
    back: "Zurück zur Übersicht",
    steps_label: (done: number, total: number) => `${done}/${total} Schritte`,
    created: "Erstellt am",
    step_detail: "Schrittdetails",
    step_inprogress: "In Bearbeitung",
    step_info_required: "Info erforderlich",
    step_answer_sent: "Antwort gesendet ✓",
    step_code_required: "Code erforderlich",
    bar_waiting: "Warten auf Bestätigung...",
    bar_validated: "Schritt bestätigt ✓",
    bar_code_req: "Code erforderlich",
    bar_code_msg: "Ihr Berater hat einen Validierungscode angefordert. Überprüfen Sie die Schritte unten.",
    otp_label: "Code eingeben (6 Ziffern)",
    otp_validate: "Bestätigen",
    contact_title: "Finanzservice kontaktieren",
    contact_sub: "Geben Sie den Code ein, den Ihr Berater Ihnen mitgeteilt hat.",
    enter_code: "Code eingeben und bestätigen",
    advisor_note: "Hinweis Ihres Beraters",
    info_required_title: "Zusätzliche Information erforderlich",
    reply_sent: "Antwort übermittelt — wartet auf Validierung",
    reply_placeholder: "Ihre Antwort…",
    reply_send: "Senden",
    pending_title: "Kreditantrag wird geprüft",
    pending_sub: "Ihr Berater prüft Ihren Antrag. Sie werden benachrichtigt, sobald er aktiviert ist.",
    pending_badge: "Ausstehend",
    rejected_title: "Antrag abgelehnt",
    rejected_reason: "Grund: ",
    my_files: "Meine Vorgänge",
    my_files_sub: "Verfolgen Sie Ihre Überweisungen und Kredite",
    loan_request_btn: "Kreditantrag",
    transfers_section: "Überweisungen",
    requests_section: "Kreditanträge",
    active_section: "Laufende Kredite",
    empty: "Keine laufenden Vorgänge",
    empty_btn: "Kreditantrag stellen",
    step: "Schritt",
    finished: "Abgeschlossen",
    completed: "Abgeschlossen",
    processing: "In Bearbeitung",
    validated_success: "Erfolgreich validiert",
    all_validated: "Alle Schritte validiert",
    code_validated: "Code bestätigt",
    months: "Monate",
  },
  en: {
    back: "Back to files",
    steps_label: (done: number, total: number) => `${done}/${total} steps`,
    created: "Created on",
    step_detail: "Step details",
    step_inprogress: "In progress",
    step_info_required: "Info required",
    step_answer_sent: "Answer sent ✓",
    step_code_required: "Code required",
    bar_waiting: "Waiting for validation...",
    bar_validated: "Step validated ✓",
    bar_code_req: "Code required",
    bar_code_msg: "Your advisor has requested a validation code. Check the steps below.",
    otp_label: "Enter code (6 digits)",
    otp_validate: "Validate",
    contact_title: "Contact financial service",
    contact_sub: "Enter the code provided by your financial advisor.",
    enter_code: "Enter code and validate",
    advisor_note: "Note from your advisor",
    info_required_title: "Additional information required",
    reply_sent: "Reply sent — awaiting validation",
    reply_placeholder: "Your answer…",
    reply_send: "Send",
    pending_title: "Loan application under review",
    pending_sub: "Your advisor is reviewing your application. You will be notified once activated.",
    pending_badge: "Pending",
    rejected_title: "Application rejected",
    rejected_reason: "Reason: ",
    my_files: "My files",
    my_files_sub: "Track your transfers and loan requests",
    loan_request_btn: "Loan request",
    transfers_section: "Transfers",
    requests_section: "Loan requests",
    active_section: "Active loans",
    empty: "No active files",
    empty_btn: "Apply for a loan",
    step: "Step",
    finished: "Completed",
    completed: "Completed",
    processing: "Processing",
    validated_success: "Successfully validated",
    all_validated: "All steps validated",
    code_validated: "Code validated",
    months: "months",
  },
  it: {
    back: "Torna ai fascicoli",
    steps_label: (done: number, total: number) => `${done}/${total} fasi`,
    created: "Creato il",
    step_detail: "Dettaglio delle fasi",
    step_inprogress: "In corso",
    step_info_required: "Info richiesta",
    step_answer_sent: "Risposta inviata ✓",
    step_code_required: "Codice richiesto",
    bar_waiting: "In attesa di convalida...",
    bar_validated: "Fase convalidata ✓",
    bar_code_req: "Codice richiesto",
    bar_code_msg: "Il suo consulente ha richiesto un codice di convalida. Consulti i dettagli delle fasi di seguito.",
    otp_label: "Inserire il codice (6 cifre)",
    otp_validate: "Convalidare",
    contact_title: "Contattare il servizio finanziario",
    contact_sub: "Inserire il codice fornito dal suo consulente finanziario.",
    enter_code: "Inserire il codice e convalidare",
    advisor_note: "Nota del suo consulente",
    info_required_title: "Informazione complementare richiesta",
    reply_sent: "Risposta trasmessa — in attesa di convalida",
    reply_placeholder: "La sua risposta…",
    reply_send: "Inviare",
    pending_title: "Richiesta di prestito in esame",
    pending_sub: "Il suo consulente esamina la sua pratica. Sarà notificato/a all'attivazione.",
    pending_badge: "In attesa",
    rejected_title: "Richiesta rifiutata",
    rejected_reason: "Motivo: ",
    my_files: "I miei fascicoli",
    my_files_sub: "Segua i suoi bonifici e richieste di prestito",
    loan_request_btn: "Richiesta prestito",
    transfers_section: "Bonifici",
    requests_section: "Richieste di prestito",
    active_section: "Prestiti attivi",
    empty: "Nessun fascicolo in corso",
    empty_btn: "Richiedere un prestito",
    step: "Fase",
    finished: "Completato",
    completed: "Completato",
    processing: "In elaborazione",
    validated_success: "Convalidato con successo",
    all_validated: "Tutte le fasi convalidate",
    code_validated: "Codice convalidato",
    months: "mesi",
  },
} as const;

function getL(lang: string) {
  const l = getLang(lang);
  return LOAN_I18N[l];
}

function getLocale(lang: string) {
  if (lang === "de") return de;
  if (lang === "en") return enGB;
  if (lang === "it") return it;
  return fr;
}

function StepDot({ status }: { status: string }) {
  if (status === "completed")     return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>;
  if (status === "code_required") return <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 animate-pulse"><Lock className="w-3 h-3 text-white" /></div>;
  if (status === "active")        return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-white animate-ping" /></div>;
  return <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center flex-shrink-0"><CircleDashed className="w-3 h-3 text-muted-foreground/40" /></div>;
}

// ─── StepProgressBar ─────────────────────────────────────────────────────────
function StepProgressBar({
  status, lang, onDone, isPreviousStep = false,
}: {
  status: string; lang: string; onDone: () => void; isPreviousStep?: boolean;
}) {
  const l = getL(lang);
  const [pct, setPct] = useState(() => {
    if (status === "completed") return isPreviousStep ? 100 : 0;
    if (status === "code_required") return 35;
    return 0;
  });
  const [color, setColor] = useState(() => {
    if (status === "completed") return "#22c55e";
    if (status === "code_required") return "#f59e0b";
    return "#3b82f6";
  });
  const [label, setLabel] = useState(() => {
    if (status === "completed") return l.bar_validated;
    if (status === "code_required") return l.bar_code_req;
    if (status === "active") return l.bar_waiting;
    return "";
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const prevStatusRef = useRef(status);
  const animationRef = useRef<number | null>(null);

  const cancelAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;
    cancelAnimation();

    if (status === "completed") {
      setColor("#22c55e");
      setLabel(l.bar_validated);

      const wasActive = prevStatus === "active" || prevStatus === "code_required";
      if (wasActive) {
        setPct(0);
        setIsAnimating(true);
        let start: number | null = null;
        const duration = 700;
        const animate = (timestamp: number) => {
          if (start === null) start = timestamp;
          const elapsed = timestamp - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 2);
          setPct(Math.round(eased * 100));
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setPct(100);
            setIsAnimating(false);
            setTimeout(() => onDone(), 400);
          }
        };
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setPct(100);
        setIsAnimating(false);
      }
      return;
    }

    if (status === "active") {
      setColor("#3b82f6");
      setLabel(l.bar_waiting);
      setPct(0);
      setIsAnimating(false);
      return;
    }

    if (status === "code_required") {
      setColor("#f59e0b");
      setLabel(l.bar_code_req);
      setPct(35);
      setIsAnimating(false);
      return;
    }

    setColor("#3b82f6");
    setLabel("");
    setPct(0);
    setIsAnimating(false);
  }, [status, lang]);

  useEffect(() => {
    if (status === "completed") setLabel(l.bar_validated);
    else if (status === "active") setLabel(l.bar_waiting);
    else if (status === "code_required") setLabel(l.bar_code_req);
  }, [lang]);

  const showPulse = status === "active" && !isAnimating;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs text-white/70">
        <span className="flex items-center gap-1.5">
          {showPulse && <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse inline-block" />}
          {status === "completed" && !isAnimating && <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />}
          {label}
        </span>
        <span className="font-bold text-white tabular-nums">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/15 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {status === "code_required" && (
        <div className="mt-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 px-3 py-2 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
          <p className="text-xs text-amber-200 leading-snug">{l.bar_code_msg}</p>
        </div>
      )}
    </div>
  );
}

// ─── StepInfoReply ────────────────────────────────────────────────────────────
function StepInfoReply({ step, loanId, lang }: { step: SafeLoanStep; loanId: string; lang: string }) {
  const { toast } = useToast();
  const l = getL(lang);
  const [answer, setAnswer] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const clientResponse = (step as any).clientResponse as string | null;

  if (clientResponse || sent) {
    return (
      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 px-3 py-2.5 flex items-start gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-green-700 dark:text-green-400">{l.reply_sent}</p>
          <p className="text-xs text-muted-foreground mt-0.5 italic">"{clientResponse || answer}"</p>
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (!answer.trim() || sending) return;
    setSending(true);
    try {
      const r = await apiRequest("POST", `/api/loans/${loanId}/steps/${step.id}/respond`, { response: answer.trim() });
      if (!r.ok) throw new Error(await r.text());
      setSent(true);
      queryClient.invalidateQueries({ queryKey: ["/api/loans", loanId, "steps"] });
      toast({ title: l.reply_sent });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 h-9 text-sm rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-amber-950/20 px-3 outline-none focus:border-amber-400 transition-colors text-foreground placeholder:text-muted-foreground/60"
        placeholder={l.reply_placeholder}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
      />
      <Button
        size="sm"
        className="h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white border-0 gap-1.5 flex-shrink-0"
        disabled={!answer.trim() || sending}
        onClick={submit}
      >
        {sending ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
        {l.reply_send}
      </Button>
    </div>
  );
}

// ─── LoanDetail ───────────────────────────────────────────────────────────────
function LoanDetail({ loanId }: { loanId: string }) {
  const { toast } = useToast();
  const { lang } = useI18n();
  const [otpValue, setOtpValue] = useState("");
  const [showOtpFor, setShowOtpFor] = useState<string | null>(null);
  const locale = getLocale(lang);

  const { data: loan, isLoading: lL } = useQuery<Loan>({
    queryKey: ["/api/loans", loanId],
    refetchInterval: 3000,
    queryFn: async () => { const r = await fetch(`/api/loans/${loanId}`, { credentials: "include" }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  });

  const { data: steps, isLoading: sL } = useQuery<SafeLoanStep[]>({
    queryKey: ["/api/loans", loanId, "steps"],
    refetchInterval: 3000,
    queryFn: async () => { const r = await fetch(`/api/loans/${loanId}/steps`, { credentials: "include" }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  });

  const validateCode = useMutation({
    mutationFn: async (code: string) => { const r = await apiRequest("POST", `/api/loans/${loanId}/validate-code`, { code }); if (!r.ok) throw new Error(await r.text()); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans", loanId] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans", loanId, "steps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({ title: getL(lang).code_validated });
      setOtpValue(""); setShowOtpFor(null);
    },
    onError: (err: any) => toast({ title: "Code invalide", description: err.message, variant: "destructive" }),
  });

  if (lL || sL) return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-5 w-28" /><Skeleton className="h-40 w-full rounded-2xl" /><Skeleton className="h-60 w-full rounded-2xl" />
    </div>
  );

  if (!loan || !steps) return (
    <div className="flex flex-col items-center py-20 gap-3">
      <AlertTriangle className="w-10 h-10 text-muted-foreground/30" />
      <p className="text-muted-foreground text-sm">Dossier introuvable</p>
    </div>
  );

  const l            = getL(lang);
  const cfg          = getCfg((loan as any).type || "transfer", lang);
  const { Icon }     = cfg;
  const completedCount = steps.filter(s => s.status === "completed").length;
  const totalCount   = steps.length || 4;
  const globalPct    = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isFinished   = completedCount === totalCount && totalCount > 0;
  const hasCodeReq   = steps.some(s => s.status === "code_required");
  const activeStep   = steps.find(s => s.status === "active" || s.status === "code_required") ?? null;

  const handleStepDone = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/loans", loanId] });
    queryClient.invalidateQueries({ queryKey: ["/api/loans", loanId, "steps"] });
  };

  const getDurationLabel = (duration: number) => {
    return `${duration} ${l.months}`;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto space-y-4 sm:space-y-5 pb-20 md:pb-6">
      <Link href="/loans">
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" />
          {l.back}
        </button>
      </Link>

      <div className="rounded-2xl p-4 sm:p-5 text-white space-y-4" style={{ background: cfg.gradient }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><Icon className="w-5 h-5 text-white" /></div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-0.5">{cfg.label}</p>
              <h2 className="text-sm sm:text-base font-bold leading-tight truncate">{loan.label}</h2>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-lg sm:text-xl font-bold">{formatCurrency(loan.amount, loan.currency)}</p>
            {isFinished
              ? <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full">{l.finished}</span>
              : hasCodeReq
              ? <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded-full animate-pulse">{l.step_code_required}</span>
              : <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full">{l.processing}</span>
            }
          </div>
        </div>

        <div className="space-y-3">
          {/* Step dots timeline */}
          <div className="relative">
            <div className="absolute top-3 left-0 right-0 h-px bg-white/20" />
            <div className="absolute top-3 left-0 h-px bg-white/70 transition-all duration-700" style={{ width: totalCount > 1 ? `${Math.min(globalPct, 100)}%` : "0%" }} />
            <div className="relative flex justify-between">
              {steps.map((step, idx) => {
                const done   = step.status === "completed";
                const active = step.status === "active" || step.status === "code_required";
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / totalCount}%` }}>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10 ${done ? "bg-white border-white" : active ? "bg-white/30 border-white animate-pulse" : "bg-transparent border-white/30"}`}>
                      {done ? <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" /> : active ? <div className="w-2 h-2 rounded-full bg-white" /> : <span className="text-[9px] font-bold text-white/50">{idx + 1}</span>}
                    </div>
                    <span className={`text-[8px] sm:text-[9px] font-medium text-center leading-tight max-w-[50px] sm:max-w-[60px] truncate ${done ? "text-white" : active ? "text-white" : "text-white/40"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {!isFinished && activeStep && (
            <StepProgressBar
              key={`${activeStep.id}-${activeStep.status}`}
              status={activeStep.status}
              lang={lang}
              onDone={handleStepDone}
              isPreviousStep={false}
            />
          )}

          <p className="text-xs text-white/70">
            {l.steps_label(completedCount, totalCount)}
            {loan.updatedAt && <> · {format(new Date(loan.updatedAt), "d MMM", { locale })}</>}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <span className="text-sm font-semibold">{l.step_detail}</span>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {steps.map((step, idx) => {
            const isLast  = idx === steps.length - 1;
            const done    = step.status === "completed";
            const active  = step.status === "active";
            const codeReq = step.status === "code_required";
            const pending = step.status === "pending";
            const hasInfo = !!(step as any).additionalInfoEnabled && !!(step as any).additionalInfoMessage;
            const clientResp = (step as any).clientResponse as string | null;
            return (
              <div key={step.id} className="flex gap-3.5">
                <div className="flex flex-col items-center pt-1">
                  <StepDot status={step.status} />
                  {!isLast && <div className={`w-px flex-1 my-1 min-h-[16px] ${done ? "bg-green-400" : "bg-border"}`} />}
                </div>
                <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-4"}`}>
                  <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                    <span className={`text-sm font-semibold leading-tight ${pending ? "text-muted-foreground/50" : ""}`}>{step.label}</span>
                    <div className="flex-shrink-0 flex items-center gap-1.5 flex-wrap">
                      {done && step.unlockedAt && <span className="text-[11px] text-green-600 dark:text-green-400 font-medium">{format(new Date(step.unlockedAt), "d MMM · HH:mm", { locale })}</span>}
                      {active && !hasInfo && <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-600 dark:text-blue-400 py-0 animate-pulse">{l.step_inprogress}</Badge>}
                      {active && hasInfo && !clientResp && <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 py-0 animate-pulse">{l.step_info_required}</Badge>}
                      {active && hasInfo && clientResp && <Badge variant="outline" className="text-[10px] border-green-400 text-green-600 py-0">{l.step_answer_sent}</Badge>}
                      {codeReq && <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 py-0 animate-pulse">{l.step_code_required}</Badge>}
                    </div>
                  </div>
                  {step.description && <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{step.description}</p>}
                  {done && <div className="mb-2.5"><AnimatedBar value={100} color="#22c55e" height={3} /></div>}

                  {(active || codeReq) && hasInfo && (
                    <div className="mt-2 mb-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 sm:p-3.5 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{l.info_required_title}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">{(step as any).additionalInfoMessage}</p>
                        </div>
                      </div>
                      <StepInfoReply step={step} loanId={loanId} lang={lang} />
                    </div>
                  )}

                  {codeReq && (
                    <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 sm:p-4 space-y-3 sm:space-y-3.5 mt-2">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                          <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{l.step_code_required}</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">{l.contact_sub}</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-amber-100/70 dark:bg-amber-900/30 px-3 py-2.5 flex items-center gap-2.5">
                        <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">{l.contact_title}</p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400">+41 22 000 00 00 · financement@swizkote.ch</p>
                        </div>
                      </div>
                      {showOtpFor === step.id ? (
                        <div className="space-y-3">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-xs text-muted-foreground">{l.otp_label}</p>
                            <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                              <InputOTPGroup>{Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
                            </InputOTP>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white border-0"
                              onClick={() => validateCode.mutate(otpValue)}
                              disabled={otpValue.length < 6 || validateCode.isPending}>
                              {validateCode.isPending ? <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1.5" /> : null}
                              {l.otp_validate}
                            </Button>
                            <Button size="sm" variant="outline" className="border-amber-300" onClick={() => { setShowOtpFor(null); setOtpValue(""); }}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white border-0 gap-2" onClick={() => setShowOtpFor(step.id)}>
                          <KeyRound className="w-3.5 h-3.5" />
                          {l.enter_code}
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
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">{l.advisor_note}</p>
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
                <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">{formatCurrency(loan.amount, loan.currency)} {l.validated_success.toLowerCase()}.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground pb-2">
        {l.created} {loan.createdAt ? format(new Date(loan.createdAt), "d MMMM yyyy", { locale }) : "—"}
      </p>
    </div>
  );
}

function LoanCard({ loan, lang }: { loan: Loan; lang: string }) {
  const l = getL(lang);
  const cfg = getCfg((loan as any).type || "transfer", lang);
  const { Icon } = cfg;
  const progress = loan.totalSteps > 1 ? Math.round((loan.currentStep / (loan.totalSteps - 1)) * 100) : loan.currentStep > 0 ? 100 : 0;
  const isFinished = loan.currentStep >= loan.totalSteps - 1 && loan.totalSteps > 0;
  const locale = getLocale(lang);
  return (
    <Link href={`/loans/${loan.id}`}>
      <Card className="hover-elevate cursor-pointer overflow-hidden">
        <CardContent className="p-0">
          <div className="h-1" style={{ background: cfg.gradient }} />
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.gradient }}><Icon className="w-4 h-4 text-white" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{loan.label}</p>
                <p className="text-xs text-muted-foreground">{cfg.label} · {formatCurrency(loan.amount, loan.currency)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isFinished ? <Badge className="bg-green-500 text-white border-0 text-[10px] px-1.5">{l.finished}</Badge> : <Badge variant="outline" className="text-[10px] px-1.5">{progress}%</Badge>}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <AnimatedBar value={isFinished ? 100 : progress} color={cfg.gradient} height={4} />
            <div className="flex justify-between mt-1.5">
              <p className="text-[11px] text-muted-foreground">{l.step} {loan.currentStep + 1}/{loan.totalSteps}</p>
              {loan.updatedAt && <p className="text-[11px] text-muted-foreground">{format(new Date(loan.updatedAt), "d MMM", { locale })}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function LoansPage() {
  const { lang } = useI18n();
  const l = getL(lang);
  const params = useParams<{ id: string }>();

  const { data: loans, isLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"], refetchInterval: 8000, enabled: !params.id,
  });
  const { data: loanApplications } = useQuery<any[]>({
    queryKey: ["/api/loan-applications"], refetchInterval: 10000, enabled: !params.id,
  });

  if (params.id) return <LoanDetail loanId={params.id} />;

  const transfers    = loans?.filter(lo => !(lo as any).type || (lo as any).type === "transfer") ?? [];
  const requests     = loans?.filter(lo => (lo as any).type === "loan_request") ?? [];
  const actives      = loans?.filter(lo => (lo as any).type === "loan_active") ?? [];
  const pendingApps  = loanApplications?.filter(a => a.status === "pending") ?? [];
  const rejectedApps = loanApplications?.filter(a => a.status === "rejected") ?? [];

  const LOAN_TYPE_LABELS: Record<string, Record<string, string>> = {
    immo:    { fr: "Prêt immobilier", de: "Immobilienkredit", en: "Mortgage loan", it: "Prestito immobiliare" },
    conso:   { fr: "Prêt consommation", de: "Konsumkredit", en: "Consumer loan", it: "Prestito al consumo" },
    auto:    { fr: "Prêt automobile", de: "Autokredit", en: "Auto loan", it: "Prestito auto" },
    pro:     { fr: "Prêt professionnel", de: "Unternehmenskredit", en: "Business loan", it: "Prestito professionale" },
    travaux: { fr: "Prêt travaux", de: "Renovierungskredit", en: "Renovation loan", it: "Prestito lavori" },
  };
  const getLoanLabel = (type: string) => (LOAN_TYPE_LABELS[type]?.[getLang(lang)] || type);

  const getMonthsLabel = (duration: number) => {
    return `${duration} ${l.months}`;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 max-w-4xl mx-auto pb-20 md:pb-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">{l.my_files}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{l.my_files_sub}</p>
        </div>
        <a href="/loan-request">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--gold))]/10 border border-[hsl(var(--gold))]/30 text-[hsl(var(--gold))] text-xs font-semibold hover:bg-[hsl(var(--gold))]/20 transition-colors">
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{l.loan_request_btn}</span>
          </button>
        </a>
      </div>

      {(pendingApps.length > 0 || rejectedApps.length > 0) && (
        <div className="space-y-2">
          {pendingApps.map((app: any) => {
            const amtFmt = new Intl.NumberFormat("de-CH", { style: "currency", currency: app.currency, minimumFractionDigits: 2 }).format(app.amount);
            return (
              <div key={app.id} className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3 sm:p-4">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0"><Lock className="w-4 h-4 text-amber-500" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{l.pending_title}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{getLoanLabel(app.loanType)} · {amtFmt} · {getMonthsLabel(app.duration)}</p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-500/70 mt-1">{l.pending_sub}</p>
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300">{l.pending_badge}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {rejectedApps.map((app: any) => (
            <div key={app.id} className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3 sm:p-4">
              <div className="w-8 h-8 rounded-full bg-red-400/20 flex items-center justify-center flex-shrink-0"><X className="w-4 h-4 text-red-500" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">{l.rejected_title}</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{getLoanLabel(app.loanType)}</p>
                {app.adminNote && <p className="text-xs text-red-600/80 dark:text-red-500/70 mt-1">{l.rejected_reason}{app.adminNote}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : !loans?.length && !pendingApps.length && !rejectedApps.length ? (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center"><TrendingUp className="w-8 h-8 text-muted-foreground/30" /></div>
          <p className="text-sm text-muted-foreground">{l.empty}</p>
          <a href="/loan-request"><button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[hsl(var(--gold))]/40 text-[hsl(var(--gold))] text-sm font-medium hover:bg-[hsl(var(--gold))]/10 transition-colors"><FileText className="w-4 h-4" />{l.empty_btn}</button></a>
        </div>
      ) : (
        <div className="space-y-6">
          {transfers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3"><Banknote className="w-4 h-4 text-[hsl(var(--gold))]" /><h2 className="text-sm font-semibold">{l.transfers_section}</h2><Badge variant="outline" className="text-[10px] px-1.5">{transfers.length}</Badge></div>
              <div className="space-y-3">{transfers.map(lo => <LoanCard key={lo.id} loan={lo} lang={lang} />)}</div>
            </section>
          )}
          {requests.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-blue-500" /><h2 className="text-sm font-semibold">{l.requests_section}</h2><Badge variant="outline" className="text-[10px] px-1.5">{requests.length}</Badge></div>
              <div className="space-y-3">{requests.map(lo => <LoanCard key={lo.id} loan={lo} lang={lang} />)}</div>
            </section>
          )}
          {actives.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-green-500" /><h2 className="text-sm font-semibold">{l.active_section}</h2><Badge variant="outline" className="text-[10px] px-1.5">{actives.length}</Badge></div>
              <div className="space-y-3">{actives.map(lo => <LoanCard key={lo.id} loan={lo} lang={lang} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}