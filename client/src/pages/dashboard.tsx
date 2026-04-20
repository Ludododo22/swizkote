import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import type { Account, Transaction, Transfer } from "@shared/schema";
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Clock, Eye, EyeOff,
  Bell, CreditCard, Send, PiggyBank, Shield, ChevronRight, Star,
  RefreshCw, MessageSquare, FolderOpen, Zap, Activity, Download, Printer,
  MessageCircle, X, LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { fr, de, it, enGB } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function formatCurrency(amount: number, currency = "CHF") {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
}

// ── Chat Widget ───────────────────────────────────────────────────────────────
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
    const userMsg = { from: "user", text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    // Simulated agent response after delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        from: "agent",
        text: t("lang_fr") === "Français"
          ? "Merci pour votre message. Un conseiller vous répondra dans les plus brefs délais."
          : t("lang_de") === "Deutsch"
          ? "Danke für Ihre Nachricht. Ein Berater wird Ihnen so bald wie möglich antworten."
          : "Thank you for your message. An advisor will respond to you as soon as possible.",
      }]);
    }, 1200);
  };

  return (
    <>
      {/* Chat Badge Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gold text-[hsl(222,40%,10%)] px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold text-sm"
        data-testid="button-chat-support"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">{t("chat_title")}</span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[min(360px,calc(100vw-2rem))] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: "min(480px, 80dvh)" }}>
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
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.from === "user"
                    ? "bg-gold text-[hsl(222,40%,10%)] font-medium rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}>
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
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <button
              onClick={send}
              className="bg-gold text-[hsl(222,40%,10%)] px-3 py-2 rounded-lg font-semibold text-sm hover:bg-gold/90 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Notification Bell ─────────────────────────────────────────────────────────
function NotificationBell({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const { t, lang } = useI18n();
  const de_lang = lang === "de";

  type NotifItem = { id: number; text: string; time: string; icon: any; color: string };
  const notifsByLang: Record<string, NotifItem[]> = {
    de: [
      { id: 1, text: "Neue Überweisung eingegangen", time: "vor 5 Min.", icon: Send, color: "text-green-500" },
      { id: 2, text: "Ihre Karte läuft in 30 Tagen ab", time: "heute", icon: CreditCard, color: "text-gold" },
      { id: 3, text: "Neues Beratergespräch verfügbar", time: "gestern", icon: MessageSquare, color: "text-blue-400" },
    ],
    en: [
      { id: 1, text: "New transfer received", time: "5 min ago", icon: Send, color: "text-green-500" },
      { id: 2, text: "Your card expires in 30 days", time: "today", icon: CreditCard, color: "text-gold" },
      { id: 3, text: "New message from your advisor", time: "yesterday", icon: MessageSquare, color: "text-blue-400" },
    ],
    it: [
      { id: 1, text: "Nuovo bonifico ricevuto", time: "5 min fa", icon: Send, color: "text-green-500" },
      { id: 2, text: "La sua carta scade tra 30 giorni", time: "oggi", icon: CreditCard, color: "text-gold" },
      { id: 3, text: "Nuovo messaggio dal suo consulente", time: "ieri", icon: MessageSquare, color: "text-blue-400" },
    ],
    fr: [
      { id: 1, text: "Nouveau virement reçu", time: "il y a 5 min", icon: Send, color: "text-green-500" },
      { id: 2, text: "Votre carte expire dans 30 jours", time: "aujourd'hui", icon: CreditCard, color: "text-gold" },
      { id: 3, text: "Nouveau message de votre conseiller", time: "hier", icon: MessageSquare, color: "text-blue-400" },
    ],
  };
  const notifs = notifsByLang[lang] ?? notifsByLang.fr;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        data-testid="button-notifications"
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {count > 0 && <span className="notification-badge">{count}</span>}
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-card border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold">{lang === "de" ? "Benachrichtigungen" : lang === "en" ? "Notifications" : lang === "it" ? "Notifiche" : "Notifications"}</span>
            <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {lang === "de" ? "Alle als gelesen markieren" : lang === "en" ? "Mark all as read" : lang === "it" ? "Segna tutto come letto" : "Tout marquer comme lu"}
            </button>
          </div>
          <div className="divide-y">
            {notifs.map(n => {
              const Icon = n.icon;
              return (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${n.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-2" />
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t text-center">
            <Link href="/messages" className="text-xs text-gold hover:underline">
              {lang === "de" ? "Alle Nachrichten anzeigen" : lang === "en" ? "View all messages" : lang === "it" ? "Vedi tutti i messaggi" : "Voir tous les messages"} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mini Stat Card ────────────────────────────────────────────────────────────
function MiniStat({
  icon: Icon, label, value, trend, color = "text-gold"
}: {
  icon: any; label: string; value: string; trend?: string; color?: string;
}) {
  return (
    <Card className="stat-card-shine">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          {trend && (
            <span className="text-xs font-medium text-green-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />{trend}
            </span>
          )}
        </div>
        <p className="text-lg font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const locale = lang === "de" ? de : lang === "it" ? it : lang === "en" ? enGB : fr;
  const de_lang = lang === "de";

  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({ queryKey: ["/api/accounts"] });
  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({ queryKey: ["/api/transactions"] });
  const { data: transfers } = useQuery<Transfer[]>({ queryKey: ["/api/transfers"] });

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) || 0;
  const mainAccount = accounts?.find(a => a.type === "main");
  const savingsAccount = accounts?.find(a => a.type === "savings");
  const activeTransfers = transfers?.filter(t => t.status === "processing" || t.status === "pending") || [];
  const completedTransfers = transfers?.filter(t => t.status === "completed") || [];

  // Last login display
  const previousLogin = (user as any)?.previousLoginAt;
  const lastLoginLabel = t("dash_last_login");

  // Statement download handler (client-side CSV)
  const handleDownloadStatement = () => {
    if (!transactions || transactions.length === 0) return;
    const header = ["Date","Description","Type","Amount","Currency"];
    const rows = transactions.map(tx => [
      tx.date ? format(new Date(tx.date), "dd/MM/yyyy HH:mm") : "",
      `"${tx.description}"`,
      tx.type,
      tx.type === "credit" ? `+${tx.amount}` : `-${Math.abs(tx.amount)}`,
      tx.currency,
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SWIZKOTE_releve_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const chartData = useMemo(() => {
    const months = t("dash_months").split(",");
    let bal = totalBalance * 0.82;
    return months.map((month, i) => {
      bal += totalBalance * (0.02 + Math.random() * 0.03);
      if (i === months.length - 1) bal = totalBalance;
      return { month, balance: Math.round(bal) };
    });
  }, [totalBalance, lang]);

  // Quick actions data - all 4 languages
  const quickActions = [
    { label: lang === "de" ? "Überweisung" : lang === "en" ? "Transfer" : lang === "it" ? "Bonifico" : "Virement", icon: Send, href: "/transfers", color: "text-blue-400" },
    { label: lang === "de" ? "Konten" : lang === "en" ? "Accounts" : lang === "it" ? "Conti" : "Comptes", icon: Wallet, href: "/accounts", color: "text-gold" },
    { label: lang === "de" ? "Karten" : lang === "en" ? "Cards" : lang === "it" ? "Carte" : "Cartes", icon: CreditCard, href: "/cards", color: "text-purple-400" },
    { label: lang === "de" ? "Kredit" : lang === "en" ? "Loan" : lang === "it" ? "Prestito" : "Prêt", icon: PiggyBank, href: "/loan-request", color: "text-green-400" },
    { label: lang === "de" ? "Tresor" : lang === "en" ? "Vault" : lang === "it" ? "Cassaforte" : "Coffre", icon: Shield, href: "/vault", color: "text-orange-400" },
    { label: lang === "de" ? "Nachrichten" : lang === "en" ? "Messages" : lang === "it" ? "Messaggi" : "Messages", icon: MessageSquare, href: "/messages", color: "text-pink-400" },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate" data-testid="text-welcome">
            {t("dash_hello")}, {user?.fullName?.split(" ")[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t("dash_subtitle")}</p>
          {previousLogin && (
            <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-xs text-muted-foreground/70 flex-wrap">
              <LogIn className="w-3 h-3 text-gold/60 flex-shrink-0" />
              <span>{lastLoginLabel} : </span>
              <span className="font-medium text-muted-foreground">
                {format(new Date(previousLogin), "dd MMM yyyy, HH:mm", { locale })}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 sm:w-auto sm:px-3 gap-1.5 text-xs border-gold/30 hover:border-gold/60 hover:bg-gold/5 p-0 sm:p-2"
            onClick={handleDownloadStatement}
            title={t("dash_download_statement")}
          >
            <Download className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">{t("dash_download_statement")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 sm:w-auto sm:px-3 gap-1.5 text-xs border-gold/30 hover:border-gold/60 hover:bg-gold/5 p-0 sm:p-2"
            onClick={handlePrintStatement}
            title={t("dash_print_statement")}
          >
            <Printer className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">{t("dash_print_statement")}</span>
          </Button>
          <NotificationBell count={3} />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowBalance(!showBalance)} data-testid="button-toggle-balance">
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* ── Balance Cards ── */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total balance - spans full width on mobile, 2 cols on sm+ */}
        <Card className="col-span-2 bg-gradient-to-br from-[hsl(222,40%,14%)] to-[hsl(222,35%,9%)] border-[hsl(222,30%,20%)] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
                <Wallet className="w-4 h-4 text-gold" />
                {t("dash_total_balance")}
              </div>
              <Badge className="bg-gold/20 text-gold border-0 text-[10px] sm:text-xs">{t("dash_all_accounts")}</Badge>
            </div>
            {accountsLoading ? <Skeleton className="h-8 sm:h-10 w-36 sm:w-48 bg-white/10" /> : (
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-white" data-testid="text-total-balance">
                {showBalance ? formatCurrency(totalBalance) : "CHF ••• •••"}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">+2.4%</span>
              <span className="text-[10px] sm:text-xs text-white/50 ml-1">{t("dash_this_month")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Main account */}
        <MiniStat
          icon={Wallet}
          label={lang === "de" ? "Hauptkonto" : lang === "en" ? "Main account" : lang === "it" ? "Conto principale" : "Compte principal"}
          value={showBalance ? formatCurrency(mainAccount?.balance || 0) : "CHF •••"}
          color="text-gold"
        />

        {/* Active transfers */}
        <MiniStat
          icon={Activity}
          label={lang === "de" ? "Aktive Überweisungen" : lang === "en" ? "Active transfers" : lang === "it" ? "Bonifici attivi" : "Virements actifs"}
          value={String(activeTransfers.length)}
          trend={completedTransfers.length > 0 ? `${completedTransfers.length} ${lang === "de" ? "erledigt" : lang === "en" ? "done" : lang === "it" ? "completati" : "terminés"}` : undefined}
          color="text-blue-400"
        />
      </div>

      {/* ── Quick Actions ── */}
      <Card>
        <CardHeader className="pb-2 px-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{t("dash_quick_actions")}</span>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div className="flex flex-col items-center gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-muted group-hover:bg-background flex items-center justify-center transition-colors">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`} />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-medium text-center leading-tight text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Chart + Active Transfers ── */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 px-3 sm:px-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium">{t("dash_wealth_chart")}</span>
            </div>
            <Badge variant="secondary">{t("dash_six_months")}</Badge>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="h-[160px] sm:h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(42, 80%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(42, 80%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 20%)" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(220, 15%, 60%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 15%, 60%)" tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={35} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(222, 32%, 12%)", border: "1px solid hsl(222, 30%, 20%)", borderRadius: "8px", color: "hsl(220, 20%, 95%)", fontSize: "12px" }}
                    formatter={(value: number) => [formatCurrency(value), t("balance")]}
                  />
                  <Area type="monotone" dataKey="balance" stroke="hsl(42, 80%, 55%)" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Active transfers widget */}
          {activeTransfers.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium">{t("dash_active_tx")}</span>
                </div>
                <Badge variant="secondary">{activeTransfers.length}</Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeTransfers.slice(0, 3).map(tf => (
                  <Link key={tf.id} href={`/transfers/${tf.id}`}>
                    <div className="flex items-center justify-between gap-2 hover-elevate rounded-lg p-2 -mx-2 cursor-pointer">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{tf.recipientName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold rounded-full transition-all"
                              style={{ width: `${tf.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{tf.progress}%</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gold flex-shrink-0">{formatCurrency(tf.amount, tf.currency)}</span>
                    </div>
                  </Link>
                ))}
                <Link href="/transfers">
                  <button className="w-full text-xs text-gold hover:underline flex items-center justify-center gap-1 pt-1">
                    {lang === "de" ? "Alle anzeigen" : lang === "en" ? "See all" : lang === "it" ? "Vedi tutto" : "Voir tout"} <ChevronRight className="w-3 h-3" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Savings account */}
          {savingsAccount && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-gold" />
                  <span className="text-sm font-medium">{lang === "de" ? "Sparkonto" : lang === "en" ? "Savings" : lang === "it" ? "Risparmio" : "Épargne"}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">
                  {showBalance ? formatCurrency(savingsAccount.balance) : "CHF •••"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-gold" />
                  <span className="text-xs text-gold">{lang === "de" ? "4% Zinsen / Jahr" : lang === "en" ? "4% interest / year" : lang === "it" ? "4% interessi / anno" : "4% intérêts / an"}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vault shortcut */}
          <Card className="cursor-pointer hover:border-gold/40 transition-colors">
            <Link href="/vault">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{lang === "de" ? "Digitaler Tresor" : lang === "en" ? "Digital Vault" : lang === "it" ? "Cassaforte digitale" : "Coffre numérique"}</p>
                  <p className="text-xs text-muted-foreground">{lang === "de" ? "Dokumente sicher aufbewahren" : lang === "en" ? "Secure documents" : lang === "it" ? "Documenti sicuri" : "Documents sécurisés"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-auto" />
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{t("dash_recent_tx")}</span>
          </div>
          <Badge variant="secondary">{transactions?.length || 0}</Badge>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-1">
              {transactions.slice(0, 8).map(tx => (
                <div key={tx.id} className="flex items-center justify-between gap-3 p-3 rounded-lg hover-elevate" data-testid={`row-transaction-${tx.id}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${tx.type === "credit" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                      {tx.type === "credit" ? <ArrowDownLeft className="w-4 h-4 text-green-500" /> : <ArrowUpRight className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{tx.date ? format(new Date(tx.date), "d MMM yyyy", { locale }) : ""}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ${tx.type === "credit" ? "text-green-500" : ""}`}>
                    {tx.type === "credit" ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <FolderOpen className="w-8 h-8 text-muted-foreground/50 mx-auto" />
              <p className="text-sm text-muted-foreground">{t("dash_no_tx")}</p>
              <Link href="/transfers">
                <Button variant="outline" size="sm" className="mt-2">
                  {lang === "de" ? "Erste Überweisung tätigen" : lang === "en" ? "Make a transfer" : lang === "it" ? "Effettua un bonifico" : "Effectuer un virement"}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Chat Support Widget ── */}
      <ChatWidget />
    </div>
  );
}
