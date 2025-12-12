import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Calendar, Pin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Note {
  _id: string;
  title: string;
  content: string;
  color?: string;
  folder?: string | null;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AllNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();


  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await api.get("notes/");
        if (!res) return setError("Failed to load notes. Try refreshing.");
        setNotes(res.data);
      } catch (error) {
        setError("Failed to load notes. Try refreshing.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const sortedNotes = [...notes].sort(
    (a, b) =>
      new Date(b.createdAt || "").getTime() -
      new Date(a.createdAt || "").getTime()
  );

  return (
    <div className="min-h-screen bg-indigo-50 p-6 fade-in">
      <h1 className="text-3xl font-semibold mb-6">All Notes</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Notes Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedNotes.map((note) => {
          const dateStr = new Date(note.createdAt || "").toLocaleDateString(
            "en-IN",
            { day: "numeric", month: "long", year: "numeric" }
          );

          return (
            <div
              key={note._id}
              onClick={() => nav(`/note/${note._id}`)}
              className="rounded-xl p-4 shadow-sm border hover:shadow-lg transition-all cursor-pointer"
              style={{ background: note.color || "#fff" }}
            >
              {/* Top Row with Date + Pin */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <Calendar size={14} />
                  <span>{dateStr}</span>
                </div>

                {note.pinned && (
                  <Pin size={14} className="opacity-70" fill="black" />
                )}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg mb-2">{note.title}</h3>

              {/* Content Preview */}
              <p className="text-sm opacity-80 line-clamp-4">
                {note.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllNotes;
