import bcrypt from "bcryptjs";
import { storage } from "./storage.js";
import { db } from "./db.js";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Vérifier si la base de données est déjà initialisée
    const existingAdmin = await storage.getUserByUsername("admin");
    if (existingAdmin) {
      console.log("✅ Base de données déjà initialisée, seed ignoré");
      return;
    }

    console.log("🌱 Initialisation de la base de données...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await storage.createUser({
      username: "admin",
      password: adminPassword,
      fullName: "Marc Dubois",
      email: "admin@swizkote.ch",
      phone: "+41 22 300 00 01",
      role: "admin",
      avatarUrl: null,
    });

    const clientPassword = await bcrypt.hash("client123", 10);
    const client = await storage.createUser({
      username: "client",
      password: clientPassword,
      fullName: "Sophie Laurent",
      email: "sophie.laurent@email.ch",
      phone: "+41 79 123 45 67",
      role: "client",
      avatarUrl: null,
    });

    const mainAccount = await storage.createAccount({
      userId: client.id,
      type: "main",
      name: "Compte Courant",
      balance: 47850.75,
      currency: "CHF",
      iban: "CH93 0076 2011 6238 5295 7",
      interestRate: 0,
    });

    const savingsAccount = await storage.createAccount({
      userId: client.id,
      type: "savings",
      name: "Epargne Retraite",
      balance: 125000,
      currency: "CHF",
      iban: "CH45 0076 2011 6238 8471 2",
      interestRate: 4,
    });

    const euroAccount = await storage.createAccount({
      userId: client.id,
      type: "savings",
      name: "Compte Euro",
      balance: 15300,
      currency: "EUR",
      iban: "CH78 0076 2011 6238 9012 5",
      interestRate: 2.5,
    });

    await storage.createCard({
      accountId: mainAccount.id,
      userId: client.id,
      type: "visa_infinite",
      cardNumber: "4532789012345678",
      expirationDate: "12/28",
      status: "active",
      contactlessEnabled: true,
      internationalEnabled: true,
      weeklyLimit: 10000,
      monthlyLimit: 40000,
    });

    await storage.createCard({
      accountId: savingsAccount.id,
      userId: client.id,
      type: "mastercard_gold",
      cardNumber: "5412345678901234",
      expirationDate: "06/27",
      status: "active",
      contactlessEnabled: true,
      internationalEnabled: false,
      weeklyLimit: 5000,
      monthlyLimit: 20000,
    });

    const txData = [
      { accountId: mainAccount.id, type: "credit", amount: 8500, currency: "CHF", description: "Salaire - Nestle SA", recipientName: "Nestle SA" },
      { accountId: mainAccount.id, type: "debit", amount: 2100, currency: "CHF", description: "Loyer - Regie Immobiliere", recipientName: "Regie Immobiliere" },
      { accountId: mainAccount.id, type: "debit", amount: 89.50, currency: "CHF", description: "Migros - Courses alimentaires", recipientName: "Migros" },
      { accountId: mainAccount.id, type: "debit", amount: 250, currency: "CHF", description: "Assurance maladie - CSS", recipientName: "CSS Assurance" },
      { accountId: mainAccount.id, type: "credit", amount: 1200, currency: "CHF", description: "Remboursement - Jean Pierre", recipientName: "Jean Pierre" },
      { accountId: mainAccount.id, type: "debit", amount: 45.80, currency: "CHF", description: "Swisscom - Abonnement mobile", recipientName: "Swisscom" },
      { accountId: savingsAccount.id, type: "credit", amount: 5000, currency: "CHF", description: "Transfert interne - Epargne", recipientName: "Virement interne" },
      { accountId: mainAccount.id, type: "debit", amount: 320, currency: "CHF", description: "SBB CFF - Abonnement general", recipientName: "SBB CFF" },
    ];

    for (const tx of txData) {
      await storage.createTransaction(tx);
    }

    const transfer = await storage.createTransfer({
      userId: client.id,
      fromAccountId: mainAccount.id,
      recipientName: "Hotel Beau-Rivage Palace",
      recipientIban: "CH12 0483 5024 6789 0000 0",
      recipientBank: "Credit Suisse",
      amount: 3500,
      currency: "CHF",
      isInternational: false,
    });

    await storage.updateTransfer(transfer.id, {
      status: "processing",
      progress: 50,
      adminMessage: "Etape 3 : Verification de la banque receptrice en cours",
    });

    await storage.createDocument({
      userId: client.id,
      name: "Passeport_Sophie_Laurent.pdf",
      type: "passport",
      size: 2450000,
    });

    await storage.createDocument({
      userId: client.id,
      name: "Contrat_Location_2024.pdf",
      type: "contract",
      size: 1200000,
    });

    await storage.createDocument({
      userId: client.id,
      name: "Releve_Janvier_2025.pdf",
      type: "statement",
      size: 890000,
    });

    await storage.createMessage({
      userId: client.id,
      content: "Bonjour, j'aimerais avoir des informations sur les taux hypothecaires actuels.",
      fromAdmin: false,
    });

    await storage.createMessage({
      userId: client.id,
      content: "Bonjour Madame Laurent, nos taux hypothecaires fixes sont actuellement a 1.5% pour une duree de 10 ans. Souhaitez-vous planifier un rendez-vous avec notre specialiste?",
      fromAdmin: true,
    });

    await storage.createMessage({
      userId: client.id,
      content: "Oui, ce serait parfait. Quand est-ce possible?",
      fromAdmin: false,
    });

    console.log("✅ Database seeded successfully");
    console.log("📝 Client: username=client, password=client123");
    console.log("📝 Admin: username=admin, password=admin123");
    
  } catch (err) {
    console.error("⚠️ Erreur lors du seed (peut être ignorée si la DB existe déjà):", err);
    // Ne pas relancer l'erreur pour éviter de bloquer le démarrage
  }
}