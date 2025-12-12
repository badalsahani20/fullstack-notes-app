import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@tiptap/react";

import api from "../lib/api";
import {
  ArrowLeft,
  Trash2,
  Save,
  Pin,
  PinOff,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  List,
  ListOrdered,
} from "lucide-react";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from '@tiptap/extension-underline';
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

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

const AUTOSAVE_DELAY = 9000; // ms

const NotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [folders, setFolders] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  

  
  // Tiptap editor
  useEffect(() => {
  if (!note) return; // wait for data

  const instance = new Editor({
    extensions: [
      StarterKit.configure({
        history: true,
        underline: false,
      }),
      Underline,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: note.content || "",
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setNote((prev) => (prev ? { ...prev, content: html } : prev));
    },
  });

  setEditor(instance);

  return () => {
    instance.destroy();
  };
}, [note]);

  // fetch note
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const [noteRes, foldersRes] = await Promise.all([
          api.get(`/notes/${id}`),
          api.get("/folders"),
        ]);
        if (!mounted) return;
        if (!noteRes || !foldersRes) {
          setError("Failed to load note. Try refreshing.");
          return;
        }
        setNote(noteRes.data);
        setFolders(foldersRes.data || []);
        // set editor content after data fetch
        if (editor && noteRes.data?.content) {
          editor.commands.setContent(noteRes.data.content, false);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load note.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // keep editor content updated if note loads later
  useEffect(() => {
    if (editor && note?.content) {
      editor.commands.setContent(note.content, false);
    }
  }, [editor, note?.content]);
  

  // autosave (debounced)
  useEffect(() => {
    if (!editor || !note?._id) return;
    const handle = setTimeout(() => {
      const save = async () => {
        try {
          setSaving(true);
          await api.put(`/notes/${note._id}`, {
            title: note.title,
            content: note.content,
            color: note.color,
            folder: note.folder || null,
            pinned: note.pinned || false,
          });
        } catch (err) {
          console.error("Autosave failed",err);
        } finally {
          setSaving(false);
        }
      };
      save();
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(handle);
  }, [note?.title, note?.content, note?.folder, note?.color, note?.pinned, note?._id, note]);


  // manual save (button)
  const handleSave = async () => {
    if (!note) return;
    try {
      setSaving(true);
      await api.put(`/notes/${note._id}`, note);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // delete
  const handleDelete = async () => {
    if (!note) return;
    if (!confirm("Delete this note? This cannot be undone.")) return;
    try {
      await api.delete(`/notes/${note._id}`);
      nav("/");
    } catch (err) {
      console.error(err);
      alert("Failed to delete note.");
    }
  };

  // toggle pin
  const togglePin = () => {
    if (!note) return;
    setNote({ ...note, pinned: !note.pinned });
  };

  // change folder
  const handleFolderChange = async (folderId: string | null) => {
    if (!note) return;
    setNote({ ...note, folder: folderId });
  };

  // insert image (simple prompt) - you may later wire upload
  const handleInsertImage = useCallback(() => {
    const url = prompt("Image URL (you can wire file upload later):");
    if (!url || !editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  // insert todo
  const handleInsertTodo = useCallback(() => {
    editor?.chain().focus().toggleTaskList().run();
  }, [editor]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!note) return <div className="p-6">Note not found.</div>;
  if (!editor) return <div className="p-6">Initializing editor...</div>;



  return (
    <div className="p-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <input
            value={note.title}
            onChange={(e) => setNote({ ...note, title: e.target.value })}
            className="bg-transparent text-2xl font-semibold outline-none border-none md:min-w-[420px]"
            placeholder="Untitled note"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={note.folder || ""}
            onChange={(e) => handleFolderChange(e.target.value || null)}
            className="input text-sm"
          >
            <option value="">Uncategorized</option>
            {folders.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>

          <button
            onClick={togglePin}
            className="p-2 rounded hover:bg-secondary transition"
            title={note.pinned ? "Unpin" : "Pin"}
          >
            {note.pinned ? <Pin size={18} /> : <PinOff size={18} />}
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded hover:bg-red-50 text-red-600 transition"
            title="Delete note"
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
            title="Save now"
          >
            <Save size={16} />
            <span className="hidden sm:inline">{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 p-2 bg-secondary rounded-md border border-muted">
        {/* basic formatting */}
        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold (Ctrl/Cmd+B)"
        >
          <strong>B</strong>
        </button>

        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl/Cmd+I)"
        >
          <em>I</em>
        </button>

        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <u>U</u>
        </button>

        <div className="border-l h-6 mx-1" />

        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
        >
          <Type size={16} />
        </button>

        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>

        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={handleInsertTodo}
          title="To-do"
        >
          ☑️
        </button>

        <div className="border-l h-6 mx-1" />

        {/* alignment */}
        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          title="Align left"
        >
          <AlignLeft size={16} />
        </button>

        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          title="Align center"
        >
          <AlignCenter size={16} />
        </button>

        <button
          className="p-2 rounded hover:bg-accent/10"
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          title="Align right"
        >
          <AlignRight size={16} />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="p-2 rounded hover:bg-accent/10"
            onClick={handleInsertImage}
            title="Insert image"
          >
            <ImageIcon size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="border rounded-md overflow-hidden">
        <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[40vh] bg-background" />
      </div>

      {/* Footer info */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Created: {note.createdAt ? new Date(note.createdAt).toLocaleString() : "—"}
        </div>
        <div>Updated: {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : "—"}</div>
      </div>
    </div>
  );
};

export default NotePage;
