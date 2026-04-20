import { db } from "./db.js";
import { eq, desc, and } from "drizzle-orm";
import {
  users, accounts, transactions, transfers, cards, documents, messages, loans, loanSteps, loanApplications,
  type User, type InsertUser, type Account, type InsertAccount,
  type Transaction, type Transfer, type InsertTransfer,
  type Card, type InsertCard, type Document, type Message,
  type Loan, type LoanStep, type InsertLoan,
} from "@shared/schema";

type LoanApplication = typeof loanApplications.$inferSelect;
type InsertLoanApplication = Omit<LoanApplication, "id" | "createdAt" | "activatedAt" | "loanId" | "status">;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllClients(): Promise<User[]>;

  getAccountsByUser(userId: string): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccountBalance(id: string, newBalance: number): Promise<Account | undefined>;

  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  createTransaction(tx: { accountId: string; type: string; amount: number; currency: string; description: string; recipientName?: string }): Promise<Transaction>;

  getTransfersByUser(userId: string): Promise<Transfer[]>;
  getAllTransfers(): Promise<Transfer[]>;
  getTransfer(id: string): Promise<Transfer | undefined>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransfer(id: string, data: Partial<Transfer>): Promise<Transfer | undefined>;

  getCardsByUser(userId: string): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: string, data: Partial<Card>): Promise<Card | undefined>;

  getDocumentsByUser(userId: string): Promise<Document[]>;
  createDocument(doc: { userId: string; name: string; type: string; size?: number }): Promise<Document>;
  deleteDocument(id: string): Promise<void>;

  getMessagesByUser(userId: string): Promise<Message[]>;
  createMessage(msg: { userId: string; content: string; fromAdmin: boolean }): Promise<Message>;

  // Admin extended
  getAllAccounts(): Promise<Account[]>;
  getAllTransactions(): Promise<Transaction[]>;
  creditAccount(id: string, amount: number, description: string): Promise<Account | undefined>;
  debitAccount(id: string, amount: number, description: string): Promise<Account | undefined>;
  updateAccount(id: string, data: Partial<Account>): Promise<Account | undefined>;
  deleteUser(id: string): Promise<void>;
  getStats(): Promise<{ totalClients: number; totalBalance: number; totalTransfers: number; totalLoans: number }>;

  // Loans
  getLoansByUser(userId: string): Promise<Loan[]>;
  getAllLoans(): Promise<Loan[]>;
  getLoan(id: string): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, data: Partial<Loan>): Promise<Loan | undefined>;
  getLoanSteps(loanId: string): Promise<LoanStep[]>;
  getLoanStep(id: string): Promise<LoanStep | undefined>;
  createLoanStep(step: Omit<LoanStep, "id" | "createdAt">): Promise<LoanStep>;
  updateLoanStep(id: string, data: Partial<LoanStep>): Promise<LoanStep | undefined>;
  // Loan Applications
  createLoanApplication(app: InsertLoanApplication): Promise<LoanApplication>;
  getLoanApplicationsByUser(userId: string): Promise<LoanApplication[]>;
  getAllLoanApplications(): Promise<LoanApplication[]>;
  getLoanApplication(id: string): Promise<LoanApplication | undefined>;
  updateLoanApplication(id: string, data: Partial<LoanApplication>): Promise<LoanApplication | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<User>) {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getAllClients() {
    return db.select().from(users);
  }

  async getAccountsByUser(userId: string) {
    return db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async getAccount(id: string) {
    const [a] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    return a;
  }

  async createAccount(account: InsertAccount) {
    const [created] = await db.insert(accounts).values(account).returning();
    return created;
  }

  async updateAccountBalance(id: string, newBalance: number) {
    const [updated] = await db.update(accounts).set({ balance: newBalance }).where(eq(accounts.id, id)).returning();
    return updated;
  }

  async getTransactionsByUser(userId: string) {
    const userAccounts = await this.getAccountsByUser(userId);
    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) return [];
    const allTx: Transaction[] = [];
    for (const accId of accountIds) {
      const txs = await db.select().from(transactions).where(eq(transactions.accountId, accId)).orderBy(desc(transactions.date));
      allTx.push(...txs);
    }
    allTx.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db2 = b.date ? new Date(b.date).getTime() : 0;
      return db2 - da;
    });
    return allTx;
  }

  async createTransaction(tx: { accountId: string; type: string; amount: number; currency: string; description: string; recipientName?: string }) {
    const [created] = await db.insert(transactions).values(tx).returning();
    return created;
  }

  async getTransfersByUser(userId: string) {
    return db.select().from(transfers).where(eq(transfers.userId, userId)).orderBy(desc(transfers.createdAt));
  }

  async getAllTransfers() {
    return db.select().from(transfers).orderBy(desc(transfers.createdAt));
  }

  async getTransfer(id: string) {
    const [t] = await db.select().from(transfers).where(eq(transfers.id, id)).limit(1);
    return t;
  }

  async createTransfer(transfer: InsertTransfer) {
    const [created] = await db.insert(transfers).values(transfer).returning();
    return created;
  }

  async updateTransfer(id: string, data: Partial<Transfer>) {
    const [updated] = await db.update(transfers).set(data).where(eq(transfers.id, id)).returning();
    return updated;
  }

  async getCardsByUser(userId: string) {
    return db.select().from(cards).where(eq(cards.userId, userId));
  }

  async createCard(card: InsertCard) {
    const [created] = await db.insert(cards).values(card).returning();
    return created;
  }

  async updateCard(id: string, data: Partial<Card>) {
    const [updated] = await db.update(cards).set(data).where(eq(cards.id, id)).returning();
    return updated;
  }

  async getDocumentsByUser(userId: string) {
    return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.uploadedAt));
  }

  async createDocument(doc: { userId: string; name: string; type: string; size?: number }) {
    const [created] = await db.insert(documents).values(doc).returning();
    return created;
  }

  async deleteDocument(id: string) {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getMessagesByUser(userId: string) {
    return db.select().from(messages).where(eq(messages.userId, userId)).orderBy(messages.createdAt);
  }

  async createMessage(msg: { userId: string; content: string; fromAdmin: boolean }) {
    const [created] = await db.insert(messages).values(msg).returning();
    return created;
  }

  // ─── ADMIN EXTENDED ────────────────────────────────────────────────────────
  async getAllAccounts() {
    return db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  async getAllTransactions() {
    return db.select().from(transactions).orderBy(desc(transactions.date)).limit(200);
  }

  async creditAccount(id: string, amount: number, description: string) {
    const acc = await this.getAccount(id);
    if (!acc) return undefined;
    const newBalance = acc.balance + amount;
    const updated = await this.updateAccountBalance(id, newBalance);
    await this.createTransaction({ accountId: id, type: "credit", amount, currency: acc.currency, description });
    return updated;
  }

  async debitAccount(id: string, amount: number, description: string) {
    const acc = await this.getAccount(id);
    if (!acc) return undefined;
    const newBalance = acc.balance - amount;
    const updated = await this.updateAccountBalance(id, newBalance);
    await this.createTransaction({ accountId: id, type: "debit", amount, currency: acc.currency, description });
    return updated;
  }

  async updateAccount(id: string, data: Partial<Account>) {
    const [updated] = await db.update(accounts).set(data).where(eq(accounts.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id));
  }

  async getStats() {
    const allUsers = await db.select().from(users);
    const allAccounts = await db.select().from(accounts);
    const allTransfers = await db.select().from(transfers);
    const allLoans = await db.select().from(loans);
    const totalBalance = allAccounts.reduce((s, a) => s + (a.balance || 0), 0);
    return {
      totalClients: allUsers.filter(u => u.role === "client").length,
      totalBalance,
      totalTransfers: allTransfers.length,
      totalLoans: allLoans.length,
    };
  }

  // ─── LOANS ─────────────────────────────────────────────────────────────────
  async getLoansByUser(userId: string) {
    return db.select().from(loans).where(eq(loans.userId, userId)).orderBy(desc(loans.createdAt));
  }

  async getAllLoans() {
    return db.select().from(loans).orderBy(desc(loans.createdAt));
  }

  async getLoan(id: string) {
    const [l] = await db.select().from(loans).where(eq(loans.id, id)).limit(1);
    return l;
  }

  async createLoan(loan: InsertLoan) {
    const [created] = await db.insert(loans).values(loan).returning();
    return created;
  }

  async updateLoan(id: string, data: Partial<Loan>) {
    const [updated] = await db.update(loans).set({ ...data, updatedAt: new Date() }).where(eq(loans.id, id)).returning();
    return updated;
  }

  async getLoanSteps(loanId: string) {
    return db.select().from(loanSteps).where(eq(loanSteps.loanId, loanId)).orderBy(loanSteps.stepIndex);
  }

  async getLoanStep(id: string) {
    const [s] = await db.select().from(loanSteps).where(eq(loanSteps.id, id)).limit(1);
    return s;
  }

  async createLoanStep(step: Omit<LoanStep, "id" | "createdAt">) {
    const [created] = await db.insert(loanSteps).values(step as any).returning();
    return created;
  }

  async updateLoanStep(id: string, data: Partial<LoanStep>) {
    const [updated] = await db.update(loanSteps).set(data).where(eq(loanSteps.id, id)).returning();
    return updated;
  }

  // ─── LOAN APPLICATIONS ───────────────────────────────────────────────────────
  async createLoanApplication(app: InsertLoanApplication) {
    const [created] = await db.insert(loanApplications).values({ ...app, status: "pending" } as any).returning();
    return created;
  }

  async getLoanApplicationsByUser(userId: string) {
    return db.select().from(loanApplications).where(eq(loanApplications.userId, userId)).orderBy(desc(loanApplications.createdAt));
  }

  async getAllLoanApplications() {
    return db.select().from(loanApplications).orderBy(desc(loanApplications.createdAt));
  }

  async getLoanApplication(id: string) {
    const [a] = await db.select().from(loanApplications).where(eq(loanApplications.id, id)).limit(1);
    return a;
  }

  async updateLoanApplication(id: string, data: Partial<LoanApplication>) {
    const [updated] = await db.update(loanApplications).set(data).where(eq(loanApplications.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();