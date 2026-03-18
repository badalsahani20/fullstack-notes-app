# Notesify — Frontend

A note-taking app frontend built with **Vite + React + TypeScript**.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| State | Zustand |
| Editor | TipTap |
| UI | shadcn/ui + Tailwind CSS |
| Animations | Framer Motion |
| HTTP | Axios (`@/lib/api`) |

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── ai/
│   │   ├── AiAuditPanel.tsx      ← thin glue layer (~72 lines)
│   │   ├── AiCompose.tsx         ← compose bar (textarea, quick actions, send/stop)
│   │   ├── AiGuideDialog.tsx     ← first-time welcome dialog
│   │   ├── AiMessage.tsx         ← single message bubble (streaming + markdown)
│   │   ├── AiMessageList.tsx     ← scrollable message list + auto-scroll
│   │   └── types.ts              ← shared AI types
│   ├── editor/
│   │   ├── EditorHeader.tsx      ← title input, star, Ask AI button, meta row
│   │   └── RelativeTimeLabel.tsx ← isolated ticker (prevents editor re-renders)
│   ├── header/
│   │   ├── HeaderSearch.tsx      ← global search bar
│   │   └── UserMenu.tsx          ← profile dropdown + logout
│   ├── notes/
│   │   ├── NoteDeleteDialog.tsx  ← delete confirmation + "don't ask again" pref
│   │   ├── NotesPanelHeader.tsx  ← breadcrumb + focus-mode close button
│   │   └── NotesPanelSearch.tsx  ← search input + create note button
│   ├── ui/                       ← shadcn/ui primitives (no edits)
│   ├── AppHeader.tsx             ← top header orchestrator
│   ├── MainLayout.tsx            ← root layout (theme state)
│   ├── NotesListPanel.tsx        ← note list column
│   ├── SideBar.tsx               ← activity rail (nav icons)
│   ├── SideBarHeader.tsx         ← sidebar header
│   ├── TipTap.tsx                ← TipTap editor wrapper
│   └── EmptyEditorState.tsx      ← empty state when no note is selected
├── hooks/
│   ├── useAiChat.ts              ← all AI API logic, streaming, history
│   ├── useFolderTree.ts          ← folder expand/collapse, counts, lazy fetch
│   └── useNotesFilter.ts         ← route-aware note filtering + search
├── pages/
│   ├── NoteEditor.tsx            ← editor page (resizable AI panel)
│   ├── Login.tsx
│   └── Register.tsx
├── store/
│   ├── useNoteStore.ts           ← notes, CRUD, chatHistory, notesCache
│   ├── useFolderStore.ts         ← folders, CRUD
│   └── useAuthStore.ts           ← user session, clearAuth
├── lib/
│   └── api.ts                    ← configured Axios instance
└── utils/
    └── getRelativeUpdatedLabel.ts
```

## Architecture Notes

- **Thin components, fat hooks** — Components own layout and JSX only. All data fetching, state computation, and API calls live in custom hooks (`useAiChat`, `useNotesFilter`, `useFolderTree`).
- **AI chat history** — Trimmed to the last 6 messages before sending to the backend to stay within Groq's token limits.
- **RelativeTimeLabel** — Extracted to its own component specifically to isolate its 1-second `setInterval` so it doesn't cause the entire editor tree to re-render.
- **Stores** — Zustand keeps global state flat and minimal. Components only subscribe to what they need.
