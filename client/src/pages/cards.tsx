import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Card as CardType } from "@shared/schema";
import { CreditCard, Wifi, Globe, Lock, ShieldCheck, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", minimumFractionDigits: 0 }).format(amount);
}

function CardVisual({ card, bankName }: { card: CardType; bankName: string }) {
  const isVisa = card.type === "visa_infinite";
  const { t } = useI18n();
  const statusLabel = card.status === "active" ? t("card_status_active")
    : card.status === "ordered" ? t("card_status_ordered")
    : card.status === "blocked" ? t("card_status_blocked")
    : t("card_status_inactive");
  return (
    <div className={`relative w-full aspect-[1.586/1] max-w-sm rounded-md overflow-visible p-6 flex flex-col justify-between ${isVisa ? "gold-gradient" : "bg-gradient-to-br from-[hsl(222,35%,20%)] to-[hsl(222,40%,12%)]"}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium ${isVisa ? "text-[hsl(222,40%,10%)]/60" : "text-white/60"}`}>{bankName}</p>
          <p className={`text-[10px] ${isVisa ? "text-[hsl(222,40%,10%)]/40" : "text-white/40"}`}>{isVisa ? "Visa Infinite" : "Mastercard Gold"}</p>
        </div>
        <div className={`w-8 h-8 rounded-full ${isVisa ? "bg-[hsl(222,40%,10%)]/10" : "bg-white/10"} flex items-center justify-center`}>
          <CreditCard className={`w-4 h-4 ${isVisa ? "text-[hsl(222,40%,10%)]" : "text-white"}`} />
        </div>
      </div>
      <div>
        <p className={`font-mono text-lg tracking-widest mb-2 ${isVisa ? "text-[hsl(222,40%,10%)]" : "text-white"}`}>
          {card.cardNumber.replace(/(.{4})/g, "$1 ").trim()}
        </p>
        <div className="flex items-end justify-between gap-2">
          <p className={`text-xs ${isVisa ? "text-[hsl(222,40%,10%)]/70" : "text-white/70"}`}>Exp: {card.expirationDate}</p>
          <Badge variant={card.status === "active" ? "default" : "secondary"} className="text-[10px]">{statusLabel}</Badge>
        </div>
      </div>
    </div>
  );
}

export default function CardsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const de_lang = lang === "de";

  const { data: cards, isLoading } = useQuery<CardType[]>({ queryKey: ["/api/cards"] });

  const updateCard = useMutation({
    mutationFn: async ({ cardId, data }: { cardId: string; data: any }) => {
      await apiRequest("PATCH", `/api/cards/${cardId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({ title: t("card_updated") });
    },
    onError: (err: any) => toast({ title: t("error"), description: err.message, variant: "destructive" }),
  });

  const activeCards = cards?.filter(c => c.status === "active") || [];
  const blockedCards = cards?.filter(c => c.status === "blocked") || [];
  const totalMonthlyLimit = cards?.reduce((sum, c) => sum + (c.monthlyLimit || 20000), 0) || 0;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold" data-testid="text-cards-title">{t("cards_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("cards_subtitle")}</p>
      </div>

      {/* Summary stats */}
      {cards && cards.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <ShieldCheck className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-400">{activeCards.length}</p>
              <p className="text-[10px] text-muted-foreground">{de_lang ? "Aktiv" : "Active(s)"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <AlertCircle className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-400">{blockedCards.length}</p>
              <p className="text-[10px] text-muted-foreground">{de_lang ? "Gesperrt" : "Bloquée(s)"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-4 h-4 text-gold mx-auto mb-1" />
              <p className="text-sm font-bold text-gold">{formatCurrency(totalMonthlyLimit)}</p>
              <p className="text-[10px] text-muted-foreground">{de_lang ? "Monatslimit" : "Limite mois"}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4"><Skeleton className="h-48 w-full max-w-sm" /><Skeleton className="h-32 w-full" /></div>
      ) : cards && cards.length > 0 ? (
        <div className="space-y-8">
          {cards.map(card => (
            <div key={card.id} className="space-y-4" data-testid={`card-bank-${card.id}`}>
              <CardVisual card={card} bankName="SWIZKOTE" />

              {/* Status bar */}
              {card.status === "blocked" && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  {de_lang ? "Diese Karte ist gesperrt. Entsperren Sie sie über die Einstellungen." : "Cette carte est bloquée. Débloquez-la via les paramètres."}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Settings */}
                <Card>
                  <CardHeader className="pb-2"><span className="text-sm font-medium">{t("card_settings")}</span></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Wifi className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-sm truncate">{t("card_contactless")}</span>
                      </div>
                      <Switch
                        checked={card.contactlessEnabled || false}
                        onCheckedChange={checked => updateCard.mutate({ cardId: card.id, data: { contactlessEnabled: checked } })}
                        data-testid={`switch-contactless-${card.id}`}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="w-4 h-4 text-gold flex-shrink-0" />
                        <span className="text-sm truncate">{t("card_international")}</span>
                      </div>
                      <Switch
                        checked={card.internationalEnabled || false}
                        onCheckedChange={checked => updateCard.mutate({ cardId: card.id, data: { internationalEnabled: checked } })}
                        data-testid={`switch-international-${card.id}`}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Lock className="w-4 h-4 text-destructive flex-shrink-0" />
                        <span className="text-sm truncate">{t("card_block")}</span>
                      </div>
                      <Switch
                        checked={card.status === "blocked"}
                        onCheckedChange={checked => updateCard.mutate({ cardId: card.id, data: { status: checked ? "blocked" : "active" } })}
                        data-testid={`switch-block-${card.id}`}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Limits */}
                <Card>
                  <CardHeader className="pb-2"><span className="text-sm font-medium">{t("card_limits")}</span></CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">{t("card_weekly")}</span>
                        <span className="text-sm font-semibold text-gold">{formatCurrency(card.weeklyLimit || 5000)}</span>
                      </div>
                      <Slider
                        value={[card.weeklyLimit || 5000]}
                        max={20000} min={500} step={500}
                        onValueCommit={v => updateCard.mutate({ cardId: card.id, data: { weeklyLimit: v[0] } })}
                        data-testid={`slider-weekly-${card.id}`}
                        className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold [&_.relative>div]:bg-gold"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">{t("card_monthly")}</span>
                        <span className="text-sm font-semibold text-gold">{formatCurrency(card.monthlyLimit || 20000)}</span>
                      </div>
                      <Slider
                        value={[card.monthlyLimit || 20000]}
                        max={100000} min={1000} step={1000}
                        onValueCommit={v => updateCard.mutate({ cardId: card.id, data: { monthlyLimit: v[0] } })}
                        data-testid={`slider-monthly-${card.id}`}
                        className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold [&_.relative>div]:bg-gold"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium mb-1">{t("cards_none")}</p>
            <p className="text-xs text-muted-foreground">
              {de_lang ? "Kontaktieren Sie Ihren Berater für eine neue Karte" : "Contactez votre conseiller pour une nouvelle carte"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
