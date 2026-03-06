import { Routes, Route,  } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";



function App() {
  //Temp Home placeholder
  const TempHome = () => <h1 className="text-3xl font-bold">Welcome back!</h1>;
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<TempHome />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
