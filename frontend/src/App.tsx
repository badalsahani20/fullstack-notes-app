import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/DashBoard";
import Layout from "./components/Layout";
import { AnimatePresence } from "framer-motion";

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
    </Routes>
    </AnimatePresence>
  );
}

export default App;
