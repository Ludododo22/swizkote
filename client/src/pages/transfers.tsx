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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Account, Transfer } from "@shared/schema";
import { ArrowUpRight, Send, CheckCircle2, AlertTriangle, ArrowRight, KeyRound } from "lucide-react";
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

  const steps = isDe
    ? [{ label: "Erstellung", threshold: 0 }, { label: "Prüfung", threshold: 25 }, { label: "Bearbeitung", threshold: 50 }, { label: "Validierung", threshold: 75 }, { label: "Abschluss", threshold: 100 }]
    : [{ label: "Création", threshold: 0 }, { label: "Vérification", threshold: 25 }, { label: "Traitement", threshold: 50 }, { label: "Validation", threshold: 75 }, { label: "Finalisation", threshold: 100 }];

  const currentStep = steps.filter((s) => transfer.progress >= s.threshold).length - 1;

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

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{isDe ? "Fortschritt" : "Progression"}</span>
            <span className="text-sm font-bold text-gold">{transfer.progress}%</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={transfer.progress} className="h-3" data-testid="progress-transfer" />
          <div className="grid grid-cols-5 gap-1">
            {steps.map((step, i) => (
              <div key={step.label} className="text-center">
                <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1 ${i <= currentStep ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">{step.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {transfer.adminMessage && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertTriangle className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{isDe ? "Nachricht des Administrators" : "Message administrateur"}</span>
          </CardHeader>
          <CardContent>
            <p className="text-sm" data-testid="text-admin-message">{transfer.adminMessage}</p>
          </CardContent>
        </Card>
      )}

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

      <Card>
        <CardHeader className="pb-2">
          <span className="text-sm font-medium">{isDe ? "Überweisungsdetails" : "Détails du transfert"}</span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isDe ? "Empfänger" : "Destinataire"}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}

function NewTransferForm({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const { lang } = useI18n();
  const isDe = lang === "de";
  const [isInternational, setIsInternational] = useState(false);
  const { data: accounts } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });
  const [form, setForm] = useState({ fromAccountId: "", recipientName: "", recipientIban: "", recipientBank: "", amount: "", currency: "CHF" });

  const createTransfer = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/transfers", { ...form, amount: parseFloat(form.amount), isInternational, userId: "" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: isDe ? "Überweisung eingeleitet" : "Transfert initié",
        description: isDe ? "Ihre Überweisung wurde erfolgreich erstellt" : "Votre transfert a été créé avec succès",
      });
      onSuccess();
    },
    onError: (err: any) => {
      toast({ title: isDe ? "Fehler" : "Erreur", description: err.message, variant: "destructive" });
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
              <SelectItem key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance, a.currency)}</SelectItem>
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
  const { lang } = useI18n();
  const isDe = lang === "de";
  const [showForm, setShowForm] = useState(false);
  const params = useParams<{ id: string }>();

  const { data: transfers, isLoading } = useQuery<Transfer[]>({
    queryKey: ["/api/transfers"],
    enabled: !params.id,
  });

  if (params.id) return <TransferTracker transferId={params.id} />;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
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

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isDe ? "Neue Überweisung" : "Nouveau virement"}</DialogTitle>
          </DialogHeader>
          <NewTransferForm onSuccess={() => setShowForm(false)} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <span className="text-sm font-medium">{isDe ? "Überweisungshistorie" : "Historique des virements"}</span>
          <Badge variant="secondary">{transfers?.length || 0}</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : transfers && transfers.length > 0 ? (
            <div className="space-y-1">
              {transfers.map((t) => (
                <Link key={t.id} href={`/transfers/${t.id}`}>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-md hover-elevate cursor-pointer" data-testid={`row-transfer-${t.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gold/10 flex-shrink-0">
                        <Send className="w-4 h-4 text-gold" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.recipientName}</p>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.status} />
                          <span className="text-xs text-muted-foreground">{t.createdAt ? format(new Date(t.createdAt), "d MMM") : ""}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold">{formatCurrency(t.amount, t.currency)}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Send className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">{isDe ? "Keine Überweisungen durchgeführt" : "Aucun virement effectué"}</p>
              <Button variant="secondary" className="mt-4" onClick={() => setShowForm(true)}>
                {isDe ? "Überweisung durchführen" : "Effectuer un virement"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { TransferTracker };
