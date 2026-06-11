# Notesify Landing Page

This directory contains the front-facing landing page and marketing site for **Notesify** - the AI-powered note-taking application. 

It is designed to be extremely fast, responsive, and visually stunning, featuring modern web design aesthetics, smooth animations, and clear calls-to-action.

## Tech Stack

The landing page is built with a modern, lightweight stack tailored for performance and SEO:

- **React 18**: Core UI framework.
- **Vite**: Ultra-fast build tool and development server.
- **TypeScript**: For robust, type-safe code.
- **Tailwind CSS**: Utility-first CSS framework for rapid styling.
- **Framer Motion**: Used for highly optimized, beautiful scroll and entry animations.
- **Lucide React**: Beautiful, consistent iconography.

## Project Structure

```text
landing/
├── src/
│   ├── assets/        # Static assets (images, icons)
│   ├── components/    # Reusable UI components
│   │   ├── landing/   # Specific landing page sections (Hero, Features, Pricing, etc.)
│   │   └── ui/        # Shared base components
│   ├── pages/         # Page-level components (HomePage, PrivacyPage, etc.)
│   ├── App.tsx        # Root application component and routing
│   └── main.tsx       # Application entry point
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── tailwind.config.js # Tailwind theme configuration
```

## Running Locally

To run the landing page locally during development:

1. Navigate to the `landing` directory:
   ```bash
   cd landing
   ```

2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The landing page will be available at `http://localhost:5173` (or the port specified by Vite in the terminal).

## Building for Production

To create a production-ready build:

```bash
npm run build
```

The optimized static assets will be generated in the `dist/` directory, ready to be deployed to Vercel, Netlify, or any static hosting service.

## Architecture & Aesthetics

- **Hero Section**: Designed to capture attention immediately with a sleek dark mode UI and floating dashboard previews.
- **Features**: Broken down into digestible cards detailing AI summarization, smart quizzes, and markdown support.
- **Animations**: Driven by `framer-motion` using viewport triggers to create a dynamic, "reveal-on-scroll" experience.
- **Responsive**: Fully optimized for mobile, tablet, and desktop viewports.
