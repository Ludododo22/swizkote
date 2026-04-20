import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Message } from "@shared/schema";
import { Send, MessageSquare, Shield, Lock, CheckCheck, Info } from "lucide-react";
import { format } from "date-fns";
import { fr, de, enGB, it } from "date-fns/locale";

export default function MessagesPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const getLocale = () => {
    if (lang === "de") return de;
    if (lang === "en") return enGB;
    if (lang === "it") return it;
    return fr;
  };
  const locale = getLocale();
  
  const de_lang = lang === "de";

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 5000,
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/messages", { content: message, userId: "", fromAdmin: false });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setMessage("");
    },
    onError: (err: any) => toast({ title: t("error"), description: err.message, variant: "destructive" }),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickReplies = de_lang
    ? ["Guten Tag, ich habe eine Frage.", "Wann kann ich einen Termin vereinbaren?", "Ich benötige einen Kontoauszug.", "Bitte rufen Sie mich zurück."]
    : lang === "en"
    ? ["Hello, I have a question.", "When can I schedule an appointment?", "I need a bank statement.", "Please call me back."]
    : lang === "it"
    ? ["Buongiorno, ho una domanda.", "Quando posso fissare un appuntamento?", "Ho bisogno di un estratto conto.", "Per favore richiamatemi."]
    : ["Bonjour, j'ai une question.", "Quand puis-je prendre rendez-vous ?", "J'ai besoin d'un relevé de compte.", "Merci de me rappeler."];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto flex flex-col gap-4" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold" data-testid="text-messages-title">{t("msg_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("msg_subtitle")}</p>
      </div>

      {/* Advisor info bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl border bg-card flex-shrink-0">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarFallback className="gold-gradient text-[hsl(222,40%,10%)] text-sm font-bold">CB</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{de_lang ? "Ihr persönlicher Berater" : lang === "en" ? "Your personal advisor" : lang === "it" ? "Il tuo consulente personale" : "Votre conseiller dédié"}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{de_lang ? "Online – Antwortzeit < 2h" : lang === "en" ? "Online – Response time < 2h" : lang === "it" ? "Online – Tempo di risposta < 2h" : "En ligne – Répond en < 2h"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Lock className="w-3 h-3 text-gold" />
          <span className="text-xs text-gold">{t("msg_encrypted")}</span>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          {/* Messages scroll */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
          >
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <Skeleton className="h-10 w-48" />
                  </div>
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              <>
                {/* Date separator */}
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground px-2">{de_lang ? "Heute" : lang === "en" ? "Today" : lang === "it" ? "Oggi" : "Aujourd'hui"}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {messages.map(msg => {
                  const isMe = !msg.fromAdmin;
                  return (
                    <div key={msg.id} className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`} data-testid={`msg-${msg.id}`}>
                      {!isMe && (
                        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
                          <AvatarFallback className="bg-gold/20 text-gold text-[10px] font-bold">CB</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                        <div className={`rounded-2xl px-3.5 py-2.5 ${
                          isMe
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-muted"
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 ${isMe ? "flex-row-reverse" : ""}`}>
                          <p className="text-[10px] text-muted-foreground">
                            {msg.createdAt ? format(new Date(msg.createdAt), "HH:mm", { locale }) : ""}
                          </p>
                          {isMe && <CheckCheck className="w-3 h-3 text-gold" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">{t("msg_start")}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {de_lang ? "Wählen Sie eine Schnellantwort oder schreiben Sie frei" : lang === "en" ? "Choose a quick reply or write freely" : lang === "it" ? "Scegli una risposta rapida o scrivi liberamente" : "Choisissez une réponse rapide ou écrivez librement"}
                </p>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {!messages?.length && (
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
              {quickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => setMessage(qr)}
                  className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors flex-shrink-0"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 flex-shrink-0">
            <form
              onSubmit={e => { e.preventDefault(); if (message.trim()) sendMessage.mutate(); }}
              className="flex gap-2"
            >
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t("msg_placeholder")}
                className="flex-1"
                data-testid="input-message"
              />
              <Button
                type="submit"
                size="icon"
                className="gold-gradient text-[hsl(222,40%,10%)] flex-shrink-0"
                disabled={!message.trim() || sendMessage.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-2 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              {de_lang ? "Ende-zu-Ende verschlüsselt · AES-256" : lang === "en" ? "End-to-end encrypted · AES-256" : lang === "it" ? "Crittografato end-to-end · AES-256" : "Chiffré de bout en bout · AES-256"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}