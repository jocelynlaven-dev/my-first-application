# Personal Board of Directors — replit.md

## Overview

**Personal Board of Directors** is a decision-support web app where a user types in a real-life decision they're considering, and a simulated "board" of 25 distinct AI personas each provide structured advice. The app randomly selects 6 personas per consultation, queries OpenAI for their responses, displays results in animated cards, and persists each decision + AI responses to a PostgreSQL database.

The app is elegant and thoughtful in tone — not playful or gimmicky. It uses a parchment/indigo/muted-gold color palette, Playfair Display for headings, and DM Sans for body text.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## System Architecture

### Frontend (React + Vite + TypeScript)

- **Framework**: React 18 with Vite as the build tool. The client lives in `client/src/`.
- **Routing**: `wouter` for lightweight client-side routing. Only two routes: `/` (Home) and a 404 fallback.
- **State & Data Fetching**: TanStack React Query (`@tanstack/react-query`) for server state. Custom hooks in `client/src/hooks/use-decisions.ts` wrap `useQuery` and `useMutation` for the decisions API.
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives. All component files live in `client/src/components/ui/`. Tailwind CSS handles styling.
- **Animations**: Framer Motion for card reveal sequences and loading states.
- **Custom Components**:
  - `PersonaCard` — displays a single persona's advice (icon, color-coded header, summary, advice, and a reflective question).
  - `LoadingBoard` — animated spinner shown while OpenAI is generating responses.
- **Typography**: Google Fonts — Playfair Display (display/headings) + DM Sans (body).
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`.

### Backend (Express + TypeScript)

- **Server**: Express 5 running on Node.js, entry point at `server/index.ts`.
- **API Routes**: Defined in `server/routes.ts`. Two main endpoints:
  - `POST /api/decisions` — accepts a user query, randomly selects 6 personas from the 25 available, calls OpenAI to generate structured advice for each, saves the result to the database, and returns the full decision record.
  - `GET /api/decisions` — returns all saved decisions.
- **Route Contract**: Shared between client and server via `shared/routes.ts` using Zod schemas. This is the single source of truth for input/output shapes.
- **Storage Layer**: `server/storage.ts` defines an `IStorage` interface and a `DatabaseStorage` class that uses Drizzle ORM to read/write to Postgres.
- **OpenAI Integration**: Uses the `openai` Node.js SDK. API key is read from `process.env.AI_INTEGRATIONS_OPENAI_API_KEY` and base URL from `process.env.AI_INTEGRATIONS_OPENAI_BASE_URL`.
- **Development**: Vite middleware is integrated directly into Express (`server/vite.ts`) for HMR in dev mode. In production, Express serves the pre-built static files from `dist/public/`.

### Shared Layer (`shared/`)

- **`shared/schema.ts`**: Drizzle table definitions + Zod schemas. The `decisions` table has: `id`, `query` (text), `responses` (JSONB array of persona responses), `createdAt`. Also defines `PersonaResponse` type: `{ persona, summary, advice, question }`.
- **`shared/routes.ts`**: Type-safe API contract (method, path, input schema, response schemas) shared by both client and server to avoid duplication.
- **`shared/personas.ts`**: Full list of 25 personas with `id`, `name`, `tone` (thoughtful/practical/funny/quirky), and `description`. The `selectRandomPersonas()` function picks 6 random personas per consultation.
- **`shared/models/chat.ts`**: Drizzle schema for `conversations` and `messages` tables (used by Replit integration utilities, not the core app flow).

### Database

- **PostgreSQL** via `drizzle-orm/node-postgres` with a connection pool (`pg.Pool`).
- **Migrations**: Drizzle Kit manages migrations; schema lives in `shared/schema.ts`. Run `npm run db:push` to sync.
- **JSONB for responses**: The AI-generated persona responses are stored as a JSONB array in a single column rather than a normalized table — simpler for this read-heavy use case where responses are always fetched together with their parent decision.

### Build

- **Production build**: `script/build.ts` runs Vite (client) then esbuild (server) sequentially. Server is bundled to `dist/index.cjs`. An allowlist controls which dependencies are inlined vs. externalized to reduce cold start time.
- **Dev**: `tsx server/index.ts` runs the server with Vite middleware for HMR.

### Replit Integration Utilities (`server/replit_integrations/`, `client/replit_integrations/`)

These are scaffolded integration modules (chat, audio, image, batch) provided by Replit. They are **not used by the core app flow** but are available if needed. They rely on the same OpenAI environment variables.

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| **OpenAI API** | Generates structured advice for each persona. Accessed via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` env vars. Model: likely `gpt-4o` or similar (check `server/routes.ts` for the exact model string). |
| **PostgreSQL** | Primary data store. Connection string via `DATABASE_URL` env var. |
| **Drizzle ORM** | Type-safe SQL query builder and schema manager for Postgres. |
| **Radix UI** | Headless, accessible UI primitives underlying all shadcn/ui components. |
| **Framer Motion** | Animation library for card reveals and loading states. |
| **TanStack React Query** | Client-side server-state management and caching. |
| **Zod** | Runtime schema validation on both client and server. |
| **Vite** | Frontend build tool and dev server with HMR. |
| **esbuild** | Bundles the Express server for production. |
| **Google Fonts** | Playfair Display + DM Sans loaded via CDN in `client/index.html` and `client/src/index.css`. |

### Required Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI base URL (Replit proxy or direct) |