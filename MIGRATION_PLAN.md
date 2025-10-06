# RepoMind -> repomind Parity Migration Plan

This document tracks the remaining 3 parts after Part 1 baseline alignment.

## Part 2 – Backend Parity & Foundations
Focus: Robust auth/session, abstraction layers, future provider flexibility, streaming.

### Goals
- Add session store hardening (Redis or MemoryStore fallback) – currently using default (todo: integrate `memorystore` actually imported?)
- Abstract AI provider (OpenAI now; prep interface for Gemini) `server/services/aiProvider.ts`
- VectorStore adapter pattern (in‑memory now; add Pinecone adapter skeleton) `server/services/vector/`
- Streaming answer endpoint design (`/api/repositories/:id/query/stream`)
- Rate limiting & basic quota middleware
- Improved error normalization & logging (structured log helper)
- Add repository re-index endpoint & status polling shape parity (for future UI streaming)

### Artifacts (to be created)
- `server/middleware/rateLimit.ts`
- `server/middleware/auth.ts` (lightweight, reading session; later swappable with Clerk)
- `server/services/ai/index.ts` (provider facade)
- `server/services/vector/pinecone.ts` (not active until keys present)
- `server/types/ai.ts`, `server/types/vector.ts`
- Update routes to use abstractions

## Part 3 – Frontend Component & UX Parity
Focus: UI richness, markdown rendering, typing animation, repository dashboard depth.

### Goals
- Markdown renderer component with syntax highlight (rehype-highlight / highlight.js)
- Typing effect component wrapping streamed answer
- Commit timeline visualization component
- Query history panel & citation display (file + line range)
- Landing page enhancements: features grid, how-it-works steps
- Theme improvements (OKLCH tokens) & accessibility passes

### Artifacts
- `client/src/components/markdown/MarkdownRenderer.tsx`
- `client/src/components/ai/TypingStream.tsx`
- `client/src/components/repository/CommitTimeline.tsx`
- `client/src/components/repository/Citations.tsx`
- `client/src/components/landing/Features.tsx`
- Tailwind config extension for OKLCH palette

## Part 4 – Advanced Features & Production Hardening
Focus: new features + observability + deployment readiness.

### Features
- Meeting transcript ingestion (upload + summarization + Q&A) – store in new table `meetings`, `meeting_segments`
- Pinecone integration activation path (env presence triggers usage)
- Gemini provider implementation (switch via env `AI_PROVIDER=openai|gemini`)
- Background job queue abstraction (simple in-process; doc hook for external workers)
- Structured metrics & health endpoint `/api/health`
- Security headers & helmet-like middleware
- Rate limit persistence (if Redis introduced)

### Artifacts
- Prisma-like or Drizzle migration additions for meeting tables (we continue with Drizzle)
- `server/routes/meetings.ts`
- `server/services/transcripts.ts` (stub summarizer)
- Metrics: lightweight counter module; maybe Prometheus exposition stub
- Deployment doc updates (Render support matrix / env notes)

## Risks / Open Questions
- Clerk migration (if desired) conflicts with existing session-based auth; postpone until after parity.
- Streaming via Express + fetch polyfills – verify deployment host supports flush (Render likely OK).
- Pinecone SDK adds cold start overhead; lazy import behind provider switch.

### Tracking Checklist
| Item | Part | Status |
|------|------|--------|
| AI provider abstraction | 2 | Done |
| VectorStore adapter pattern | 2 | Done |
| Rate limiting middleware | 2 | Done |
| Streaming query endpoint (SSE) | 2 | Done |
| Markdown renderer | 3 | Done |
| Typing animation stream | 3 | Done |
| Commit timeline component | 3 | Done |
| Citations component | 3 | Done |
| Landing features section | 3 | Done |
| OKLCH palette extension | 3 | Done |
| Meeting ingestion feature | 4 | Pending |
| Pinecone integration | 4 | Pending |
| Gemini provider | 4 | Pending |
| Health & metrics endpoints | 4 | Pending |

---
Generated Part 1 on: 2025-10-06
