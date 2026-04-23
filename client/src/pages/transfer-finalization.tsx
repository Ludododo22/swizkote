import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Transfer } from "@shared/schema";
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  MessageCircle,
  X,
  ArrowLeft,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { fr, de as deDateLocale, it, enGB } from "date-fns/locale";

/* ────────────────────────────────────────────────────────────────
   Currency formatter
──────────────────────────────────────────────────────────────── */
function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/* ────────────────────────────────────────────────────────────────
   Floating Chat Widget (self-contained copy for this page)
──────────────────────────────────────────────────────────────── */
function ChatWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "agent", text: t("chat_welcome") },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input.trim() }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "agent",
          text: t("chat_welcome").includes("Bonjour")
            ? "Merci pour votre message. Un conseiller vous répondra dans les plus brefs délais."
            : t("chat_welcome").includes("Guten")
            ? "Danke für Ihre Nachricht. Ein Berater wird Ihnen so bald wie möglich antworten."
            : t("chat_welcome").includes("Ciao")
            ? "Grazie per il tuo messaggio. Un consulente ti risponderà al più presto."
            : "Thank you for your message. An advisor will respond as soon as possible.",
        },
      ]);
    }, 1200);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gold text-[hsl(222,40%,10%)] px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold text-sm"
        data-testid="button-chat-finalization"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">{t("chat_title")}</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[min(360px,calc(100vw-2rem))] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "min(480px, 80dvh)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[hsl(222,40%,10%)] border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t("chat_title")}</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  {t("chat_online")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    m.from === "user"
                      ? "bg-gold text-[hsl(222,40%,10%)] font-medium rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t flex gap-2 bg-background">
            <input
              className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gold/50"
              placeholder={t("chat_placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              className="flex-shrink-0 w-9 h-9 rounded-lg bg-gold text-[hsl(222,40%,10%)] flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
   Instructions Popup (appears on load & refresh, hides on success)
──────────────────────────────────────────────────────────────── */
interface InstructionsPopupProps {
  onClose: () => void;
}
function InstructionsPopup({ onClose }: InstructionsPopupProps) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
      <div className="bg-card border border-gold/40 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-gold via-yellow-400 to-gold" />

        <div className="p-6 space-y-4">
          {/* Icon + title */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">{t("fin_popup_title")}</h2>
            </div>
          </div>

          {/* Body */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("fin_popup_body")}
          </p>

          {/* Steps instruction */}
          <div className="bg-muted/60 rounded-lg p-3 border border-border/50">
            <p className="text-xs font-semibold text-gold mb-1">📋 Étapes à suivre</p>
            <p className="text-xs text-foreground leading-relaxed">{t("fin_popup_instruction")}</p>
          </div>

          {/* Chat hint */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-500/5 border border-blue-500/20 rounded-lg p-2.5">
            <MessageCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span>{t("fin_chat_hint")}</span>
          </div>

          {/* Close button */}
          <Button
            className="w-full"
            onClick={onClose}
            data-testid="button-close-instructions"
          >
            {t("fin_popup_close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Success Popup
──────────────────────────────────────────────────────────────── */
function SuccessPopup({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
      <div className="bg-card border border-green-500/40 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500" />
        <div className="p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-base font-bold">{t("fin_success_title")}</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {t("fin_success_body")}
            </p>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Error Popup
──────────────────────────────────────────────────────────────── */
function ErrorPopup({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-300">
      <div className="bg-card border border-red-500/40 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-400 to-red-500" />
        <div className="p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-bold">{t("fin_error_title")}</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {t("fin_error_body")}
            </p>
          </div>
          <Button variant="destructive" className="w-full" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Animated Progress Bar
──────────────────────────────────────────────────────────────── */
interface ProgressBarProps {
  value: number; // 0-100
  validated: boolean;
}

function AnimatedProgressBar({ value, validated }: ProgressBarProps) {
  const barColor = validated
    ? "linear-gradient(90deg, #22c55e, #16a34a)"
    : "linear-gradient(90deg, hsl(var(--gold)), hsl(42 70% 40%))";

  return (
    <div className="w-full h-4 bg-muted rounded-full overflow-hidden relative">
      <div
        className="h-full rounded-full transition-all ease-out"
        style={{
          width: `${value}%`,
          background: barColor,
          transitionDuration: value === 0 ? "0ms" : "900ms",
        }}
      />
      {/* Shimmer effect while animating */}
      {!validated && value > 0 && value < 100 && (
        <div
          className="absolute inset-0 rounded-full opacity-40"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
            animation: "shimmer 1.8s infinite",
            backgroundSize: "200% 100%",
          }}
        />
      )}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Main Finalization Page
──────────────────────────────────────────────────────────────── */
export default function TransferFinalizationPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useI18n();
  const { toast } = useToast();

  /* date-fns locale */
  const dateLocale =
    lang === "de" ? deDateLocale : lang === "it" ? it : lang === "en" ? enGB : fr;

  /* Progress animation state */
  const [displayProgress, setDisplayProgress] = useState(0);
  const [progressPhase, setProgressPhase] = useState<"idle" | "loading" | "stopped" | "completing" | "done">("idle");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [validated, setValidated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Fetch transfer data */
  const { data: transfer, isLoading } = useQuery<Transfer>({
    queryKey: ["/api/transfers", id],
    queryFn: async () => {
      const res = await fetch(`/api/transfers/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!id,
  });

  /* Start progress animation on mount / page refresh */
  useEffect(() => {
    if (progressPhase !== "idle") return;
    setProgressPhase("loading");
    setDisplayProgress(0);

    let current = 0;
    const target = 80;
    const step = 0.8; // % per tick
    const interval = 40; // ms per tick => ~3.6s to reach 80%

    progressRef.current = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplayProgress(Math.round(current));
      if (current >= target) {
        clearInterval(progressRef.current!);
        setProgressPhase("stopped");
        setShowInstructions(true); // trigger popup at 80%
      }
    }, interval);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  /* Validate OTP mutation */
  const validateOtp = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/transfers/${id}/validate-otp`, {
        otp: codeInput,
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      setValidated(true);
      setProgressPhase("completing");

      /* Animate from 80% → 100% */
      let current = 80;
      const completeInterval = setInterval(() => {
        current = Math.min(current + 1, 100);
        setDisplayProgress(current);
        if (current >= 100) {
          clearInterval(completeInterval);
          setProgressPhase("done");
          setTimeout(() => setShowSuccess(true), 300);
        }
      }, 25);
    },
    onError: (err: any) => {
      setShowError(true);
      setCodeInput("");
    },
  });

  const handleValidate = () => {
    if (!codeInput.trim()) return;
    validateOtp.mutate();
  };

  /* Only Finalisation step is shown */
  const finLabel = lang === "de" ? "Abschluss" : lang === "en" ? "Finalization" : lang === "it" ? "Finalizzazione" : "Finalisation";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      {/* ── Popups ── */}
      {showInstructions && !validated && (
        <InstructionsPopup onClose={() => setShowInstructions(false)} />
      )}
      {showSuccess && (
        <SuccessPopup onClose={() => setShowSuccess(false)} />
      )}
      {showError && (
        <ErrorPopup onClose={() => setShowError(false)} />
      )}

      {/* ── Header ── */}
      <div>
        <Link href={`/transfers/${id}`}>
          <Button variant="ghost" size="sm" className="mb-3 gap-1.5" data-testid="button-back-finalization">
            <ArrowLeft className="w-4 h-4" />
            {t("fin_back")}
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{t("fin_title")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("fin_subtitle")}</p>
          </div>
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-gold" />
          </div>
        </div>
      </div>

      {/* ── Transfer summary strip ── */}
      {transfer && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/40 rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold">{transfer.recipientName}</p>
              <p className="text-xs text-muted-foreground font-mono">{transfer.recipientIban}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-base font-bold text-gold">
              {formatCurrency(transfer.amount, transfer.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              {transfer.createdAt
                ? format(new Date(transfer.createdAt), "d MMM yyyy", { locale: dateLocale })
                : ""}
            </p>
          </div>
        </div>
      )}

      {/* ── Étape Finalisation uniquement ── */}
      <Card>
        <CardHeader className="pb-3">
          <span className="text-sm font-semibold">{lang === "de" ? "Etappe" : "Étape"}</span>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single step: Finalisation */}
          <div className="flex items-center gap-4">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              validated ? "bg-green-500 text-white" : "bg-gold text-[hsl(222,40%,10%)]"
            }`}>
              {validated
                ? <CheckCircle2 className="w-5 h-5" />
                : <ShieldCheck className="w-5 h-5" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold">{finLabel}</p>
              <p className="text-xs text-muted-foreground">
                {validated
                  ? (lang === "de" ? "Abgeschlossen" : "Complétée")
                  : (lang === "de" ? "Validierung erforderlich" : "Validation requise")
                }
              </p>
            </div>
          </div>

          {/* Status message */}
          {validated && (
            <div className="flex items-center gap-2 text-xs text-green-500 bg-green-500/10 rounded-lg p-2.5 border border-green-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{t("fin_success_title")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Code validation card (hidden after success) ── */}
      {!validated && (
        <Card className="border-gold/30">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t("fin_code_label")}</p>
              <p className="text-xs text-muted-foreground">{t("fin_waiting_code")}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Instructions reminder */}
            <div className="bg-muted/50 rounded-lg p-3 border border-border/50 space-y-1">
              <p className="text-xs font-medium text-foreground">
                {t("fin_popup_instruction")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validation-code">{t("fin_code_label")}</Label>
              <div className="flex gap-2">
                <Input
                  id="validation-code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder={t("fin_code_placeholder")}
                  className="font-mono tracking-widest text-center text-base"
                  onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                  data-testid="input-finalization-code"
                  disabled={progressPhase === "loading" || validateOtp.isPending}
                />
                <Button
                  onClick={handleValidate}
                  disabled={
                    !codeInput.trim() ||
                    progressPhase === "loading" ||
                    validateOtp.isPending
                  }
                  className="flex-shrink-0"
                  data-testid="button-finalization-submit"
                >
                  {validateOtp.isPending ? (
                    <>
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                      {t("fin_code_submitting")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {t("fin_code_submit")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Chat reminder */}
            <div
              className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              onClick={() =>
                document
                  .querySelector<HTMLButtonElement>("[data-testid='button-chat-finalization']")
                  ?.click()
              }
            >
              <MessageCircle className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span className="underline underline-offset-2">{t("fin_chat_hint")}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Transfer details (always visible) ── */}
      {transfer && (
        <Card>
          <CardHeader className="pb-2">
            <span className="text-sm font-medium">{t("tr_details")}</span>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tr_beneficiary")}</span>
                <span className="font-medium">{transfer.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IBAN</span>
                <span className="font-mono text-xs">{transfer.recipientIban}</span>
              </div>
              {transfer.recipientBank && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("tr_bank")}</span>
                  <span>{transfer.recipientBank}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("amount")}</span>
                <span className="font-bold text-gold">
                  {formatCurrency(transfer.amount, transfer.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tr_type")}</span>
                <span>
                  {transfer.isInternational ? t("tr_intl") : t("tr_local")}
                </span>
              </div>
            </div>

            {/* Option de modification */}
            <div className="mt-4 pt-3 border-t flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground italic">
                {lang === "de"
                  ? "Fehlerhafte Angaben? Sie können die Überweisungsdetails vor der Bestätigung ändern."
                  : lang === "en"
                  ? "Incorrect information? You can modify the transfer details before confirming."
                  : "Informations incorrectes ? Vous pouvez modifier les détails avant de confirmer."
                }
              </p>
              <Link href={`/transfers/${id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5 border-gold/40 text-gold hover:bg-gold/10 flex-shrink-0"
                  data-testid="button-modify-finalization"
                >
                  ✏️ {lang === "de" ? "Ändern" : lang === "en" ? "Modify" : "Modifier"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Floating Chat ── */}
      <ChatWidget />
    </div>
  );
}
