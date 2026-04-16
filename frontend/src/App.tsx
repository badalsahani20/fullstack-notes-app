import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import { Toaster } from "sonner";
import PrivateRoute from "./components/PrivateRoute";
import AuthLayout from "./components/AuthLayout";
import { Loader } from "lucide-react";

// Lazy-loaded components
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NoteEditor = lazy(() => import("./pages/NoteEditor"));
const EmptyState = lazy(() => import("./components/EmptyEditorState"));
const OAuthSuccess = lazy(() => import("./pages/OAuthSuccess"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotesListPanel = lazy(() => import("./components/NotesListPanel"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const GlobalChatPage = lazy(() => import("./pages/GlobalChatPage"));

const RouteLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#121212]">
    <Loader className="size-8 text-emerald-500 animate-spin" />
  </div>
);

function App() {
  return (
    <>
      <Toaster position="bottom-right" />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Protected routes — redirect to /login if not authenticated */}
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout middlePanel={<NotesListPanel />} />}>
              <Route index element={<EmptyState />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/chat" element={<GlobalChatPage />} />
              <Route path="/folders" element={<EmptyState />} />
              <Route path="/favorites" element={<EmptyState />} />
              <Route path="/favorites/note/:noteId" element={<NoteEditor />} />
              <Route path="/archive" element={<EmptyState />} />
              <Route path="/archive/note/:noteId" element={<NoteEditor />} />
              <Route path="/trash" element={<EmptyState />} />
              <Route path="/trash/note/:noteId" element={<NoteEditor />} />
              <Route path="/note/:noteId" element={<NoteEditor />} />
              <Route path="/folders/:folderId/note/:noteId" element={<NoteEditor />} />
              <Route path="/folders/:folderId" element={<NoteEditor />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
