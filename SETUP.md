# SwizKote Bank — Guide des nouvelles fonctionnalités

## 📄 Nouvelles pages publiques

Toutes accessibles sans connexion depuis la landing page et le footer.

| Route | Page | Description |
|---|---|---|
| `/about` | À propos | Histoire, valeurs, direction, chronologie |
| `/careers` | Carrières | Offres d'emploi avec candidature intégrée |
| `/press` | Presse | Communiqués, ressources médias |
| `/partnerships` | Partenariats | Types de partenariats, formulaire de contact |
| `/terms` | Conditions générales | 9 articles juridiques complets (droit suisse) |
| `/privacy` | Politique de confidentialité | LPD Suisse + RGPD + clause secret bancaire |
| `/legal` | Mentions légales | FINMA, gouvernance, hébergement |
| `/services` | Tous les services | Catalogue avec cards cliquables |
| `/services/:id` | Détail service | Page individuelle par service (6 services) |
| `/security` | Sécurité | 6 piliers, certifications, conseils clients |

### Services disponibles (pages individuelles)
- `/services/compte-courant`
- `/services/epargne`
- `/services/cartes`
- `/services/credits`
- `/services/gestion-fortune`
- `/services/securite`

---

## 📧 Envoi automatique d'emails

### Lors de l'inscription client (`/api/auth/register`)
- Email de **bienvenue** envoyé automatiquement avec :
  - Identifiant client (SK-XXXXXX)
  - Login et IBAN du compte
  - Contrat d'ouverture de compte en pièce jointe (PDF généré)
  - Lien vers l'espace client

### Lors de la création d'un compte par l'admin (`/api/admin/clients` POST)
- Email avec **identifiants de connexion** envoyé automatiquement :
  - ID Client, login, mot de passe provisoire, IBAN
  - Contrat d'ouverture de compte PDF en pièce jointe
  - Demande de changement de mot de passe à la première connexion

### Lors de la création d'un dossier/prêt par l'admin (`/api/admin/loans` POST)
- Email de **notification** au client :
  - Référence du dossier, montant, type
  - Contrat de prêt PDF généré (si type loan_request ou loan_active)
  - Lien vers le suivi du dossier

---

## 🔐 Nouvelles routes API admin

### `POST /api/admin/clients/:id/send-contract`
Envoie le contrat d'ouverture de compte par email au client.
```json
// Réponse
{ "ok": true, "sentTo": "client@email.com", "clientId": "SK-ABC123", "iban": "CH..." }
```

### `POST /api/admin/clients/:id/generate-credentials`
Régénère un nouveau mot de passe et l'envoie par email au client.
```json
// Réponse
{ "ok": true, "clientId": "SK-ABC123", "username": "john", "newPassword": "Xk9#mP2q", "sentTo": "..." }
```

### `POST /api/admin/pdf/send-email`
Génère un PDF et l'envoie par email à un client.
```json
// Corps de la requête
{
  "userId": "uuid-du-client",
  "type": "account_contract", // account_contract | loan_contract | receipt | invoice | statement | closure
  "lang": "fr", // fr | de
  "data": { ... }, // données pour le PDF
  "subject": "Sujet de l'email (optionnel)",
  "message": "Message personnalisé (optionnel)"
}
```

---

## 👤 Identifiants client

Chaque client reçoit un **ID client unique** au format `SK-XXXXXX` (6 caractères hexadécimaux en majuscules), dérivé de son UUID.

Affiché dans :
- L'interface admin (liste clients + création)
- Les emails automatiques
- Le tableau de bord sécurité

---

## ⚙️ Configuration SMTP

Copiez `.env.example` vers `.env` et remplissez les variables SMTP :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=mot-de-passe-application
SMTP_FROM=noreply@swizkote.ch
APP_URL=https://app.swizkote.ch
```

> **Sans SMTP configuré** : les emails sont simplement loggés dans la console (mode développement). L'application fonctionne normalement.

### Fournisseurs SMTP recommandés
- **Brevo** (ex-Sendinblue) — gratuit jusqu'à 300 emails/jour
- **Mailgun** — très fiable pour la production
- **Gmail** — avec mot de passe d'application (2FA requis)
- **Serveur propre** — pour la production bancaire

### Installer nodemailer
```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

---

## 🛡️ Clauses de confidentialité intégrées

Les nouvelles pages incluent des clauses juridiques complètes :

- **Secret bancaire suisse** (art. 47 LB) dans les CGU et la politique de confidentialité
- **LPD** (Loi fédérale sur la protection des données, révisée)
- **RGPD** pour les résidents européens
- **Droits des clients** : accès, rectification, effacement, portabilité, opposition
- **DPO** (Délégué à la Protection des Données) : dpo@swizkote.ch
- **Hébergement Suisse** et conservation des données 10 ans minimum
- **Médiateur bancaire suisse** pour la résolution des litiges

---

## 🔧 Modifications de fichiers

| Fichier | Modifications |
|---|---|
| `client/src/App.tsx` | +10 nouvelles routes publiques |
| `client/src/pages/landing.tsx` | Liens footer et navbar mis à jour |
| `client/src/pages/admin.tsx` | Affichage ID client, boutons contrat + identifiants |
| `server/routes.ts` | Email helpers, 3 nouvelles routes admin, contrat auto à l'inscription |
| `.env.example` | Variables SMTP et APP_URL ajoutées |

### Nouveaux fichiers créés
- `client/src/pages/about.tsx`
- `client/src/pages/careers.tsx`
- `client/src/pages/press.tsx`
- `client/src/pages/partnerships.tsx`
- `client/src/pages/terms.tsx`
- `client/src/pages/privacy.tsx`
- `client/src/pages/legal.tsx`
- `client/src/pages/services.tsx`
- `client/src/pages/security.tsx`
