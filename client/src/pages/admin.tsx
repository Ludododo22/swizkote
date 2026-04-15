import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Transfer, Message, Loan, LoanStep, Account, Transaction } from "@shared/schema";
import {
  Users, ArrowLeftRight, Send, KeyRound, CheckCircle2, AlertTriangle,
  Copy, MessageSquare, Shield, UserPlus, TrendingUp, ChevronDown, ChevronUp,
  Lock, Unlock, Play, Eye, EyeOff, Loader2, FileDown, FileSignature,
  Banknote, ReceiptText, Receipt, ScrollText, XCircle, BarChart3,
  CreditCard, PlusCircle, MinusCircle, Wallet, Activity, RefreshCw,
  Edit2, Trash2, Building2, Check, X, FileText, DollarSign, ChevronRight,
  CircleDashed, BadgeCheck, Info, PenLine,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

// ─── CREATE CLIENT ────────────────────────────────────────────────────────────
function AdminCreateClient() {
  const { toast } = useToast();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [credentials, setCredentials] = useState<{ username: string; plainPassword: string; email: string; fullName: string; clientId?: string; iban?: string } | null>(null);
  const [showPass, setShowPass] = useState(false);

  const createClient = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/clients", form);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setCredentials({ username: data.username, plainPassword: data.plainPassword, email: data.email, fullName: data.fullName, clientId: data.clientId, iban: data.iban });
      setForm({ fullName: "", email: "", phone: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
      toast({ title: "Compte créé avec succès", variant: "default" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">Créer un compte client</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Nom complet *</Label>
            <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Jean Dupont" />
          </div>
          <div className="space-y-1">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jean.dupont@email.com" />
          </div>
          <div className="space-y-1">
            <Label>Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+41 79 000 00 00" />
          </div>
          <p className="text-xs text-muted-foreground">L'identifiant et le mot de passe seront générés automatiquement.</p>
          <Button
            className="w-full"
            onClick={() => createClient.mutate()}
            disabled={!form.fullName || !form.email || createClient.isPending}
          >
            {createClient.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Créer le compte
          </Button>
        </CardContent>
      </Card>

      {credentials && (
        <Card className="border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Compte créé — Identifiants à communiquer</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">✉️ Un email avec le contrat PDF a été envoyé automatiquement au client.</p>
            <div className="rounded-lg bg-background border p-3 space-y-2 font-mono text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Client</span>
                <span className="font-semibold">{credentials.fullName}</span>
              </div>
              {credentials.clientId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">ID Client</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gold">{credentials.clientId}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(credentials.clientId!); toast({ title: "ID copié !" }); }}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Email</span>
                <span>{credentials.email}</span>
              </div>
              {credentials.iban && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-xs">IBAN</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{credentials.iban}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(credentials.iban!); toast({ title: "IBAN copié !" }); }}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Identifiant</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{credentials.username}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(credentials.username); toast({ title: "Copié !" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Mot de passe</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-wider">{showPass ? credentials.plainPassword : "••••••••••"}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(credentials.plainPassword); toast({ title: "Mot de passe copié" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full text-xs" onClick={() => {
              const text = `Bienvenue chez SwizKote Bank !\n\nID Client : ${credentials.clientId || ""}\nIBAN : ${credentials.iban || ""}\nIdentifiant : ${credentials.username}\nMot de passe : ${credentials.plainPassword}\n\nConnectez-vous sur notre plateforme et changez votre mot de passe dès que possible.`;
              navigator.clipboard.writeText(text);
              toast({ title: "Message complet copié" });
            }}>
              <Copy className="w-3 h-3 mr-2" /> Copier le message complet
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── CLIENTS LIST ────────────────────────────────────────────────────────────
function AdminClients() {
  const { toast } = useToast();
  const { data: clients, isLoading } = useQuery<User[]>({ queryKey: ["/api/admin/clients"] });
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [sendingContract, setSendingContract] = useState<string | null>(null);
  const [regenCreds, setRegenCreds] = useState<string | null>(null);
  const [newCreds, setNewCreds] = useState<{ username: string; newPassword: string; clientId: string } | null>(null);

  const sendContract = async (client: User) => {
    setSendingContract(client.id);
    try {
      const res = await apiRequest("POST", `/api/admin/clients/${client.id}/send-contract`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast({ title: "Contrat envoyé ✓", description: `Email envoyé à ${data.sentTo}` });
    } catch (err: any) {
      toast({ title: "Erreur envoi", description: err.message, variant: "destructive" });
    } finally {
      setSendingContract(null);
    }
  };

  const generateCreds = async (client: User) => {
    setRegenCreds(client.id);
    try {
      const res = await apiRequest("POST", `/api/admin/clients/${client.id}/generate-credentials`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setNewCreds({ username: data.username, newPassword: data.newPassword, clientId: data.clientId });
      toast({ title: "Identifiants régénérés ✓", description: `Envoyés à ${data.sentTo}` });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setRegenCreds(null);
    }
  };

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  return (
    <div className="space-y-3">
      {newCreds && (
        <Card className="border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Nouveaux identifiants générés et envoyés par email
            </div>
            <div className="rounded-lg bg-background border p-3 font-mono text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground text-xs">ID Client</span><span className="font-bold text-gold">{newCreds.clientId}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-xs">Login</span><span>{newCreds.username}</span></div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">Mot de passe</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{newCreds.newPassword}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(newCreds.newPassword); toast({ title: "Copié" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setNewCreds(null)}>Fermer</Button>
          </CardContent>
        </Card>
      )}

      {clients?.filter(c => c.role === "client").map((client) => {
        const initials = client.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
        const clientId = `SK-${client.id.slice(0, 6).toUpperCase()}`;
        return (
          <Card key={client.id} className="hover:border-gold/30 transition-colors">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gold/20 text-gold text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{client.fullName}</p>
                      <span className="text-xs text-gold font-mono bg-gold/10 px-2 py-0.5 rounded-full">{clientId}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{client.email} {client.phone ? `· ${client.phone}` : ""}</p>
                    <p className="text-xs text-muted-foreground">
                      @{client.username} · {client.createdAt ? format(new Date(client.createdAt), "d MMM yyyy", { locale: fr }) : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline" size="sm" className="text-xs gap-1 h-8"
                    onClick={() => sendContract(client)}
                    disabled={sendingContract === client.id}
                  >
                    {sendingContract === client.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <FileSignature className="w-3 h-3" />}
                    Envoyer contrat
                  </Button>
                  <Button
                    variant="outline" size="sm" className="text-xs gap-1 h-8"
                    onClick={() => generateCreds(client)}
                    disabled={regenCreds === client.id}
                  >
                    {regenCreds === client.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <KeyRound className="w-3 h-3" />}
                    Régén. identifiants
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="text-xs gap-1 h-8 text-muted-foreground"
                    onClick={() => { navigator.clipboard.writeText(clientId); toast({ title: `ID ${clientId} copié` }); }}
                  >
                    <Copy className="w-3 h-3" /> ID
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {(!clients || clients.filter(c => c.role === "client").length === 0) && (
        <p className="text-center text-sm text-muted-foreground py-8">Aucun client enregistré</p>
      )}
    </div>
  );
}

// ─── ADMIN LOANS ─────────────────────────────────────────────────────────────
type LoanWithUser = Loan & { user: { fullName: string; email: string } | null };

const LOAN_STEP_TYPES = [
  { key: "reception",     label: "Réception du dossier",         desc: "Votre demande de prêt a été reçue et enregistrée dans notre système." },
  { key: "etude",         label: "Étude du dossier",             desc: "Analyse de votre capacité de remboursement et de vos garanties." },
  { key: "caution",       label: "Frais de caution",             desc: "Paiement des frais de caution requis pour débloquer l'étape suivante." },
  { key: "assurance",     label: "Frais d'assurance",            desc: "Paiement des frais d'assurance emprunteur obligatoire." },
  { key: "legalisation",  label: "Frais de légalisation",        desc: "Paiement des frais de légalisation et authentification notariale." },
  { key: "validation",    label: "Validation bancaire",          desc: "Validation finale du dossier par le comité de crédit." },
  { key: "signature",     label: "Signature du contrat",         desc: "Signature électronique du contrat de prêt." },
  { key: "deblocage",     label: "Déblocage des fonds",          desc: "Virement des fonds sur le compte du bénéficiaire." },
];

function StepStatusDot({ status }: { status: string }) {
  if (status === "completed")     return <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-3 h-3 text-white" /></div>;
  if (status === "code_required") return <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 animate-pulse"><Lock className="w-3 h-3 text-white" /></div>;
  if (status === "active")        return <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-white" /></div>;
  return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />;
}

function LoanStepAdminRow({
  step, loanId, isLast, onRefresh,
}: {
  step: LoanStep; loanId: string; isLast: boolean; onRefresh: () => void;
}) {
  const { toast } = useToast();
  const [showCode, setShowCode]         = useState(false);
  const [generatedCode, setGeneratedCode] = useState(step.code || "");
  const [editingDesc, setEditingDesc]   = useState(false);
  const [descDraft, setDescDraft]       = useState(step.description || "");
  const [labelDraft, setLabelDraft]     = useState(step.label);
  const [showDisburse, setShowDisburse] = useState(false);
  const [disburseDesc, setDisburseDesc] = useState(`Décaissement prêt — virement des fonds`);
<<<<<<< HEAD
  const [showInterrupt, setShowInterrupt] = useState(false);
  const [interruptPct, setInterruptPct] = useState(50);
  const [interruptMsg, setInterruptMsg] = useState("");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210

  const statusColor: Record<string, string> = {
    completed:     "bg-green-500/10 border-green-300 dark:border-green-800",
    active:        "bg-blue-500/10 border-blue-300 dark:border-blue-800",
    code_required: "bg-amber-500/10 border-amber-300 dark:border-amber-800",
    pending:       "bg-muted/40 border-border",
  };
  const statusBadge: Record<string, string> = {
    completed: "text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-400",
    active: "text-blue-700 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400",
    code_required: "text-amber-700 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400",
    pending: "text-muted-foreground bg-muted",
  };
  const statusLabels: Record<string, string> = {
    completed: "Validé ✓", active: "En cours", code_required: "Code requis", pending: "En attente",
  };

  const advance = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/loans/${loanId}/steps/${step.id}/advance`);
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => { onRefresh(); toast({ title: "Étape validée ✓" }); },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const requireCode = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/loans/${loanId}/steps/${step.id}/require-code`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      setShowCode(true);
      onRefresh();
      toast({ title: "Code généré — à communiquer au client" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const removeCode = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/loans/${loanId}/steps/${step.id}/remove-code`);
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => { setGeneratedCode(""); onRefresh(); toast({ title: "Code retiré" }); },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const updateStep = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/admin/loans/${loanId}/steps/${step.id}`, { label: labelDraft, description: descDraft });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => { setEditingDesc(false); onRefresh(); toast({ title: "Étape mise à jour" }); },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const disburse = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/loans/${loanId}/disburse`, { description: disburseDesc });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      setShowDisburse(false);
      onRefresh();
      toast({ title: "Fonds virés avec succès ✓", description: "Le compte du client a été crédité." });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

<<<<<<< HEAD
  const setInterrupt = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/admin/loans/${loanId}/steps/${step.id}`, {
        interruptAt: interruptPct,
        additionalInfoMessage: interruptMsg || null,
        additionalInfoEnabled: !!interruptMsg,
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => { setShowInterrupt(false); onRefresh(); toast({ title: `Interruption à ${interruptPct}% configurée` }); },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
  const isPending = step.status === "pending";
  const isCompleted = step.status === "completed";
  const isCodeReq = step.status === "code_required";
  const isActive = step.status === "active";

  return (
    <div className={`rounded-xl border p-3.5 space-y-2.5 transition-colors ${statusColor[step.status]}`}>
      {/* Header row */}
      <div className="flex items-start gap-3">
        <StepStatusDot status={step.status} />
        <div className="flex-1 min-w-0">
          {editingDesc ? (
            <div className="space-y-2">
              <Input
                value={labelDraft}
                onChange={e => setLabelDraft(e.target.value)}
                className="text-sm font-semibold h-7 px-2"
                placeholder="Titre de l'étape"
              />
              <Textarea
                value={descDraft}
                onChange={e => setDescDraft(e.target.value)}
                className="text-xs min-h-[60px]"
                placeholder="Description visible par le client..."
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={() => updateStep.mutate()} disabled={updateStep.isPending}>
                  {updateStep.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}Enregistrer
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingDesc(false); setLabelDraft(step.label); setDescDraft(step.description || ""); }}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{step.label}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusBadge[step.status]}`}>
                  {statusLabels[step.status]}
                </span>
                {step.codeValidated && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-green-700 bg-green-100 dark:bg-green-900/40 dark:text-green-400">
                    Code validé ✓
                  </span>
                )}
              </div>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</p>
              )}
            </>
          )}
        </div>

        {/* Edit button */}
        {!isCompleted && !editingDesc && (
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => setEditingDesc(true)}>
            <PenLine className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Code display when code_required */}
      {isCodeReq && (step.code || generatedCode) && (
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg px-3 py-2">
          <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-700 dark:text-amber-400 mr-1">Code client :</span>
          <span className="font-mono font-bold tracking-[0.25em] text-amber-700 dark:text-amber-300 flex-1">
            {showCode ? (generatedCode || step.code) : "● ● ● ● ● ●"}
          </span>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowCode(v => !v)}>
            {showCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => {
            navigator.clipboard.writeText(generatedCode || step.code || "");
            toast({ title: "Code copié ✓" });
          }}>
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Action buttons */}
      {!isPending && !isCompleted && !editingDesc && (
        <div className="flex gap-2 flex-wrap">
          {isActive && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => requireCode.mutate()} disabled={requireCode.isPending}>
                {requireCode.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lock className="w-3 h-3" />}
                Exiger un code
              </Button>
<<<<<<< HEAD
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                onClick={() => setShowInterrupt(!showInterrupt)}>
                <CircleDashed className="w-3 h-3" />
                Interrompre à %
              </Button>
=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
              {!isLast && (
                <Button size="sm" className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
                  onClick={() => advance.mutate()} disabled={advance.isPending}>
                  {advance.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  Valider l'étape
                </Button>
              )}
              {isLast && (
                <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700 text-white border-0"
                  onClick={() => setShowDisburse(true)}>
                  <DollarSign className="w-3 h-3" />
                  Virer les fonds
                </Button>
              )}
            </>
          )}
          {isCodeReq && (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => removeCode.mutate()} disabled={removeCode.isPending}>
              {removeCode.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
              Retirer le code
            </Button>
          )}
        </div>
      )}

<<<<<<< HEAD
      {/* Interrupt at % panel */}
      {showInterrupt && (
        <div className="rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30 p-3.5 space-y-3">
          <div className="flex items-start gap-2">
            <CircleDashed className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-purple-800 dark:text-purple-300">Interruption conditionnelle</p>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
                Définissez un % auquel la barre de chargement s'arrêtera pour demander des informations complémentaires.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <Label className="text-xs text-purple-700 dark:text-purple-400">Arrêter la progression à :</Label>
              <span className="font-bold text-purple-700 dark:text-purple-300">{interruptPct}%</span>
            </div>
            <Slider
              value={[interruptPct]}
              onValueChange={([v]) => setInterruptPct(v)}
              min={10} max={90} step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>10%</span><span>50%</span><span>90%</span>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Message / Champ d'information au client (optionnel)</Label>
            <Textarea
              value={interruptMsg}
              onChange={e => setInterruptMsg(e.target.value)}
              placeholder="Ex: Veuillez fournir un justificatif de domicile récent (moins de 3 mois)..."
              rows={2}
              className="text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Si renseigné, un champ de saisie libre apparaîtra côté client pour sa réponse.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 h-8 text-xs gap-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
              onClick={() => setInterrupt.mutate()} disabled={setInterrupt.isPending}>
              {setInterrupt.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Appliquer l'interruption
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowInterrupt(false)}>Annuler</Button>
          </div>
        </div>
      )}

=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
      {/* Disburse confirmation panel */}
      {showDisburse && (
        <div className="rounded-xl border border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-3.5 space-y-3">
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Virement final des fonds</p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                Cette action créditera le compte principal du client et marquera toutes les étapes comme complètes.
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Libellé du virement</Label>
            <Input value={disburseDesc} onChange={e => setDisburseDesc(e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white border-0 gap-1"
              onClick={() => disburse.mutate()} disabled={disburse.isPending}>
              {disburse.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              Confirmer le virement
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowDisburse(false)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminLoans() {
  const { toast } = useToast();
  const [expandedLoan, setExpandedLoan]   = useState<string | null>(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [editNoteFor, setEditNoteFor]     = useState<string | null>(null);
  const [noteDraft, setNoteDraft]         = useState("");
  const [filterType, setFilterType]       = useState<string>("all");
  const [createForm, setCreateForm]       = useState({
    userId: "", label: "", amount: "", currency: "CHF", adminNote: "", type: "loan_request",
  });

  const { data: loans, isLoading, refetch } = useQuery<LoanWithUser[]>({ queryKey: ["/api/admin/loans"] });
  const { data: clients } = useQuery<User[]>({ queryKey: ["/api/admin/clients"] });
  const { data: steps, refetch: refetchSteps } = useQuery<LoanStep[]>({
    queryKey: ["/api/admin/loans", expandedLoan, "steps"],
    enabled: !!expandedLoan,
    queryFn: async () => {
      if (!expandedLoan) return [];
      const res = await fetch(`/api/admin/loans/${expandedLoan}/steps`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const createLoan = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/loans", {
        ...createForm, amount: parseFloat(createForm.amount),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (loan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loans"] });
      setCreateForm({ userId: "", label: "", amount: "", currency: "CHF", adminNote: "", type: "loan_request" });
      setShowCreate(false);
      setExpandedLoan(loan.id);
      toast({ title: "Dossier créé ✓" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const saveNote = useMutation({
    mutationFn: async (loanId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/loans/${loanId}`, { adminNote: noteDraft });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      refetch();
      setEditNoteFor(null);
      toast({ title: "Note mise à jour ✓" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const handleRefresh = () => { refetch(); if (expandedLoan) refetchSteps(); };

  const filteredLoans = loans?.filter(l =>
    filterType === "all" || (l as any).type === filterType
  ) ?? [];

  const typeCfg: Record<string, { icon: string; label: string; color: string; gradient: string }> = {
    loan_request: { icon: "📋", label: "Demande de prêt", color: "text-blue-600", gradient: "from-blue-600 to-indigo-600" },
    loan_active:  { icon: "📈", label: "Prêt en cours",   color: "text-green-600", gradient: "from-green-600 to-emerald-600" },
    transfer:     { icon: "💸", label: "Virement",         color: "text-gold",      gradient: "from-amber-500 to-yellow-500" },
  };

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex gap-2 flex-wrap">
        <Button className="flex-1 gap-2" onClick={() => setShowCreate(!showCreate)}>
          <FileText className="w-4 h-4" />
          Créer un dossier de prêt
        </Button>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les dossiers</SelectItem>
            <SelectItem value="loan_request">📋 Demandes de prêt</SelectItem>
            <SelectItem value="loan_active">📈 Prêts en cours</SelectItem>
            <SelectItem value="transfer">💸 Virements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">Nouveau dossier de demande de prêt</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="space-y-1">
              <Label>Client *</Label>
              <Select value={createForm.userId} onValueChange={(v) => setCreateForm({ ...createForm, userId: v })}>
                <SelectTrigger><SelectValue placeholder="Choisir un client" /></SelectTrigger>
                <SelectContent>
                  {clients?.filter(c => c.role === "client").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.fullName} — {c.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Type de dossier</Label>
              <Select value={createForm.type} onValueChange={(v) => setCreateForm({ ...createForm, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="loan_request">📋 Demande de prêt</SelectItem>
                  <SelectItem value="loan_active">📈 Prêt en cours</SelectItem>
                  <SelectItem value="transfer">💸 Virement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Objet du dossier *</Label>
              <Input value={createForm.label} onChange={e => setCreateForm({ ...createForm, label: e.target.value })}
                placeholder="Ex: Prêt immobilier CHF 250 000 — M. Dupont" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Montant *</Label>
                <Input type="number" value={createForm.amount} onChange={e => setCreateForm({ ...createForm, amount: e.target.value })} placeholder="250000" />
              </div>
              <div className="space-y-1">
                <Label>Devise</Label>
                <Select value={createForm.currency} onValueChange={(v) => setCreateForm({ ...createForm, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["CHF","EUR","USD","GBP"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Note initiale au client (optionnel)</Label>
              <Textarea value={createForm.adminNote} onChange={e => setCreateForm({ ...createForm, adminNote: e.target.value })}
                placeholder="Ex: Votre dossier est en cours d'instruction. Des justificatifs complémentaires pourront être demandés." rows={2} />
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3">
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Étapes générées automatiquement :</p>
              <p className="text-xs text-blue-600 dark:text-blue-500">
                {createForm.type === "loan_request"
                  ? "① Demande reçue → ② Étude du dossier → ③ Accord de principe → ④ Fonds débloqués"
                  : createForm.type === "loan_active"
                  ? "① Prêt activé → ② Remboursement en cours → ③ Mi-parcours → ④ Prêt soldé"
                  : "① Dossier reçu → ② Vérification → ③ Validation bancaire → ④ Virement envoyé"}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-600 mt-1 italic">
                Vous pourrez personnaliser le titre et la description de chaque étape après création.
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => createLoan.mutate()}
                disabled={!createForm.userId || !createForm.label || !createForm.amount || createLoan.isPending}>
                {createLoan.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Créer le dossier
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loans list */}
      <div className="space-y-3">
        {filteredLoans.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Aucun dossier de suivi</p>
        )}
        {filteredLoans.map((loan) => {
          const isExpanded = expandedLoan === loan.id;
          const loanSteps = isExpanded ? (steps ?? []) : [];
          const completedCount = loanSteps.filter(s => s.status === "completed").length;
          const totalCount = loanSteps.length || loan.totalSteps;
          const progress = totalCount > 1
            ? Math.round((completedCount / totalCount) * 100)
            : Math.round((loan.currentStep / Math.max(loan.totalSteps - 1, 1)) * 100);
          const cfg = typeCfg[(loan as any).type || "transfer"] || typeCfg.transfer;
          const hasCodeStep = loanSteps.some(s => s.status === "code_required");
          const isFinished = isExpanded ? completedCount === totalCount && totalCount > 0 : false;

          return (
            <Card key={loan.id} className={`overflow-hidden transition-all ${isExpanded ? "ring-1 ring-blue-300 dark:ring-blue-800" : ""}`}>
              {/* Loan header — always visible */}
              <div
                className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedLoan(isExpanded ? null : loan.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${cfg.gradient}`}>
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{loan.label}</p>
                      {hasCodeStep && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 animate-pulse">
                          Code en attente
                        </span>
                      )}
                      {isFinished && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                          Terminé ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{loan.user?.fullName || "—"} · {formatCurrency(loan.amount, loan.currency)} · {cfg.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-xs font-bold">{isExpanded ? `${completedCount}/${totalCount} étapes` : `${progress}%`}</span>
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-500`}
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3 space-y-4">
                  {/* Global progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progression globale</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-700`}
                        style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground">{completedCount}/{totalCount} étapes validées</p>
                  </div>

                  {/* Admin note section */}
                  <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold">Note admin (visible du client)</span>
                      </div>
                      {editNoteFor !== loan.id && (
                        <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 px-2"
                          onClick={() => { setEditNoteFor(loan.id); setNoteDraft(loan.adminNote || ""); }}>
                          <PenLine className="w-3 h-3" />Modifier
                        </Button>
                      )}
                    </div>
                    {editNoteFor === loan.id ? (
                      <div className="space-y-2">
                        <Textarea value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
                          placeholder="Message affiché au client dans son suivi de dossier..." rows={3} className="text-xs" />
                        <div className="flex gap-2">
                          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => saveNote.mutate(loan.id)} disabled={saveNote.isPending}>
                            {saveNote.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Enregistrer
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditNoteFor(null)}>Annuler</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {loan.adminNote || "Aucune note. Cliquez sur Modifier pour en ajouter une."}
                      </p>
                    )}
                  </div>

                  {/* Steps */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">Étapes du dossier</span>
                      <span className="text-[10px] text-muted-foreground">(cliquez sur ✏ pour personnaliser chaque étape)</span>
                    </div>
                    {steps
                      ? steps.map((s, idx) => (
                        <LoanStepAdminRow
                          key={s.id}
                          step={s}
                          loanId={loan.id}
                          isLast={idx === steps.length - 1}
                          onRefresh={handleRefresh}
                        />
                      ))
                      : <Skeleton className="h-12 w-full" />}
                  </div>

                  {/* Legend */}
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Guide des actions :</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                      <div className="flex items-start gap-1.5"><Lock className="w-3 h-3 mt-0.5 text-amber-500 flex-shrink-0" /><span><strong>Exiger un code</strong> — Bloque l'étape. Le client doit saisir le code pour continuer.</span></div>
                      <div className="flex items-start gap-1.5"><Play className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" /><span><strong>Valider l'étape</strong> — Marque l'étape comme complète et active la suivante.</span></div>
                      <div className="flex items-start gap-1.5"><Unlock className="w-3 h-3 mt-0.5 text-red-500 flex-shrink-0" /><span><strong>Retirer le code</strong> — Supprime l'exigence de code sans validation.</span></div>
                      <div className="flex items-start gap-1.5"><DollarSign className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" /><span><strong>Virer les fonds</strong> — Crédite le compte client et clôture le dossier.</span></div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

<<<<<<< HEAD
// ─── ADMIN CARDS ─────────────────────────────────────────────────────────────
function AdminCards() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [cardType, setCardType] = useState("visa_infinite");
  const [accountId, setAccountId] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);

  // Fetch all clients
  const { data: clients } = useQuery<any[]>({ queryKey: ["/api/admin/clients"] });
  const clientList = (clients ?? []).filter((c: any) => c.role === "client");

  // Fetch cards for selected client
  const { data: clientAccounts, refetch: refetchAccounts } = useQuery<any[]>({
    queryKey: ["/api/admin/accounts", selectedClient],
    enabled: !!selectedClient,
    queryFn: async () => {
      const r = await fetch(`/api/admin/accounts/${selectedClient}`, { credentials: "include" });
      return r.json();
    },
  });

  // Fetch all cards (global)
  const { data: allCards, refetch: refetchCards } = useQuery<any[]>({
    queryKey: ["/api/admin/cards"],
    queryFn: async () => {
      const r = await fetch("/api/admin/cards", { credentials: "include" });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const generateCard = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/admin/cards", { userId: selectedClient, accountId, type: cardType });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      setShowGenerate(false);
      setAccountId("");
      refetchCards();
      toast({ title: "Carte générée avec succès ✓" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const toggleCard = useMutation({
    mutationFn: async ({ cardId, active }: { cardId: string; active: boolean }) => {
      const r = await apiRequest("PATCH", `/api/admin/cards/${cardId}`, { active });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: (_, vars) => {
      refetchCards();
      toast({ title: vars.active ? "Carte activée ✓" : "Carte désactivée ✓" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const updateLimit = useMutation({
    mutationFn: async ({ cardId, limit }: { cardId: string; limit: number }) => {
      const r = await apiRequest("PATCH", `/api/admin/cards/${cardId}`, { dailyLimit: limit });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => { refetchCards(); toast({ title: "Limite mise à jour ✓" }); },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const [editLimitFor, setEditLimitFor] = useState<string | null>(null);
  const [limitDraft, setLimitDraft] = useState("");

  const cards = (allCards ?? []).filter((c: any) => !selectedClient || c.userId === selectedClient);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gold" />
          <span className="text-sm font-semibold">Gestion des cartes bancaires</span>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowGenerate(!showGenerate)}>
          <PlusCircle className="w-4 h-4" />Générer une carte
        </Button>
      </div>

      {/* Generate card form */}
      {showGenerate && (
        <Card className="border-gold/30">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold">Nouvelle carte bancaire</span>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Client *</Label>
              <Select value={selectedClient} onValueChange={(v) => { setSelectedClient(v); setAccountId(""); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                <SelectContent>
                  {clientList.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.fullName} — {c.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedClient && (
              <div className="space-y-1">
                <Label className="text-xs">Compte associé *</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Choisir le compte" /></SelectTrigger>
                  <SelectContent>
                    {(clientAccounts ?? []).map((a: any) => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">{a.name} — {formatCurrency(a.balance, a.currency)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Type de carte</Label>
              <Select value={cardType} onValueChange={setCardType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visa_infinite" className="text-xs">Visa Infinite (Gold Premium)</SelectItem>
                  <SelectItem value="mastercard_gold" className="text-xs">Mastercard Gold</SelectItem>
                  <SelectItem value="visa_classic" className="text-xs">Visa Classic</SelectItem>
                  <SelectItem value="virtual" className="text-xs">Carte Virtuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-8 text-xs gap-1"
                disabled={!selectedClient || !accountId || generateCard.isPending}
                onClick={() => generateCard.mutate()}>
                {generateCard.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                Générer la carte
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setShowGenerate(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter by client */}
      <div className="flex gap-2 items-center">
        <Select value={selectedClient || "all"} onValueChange={(v) => setSelectedClient(v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 text-xs w-64">
            <SelectValue placeholder="Filtrer par client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Tous les clients</SelectItem>
            {clientList.map((c: any) => (
              <SelectItem key={c.id} value={c.id} className="text-xs">{c.fullName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{cards.length} carte(s)</span>
      </div>

      {/* Cards list */}
      {cards.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <CreditCard className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune carte émise</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {cards.map((card: any) => {
            const isActive = card.active !== false;
            const typeLabels: Record<string, string> = {
              visa_infinite: "Visa Infinite", mastercard_gold: "Mastercard Gold",
              visa_classic: "Visa Classic", virtual: "Carte Virtuelle",
            };
            const typeLabel = typeLabels[card.type] || card.type;
            const maskedNumber = card.cardNumber
              ? `•••• •••• •••• ${card.cardNumber.slice(-4)}`
              : "•••• •••• •••• ••••";

            return (
              <Card key={card.id} className={`transition-all ${!isActive ? "opacity-60" : ""}`}>
                <CardContent className="py-3.5 px-4">
                  {/* Card visual header */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-8 rounded-md flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${isActive ? "bg-gradient-to-br from-[#c9a84c] to-[#e8c96a]" : "bg-muted"}`}>
                      {typeLabel.includes("Visa") ? "VISA" : "MC"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{typeLabel}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isActive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"}`}>
                          {isActive ? "Active" : "Désactivée"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{maskedNumber}</p>
                      {card.user && <p className="text-xs text-muted-foreground">{card.user.fullName || "—"}</p>}
                    </div>
                    <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                      <p>Limite / jour</p>
                      <p className="font-bold text-foreground">{card.dailyLimit ? formatCurrency(card.dailyLimit) : "Illimitée"}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {/* Toggle active */}
                    <Button size="sm" variant="outline" className={`h-7 text-xs gap-1 ${isActive ? "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"}`}
                      onClick={() => toggleCard.mutate({ cardId: card.id, active: !isActive })}
                      disabled={toggleCard.isPending}>
                      {isActive ? <><Lock className="w-3 h-3" />Désactiver</> : <><Unlock className="w-3 h-3" />Activer</>}
                    </Button>

                    {/* Edit limit */}
                    {editLimitFor === card.id ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          className="h-7 text-xs w-28"
                          placeholder="Limite CHF"
                          value={limitDraft}
                          onChange={e => setLimitDraft(e.target.value)}
                        />
                        <Button size="sm" className="h-7 text-xs px-2" onClick={() => {
                          if (limitDraft) updateLimit.mutate({ cardId: card.id, limit: parseFloat(limitDraft) });
                          setEditLimitFor(null); setLimitDraft("");
                        }}>
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-1.5" onClick={() => { setEditLimitFor(null); setLimitDraft(""); }}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                        onClick={() => { setEditLimitFor(card.id); setLimitDraft(String(card.dailyLimit || "")); }}>
                        <Edit2 className="w-3 h-3" />Modifier la limite
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
// ─── ADMIN TRANSFERS ─────────────────────────────────────────────────────────
function AdminTransfers() {
  const { toast } = useToast();
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [progress, setProgress] = useState(0);
  const [adminMessage, setAdminMessage] = useState("");
  const [status, setStatus] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const { data: transfers, isLoading } = useQuery<Transfer[]>({ queryKey: ["/api/admin/transfers"] });

  const updateTransfer = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/admin/transfers/${selectedTransfer?.id}`, { progress, adminMessage: adminMessage || undefined, status: status || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transfers"] });
      toast({ title: "Transfert mis à jour" });
      setSelectedTransfer(null);
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const generateOtp = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/transfers/${selectedTransfer?.id}/generate-otp`);
      return (await res.json()).otp;
    },
    onSuccess: (otp: string) => {
      setGeneratedOtp(otp);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transfers"] });
      toast({ title: "Code OTP généré" });
    },
  });

  const openTransfer = (t: Transfer) => {
    setSelectedTransfer(t);
    setProgress(t.progress);
    setAdminMessage(t.adminMessage || "");
    setStatus(t.status);
    setGeneratedOtp("");
  };

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  return (
    <>
      <div className="space-y-2">
        {transfers?.map((t) => (
          <Card key={t.id} className="hover-elevate cursor-pointer" onClick={() => openTransfer(t)}>
            <CardContent className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gold/10 flex-shrink-0">
                  <Send className="w-4 h-4 text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{t.recipientName}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={t.status === "blocked" ? "destructive" : t.status === "completed" ? "secondary" : "default"}>{t.status}</Badge>
                    <span className="text-xs text-muted-foreground">{t.progress}%</span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-semibold flex-shrink-0">{formatCurrency(t.amount, t.currency)}</span>
            </CardContent>
          </Card>
        ))}
        {(!transfers || transfers.length === 0) && <p className="text-center text-sm text-muted-foreground py-8">Aucun virement</p>}
      </div>

      <Dialog open={!!selectedTransfer} onOpenChange={(open) => !open && setSelectedTransfer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Gérer le virement</DialogTitle></DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Bénéficiaire :</span> {selectedTransfer.recipientName}</p>
                <p><span className="text-muted-foreground">Montant :</span> {formatCurrency(selectedTransfer.amount, selectedTransfer.currency)}</p>
                <p><span className="text-muted-foreground">IBAN :</span> <span className="font-mono text-xs">{selectedTransfer.recipientIban}</span></p>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending","processing","completed","blocked","failed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><Label>Progression</Label><span className="text-sm font-semibold text-gold">{progress}%</span></div>
                <Slider value={[progress]} onValueChange={(v) => setProgress(v[0])} max={100} min={0} step={5} />
              </div>
              <div className="space-y-2">
                <Label>Message administratif</Label>
                <Textarea value={adminMessage} onChange={(e) => setAdminMessage(e.target.value)} placeholder="Message pour le client..." />
              </div>
              <Button onClick={() => updateTransfer.mutate()} className="w-full" disabled={updateTransfer.isPending}>
                {updateTransfer.isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-gold" /><span className="text-sm font-medium">Code OTP</span></div>
                <Button variant="secondary" className="w-full" onClick={() => generateOtp.mutate()} disabled={generateOtp.isPending}>
                  {generateOtp.isPending ? "Génération..." : "Générer un code OTP"}
                </Button>
                {generatedOtp && (
                  <div className="flex items-center justify-between gap-2 p-3 bg-muted rounded-md">
                    <span className="font-mono text-lg font-bold tracking-widest">{generatedOtp}</span>
                    <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(generatedOtp); toast({ title: "Code copié" }); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── ADMIN MESSAGES ──────────────────────────────────────────────────────────
function AdminMessages() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [reply, setReply] = useState("");

  const { data: clients } = useQuery<User[]>({ queryKey: ["/api/admin/clients"] });
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/admin/messages", selectedUserId],
    enabled: !!selectedUserId,
    refetchInterval: 5000,
    queryFn: async () => {
      if (!selectedUserId) return [];
      const res = await fetch(`/api/admin/messages?userId=${selectedUserId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/messages", { userId: selectedUserId, content: reply, fromAdmin: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages", selectedUserId] });
      setReply("");
      toast({ title: "Message envoyé" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Client</Label>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger><SelectValue placeholder="Choisir un client" /></SelectTrigger>
          <SelectContent>
            {clients?.filter((c) => c.role === "client").map((c) => <SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {selectedUserId && (
        <Card>
          <CardContent className="py-4">
            {isLoading ? <Skeleton className="h-32 w-full" /> : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.fromAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-md px-3 py-2 ${msg.fromAdmin ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-[10px] opacity-60 mt-1">{msg.createdAt ? format(new Date(msg.createdAt), "HH:mm", { locale: fr }) : ""}</p>
                    </div>
                  </div>
                ))}
                {(!messages || messages.length === 0) && <p className="text-center text-sm text-muted-foreground py-4">Aucun message</p>}
              </div>
            )}
            <form className="flex gap-2 mt-4 pt-4 border-t" onSubmit={(e) => { e.preventDefault(); if (reply.trim()) sendReply.mutate(); }}>
              <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Votre réponse..." />
              <Button type="submit" size="icon" disabled={!reply.trim() || sendReply.isPending}><Send className="w-4 h-4" /></Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── ADMIN STATS DASHBOARD ───────────────────────────────────────────────────
function AdminStats() {
  const { data: stats, isLoading } = useQuery<{ totalClients: number; totalBalance: number; totalTransfers: number; totalLoans: number }>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000,
  });

  const { data: clients } = useQuery<User[]>({ queryKey: ["/api/admin/clients"] });
  const { data: txs } = useQuery<Transaction[]>({ queryKey: ["/api/admin/transactions"] });

  function formatCHF(n: number) {
    return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", minimumFractionDigits: 0 }).format(n);
  }

  const kpis = [
    { label: "Kunden / Clients", value: isLoading ? "—" : String(stats?.totalClients ?? 0), icon: <Users className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Verwaltete Aktiven / Actifs gérés", value: isLoading ? "—" : formatCHF(stats?.totalBalance ?? 0), icon: <Wallet className="w-5 h-5" />, color: "text-[hsl(var(--gold))]", bg: "bg-[hsl(var(--gold))]/10" },
    { label: "Überweisungen / Virements", value: isLoading ? "—" : String(stats?.totalTransfers ?? 0), icon: <ArrowLeftRight className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Vorgänge / Dossiers", value: isLoading ? "—" : String(stats?.totalLoans ?? 0), icon: <Activity className="w-5 h-5" />, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  // Last 5 transactions
  const recentTxs = (txs ?? []).slice(0, 8);

  return (
    <div className="space-y-5">
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-3">
              <div className={`w-9 h-9 rounded-lg ${k.bg} flex items-center justify-center mb-3 ${k.color}`}>{k.icon}</div>
              <p className="text-xs text-muted-foreground leading-tight mb-1">{k.label}</p>
              <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent transactions across all clients */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[hsl(var(--gold))]" />
            <span className="text-sm font-semibold">Letzte Transaktionen / Dernières transactions</span>
          </div>
        </CardHeader>
        <CardContent>
          {recentTxs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Keine Transaktionen / Aucune transaction</p>
          ) : (
            <div className="space-y-1">
              {recentTxs.map(tx => (
                <div key={tx.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {tx.type === "credit" ? <PlusCircle className="w-3.5 h-3.5 text-emerald-500" /> : <MinusCircle className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date ? format(new Date(tx.date), "d MMM yyyy HH:mm", { locale: fr }) : ""}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${tx.type === "credit" ? "text-emerald-500" : "text-red-500"}`}>
                    {tx.type === "credit" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client list mini */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[hsl(var(--gold))]" />
            <span className="text-sm font-semibold">Kunden / Clients ({clients?.filter(c => c.role === "client").length ?? 0})</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {(clients ?? []).filter(c => c.role === "client").map(c => {
              const initials = c.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
              return (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--gold))]/20 flex items-center justify-center text-[hsl(var(--gold))] text-xs font-bold flex-shrink-0">{initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{c.createdAt ? format(new Date(c.createdAt), "d MMM yyyy", { locale: fr }) : ""}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ADMIN CLIENT DETAIL ──────────────────────────────────────────────────────
function AdminClientDetail({ client, onBack }: { client: User; onBack: () => void }) {
  const { toast } = useToast();
  const [opType, setOpType] = useState<"credit" | "debit" | null>(null);
  const [opAmount, setOpAmount] = useState("");
  const [opDesc, setOpDesc] = useState("");
  const [opAccountId, setOpAccountId] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: client.fullName, email: client.email, phone: client.phone || "" });
  const [showCard, setShowCard] = useState(false);
  const [cardAccountId, setCardAccountId] = useState("");
  const [cardType, setCardType] = useState("visa_infinite");

  const { data: accounts, refetch: refetchAccounts } = useQuery<Account[]>({
    queryKey: ["/api/admin/accounts", client.id],
    queryFn: async () => {
      const r = await fetch(`/api/admin/accounts/${client.id}`, { credentials: "include" });
      return r.json();
    },
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions", client.id],
    queryFn: async () => {
      const r = await fetch(`/api/admin/transactions/${client.id}`, { credentials: "include" });
      return r.json();
    },
  });

  const doOp = useMutation({
    mutationFn: async () => {
      if (!opType || !opAccountId || !opAmount) throw new Error("Fehlende Felder");
      const r = await apiRequest("POST", `/api/admin/accounts/${opAccountId}/${opType}`, {
        amount: parseFloat(opAmount), description: opDesc || (opType === "credit" ? "Administrativer Kredit" : "Administrativer Debit"),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      refetchAccounts();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions", client.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setOpType(null); setOpAmount(""); setOpDesc(""); setOpAccountId("");
      toast({ title: "Opération effectuée ✓" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const saveEdit = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("PATCH", `/api/admin/clients/${client.id}`, editForm);
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clients"] });
      setEditMode(false);
      toast({ title: "Client mis à jour ✓" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const issueCard = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", "/api/admin/cards", { userId: client.id, accountId: cardAccountId, type: cardType });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      setShowCard(false);
      toast({ title: "Karte ausgestellt / Carte émise ✓" });
    },
    onError: (err: any) => toast({ title: "Erreur", description: err.message, variant: "destructive" }),
  });

  const totalBalance = (accounts ?? []).reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronUp className="w-4 h-4 rotate-90" /> Zurück / Retour
        </button>
      </div>

      {/* Client card */}
      <Card className="border-[hsl(var(--gold))]/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-xl bg-[hsl(var(--gold))]/20 flex items-center justify-center text-[hsl(var(--gold))] text-xl font-bold flex-shrink-0">
              {client.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}
            </div>
            <div className="flex-1 min-w-0">
              {editMode ? (
                <div className="space-y-2">
                  <Input className="h-8 text-sm font-semibold" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} placeholder="Nom complet" />
                  <Input className="h-8 text-sm" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} placeholder="Email" />
                  <Input className="h-8 text-sm" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Téléphone" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit.mutate()} disabled={saveEdit.isPending} className="gap-1"><Check className="w-3 h-3" /> Speichern</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditMode(false)}><X className="w-3 h-3" /></Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{client.fullName}</p>
                    <button onClick={() => setEditMode(true)} className="text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  {client.phone && <p className="text-sm text-muted-foreground">{client.phone}</p>}
                  <p className="text-xs text-muted-foreground mt-1">ID: {client.id.slice(0,8)}... · Créé {client.createdAt ? format(new Date(client.createdAt), "d MMM yyyy", { locale: fr }) : ""}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Patrimoine total</p>
              <p className="text-xl font-bold text-[hsl(var(--gold))]">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts + operations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[hsl(var(--gold))]" />
                <span className="text-sm font-semibold">Konten / Comptes</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowCard(!showCard)}>
                <CreditCard className="w-3 h-3" /> Carte
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(accounts ?? []).map(acc => (
              <div key={acc.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{acc.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{acc.iban}</p>
                  <p className="text-[10px] text-muted-foreground">{acc.type} · {acc.currency}</p>
                </div>
                <p className="text-sm font-bold flex-shrink-0">{formatCurrency(acc.balance, acc.currency)}</p>
              </div>
            ))}
            {(accounts ?? []).length === 0 && <p className="text-xs text-muted-foreground text-center py-3">Aucun compte</p>}

            {/* Issue card modal */}
            {showCard && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium">Émettre une carte bancaire</p>
                <Select value={cardAccountId} onValueChange={setCardAccountId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Compte associé" /></SelectTrigger>
                  <SelectContent>{(accounts ?? []).map(a => <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={cardType} onValueChange={setCardType}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa_infinite" className="text-xs">Visa Infinite (Gold)</SelectItem>
                    <SelectItem value="mastercard_gold" className="text-xs">Mastercard Gold</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="w-full h-8 text-xs" onClick={() => issueCard.mutate()} disabled={!cardAccountId || issueCard.isPending}>
                  {issueCard.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Émettre la carte"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit / Debit operations */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[hsl(var(--gold))]" />
              <span className="text-sm font-semibold">Opérations manuelles</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant={opType === "credit" ? "default" : "outline"} className="gap-1 h-8 text-xs"
                onClick={() => setOpType(opType === "credit" ? null : "credit")}>
                <PlusCircle className="w-3.5 h-3.5" /> Crédit / Gutschrift
              </Button>
              <Button size="sm" variant={opType === "debit" ? "destructive" : "outline"} className="gap-1 h-8 text-xs"
                onClick={() => setOpType(opType === "debit" ? null : "debit")}>
                <MinusCircle className="w-3.5 h-3.5" /> Débit / Belastung
              </Button>
            </div>

            {opType && (
              <div className="space-y-2">
                <Select value={opAccountId} onValueChange={setOpAccountId}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Compte cible" /></SelectTrigger>
                  <SelectContent>{(accounts ?? []).map(a => <SelectItem key={a.id} value={a.id} className="text-xs">{a.name} — {formatCurrency(a.balance, a.currency)}</SelectItem>)}</SelectContent>
                </Select>
                <Input className="h-8 text-xs" type="number" placeholder="Montant CHF" value={opAmount} onChange={e => setOpAmount(e.target.value)} />
                <Input className="h-8 text-xs" placeholder="Libellé de l'opération" value={opDesc} onChange={e => setOpDesc(e.target.value)} />
                <Button size="sm" className={`w-full h-8 text-xs ${opType === "credit" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"} text-white border-0`}
                  onClick={() => doOp.mutate()} disabled={!opAccountId || !opAmount || doOp.isPending}>
                  {doOp.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : (opType === "credit" ? "Effectuer le crédit" : "Effectuer le débit")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions history */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[hsl(var(--gold))]" />
            <span className="text-sm font-semibold">Transaktionen / Transactions</span>
            <Badge variant="secondary">{(transactions ?? []).length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {(transactions ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Keine Transaktionen / Aucune transaction</p>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {(transactions ?? []).slice(0,20).map(tx => (
                <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${tx.type === "credit" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {tx.type === "credit" ? <PlusCircle className="w-3 h-3 text-emerald-500" /> : <MinusCircle className="w-3 h-3 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground">{tx.date ? format(new Date(tx.date), "d MMM yyyy · HH:mm", { locale: fr }) : ""}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${tx.type === "credit" ? "text-emerald-500" : "text-red-500"}`}>
                    {tx.type === "credit" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ADMIN CLIENTS (updated with detail view) ─────────────────────────────────
function AdminClientsV2() {
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  const { data: clients, isLoading } = useQuery<User[]>({ queryKey: ["/api/admin/clients"] });

  if (selectedClient) return <AdminClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} />;

  if (isLoading) return <div className="space-y-3">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  const clientList = (clients ?? []).filter(c => c.role === "client");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground pb-1">
        <Users className="w-4 h-4" />
        <span>{clientList.length} Kunden / clients</span>
      </div>
      {clientList.length === 0 ? (
        <Card><CardContent className="text-center py-10 text-sm text-muted-foreground">Keine Kunden / Aucun client</CardContent></Card>
      ) : clientList.map(c => {
        const initials = c.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
        return (
          <Card key={c.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedClient(c)}>
            <CardContent className="flex items-center gap-4 py-3 px-4">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--gold))]/20 flex items-center justify-center text-[hsl(var(--gold))] text-sm font-bold flex-shrink-0">{initials}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{c.fullName}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email} {c.phone ? "· " + c.phone : ""}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-muted-foreground">Depuis</p>
                <p className="text-xs">{c.createdAt ? format(new Date(c.createdAt), "d MMM yyyy", { locale: fr }) : ""}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 flex-shrink-0" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── ADMIN PDF GENERATOR ──────────────────────────────────────────────────────
type DocType = "account_contract" | "loan_contract" | "receipt" | "invoice" | "statement" | "closure";
type DocLang = "de" | "fr";

interface DocConfig {
  id: DocType;
  labelDe: string;
  labelFr: string;
  icon: React.ReactNode;
  color: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  id: string;
  labelDe: string;
  labelFr: string;
  type: "text" | "email" | "number" | "select" | "date" | "textarea";
  options?: { value: string; labelDe: string; labelFr: string }[];
  required?: boolean;
  placeholder?: string;
  step?: string;
}

const DOC_CONFIGS: DocConfig[] = [
  {
    id: "account_contract",
    labelDe: "Kontoeröffnungsvertrag",
    labelFr: "Contrat d'ouverture de compte",
    icon: <FileSignature className="w-5 h-5" />,
    color: "from-blue-600 to-blue-800",
    fields: [
      { id: "client.fullName", labelDe: "Vollständiger Name *", labelFr: "Nom complet *", type: "text", required: true },
      { id: "client.email", labelDe: "E-Mail *", labelFr: "Email *", type: "email", required: true },
      { id: "client.phone", labelDe: "Telefon", labelFr: "Téléphone", type: "text" },
      { id: "account.iban", labelDe: "IBAN *", labelFr: "IBAN *", type: "text", required: true, placeholder: "CH93 0076 2011 6238 5295 7" },
      { id: "account.name", labelDe: "Kontobezeichnung *", labelFr: "Intitulé du compte *", type: "text", required: true },
      { id: "account.type", labelDe: "Kontotyp *", labelFr: "Type de compte *", type: "select", required: true,
        options: [
          { value: "main", labelDe: "Girokonto", labelFr: "Compte courant" },
          { value: "savings", labelDe: "Sparkonto", labelFr: "Compte épargne" },
          { value: "joint", labelDe: "Gemeinschaftskonto", labelFr: "Compte joint" },
          { value: "child", labelDe: "Kinderkonto", labelFr: "Compte enfant" },
        ]},
      { id: "account.currency", labelDe: "Währung", labelFr: "Devise", type: "select",
        options: [
          { value: "CHF", labelDe: "CHF - Schweizer Franken", labelFr: "CHF - Franc suisse" },
          { value: "EUR", labelDe: "EUR - Euro", labelFr: "EUR - Euro" },
          { value: "USD", labelDe: "USD - US-Dollar", labelFr: "USD - Dollar US" },
        ]},
      { id: "account.balance", labelDe: "Eröffnungsguthaben (CHF)", labelFr: "Solde à l'ouverture (CHF)", type: "number", placeholder: "0" },
      { id: "account.interestRate", labelDe: "Zinssatz (%)", labelFr: "Taux d'intérêt (%)", type: "number", placeholder: "0", step: "0.1" },
    ],
  },
  {
    id: "loan_contract",
    labelDe: "Kreditvertrag",
    labelFr: "Contrat de prêt",
    icon: <Banknote className="w-5 h-5" />,
    color: "from-emerald-600 to-emerald-800",
    fields: [
      { id: "client.fullName", labelDe: "Vollständiger Name *", labelFr: "Nom complet *", type: "text", required: true },
      { id: "client.email", labelDe: "E-Mail *", labelFr: "Email *", type: "email", required: true },
      { id: "client.phone", labelDe: "Telefon", labelFr: "Téléphone", type: "text" },
      { id: "loan.label", labelDe: "Verwendungszweck *", labelFr: "Objet du financement *", type: "text", required: true, placeholder: "Immobilienkauf / Achat immobilier" },
      { id: "loan.amount", labelDe: "Kreditbetrag (CHF) *", labelFr: "Montant du crédit (CHF) *", type: "number", required: true },
      { id: "loan.currency", labelDe: "Währung", labelFr: "Devise", type: "select",
        options: [{ value:"CHF",labelDe:"CHF",labelFr:"CHF"},{value:"EUR",labelDe:"EUR",labelFr:"EUR"}]},
      { id: "rate", labelDe: "Jahreszins (%) *", labelFr: "Taux annuel (%) *", type: "number", required: true, placeholder: "1.5", step: "0.01" },
      { id: "duration", labelDe: "Laufzeit (Monate) *", labelFr: "Durée (mois) *", type: "number", required: true, placeholder: "120" },
    ],
  },
  {
    id: "receipt",
    labelDe: "Zahlungsquittung",
    labelFr: "Quittance de paiement",
    icon: <ReceiptText className="w-5 h-5" />,
    color: "from-green-600 to-green-800",
    fields: [
      { id: "fullName", labelDe: "Name des Zahlers *", labelFr: "Nom du payeur *", type: "text", required: true },
      { id: "amount", labelDe: "Betrag (CHF) *", labelFr: "Montant (CHF) *", type: "number", required: true },
      { id: "currency", labelDe: "Währung", labelFr: "Devise", type: "select",
        options: [{ value:"CHF",labelDe:"CHF",labelFr:"CHF"},{value:"EUR",labelDe:"EUR",labelFr:"EUR"}]},
      { id: "description", labelDe: "Zahlungszweck *", labelFr: "Objet du paiement *", type: "text", required: true },
      { id: "payment_method", labelDe: "Zahlungsart", labelFr: "Mode de paiement", type: "select",
        options: [
          { value:"virement",labelDe:"Banküberweisung",labelFr:"Virement bancaire" },
          { value:"especes",labelDe:"Bargeld",labelFr:"Espèces" },
          { value:"carte",labelDe:"Bankkarte",labelFr:"Carte bancaire" },
          { value:"cheque",labelDe:"Scheck",labelFr:"Chèque" },
        ]},
      { id: "date", labelDe: "Zahlungsdatum", labelFr: "Date du paiement", type: "date" },
    ],
  },
  {
    id: "invoice",
    labelDe: "Rechnung",
    labelFr: "Facture",
    icon: <Receipt className="w-5 h-5" />,
    color: "from-amber-600 to-amber-800",
    fields: [
      { id: "fullName", labelDe: "Rechnungsempfänger *", labelFr: "Destinataire *", type: "text", required: true },
      { id: "email", labelDe: "E-Mail", labelFr: "Email", type: "email" },
      { id: "clientIban", labelDe: "IBAN Empfänger", labelFr: "IBAN destinataire", type: "text", placeholder: "CH93 0076..." },
      { id: "invoiceNum", labelDe: "Rechnungsnummer", labelFr: "Numéro de facture", type: "text", placeholder: "001" },
      { id: "dueDate", labelDe: "Fälligkeitsdatum", labelFr: "Date d'échéance", type: "date" },
      { id: "items[0].desc", labelDe: "Position 1 - Bezeichnung", labelFr: "Ligne 1 - Désignation", type: "text", placeholder: "Kontoführungsgebühr / Frais de tenue" },
      { id: "items[0].qty", labelDe: "Position 1 - Menge", labelFr: "Ligne 1 - Quantité", type: "number", placeholder: "1" },
      { id: "items[0].unit", labelDe: "Position 1 - Einzelpreis (CHF)", labelFr: "Ligne 1 - Prix unitaire (CHF)", type: "number", placeholder: "25" },
      { id: "items[1].desc", labelDe: "Position 2 - Bezeichnung", labelFr: "Ligne 2 - Désignation", type: "text" },
      { id: "items[1].qty", labelDe: "Position 2 - Menge", labelFr: "Ligne 2 - Quantité", type: "number" },
      { id: "items[1].unit", labelDe: "Position 2 - Einzelpreis (CHF)", labelFr: "Ligne 2 - Prix unitaire (CHF)", type: "number" },
      { id: "items[2].desc", labelDe: "Position 3 - Bezeichnung", labelFr: "Ligne 3 - Désignation", type: "text" },
      { id: "items[2].qty", labelDe: "Position 3 - Menge", labelFr: "Ligne 3 - Quantité", type: "number" },
      { id: "items[2].unit", labelDe: "Position 3 - Einzelpreis (CHF)", labelFr: "Ligne 3 - Prix unitaire (CHF)", type: "number" },
    ],
  },
  {
    id: "statement",
    labelDe: "Kontoauszug",
    labelFr: "Relevé de compte",
    icon: <ScrollText className="w-5 h-5" />,
    color: "from-violet-600 to-violet-800",
    fields: [
      { id: "client.fullName", labelDe: "Kundenname *", labelFr: "Nom du client *", type: "text", required: true },
      { id: "account.iban", labelDe: "IBAN *", labelFr: "IBAN *", type: "text", required: true, placeholder: "CH93 0076 2011 6238 5295 7" },
      { id: "account.currency", labelDe: "Währung", labelFr: "Devise", type: "select",
        options: [{ value:"CHF",labelDe:"CHF",labelFr:"CHF"},{value:"EUR",labelDe:"EUR",labelFr:"EUR"}]},
      { id: "account.balance", labelDe: "Abschlusssaldo (CHF) *", labelFr: "Solde de clôture (CHF) *", type: "number", required: true },
      { id: "openingBalance", labelDe: "Eröffnungssaldo (CHF)", labelFr: "Solde d'ouverture (CHF)", type: "number" },
      { id: "period", labelDe: "Zeitraum (z.B. Jan - Mar 2024)", labelFr: "Période (ex. Jan - Mar 2024)", type: "text", placeholder: "Januar - März 2024" },
    ],
  },
  {
    id: "closure",
    labelDe: "Kontoauflösung",
    labelFr: "Clôture de compte",
    icon: <XCircle className="w-5 h-5" />,
    color: "from-rose-600 to-rose-800",
    fields: [
      { id: "client.fullName", labelDe: "Kundenname *", labelFr: "Nom du client *", type: "text", required: true },
      { id: "client.email", labelDe: "E-Mail *", labelFr: "Email *", type: "email", required: true },
      { id: "account.iban", labelDe: "IBAN des geschlossenen Kontos *", labelFr: "IBAN du compte clôturé *", type: "text", required: true },
      { id: "account.balance", labelDe: "Saldo bei Auflösung (CHF)", labelFr: "Solde lors de la clôture (CHF)", type: "number" },
      { id: "account.currency", labelDe: "Währung", labelFr: "Devise", type: "select",
        options: [{ value:"CHF",labelDe:"CHF",labelFr:"CHF"},{value:"EUR",labelDe:"EUR",labelFr:"EUR"}]},
      { id: "closureDate", labelDe: "Auflösungsdatum", labelFr: "Date de clôture", type: "date" },
      { id: "transferTo", labelDe: "Mittel überwiesen an (IBAN)", labelFr: "Fonds transférés vers (IBAN)", type: "text", placeholder: "DE89 3704 0044..." },
    ],
  },
];

// Helper: set nested value via dot path like "client.fullName" or "items[0].desc"
function setPath(obj: any, path: string, value: any): any {
  const result = JSON.parse(JSON.stringify(obj));
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cur[key] === undefined || cur[key] === null) {
      cur[key] = isNaN(Number(parts[i+1])) ? {} : [];
    }
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
  return result;
}

function AdminPDF() {
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [docLang, setDocLang] = useState<DocLang>("de");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [generating, setGenerating] = useState(false);

  const config = DOC_CONFIGS.find(d => d.id === selectedDoc);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => setPath(prev, fieldId, value));
  };

  const handleGenerate = async () => {
    if (!selectedDoc || !config) return;
    const required = config.fields.filter(f => f.required);
    for (const field of required) {
      const parts = field.id.replace(/\[(\d+)\]/g, ".$1").split(".");
      let v: any = formData;
      for (const p of parts) { v = v?.[p]; }
      if (!v || String(v).trim() === "") {
        toast({ title: docLang === "de" ? "Pflichtfeld fehlt" : "Champ obligatoire manquant", description: docLang === "de" ? field.labelDe : field.labelFr, variant: "destructive" });
        return;
      }
    }

    // Build items array for invoice
    let finalData = { ...formData };
    if (selectedDoc === "invoice") {
      const rawItems = (formData as any)?.items || [];
      const items: any[] = [];
      for (let i = 0; i < 3; i++) {
        const it = Array.isArray(rawItems) ? rawItems[i] : rawItems?.[String(i)];
        if (it?.desc && it?.unit) items.push({ desc: it.desc, qty: Number(it.qty || 1), unit: Number(it.unit) });
      }
      finalData = { ...finalData, items };
    }

    setGenerating(true);
    try {
      const resp = await fetch("/api/admin/pdf/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: selectedDoc, lang: docLang, data: finalData }),
      });
      if (!resp.ok) { const msg = await resp.text(); throw new Error(msg); }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = resp.headers.get("content-disposition");
      a.download = cd?.match(/filename="([^"]+)"/)?.[1] || `SwizKote-${selectedDoc}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: docLang === "de" ? "PDF erstellt ✓" : "PDF généré ✓", description: docLang === "de" ? "Das Dokument wird heruntergeladen." : "Le document est en cours de téléchargement." });
    } catch (err: any) {
      toast({ title: "Fehler / Erreur", description: err.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Lang switcher */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {docLang === "de" ? "Dokumentsprache:" : "Langue du document :"}
        </span>
        <div className="flex rounded-lg border overflow-hidden">
          {(["de","fr"] as DocLang[]).map(l => (
            <button key={l} onClick={() => setDocLang(l)}
              className={`px-4 py-1.5 text-sm font-semibold transition-colors ${docLang === l ? "bg-[hsl(var(--gold))] text-[hsl(222,40%,10%)]" : "bg-transparent text-muted-foreground hover:bg-muted"}`}>
              {l === "de" ? "🇩🇪 Deutsch" : "🇫🇷 Français"}
            </button>
          ))}
        </div>
      </div>

      {/* Document type grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {DOC_CONFIGS.map(cfg => (
          <button key={cfg.id} onClick={() => { setSelectedDoc(cfg.id); setFormData({}); }}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all hover-elevate ${
              selectedDoc === cfg.id ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold))]/10" : "border-border hover:border-[hsl(var(--gold))]/50 bg-card"
            }`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-white`}>
              {cfg.icon}
            </div>
            <span className="text-xs font-semibold leading-tight text-center">
              {docLang === "de" ? cfg.labelDe : cfg.labelFr}
            </span>
            {selectedDoc === cfg.id && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[hsl(var(--gold))]" />
            )}
          </button>
        ))}
      </div>

      {/* Form */}
      {config && (
        <Card className="border-[hsl(var(--gold))]/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white flex-shrink-0`}>
                {config.icon}
              </div>
              <div>
                <p className="font-semibold">{docLang === "de" ? config.labelDe : config.labelFr}</p>
                <p className="text-xs text-muted-foreground">{docLang === "de" ? "Felder ausfüllen und PDF erstellen" : "Remplir les champs et générer le PDF"}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {config.fields.map(field => {
                // Get current value from nested formData
                const parts = field.id.replace(/\[(\d+)\]/g, ".$1").split(".");
                let v: any = formData;
                for (const p of parts) v = v?.[p];
                const value = v ?? "";
                const label = docLang === "de" ? field.labelDe : field.labelFr;

                if (field.type === "select") return (
                  <div key={field.id} className="space-y-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Select value={value} onValueChange={val => handleFieldChange(field.id, val)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {field.options?.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {docLang === "de" ? opt.labelDe : opt.labelFr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
                if (field.type === "textarea") return (
                  <div key={field.id} className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs">{label}</Label>
                    <Textarea className="text-xs min-h-[60px]" value={value} onChange={e => handleFieldChange(field.id, e.target.value)} placeholder={field.placeholder} />
                  </div>
                );
                return (
                  <div key={field.id} className="space-y-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Input className="h-8 text-xs" type={field.type} value={value} step={field.step}
                      onChange={e => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder} />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t">
              <Button onClick={handleGenerate} disabled={generating} className="w-full gold-gradient text-[hsl(222,40%,10%)] font-bold border-0 gap-2">
                {generating
                  ? <><Loader2 className="w-4 h-4 animate-spin" />{docLang === "de" ? "PDF wird erstellt..." : "Génération du PDF..."}</>
                  : <><FileDown className="w-4 h-4" />{docLang === "de" ? "PDF erstellen & herunterladen" : "Générer & télécharger le PDF"}</>
                }
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                {docLang === "de" ? "Offizielles Bankdokument mit SwizKote-Briefkopf" : "Document bancaire officiel avec en-tête SwizKote"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── MAIN EXPORT (CORRIGÉ) ────────────────────────────────────────────────────
export default function AdminPage() {
  const [, setLocation] = useLocation();
  
  // Lecture du paramètre tab depuis l'URL à chaque rendu
  const getTabFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "stats";
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl);

  // Écouter les événements popstate (déclenchés par le sidebar via window.history.pushState)
  // ET les changements d'URL normaux (bouton retour, etc.)
  useEffect(() => {
    const handleUrlChange = () => {
      const newTab = getTabFromUrl();
      setActiveTab(newTab);
    };

    // Écouter popstate (navigation arrière/avant + notre pushState custom dans le sidebar)
    window.addEventListener("popstate", handleUrlChange);
    
    // Synchronisation initiale
    handleUrlChange();

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  // Synchronisation : quand l'onglet change via les TabsTrigger en haut, on met à jour l'URL
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    const href = `/admin?tab=${tab}`;
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-md gold-gradient flex-shrink-0">
          <Shield className="w-5 h-5 text-[hsl(222,40%,10%)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Administration</h1>
          <p className="text-sm text-muted-foreground">Panneau de gestion SwizKote Bank</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="stats" className="flex-1 gap-1.5 min-w-[100px]">
            <BarChart3 className="w-4 h-4" />Dashboard
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex-1 gap-1.5 min-w-[100px]">
            <Users className="w-4 h-4" />Clients
          </TabsTrigger>
          <TabsTrigger value="create" className="flex-1 gap-1.5 min-w-[100px]">
            <UserPlus className="w-4 h-4" />Nouveau
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex-1 gap-1.5 min-w-[100px]">
            <TrendingUp className="w-4 h-4" />Dossiers
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex-1 gap-1.5 min-w-[100px]">
            <ArrowLeftRight className="w-4 h-4" />Virements
          </TabsTrigger>
<<<<<<< HEAD
          <TabsTrigger value="cards" className="flex-1 gap-1.5 min-w-[100px]">
            <CreditCard className="w-4 h-4" />Cartes
          </TabsTrigger>
=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
          <TabsTrigger value="messages" className="flex-1 gap-1.5 min-w-[100px]">
            <MessageSquare className="w-4 h-4" />Messages
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex-1 gap-1.5 min-w-[100px]">
            <FileDown className="w-4 h-4" />PDF
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stats" className="mt-4"><AdminStats /></TabsContent>
        <TabsContent value="create" className="mt-4"><AdminCreateClient /></TabsContent>
        <TabsContent value="clients" className="mt-4"><AdminClientsV2 /></TabsContent>
        <TabsContent value="loans" className="mt-4"><AdminLoans /></TabsContent>
        <TabsContent value="transfers" className="mt-4"><AdminTransfers /></TabsContent>
<<<<<<< HEAD
        <TabsContent value="cards" className="mt-4"><AdminCards /></TabsContent>
=======
>>>>>>> a62e0d5913f2859e5b358f2feb37e5068c85d210
        <TabsContent value="messages" className="mt-4"><AdminMessages /></TabsContent>
        <TabsContent value="pdf" className="mt-4"><AdminPDF /></TabsContent>
      </Tabs>
    </div>
  );
}