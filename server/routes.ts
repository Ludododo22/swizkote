import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { storage } from "./storage.js";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

const PgStore = ConnectPgSimple(session);

// ─── EMAIL HELPER ─────────────────────────────────────────────────────────────
// Uses nodemailer if SMTP configured; otherwise logs to console (dev mode)
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const SMTP_FROM = process.env.SMTP_FROM || "noreply@swizkote.ch";
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      // Dynamic import to avoid crash when nodemailer not installed
      const nodemailer = await import("nodemailer").catch(() => null);
      if (nodemailer) {
        const transporter = nodemailer.default.createTransport({
          host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        await transporter.sendMail({ from: `SwizKote Bank <${SMTP_FROM}>`, to, subject, html });
        console.log(`[EMAIL] Sent to ${to}: ${subject}`);
        return;
      }
    } catch (err) {
      console.error("[EMAIL] Failed to send:", err);
    }
  }
  // Fallback: log email content (dev / no SMTP configured)
  console.log(`[EMAIL-DEV] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL-DEV] Body (truncated): ${html.replace(/<[^>]+>/g, "").slice(0, 300)}...`);
}

// ─── PDF HELPER ───────────────────────────────────────────────────────────────
async function generatePdfBuffer(type: string, lang: string, data: any): Promise<Buffer> {
  const tmpFile = path.join(os.tmpdir(), `swizkote-${type}-${Date.now()}.pdf`);
  const scriptPath = path.join(__dirname, "pdf", "generator.py");
  const payload = JSON.stringify({ type, lang, data, outputPath: tmpFile });

  await new Promise<void>((resolve, reject) => {
    const py = spawn("python3", [scriptPath], { env: { ...process.env } });
    let stderr = "";
    py.stdin.write(payload);
    py.stdin.end();
    py.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
    py.on("close", (code: number) => {
      if (code === 0) resolve();
      else reject(new Error(`PDF generator failed (code ${code}): ${stderr.slice(0, 500)}`));
    });
  });

  if (!fs.existsSync(tmpFile)) throw new Error("PDF file not created");
  const buf = fs.readFileSync(tmpFile);
  try { fs.unlinkSync(tmpFile); } catch {}
  return buf;
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────
function emailTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Georgia,serif;background:#0d1828;margin:0;padding:0}
.wrap{max-width:600px;margin:0 auto;background:#fff}
.header{background:#0d1828;padding:28px 32px;text-align:center}
.header h1{color:#fff;font-size:22px;margin:0}span.gold{color:#c9a84c}
.body{padding:32px}
.body h2{font-size:18px;color:#0d1828;margin-top:0}
.body p{color:#333;line-height:1.6;font-size:14px}
.box{background:#f8f6f0;border-left:4px solid #c9a84c;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0}
.box code{font-family:monospace;font-size:15px;color:#0d1828;font-weight:bold}
.btn{display:inline-block;background:#c9a84c;color:#0d1828;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin:16px 0}
.footer{background:#f8f6f0;border-top:1px solid #e0d8c8;padding:20px 32px;font-size:11px;color:#777;text-align:center;line-height:1.6}
</style></head><body>
<div class="wrap">
<div class="header"><h1>wiz<span class="gold">Kote</span> Bank</h1></div>
<div class="body"><h2>${title}</h2>${bodyHtml}</div>
<div class="footer">
<strong>SwizKote Bank SA</strong> · Rue du Rhône 42 · 1204 Genève · Suisse<br>
+41 22 000 00 00 · contact@swizkote.ch<br>
Établissement agréé FINMA · CHE-123.456.789<br>
<em>Ce message est confidentiel et destiné exclusivement à son destinataire. Secret bancaire protégé par l'art. 47 LB.</em>
</div></div></body></html>`;
}


function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any).userId) return res.status(401).send("Non authentifie");
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any).role !== "admin") return res.status(403).send("Acces refuse");
  next();
}

function generateIBAN() {
  const checkDigits = String(Math.floor(Math.random() * 90) + 10);
  const rest = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
  return `CH${checkDigits} 0076 ${rest.slice(0, 4)} ${rest.slice(4, 8)} ${rest.slice(8)}`;
}

function generateCardNumber() {
  return Array.from({ length: 4 }, () => String(Math.floor(Math.random() * 9000) + 1000)).join("");
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generatePassword(length = 10) {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const DEFAULT_LOAN_STEPS: Record<string, {label: string; description: string}[]> = {
  transfer: [
    { label: "Dossier reçu", description: "Votre demande de virement a été reçue et enregistrée." },
    { label: "Vérification en cours", description: "Analyse du dossier par notre équipe de conformité." },
    { label: "Validation bancaire", description: "Validation par la banque correspondante et vérification anti-blanchiment." },
    { label: "Virement envoyé avec succès", description: "Les fonds ont été transférés sur le compte bénéficiaire." },
  ],
  loan_request: [
    { label: "Demande reçue", description: "Votre demande de prêt a été reçue et est en cours d'examen." },
    { label: "Étude du dossier", description: "Analyse de votre capacité de remboursement et de vos garanties." },
    { label: "Accord de principe", description: "Votre dossier a été approuvé. Signature du contrat en cours." },
    { label: "Fonds débloqués", description: "Votre prêt a été accordé et les fonds ont été versés sur votre compte." },
  ],
  loan_active: [
    { label: "Prêt activé", description: "Votre prêt est actif. Les mensualités sont en cours." },
    { label: "Remboursement en cours", description: "Vos paiements mensuels sont bien enregistrés." },
    { label: "Mi-parcours atteint", description: "Vous avez remboursé la moitié de votre prêt. Félicitations !" },
    { label: "Prêt soldé", description: "Votre prêt est entièrement remboursé. Félicitations !" },
  ],
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.use(
    session({
      store: new PgStore({ conString: process.env.DATABASE_URL, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "swizk-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 },
    })
  );

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, fullName, email, phone } = req.body;
      if (!username || !password || !fullName || !email) return res.status(400).send("Champs obligatoires manquants");
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(409).send("Identifiant deja utilise");
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword, fullName, email, phone: phone || null, role: "client", avatarUrl: null, active: false });
      const account = await storage.createAccount({ userId: user.id, type: "main", name: "Compte Courant", balance: 0, currency: "CHF", iban: generateIBAN(), interestRate: 0 });
      (req.session as any).userId = user.id;
      (req.session as any).role = user.role;
      const { password: _, ...safe } = user;

      // ── Envoi automatique contrat d'ouverture de compte + email de bienvenue ──
      setImmediate(async () => {
        try {
          // Générer le PDF du contrat
          let pdfBuf: Buffer | null = null;
          try {
            pdfBuf = await generatePdfBuffer("account_contract", "fr", { client: { fullName, email, phone }, account });
          } catch (pdfErr) {
            console.error("[PDF] Failed to generate contract:", pdfErr);
          }

          const clientId = `SK-${user.id.slice(0, 6).toUpperCase()}`;
          const welcomeHtml = `
            <p>Cher(e) <strong>${fullName}</strong>,</p>
            <p>Nous sommes ravis de vous accueillir dans la famille <strong>SwizKote Bank</strong>.</p>
            <p>Votre compte a été ouvert avec succès. Voici vos informations :</p>
            <div class="box">
              <p style="margin:0"><strong>Identifiant client :</strong> <code>${clientId}</code></p>
              <p style="margin:8px 0 0"><strong>Identifiant de connexion :</strong> <code>${username}</code></p>
              <p style="margin:8px 0 0"><strong>IBAN :</strong> <code>${account.iban}</code></p>
            </div>
            <p>Vous trouverez en pièce jointe votre <strong>contrat d'ouverture de compte</strong>. Veuillez le conserver précieusement.</p>
            <p>Pour toute question, contactez-nous :</p>
            <ul>
              <li>📧 <a href="mailto:contact@swizkote.ch">contact@swizkote.ch</a></li>
              <li>📞 +41 22 000 00 00 (lun–ven 8h–18h)</li>
            </ul>
            <a href="${process.env.APP_URL || "https://app.swizkote.ch"}/login" class="btn">Accéder à mon espace client</a>
            <p style="font-size:12px;color:#888;margin-top:24px">
              <em>Ce contrat est soumis au droit suisse. Secret bancaire garanti par l'art. 47 LB.</em>
            </p>`;

          await sendEmail({
            to: email,
            subject: "Bienvenue chez SwizKote Bank — Votre contrat d'ouverture de compte",
            html: emailTemplate("Bienvenue chez SwizKote Bank", welcomeHtml),
          });
          console.log(`[REGISTER] Welcome email sent to ${email}`);
        } catch (mailErr) {
          console.error("[REGISTER] Email/PDF error:", mailErr);
        }
      });

      res.json(safe);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).send("Identifiant ou mot de passe incorrect");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).send("Identifiant ou mot de passe incorrect");
      (req.session as any).userId = user.id;
      (req.session as any).role = user.role;
      // Save previous login time, then update current login time
      const previousLogin = user.lastLoginAt;
      await storage.updateUser(user.id, { previousLoginAt: previousLogin, lastLoginAt: new Date() });
      const updatedUser = await storage.getUser(user.id);
      const { password: _, ...safe } = updatedUser!;
      res.json(safe);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).send("Non authentifie");
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).send("Utilisateur introuvable");
    const { password: _, ...safe } = user;
    res.json(safe);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {});
    res.json({ ok: true });
  });

  // ─── ACCOUNTS ─────────────────────────────────────────────────────────────
  app.get("/api/accounts", requireAuth, async (req: Request, res: Response) => {
    const accounts = await storage.getAccountsByUser((req.session as any).userId);
    res.json(accounts);
  });

  app.post("/api/accounts", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { name, type, currency } = req.body;
      const account = await storage.createAccount({ userId, name, type, currency: currency || "CHF", balance: 0, iban: generateIBAN(), interestRate: type === "savings" ? 4 : 0 });
      res.json(account);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── TRANSACTIONS ─────────────────────────────────────────────────────────
  app.get("/api/transactions", requireAuth, async (req: Request, res: Response) => {
    const txs = await storage.getTransactionsByUser((req.session as any).userId);
    res.json(txs);
  });

  // ─── TRANSFERS ────────────────────────────────────────────────────────────
  app.get("/api/transfers", requireAuth, async (req: Request, res: Response) => {
    const transfers = await storage.getTransfersByUser((req.session as any).userId);
    res.json(transfers);
  });

  app.get("/api/transfers/:id", requireAuth, async (req: Request, res: Response) => {
    const transfer = await storage.getTransfer((req.params.id as string));
    if (!transfer) return res.status(404).send("Transfert introuvable");
    const userId = (req.session as any).userId;
    const role = (req.session as any).role;
    if (transfer.userId !== userId && role !== "admin") return res.status(403).send("Acces refuse");
    res.json(transfer);
  });

  app.post("/api/transfers", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { fromAccountId, recipientName, recipientIban, recipientBank, amount, currency, isInternational } = req.body;
      if (!fromAccountId || !recipientName || !recipientIban || !amount) return res.status(400).send("Champs obligatoires manquants");
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return res.status(400).send("Montant invalide");
      const account = await storage.getAccount(fromAccountId);
      if (!account || account.userId !== userId) return res.status(403).send("Compte non autorise");
      if (account.balance < parsedAmount) return res.status(400).send("Solde insuffisant");
      await storage.updateAccountBalance(account.id, account.balance - parsedAmount);
      const transfer = await storage.createTransfer({ userId, fromAccountId, recipientName, recipientIban, recipientBank: recipientBank || null, amount: parsedAmount, currency: currency || "CHF", isInternational: isInternational || false });
      await storage.createTransaction({ accountId: fromAccountId, type: "debit", amount: parsedAmount, currency: currency || "CHF", description: `Virement vers ${recipientName}`, recipientName });
      res.json(transfer);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.post("/api/transfers/:id/validate-otp", requireAuth, async (req: Request, res: Response) => {
    try {
      const transfer = await storage.getTransfer((req.params.id as string));
      if (!transfer) return res.status(404).send("Transfert introuvable");
      if (transfer.otpCode !== req.body.otp) return res.status(400).send("Code OTP invalide");
      await storage.updateTransfer(transfer.id, { otpValidated: true, status: "processing" });
      res.json({ ok: true });
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── CARDS ────────────────────────────────────────────────────────────────
  app.get("/api/cards", requireAuth, async (req: Request, res: Response) => {
    res.json(await storage.getCardsByUser((req.session as any).userId));
  });

  app.patch("/api/cards/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateCard((req.params.id as string), req.body);
      if (!updated) return res.status(404).send("Carte introuvable");
      res.json(updated);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────
  app.get("/api/documents", requireAuth, async (req: Request, res: Response) => {
    res.json(await storage.getDocumentsByUser((req.session as any).userId));
  });

  app.post("/api/documents", requireAuth, async (req: Request, res: Response) => {
    try {
      const doc = await storage.createDocument({ ...req.body, userId: (req.session as any).userId });
      res.json(doc);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.delete("/api/documents/:id", requireAuth, async (req: Request, res: Response) => {
    try { await storage.deleteDocument((req.params.id as string)); res.json({ ok: true }); }
    catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── MESSAGES ─────────────────────────────────────────────────────────────
  app.get("/api/messages", requireAuth, async (req: Request, res: Response) => {
    res.json(await storage.getMessagesByUser((req.session as any).userId));
  });

  app.post("/api/messages", requireAuth, async (req: Request, res: Response) => {
    try {
      const msg = await storage.createMessage({ userId: (req.session as any).userId, content: req.body.content, fromAdmin: false });
      res.json(msg);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── LOANS (CLIENT) ───────────────────────────────────────────────────────
  app.get("/api/loans", requireAuth, async (req: Request, res: Response) => {
    res.json(await storage.getLoansByUser((req.session as any).userId));
  });

  app.get("/api/loans/:id", requireAuth, async (req: Request, res: Response) => {
    const loan = await storage.getLoan((req.params.id as string));
    if (!loan) return res.status(404).send("Prêt introuvable");
    const userId = (req.session as any).userId;
    const role = (req.session as any).role;
    if (loan.userId !== userId && role !== "admin") return res.status(403).send("Acces refuse");
    res.json(loan);
  });

  app.get("/api/loans/:id/steps", requireAuth, async (req: Request, res: Response) => {
    const loan = await storage.getLoan((req.params.id as string));
    if (!loan) return res.status(404).send("Prêt introuvable");
    const userId = (req.session as any).userId;
    const role = (req.session as any).role;
    if (loan.userId !== userId && role !== "admin") return res.status(403).send("Acces refuse");
    // Never expose the code to the client — only admin can see it
    const steps = await storage.getLoanSteps((req.params.id as string));
    const safeSteps = steps.map(({ code, ...rest }) => ({
      ...rest,
      // Client only sees if a code is required and if it's validated
      codeRequired: rest.codeRequired,
      codeValidated: rest.codeValidated,
    }));
    res.json(safeSteps);
  });

  app.post("/api/loans/:id/validate-code", requireAuth, async (req: Request, res: Response) => {
    try {
      const loan = await storage.getLoan((req.params.id as string));
      if (!loan) return res.status(404).send("Prêt introuvable");
      if (loan.userId !== (req.session as any).userId) return res.status(403).send("Acces refuse");

      const steps = await storage.getLoanSteps((req.params.id as string));
      const activeStep = steps.find((s) => s.status === "code_required");
      if (!activeStep) return res.status(400).send("Aucune etape ne requiert de code actuellement");
      if (!req.body.code) return res.status(400).send("Code manquant");
      if (activeStep.code !== req.body.code) return res.status(400).send("Code invalide");

      // Unlock: mark step completed, activate next step
      await storage.updateLoanStep(activeStep.id, {
        status: "completed",
        codeValidated: true,
        unlockedAt: new Date(),
      });

      const nextStep = steps.find((s) => s.stepIndex === activeStep.stepIndex + 1);
      if (nextStep) {
        await storage.updateLoanStep(nextStep.id, { status: "active" });
        await storage.updateLoan(loan.id, { currentStep: nextStep.stepIndex });
      } else {
        await storage.updateLoan(loan.id, { currentStep: activeStep.stepIndex });
      }
      res.json({ ok: true });
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  app.get("/api/admin/clients", requireAuth, requireAdmin, async (_req, res) => {
    const clients = await storage.getAllClients();
    res.json(clients.map(({ password, ...rest }) => rest));
  });

  // Admin: create a client account and return plaintext credentials
  app.post("/api/admin/clients", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { fullName, email, phone } = req.body;
      if (!fullName || !email) return res.status(400).send("fullName et email requis");
      // Auto-generate username from email prefix
      const baseUsername = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
      let username = baseUsername;
      let suffix = 1;
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${suffix++}`;
      }
      const plainPassword = generatePassword(10);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const user = await storage.createUser({ username, password: hashedPassword, fullName, email, phone: phone || null, role: "client", avatarUrl: null, active: false });
      const account = await storage.createAccount({ userId: user.id, type: "main", name: "Compte Courant", balance: 0, currency: "CHF", iban: generateIBAN(), interestRate: 0 });
      const { password: _, ...safe } = user;
      const clientId = `SK-${user.id.slice(0, 6).toUpperCase()}`;

      // ── Envoi automatique du contrat + identifiants par email ──────────────
      setImmediate(async () => {
        try {
          let pdfBuf: Buffer | null = null;
          try {
            pdfBuf = await generatePdfBuffer("account_contract", "fr", { client: { fullName, email, phone }, account });
          } catch (pdfErr) {
            console.error("[ADMIN PDF] Contract generation failed:", pdfErr);
          }

          const credHtml = `
            <p>Cher(e) <strong>${fullName}</strong>,</p>
            <p>Votre conseiller SwizKote Bank a ouvert un compte en votre nom. Vous trouverez ci-dessous vos accès :</p>
            <div class="box">
              <p style="margin:0"><strong>Identifiant client :</strong> <code>${clientId}</code></p>
              <p style="margin:8px 0 0"><strong>Identifiant de connexion :</strong> <code>${username}</code></p>
              <p style="margin:8px 0 0"><strong>Mot de passe provisoire :</strong> <code>${plainPassword}</code></p>
              <p style="margin:8px 0 0"><strong>IBAN :</strong> <code>${account.iban}</code></p>
            </div>
            <p style="color:#c0392b;font-size:13px">⚠️ Pour votre sécurité, veuillez modifier votre mot de passe dès votre première connexion.</p>
            <p>Votre contrat d'ouverture de compte est joint à cet email. Conservez-le précieusement.</p>
            <a href="${process.env.APP_URL || "https://app.swizkote.ch"}/login" class="btn">Accéder à mon espace client</a>
            <p style="font-size:12px;color:#888;margin-top:24px">
              <em>Document confidentiel — Secret bancaire protégé par l'art. 47 LB suisse.</em>
            </p>`;

          await sendEmail({
            to: email,
            subject: `SwizKote Bank — Ouverture de compte & identifiants (${clientId})`,
            html: emailTemplate("Votre compte SwizKote Bank est ouvert", credHtml),
          });
          console.log(`[ADMIN] Credentials email sent to ${email} (${clientId})`);
        } catch (mailErr) {
          console.error("[ADMIN] Email/PDF error:", mailErr);
        }
      });

      // Return user + plaintext password (to be communicated to client)
      res.json({ ...safe, plainPassword, clientId, iban: account.iban });
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // Admin: activate / deactivate a user account
  app.patch("/api/admin/clients/:id/activate", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { active } = req.body;
      const updated = await storage.updateUser(req.params.id, { active: Boolean(active) });
      if (!updated) return res.status(404).send("Utilisateur introuvable");
      res.json(updated);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  app.get("/api/admin/transfers", requireAuth, requireAdmin, async (_req, res) => {
    res.json(await storage.getAllTransfers());
  });

  app.patch("/api/admin/transfers/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { progress, adminMessage, status } = req.body;
      const data: any = {};
      if (progress !== undefined) data.progress = progress;
      if (adminMessage !== undefined) data.adminMessage = adminMessage;
      if (status !== undefined) data.status = status;
      const updated = await storage.updateTransfer((req.params.id as string), data);
      if (!updated) return res.status(404).send("Transfert introuvable");
      res.json(updated);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.post("/api/admin/transfers/:id/generate-otp", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const otp = generateOTP();
      await storage.updateTransfer((req.params.id as string), { otpCode: otp, status: "blocked" });
      res.json({ otp });
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.get("/api/admin/messages", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.json([]);
    res.json(await storage.getMessagesByUser(userId));
  });

  app.post("/api/admin/messages", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, content } = req.body;
      const msg = await storage.createMessage({ userId, content, fromAdmin: true });
      res.json(msg);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── ADMIN LOANS ──────────────────────────────────────────────────────────
  app.get("/api/admin/loans", requireAuth, requireAdmin, async (_req, res) => {
    const allLoans = await storage.getAllLoans();
    // Attach user info
    const clients = await storage.getAllClients();
    const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));
    const enriched = allLoans.map((l) => ({ ...l, user: clientMap[l.userId] ? { fullName: clientMap[l.userId].fullName, email: clientMap[l.userId].email } : null }));
    res.json(enriched);
  });

  app.post("/api/admin/loans", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, label, amount, currency, adminNote, steps: customSteps, type } = req.body;
      if (!userId || !label || !amount) return res.status(400).send("userId, label et amount requis");
      const loan = await storage.createLoan({ userId, label, amount: parseFloat(amount), currency: currency || "CHF", totalSteps: 4, adminNote: adminNote || null, type: type || "transfer" });
      // Create the 4 default steps (or custom ones)
      const loanType = (loan.type as string) || "transfer";
      const stepDefs = (customSteps && customSteps.length === 4) ? customSteps : (DEFAULT_LOAN_STEPS[loanType] || DEFAULT_LOAN_STEPS["transfer"]);
      for (let i = 0; i < stepDefs.length; i++) {
        await storage.createLoanStep({
          loanId: loan.id,
          stepIndex: i,
          label: stepDefs[i].label,
          description: stepDefs[i].description || null,
          status: i === 0 ? "active" : "pending",
          codeRequired: false,
          code: null,
          codeValidated: false,
          unlockedAt: null,
        });
      }

      // ── Notification email au client + PDF contrat de prêt si applicable ───
      setImmediate(async () => {
        try {
          const client = await storage.getUser(userId);
          if (!client) return;
          const amtNum = parseFloat(amount);
          const cur = currency || "CHF";
          const fmtAmt = new Intl.NumberFormat("fr-CH", { style: "currency", currency: cur, minimumFractionDigits: 2 }).format(amtNum);
          const isLoan = loanType === "loan_request" || loanType === "loan_active";

          // Generate loan contract PDF if it's an actual loan
          if (isLoan) {
            try {
              await generatePdfBuffer("loan_contract", "fr", {
                client: { fullName: client.fullName, email: client.email, phone: client.phone },
                loan: { amount: amtNum, currency: cur, label, createdAt: new Date().toISOString() },
                rate: 4.9, duration: 60,
              });
              console.log(`[LOAN PDF] Contract generated for ${client.email}`);
            } catch (pdfErr) {
              console.error("[LOAN PDF] Generation failed:", pdfErr);
            }
          }

          const notifHtml = `
            <p>Cher(e) <strong>${client.fullName}</strong>,</p>
            <p>Votre conseiller SwizKote Bank a ${isLoan ? "initié une demande de prêt" : "créé un dossier de suivi"} en votre nom.</p>
            <div class="box">
              <p style="margin:0"><strong>Référence dossier :</strong> <code>${loan.id.slice(0, 8).toUpperCase()}</code></p>
              <p style="margin:8px 0 0"><strong>Intitulé :</strong> ${label}</p>
              <p style="margin:8px 0 0"><strong>Montant :</strong> ${fmtAmt}</p>
              <p style="margin:8px 0 0"><strong>Type :</strong> ${loanType === "loan_request" ? "Demande de crédit" : loanType === "loan_active" ? "Prêt actif" : "Dossier de virement"}</p>
            </div>
            ${isLoan ? "<p>Votre contrat de prêt est en cours de préparation. Il vous sera adressé dès validation finale.</p>" : ""}
            <p>Suivez l'avancement de votre dossier en temps réel depuis votre espace client.</p>
            <a href="${process.env.APP_URL || "https://app.swizkote.ch"}/loans" class="btn">Suivre mon dossier</a>
            ${adminNote ? `<p style="margin-top:16px;font-size:13px;color:#666"><strong>Note de votre conseiller :</strong> ${adminNote}</p>` : ""}`;

          await sendEmail({
            to: client.email,
            subject: `SwizKote Bank — Nouveau dossier ouvert : ${label}`,
            html: emailTemplate("Nouveau dossier ouvert", notifHtml),
          });
          console.log(`[LOAN] Notification email sent to ${client.email}`);
        } catch (mailErr) {
          console.error("[LOAN] Email error:", mailErr);
        }
      });

      res.json(loan);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.get("/api/admin/loans/:id/steps", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    const steps = await storage.getLoanSteps((req.params.id as string));
    res.json(steps); // Admin sees everything including codes
  });

  // Admin: advance a step (mark completed, activate next)
  app.post("/api/admin/loans/:loanId/steps/:stepId/advance", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const step = await storage.getLoanStep((req.params.stepId as string));
      if (!step) return res.status(404).send("Etape introuvable");
      if (step.status === "code_required") return res.status(400).send("Un code est exige. Supprimez-le d'abord ou validez-le.");

      await storage.updateLoanStep(step.id, { status: "completed", unlockedAt: new Date() });

      const steps = await storage.getLoanSteps((req.params.loanId as string));
      const nextStep = steps.find((s) => s.stepIndex === step.stepIndex + 1);
      if (nextStep) {
        await storage.updateLoanStep(nextStep.id, { status: "active" });
        await storage.updateLoan((req.params.loanId as string), { currentStep: nextStep.stepIndex });
      } else {
        await storage.updateLoan((req.params.loanId as string), { currentStep: step.stepIndex });
      }
      res.json({ ok: true });
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // Admin: require a code on the current active step
  app.post("/api/admin/loans/:loanId/steps/:stepId/require-code", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const step = await storage.getLoanStep((req.params.stepId as string));
      if (!step) return res.status(404).send("Etape introuvable");
      if (step.status === "completed") return res.status(400).send("Etape deja completee");
      const code = generateOTP();
      await storage.updateLoanStep(step.id, { status: "code_required", codeRequired: true, code, codeValidated: false });
      res.json({ code }); // Admin sees the code to communicate to client
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // Admin: remove code requirement (unlock without code)
  app.post("/api/admin/loans/:loanId/steps/:stepId/remove-code", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const step = await storage.getLoanStep((req.params.stepId as string));
      if (!step) return res.status(404).send("Etape introuvable");
      await storage.updateLoanStep(step.id, { status: "active", codeRequired: false, code: null, codeValidated: false });
      res.json({ ok: true });
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // Admin: update loan note + label
  app.patch("/api/admin/loans/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateLoan((req.params.id as string), { adminNote: req.body.adminNote });
      res.json(updated);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // Admin: update a step's label/description
  app.patch("/api/admin/loans/:loanId/steps/:stepId", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { label, description } = req.body;
      const updated = await storage.updateLoanStep((req.params.stepId as string), { label, description });
      res.json(updated);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // Admin: disburse funds — mark last step completed + credit client's main account
  app.post("/api/admin/loans/:id/disburse", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const loan = await storage.getLoan((req.params.id as string));
      if (!loan) return res.status(404).send("Prêt introuvable");
      const steps = await storage.getLoanSteps((req.params.id as string));
      const lastStep = steps.reduce((a, b) => a.stepIndex > b.stepIndex ? a : b, steps[0]);
      if (!lastStep) return res.status(400).send("Aucune étape trouvée");
      if (lastStep.status === "code_required") return res.status(400).send("Un code est requis avant le décaissement");
      // Mark all remaining steps completed
      for (const step of steps) {
        if (step.status !== "completed") {
          await storage.updateLoanStep(step.id, { status: "completed", unlockedAt: new Date() });
        }
      }
      await storage.updateLoan(loan.id, { currentStep: lastStep.stepIndex });
      // Credit the client's main account
      const accounts = await storage.getAccountsByUser(loan.userId);
      const mainAccount = accounts.find(a => a.type === "main") || accounts[0];
      if (!mainAccount) return res.status(400).send("Aucun compte trouvé pour ce client");
      const description = req.body.description || `Décaissement prêt — ${loan.label}`;
      await storage.creditAccount(mainAccount.id, loan.amount, description);
      res.json({ ok: true, creditedAccount: mainAccount.id, amount: loan.amount });
    } catch (err: any) { res.status(500).send(err.message); }
  });


  // ─── ADMIN: STATS DASHBOARD ──────────────────────────────────────────────────
  app.get("/api/admin/stats", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── ADMIN: ALL ACCOUNTS ─────────────────────────────────────────────────────
  app.get("/api/admin/accounts", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const accs = await storage.getAllAccounts();
      res.json(accs);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.get("/api/admin/accounts/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const accs = await storage.getAccountsByUser((req.params.userId as string));
      res.json(accs);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // Admin: credit / debit account
  app.post("/api/admin/accounts/:id/credit", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { amount, description } = req.body;
      if (!amount || amount <= 0) return res.status(400).send("Invalid amount");
      const updated = await storage.creditAccount((req.params.id as string), parseFloat(amount), description || "Credit administratif");
      if (!updated) return res.status(404).send("Compte introuvable");
      res.json(updated);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.post("/api/admin/accounts/:id/debit", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { amount, description } = req.body;
      if (!amount || amount <= 0) return res.status(400).send("Invalid amount");
      const updated = await storage.debitAccount((req.params.id as string), parseFloat(amount), description || "Debit administratif");
      if (!updated) return res.status(404).send("Compte introuvable");
      res.json(updated);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // Admin: update account (block, name, interestRate)
  app.patch("/api/admin/accounts/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateAccount((req.params.id as string), req.body);
      res.json(updated);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── ADMIN: ALL TRANSACTIONS ─────────────────────────────────────────────────
  app.get("/api/admin/transactions", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const txs = await storage.getAllTransactions();
      res.json(txs);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.get("/api/admin/transactions/:userId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const txs = await storage.getTransactionsByUser((req.params.userId as string));
      res.json(txs);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── ADMIN: ISSUE CARD ───────────────────────────────────────────────────────
  app.post("/api/admin/cards", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, accountId, type } = req.body;
      if (!userId || !accountId || !type) return res.status(400).send("Missing fields");
      const card = await storage.createCard({
        userId, accountId, type,
        cardNumber: generateCardNumber(),
        expirationDate: `${String(new Date().getMonth()+1).padStart(2,"0")}/${new Date().getFullYear()+4}`,
        status: "active",
        contactlessEnabled: true,
        internationalEnabled: false,
        weeklyLimit: 5000,
        monthlyLimit: 20000,
      });
      res.json(card);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── ADMIN: UPDATE CLIENT INFO ───────────────────────────────────────────────
  app.patch("/api/admin/clients/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { fullName, email, phone } = req.body;
      const updated = await storage.updateUser((req.params.id as string), { fullName, email, phone });
      if (!updated) return res.status(404).send("Utilisateur introuvable");
      const { password: _, ...safe } = updated;
      res.json(safe);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── CLIENT: UPDATE OWN PROFILE ──────────────────────────────────────────────
  app.patch("/api/auth/profile", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { fullName, email, phone } = req.body;
      const updated = await storage.updateUser(userId, { fullName, email, phone });
      if (!updated) return res.status(404).send("Utilisateur introuvable");
      const { password: _, ...safe } = updated;
      res.json(safe);
    } catch (err: any) { res.status(500).send(err.message); }
  });

  app.post("/api/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword || newPassword.length < 8) return res.status(400).send("Mot de passe invalide (min 8 caractères)");
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).send("Utilisateur introuvable");
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return res.status(401).send("Mot de passe actuel incorrect");
      const hashed = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(userId, { password: hashed });
      res.json({ ok: true });
    } catch (err: any) { res.status(500).send(err.message); }
  });

  // ─── PDF GENERATION ──────────────────────────────────────────────────────────
  app.post("/api/admin/pdf/generate", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { type, lang, data } = req.body;
      if (!type || !lang || !data) return res.status(400).send("Missing type, lang or data");

      const allowed = ["account_contract","loan_contract","receipt","invoice","statement","closure"];
      if (!allowed.includes(type)) return res.status(400).send("Invalid document type");
      if (!["fr","de"].includes(lang)) return res.status(400).send("Invalid lang (fr or de)");

      const tmpFile = path.join(os.tmpdir(), `swizkote-${type}-${Date.now()}.pdf`);
      const scriptPath = path.join(__dirname, "pdf", "generator.py");
      const payload = JSON.stringify({ type, lang, data, outputPath: tmpFile });

      await new Promise<void>((resolve, reject) => {
        const py = spawn("python3", [scriptPath], { env: { ...process.env } });
        let stderr = "";
        py.stdin.write(payload);
        py.stdin.end();
        py.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
        py.on("close", (code: number) => {
          if (code === 0) resolve();
          else reject(new Error(`PDF generator failed (code ${code}): ${stderr.slice(0,500)}`));
        });
      });

      if (!fs.existsSync(tmpFile)) return res.status(500).send("PDF file not created");

      const docNames: Record<string,string> = {
        account_contract: lang === "de" ? "Kontoeröffnungsvertrag" : "Contrat-Ouverture-Compte",
        loan_contract:    lang === "de" ? "Kreditvertrag" : "Contrat-Pret",
        receipt:          lang === "de" ? "Zahlungsquittung" : "Quittance-Paiement",
        invoice:          lang === "de" ? "Rechnung" : "Facture",
        statement:        lang === "de" ? "Kontoauszug" : "Releve-Compte",
        closure:          lang === "de" ? "Kontoauflosung" : "Cloture-Compte",
      };
      const filename = `SwizKote-${docNames[type] || type}-${Date.now()}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      const stream = fs.createReadStream(tmpFile);
      stream.pipe(res);
      stream.on("close", () => { try { fs.unlinkSync(tmpFile); } catch {} });
    } catch (err: any) {
      console.error("PDF generation error:", err.message);
      res.status(500).send(err.message);
    }
  });

  // ─── ADMIN: SEND PDF BY EMAIL ──────────────────────────────────────────────
  app.post("/api/admin/pdf/send-email", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { userId, type, lang, data, subject, message } = req.body;
      if (!userId || !type || !lang) return res.status(400).send("userId, type et lang requis");

      const client = await storage.getUser(userId);
      if (!client) return res.status(404).send("Client introuvable");

      const pdfBuf = await generatePdfBuffer(type, lang, data || {});

      const docLabels: Record<string, string> = {
        account_contract: "Contrat d'Ouverture de Compte",
        loan_contract: "Contrat de Prêt",
        receipt: "Quittance de Paiement",
        invoice: "Facture",
        statement: "Relevé de Compte",
        closure: "Certificat de Clôture",
      };
      const docLabel = docLabels[type] || type;
      const customMsg = message ? `<p>${message}</p>` : "";

      const bodyHtml = `
        <p>Cher(e) <strong>${client.fullName}</strong>,</p>
        ${customMsg}
        <p>Vous trouverez ci-joint votre document : <strong>${docLabel}</strong>.</p>
        <p>Pour toute question, n'hésitez pas à contacter votre conseiller ou notre service client.</p>
        <a href="${process.env.APP_URL || "https://app.swizkote.ch"}/login" class="btn">Accéder à mon espace client</a>`;

      // Note: attachments require nodemailer configured with SMTP
      await sendEmail({
        to: client.email,
        subject: subject || `SwizKote Bank — ${docLabel}`,
        html: emailTemplate(docLabel, bodyHtml),
      });

      res.json({ ok: true, sentTo: client.email, docType: type, docLabel });
    } catch (err: any) {
      console.error("Send PDF email error:", err.message);
      res.status(500).send(err.message);
    }
  });

  // ─── ADMIN: SEND CONTRACT TO CLIENT ───────────────────────────────────────
  app.post("/api/admin/clients/:id/send-contract", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const client = await storage.getUser((req.params.id as string));
      if (!client) return res.status(404).send("Client introuvable");

      const accounts = await storage.getAccountsByUser(client.id);
      const account = accounts[0];
      if (!account) return res.status(404).send("Aucun compte trouvé pour ce client");

      // Generate PDF
      let pdfGenerated = false;
      try {
        await generatePdfBuffer("account_contract", "fr", {
          client: { fullName: client.fullName, email: client.email, phone: client.phone },
          account,
        });
        pdfGenerated = true;
      } catch (pdfErr) {
        console.error("[CONTRACT] PDF error:", pdfErr);
      }

      const clientId = `SK-${client.id.slice(0, 6).toUpperCase()}`;
      const bodyHtml = `
        <p>Cher(e) <strong>${client.fullName}</strong>,</p>
        <p>Veuillez trouver ci-joint votre <strong>contrat d'ouverture de compte</strong> chez SwizKote Bank.</p>
        <div class="box">
          <p style="margin:0"><strong>Identifiant client :</strong> <code>${clientId}</code></p>
          <p style="margin:8px 0 0"><strong>IBAN :</strong> <code>${account.iban}</code></p>
          <p style="margin:8px 0 0"><strong>Type de compte :</strong> ${account.name}</p>
        </div>
        <p>Ce document est confidentiel et constitue votre preuve contractuelle auprès de SwizKote Bank.</p>
        <p style="font-size:12px;color:#888"><em>Secret bancaire garanti par l'art. 47 de la Loi fédérale sur les banques.</em></p>
        <a href="${process.env.APP_URL || "https://app.swizkote.ch"}/login" class="btn">Accéder à mon espace client</a>`;

      await sendEmail({
        to: client.email,
        subject: `SwizKote Bank — Votre contrat d'ouverture de compte (${clientId})`,
        html: emailTemplate("Contrat d'Ouverture de Compte", bodyHtml),
      });

      res.json({ ok: true, sentTo: client.email, clientId, iban: account.iban, pdfGenerated });
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  // ─── ADMIN: GENERATE CLIENT CREDENTIALS ───────────────────────────────────
  app.post("/api/admin/clients/:id/generate-credentials", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const client = await storage.getUser((req.params.id as string));
      if (!client) return res.status(404).send("Client introuvable");

      // Generate new password
      const newPassword = generatePassword(12);
      const hashed = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(client.id, { password: hashed });

      const clientId = `SK-${client.id.slice(0, 6).toUpperCase()}`;
      const accounts = await storage.getAccountsByUser(client.id);
      const iban = accounts[0]?.iban || "—";

      // Send credentials by email
      const bodyHtml = `
        <p>Cher(e) <strong>${client.fullName}</strong>,</p>
        <p>Vos identifiants d'accès à votre espace SwizKote Bank ont été régénérés par votre conseiller.</p>
        <div class="box">
          <p style="margin:0"><strong>Identifiant client :</strong> <code>${clientId}</code></p>
          <p style="margin:8px 0 0"><strong>Identifiant de connexion :</strong> <code>${client.username}</code></p>
          <p style="margin:8px 0 0"><strong>Nouveau mot de passe :</strong> <code>${newPassword}</code></p>
          <p style="margin:8px 0 0"><strong>IBAN :</strong> <code>${iban}</code></p>
        </div>
        <p style="color:#c0392b;font-size:13px">⚠️ Modifiez votre mot de passe dès votre première connexion.</p>
        <a href="${process.env.APP_URL || "https://app.swizkote.ch"}/login" class="btn">Me connecter maintenant</a>`;

      await sendEmail({
        to: client.email,
        subject: `SwizKote Bank — Vos nouveaux identifiants (${clientId})`,
        html: emailTemplate("Nouveaux identifiants d'accès", bodyHtml),
      });

      res.json({ ok: true, clientId, username: client.username, newPassword, sentTo: client.email });
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  return httpServer;
}