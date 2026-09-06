import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Account, Transfer } from "@shared/schema";
import { ArrowUpRight, Send, CheckCircle2, ArrowRight, KeyRound, Flag } from "lucide-react";
import { format } from "date-fns";
import { fr, de as deDateLocale } from "date-fns/locale";
import { Link, useParams } from "wouter";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const { lang } = useI18n();
  const isDe = lang === "de";
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending:    { label: isDe ? "Ausstehend"     : "En attente",    variant: "secondary"   },
    processing: { label: isDe ? "In Bearbeitung" : "En traitement", variant: "default"     },
    completed:  { label: isDe ? "Abgeschlossen"  : "Complété",      variant: "secondary"   },
    blocked:    { label: isDe ? "Blockiert"       : "Bloqué",        variant: "destructive" },
    failed:     { label: isDe ? "Fehlgeschlagen" : "Échoué",        variant: "destructive" },
  };
  const c = config[status] || config.pending;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

function TransferTracker({ transferId }: { transferId: string }) {
  const { toast } = useToast();
  const { lang } = useI18n();
  const isDe = lang === "de";
  const locale = isDe ? deDateLocale : fr;
  const [otpValue, setOtpValue] = useState("");

  const { data: transfer, isLoading } = useQuery<Transfer>({
    queryKey: ["/api/transfers", transferId],
    refetchInterval: 3000,
    queryFn: async () => {
      const res = await fetch(`/api/transfers/${transferId}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const validateOtp = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/transfers/${transferId}/validate-otp`, { otp: otpValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers", transferId] });
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      toast({
        title: isDe ? "Code bestätigt" : "Code validé",
        description: isDe ? "Der Validierungscode wurde akzeptiert" : "Le code de validation a été accepté",
      });
      setOtpValue("");
    },
    onError: (err: any) => {
      toast({ title: isDe ? "Fehler" : "Erreur", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!transfer) {
    return <p className="text-center text-muted-foreground p-8">{isDe ? "Überweisung nicht gefunden" : "Transfert introuvable"}</p>;
  }

  // Only show Finalisation step (removed: Création, Vérification interne, Traitement)
  const steps = isDe
    ? ["Abschluss"]
    : ["Finalisation"];

  // Finalisation is active/completed based on otpValidated
  const finalisationCompleted = transfer.otpValidated;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/transfers">
            <Button variant="ghost" size="sm" className="mb-2" data-testid="button-back-transfers">
              ← {isDe ? "Zurück" : "Retour"}
            </Button>
          </Link>
          <h2 className="text-xl font-bold" data-testid="text-tracker-title">
            {isDe ? "Überweisungsverfolgung" : "Suivi du transfert"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isDe ? "An" : "Vers"} {transfer.recipientName} — {formatCurrency(transfer.amount, transfer.currency)}
          </p>
        </div>
        <StatusBadge status={transfer.status} />
      </div>

      {/* ── Steps card — Finalisation uniquement ── */}
      <Card>
        <CardHeader className="pb-2">
          <span className="text-sm font-medium">{isDe ? "Etappe" : "Étape"}</span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {steps.map((label, i) => {
              const isCompleted = finalisationCompleted;
              const isActive = !isCompleted;
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted ? "bg-green-500 text-white" : isActive ? "bg-gold text-[hsl(222,40%,10%)]" : "bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Flag className="w-4 h-4" />}
                  </div>
                  <p className="text-sm font-semibold">{label}</p>
                </div>
              );
            })}
          </div>

          {/* CTA text + Continuer button */}
          {!finalisationCompleted && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                {isDe ? "Führen Sie die Validierung des letzten Schritts durch" : "Procéder à la validation de la dernière étape"}
              </p>
              <Link href={`/transfers/${transfer.id}/finalization`}>
                <Button size="sm" className="gap-1.5 flex-shrink-0" data-testid="button-go-finalization">
                  {isDe ? "Weiter" : "Continuer"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Détails du transfert ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
              {isDe ? "Überweisungsdetails" : "Détails du transfert"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isDe ? "Empfänger" : "Bénéficiaire"}</span>
              <span className="font-medium">{transfer.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IBAN</span>
              <span className="font-mono text-xs">{transfer.recipientIban}</span>
            </div>
            {transfer.recipientBank && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isDe ? "Bank" : "Banque"}</span>
                <span>{transfer.recipientBank}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isDe ? "Betrag" : "Montant"}</span>
              <span className="font-bold text-gold">{formatCurrency(transfer.amount, transfer.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isDe ? "Art" : "Type"}</span>
              <span>{transfer.isInternational ? "International" : (isDe ? "National" : "National")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isDe ? "Datum" : "Date"}</span>
              <span>{transfer.createdAt ? format(new Date(transfer.createdAt), "d MMM yyyy HH:mm", { locale }) : ""}</span>
            </div>
          </div>

          {/* Option de modification en cas d'erreur */}
          <div className="pt-3 border-t flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground italic">
              {isDe ? "Fehler in den Informationen? Sie können die Angaben ändern." : "Une erreur dans les informations ? Vous pouvez modifier les détails."}
            </p>
            <Link href={`/transfers/${transfer.id}`}>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-gold/40 text-gold hover:bg-gold/10 flex-shrink-0" data-testid="button-modify-transfer">
                ✏️ {isDe ? "Ändern" : "Modifier"}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── OTP validation if blocked ── */}
      {transfer.status === "blocked" && !transfer.otpValidated && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <KeyRound className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{isDe ? "Code-Validierung" : "Validation par code"}</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isDe ? "Bitte geben Sie den per SMS oder E-Mail erhaltenen Validierungscode ein" : "Veuillez saisir le code de validation reçu par SMS ou email"}
            </p>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue} data-testid="input-otp">
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="w-full" onClick={() => validateOtp.mutate()} disabled={otpValue.length < 6 || validateOtp.isPending} data-testid="button-validate-otp">
              {validateOtp.isPending ? (isDe ? "Wird validiert..." : "Validation...") : (isDe ? "Code bestätigen" : "Valider le code")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NewTransferForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { lang, t } = useI18n();
  const isDe = lang === "de";
  const [isInternational, setIsInternational] = useState(false);
  const { data: accounts } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });
  const [form, setForm] = useState({ fromAccountId: "", recipientName: "", recipientIban: "", recipientBank: "", amount: "", currency: "CHF" });

  /* Map account type to i18n label */
  const getAccountLabel = (account: Account) => {
    const typeLabels: Record<string, string> = {
      main: t("acc_name_main"),
      savings: t("acc_name_savings"),
      joint: t("acc_name_joint"),
      child: t("acc_name_child"),
    };
    const label = typeLabels[(account as any).type] || account.name;
    return `${label} — ${formatCurrency(account.balance, account.currency)}`;
  };

  const createTransfer = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/transfers", { ...form, amount: parseFloat(form.amount), isInternational, userId: "" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: t("tr_sent"),
        description: t("tr_sent_desc"),
      });
      onSuccess();
    },
    onError: (err: any) => {
      toast({ title: t("error"), description: err.message, variant: "destructive" });
    },
  });

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); createTransfer.mutate(); }}>
      <div className="space-y-2">
        <Label>{isDe ? "Quellkonto" : "Compte source"}</Label>
        <Select value={form.fromAccountId} onValueChange={(v) => setForm({ ...form, fromAccountId: v })}>
          <SelectTrigger data-testid="select-from-account">
            <SelectValue placeholder={isDe ? "Konto auswählen" : "Sélectionner un compte"} />
          </SelectTrigger>
          <SelectContent>
            {accounts?.map((a) => (
              <SelectItem key={a.id} value={a.id}>{getAccountLabel(a)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label>{isDe ? "Internationale Überweisung" : "Transfert international"}</Label>
        <Switch checked={isInternational} onCheckedChange={setIsInternational} data-testid="switch-international" />
      </div>

      <div className="space-y-2">
        <Label>{isDe ? "Name des Empfängers" : "Nom du destinataire"}</Label>
        <Input value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} placeholder={isDe ? "Vollständiger Name" : "Nom complet"} required data-testid="input-recipient-name" />
      </div>

      <div className="space-y-2">
        <Label>IBAN</Label>
        <Input value={form.recipientIban} onChange={(e) => setForm({ ...form, recipientIban: e.target.value })} placeholder="CHxx xxxx xxxx xxxx xxxx x" required data-testid="input-recipient-iban" />
      </div>

      {isInternational && (
        <>
          <div className="space-y-2">
            <Label>{isDe ? "Bank" : "Banque"}</Label>
            <Input value={form.recipientBank} onChange={(e) => setForm({ ...form, recipientBank: e.target.value })} placeholder={isDe ? "Bankname" : "Nom de la banque"} data-testid="input-recipient-bank" />
          </div>
          <div className="space-y-2">
            <Label>{isDe ? "Währung" : "Devise"}</Label>
            <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CHF">CHF — {isDe ? "Schweizer Franken" : "Franc suisse"}</SelectItem>
                <SelectItem value="EUR">EUR — Euro</SelectItem>
                <SelectItem value="USD">USD — {isDe ? "US-Dollar" : "Dollar US"}</SelectItem>
                <SelectItem value="GBP">GBP — {isDe ? "Britisches Pfund" : "Livre sterling"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>{isDe ? "Betrag" : "Montant"}</Label>
        <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="1000.00" required data-testid="input-amount" />
      </div>

      <Button type="submit" className="w-full" disabled={createTransfer.isPending} data-testid="button-send-transfer">
        <Send className="w-4 h-4 mr-2" />
        {createTransfer.isPending ? (isDe ? "Wird gesendet..." : "Envoi en cours...") : (isDe ? "Überweisung senden" : "Envoyer le virement")}
      </Button>
    </form>
  );
}

export default function TransfersPage() {
  const { lang, t } = useI18n();
  const isDe = lang === "de";
  const [showForm, setShowForm] = useState(false);
  const params = useParams<{ id: string }>();

  const { data: transfers, isLoading } = useQuery<Transfer[]>({
    queryKey: ["/api/transfers"],
    enabled: !params.id,
  });

  if (params.id) return <TransferTracker transferId={params.id} />;

  const pendingTransfers = transfers?.filter(t => t.status === "pending" || t.status === "processing" || t.status === "blocked") || [];
  const completedTransfers = transfers?.filter(t => t.status === "completed" || t.status === "failed") || [];

  const TransferRow = ({ t: tf }: { t: Transfer }) => (
    <div className="flex items-center justify-between gap-3 p-3 rounded-md hover-elevate" data-testid={`row-transfer-${tf.id}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gold/10 flex-shrink-0">
          <Send className="w-4 h-4 text-gold" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{tf.recipientName}</p>
          <div className="flex items-center gap-2">
            <StatusBadge status={tf.status} />
            <span className="text-xs text-muted-foreground">{tf.createdAt ? format(new Date(tf.createdAt), "d MMM") : ""}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-semibold">{formatCurrency(tf.amount, tf.currency)}</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-transfers-title">{isDe ? "Überweisungen" : "Virements"}</h1>
          <p className="text-sm text-muted-foreground">{isDe ? "Verwalten Sie Ihre Geldtransfers" : "Gérez vos transferts d'argent"}</p>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="button-new-transfer">
          <ArrowUpRight className="w-4 h-4 mr-2" />
          {isDe ? "Neue Überweisung" : "Nouveau virement"}
        </Button>
      </div>

      {/* ── New transfer dialog ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isDe ? "Neue Überweisung" : "Nouveau virement"}</DialogTitle>
          </DialogHeader>
          <NewTransferForm onSuccess={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      {/* ── Historique section ── */}
      <div className="space-y-5">
        <h2 className="text-base font-semibold">{isDe ? "Überweisungshistorie" : "Historique"}</h2>

        {/* Virements en attente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <span className="text-sm font-medium">{isDe ? "Ausstehende Überweisungen" : "Virements en attente"}</span>
            <Badge variant="secondary">{pendingTransfers.length}</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : pendingTransfers.length > 0 ? (
              <div className="space-y-1">
                {pendingTransfers.map((tf) => (
                  <div key={tf.id} className="space-y-1">
                    <Link href={`/transfers/${tf.id}`}>
                      <TransferRow t={tf} />
                    </Link>
                    <div className="pl-3 pb-1">
                      <Link href={`/transfers/${tf.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-gold/40 text-gold hover:bg-gold/10" data-testid={`button-track-${tf.id}`}>
                          <ArrowRight className="w-3 h-3" />
                          {isDe ? "Überweisung verfolgen" : "Suivre le virement"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">{isDe ? "Keine ausstehenden Überweisungen" : "Aucun virement en attente"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Virements effectués */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <span className="text-sm font-medium">{isDe ? "Abgeschlossene Überweisungen" : "Virements effectués"}</span>
            <Badge variant="secondary">{completedTransfers.length}</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : completedTransfers.length > 0 ? (
              <div className="space-y-1">
                {completedTransfers.map((tf) => (
                  <Link key={tf.id} href={`/transfers/${tf.id}`}>
                    <TransferRow t={tf} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Send className="w-8 h-8 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{isDe ? "Keine abgeschlossenen Überweisungen" : "Aucun virement effectué"}</p>
                <Button variant="secondary" className="mt-4" onClick={() => setShowForm(true)}>
                  {isDe ? "Überweisung durchführen" : "Effectuer un virement"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { TransferTracker };
