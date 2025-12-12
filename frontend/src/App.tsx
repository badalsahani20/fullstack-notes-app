import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/DashBoard";
import Layout from "./components/Layout";
import { AnimatePresence } from "framer-motion";
import FolderPage from "./pages/FolderPage";
import NotePage from "./pages/NotePage";
import AllNotes from "./pages/AllNotes";


function App() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
    {/* <Layout /> */}
    <Routes location={location} key={location.pathname}>
      {/* public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* protected routes */}
      <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
      </Route>
      <Route path="/folder/:id" element={<FolderPage />} />
      <Route path="/note/:id" element={<NotePage />} />
      <Route path="/notes" element={<AllNotes />} />

    </Routes>
    </AnimatePresence>
  );
}

export default App;
