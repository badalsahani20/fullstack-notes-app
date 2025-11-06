import { LogOut, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  }
  return (
    <motion.nav
  initial={{ y: -30, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.4, ease: "easeOut" }} className="flex sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-muted items-center justify-between py-3 px-6 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-accent"></div>
        <span className="text-lg font-semibold text-foreground tracking-tight">
          Notesify
        </span>
      </Link>

      <div className="hidden md:flex items-center w-1/3 relative">
      <Search size={18} className="absolute left-3 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search notes..."
          className="input w-full bg-secondary border border-muted rounded-lg pl-10 pr-3 px-3 py-2 focus:ring-accent focus:outline-none transition-all" />
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full bg-secondary hover:bg-accent/10 transition-colors duration-300">
            {darkMode ? (
              <Sun size={18} className="text-foreground" />
            ) : (
              <Moon size={18} className="text-foreground" />
            )}
        </button>

        <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-all">
            <LogOut size={18} />
            <span className="hidden sm:inline text-sm">Logout</span>
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
