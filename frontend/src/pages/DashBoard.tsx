import { useEffect, useState } from "react";
import api from "../lib/api";
import { Folder, FolderPlus, Timer } from "lucide-react";
import image from "../assets/pen.png";
import {motion, AnimatePresence} from 'framer-motion'
import { useNavigation } from "react-router-dom";

const isToday = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

const isThisWeek = (deteStr: string) => {
  const date = new Date(deteStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff <= 7 * 24 * 60 * 60 * 1000; // 7 days
};

const isThisMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

const listVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

interface Note {
  _id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  folder: string | null;
  createdAt: string;
  updatedAt: Date;
}

interface Folder {
  _id: string;
  name: string;
  color: string;
  createdAt: string;
}

const DashBoard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [folderFilter, setFolderFilter] = useState<"today" | "week" | "month">(
    "today"
  );
  const [noteFilter, setNoteFilter] = useState<"today" | "week" | "month">(
    "today"
  );

  

   useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const res = await api.get("notes/");
        if (!res) return setError("Failed to load notes. Try refreshing.");
        setNotes(res.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load notes. Try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const res = await api.get("folders/");
        if (!res) return setError("Failed to load folders. Try refreshing...");
        setFolders(res.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load folders. Try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    fetchFolders();
  }, []);
  const filteredFolders = folders.filter((folder) => {
    if (folderFilter === "today") return isToday(folder.createdAt);
    if (folderFilter === "week") return isThisWeek(folder.createdAt);
    return isThisMonth(folder.createdAt);
  });


  const monthFilteredNotes = notes.filter((note) => {
    const d = new Date(note.createdAt);
    return (
      d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear()
    );
  });

  const finalNotes = monthFilteredNotes.filter((note) => {
    if(noteFilter === "today") return isToday(note.createdAt);
    if(noteFilter === "week") return isThisWeek(note.createdAt);
    return isThisMonth(note.createdAt);
  })
 

  return (
    <div className="space-y-6 fade-in bg-indigo-50 rounded-lg p-4">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Folders</h2>
        </div>
        <div className="flex gap-4 mb-5 text-sm">
            {["today", "week", "month"].map((type) => (
              <button
                key={type}
                onClick={() => setFolderFilter(type as any)}
                className={`pb-1 border-b-2 transition-all ${
                  folderFilter === type ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                >
                  {type === "today" ? "Today" : type === "week" ? "This Week" : "This Month"}
                </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
        <motion.div
          key={folderFilter}
          variants={listVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Folder Cards */}
          {filteredFolders.map((folder) => (
            <div
              key={folder._id}
              className="card cursor-pointer w-full : hover:shadow-soft-lg "
              style={{ background: folder.color }}
            >
              <Folder  className={'h-[50px] w-[50px]'} />
              <h3 className="font-semibold text-lg mt-3 mb-2">{folder.name}</h3>
              <p className="text-xs opacity-60">
                {new Date(folder.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          ))}

          {/* New Folder Button Card */}
          <div className="card flex items-center justify-center cursor-pointer hover:bg-secondary/60">
            <div className="flex flex-col items-center text-muted-foreground">
              <FolderPlus size={28} />
              <span className="mt-2 text-sm">New Folder</span>
            </div>
          </div>
        </motion.div>
        </AnimatePresence>
      </section>

      {/* Notes Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Notes</h2>
        </div>
        <div className="flex gap-4 mb-4 text-sm">
            {["today", "week", "month"].map((type) => (
              <button
                key={type}
                onClick={() => setNoteFilter(type as any)}
                className={`pb-1 border-b-2 transition-all ${
                  noteFilter === type ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                >
                  {type === "today" ? "Today" : type === "week" ? "This Week" : "This Month"}
                </button>
            ))}
            <div className="flex items-center gap-3 text-sm mb-4 select-none ml-auto">
            <button
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1)
              )
            }
            className="px-2 py-1 rounded hover:bg-secondary transition"
              >
                &lt;
            </button>
            <span className="font-medium">
              {selectedMonth.toLocaleString("en-IN", {month: "long"})} {" "}
              {selectedMonth.getFullYear()}
            </span>

            <button onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
              className="px-2 py-1 rounded hover:bg-secondary transition"
              >
                &gt;
            </button>
          </div>
          </div>
        
        <AnimatePresence mode="wait">
        <motion.div
            key={noteFilter}
            variants={listVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Notes Card */}

          {finalNotes.map((note) => {
            const date = new Date(note.createdAt).toLocaleDateString("en-IN");
            return (
              <div
                key={note._id}
                className="card max-w-[300px] w-full h-[240px] flex flex-col justify-between overflow-hidden"
                style={{ background: note.color }}
              >
                <div className="border-b cursor-pointer mb">
                  <p className="text-xs opacity-60">{date}</p>
                  <h3 className="font-semibold mt-2 text-lg flex items-center justify-between">
                    {note.title}{" "}
                    <img src={image} className="h-4 w-4" alt="icon" />
                  </h3>
                </div>
                <p className="text-sm mt-2 opacity-80 line-clamp-4 wrap-break-word">{note.content}</p>
                <p className="text-xs opacity-60 mt-3 flex gap-2">
                  <Timer size={14} />
                  <span>
                    {new Date(note.createdAt)
                      .toLocaleTimeString("en-IN")
                      .toUpperCase()}
                  </span>
                  <span>
                    {new Date(note.createdAt).toLocaleDateString("en-IN", {
                      weekday: "long",
                    })}
                  </span>
                </p>
              </div>
            );
          })}

          {/* New Note Card */}
          <div className="card flex border-dashed items-center justify-center cursor-pointer hover:background/60">
            <div className="flex flex-col items-center text-muted-foreground">
              <img src={image} className="h-8 w-8" alt="logo" />
              <span className="mt-2 text-sm">New Note</span>
            </div>
          </div>
        </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

export default DashBoard;
