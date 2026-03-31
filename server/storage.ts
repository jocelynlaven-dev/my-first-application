import { decisions, type Decision, type CreateDecisionPayload } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  createDecision(decision: CreateDecisionPayload): Promise<Decision>;
  getDecisions(): Promise<Decision[]>;
}

export class DatabaseStorage implements IStorage {
  async createDecision(decision: CreateDecisionPayload): Promise<Decision> {
    const [created] = await db.insert(decisions).values({
      query: decision.query,
      responses: decision.responses,
    }).returning();
    return created;
  }

  async getDecisions(): Promise<Decision[]> {
    return await db.select().from(decisions);
  }
}

export const storage = new DatabaseStorage();
