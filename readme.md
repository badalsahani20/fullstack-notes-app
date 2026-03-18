# Full-Stack Notes Application

A modern, high-performance, and feature-rich full-stack application for managing notes and folders. Built with the **MERN stack**, optimized with **Redis Caching**, and featuring a powerful rich-text editor using **TipTap** and **Cloudinary**.

## 🚀 Features

- **Rich Text Editing:** Powered by TipTap, allowing seamless formatting, bullet points, headers, tables, and full markdown-style editing.
- **Drag & Drop Image Uploads:** Native support for dragging and dropping (or pasting) images directly into notes. Images are instantly uploaded and hosted via Cloudinary.
- **Lightning Fast Caching:** Integrated Upstash Redis caching on the backend for incredibly fast `GET` requests on Notes and Folders.
- **Folder Organization:** Group your notes logically into custom folders.
- **Trash & Archive:** Safely soft-delete notes to a Trash bin, with the ability to restore them or permanently delete them.
- **Authentication:** Secure user authentication managed via Passport.js & JWT.
- **AI Assistant Integration:** Built-in AI controller to help summarize, brainstorm, or refine note content directly within the app.
- **Beautiful UI:** Styled with TailwindCSS and `shadcn/ui`, featuring smooth animations (`framer-motion`), dark mode, and toast notifications (`sonner`).

---

## 💻 Tech Stack

### Frontend
- **Framework:** React (Vite) + TypeScript
- **Styling:** TailwindCSS + `tw-animate-css` 
- **Components:** `shadcn/ui`, Lucide Icons
- **State Management:** Zustand
- **Routing:** React Router DOM
- **Editor:** TipTap (ProseMirror underlying) + Custom Extensions
- **Image Hosting:** Cloudinary (Direct Unsigned Uploads)

### Backend
- **Framework:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Caching:** Redis (Upstash)
- **Authentication:** Passport.js + JWT
- **AI Integration:** Groq / Google Generative AI SDKs

---

## 📁 Project Structure

```text
fullstack-notes/
├── backend/
│   ├── config/          # Redis, Database, and Passport Configurations
│   ├── src/
│   │   ├── controllers/ # Logic for Folders, Notes, Auth, Trash, and AI
│   │   ├── middleware/  # Auth guards and request validation
│   │   ├── models/      # Mongoose Schemas (User, Node, Folder, etc.)
│   │   ├── routes/      # Express API routes definition
│   │   ├── services/    # Reusable business logic & DB calls
│   │   └── utils/       # catchAsync wrappers and helpers
│   └── server.js        # Main Express application entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI widgets (TipTap, Layouts, Buttons)
    │   ├── extensions/  # Custom TipTap plugins (e.g., ImageUploadExtension)
    │   ├── pages/       # Route-level components (Login, NoteEditor)
    │   ├── providers/   # React Context providers (SessionProvider)
    │   ├── store/       # Zustand global state (useNoteStore)
    │   ├── tools/       # Editor Toolbars and Bubble Menus
    │   ├── utils/       # Helper functions (uploadImage to Cloudinary)
    │   ├── App.tsx      # Main Router and Toaster setup
    │   └── index.css    # Global Tailwind styles & ProseMirror resets
    └── package.json
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Upstash Redis account
- Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/badalsahani20/fullstack-notes-app.git
cd fullstack-notes-app
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   UPSTASH_REDIS_REST_URL=your_upstash_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
   # AI Keys (Optional)
   GROQ_API_KEY=your_groq_key
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## 🎨 Implemented Caching Strategy (Redis)
To ensure near-instantaneous load times, the backend implements caching wrapping the MongoDB queries:
- `GET /api/notes` routes query Redis first using a `notes:<userId>` key.
- A lock (`NX: true`) is utilized to prevent cache stampedes during simultaneous requests.
- Mutating operations (`POST`, `PUT`, `DELETE` on notes or folders) instantly publish a `redis.del()` command to invalidate the stale cache, ensuring the frontend always receives perfectly synchronized data on the next load.

## 🖼️ Cloudinary TipTap Integration
Image hosting scales infinitely without burdening the backend server. 
1. The user drops an image into the TipTap editor canvas.
2. The custom `ImageUploadExtension` securely intercepts the native `Drop` or `Paste` browser event.
3. The image is passed to `src/utils/uploadImage.ts` and POSTed straight to Cloudinary using an *unsigned upload preset*.
4. Cloudinary returns a secure `https` URL, which TipTap natively converts into an HTML `<img src="..." />` element.
5. Upon saving the note, the backend strictly stores the HTML string, completely unburdened from handling multipart form data or binary files.

---

*Built with ❤️ focusing on speed, seamless UX, and a maintainable MERN architecture.*
