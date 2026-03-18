# Notesify — Full-Stack Notes App

A modern, feature-rich full-stack notes application built with the **MERN stack**, featuring a powerful rich-text editor, folder organization, and a built-in AI assistant.

## 🚀 Features

- **Rich Text Editing:** Powered by TipTap — supports formatting, bullet points, headers, tables, and markdown-style editing.
- **Drag & Drop Image Uploads:** Drop or paste images directly into notes; uploaded and hosted via Cloudinary.
- **Lightning Fast Caching:** Upstash Redis caching on the backend for fast `GET` requests on notes and folders.
- **Folder Organization:** Group notes into custom folders with an expandable sidebar tree.
- **Favorites & Trash:** Star notes to pin them, soft-delete to Trash, restore or permanently remove.
- **Authentication:** Secure session management via Passport.js & JWT.
- **AI Assistant:** Built-in chat panel powered by Groq (LLaMA) — streaming responses, quick actions (Summarize, Improve, Brainstorm, Rewrite), context-aware chat using note content or selected text, and persistent chat history per note.
- **Beautiful UI:** shadcn/ui + TailwindCSS, dark mode, smooth animations via Framer Motion.

---

## 💻 Tech Stack

### Frontend
- **Framework:** React 18 (Vite) + TypeScript
- **Styling:** TailwindCSS + shadcn/ui + Lucide Icons
- **State Management:** Zustand
- **Routing:** React Router v6
- **Editor:** TipTap (ProseMirror) + Custom Extensions
- **Animations:** Framer Motion
- **Image Hosting:** Cloudinary (Direct Unsigned Uploads)

### Backend
- **Framework:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Caching:** Redis (Upstash)
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
        │   ├── ai/
        │   │   ├── AiAuditPanel.tsx      ← thin glue layer
        │   │   ├── AiCompose.tsx         ← compose bar (textarea, actions, send/stop)
        │   │   ├── AiGuideDialog.tsx     ← first-time welcome dialog
        │   │   ├── AiMessage.tsx         ← single message bubble (streaming + markdown)
        │   │   ├── AiMessageList.tsx     ← scrollable message list + auto-scroll
        │   │   └── types.ts              ← shared AI types
        │   ├── editor/
        │   │   ├── EditorHeader.tsx      ← title, star, Ask AI button, meta row
        │   │   └── RelativeTimeLabel.tsx ← isolated 1s ticker (prevents re-renders)
        │   ├── header/
        │   │   ├── HeaderSearch.tsx      ← global search bar
        │   │   └── UserMenu.tsx          ← profile dropdown + logout
        │   ├── notes/
        │   │   ├── NoteDeleteDialog.tsx  ← delete confirmation + "don't ask again"
        │   │   ├── NotesPanelHeader.tsx  ← breadcrumb + focus-mode close button
        │   │   └── NotesPanelSearch.tsx  ← search input + create note button
        │   ├── ui/                       ← shadcn/ui primitives (untouched)
        │   ├── AppHeader.tsx             ← top header orchestrator
        │   ├── MainLayout.tsx            ← root layout + theme state
        │   ├── NotesListPanel.tsx        ← middle column note list
        │   └── SideBar.tsx               ← left activity rail
        ├── hooks/
        │   ├── useAiChat.ts              ← AI API calls, streaming, history
        │   ├── useFolderTree.ts          ← folder expand/collapse, counts, lazy fetch
        │   └── useNotesFilter.ts         ← route-aware note filtering + search
        ├── pages/
        │   ├── NoteEditor.tsx            ← editor page with resizable AI panel
        │   ├── Login.tsx
        │   └── Register.tsx
        ├── store/
        │   ├── useNoteStore.ts           ← notes, CRUD, chat history, notes cache
        │   ├── useFolderStore.ts         ← folders, CRUD
        │   └── useAuthStore.ts           ← user session
        ├── lib/
        │   └── api.ts                    ← configured Axios instance
        └── utils/
            └── getRelativeUpdatedLabel.ts
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

## 🎨 Caching Strategy (Redis)

The backend wraps MongoDB queries with Redis for near-instant load times:
- `GET /api/notes` queries Redis first using a `notes:<userId>` key.
- A lock (`NX: true`) prevents cache stampedes under simultaneous requests.
- Mutating operations (`POST`, `PUT`, `DELETE`) immediately invalidate stale cache via `redis.del()`.

## 🤖 AI Chat Architecture

The AI panel streams responses in real time:
1. The user sends a message or triggers a quick action (Improve, Summarize, etc.).
2. The frontend trims chat history to the last **6 messages** before sending, to stay within Groq token limits.
3. The backend picks the appropriate Groq model and streams back a response.
4. The frontend reads the `ReadableStream` chunk by chunk via `TextDecoder`, updating the message in real time.
5. On completion, the full chat history is persisted to MongoDB.

## 🖼️ Cloudinary Image Integration

Images are hosted infinitely without burdening the backend:
1. User drops/pastes an image into the TipTap editor.
2. The custom `ImageUploadExtension` intercepts the `drop` or `paste` event.
3. The image POSTs directly to Cloudinary using an unsigned upload preset.
4. Cloudinary returns a secure `https` URL, inserted as an `<img>` element.
5. The backend stores only the HTML string — no binary file handling needed.

---

*Built with ❤️ focusing on speed, seamless UX, and a maintainable architecture.*
