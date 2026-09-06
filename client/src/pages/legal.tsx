import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { LangSwitcher } from "@/components/lang-switcher";
import { useI18n } from "@/lib/i18n";
import { Sun, Moon, ArrowLeft, Scale } from "lucide-react";
const logoImg = "/logo.png";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (<Button variant="ghost" size="icon" onClick={toggleTheme}>{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</Button>);
}

const SECTIONS = {
  de: [
    { title: "Identifizierung des Instituts", content: [["Firmenname","SWIZKOTE SA"],["Rechtsform","Aktiengesellschaft nach Schweizer Recht"],["Grundkapital","CHF 250.000.000 (vollständig einbezahlt)"],["UID-Nummer","CHE-123.456.789"],["Sitz","Rue du Rhône 42, 1204 Genf, Schweiz"],["Telefon","+41 22 000 00 00"],["E-Mail","kontakt@swizkote.ch"],["Website","www.swizkote.ch"]], text: null },
    { title: "Zulassung und Aufsicht", content: [["Regulierungsbehörde","Eidgenössische Finanzmarktaufsicht (FINMA)"],["FINMA-Lizenznummer","B-01234/2024"],["Status","Zugelassenes Bankinstitut"],["Einlagensicherung","CHF 100.000 pro Einleger (esisuisse)"],["esisuisse-Registernummer","ES-7654"],["Anwendbares Recht","Bundesgesetz über die Banken (BankG) vom 8. November 1934"]], text: null },
    { title: "Geschäftsleitung und Governance", content: [["Verwaltungsratspräsident","Dr. Hans-Peter Müller"],["Generaldirektorin (CEO)","Marie-Claire Dubois"],["Finanzchef (CFO)","Antoine Bertrand"],["Risikochefin (CRO)","Dr. Sophia Keller"],["Revisionsstelle","PricewaterhouseCoopers SA, Genf"]], text: null },
    { title: "Geistiges Eigentum", content: null, text: "Alle Inhalte dieser Website (Texte, Bilder, Grafiken, Logo, Symbole, Töne, Software) sind ausschliessliches Eigentum der SWIZKOTE SA oder ihrer Partner und durch Schweizer und internationale Gesetze zum Schutz des geistigen Eigentums geschützt. Jede Vervielfältigung, Darstellung, Änderung, Veröffentlichung oder Anpassung von Elementen der Website ist ohne vorherige schriftliche Genehmigung der SWIZKOTE SA untersagt." },
    { title: "Haftungsausschluss", content: null, text: "Die auf dieser Website enthaltenen Informationen dienen ausschliesslich Informationszwecken und stellen keine Anlage-, Rechts- oder Steuerberatung dar. Die SWIZKOTE SA übernimmt keine Haftung für Fehler, Auslassungen oder Ungenauigkeiten in den auf dieser Website verbreiteten Informationen." },
    { title: "Hosting", content: [["Hosting-Anbieter","SwizKote Technology Services AG"],["Adresse","Rue de la Confédération 14, 1204 Genf"],["Serverstandort","ISO 27001-zertifizierte Rechenzentren, Schweiz"]], text: null },
    { title: "Datenschutz — DSB-Kontakt", content: [["Datenschutzbeauftragter","Me. Alexandre Fontaine"],["DSB-E-Mail","dpo@swizkote.ch"],["Postadresse","SWIZKOTE SA — DSB, Rue du Rhône 42, 1204 Genf"],["Aufsichtsbehörde","Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)"],["EDÖB-Website","www.edoeb.admin.ch"]], text: null },
    { title: "Streitbeilegung", content: [["Schweizer Bankombud","Bundesgasse 21, 3001 Bern"],["Bankombud-Website","www.bankingombudsman.ch"],["Gerichtsstand","Ordentliche Gerichte des Kantons Genf"],["Anwendbares Recht","Ausschliesslich Schweizer Recht"]], text: null },
  ],
  fr: [
    { title: "Identification de l'établissement", content: [["Dénomination sociale","SWIZKOTE SA"],["Forme juridique","Société Anonyme de droit suisse"],["Capital social","CHF 250 000 000 (entièrement libéré)"],["N° d'identification CHE","CHE-123.456.789"],["Siège social","Rue du Rhône 42, 1204 Genève, Suisse"],["Téléphone","+41 22 000 00 00"],["Email","contact@swizkote.ch"],["Site web","www.swizkote.ch"]], text: null },
    { title: "Agrément et surveillance", content: [["Régulateur","Autorité fédérale de surveillance des marchés financiers (FINMA)"],["N° d'agrément FINMA","B-01234/2024"],["Statut","Établissement bancaire agréé"],["Garantie des dépôts","CHF 100 000 par déposant (esisuisse)"],["N° registre esisuisse","ES-7654"],["Loi applicable","Loi fédérale sur les banques (LB) du 8 novembre 1934"]], text: null },
    { title: "Direction et gouvernance", content: [["Président du CA","Dr. Hans-Peter Müller"],["Directrice Générale (CEO)","Marie-Claire Dubois"],["Directeur Financier (CFO)","Antoine Bertrand"],["Directrice des Risques (CRO)","Dr. Sophia Keller"],["Commissaire aux comptes","PricewaterhouseCoopers SA, Genève"]], text: null },
    { title: "Propriété intellectuelle", content: null, text: "L'ensemble du contenu de ce site est la propriété exclusive de SWIZKOTE SA ou de ses partenaires, et est protégé par les lois suisses et internationales relatives à la propriété intellectuelle. Toute reproduction est interdite sans l'autorisation écrite préalable de SWIZKOTE SA." },
    { title: "Responsabilité", content: null, text: "Les informations contenues sur ce site sont fournies à titre purement informatif et ne sauraient constituer un conseil en investissement, juridique ou fiscal. SWIZKOTE SA ne saurait être tenue responsable des erreurs ou inexactitudes dans les informations diffusées." },
    { title: "Hébergement", content: [["Hébergeur","SwizKote Technology Services SA"],["Adresse","Rue de la Confédération 14, 1204 Genève"],["Localisation des serveurs","Centres de données certifiés ISO 27001, Suisse"]], text: null },
    { title: "Protection des données — Contact DPO", content: [["Délégué à la Protection des Données","Me. Alexandre Fontaine"],["Email DPO","dpo@swizkote.ch"],["Adresse postale","SWIZKOTE SA — DPO, Rue du Rhône 42, 1204 Genève"],["Autorité de contrôle","Préposé fédéral à la protection des données (PFPDT)"],["Site PFPDT","www.edoeb.admin.ch"]], text: null },
    { title: "Résolution des litiges", content: [["Médiateur bancaire suisse","Bundesgasse 21, 3001 Berne"],["Site médiateur","www.bankingombudsman.ch"],["For juridique","Tribunaux ordinaires du canton de Genève"],["Droit applicable","Droit suisse exclusivement"]], text: null },
  ],
  en: [
    { title: "Institution Identification", content: [["Company name","SWIZKOTE SA"],["Legal form","Public limited company under Swiss law"],["Share capital","CHF 250,000,000 (fully paid up)"],["Registration number","CHE-123.456.789"],["Registered office","Rue du Rhône 42, 1204 Geneva, Switzerland"],["Phone","+41 22 000 00 00"],["Email","contact@swizkote.ch"],["Website","www.swizkote.ch"]], text: null },
    { title: "Licence and Supervision", content: [["Regulatory authority","Swiss Financial Market Supervisory Authority (FINMA)"],["FINMA licence number","B-01234/2024"],["Status","Licensed banking institution"],["Deposit protection","CHF 100,000 per depositor (esisuisse)"],["esisuisse register number","ES-7654"],["Applicable law","Federal Banking Act (BA) of November 8, 1934"]], text: null },
    { title: "Management and Governance", content: [["Chairman of the Board","Dr. Hans-Peter Müller"],["Chief Executive Officer (CEO)","Marie-Claire Dubois"],["Chief Financial Officer (CFO)","Antoine Bertrand"],["Chief Risk Officer (CRO)","Dr. Sophia Keller"],["Statutory auditor","PricewaterhouseCoopers SA, Geneva"]], text: null },
    { title: "Intellectual Property", content: null, text: "All content on this website (text, images, graphics, logo, icons, sounds, software) is the exclusive property of SWIZKOTE SA or its partners and is protected by Swiss and international intellectual property laws. Any reproduction, representation, modification, publication or adaptation of any website element is prohibited without the prior written consent of SWIZKOTE SA." },
    { title: "Disclaimer", content: null, text: "The information contained on this website is provided for information purposes only and does not constitute investment, legal or tax advice. SWIZKOTE SA accepts no liability for errors, omissions or inaccuracies in the information published on this website." },
    { title: "Hosting", content: [["Hosting provider","SwizKote Technology Services SA"],["Address","Rue de la Confédération 14, 1204 Geneva"],["Server location","ISO 27001-certified data centres, Switzerland"]], text: null },
    { title: "Data Protection — DPO Contact", content: [["Data Protection Officer","Me. Alexandre Fontaine"],["DPO email","dpo@swizkote.ch"],["Postal address","SWIZKOTE SA — DPO, Rue du Rhône 42, 1204 Geneva"],["Supervisory authority","Federal Data Protection and Information Commissioner (FDPIC)"],["FDPIC website","www.edoeb.admin.ch"]], text: null },
    { title: "Dispute Resolution", content: [["Swiss Banking Ombudsman","Bundesgasse 21, 3001 Berne"],["Ombudsman website","www.bankingombudsman.ch"],["Place of jurisdiction","Ordinary courts of the Canton of Geneva"],["Applicable law","Exclusively Swiss law"]], text: null },
  ],
  it: [
    { title: "Identificazione dell'istituto", content: [["Ragione sociale","SWIZKOTE SA"],["Forma giuridica","Società Anonima di diritto svizzero"],["Capitale sociale","CHF 250.000.000 (interamente versato)"],["Numero d'identificazione","CHE-123.456.789"],["Sede legale","Rue du Rhône 42, 1204 Ginevra, Svizzera"],["Telefono","+41 22 000 00 00"],["Email","contatto@swizkote.ch"],["Sito web","www.swizkote.ch"]], text: null },
    { title: "Autorizzazione e vigilanza", content: [["Autorità di vigilanza","Autorità federale di vigilanza sui mercati finanziari (FINMA)"],["Numero autorizzazione FINMA","B-01234/2024"],["Stato","Istituto bancario autorizzato"],["Garanzia dei depositi","CHF 100.000 per depositante (esisuisse)"],["Numero registro esisuisse","ES-7654"],["Legge applicabile","Legge federale sulle banche (LBCR) dell'8 novembre 1934"]], text: null },
    { title: "Direzione e governance", content: [["Presidente del CdA","Dr. Hans-Peter Müller"],["Direttore Generale (CEO)","Marie-Claire Dubois"],["Direttore Finanziario (CFO)","Antoine Bertrand"],["Direttore dei Rischi (CRO)","Dr. Sophia Keller"],["Revisore contabile","PricewaterhouseCoopers SA, Ginevra"]], text: null },
    { title: "Proprietà intellettuale", content: null, text: "Tutti i contenuti di questo sito (testi, immagini, grafici, logo, icone, suoni, software) sono di proprietà esclusiva di SWIZKOTE SA o dei suoi partner e sono protetti dalle leggi svizzere e internazionali sulla proprietà intellettuale. Qualsiasi riproduzione è vietata senza il previo consenso scritto di SWIZKOTE SA." },
    { title: "Responsabilità", content: null, text: "Le informazioni contenute in questo sito sono fornite a scopo puramente informativo e non costituiscono una consulenza in materia di investimenti, legale o fiscale. SWIZKOTE SA non si assume alcuna responsabilità per errori, omissioni o imprecisioni nelle informazioni pubblicate." },
    { title: "Hosting", content: [["Fornitore di hosting","SwizKote Technology Services SA"],["Indirizzo","Rue de la Confédération 14, 1204 Ginevra"],["Ubicazione dei server","Data center certificati ISO 27001, Svizzera"]], text: null },
    { title: "Protezione dei dati — Contatto DPO", content: [["Responsabile della Protezione dei Dati","Me. Alexandre Fontaine"],["Email DPO","dpo@swizkote.ch"],["Indirizzo postale","SWIZKOTE SA — DPO, Rue du Rhône 42, 1204 Ginevra"],["Autorità di controllo","Incaricato federale della protezione dei dati e della trasparenza (IFPDT)"],["Sito IFPDT","www.edoeb.admin.ch"]], text: null },
    { title: "Risoluzione delle controversie", content: [["Mediatore bancario svizzero","Bundesgasse 21, 3001 Berna"],["Sito mediatore","www.bankingombudsman.ch"],["Foro competente","Tribunali ordinari del Cantone di Ginevra"],["Legge applicabile","Diritto svizzero esclusivamente"]], text: null },
  ],
};

export default function LegalPage() {
  const { lang } = useI18n();
  const de = lang === "de";
  const safeKey = (lang === "fr" || lang === "de" || lang === "en" || lang === "it") ? lang : "fr";
  const en = lang === "en";
  const it = lang === "it";
  const sections = SECTIONS[safeKey];

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-4">
              <Link href="/"><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="w-4 h-4" />
                {de ? "Zurück" : en ? "Back" : it ? "Indietro" : "Retour"}
              </Button></Link>
              <div className="flex items-center gap-1.5">
                <img src={logoImg} alt="SWIZKOTE" className="w-7 h-7 object-contain flex-shrink-0" />
                <span className="text-base sm:text-lg font-bold tracking-tight" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</span>
              </div>
            </div>
            <div className="flex items-center gap-2"><LangSwitcher /><ThemeToggle /></div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-8 h-8 text-gold" />
          <h1 className="text-3xl md:text-4xl font-bold">
            {de ? "Impressum" : en ? "Legal Notice" : it ? "Note Legali" : "Mentions Légales"}
          </h1>
        </div>
        <p className="text-muted-foreground mb-10 pb-8 border-b">
          {de ? "Rechtliche und regulatorische Informationen der SWIZKOTE SA"
            : en ? "Legal and regulatory information of SWIZKOTE SA"
            : it ? "Informazioni legali e regolamentari di SWIZKOTE SA"
            : "Informations légales et réglementaires de SWIZKOTE SA"}
        </p>

        <div className="space-y-8">
          {sections.map((section, i) => (
            <section key={i} className="pb-8 border-b last:border-b-0">
              <h2 className="text-lg font-bold text-gold mb-4">{section.title}</h2>
              {section.content ? (
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {section.content.map(([label, value], j) => (
                        <tr key={j} className="border-b last:border-b-0">
                          <td className="px-4 py-2.5 text-sm font-medium text-muted-foreground bg-muted/30 w-1/3">{label}</td>
                          <td className="px-4 py-2.5 text-sm">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">{section.text}</p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 text-xs text-muted-foreground text-center">
          {de ? "Impressum aktualisiert am 15. November 2024."
            : en ? "Legal notice updated November 15, 2024."
            : it ? "Note legali aggiornate il 15 novembre 2024."
            : "Mentions légales mises à jour le 15 novembre 2024."}
        </div>
      </div>

      <footer className="border-t bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>© 2026 SWIZKOTE SA —{" "}
            <Link href="/terms" className="hover:text-foreground">{de ? "AGB" : en ? "Terms" : it ? "Termini" : "CGU"}</Link>
            {" · "}
            <Link href="/privacy" className="hover:text-foreground">{de ? "Datenschutz" : en ? "Privacy" : it ? "Privacy" : "Confidentialité"}</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
