# RepoMind

_In migration towards the repomind feature set (see reference repo) — Part 1/4 alignment._

## Current Status (Part 1)
This codebase currently provides:

- Express + Vite dev server (monorepo style: `client`, `server`, `shared`)
- GitHub OAuth code exchange endpoint (manual implementation)
- Repository ingestion (files + commits) using Octokit
- Simple in-memory vector store with OpenAI embeddings
- OpenAI (gpt-5) based:
	- Commit summarization
	- Repository analysis (initial draft)
	- Q&A over repository (retrieval + answer)
- Drizzle ORM + Neon (serverless Postgres) schema (`shared/schema.ts`)

## Target Convergence Areas vs repomind
repomind (target) includes: Next.js App Router, Clerk auth, Prisma, Pinecone, Gemini, rich markdown streaming, advanced UI sections (landing features, meeting analysis, commit summaries dashboard).

We will converge in 4 planned parts:
1. Baseline & config alignment (this PR / update): env example, gap analysis, planning docs (DONE)
2. Backend parity improvements: session hardening, auth abstraction, vector store extensibility, streaming answer scaffolding
3. Frontend enhancements: component parity (markdown renderer, typing effect, repository dashboard refinements), theming & layout adjustments
4. Advanced features: meeting transcript ingestion, Pinecone adapter, Gemini alternative provider layer, production hardening + docs

## Environment Variables
See `.env.example` for the evolving list (includes forward-looking placeholders for Pinecone & Gemini).

## Development
Install deps and run dev server:

```bash
npm install
npm run dev
```

The single Express server serves API + Vite client on the same port (default 5000).

## Roadmap Checklist
- [x] Part 1 baseline alignment
- [x] Part 2 backend parity (sessions, rate limiting, AI/vector abstraction, streaming endpoint groundwork)
- [x] Part 3 (in progress) – markdown rendering + streaming typing component
- [x] Part 3 completed: commit timeline, citations panel, landing sections, OKLCH palette
- [ ] Part 4 advanced features & hardening

## License
MIT
