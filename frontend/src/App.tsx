import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import NoteEditor from "./pages/NoteEditor";
import HomeEmptyState from "./components/HomeEmptySpace";
import OAuthSuccess from "./pages/OAuthSuccess";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      <Route element={<MainLayout />}>
        <Route index element={<HomeEmptyState />} />
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
    </Routes>
  );
}

export default App;
