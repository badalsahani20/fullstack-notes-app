# Notesify — Full-Stack Notes App

A modern, feature-rich full-stack notes application built with the **MERN stack**, featuring a powerful rich-text editor, folder organization, instantaneous optimistic UI updates, and a built-in AI assistant.

## 🚀 Features

- **Rich Text Editing:** Powered by TipTap — supports formatting, bullet points, headers, tables, and fluid markdown-style editing.
- **Lightning Fast Caching:** Upstash Redis caching on the backend with smart self-healing cache-busting for lightning fast `GET` requests on notes and folders.
- **Optimistic UI & Premium Sync:** Powered by TanStack React Query. UI mutations (pinning, deleting, editing) happen instantly in the local cache with gorgeous layout animations, invisibly syncing with the server in the background.
- **Folder Organization:** Group notes into custom folders with an expandable, lazy-loaded sidebar tree.
- **Favorites & Trash:** Star notes to pin them to the top, soft-delete them to the Trash, restore them, or permanently wipe them.
- **Authentication:** Secure session management via Passport.js & JWT.
- **AI Assistant:** Built-in chat panel powered by Groq (LLaMA) — streaming responses, quick actions (Summarize, Improve, Brainstorm, Rewrite), context-aware chat using note content or selected text, and persistent chat history per note.
- **Drag & Drop Image Uploads:** Drop or paste images directly into notes; uploaded and hosted via Cloudinary.
- **Beautiful UI:** shadcn/ui + TailwindCSS, responsive dark mode, and highly refined physics-based micro-animations via Framer Motion.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18 (Vite) + TypeScript
- **Server State Sync:** TanStack React Query (`useQuery` & `useMutation`)
- **UI State Management:** Zustand (Slimmed down for transient UI state only)
- **Styling:** TailwindCSS + shadcn/ui + Lucide Icons
- **Routing:** React Router v6
- **Editor:** TipTap (ProseMirror) + Custom Extensions
- **Animations:** Framer Motion (Spring layout animations and `AnimatePresence`)
- **Image Hosting:** Cloudinary (Direct Unsigned Uploads)

### Backend
- **Framework:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Caching:** Redis (Upstash Rest API)
- **Authentication:** Passport.js + JWT
- **AI Integration:** Groq API (LLaMA 3.1) + Google Generative AI

---

## 📁 Project Structure

```text
fullstack-notes/
├── backend/
│   ├── config/          # Redis, Database, and Passport configurations
│   ├── src/
│   │   ├── controllers/ # Logic for Folders, Notes, Auth, Trash, and AI
│   │   ├── middleware/  # Auth guards and request validation
│   │   ├── models/      # Mongoose schemas (User, Note, Folder)
│   │   ├── routes/      # Express API route definitions
│   │   ├── services/    # Reusable business logic & DB calls
│   │   └── utils/       # catchAsync wrappers and helpers
│   └── server.js        # Express app entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── ai/               ← AI chat, streaming bubbles, compose actions
        │   ├── editor/           ← Tiptap editor blocks and header controls
        │   ├── header/           ← Global search bar, profile dropdown
        │   ├── notes/            ← Note tools, delete confirmation dialogs
        │   ├── ui/               ← shadcn/ui primitives
        │   ├── AppHeader.tsx     ← Top header orchestrator
        │   ├── MainLayout.tsx    ← Root layout wrapper
        │   ├── NotesListPanel.tsx← List column heavily leveraging Framer layouts
        │   ├── SideBar.tsx       ← Left activity & folder rail
        │   └── noteCard.tsx      ← Individual note card with physics-based hover
        ├── hooks/
        │   ├── useAiChat.ts         ← AI API streaming & history
        │   ├── useFolderTree.ts     ← folder expand/collapse & counts
        │   ├── useNotesQuery.ts     ← React Query data fetchers
        │   ├── useNotesMutations.ts ← Instant Optimistic UI mutations
        │   └── useNotesFilter.ts    ← Route-aware note filtering + search
        ├── pages/
        │   ├── NoteEditor.tsx    ← Editor page with resizable AI panel
        │   ├── Login.tsx
        │   └── Register.tsx
        ├── store/
        │   ├── useNoteStore.ts   ← Minimal UI state (searchQuery, activeNoteId)
        │   ├── useFolderStore.ts ← Local UI folder state
        │   └── useAuthStore.ts   ← User session manager
        ├── lib/
        │   └── api.ts            ← Configured Axios instance
        └── utils/
            └── ...
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Upstash Redis account
- Cloudinary account
- Groq API key

### 1. Clone the repository
```bash
git clone https://github.com/badalsahani20/fullstack-notes-app.git
cd fullstack-notes-app
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
GROQ_API_KEY=your_groq_key
```

```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

```bash
npm run dev
```

---

## 🎨 Fast & Reliable Caching

### Redis (Backend)
The backend wraps MongoDB queries with Redis for near-instant load times:
- `GET /api/notes` queries Redis first using a `notes:<userId>` key.
- A lock (`NX: true`) prevents cache stampedes under simultaneous requests.
- Mutating operations (`POST`, `PUT`, `DELETE`) aggressively invalidate stale cache via `redis.del()`, featuring self-healing fallbacks on 404 sync drifts.

### React Query (Frontend)
- The UI maintains a deeply synchronized client cache. 
- All data mutations (pinning, editing, moving) trigger **Optimistic Updates**, which instantly edits and dynamically re-sorts the React Query arrays locally without waiting for the server.
- The UI gracefully skips rollbacks if the server confirms ghost data is already deleted, keeping the user experience completely fluid.

## 🤖 AI Chat Architecture

The AI panel streams responses in real time:
1. The user sends a message or triggers a quick action (Improve, Summarize, etc.).
2. The frontend trims chat history to the last **6 messages** before sending, to stay within Groq token limits.
3. The backend picks the appropriate Groq model and streams back a response.
4. The frontend reads the `ReadableStream` chunk by chunk via `TextDecoder`, updating the message in real time.
5. On completion, the full chat history is natively synced across the query cache and persisted to MongoDB.

---

*Built with ❤️ focusing on speed, seamless UX, and a maintainable architecture.*
