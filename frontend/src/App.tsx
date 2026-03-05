import { Routes, Route, useLocation, BrowserRouter } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/DashBoard";
// import Layout from "./components/Layout";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/MainLayout";
import MainLayout from "./components/MainLayout";
// import FolderPage from "./pages/FolderPage";
// import NotePage from "./pages/NotePage";
// import AllNotes from "./pages/AllNotes";


function App() {
  //Temp Home placeholder
  const TempHome = () => <h1 className="text-3xl font-bold">Welcome back!</h1>;
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<TempHome />} />
          {/* We will add AllNotes and NotePage routes here soon */}
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
