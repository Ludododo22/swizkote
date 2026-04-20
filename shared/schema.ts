import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["client", "admin"]);
export const accountTypeEnum = pgEnum("account_type", ["main", "savings", "joint", "child"]);
export const transferStatusEnum = pgEnum("transfer_status", ["pending", "processing", "completed", "blocked", "failed"]);
export const cardTypeEnum = pgEnum("card_type", ["visa_infinite", "mastercard_gold"]);
export const cardStatusEnum = pgEnum("card_status", ["active", "inactive", "blocked", "ordered"]);
export const loanStepStatusEnum = pgEnum("loan_step_status", ["pending", "active", "code_required", "completed"]);
export const loanTypeEnum = pgEnum("loan_type", ["transfer", "loan_request", "loan_active"]);
export const loanApplicationStatusEnum = pgEnum("loan_application_status", ["pending", "activated", "rejected"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: roleEnum("role").notNull().default("client"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  previousLoginAt: timestamp("previous_login_at"),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: accountTypeEnum("type").notNull().default("main"),
  name: text("name").notNull(),
  balance: real("balance").notNull().default(0),
  currency: text("currency").notNull().default("CHF"),
  iban: text("iban").notNull(),
  interestRate: real("interest_rate").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("CHF"),
  description: text("description").notNull(),
  recipientName: text("recipient_name"),
  date: timestamp("date").defaultNow(),
});

export const transfers = pgTable("transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  fromAccountId: varchar("from_account_id").notNull().references(() => accounts.id),
  recipientName: text("recipient_name").notNull(),
  recipientIban: text("recipient_iban").notNull(),
  recipientBank: text("recipient_bank"),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("CHF"),
  status: transferStatusEnum("status").notNull().default("pending"),
  progress: integer("progress").notNull().default(0),
  adminMessage: text("admin_message"),
  otpCode: text("otp_code"),
  otpValidated: boolean("otp_validated").default(false),
  isInternational: boolean("is_international").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => accounts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: cardTypeEnum("type").notNull(),
  cardNumber: text("card_number").notNull(),
  expirationDate: text("expiration_date").notNull(),
  status: cardStatusEnum("status").notNull().default("active"),
  contactlessEnabled: boolean("contactless_enabled").default(true),
  internationalEnabled: boolean("international_enabled").default(false),
  weeklyLimit: real("weekly_limit").default(5000),
  monthlyLimit: real("monthly_limit").default(20000),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  fromAdmin: boolean("from_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── LOAN APPLICATIONS (submitted by client) ─────────────────────────────────
export const loanApplications = pgTable("loan_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  loanType: text("loan_type").notNull(), // immo, conso, auto, pro, travaux
  amount: real("amount").notNull(),
  duration: integer("duration").notNull(), // months
  currency: text("currency").notNull().default("CHF"),
  purpose: text("purpose"),
  monthlyPayment: real("monthly_payment"),
  status: loanApplicationStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  activatedAt: timestamp("activated_at"),
  loanId: varchar("loan_id"), // set when admin activates → creates Loan record
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── LOANS ────────────────────────────────────────────────────────────────────
export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  label: text("label").notNull(),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("CHF"),
  currentStep: integer("current_step").notNull().default(0),
  totalSteps: integer("total_steps").notNull().default(4),
  type: loanTypeEnum("type").notNull().default("transfer"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const loanSteps = pgTable("loan_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loanId: varchar("loan_id").notNull().references(() => loans.id, { onDelete: "cascade" }),
  stepIndex: integer("step_index").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  status: loanStepStatusEnum("status").notNull().default("pending"),
  codeRequired: boolean("code_required").default(false),
  code: text("code"),
  codeValidated: boolean("code_validated").default(false),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  // Admin-controlled additional info request
  additionalInfoEnabled: boolean("additional_info_enabled").default(false),
  additionalInfoMessage: text("additional_info_message"),
  // Client response to additional info request
  clientResponse: text("client_response"),
  clientRespondedAt: timestamp("client_responded_at"),
});

// ─── SCHEMAS & TYPES ─────────────────────────────────────────────────────────
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const loginSchema = z.object({ username: z.string().min(1), password: z.string().min(1) });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true });
export const insertTransferSchema = createInsertSchema(transfers).omit({ id: true, createdAt: true, progress: true, adminMessage: true, otpCode: true, otpValidated: true, status: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, createdAt: true, updatedAt: true, currentStep: true });
export const insertLoanApplicationSchema = createInsertSchema(loanApplications).omit({ id: true, createdAt: true, activatedAt: true, loanId: true, status: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Document = typeof documents.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type LoanStep = typeof loanSteps.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
