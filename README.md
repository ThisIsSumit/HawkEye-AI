# HawkEye AI Frontend

HawkEye AI is a production-style cybersecurity SaaS dashboard built with React, TypeScript, Tailwind CSS, and React Query.

It provides a multi-page analyst workflow for:

- Security posture overview
- Threat monitoring and triage
- Threat investigation
- Alert operations
- Reporting and exports
- Platform settings

## Tech Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS (v4)
- shadcn-style reusable UI primitives (local components)
- Recharts for data visualization
- TanStack React Query for server state and caching
- Lucide icons
- SSE-style real-time stream integration with fallback simulation

## Routes

- `/dashboard`
- `/threats`
- `/threats/:id`
- `/alerts`
- `/reports`
- `/settings`

## Key Features

### Dashboard

- KPI cards (Total Events, Active Threats, Critical Alerts, Blocked IPs)
- Threat trend chart (line)
- Attack distribution chart (pie)
- Top attacking IP table
- Recent alerts list
- Live activity feed

### Threat Feed

- Severity, attack type, and time range filtering
- Sortable columns
- Pagination
- Row click-through to investigation view

### Threat Investigation

- Two-column investigation layout
- Timeline and related logs
- AI analysis summary
- Raw payload viewer
- Mitigation guidance and firewall rule suggestion
- Actions: analyze, block IP, resolve

### Alerts

- Search and filter by severity/status
- Assign to analyst
- Mark as resolved

### Reports

- Incident summary cards
- Attack timeline chart
- Download report as Markdown or PDF

### Settings

- User management
- API key management
- Detection thresholds
- Notification integrations

## Real-Time Data

The app subscribes to `/stream` via EventSource (SSE) in [src/hooks/use-security-data.ts](src/hooks/use-security-data.ts).

If no backend stream is available, it falls back to simulated events so the live activity UI remains usable in local/dev mode.

## Data Integration and Fallback Behavior

API client logic is implemented in [src/lib/api/index.ts](src/lib/api/index.ts).

Primary backend endpoints used:

- `GET /alerts`
- `GET /alerts/{id}`
- `POST /alerts/{id}/analyze`
- `POST /alerts/{id}/actions/block-ip`
- `GET /analytics/summary`
- `GET /stream`

When APIs are unavailable, the app uses realistic mock data fallback to keep all pages functional.

## Project Structure

```text
src/
   app/
      providers.tsx
      router.tsx
   components/
      alerts/
      cards/
      charts/
      layout/
      tables/
      ui/
   hooks/
      use-security-data.ts
   lib/
      api/
         index.ts
   pages/
      Dashboard.tsx
      ThreatFeed.tsx
      Investigation.tsx
      Alerts.tsx
      Reports.tsx
      Settings.tsx
   types/
      index.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Default local URL:

- `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Check

```bash
npm run lint
```

## Environment Variables

Optional:

- `VITE_API_BASE_URL`:
   - Base URL for backend APIs.
   - If omitted, the app uses relative paths (same-origin).

Example `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## UI/UX Principles Applied

- Enterprise-first security dashboard aesthetic
- Clear hierarchy and dense but readable layout
- Compact tables with sticky headers
- Soft card shadows and consistent spacing
- Full loading, empty, and error states
- Responsive navigation with mobile sidebar drawer

## Notes

- The project currently includes mocked fallback behavior to support local demos without a live backend.
- Large bundle warnings during build can be optimized later via route-level code splitting.
