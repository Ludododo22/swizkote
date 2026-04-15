#!/usr/bin/env python3
"""
SwizKote Bank - Professional PDF Document Generator
Supports FR and DE. Called by Node.js via stdin/stdout JSON.
"""
import sys, json, os, math
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY

# ── Colors ────────────────────────────────────────────────────────────────────
GOLD      = HexColor("#C9A84C")
GOLD_LT   = HexColor("#E8C96A")
DARK      = HexColor("#0D1828")
MID       = HexColor("#1A2D42")
TEXT      = HexColor("#1A1A1A")
MUTED     = HexColor("#6B6B6B")
LIGHT     = HexColor("#999999")
BG        = HexColor("#F8F6F0")
BG2       = HexColor("#EDE8DC")
BORDER    = HexColor("#D4C8B4")
GREEN     = HexColor("#1A9E5A")
AMBER     = HexColor("#B87A00")
RED_      = HexColor("#B83232")

W, H = A4  # 595 x 842 pt

# ── i18n labels ───────────────────────────────────────────────────────────────
L = {
  "fr": {
    "bank":        "SwizKote Bank SA",
    "addr":        "Rue du Rhone 42 | 1204 Geneve | Suisse",
    "phone":       "+41 22 000 00 00",
    "email":       "contact@swizkote.ch",
    "reg":         "CHE-123.456.789 | Agree FINMA",
    "page_of":     lambda p,t: f"Page {p} / {t}",
    "confidential":"DOCUMENT CONFIDENTIEL - SwizKote Bank SA",
    "finma":       "Etablissement bancaire agree par la FINMA | Garantie des depots CHF 100'000",
    "date":        "Date",
    "ref":         "Reference",
    "client":      "Client",
    "iban":        "IBAN",
    "currency":    "Devise",
    "balance":     "Solde",
    "place_date":  "Lieu et date",
    "sig_client":  "Signature du client",
    "sig_bank":    "Cachet et signature de la banque",
    "agreed":      "Les parties soussignees declarent avoir pris connaissance et accepter l'ensemble des termes du present contrat.",
    "months":      lambda n: f"{n} mois",
    # ─ Contract ─
    "contract_title": "Contrat d'Ouverture de Compte",
    "contract_sub":   "Convention de services bancaires - Reference: ",
    "contract_intro": (
      "Le present contrat est conclu entre SwizKote Bank SA (ci-apres « la Banque ») et le(s) "
      "titulaire(s) designe(s) ci-apres (ci-apres « le Client »). Il regit l'ensemble des conditions "
      "applicables a l'ouverture, la gestion et la cloture du compte bancaire, conformement au droit suisse."
    ),
    "acc_details":  "Details du compte ouvert",
    "acc_type":     "Type de compte",
    "acc_name":     "Intitule",
    "acc_num":      "Numero de compte",
    "open_date":    "Date d'ouverture",
    "interest":     "Taux d'interet annuel",
    "arts": [
      ("Art. 1 - Objet du contrat",
       "La Banque ouvre au Client un compte bancaire selon les modalites definies ci-apres. "
       "Le Client s'engage a respecter les Conditions Generales de la Banque, disponibles sur demande et sur notre site."),
      ("Art. 2 - Identification et conformite",
       "Conformement a la LBA et aux directives FINMA, le Client a fourni les documents requis. "
       "La Banque a procede aux verifications KYC necessaires et conserve les justificatifs."),
      ("Art. 3 - Fonctionnement du compte",
       "Le compte est libelle dans la devise indiquee. Debits et credits sont enregistres en temps reel. "
       "Un releve est adresse mensuellement par voie electronique. Les operations sont realisables via l'espace client en ligne."),
      ("Art. 4 - Frais et tarification",
       "Les frais de tenue de compte, de transactions et de services annexes sont definis dans la brochure "
       "tarifaire en vigueur remise au Client. Toute modification est notifiee 30 jours a l'avance."),
      ("Art. 5 - Secret bancaire et protection des donnees",
       "SwizKote Bank SA respecte le secret bancaire suisse (art. 47 LB) et la LPD. "
       "Les donnees personnelles sont traitees exclusivement aux fins contractuelles et ne sont communiquees "
       "a des tiers qu'en vertu d'une obligation legale."),
      ("Art. 6 - Responsabilite et securite",
       "Le Client est responsable de la confidentialite de ses codes d'acces. "
       "La Banque ne pourra etre tenue responsable des consequences d'une utilisation non autorisee "
       "resultant d'une negligence du Client."),
      ("Art. 7 - Resiliation et cloture",
       "Chaque partie peut resilier le present contrat avec un preavis de 30 jours. "
       "En cas de solde positif, les fonds sont vires sur un compte designe par le Client."),
      ("Art. 8 - Droit applicable",
       "Le present contrat est regi par le droit suisse. Tout differend est soumis "
       "a la juridiction exclusive des tribunaux de Geneve, sans prejudice du recours au Mediateur bancaire suisse."),
    ],
    # ─ Loan ─
    "loan_title":   "Contrat de Pret Bancaire",
    "loan_sub":     "Convention de credit - Reference: ",
    "loan_intro":   (
      "Le present contrat de credit est conclu entre SwizKote Bank SA (ci-apres « le Preteur ») et "
      "l'Emprunteur designe ci-apres. Il definit les conditions d'octroi, de mise a disposition et "
      "de remboursement du credit consenti, conformement aux dispositions du droit suisse."
    ),
    "loan_amount":  "Montant du credit",
    "loan_rate":    "Taux annuel effectif global",
    "loan_dur":     "Duree",
    "loan_monthly": "Mensualite",
    "loan_total":   "Cout total du credit",
    "loan_purpose": "Objet du financement",
    "loan_dib":     "Date de deblocage prevue",
    "loan_arts": [
      ("Art. 1 - Objet et montant",
       "Le Preteur accorde a l'Emprunteur un credit du montant indique. Les fonds sont vires sur le compte "
       "bancaire designe apres signature du present contrat et realisation des conditions suspensives eventuelles."),
      ("Art. 2 - Taux d'interet",
       "Le taux annuel effectif global (TAEG) est celui indique ci-dessus. Les interets sont calcules sur le "
       "capital restant du selon la methode actuarielle. Tout retard de paiement genere des interets moratoires "
       "au taux legal majore de 2 points."),
      ("Art. 3 - Remboursement",
       "L'Emprunteur s'engage a regler chaque mois la mensualite convenue par prelevement automatique sur le "
       "compte designe. Un tableau d'amortissement complet est joint en annexe au present contrat."),
      ("Art. 4 - Garanties et suretes",
       "L'octroi du credit est subordonne a la constitution des garanties convenues. La Banque se reserve le "
       "droit de declarer l'exigibilite anticipee en cas de defaut de paiement ou de deterioration materielle "
       "de la situation financiere de l'Emprunteur."),
      ("Art. 5 - Remboursement anticipe",
       "Un remboursement anticipe partiel ou total est possible avec un preavis de 30 jours. "
       "Une indemnite de remboursement anticipe peut etre exigee, calculee selon les modalites reglementaires en vigueur."),
      ("Art. 6 - Droit applicable",
       "Ce contrat est soumis au droit suisse. Pour tout differend, le for exclusif est fixe a Geneve."),
    ],
    # ─ Receipt ─
    "receipt_title":   "Quittance de Paiement",
    "receipt_sub":     "Recu officiel - Reference: ",
    "receipt_from":    "Recu de",
    "receipt_amt":     "Montant recu",
    "receipt_method":  "Mode de paiement",
    "receipt_for":     "Objet du paiement",
    "receipt_confirm": "SwizKote Bank SA confirme avoir recu le paiement mentionne ci-dessus. Ce document constitue un recu valide et definitif.",
    "pay_methods": {"virement":"Virement bancaire","especes":"Especes","carte":"Carte bancaire","cheque":"Cheque"},
    # ─ Invoice ─
    "inv_title":  "Facture",
    "inv_sub":    "Facture de services bancaires - N°: ",
    "inv_to":     "Facture a",
    "inv_num":    "N° Facture",
    "inv_due":    "Echeance",
    "inv_desc":   "Designation",
    "inv_qty":    "Qte",
    "inv_unit":   "P.U. HT",
    "inv_ht":     "Total HT",
    "inv_vat":    "TVA 7.7%",
    "inv_ttc":    "TOTAL TTC",
    "inv_pay":    "Paiement par virement IBAN:",
    "inv_note":   "Paiement a 30 jours nets. Penalites de retard: 5% l'an. Pas d'escompte.",
    # ─ Statement ─
    "stmt_title":   "Releve de Compte",
    "stmt_sub":     "Releve officiel - ",
    "stmt_period":  "Periode",
    "stmt_open":    "Solde d'ouverture",
    "stmt_close":   "Solde de cloture",
    "stmt_debit":   "Debit",
    "stmt_credit":  "Credit",
    "stmt_desc":    "Libelle",
    "stmt_date":    "Date val.",
    "stmt_balance": "Solde",
    # ─ Closure ─
    "clos_title": "Certificat de Cloture de Compte",
    "clos_sub":   "Document officiel - Reference: ",
    "clos_body":  (
      "SwizKote Bank SA certifie par la presente que le compte bancaire designe ci-apres a ete "
      "cloture a la demande expresse de son titulaire, conformement aux procedures en vigueur. "
      "L'ensemble des operations en suspens ont ete regularisees. Ce certificat ne peut etre utilise "
      "qu'aux fins expressement mentionnees."
    ),
    "clos_date":    "Date de cloture",
    "clos_balance": "Solde a la cloture",
    "clos_dest":    "Fonds transferes vers",
    "clos_warn":    "Ce compte est definitivement clos. Aucune operation ne peut y etre effectuee.",
  },
  "de": {
    "bank":        "SwizKote Bank AG",
    "addr":        "Rue du Rhone 42 | 1204 Genf | Schweiz",
    "phone":       "+41 22 000 00 00",
    "email":       "kontakt@swizkote.ch",
    "reg":         "CHE-123.456.789 | FINMA bewilligt",
    "page_of":     lambda p,t: f"Seite {p} / {t}",
    "confidential":"VERTRAULICHES DOKUMENT - SwizKote Bank AG",
    "finma":       "Von der FINMA zugelassenes Bankinstitut | Einlagensicherung CHF 100'000",
    "date":        "Datum",
    "ref":         "Referenz",
    "client":      "Kunde",
    "iban":        "IBAN",
    "currency":    "Wahrung",
    "balance":     "Kontostand",
    "place_date":  "Ort und Datum",
    "sig_client":  "Unterschrift des Kunden",
    "sig_bank":    "Stempel und Unterschrift der Bank",
    "agreed":      "Die unterzeichnenden Parteien bestatigen, die Bedingungen dieses Vertrags vollstandig zur Kenntnis genommen und akzeptiert zu haben.",
    "months":      lambda n: f"{n} Monate",
    # ─ Vertrag ─
    "contract_title": "Kontoeröffnungsvertrag",
    "contract_sub":   "Bankdienstleistungsvereinbarung - Referenz: ",
    "contract_intro": (
      "Dieser Vertrag wird zwischen der SwizKote Bank AG (nachfolgend «die Bank») und dem/den nachstehend "
      "bezeichneten Kontoinhaber(n) (nachfolgend «der Kunde») abgeschlossen. Er regelt alle Bedingungen "
      "fur die Eroffnung, Verwaltung und Auflosung des Bankkontos gemass Schweizer Recht."
    ),
    "acc_details":  "Details des eroffneten Kontos",
    "acc_type":     "Kontotyp",
    "acc_name":     "Kontobezeichnung",
    "acc_num":      "Kontonummer",
    "open_date":    "Eroffnungsdatum",
    "interest":     "Jahrlicher Zinssatz",
    "arts": [
      ("Art. 1 - Vertragsgegenstand",
       "Die Bank eroffnet dem Kunden ein Bankkonto gemaass den nachstehenden Bedingungen. "
       "Der Kunde verpflichtet sich zur Einhaltung der Allgemeinen Geschaftsbedingungen der Bank, "
       "die auf Anfrage und auf unserer Website verfugbar sind."),
      ("Art. 2 - Identifikation und Compliance",
       "Gemaass GwG und FINMA-Richtlinien hat der Kunde alle erforderlichen Ausweisdokumente vorgelegt. "
       "Die Bank hat die notwendigen KYC-Prufungen durchgefuhrt und die Belege aufbewahrt."),
      ("Art. 3 - Kontobetrieb",
       "Das Konto lautet auf die angegebene Wahrung. Belastungen und Gutschriften werden in Echtzeit verbucht. "
       "Ein Kontoauszug wird monatlich elektronisch zugesandt. Operationen sind uber den Online-Kundenbereich durchfuhrbar."),
      ("Art. 4 - Gebuhren und Tarife",
       "Kontofuhrungs-, Transaktions- und Nebendienstleistungsgebuhren sind im gultigen Preisverzeichnis definiert, "
       "das dem Kunden bei der Kontoeroffnung ausgehandigt wurde. Anpassungen werden 30 Tage im Voraus mitgeteilt."),
      ("Art. 5 - Bankgeheimnis und Datenschutz",
       "SwizKote Bank AG wahrt das Schweizer Bankgeheimnis (Art. 47 BankG) und das DSG. Personendaten werden "
       "ausschliesslich fur Vertragszwecke verarbeitet und nur aufgrund gesetzlicher Verpflichtung an Dritte weitergegeben."),
      ("Art. 6 - Haftung und Sicherheit",
       "Der Kunde ist fur die Vertraulichkeit seiner Zugangsdaten verantwortlich. Die Bank haftet nicht fur "
       "Folgen einer unberechtigten Nutzung, die auf eine Nachlassigkeit des Kunden zuruckzufuhren ist."),
      ("Art. 7 - Kundigung und Kontoauflosung",
       "Jede Partei kann diesen Vertrag mit einer Kundigungsfrist von 30 Tagen beenden. "
       "Bei positivem Saldo werden die Mittel auf ein vom Kunden bezeichnetes Konto uberwiesen."),
      ("Art. 8 - Anwendbares Recht",
       "Dieser Vertrag unterliegt Schweizer Recht. Alle Streitigkeiten werden ausschliesslich vor den "
       "Gerichten Genfs ausgetragen, vorbehaltlich eines Rekurses an den Schweizer Bankenmediator."),
    ],
    # ─ Kredit ─
    "loan_title":   "Kreditvertrag",
    "loan_sub":     "Kreditvereinbarung - Referenz: ",
    "loan_intro":   (
      "Dieser Kreditvertrag wird zwischen der SwizKote Bank AG (nachfolgend «der Kreditgeber») und dem "
      "nachstehend bezeichneten Kreditnehmer abgeschlossen. Er regelt die Bedingungen fur die Kreditgewährung, "
      "Bereitstellung und Ruckzahlung des Kredits gemaass Schweizer Recht."
    ),
    "loan_amount":  "Kreditbetrag",
    "loan_rate":    "Effektiver Jahreszins",
    "loan_dur":     "Laufzeit",
    "loan_monthly": "Monatliche Rate",
    "loan_total":   "Gesamtkreditkosten",
    "loan_purpose": "Verwendungszweck",
    "loan_dib":     "Voraussichtliches Auszahlungsdatum",
    "loan_arts": [
      ("Art. 1 - Gegenstand und Betrag",
       "Der Kreditgeber gewahrt dem Kreditnehmer einen Kredit in der oben genannten Hohe. Die Mittel werden "
       "nach Unterzeichnung und Erfullung allfalliger aufschiebender Bedingungen auf das bezeichnete Bankkonto uberwiesen."),
      ("Art. 2 - Zinssatz",
       "Der effektive Jahreszins (EAR) ist oben angegeben. Die Zinsen werden auf dem ausstehenden Kapital "
       "nach der versicherungsmathematischen Methode berechnet. Verzugszinsen betragen den gesetzlichen Satz plus 2 Prozentpunkte."),
      ("Art. 3 - Ruckzahlung",
       "Der Kreditnehmer verpflichtet sich zur monatlichen Zahlung der vereinbarten Rate per Lastschrift vom "
       "bezeichneten Konto. Ein detaillierter Tilgungsplan ist als Anhang beigefugt."),
      ("Art. 4 - Sicherheiten",
       "Die Kreditgewährung ist von der Stellung der vereinbarten Sicherheiten abhangig. Die Bank behalt sich "
       "das Recht vor, den Kredit bei Zahlungsverzug oder wesentlicher Verschlechterung der Finanzlage des Kreditnehmers fallig zu stellen."),
      ("Art. 5 - Vorzeitige Ruckzahlung",
       "Eine vorzeitige Teil- oder Vollruckzahlung ist mit 30 Tagen Kundigungsfrist moglich. "
       "Eine Vorfälligkeitsentschadigung kann gemaass geltenden Vorschriften verlangt werden."),
      ("Art. 6 - Anwendbares Recht",
       "Dieser Vertrag unterliegt Schweizer Recht. Als ausschliesslicher Gerichtsstand gilt Genf."),
    ],
    # ─ Quittung ─
    "receipt_title":   "Zahlungsquittung",
    "receipt_sub":     "Offizielle Quittung - Referenz: ",
    "receipt_from":    "Erhalten von",
    "receipt_amt":     "Erhaltener Betrag",
    "receipt_method":  "Zahlungsart",
    "receipt_for":     "Zahlungszweck",
    "receipt_confirm": "SwizKote Bank AG bestatigt den Eingang der oben genannten Zahlung. Dieses Dokument gilt als gultige und endgultige Quittung.",
    "pay_methods": {"virement":"Bankuberweisung","especes":"Bargeld","carte":"Bankkarte","cheque":"Scheck"},
    # ─ Rechnung ─
    "inv_title":  "Rechnung",
    "inv_sub":    "Rechnung fur Bankdienstleistungen - Nr.: ",
    "inv_to":     "Rechnungsempfanger",
    "inv_num":    "Rechnungs-Nr.",
    "inv_due":    "Falligkeit",
    "inv_desc":   "Bezeichnung",
    "inv_qty":    "Menge",
    "inv_unit":   "E-Preis (netto)",
    "inv_ht":     "Total (netto)",
    "inv_vat":    "MwSt. 7.7%",
    "inv_ttc":    "TOTAL (brutto)",
    "inv_pay":    "Zahlung per Uberweisung IBAN:",
    "inv_note":   "Zahlungsfrist 30 Tage netto. Verzugszinsen: 5% p.a. Kein Skonto.",
    # ─ Kontoauszug ─
    "stmt_title":   "Kontoauszug",
    "stmt_sub":     "Offizieller Kontoauszug - ",
    "stmt_period":  "Zeitraum",
    "stmt_open":    "Eroffnungssaldo",
    "stmt_close":   "Abschlusssaldo",
    "stmt_debit":   "Soll",
    "stmt_credit":  "Haben",
    "stmt_desc":    "Buchungstext",
    "stmt_date":    "Wert-Datum",
    "stmt_balance": "Saldo",
    # ─ Kontoauflosung ─
    "clos_title": "Kontoauflosungszertifikat",
    "clos_sub":   "Offizielles Dokument - Referenz: ",
    "clos_body":  (
      "SwizKote Bank AG bestatigt hiermit, dass das nachstehend bezeichnete Bankkonto auf ausdrucklichen "
      "Antrag des Inhabers gemaass den geltenden Verfahren aufgelost wurde. Alle ausstehenden Transaktionen "
      "wurden abgeschlossen. Dieses Zertifikat darf nur fur die ausdrucklich genannten Zwecke verwendet werden."
    ),
    "clos_date":    "Auflosungsdatum",
    "clos_balance": "Saldo bei Auflosung",
    "clos_dest":    "Uberwiesene Mittel an",
    "clos_warn":    "Dieses Konto ist endgultig aufgelost. Es konnen keine weiteren Operationen durchgefuhrt werden.",
  }
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def fmt_chf(amount, currency="CHF"):
    try:
        v = float(amount or 0)
        s = f"{abs(v):,.2f}".replace(",", "'")
        return f"{currency} {s}" if v >= 0 else f"{currency} -{s}"
    except:
        return f"{currency} 0.00"

MONTHS_FR = ["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"]
MONTHS_DE = ["Januar","Februar","Marz","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"]

def fmt_date(d, lang="fr"):
    if not d: d = datetime.now()
    elif isinstance(d, str):
        try: d = datetime.fromisoformat(d.replace("Z",""))
        except: d = datetime.now()
    m = MONTHS_DE[d.month-1] if lang == "de" else MONTHS_FR[d.month-1]
    return f"{d.day}. {m} {d.year}" if lang == "de" else f"{d.day} {m} {d.year}"

def calc_monthly(amount, rate_pct, months):
    if not amount or not months or months <= 0: return 0.0
    if rate_pct == 0: return amount / months
    mr = rate_pct / 100 / 12
    return (amount * mr * (1 + mr)**months) / ((1 + mr)**months - 1)

def ref_now(prefix):
    return f"SK-{prefix}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

# ── Styles ────────────────────────────────────────────────────────────────────
def S():
    return {
        "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=20, textColor=DARK, leading=26, spaceAfter=1*mm),
        "h2": ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=11, textColor=DARK, leading=15, spaceBefore=4*mm, spaceAfter=1.5*mm),
        "sub": ParagraphStyle("sub", fontName="Helvetica", fontSize=10, textColor=MUTED, leading=14, spaceAfter=4*mm),
        "body": ParagraphStyle("body", fontName="Helvetica", fontSize=9, textColor=TEXT, leading=14, spaceAfter=2.5*mm, alignment=TA_JUSTIFY),
        "lbl": ParagraphStyle("lbl", fontName="Helvetica-Bold", fontSize=8, textColor=MUTED, leading=11),
        "val": ParagraphStyle("val", fontName="Helvetica", fontSize=9, textColor=TEXT, leading=13),
        "val_bold": ParagraphStyle("val_bold", fontName="Helvetica-Bold", fontSize=9, textColor=DARK, leading=13),
        "small": ParagraphStyle("small", fontName="Helvetica", fontSize=7.5, textColor=LIGHT, leading=11),
        "center": ParagraphStyle("center", fontName="Helvetica", fontSize=9, textColor=TEXT, alignment=TA_CENTER, leading=13),
        "big_amt": ParagraphStyle("big_amt", fontName="Helvetica-Bold", fontSize=26, textColor=DARK, alignment=TA_CENTER, leading=34),
        "art_title": ParagraphStyle("art_title", fontName="Helvetica-Bold", fontSize=9, textColor=DARK, leading=13, spaceBefore=3*mm, spaceAfter=1*mm),
        "art_body": ParagraphStyle("art_body", fontName="Helvetica", fontSize=8.5, textColor=TEXT, leading=13, spaceAfter=1.5*mm, alignment=TA_JUSTIFY, leftIndent=4*mm),
        "tbl_hdr": ParagraphStyle("tbl_hdr", fontName="Helvetica-Bold", fontSize=8, textColor=white, leading=11),
        "tbl_cell": ParagraphStyle("tbl_cell", fontName="Helvetica", fontSize=8, textColor=TEXT, leading=11),
        "tbl_bold": ParagraphStyle("tbl_bold", fontName="Helvetica-Bold", fontSize=8.5, textColor=DARK, leading=12),
    }

# ── Header/Footer ─────────────────────────────────────────────────────────────
def header_footer(lbl, ref):
    def draw(canvas, doc):
        canvas.saveState()
        # Top dark bar
        canvas.setFillColor(DARK)
        canvas.rect(0, H - 27*mm, W, 27*mm, fill=1, stroke=0)
        # Gold line below header
        canvas.setFillColor(GOLD)
        canvas.rect(0, H - 28.5*mm, W, 1.5*mm, fill=1, stroke=0)
        # Logo text
        canvas.setFillColor(white)
        canvas.setFont("Helvetica-Bold", 13)
        canvas.drawString(18*mm, H - 12*mm, "wizKote")
        canvas.setFillColor(GOLD)
        canvas.drawString(18*mm + 64, H - 12*mm, " Bank")
        # Address
        canvas.setFillColor(HexColor("#AABBCC"))
        canvas.setFont("Helvetica", 7.5)
        canvas.drawString(18*mm, H - 18*mm, lbl["addr"])
        canvas.drawString(18*mm, H - 22.5*mm, f"{lbl['phone']}  |  {lbl['email']}")
        # Right: ref + date
        canvas.setFillColor(GOLD_LT)
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.drawRightString(W - 18*mm, H - 12*mm, ref)
        canvas.setFillColor(HexColor("#AABBCC"))
        canvas.setFont("Helvetica", 7.5)
        canvas.drawRightString(W - 18*mm, H - 18*mm, fmt_date(None, "de" if "FINMA" in lbl.get("reg","") else "fr"))
        # Footer bg
        canvas.setFillColor(BG2)
        canvas.rect(0, 0, W, 16*mm, fill=1, stroke=0)
        canvas.setFillColor(GOLD)
        canvas.rect(0, 15.5*mm, W, 0.5*mm, fill=1, stroke=0)
        # Footer text
        canvas.setFillColor(LIGHT)
        canvas.setFont("Helvetica", 6.5)
        canvas.drawString(18*mm, 11*mm, lbl["confidential"])
        canvas.drawRightString(W - 18*mm, 11*mm, lbl["page_of"](doc.page, "?"))
        canvas.setFont("Helvetica", 6)
        canvas.drawString(18*mm, 6.5*mm, lbl["finma"])
        canvas.drawRightString(W - 18*mm, 6.5*mm, lbl["reg"])
        canvas.restoreState()
    return draw

# ── Info grid ─────────────────────────────────────────────────────────────────
def info_grid(rows, st, col_w=(52*mm, 115*mm)):
    data = [[Paragraph(k, st["lbl"]), Paragraph(str(v or "—"), st["val"])] for k, v in rows]
    t = Table(data, colWidths=list(col_w))
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), BG),
        ("TOPPADDING", (0,0), (-1,-1), 3.5), ("BOTTOMPADDING", (0,0), (-1,-1), 3.5),
        ("LEFTPADDING", (0,0), (-1,-1), 5),
        ("LINEBELOW", (0,0), (-1,-2), 0.3, BORDER),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    return t

# ── Signature block ───────────────────────────────────────────────────────────
def sig_block(lbl, st, three_cols=True):
    story = [Spacer(1, 8*mm), HRFlowable(width="100%", thickness=0.5, color=BORDER), Spacer(1, 3*mm)]
    if three_cols:
        data = [[Paragraph(lbl["place_date"], st["lbl"]), Paragraph(lbl["sig_client"], st["lbl"]), Paragraph(lbl["sig_bank"], st["lbl"])]]
        t = Table(data, colWidths=[50*mm, 62*mm, 62*mm])
    else:
        data = [[Paragraph(lbl["place_date"], st["lbl"]), Paragraph(lbl["sig_client"], st["lbl"])]]
        t = Table(data, colWidths=[50*mm, 117*mm])
    t.setStyle(TableStyle([("LINEABOVE",(0,0),(-1,-1),0.5,BORDER),("TOPPADDING",(0,0),(-1,-1),22),("LEFTPADDING",(0,0),(-1,-1),0)]))
    story.append(t)
    return story

# ── Colored box ───────────────────────────────────────────────────────────────
def colored_box(text, st, bg_color, text_color=white, font="Helvetica-Bold", size=11):
    style = ParagraphStyle("cb", fontName=font, fontSize=size, textColor=text_color, alignment=TA_CENTER, leading=size+4)
    t = Table([[Paragraph(text, style)]], colWidths=[170*mm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),bg_color),("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9),("LEFTPADDING",(0,0),(-1,-1),8)]))
    return t

# ═══════════════════════════════════════════════════════════════════════════════
#  GENERATORS
# ═══════════════════════════════════════════════════════════════════════════════

def build_doc(path, on_page):
    return SimpleDocTemplate(path, pagesize=A4,
        topMargin=33*mm, bottomMargin=22*mm, leftMargin=18*mm, rightMargin=18*mm)

def gen_account_contract(data, path, lang):
    lbl = L[lang]; st = S()
    ref = ref_now("OC")
    doc = build_doc(path, None)
    fp = header_footer(lbl, ref)
    story = [Spacer(1,4*mm)]

    story += [Paragraph(lbl["contract_title"], st["h1"]),
              Paragraph(lbl["contract_sub"] + ref, st["sub"]),
              HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=4*mm),
              Paragraph(lbl["contract_intro"], st["body"]), Spacer(1,4*mm)]

    client = data.get("client", {})
    story += [Paragraph(lbl["client"], st["h2"]),
              info_grid([(lbl["client"], client.get("fullName","—")),
                         ("Email", client.get("email","—")),
                         (lbl["phone"], client.get("phone") or "—"),], st)]
    story.append(Spacer(1,4*mm))

    account = data.get("account", {})
    story += [Paragraph(lbl["acc_details"], st["h2"]),
              info_grid([(lbl["acc_num"],   (account.get("id","")[:8]+"...") if account.get("id") else "—"),
                         (lbl["iban"],      account.get("iban","—")),
                         (lbl["acc_type"],  account.get("type","—").title()),
                         (lbl["acc_name"],  account.get("name","—")),
                         (lbl["currency"],  account.get("currency","CHF")),
                         (lbl["balance"],   fmt_chf(account.get("balance",0), account.get("currency","CHF"))),
                         (lbl["interest"],  f'{account.get("interestRate",0)}% p.a.'),
                         (lbl["open_date"], fmt_date(account.get("createdAt"), lang)),], st)]
    story.append(Spacer(1,5*mm))

    for title, body in lbl["arts"]:
        story.append(KeepTogether([Paragraph(title, st["art_title"]), Paragraph(body, st["art_body"])]))

    story += [Spacer(1,4*mm), Paragraph(lbl["agreed"], st["body"])]
    story += sig_block(lbl, st, three_cols=True)
    doc.build(story, onFirstPage=fp, onLaterPages=fp)

def gen_loan_contract(data, path, lang):
    lbl = L[lang]; st = S()
    ref = ref_now("CR")
    doc = build_doc(path, None)
    fp = header_footer(lbl, ref)
    story = [Spacer(1,4*mm)]

    story += [Paragraph(lbl["loan_title"], st["h1"]),
              Paragraph(lbl["loan_sub"] + ref, st["sub"]),
              HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=4*mm),
              Paragraph(lbl["loan_intro"], st["body"]), Spacer(1,3*mm)]

    client = data.get("client", {})
    story += [Paragraph(lbl["client"], st["h2"]),
              info_grid([(lbl["client"], client.get("fullName","—")),
                         ("Email", client.get("email","—")),
                         (lbl["phone"], client.get("phone") or "—"),], st)]
    story.append(Spacer(1,3*mm))

    loan = data.get("loan", {})
    amount   = float(loan.get("amount", 0))
    currency = loan.get("currency","CHF")
    rate     = float(data.get("rate", 1.5))
    months   = int(data.get("duration", 120))
    monthly  = calc_monthly(amount, rate, months)

    # Big amount highlight
    story.append(colored_box(fmt_chf(amount, currency), st, DARK, white, size=22))
    story.append(Spacer(1,4*mm))

    story += [Paragraph(lbl["loan_amount"][:1].upper()+lbl["loan_amount"][1:], st["h2"]),
              info_grid([(lbl["loan_amount"],  fmt_chf(amount, currency)),
                         (lbl["loan_rate"],    f"{rate}% p.a."),
                         (lbl["loan_dur"],     lbl["months"](months)),
                         (lbl["loan_monthly"], fmt_chf(monthly, currency)),
                         (lbl["loan_total"],   fmt_chf(monthly*months, currency)),
                         (lbl["loan_purpose"], loan.get("label","—")),
                         (lbl["loan_dib"],     fmt_date(loan.get("createdAt"), lang)),], st)]
    story.append(Spacer(1,4*mm))

    for title, body in lbl["loan_arts"]:
        story.append(KeepTogether([Paragraph(title, st["art_title"]), Paragraph(body, st["art_body"])]))

    story += [Spacer(1,4*mm), Paragraph(lbl["agreed"], st["body"])]
    story += sig_block(lbl, st, three_cols=True)
    doc.build(story, onFirstPage=fp, onLaterPages=fp)

def gen_receipt(data, path, lang):
    lbl = L[lang]; st = S()
    ref = ref_now("QT")
    doc = build_doc(path, None)
    fp = header_footer(lbl, ref)
    story = [Spacer(1,4*mm)]

    story += [Paragraph(lbl["receipt_title"], st["h1"]),
              Paragraph(lbl["receipt_sub"] + ref, st["sub"]),
              HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=5*mm)]

    amount   = float(data.get("amount", 0))
    currency = data.get("currency","CHF")
    story += [Paragraph(fmt_chf(amount, currency), st["big_amt"]), Spacer(1,3*mm),
              Paragraph(lbl["receipt_confirm"], st["center"]), Spacer(1,5*mm),
              HRFlowable(width="100%", thickness=0.3, color=BORDER), Spacer(1,4*mm)]

    method_key = data.get("payment_method","virement")
    story.append(info_grid([
        (lbl["receipt_from"],   data.get("fullName","—")),
        (lbl["receipt_amt"],    fmt_chf(amount, currency)),
        (lbl["receipt_method"], lbl["pay_methods"].get(method_key, method_key)),
        (lbl["receipt_for"],    data.get("description","—")),
        (lbl["date"],           fmt_date(data.get("date"), lang)),
        (lbl["ref"],            ref),
    ], st))
    story.append(Spacer(1,6*mm))
    story.append(colored_box("✓  " + ("Zahlung bestatigt und eingebucht" if lang=="de" else "Paiement confirme et comptabilise"), st, GREEN))
    story += sig_block(lbl, st, three_cols=False)
    doc.build(story, onFirstPage=fp, onLaterPages=fp)

def gen_invoice(data, path, lang):
    lbl = L[lang]; st = S()
    inv_num = f"FK-{datetime.now().strftime('%Y%m%d')}-{str(data.get('invoiceNum','001')).zfill(4)}"
    doc = build_doc(path, None)
    fp = header_footer(lbl, inv_num)
    story = [Spacer(1,4*mm)]

    story += [Paragraph(lbl["inv_title"], st["h1"]),
              Paragraph(lbl["inv_sub"] + inv_num, st["sub"]),
              HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=4*mm)]

    story.append(info_grid([
        (lbl["inv_num"],  inv_num),
        (lbl["date"],     fmt_date(None, lang)),
        (lbl["inv_due"],  fmt_date(data.get("dueDate"), lang)),
        (lbl["inv_to"],   data.get("fullName","—") + ("  •  " + data.get("email","") if data.get("email") else "")),
        (lbl["iban"],     data.get("clientIban","—")),
    ], st))
    story.append(Spacer(1,5*mm))

    # Line items
    items = data.get("items", [])
    if not items:
        items = [{"desc": ("Kontofuhrungsgebuhr" if lang=="de" else "Frais de tenue de compte"), "qty":1, "unit":12.0},
                 {"desc": ("Uberweisungsgebuhr" if lang=="de" else "Frais de virement"), "qty":2, "unit":5.0}]

    header = [Paragraph(lbl["inv_desc"], st["tbl_hdr"]),
              Paragraph(lbl["inv_qty"],  st["tbl_hdr"]),
              Paragraph(lbl["inv_unit"], st["tbl_hdr"]),
              Paragraph(lbl["inv_ht"],   st["tbl_hdr"])]
    rows = [header]
    sub = 0.0
    for item in items:
        qty=float(item.get("qty",1)); unit=float(item.get("unit",0)); tot=qty*unit; sub+=tot
        rows.append([Paragraph(item.get("desc","—"), st["tbl_cell"]),
                     Paragraph(str(int(qty)), st["tbl_cell"]),
                     Paragraph(fmt_chf(unit,"CHF"), st["tbl_cell"]),
                     Paragraph(fmt_chf(tot,"CHF"), st["tbl_cell"])])
    vat = sub * 0.077; ttc = sub + vat
    rows.append(["", "", Paragraph(lbl["inv_vat"], st["tbl_cell"]), Paragraph(fmt_chf(vat,"CHF"), st["tbl_cell"])])
    rows.append(["", "", Paragraph(lbl["inv_ttc"], st["tbl_bold"]), Paragraph(fmt_chf(ttc,"CHF"), st["tbl_bold"])])

    t = Table(rows, colWidths=[92*mm, 18*mm, 32*mm, 32*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),DARK), ("TEXTCOLOR",(0,0),(-1,0),white),
        ("ROWBACKGROUNDS",(0,1),(-1,-3),[white,BG]),
        ("BACKGROUND",(0,-2),(-1,-2),BG2), ("BACKGROUND",(0,-1),(-1,-1),BG2),
        ("LINEBELOW",(0,0),(-1,0),0.5,GOLD), ("LINEABOVE",(0,-2),(-1,-2),0.3,BORDER),
        ("LINEABOVE",(0,-1),(-1,-1),1,GOLD),
        ("FONTNAME",(0,-1),(-1,-1),"Helvetica-Bold"),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),("LEFTPADDING",(0,0),(-1,-1),5),
        ("ALIGN",(1,0),(-1,-1),"RIGHT"), ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ]))
    story.append(t)
    story += [Spacer(1,4*mm),
              Paragraph(f"{lbl['inv_pay']} {data.get('bankIban','CH93 0076 2011 6238 5295 7')}", st["small"]),
              Paragraph(lbl["inv_note"], st["small"])]
    story += sig_block(lbl, st, three_cols=False)
    doc.build(story, onFirstPage=fp, onLaterPages=fp)

def gen_statement(data, path, lang):
    lbl = L[lang]; st = S()
    account = data.get("account",{})
    ref = ref_now("RE")
    doc = build_doc(path, None)
    fp = header_footer(lbl, ref)
    story = [Spacer(1,4*mm)]

    story += [Paragraph(lbl["stmt_title"], st["h1"]),
              Paragraph(lbl["stmt_sub"] + account.get("iban","—"), st["sub"]),
              HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=4*mm)]

    client = data.get("client",{})
    story.append(info_grid([
        (lbl["client"],   client.get("fullName","—")),
        (lbl["iban"],     account.get("iban","—")),
        (lbl["currency"], account.get("currency","CHF")),
        (lbl["stmt_period"], data.get("period", fmt_date(None, lang))),
    ], st))
    story.append(Spacer(1,4*mm))

    currency = account.get("currency","CHF")
    opening  = float(data.get("openingBalance",0))
    closing  = float(account.get("balance",0))

    # Balance summary
    bal_rows = [
        [Paragraph(lbl["stmt_open"],  st["lbl"]), Paragraph(fmt_chf(opening,currency),  st["val"])],
        [Paragraph(lbl["stmt_close"], st["tbl_bold"]), Paragraph(fmt_chf(closing,currency), st["tbl_bold"])],
    ]
    bt = Table(bal_rows, colWidths=[85*mm, 85*mm])
    bt.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),BG), ("BACKGROUND",(0,-1),(-1,-1),DARK),
        ("TEXTCOLOR",(0,-1),(-1,-1),white),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),("LEFTPADDING",(0,0),(-1,-1),8),
        ("LINEBELOW",(0,0),(-1,-2),0.3,BORDER),
    ]))
    story.append(bt)
    story.append(Spacer(1,5*mm))

    txs = data.get("transactions",[])
    thead = [Paragraph(lbl["stmt_date"],   st["tbl_hdr"]),
             Paragraph(lbl["stmt_desc"],   st["tbl_hdr"]),
             Paragraph(lbl["stmt_debit"],  st["tbl_hdr"]),
             Paragraph(lbl["stmt_credit"], st["tbl_hdr"]),
             Paragraph(lbl["stmt_balance"],st["tbl_hdr"])]
    tx_rows = [thead]
    running = opening
    for tx in txs[:40]:
        amt = float(tx.get("amount",0))
        is_cr = tx.get("type") == "credit"
        running += amt if is_cr else -amt
        tx_rows.append([
            Paragraph(fmt_date(tx.get("date"), lang), st["tbl_cell"]),
            Paragraph((tx.get("description","—"))[:45], st["tbl_cell"]),
            Paragraph("" if is_cr else fmt_chf(amt,currency), st["tbl_cell"]),
            Paragraph(fmt_chf(amt,currency) if is_cr else "", st["tbl_cell"]),
            Paragraph(fmt_chf(running,currency), st["tbl_cell"]),
        ])
    if not txs:
        tx_rows.append([Paragraph("—",st["tbl_cell"])]*5)

    tt = Table(tx_rows, colWidths=[25*mm, 72*mm, 25*mm, 25*mm, 25*mm])
    tt.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),DARK),("TEXTCOLOR",(0,0),(-1,0),white),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[white,BG]),
        ("LINEBELOW",(0,0),(-1,0),0.5,GOLD),
        ("TOPPADDING",(0,0),(-1,-1),3),("BOTTOMPADDING",(0,0),(-1,-1),3),("LEFTPADDING",(0,0),(-1,-1),3),
        ("FONTSIZE",(0,1),(-1,-1),7.5), ("ALIGN",(2,1),(4,-1),"RIGHT"),
    ]))
    story.append(tt)
    doc.build(story, onFirstPage=fp, onLaterPages=fp)

def gen_closure(data, path, lang):
    lbl = L[lang]; st = S()
    account = data.get("account",{})
    ref = ref_now("CL")
    doc = build_doc(path, None)
    fp = header_footer(lbl, ref)
    story = [Spacer(1,4*mm)]

    story += [Paragraph(lbl["clos_title"], st["h1"]),
              Paragraph(lbl["clos_sub"] + ref, st["sub"]),
              HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceAfter=5*mm),
              Paragraph(lbl["clos_body"], st["body"]), Spacer(1,4*mm)]

    client = data.get("client",{})
    story += [Paragraph(lbl["client"], st["h2"]),
              info_grid([(lbl["client"], client.get("fullName","—")),("Email", client.get("email","—"))], st)]
    story.append(Spacer(1,3*mm))

    currency = account.get("currency","CHF")
    story += [Paragraph(lbl["acc_details"] if "acc_details" in lbl else "Konto", st["h2"]),
              info_grid([
                  (lbl["acc_num"],      (account.get("id","")[:8]+"...") if account.get("id") else "—"),
                  (lbl["iban"],         account.get("iban","—")),
                  (lbl["clos_date"],    fmt_date(data.get("closureDate"), lang)),
                  (lbl["clos_balance"], fmt_chf(account.get("balance",0), currency)),
                  (lbl["clos_dest"],    data.get("transferTo","—")),
              ], st)]
    story.append(Spacer(1,6*mm))
    story.append(colored_box("⚠  " + lbl["clos_warn"], st, HexColor("#7a3800"), white, size=9))
    story += sig_block(lbl, st, three_cols=True)
    doc.build(story, onFirstPage=fp, onLaterPages=fp)

# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    try:
        payload  = json.loads(sys.stdin.read())
        doc_type = payload.get("type")
        lang     = payload.get("lang","de")
        out      = payload.get("outputPath")
        data     = payload.get("data",{})
        os.makedirs(os.path.dirname(out), exist_ok=True)
        dispatch = {
            "account_contract": gen_account_contract,
            "loan_contract":    gen_loan_contract,
            "receipt":          gen_receipt,
            "invoice":          gen_invoice,
            "statement":        gen_statement,
            "closure":          gen_closure,
        }
        fn = dispatch.get(doc_type)
        if not fn:
            raise ValueError(f"Unknown type: {doc_type}")
        fn(data, out, lang)
        print(json.dumps({"success": True, "path": out}))
    except Exception as e:
        import traceback
        print(json.dumps({"success": False, "error": str(e), "trace": traceback.format_exc()}), file=sys.stderr)
        sys.exit(1)
