# Travel Itinerary Platform

![Travel Itinerary Cover](public/Travel%20Itinerary%20Cover.png)

A production-oriented travel itinerary application built with Next.js (App Router), TypeScript, and Tailwind CSS. The system combines a streaming AI assistant with retrieval-augmented generation (RAG) to provide contextual travel planning recommendations.

## Key Capabilities

- **Streaming AI responses** via AWS Nova, delivered token-by-token to the client
- **Retrieval Augmented Generation (RAG)** using vector search (Astra DB) and Gemini embeddings
- **Interactive map-based place selection** (Leaflet) with client-only rendering to avoid SSR issues
- **Shared selection state** managed with React Context across planner and itinerary pages

## Setup

### Install dependencies

```bash
pnpm install
```

### Environment variables

Copy `example.env` to `.env` in the project root, then update the required values:

```bash
cp example.env .env
```

Required values:

- `DATABASE_URL` — Postgres connection string used by Prisma
- `GEMINI_API_KEY` — Google Gemini embedding API key
- `NOVA_API_KEY` — AWS Nova (OpenAI-compatible) API key
- `ASTRA_DB_ID`, `ASTRA_DB_REGION`, `ASTRA_DB_KEYSPACE`, `ASTRA_DB_APPLICATION_TOKEN` — DataStax Astra vector store credentials

Optional:

- `NEXT_PUBLIC_BASE_URL` — used for some preview tooling

### Run locally

```bash
pnpm dev
```

Open: http://localhost:3000

## Architecture Overview

### Streaming Chat + RAG

- The planner UI issues a request to `/api/chat/stream`
- The server identifies if the query is place-related and performs a vector search in Astra
- The resulting relevant places are included as context in the prompt
- The server streams Nova completion tokens back as NDJSON events
- The client renders chat text in real time and updates matched place cards as they arrive

### Map Picker (Local Guide)

The local guide page includes a Leaflet map component that only renders on the client to avoid server-side rendering issues. Users can click the map to set coordinates and use a search box (geocoding) to locate places.

### Shared State (Selected Places)

Selected places are stored in React Context so that both the planner and itinerary views operate on the same set of selected locations without relying on URL parameters.

## Project Structure

- `app/` — Next.js App Router pages and API routes
  - `app/planner` — planner UI with streaming chat
  - `app/route` — itinerary view for selected places
  - `app/local-guide` — map-based place submission
  - `app/api/chat/stream` — NDJSON streaming chat endpoint
- `actions/` — server actions for database operations and business logic
- `lib/` — integrations (Nova, Gemini, Astra)
- `prisma/` — Prisma schema and migrations

## Development Commands

```bash
pnpm dev        # start development server
pnpm build      # production build
pnpm start      # start production build
pnpm lint       # run ESLint
pnpm test       # run test suite (if configured)
```

## Notes

- The application is designed for Nepal travel planning, but the data model and routing are adaptable to other regions.
- Streaming endpoints use NDJSON (newline-delimited JSON); the client parser is built to handle this format.

## Recommended Improvements

- Improve handling for “no matching places” results in the RAG flow
- Add end-to-end tests for the streaming endpoint and parser
- Add authentication and persistence for saved itineraries
