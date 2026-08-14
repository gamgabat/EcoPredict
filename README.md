# Reef Oracle

Reef Oracle identifies potentially omitted interactions among observed species, functional roles
and environmental stressors, then prioritises them for EIA (Environmental Impact Assessment)
review. It does not discover species, prove causation, or issue regulatory verdicts — it supports
EIA screening and expert review.

See [`projectGuide/codefix.md`](projectGuide/codefix.md) for the full product contract and the
active migration plan. `projectGuide/mainIdea.md`, `projectGuide/implementation.md` and
`projectGuide/techStack.md` are superseded historical records of an earlier, abandoned product
concept — do not build against them.

## Stack

Vite + React 19 + TypeScript, with Zustand for state, ReactFlow for the interaction network,
Recharts for scenario-response charts, Tailwind CSS v4 for styling, and Vitest for tests.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL Vite prints (typically `http://localhost:5173`) in your browser.

## Scripts

| Command                | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the local dev server                            |
| `npm run build`        | Type-check and build for production (output: `dist/`) |
| `npm run preview`      | Serve the production build locally                    |
| `npm run lint`         | Run ESLint over the project                           |
| `npm test`             | Run the Vitest suite once                             |
| `npm run test:watch`   | Run Vitest in watch mode                              |
| `npm run format`       | Format the codebase with Prettier                     |
| `npm run format:check` | Check formatting without writing changes              |
