# 📝 Fullstack Notes App

A full-stack note-taking application built with a focus on clean architecture, real-world workflows, and scalable backend–frontend integration.

---

## ✨ Features

### Core
- User authentication with JWT
- Create, read, update, and delete notes
- Rich text editor powered by **Tiptap**
- Manual save and debounced autosave
- User-specific data isolation

### Organization
- Folder-based note organization
- Support for uncategorized notes
- Assign and move notes between folders

### Editor Capabilities
- Headings (H1, H2)
- Bold, Italic, Strikethrough
- Bullet and ordered lists
- Clean, extensible toolbar design
- Content stored as HTML

### UX & State Handling
- Autosave status indicator
- Loading and error states
- Dedicated note editor page
- Notes dashboard view
- Responsive layout (in progress)

---

## 🛠 Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Tiptap (Rich Text Editor)
- Axios
- React Router
- Lucide Icons

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT-based authentication
- RESTful API design

---

## 📁 Project Structure

```
fullstack-notes-app/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── App.tsx
│
└── README.md
```

---

## 🔐 Authentication Flow

- JWT issued on login/register
- Token stored on the client
- Protected routes via middleware
- Notes and folders scoped per user

---

## 🚧 Planned Enhancements

- Trash (soft delete) functionality
- Archive notes
- Sidebar improvements and toggling
- Full-screen editor mode
- Search and filters
- Keyboard shortcuts
- UI and performance optimizations

---

## 📌 Status

The application currently supports all core note-taking and editing functionality.
Ongoing work focuses on UX polish and advanced organizational features.

---

## 👤 Author

**Badal Sahani**
GitHub: https://github.com/badalsahani20

---

## 📄 License

This project is for learning and portfolio purposes.
