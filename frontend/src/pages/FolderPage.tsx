import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";


const FolderPage = () => {
  const { id } = useParams();
  const nav = useNavigate();

  const [notes, setNotes] = useState([]);
  const [folder, setFolder] = useState<any>(null);

  useEffect(() => {
    api
      .get(`/folders/${id}`)
      .then((res) => setFolder(res.data))
      .catch(() => nav("/"));

    api
      .get(`folders/${id}/notes`)
      .then((res) => setNotes(res.data))
      .catch(console.error);
  }, [id]);

  if (!folder) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">{folder.name}</h1>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {notes.map((note: any) => (
          <div
            key={note._id}
            onClick={() => nav(`/note/${note._id}`)}
            className="card h-[240px] overflow-hidden curson-pointer"
          >
            <h2 className="font-semibold mb-2">{note.title}</h2>
            <p className="text-sm line-clamp-4">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderPage;
