import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NoteEditor from "./pages/NoteEditor";
import HomeEmptyState from "./components/HomeEmptySpace";
import OAuthSuccess from "./pages/OAuthSuccess";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "sonner";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import NotesListPanel from "./components/NotesListPanel";
import NotFound from "./pages/NotFound";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthLayout from "./components/AuthLayout";

function App() {
  return (
    <>
      <Toaster position="bottom-right" />
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
          <Route index element={<HomeEmptyState />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/folders" element={<HomeEmptyState />} />
          <Route path="/favorites" element={<HomeEmptyState />} />
          <Route path="/favorites/note/:noteId" element={<NoteEditor />} />
          <Route path="/archive" element={<HomeEmptyState />} />
          <Route path="/archive/note/:noteId" element={<NoteEditor />} />
          <Route path="/trash" element={<HomeEmptyState />} />
          <Route path="/trash/note/:noteId" element={<NoteEditor />} />
          <Route path="/note/:noteId" element={<NoteEditor />} />
          <Route path="/folders/:folderId/note/:noteId" element={<NoteEditor />} />
          <Route path="/folders/:folderId" element={<NoteEditor />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
