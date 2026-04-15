import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useI18n } from "@/lib/i18n";
import { LangSwitcher } from "@/components/lang-switcher";
import { Sun, Moon, ArrowLeft, Shield, Globe, Award, Users, Landmark, History } from "lucide-react";
const logoImg = "/logo.png";

const ZURICH_SKYLINE_IMG = "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&h=1080&fit=crop&q=80";
const BANKING_INTERIOR_IMG = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop&q=80";
const ADVISOR_IMG = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&q=80";
const SWISS_LANDSCAPE_IMG = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&q=80";
const LEADERSHIP_IMAGES = [
  "https://www.sfp.ch/assets/group/_processed_/d/a/csm_Bauer_Hans-Peter_87__c7898d0446.jpg?w=400&h=400&fit=crop&q=80",
  "https://author-img.nuglif.net/0c7af3a3-2cc9-4c8a-bbb3-2edb424a92ec/author_sheet_web_654bb5e7ca326.webp?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

const LEGACY_TEXT = {
  fr: {
    title: "Notre héritage : la Banque Leclerc & Cie",
    badge: "Héritage historique",
    body: `SWIZKOTE est l'héritière directe de la Banque Leclerc & Cie, institution bancaire genevoise fondée en 1874, qui a marqué de son empreinte plus d'un siècle de finance privée suisse. Reconnue pour sa discrétion, sa rigueur et son excellence dans la gestion de fortune, la Banque Leclerc & Cie a servi des générations de familles et d'entrepreneurs à Genève et en Suisse romande jusqu'à sa fermeture en 1977.`,
    body2: `Fondée par la famille Leclerc, l'institution a traversé deux guerres mondiales, les turbulences financières du XXe siècle et a su préserver intacte la confiance de sa clientèle privée. Sa fermeture en 1977, après plus de cent ans d'existence, a marqué la fin d'une époque — mais non celle des valeurs qui l'animaient.`,
    body3: `En 1987, des banquiers genevois visionnaires, gardiens de cet héritage, ont fondé SWIZKOTE SA avec la mission de perpétuer cette tradition d'excellence, de confidentialité et d'innovation au service d'une clientèle internationale exigeante. Aujourd'hui, SWIZKOTE honore chaque jour cet héritage centenaire en alliant la sagesse de la finance suisse traditionnelle aux outils technologiques les plus modernes.`,
    years: "150 ans d'héritage",
    closed: "Banque Leclerc & Cie fermée en 1977",
    refounded: "Refondée sous SWIZKOTE en 1987",
  },
  de: {
    title: "Unser Erbe: die Banque Leclerc & Cie",
    badge: "Historisches Erbe",
    body: `SWIZKOTE ist die direkte Nachfolgerin der Banque Leclerc & Cie, einem Genfer Bankinstitut, das 1874 gegründet wurde und über ein Jahrhundert Schweizer Privatfinanzwesen massgeblich geprägt hat. Die Banque Leclerc & Cie war für ihre Diskretion, Strenge und Exzellenz in der Vermögensverwaltung bekannt und betreute Generationen von Familien und Unternehmern in Genf und der Westschweiz bis zu ihrer Schliessung im Jahr 1977.`,
    body2: `Das von der Familie Leclerc gegründete Institut überstand zwei Weltkriege und die finanziellen Turbulenzen des 20. Jahrhunderts, wobei das Vertrauen seiner Privatkundschaft stets unversehrt blieb. Die Schliessung im Jahr 1977, nach über hundert Jahren, markierte das Ende einer Ära — aber nicht das der Werte, die sie beseelten.`,
    body3: `Im Jahr 1987 gründeten visionäre Genfer Banker, Hüter dieses Erbes, die SWIZKOTE SA mit dem Auftrag, diese Tradition der Exzellenz, Vertraulichkeit und Innovation im Dienste einer anspruchsvollen internationalen Kundschaft fortzuführen. Heute ehrt SWIZKOTE dieses jahrhundertealte Erbe täglich, indem es die Weisheit des traditionellen Schweizer Finanzwesens mit modernsten Technologien verbindet.`,
    years: "150 Jahre Erbe",
    closed: "Banque Leclerc & Cie 1977 geschlossen",
    refounded: "1987 als SWIZKOTE neu gegründet",
  },
  en: {
    title: "Our Heritage: Banque Leclerc & Cie",
    badge: "Historical Heritage",
    body: `SWIZKOTE is the direct heir to Banque Leclerc & Cie, a Genevan banking institution founded in 1874, which left its mark on over a century of Swiss private finance. Known for its discretion, rigour and excellence in wealth management, Banque Leclerc & Cie served generations of families and entrepreneurs in Geneva and French-speaking Switzerland until its closure in 1977.`,
    body2: `Founded by the Leclerc family, the institution survived two World Wars and the financial turbulences of the 20th century, preserving the trust of its private clientele intact throughout. Its closure in 1977, after more than a hundred years of existence, marked the end of an era — but not of the values that inspired it.`,
    body3: `In 1987, visionary Genevan bankers, guardians of this heritage, founded SWIZKOTE SA with the mission of perpetuating this tradition of excellence, confidentiality and innovation in the service of a demanding international clientele. Today, SWIZKOTE honours this century-old heritage daily by combining the wisdom of traditional Swiss finance with the most modern technological tools.`,
    years: "150 years of heritage",
    closed: "Banque Leclerc & Cie closed in 1977",
    refounded: "Refounded as SWIZKOTE in 1987",
  },
  it: {
    title: "Il nostro patrimonio: la Banque Leclerc & Cie",
    badge: "Patrimonio storico",
    body: `SWIZKOTE è l'erede diretta della Banque Leclerc & Cie, istituto bancario ginevrino fondato nel 1874, che ha segnato oltre un secolo di finanza privata svizzera. Rinomata per la sua discrezione, il rigore e l'eccellenza nella gestione patrimoniale, la Banque Leclerc & Cie ha servito generazioni di famiglie e imprenditori a Ginevra e nella Svizzera romanda fino alla sua chiusura nel 1977.`,
    body2: `Fondata dalla famiglia Leclerc, l'istituzione ha attraversato due guerre mondiali e le turbolenze finanziarie del XX secolo, preservando intatta la fiducia della sua clientela privata. La chiusura nel 1977, dopo oltre cento anni di esistenza, ha segnato la fine di un'epoca — ma non dei valori che la animavano.`,
    body3: `Nel 1987, visionari banchieri ginevrini, custodi di questa eredità, hanno fondato SWIZKOTE SA con la missione di perpetuare questa tradizione di eccellenza, riservatezza e innovazione al servizio di una clientela internazionale esigente. Oggi, SWIZKOTE onora ogni giorno questo patrimonio centenario unendo la saggezza della finanza svizzera tradizionale agli strumenti tecnologici più moderni.`,
    years: "150 anni di patrimonio",
    closed: "Banque Leclerc & Cie chiusa nel 1977",
    refounded: "Rifondata come SWIZKOTE nel 1987",
  },
};

const TIMELINE = {
  fr: [
    { year: "1874", title: "Fondation de la Banque Leclerc & Cie", desc: "La Banque Leclerc & Cie est fondée à Genève, inaugurant une longue tradition d'excellence dans la banque privée suisse." },
    { year: "1977", title: "Fermeture de la Banque Leclerc & Cie", desc: "Après plus d'un siècle d'activité, la Banque Leclerc & Cie ferme ses portes, laissant un héritage exceptionnel dans la finance genevoise." },
    { year: "1987", title: "Fondation de SWIZKOTE", desc: "Des banquiers héritiers de la tradition Leclerc fondent SWIZKOTE SA à Genève, avec un capital initial de CHF 50 millions, perpétuant l'héritage." },
    { year: "1995", title: "Expansion européenne", desc: "Ouverture de bureaux à Zurich, Bâle et Luxembourg. Lancement des services de gestion de fortune pour clients privés." },
    { year: "2003", title: "Certification FINMA", desc: "Obtention de l'agrément complet de l'Autorité fédérale de surveillance des marchés financiers (FINMA)." },
    { year: "2010", title: "Banking Digital", desc: "Lancement de la première plateforme de banque en ligne sécurisée, précurseur de la transformation digitale." },
    { year: "2024", title: "Plateforme nouvelle génération", desc: "Déploiement de la plateforme digitale de nouvelle génération avec IA intégrée et sécurité renforcée." },
  ],
  de: [
    { year: "1874", title: "Gründung der Banque Leclerc & Cie", desc: "Die Banque Leclerc & Cie wird in Genf gegründet und legt den Grundstein für eine lange Tradition der Schweizer Privatbank-Exzellenz." },
    { year: "1977", title: "Schliessung der Banque Leclerc & Cie", desc: "Nach über einem Jahrhundert Tätigkeit schliesst die Banque Leclerc & Cie ihre Türen und hinterlässt ein aussergewöhnliches Erbe im Genfer Finanzwesen." },
    { year: "1987", title: "Gründung von SWIZKOTE", desc: "Banker, Erben der Leclerc-Tradition, gründen die SWIZKOTE SA in Genf mit einem Anfangskapital von 50 Millionen CHF und führen das Erbe fort." },
    { year: "1995", title: "Europäische Expansion", desc: "Eröffnung von Büros in Zürich, Basel und Luxemburg. Einführung von Vermögensverwaltungsdienstleistungen für Privatkunden." },
    { year: "2003", title: "FINMA-Zertifizierung", desc: "Erhalt der vollständigen Zulassung durch die Eidgenössische Finanzmarktaufsicht (FINMA)." },
    { year: "2010", title: "Digital Banking", desc: "Einführung der ersten sicheren Online-Banking-Plattform, Vorreiter der digitalen Transformation." },
    { year: "2024", title: "Next-Generation-Plattform", desc: "Einführung der digitalen Plattform der nächsten Generation mit integrierter KI und erweiterter Sicherheit." },
  ],
  en: [
    { year: "1874", title: "Foundation of Banque Leclerc & Cie", desc: "Banque Leclerc & Cie is founded in Geneva, inaugurating a long tradition of excellence in Swiss private banking." },
    { year: "1977", title: "Closure of Banque Leclerc & Cie", desc: "After more than a century of activity, Banque Leclerc & Cie closes its doors, leaving an exceptional legacy in Genevan finance." },
    { year: "1987", title: "Foundation of SWIZKOTE", desc: "Bankers inheriting the Leclerc tradition found SWIZKOTE SA in Geneva with initial capital of CHF 50 million, perpetuating the legacy." },
    { year: "1995", title: "European Expansion", desc: "Opening of offices in Zurich, Basel and Luxembourg. Launch of wealth management services for private clients." },
    { year: "2003", title: "FINMA Certification", desc: "Obtaining full approval from the Swiss Financial Market Supervisory Authority (FINMA)." },
    { year: "2010", title: "Digital Banking", desc: "Launch of the first secure online banking platform, a precursor of the digital transformation." },
    { year: "2024", title: "Next-Generation Platform", desc: "Deployment of the next-generation digital platform with integrated AI and enhanced security." },
  ],
  it: [
    { year: "1874", title: "Fondazione della Banque Leclerc & Cie", desc: "La Banque Leclerc & Cie viene fondata a Ginevra, inaugurando una lunga tradizione di eccellenza nella banca privata svizzera." },
    { year: "1977", title: "Chiusura della Banque Leclerc & Cie", desc: "Dopo oltre un secolo di attività, la Banque Leclerc & Cie chiude le sue porte, lasciando un'eredità eccezionale nella finanza ginevrina." },
    { year: "1987", title: "Fondazione di SWIZKOTE", desc: "Banchieri eredi della tradizione Leclerc fondano SWIZKOTE SA a Ginevra con un capitale iniziale di CHF 50 milioni, perpetuando l'eredità." },
    { year: "1995", title: "Espansione europea", desc: "Apertura di uffici a Zurigo, Basilea e Lussemburgo. Lancio dei servizi di gestione patrimoniale per clienti privati." },
    { year: "2003", title: "Certificazione FINMA", desc: "Ottenimento dell'approvazione completa dall'Autorità federale di vigilanza sui mercati finanziari (FINMA)." },
    { year: "2010", title: "Digital Banking", desc: "Lancio della prima piattaforma di online banking sicura, precursore della trasformazione digitale." },
    { year: "2024", title: "Piattaforma di nuova generazione", desc: "Implementazione della piattaforma digitale di nuova generazione con IA integrata e sicurezza rafforzata." },
  ],
};

const VALUES = {
  fr: [
    { icon: Shield, title: "Intégrité", desc: "Nous agissons avec honnêteté et transparence dans chaque interaction, en respectant les plus hautes normes éthiques du secteur bancaire suisse." },
    { icon: Award, title: "Excellence", desc: "Notre engagement envers l'excellence se reflète dans chaque service, chaque produit et chaque relation client que nous entretenons." },
    { icon: Globe, title: "Innovation", desc: "Nous investissons continuellement dans les technologies de pointe pour offrir à nos clients des solutions bancaires innovantes et sécurisées." },
    { icon: Users, title: "Confiance", desc: "La confiance de nos clients est notre actif le plus précieux. Nous la protégeons avec la rigueur et le sérieux de la tradition bancaire suisse." },
  ],
  de: [
    { icon: Shield, title: "Integrität", desc: "Wir handeln in jeder Interaktion mit Ehrlichkeit und Transparenz und halten dabei die höchsten ethischen Standards des Schweizer Bankensektors ein." },
    { icon: Award, title: "Exzellenz", desc: "Unser Engagement für Exzellenz spiegelt sich in jeder Dienstleistung, jedem Produkt und jeder Kundenbeziehung wider." },
    { icon: Globe, title: "Innovation", desc: "Wir investieren kontinuierlich in Spitzentechnologien, um unseren Kunden innovative und sichere Banklösungen zu bieten." },
    { icon: Users, title: "Vertrauen", desc: "Das Vertrauen unserer Kunden ist unser wertvollstes Gut. Wir schützen es mit der Strenge und Ernsthaftigkeit der Schweizer Banktradition." },
  ],
  en: [
    { icon: Shield, title: "Integrity", desc: "We act with honesty and transparency in every interaction, upholding the highest ethical standards of the Swiss banking sector." },
    { icon: Award, title: "Excellence", desc: "Our commitment to excellence is reflected in every service, every product and every client relationship we maintain." },
    { icon: Globe, title: "Innovation", desc: "We continually invest in cutting-edge technologies to offer our clients innovative and secure banking solutions." },
    { icon: Users, title: "Trust", desc: "The trust of our clients is our most precious asset. We protect it with the rigour and seriousness of the Swiss banking tradition." },
  ],
  it: [
    { icon: Shield, title: "Integrità", desc: "Agiamo con onestà e trasparenza in ogni interazione, rispettando i più alti standard etici del settore bancario svizzero." },
    { icon: Award, title: "Eccellenza", desc: "Il nostro impegno verso l'eccellenza si riflette in ogni servizio, ogni prodotto e ogni relazione con i clienti." },
    { icon: Globe, title: "Innovazione", desc: "Investiamo continuamente in tecnologie all'avanguardia per offrire ai nostri clienti soluzioni bancarie innovative e sicure." },
    { icon: Users, title: "Fiducia", desc: "La fiducia dei nostri clienti è il nostro bene più prezioso. La proteggiamo con il rigore e la serietà della tradizione bancaria svizzera." },
  ],
};

const LEADERSHIP = {
  fr: [
    { name: "Dr. Hans-Peter Müller", role: "Président du Conseil d'Administration", img: LEADERSHIP_IMAGES[0] },
    { name: "Marie-Claire Dubois", role: "Directrice Générale (CEO)", img: LEADERSHIP_IMAGES[1] },
    { name: "Antoine Bertrand", role: "Directeur Financier (CFO)", img: LEADERSHIP_IMAGES[2] },
    { name: "Dr. Sophia Keller", role: "Directrice des Risques (CRO)", img: LEADERSHIP_IMAGES[3] },
  ],
  de: [
    { name: "Dr. Hans-Peter Müller", role: "Präsident des Verwaltungsrats", img: LEADERSHIP_IMAGES[0] },
    { name: "Marie-Claire Dubois", role: "Generaldirektorin (CEO)", img: LEADERSHIP_IMAGES[1] },
    { name: "Antoine Bertrand", role: "Finanzdirektor (CFO)", img: LEADERSHIP_IMAGES[2] },
    { name: "Dr. Sophia Keller", role: "Risikodirektorin (CRO)", img: LEADERSHIP_IMAGES[3] },
  ],
  en: [
    { name: "Dr. Hans-Peter Müller", role: "Chairman of the Board", img: LEADERSHIP_IMAGES[0] },
    { name: "Marie-Claire Dubois", role: "Chief Executive Officer (CEO)", img: LEADERSHIP_IMAGES[1] },
    { name: "Antoine Bertrand", role: "Chief Financial Officer (CFO)", img: LEADERSHIP_IMAGES[2] },
    { name: "Dr. Sophia Keller", role: "Chief Risk Officer (CRO)", img: LEADERSHIP_IMAGES[3] },
  ],
  it: [
    { name: "Dr. Hans-Peter Müller", role: "Presidente del Consiglio di Amministrazione", img: LEADERSHIP_IMAGES[0] },
    { name: "Marie-Claire Dubois", role: "Direttrice Generale (CEO)", img: LEADERSHIP_IMAGES[1] },
    { name: "Antoine Bertrand", role: "Direttore Finanziario (CFO)", img: LEADERSHIP_IMAGES[2] },
    { name: "Dr. Sophia Keller", role: "Direttrice dei Rischi (CRO)", img: LEADERSHIP_IMAGES[3] },
  ],
};

const STATS = {
  fr: [
    { val: "CHF 12 Mrd", lbl: "Actifs sous gestion" },
    { val: "85 000+", lbl: "Clients dans 40 pays" },
    { val: "A+", lbl: "Note Standard & Poor's" },
    { val: "FINMA", lbl: "Réglementation suisse" },
  ],
  de: [
    { val: "CHF 12 Mrd", lbl: "Verwaltete Vermögen" },
    { val: "85 000+", lbl: "Kunden in 40 Ländern" },
    { val: "A+", lbl: "Standard & Poor's Rating" },
    { val: "FINMA", lbl: "Schweizer Regulierung" },
  ],
  en: [
    { val: "CHF 12B", lbl: "Assets under management" },
    { val: "85,000+", lbl: "Clients in 40 countries" },
    { val: "A+", lbl: "Standard & Poor's rating" },
    { val: "FINMA", lbl: "Swiss regulation" },
  ],
  it: [
    { val: "CHF 12 Mld", lbl: "Attivi in gestione" },
    { val: "85.000+", lbl: "Clienti in 40 paesi" },
    { val: "A+", lbl: "Rating Standard & Poor's" },
    { val: "FINMA", lbl: "Regolamentazione svizzera" },
  ],
};

const HERO_TEXT = {
  fr: { badge: "Fondée en 1874 à Genève", title: "À propos de", sub: "Depuis plus de 35 ans, nous incarnons l'excellence bancaire suisse — alliant tradition, innovation et rigueur au service de nos clients à travers le monde." },
  de: { badge: "Gegründet 1874 in Genf", title: "Über", sub: "Seit über 35 Jahren verkörpern wir die Schweizer Bankexzellenz – Tradition, Innovation und Präzision im Dienste unserer Kunden weltweit." },
  en: { badge: "Founded in 1874 in Geneva", title: "About", sub: "For over 35 years, we have embodied Swiss banking excellence — combining tradition, innovation and rigour in the service of our clients worldwide." },
  it: { badge: "Fondata nel 1874 a Ginevra", title: "Chi siamo —", sub: "Da oltre 35 anni incarniamo l'eccellenza bancaria svizzera — unendo tradizione, innovazione e rigore al servizio dei nostri clienti in tutto il mondo." },
};

const MISSION_TEXT = {
  fr: {
    title: "Notre", gold: "Mission",
    p1: "SWIZKOTE SA a pour mission de fournir des services bancaires d'excellence qui répondent aux besoins financiers les plus exigeants, tout en préservant la confidentialité et la sécurité absolues que nos clients méritent.",
    p2: "Nous croyons fermement que la banque du futur doit allier la solidité de la tradition helvétique à l'agilité technologique, pour offrir une expérience bancaire sans équivalent.",
  },
  de: {
    title: "Unsere", gold: "Mission",
    p1: "Die SWIZKOTE SA hat es sich zur Aufgabe gemacht, erstklassige Bankdienstleistungen anzubieten, die den anspruchsvollsten finanziellen Bedürfnissen gerecht werden, und dabei die absolute Vertraulichkeit und Sicherheit zu wahren, die unsere Kunden verdienen.",
    p2: "Wir sind fest davon überzeugt, dass die Bank der Zukunft die Solidität der Schweizer Tradition mit technologischer Agilität verbinden muss, um ein unvergleichliches Bankerlebnis zu bieten.",
  },
  en: {
    title: "Our", gold: "Mission",
    p1: "SWIZKOTE SA's mission is to provide excellent banking services that meet the most demanding financial needs, while preserving the absolute confidentiality and security that our clients deserve.",
    p2: "We firmly believe that the bank of the future must combine the solidity of the Swiss tradition with technological agility to offer an unparalleled banking experience.",
  },
  it: {
    title: "La nostra", gold: "Missione",
    p1: "SWIZKOTE SA ha la missione di fornire servizi bancari d'eccellenza che soddisfano le esigenze finanziarie più esigenti, preservando al tempo stesso la riservatezza e la sicurezza assolute che i nostri clienti meritano.",
    p2: "Crediamo fermamente che la banca del futuro debba unire la solidità della tradizione elvetica all'agilità tecnologica, per offrire un'esperienza bancaria senza pari.",
  },
};

const VALUES_SECTION = {
  fr: { title: "Nos", gold: "Valeurs", sub: "Quatre piliers fondamentaux guident chacune de nos décisions et interactions." },
  de: { title: "Unsere", gold: "Werte", sub: "Vier grundlegende Säulen leiten jede unserer Entscheidungen und Interaktionen." },
  en: { title: "Our", gold: "Values", sub: "Four fundamental pillars guide each of our decisions and interactions." },
  it: { title: "I nostri", gold: "Valori", sub: "Quattro pilastri fondamentali guidano ciascuna delle nostre decisioni e interazioni." },
};

const HISTORY_SECTION = {
  fr: { title: "Notre", gold: "Histoire" },
  de: { title: "Unsere", gold: "Geschichte" },
  en: { title: "Our", gold: "History" },
  it: { title: "La nostra", gold: "Storia" },
};

const LEADERSHIP_SECTION = {
  fr: { title: "Notre", gold: "Direction", sub: "Des dirigeants expérimentés avec une expertise reconnue sur la place financière suisse." },
  de: { title: "Unsere", gold: "Führung", sub: "Erfahrene Führungspersönlichkeiten mit langjähriger Expertise im Schweizer Finanzmarkt." },
  en: { title: "Our", gold: "Leadership", sub: "Experienced executives with recognised expertise in the Swiss financial market." },
  it: { title: "La nostra", gold: "Direzione", sub: "Dirigenti esperti con un'esperienza riconosciuta nel mercato finanziario svizzero." },
};

const EXP_LABEL = {
  fr: "ans d'expérience", de: "Jahre Erfahrung", en: "years of experience", it: "anni di esperienza",
};

export default function AboutPage() {
  const { lang } = useI18n();
  const safeKey = (lang === "en" || lang === "it" || lang === "fr" || lang === "de") ? lang : "fr";
  const timeline = TIMELINE[safeKey];
  const values = VALUES[safeKey];
  const leadership = LEADERSHIP[safeKey];
  const stats = STATS[safeKey];
  const hero = HERO_TEXT[safeKey];
  const mission = MISSION_TEXT[safeKey];
  const valSection = VALUES_SECTION[safeKey];
  const histSection = HISTORY_SECTION[safeKey];
  const leadSection = LEADERSHIP_SECTION[safeKey];
  const legacy = LEGACY_TEXT[safeKey];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {lang === "de" ? "Zurück" : lang === "en" ? "Back" : lang === "it" ? "Indietro" : "Retour"}
                </Button>
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                <img src={logoImg} alt="SWIZKOTE" className="h-7 w-auto object-contain flex-shrink-0" />
                <span className="text-lg font-bold tracking-widest uppercase" style={{ whiteSpace: "nowrap" }}>SWIZKOTE</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LangSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[hsl(222,40%,6%)] py-24 md:py-32">
        <img src={ZURICH_SKYLINE_IMG} alt="Zurich" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,40%,6%,0.7)] to-[hsl(222,40%,6%,0.95)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/10 text-gold text-sm font-medium mb-6">
            <Landmark className="w-4 h-4" />
            {hero.badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
            {hero.title} <span className="text-gold">SWIZKOTE</span>
          </h1>
          <p className="text-[hsl(220,20%,75%)] text-xl max-w-3xl mx-auto leading-relaxed">
            {hero.sub}
          </p>
        </div>
      </section>

      {/* ── LEGACY SECTION — Banque Leclerc & Cie (CORRIGÉE AVEC MEILLEURE LISIBILITÉ) ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-[hsl(222,40%,6%)] to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Colonne texte - avec fond amélioré pour la lisibilité */}
            <div className="relative">
              {/* Overlay de fond pour améliorer la lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent rounded-2xl -m-4 p-4 pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-semibold uppercase tracking-wider">
                  <History className="w-3.5 h-3.5" />
                  {legacy.badge}
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  {legacy.title}
                </h2>
                
                <div className="space-y-4">
                  <p className="text-[hsl(220,20%,92%)] leading-relaxed bg-black/30 p-5 rounded-xl backdrop-blur-sm border border-white/10">
                    {legacy.body}
                  </p>
                  <p className="text-[hsl(220,20%,88%)] leading-relaxed bg-black/25 p-5 rounded-xl backdrop-blur-sm border border-white/10">
                    {legacy.body2}
                  </p>
                  <p className="text-[hsl(220,20%,92%)] leading-relaxed bg-black/30 p-5 rounded-xl backdrop-blur-sm border border-white/10">
                    {legacy.body3}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Colonne de droite - cartes d'information */}
            <div className="space-y-4">
              <div className="p-6 rounded-xl border border-gold/20 bg-gold/5 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <Landmark className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Banque Leclerc & Cie</p>
                    <p className="text-xs text-gold">Genève · 1874 – 1977</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { val: "1874", lbl: lang === "de" ? "Gründung" : lang === "en" ? "Founded" : lang === "it" ? "Fondata" : "Fondée" },
                    { val: "103", lbl: lang === "de" ? "Jahre" : lang === "en" ? "years" : lang === "it" ? "anni" : "ans" },
                    { val: "1977", lbl: lang === "de" ? "Schliessung" : lang === "en" ? "Closed" : lang === "it" ? "Chiusura" : "Fermeture" },
                  ].map((s, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[hsl(222,40%,10%)]">
                      <div className="text-2xl font-bold text-gold">{s.val}</div>
                      <div className="text-xs text-[hsl(220,20%,60%)] mt-1">{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-gold/20 bg-card backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <p className="text-sm font-medium text-gold">{legacy.closed}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <p className="text-sm font-medium text-green-400">{legacy.refounded}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                {mission.title} <span className="text-gold">{mission.gold}</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">{mission.p1}</p>
              <p className="text-muted-foreground leading-relaxed mb-6">{mission.p2}</p>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="p-4 rounded-lg border bg-card">
                    <div className="text-2xl font-bold text-gold">{s.val}</div>
                    <div className="text-sm text-muted-foreground mt-1">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <img src={BANKING_INTERIOR_IMG} alt="Banking Interior" className="w-full h-64 object-cover rounded-xl" />
              <img src={ADVISOR_IMG} alt="Advisor" className="w-full h-48 object-cover rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {valSection.title} <span className="text-gold">{valSection.gold}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{valSection.sub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="p-6 rounded-xl border bg-card hover:border-gold/40 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {histSection.title} <span className="text-gold">{histSection.gold}</span>
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-px bg-border hidden md:block" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className={`flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"} text-left`}>
                    <div className={`p-6 rounded-xl border bg-card inline-block w-full md:max-w-sm ${item.year === "1874" || item.year === "1977" ? "border-gold/40 bg-gold/5" : ""}`}>
                      <div className="text-gold font-bold text-xl mb-1">{item.year}</div>
                      <div className="font-semibold mb-2">{item.title}</div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <div className={`hidden md:flex w-4 h-4 rounded-full border-4 border-background flex-shrink-0 z-10 ${item.year === "1874" || item.year === "1977" ? "bg-gold w-5 h-5" : "bg-gold"}`} />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {leadSection.title} <span className="text-gold">{leadSection.gold}</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{leadSection.sub}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((p, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden hover:border-gold/40 transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative h-48 overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-5 text-center">
                  <div className="font-semibold text-lg mb-1">{p.name}</div>
                  <div className="text-sm text-gold mt-1 font-medium">{p.role}</div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">{15 + i * 4}+ {EXP_LABEL[safeKey]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Swiss landscape */}
      <section className="relative overflow-hidden">
        <img src={SWISS_LANDSCAPE_IMG} alt="Switzerland" className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-[hsl(222,40%,6%,0.75)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-2xl font-bold mb-2">Genève, Suisse</p>
            <p className="text-[hsl(220,20%,75%)]">Rue du Rhône 42 · 1204 Genève · CHE-123.456.789</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src={logoImg} alt="SWIZKOTE" className="h-5 w-auto object-contain" />
            <span className="font-bold text-sm tracking-widest uppercase">SWIZKOTE</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">{lang === "de" ? "Über uns" : lang === "en" ? "About" : lang === "it" ? "Chi siamo" : "À propos"}</Link>
            <Link href="/careers" className="hover:text-foreground">{lang === "de" ? "Karriere" : lang === "en" ? "Careers" : lang === "it" ? "Carriere" : "Carrières"}</Link>
            <Link href="/terms" className="hover:text-foreground">{lang === "de" ? "AGB" : lang === "en" ? "Terms" : lang === "it" ? "Termini" : "CGU"}</Link>
            <Link href="/privacy" className="hover:text-foreground">{lang === "de" ? "Datenschutz" : lang === "en" ? "Privacy" : lang === "it" ? "Privacy" : "Confidentialité"}</Link>
            <Link href="/legal" className="hover:text-foreground">{lang === "de" ? "Impressum" : lang === "en" ? "Legal" : lang === "it" ? "Note legali" : "Mentions légales"}</Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">© 2024 SWIZKOTE SA. {lang === "de" ? "Alle Rechte vorbehalten." : lang === "en" ? "All rights reserved." : lang === "it" ? "Tutti i diritti riservati." : "Tous droits réservés."}</p>
        </div>
      </footer>
    </div>
  );
}