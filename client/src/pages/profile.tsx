import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User, Mail, Phone, Shield, Key, Eye, EyeOff,
  CheckCircle2, Edit2, Save, X, Lock, Building2,
} from "lucide-react";
import { format } from "date-fns";
import { fr, de, enGB, it } from "date-fns/locale";

export default function ProfilePage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const getLocale = () => {
    if (lang === "de") return de;
    if (lang === "en") return enGB;
    if (lang === "it") return it;
    return fr;
  };
  const locale = getLocale();

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("PATCH", "/api/auth/profile", profileForm);
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setEditProfile(false);
      toast({ title: lang === "de" ? "Profil aktualisiert ✓" : lang === "en" ? "Profile updated ✓" : lang === "it" ? "Profilo aggiornato ✓" : "Profil mis à jour ✓" });
    },
    onError: (err: any) => toast({ title: t("error"), description: err.message, variant: "destructive" }),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (pwdForm.newPassword !== pwdForm.confirmPassword) throw new Error(lang === "de" ? "Passwörter stimmen nicht überein" : lang === "en" ? "Passwords do not match" : lang === "it" ? "Le password non corrispondono" : "Les mots de passe ne correspondent pas");
      if (pwdForm.newPassword.length < 8) throw new Error(lang === "de" ? "Mindestens 8 Zeichen erforderlich" : lang === "en" ? "Minimum 8 characters required" : lang === "it" ? "Minimo 8 caratteri richiesti" : "Minimum 8 caractères requis");
      const r = await apiRequest("POST", "/api/auth/change-password", { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => {
      setShowPwdForm(false);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: lang === "de" ? "Passwort geändert ✓" : lang === "en" ? "Password changed ✓" : lang === "it" ? "Password modificata ✓" : "Mot de passe modifié ✓" });
    },
    onError: (err: any) => toast({ title: t("error"), description: err.message, variant: "destructive" }),
  });

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const pwdStrength = pwdForm.newPassword.length === 0 ? 0 : pwdForm.newPassword.length < 8 ? 1 : pwdForm.newPassword.length < 12 ? 2 : 3;

  const getStrengthLabel = () => {
    if (pwdStrength === 1) return lang === "de" ? "Schwach" : lang === "en" ? "Weak" : lang === "it" ? "Debole" : "Faible";
    if (pwdStrength === 2) return lang === "de" ? "Mittel" : lang === "en" ? "Medium" : lang === "it" ? "Medio" : "Moyen";
    return lang === "de" ? "Stark" : lang === "en" ? "Strong" : lang === "it" ? "Forte" : "Fort";
  };

  const getStrengthColor = () => {
    if (pwdStrength === 1) return "bg-red-500";
    if (pwdStrength === 2) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">{lang === "de" ? "Mein Profil" : lang === "en" ? "My Profile" : lang === "it" ? "Il mio profilo" : "Mon profil"}</h1>
        <p className="text-sm text-muted-foreground">{lang === "de" ? "Persönliche Daten und Sicherheit" : lang === "en" ? "Personal data and security" : lang === "it" ? "Dati personali e sicurezza" : "Données personnelles et sécurité"}</p>
      </div>

      {/* Avatar + identity */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start gap-5 flex-wrap">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center text-3xl font-bold text-[hsl(222,40%,10%)]">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editProfile ? (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">{lang === "de" ? "Vollständiger Name" : lang === "en" ? "Full name" : lang === "it" ? "Nome completo" : "Nom complet"}</Label>
                    <Input className="h-8 text-sm" value={profileForm.fullName}
                      onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Email</Label>
                    <Input className="h-8 text-sm" type="email" value={profileForm.email}
                      onChange={e => setProfileForm({...profileForm, email: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{lang === "de" ? "Telefon" : lang === "en" ? "Phone" : lang === "it" ? "Telefono" : "Téléphone"}</Label>
                    <Input className="h-8 text-sm" value={profileForm.phone}
                      onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                      placeholder="+41 79 000 00 00" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 gap-1" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
                      <Save className="w-3 h-3" />{lang === "de" ? "Speichern" : lang === "en" ? "Save" : lang === "it" ? "Salva" : "Enregistrer"}
                    </Button>
                    <Button size="sm" variant="outline" className="h-8" onClick={() => { setEditProfile(false); setProfileForm({ fullName: user?.fullName||"", email: user?.email||"", phone: user?.phone||"" }); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold">{user?.fullName}</h2>
                    <Badge variant="secondary" className="text-[10px]">
                      {user?.role === "admin" ? (lang === "de" ? "Administrator" : lang === "en" ? "Administrator" : lang === "it" ? "Amministratore" : "Administrateur") : (lang === "de" ? "Kunde" : lang === "en" ? "Client" : lang === "it" ? "Cliente" : "Client")}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />{user?.email}
                    </div>
                    {user?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />{user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-3.5 h-3.5" />{user?.username}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 mt-3 text-xs gap-1" onClick={() => setEditProfile(true)}>
                    <Edit2 className="w-3 h-3" />{lang === "de" ? "Bearbeiten" : lang === "en" ? "Edit" : lang === "it" ? "Modifica" : "Modifier"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[hsl(var(--gold))]" />
            <span className="text-sm font-semibold">{lang === "de" ? "Kontoinformationen" : lang === "en" ? "Account information" : lang === "it" ? "Informazioni del conto" : "Informations du compte"}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: lang === "de" ? "Benutzername" : lang === "en" ? "Username" : lang === "it" ? "Nome utente" : "Identifiant", value: user?.username, icon: User },
            { label: "ID", value: user?.id?.slice(0,12) + "...", icon: Shield },
            { label: lang === "de" ? "Mitglied seit" : lang === "en" ? "Member since" : lang === "it" ? "Membro dal" : "Membre depuis", value: user?.createdAt ? format(new Date(user.createdAt), "d MMMM yyyy", { locale }) : "—", icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Icon className="w-4 h-4 text-[hsl(var(--gold))] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium font-mono">{value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[hsl(var(--gold))]" />
            <span className="text-sm font-semibold">{lang === "de" ? "Sicherheit" : lang === "en" ? "Security" : lang === "it" ? "Sicurezza" : "Sécurité"}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security indicators */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: lang === "de" ? "Konto aktiv" : lang === "en" ? "Account active" : lang === "it" ? "Conto attivo" : "Compte actif", ok: true },
              { label: "AES-256", ok: true },
              { label: "FINMA", ok: true },
            ].map(({ label, ok }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-[10px] font-medium text-center">{label}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Change password */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[hsl(var(--gold))]" />
                <span className="text-sm font-medium">{lang === "de" ? "Passwort ändern" : lang === "en" ? "Change password" : lang === "it" ? "Cambia password" : "Changer le mot de passe"}</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowPwdForm(!showPwdForm)}>
                {showPwdForm ? <X className="w-3 h-3" /> : <Lock className="w-3 h-3 mr-1" />}
                {showPwdForm ? (lang === "de" ? "Abbrechen" : lang === "en" ? "Cancel" : lang === "it" ? "Annulla" : "Annuler") : (lang === "de" ? "Ändern" : lang === "en" ? "Change" : lang === "it" ? "Modifica" : "Modifier")}
              </Button>
            </div>

            {showPwdForm && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === "de" ? "Aktuelles Passwort" : lang === "en" ? "Current password" : lang === "it" ? "Password attuale" : "Mot de passe actuel"}</Label>
                  <div className="relative">
                    <Input type={showCurrent ? "text" : "password"} className="h-9 text-sm pr-10"
                      value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} />
                    <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowCurrent(!showCurrent)}>
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === "de" ? "Neues Passwort" : lang === "en" ? "New password" : lang === "it" ? "Nuova password" : "Nouveau mot de passe"}</Label>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} className="h-9 text-sm pr-10"
                      value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} />
                    <button type="button" className="absolute right-3 top-2.5 text-muted-foreground" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {pwdForm.newPassword && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwdStrength ? getStrengthColor() : "bg-muted"}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{getStrengthLabel()}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === "de" ? "Passwort bestätigen" : lang === "en" ? "Confirm password" : lang === "it" ? "Conferma password" : "Confirmer le mot de passe"}</Label>
                  <Input type="password" className="h-9 text-sm"
                    value={pwdForm.confirmPassword} onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})} />
                  {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                    <p className="text-[10px] text-red-500">{lang === "de" ? "Passwörter stimmen nicht überein" : lang === "en" ? "Passwords do not match" : lang === "it" ? "Le password non corrispondono" : "Les mots de passe ne correspondent pas"}</p>
                  )}
                </div>

                <Button className="w-full h-9 gap-2" onClick={() => changePassword.mutate()}
                  disabled={!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword || changePassword.isPending}>
                  {changePassword.isPending ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Key className="w-4 h-4" />}
                  {lang === "de" ? "Passwort aktualisieren" : lang === "en" ? "Update password" : lang === "it" ? "Aggiorna password" : "Mettre à jour le mot de passe"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{lang === "de" ? "Rechtliches" : lang === "en" ? "Legal information" : lang === "it" ? "Informazioni legali" : "Informations légales"}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>FINMA {lang === "de" ? "zugelassen" : lang === "en" ? "licensed" : lang === "it" ? "autorizzato" : "agréé"}</span>
            <span>AES-256 {lang === "de" ? "Verschlüsselung" : lang === "en" ? "encryption" : lang === "it" ? "crittografia" : "chiffrement"}</span>
            <span>{lang === "de" ? "Einlagensicherung CHF 100'000" : lang === "en" ? "Deposit protection CHF 100,000" : lang === "it" ? "Garanzia depositi CHF 100.000" : "Garantie dépôts CHF 100'000"}</span>
            <span>{lang === "de" ? "Schweizer Bankgeheimnis" : lang === "en" ? "Swiss banking secrecy" : lang === "it" ? "Segreto bancario svizzero" : "Secret bancaire suisse"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}