import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Account } from "@shared/schema";
import { Wallet, Plus, TrendingUp, Landmark, Users, Baby, Copy, Check, BarChart3, PiggyBank, ArrowUpRight } from "lucide-react";

function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

function CopyableIban({ iban }: { iban: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  const handleCopy = () => {
    navigator.clipboard.writeText(iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-muted-foreground font-mono hover:text-foreground transition-colors group"
      title={t("copy")}
    >
      <span className="truncate max-w-[160px] sm:max-w-none">{iban}</span>
      {copied
        ? <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
        : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
      }
    </button>
  );
}

const accountTypeIcons: Record<string, typeof Wallet> = {
  main: Landmark, savings: PiggyBank, joint: Users, child: Baby,
};

const accountTypeColors: Record<string, string> = {
  main: "bg-blue-500/10 text-blue-400",
  savings: "bg-green-500/10 text-green-400",
  joint: "bg-purple-500/10 text-purple-400",
  child: "bg-orange-500/10 text-orange-400",
};

export default function AccountsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", type: "savings", currency: "CHF" });

  const accountTypeLabels: Record<string, string> = {
    main: t("acc_main"), savings: t("acc_savings"), joint: t("acc_joint"), child: t("acc_child"),
  };

  const { data: accounts, isLoading } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });

  const createAccount = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/accounts", newAccount); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({ title: t("acc_created"), description: t("acc_created_desc") });
      setShowCreate(false);
      setNewAccount({ name: "", type: "savings", currency: "CHF" });
    },
    onError: (err: any) => toast({ title: t("error"), description: err.message, variant: "destructive" }),
  });

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) || 0;
  const savingsAccounts = accounts?.filter(a => a.type === "savings") || [];
  const totalInterest = savingsAccounts.reduce((sum, a) => sum + (a.balance * (a.interestRate || 0) / 100), 0);
  const mainAccount = accounts?.find(a => a.type === "main");

  const getMainIbanLabel = () => {
    if (lang === "de") return "Hauptkonto IBAN";
    if (lang === "en") return "Main Account IBAN";
    if (lang === "it") return "IBAN Conto Principale";
    return "IBAN Principal";
  };

  const getActiveLabel = () => {
    if (lang === "de") return "Aktiv";
    if (lang === "en") return "Active";
    if (lang === "it") return "Attivo";
    return "Actif(s)";
  };

  const getInactiveLabel = () => {
    if (lang === "de") return "Inaktiv";
    if (lang === "en") return "Inactive";
    if (lang === "it") return "Inattivo";
    return "Inactif(s)";
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-accounts-title">{t("acc_title")}</h1>
          <p className="text-sm text-muted-foreground">{t("acc_subtitle")}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} data-testid="button-new-account">
          <Plus className="w-4 h-4 mr-2" />{t("acc_new")}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-[hsl(222,40%,14%)] to-[hsl(222,35%,9%)] border-[hsl(222,30%,20%)] text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-white/60 text-xs mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-gold" />
              {t("acc_total")}
            </div>
            {isLoading ? <Skeleton className="h-8 w-32 bg-white/10" /> : (
              <p className="text-2xl font-bold text-gold" data-testid="text-total-patrimoine">{formatCurrency(totalBalance)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              {t("acc_interest")}
            </div>
            {isLoading ? <Skeleton className="h-8 w-32" /> : (
              <>
                <p className="text-2xl font-bold text-green-400" data-testid="text-total-interest">{formatCurrency(totalInterest)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{t("acc_interest_rate")}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
              <Landmark className="w-3.5 h-3.5 text-gold" />
              {getMainIbanLabel()}
            </div>
            {isLoading ? <Skeleton className="h-8 w-32" /> : (
              <div className="mt-1">
                {mainAccount ? <CopyableIban iban={mainAccount.iban} /> : <span className="text-sm text-muted-foreground">—</span>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account list */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          : accounts?.map(account => {
            const Icon = accountTypeIcons[account.type] || Wallet;
            const colorClass = accountTypeColors[account.type] || "bg-gold/10 text-gold";
            const pct = totalBalance > 0 ? Math.round((account.balance / totalBalance) * 100) : 0;
            return (
              <Card key={account.id} className="hover:border-gold/30 transition-colors" data-testid={`card-account-${account.id}`}>
                <CardContent className="py-4 px-4 sm:px-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{account.name}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <Badge variant="secondary" className="text-[10px]">{accountTypeLabels[account.type]}</Badge>
                          {account.interestRate && account.interestRate > 0 && (
                            <Badge variant="secondary" className="text-[10px] text-green-400">{account.interestRate}{t("acc_per_year")}</Badge>
                          )}
                        </div>
                        <CopyableIban iban={account.iban} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold">{formatCurrency(account.balance, account.currency)}</p>
                      <p className="text-xs text-muted-foreground">{account.currency} · {pct}%</p>
                      <div className="w-20 h-1 bg-muted rounded-full mt-1 overflow-hidden ml-auto">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        }
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t("acc_open_dialog")}</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); createAccount.mutate(); }}>
            <div className="space-y-2">
              <Label>{t("acc_name")}</Label>
              <Input value={newAccount.name} onChange={e => setNewAccount({ ...newAccount, name: e.target.value })} placeholder={t("acc_name_ph")} required data-testid="input-account-name" />
            </div>
            <div className="space-y-2">
              <Label>{t("acc_type")}</Label>
              <Select value={newAccount.type} onValueChange={v => setNewAccount({ ...newAccount, type: v })}>
                <SelectTrigger data-testid="select-account-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">{t("acc_savings_opt")}</SelectItem>
                  <SelectItem value="joint">{t("acc_joint_opt")}</SelectItem>
                  <SelectItem value="child">{t("acc_child_opt")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("currency")}</Label>
              <Select value={newAccount.currency} onValueChange={v => setNewAccount({ ...newAccount, currency: v })}>
                <SelectTrigger data-testid="select-account-currency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHF">🇨🇭 CHF – {lang === "de" ? "Schweizer Franken" : lang === "en" ? "Swiss Franc" : lang === "it" ? "Franco svizzero" : "Franc suisse"}</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR – Euro</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD – {lang === "de" ? "US-Dollar" : lang === "en" ? "US Dollar" : lang === "it" ? "Dollaro USA" : "Dollar US"}</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP – {lang === "de" ? "Britisches Pfund" : lang === "en" ? "British Pound" : lang === "it" ? "Sterlina britannica" : "Livre sterling"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={createAccount.isPending} data-testid="button-create-account">
              {createAccount.isPending ? t("acc_opening") : t("acc_open_btn")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}