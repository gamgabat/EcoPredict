# Reef Oracle — agent instructions

This is a **Vite + React 19 + TypeScript** single-page app (Zustand, ReactFlow, Recharts, Tailwind
v4). It is **not** Next.js — there is no `app/` or `pages/` router, no `node_modules/next`, and no
Next.js-specific API. Routing is client-side via `react-router-dom` (`src/App.tsx`).

The product concept is currently mid-migration. Before making any change, read
`projectGuide/codefix.md` — it is the authoritative, self-contained plan: the product contract,
what's already done, what's left, and the exact acceptance criteria for each task. Do not act on
`projectGuide/mainIdea.md`, `projectGuide/implementation.md`, or `projectGuide/techStack.md` — they
are marked superseded and describe the abandoned product concept.
