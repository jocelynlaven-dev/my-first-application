import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { selectRandomPersonas } from "@shared/personas";
import type { PersonaResponse } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  async function seedDatabase() {
    try {
      const existing = await storage.getDecisions();
      if (existing.length === 0) {
        await storage.createDecision({
          query: "Should I start a side business while working full time?",
          responses: [
            {
              persona: "The Stoic",
              summary: "Focus on your character and effort, not the external outcome.",
              advice: "Do it if it aligns with your virtues. Accept that failure is outside your control.",
              question: "Are you pursuing this for ego and status, or for genuine growth?"
            },
            {
              persona: "The Capital Allocator",
              summary: "Treat your time and energy as your most valuable assets.",
              advice: "Start small. Validate the idea with minimal capital and track your ROI closely.",
              question: "What is your defined stop-loss if it drains too much time without return?"
            },
            {
              persona: "Future You",
              summary: "You will regret not trying more than you will regret failing.",
              advice: "Take the leap. Even if it fails, the experience will enrich your life story.",
              question: "Will you be proud of yourself in 20 years for playing it safe today?"
            },
            {
              persona: "The 10-Year-Old",
              summary: "Do it if it sounds fun and exciting!",
              advice: "Make sure you still have time for your friends and doing nothing.",
              question: "Why do you want to work more when you already work all day?"
            },
            {
              persona: "The Pragmatist",
              summary: "Test the waters before diving in.",
              advice: "Dedicate strictly 5-10 hours a week to this. If it gains traction, scale up your time.",
              question: "What is the smallest, cheapest version of this business you can launch this weekend?"
            },
            {
              persona: "The Optimist",
              summary: "This is exactly the kind of move that changes lives — yours included.",
              advice: "Every great company started as a side project. The timing is never perfect — start now.",
              question: "What would you attempt if you knew it was going to work out?"
            }
          ]
        });
        console.log("Database seeded successfully");
      }
    } catch (e) {
      console.error("Failed to seed database:", e);
    }
  }
  seedDatabase();

  app.post(api.decisions.create.path, async (req, res) => {
    try {
      const input = api.decisions.create.input.parse(req.body);

      // Randomly select 6 personas from the 25 available
      const selectedPersonas = selectRandomPersonas(6);

      // Build the persona descriptions for the prompt
      const personaList = selectedPersonas
        .map((p, i) => `${i + 1}. ${p.name}: ${p.description}`)
        .join("\n");

      const personaNames = selectedPersonas.map(p => p.name).join(", ");

      const prompt = `You are simulating a Personal Board of Directors. For the following decision, generate responses from these 6 distinct personas:

Decision to consider: "${input.query}"

Personas:
${personaList}

CRITICAL RULES:
- Keep ALL answers extremely concise — each field is 15-20 words maximum
- Each persona must speak in their distinct voice
- The "question" field must be a single thought-provoking question that makes the person reflect deeply

Return ONLY valid JSON in this exact structure (an array of 6 objects, one per persona, in the same order as listed above):
{
  "responses": [
    {
      "persona": "<exact persona name>",
      "summary": "<1 sentence capturing their core stance>",
      "advice": "<direct actionable advice in their voice>",
      "question": "<one hard question they would ask>"
    }
  ]
}

The persona names in your response must match exactly: ${personaNames}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      const responsesArray = parsed.responses || [];

      const decision = await storage.createDecision({
        query: input.query,
        responses: responsesArray,
      });

      res.status(201).json(decision);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0]?.message || "Validation Error",
          field: err.errors[0]?.path?.join('.')
        });
      }
      console.error("OpenAI API Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.decisions.list.path, async (req, res) => {
    try {
      const decisionsList = await storage.getDecisions();
      res.json(decisionsList);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
