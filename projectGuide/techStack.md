# Technology Stack for EcoPredict Platform

## Frontend Framework (Updated)
- **React 18+ with TypeScript (TSX)**
- **Vite** (swapped from Next.js 14+ for optimal Single Page Application performance, native reactive visualization mapping, and faster compilation).
- **React Router DOM** for client-side routing.
- **Tailwind CSS v4** utilizing an isolated, rigorous `--color-*` token system for strict architectural fidelity.

## UI/Visualization Libraries
- **React Flow** (reactflow) for the interactive mind map interface containing biological node networks (e.g. corals, algae, herbivores).
- **Recharts** for simulation result visualization and population cascade analytics over time.
- **D3.js** for intricate core ecosystem relationship graphs and data processing within visualizations.
- **Framer Motion** for premium interactive physics, micro-animations, and dynamic dashboards aesthetics.

## State Management
- **Zustand** for lightning-fast global state manipulation without prop-drilling (vital for real-time reactivity when adjusting pH/Temperature sliders impacting the Recharts/ReactFlow instances).
- **React Query/TanStack Query** for eventual API hook management and server caching when deployed alongside real AI backends.

## Backend & Database (Microservices / Sever-Side Integration)
- **Node.js/Python API endpoints** (Planned) to support model training on regional biodiversity.
- **PostgreSQL with Prisma ORM** to persistently store saved ecosystem instances, EIA report templates, and subscription data.
- **Redis** caching for simulation queries.

## AI/ML Integration
- **Python ML services** for heavy mathematical prediction logic based on traditional Environmental baseline data.
- **TensorFlow.js / ONNX.js** loaded client-side for rapid inference and immediate graph updating inside the dashboard.

## Deployment & Utilities
- **Vercel** for continuous deployment of the Vite frontend build.
- **html2pdf.js** (or similar) to facilitate direct EIA regulatory compliance report exports.
- **ESLint + Prettier** for code formatting.