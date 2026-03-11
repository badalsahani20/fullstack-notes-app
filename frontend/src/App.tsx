import { Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import NoteEditor from "./pages/NoteEditor";
import HomeEmptyState from "./components/HomeEmptySpace";

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<MainLayout />}>
          <Route index element={<HomeEmptyState />} />
          <Route path="/folders" element={<HomeEmptyState />} />
          <Route path="/trash" element={<HomeEmptyState />} />
          <Route path="/note/:noteId" element={<NoteEditor />} />
          <Route path="/folders/:folderId" element={<NoteEditor />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
