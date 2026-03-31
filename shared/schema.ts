import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  responses: jsonb("responses").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User-facing insert schema (only query is provided by the user)
export const insertDecisionSchema = createInsertSchema(decisions).omit({ id: true, createdAt: true, responses: true });

export type Decision = typeof decisions.$inferSelect;
export type InsertDecision = z.infer<typeof insertDecisionSchema>;

// Full create payload including AI-generated responses
export type CreateDecisionPayload = {
  query: string;
  responses: PersonaResponse[];
};

export type PersonaResponse = {
  persona: string;
  summary: string;
  advice: string;
  question: string;
};

export type BoardResponses = PersonaResponse[];
