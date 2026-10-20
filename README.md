# Archetype AI

**Find your archetype. We’ll do the rest.**

Archetype AI is an AI identity platform. It studies the identity, choices, style, and career paths of notable people, then helps you build your own version of that future. This repository is the marketing site and MVP product surface: a full-viewport hero with a live archetype reader, a library of twelve archetypes, a people archive, eight paths, an animated result reveal, a future-self selector, a path planner, style codes, and a presence coach.

The visual system is cream and forest green, set in Helvetica Neue Light: quiet, editorial, and premium.

## Run it locally

```bash
npm install
npm run dev
```

The dev server binds to [http://127.0.0.1:4317](http://127.0.0.1:4317).

Other scripts:

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run build`   | Type-checks and builds to `dist/`         |
| `npm run preview` | Serves the production build on port 4317 |
| `npm run lint`    | Runs oxlint                               |

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 3 (tokens in `tailwind.config.js`: `brand.dark`, `brand.green`, `brand.light`, `brand.cream`)
- React Router for pages
- `lucide-react` for the handful of functional icons (arrows, search, copy, check)

## Structure

```
src/
  data/            Mock database: archetypes, people, paths, future selves, style codes, test questions
  lib/
    archetypeEngine.ts   Mock AI (async; swap for a real API without touching the UI)
    session.tsx          Result / future self / plan state, persisted to localStorage
    hooks.ts             Reduced motion, in-view reveal, scroll lock, clipboard
  components/      Navbar, Hero, HeroStage (rotating character + pills), conveyor, how it works, result pieces
  pages/           Home, Archetypes, People, Paths, Test, Result, Plan, Style code, Presence
public/characters/ 3D-style archetype character renders (one per archetype)
```

### Routes

| Route             | Page                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `/`               | Hero, archetype conveyor, how it works, final CTA                    |
| `/archetypes`     | Searchable archetype library (12 archetypes)                        |
| `/archetypes/:id` | Archetype detail                                                     |
| `/people`         | People archive (11 profiles)                                         |
| `/people/:slug`   | Person profile with timeline, decisions, lessons, adopt / don’t copy |
| `/paths`          | Eight paths                                                          |
| `/paths/:id`      | Path detail                                                          |
| `/test`           | 60-second archetype test                                             |
| `/result`         | Animated archetype result and future-self selector                   |
| `/plan`           | Plan my version: six questions, then a 30 / 90 / 365 roadmap         |
| `/style-code`     | Style code for the current result                                    |
| `/presence`       | Presence coach for the current plan                                  |

## Connecting a real model

Everything AI-shaped lives in `src/lib/archetypeEngine.ts` and returns typed results (`ArchetypeResult`, `GeneratedPlan` in `src/data/types.ts`). Replace the bodies of `analyzeDescription`, `scoreTest`, and `generatePlan` with API calls that return the same shapes; the UI, loading states, and persistence already handle async.

## Motion

Entrance animations use the shared `fade-up` / `fade-down` keyframes with `cubic-bezier(0.16, 1, 0.3, 1)` and six stagger steps (0–600 ms). Below the fold, `Reveal` applies them on first intersection. Cursor-following, the character rotation timer, the conveyor, and all transitions respect `prefers-reduced-motion`.
