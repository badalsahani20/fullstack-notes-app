import { useEffect, useState } from "react";
import TipTap from "../components/TipTap";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { Save } from "lucide-react";

type Note = {
  _id: string;
  title: string;
  content: string;
  color?: string;
  folder?: string | null;
  pinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
const NotePage = () => {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  //Save note
  const handleSave = async () => {
    if (!note) return;
    if (!note.content || note.content.trim() === "") return;
    try {
      setSaving(true);
      const res = await api.put(`notes/${id}`, {
        content: note.content,
      });
      console.log(res.data);
    } catch (error: unknown) {
      setError("Failed to save note");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };
  //fetch notes
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await api.get(`notes/${id}`);
        setNote(res.data);
      } catch (error: unknown) {
        setError("Failed to load note");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!note) return <div className="p-6">Note not found</div>;

  return (
    <div className="p-6 space-y-4">
      {/* Editor */}
      <TipTap content={note.content} onChange={(html) => setNote((prev) => prev ? {...prev, content: html} : prev)} />

        {/* Save button */}
        <button
          onClick={() => {handleSave()}}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
          title="Save now"
        >
          <Save size={16} />
          <span className="hidden sm:inline">{saving ? "Saving..." : "Save now"}</span>
        </button>
    </div>
  );
};

export default NotePage;
