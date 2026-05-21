# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start Vite dev server with HMR
npm run build      # tsc -b && vite build (TypeScript compile + bundle)
npm run lint       # ESLint
npm run preview    # serve the production build locally
```

There is no test framework configured.

## What This Is

Archaeology Battle — a Russian-language Battleship-style game where players excavate fossil artifacts instead of sinking ships. Built with React 19 + TypeScript + Vite, no backend.

## Architecture

### Game phases and routing

The game cycles through four phases: `menu → placement → battle → gameover`. `App.tsx` renders a `GameRouter` that switches on `state.phase` to show the corresponding screen component. There is no React Router — phase is the only navigation state.

### State management

The store is split across three files to avoid circular imports:
- `src/store/contextDef.ts` — `GameContext` definition and `GameContextValue` interface (no logic)
- `src/store/gameReducer.ts` — all state transitions via `gameReducer` + `initialState`
- `src/store/GameContext.tsx` — `GameProvider` with the `useReducer` call, AI turn timer, audio side-effects, and convenience callbacks (`digCell`, `moveSelectedArtifact`)
- `src/store/useGame.ts` — typed `useContext` hook consumed by all components

All components read state and dispatch actions exclusively through `useGame()`.

### AI logic

`src/utils/aiLogic.ts` holds a module-level singleton (`aiState`) that persists across turns within a game. It implements hunt/target mode: checkerboard-parity scanning in hunt mode, axis-aligned extension queue in target mode. `resetAI()` must be called on `START_BATTLE` and `RESTART`. The AI turn is triggered by a `setTimeout` inside `GameProvider`'s `useEffect` watching `state.turn === 'ai'`.

### Grid and board operations

`src/utils/gridUtils.ts` contains all pure board manipulation functions (no React). Key invariants:
- Artifacts must be separated by at least 1 cell in all 8 directions (`getNeighbors` enforces this during placement validation)
- When an artifact is sunk, its 8-directional neighbors are marked `'buffer'` (safe-zone cells the player cannot dig)
- `posKey(pos)` returns `"row,col"` strings used as `Set` keys for O(1) hit tracking on `Artifact.hits`

### Fleet definition

`src/constants/game.ts` is the single source of truth for game balance:
- `ARTIFACT_CONFIGS` — one config per fossil type keyed by name (`plesiosaur`, `ancient_fish`, `ammonite`, `megalodont`)
- `FLEET` — array of `{ configKey, count }` that drives both placement palette and AI board generation
- `INITIAL_MOVES` — number of move tokens per game (currently 3); using a move token immediately passes the turn to the AI

### Move mechanic

During battle the human can spend one of their `movesLeft` tokens to move an artifact one cell instead of digging. Selecting an artifact (`SELECT_ARTIFACT_TO_MOVE`) precomputes `validMovePositions` by trial-moving in all four directions. Executing a move (`MOVE_ARTIFACT`) decrements `movesLeft` and flips the turn to `'ai'`.

### Audio

`src/utils/audioUtils.ts` generates all sounds procedurally via the Web Audio API — no audio files are bundled. The `AudioContext` is lazily created on first use and resumed if suspended (autoplay policy).

### Styling

- `src/styles/variables.css` — global design tokens (colors, typography, spacing, cell sizes). All component CSS should use these variables.
- `src/styles/animations.css` — global keyframe animations
- Each component has a co-located `ComponentName.module.css` CSS Module
- Cell size adapts via CSS custom properties at `768px` and `480px` breakpoints
- The visual theme is archaeological: sand palette, parchment tones, serif fonts (`--font-serif`)

### UI language

All in-game text is in Russian. Keep it that way when adding messages, log entries, or labels.
