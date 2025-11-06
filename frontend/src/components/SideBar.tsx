import { useEffect, useState } from "react";
import { Folder, Plus, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";

interface FolderType {
  _id: string;
  name: string;
  color: string;
}
const Sidebar: React.FC = () => {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  useEffect(() => {
    const loadFolders = async () => {
      try {
        setLoading(true);
        const res = await api.get("folders/");
        if(!res) return setError("Failed to load folders. Try refreshing.");
        setFolders(res.data);
      } catch (err) {
        console.log(err)
        setError("Failed to load folders. Try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    loadFolders();
  },[]);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 z-50 h-screen w-64 backdrop-blur-md border-r border-muted shadow-soft flex flex-col justify-between"
    >
      {/* Top: Create Folder */}
      <div className="p-4 border-b border-muted">
        <button className="btn-primary w-full flex items-center justify-center gap-2">
          <Plus size={16} />
          New Folder
        </button>
      </div>
      {error && <p className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{error}</p>}
      {loading && <p className="p-3 bg-red-50 border border-red-200 text-gray-300/20 text-sm rounded-md">Loading folders...</p>}
      {/* Folder List */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-2">
          {folders.map((folder) => {
            const active = location.pathname === `/folder/${folder._id}`;
            return (
              <Link
                to={`/folder/${folder._id}`}
                key={folder._id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  active
                    ? "bg-accent text-accent-foreground shadow-soft"
                    : "hover:bg-accent/10"
                }`}
              >
                <Folder
                  size={18}
                  className={active ? "text-accent-foreground" : "text-accent"}
                />
                <span>{folder.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-muted">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-all">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
