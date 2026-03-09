import { Folder, Home, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import Dock from './Dock';
import { useNoteStore } from '@/store/useNoteStore';

const NavigationDock = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { folderId } = useParams();
    const { createNote } = useNoteStore();

    const handleCreateNote = async () => {
      const targetFolderId = folderId || null;
      const newNote = await createNote(targetFolderId);
      if(newNote) {
        navigate(`/note/${newNote._id}`)
      }
    }

    const dockItems = [
        { 
          icon: <Home size={23} className={location.pathname === "/" ? "text-blue-500" : ""} />, 
          label: 'Home', 
          onClick: () => navigate("/") 
        },
        { 
          icon: <Search size={23} className={location.pathname === "/search" ? "text-blue-500" : ""} />, 
          label: 'Search', 
          onClick: () => navigate("/search") 
        },
        { 
          icon: <PlusCircle size={28} className="text-emerald-500 hover:scale-110 transition-transform" />, 
          label: 'New Note', 
          onClick: handleCreateNote // 👈 Using the smart handler now
        },
        { 
          icon: <Folder size={23} className={location.pathname.includes("/folder") ? "text-blue-500" : ""} />, 
          label: 'Folders', 
          onClick: () => navigate("/folders") 
        },
        { 
          icon: <Trash2 size={23} className={location.pathname === "/trash" ? "text-blue-500" : ""} />, 
          label: 'Trash', 
          onClick: () => navigate("/trash") 
        },
    ];

  
  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50'>
      <Dock 
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  )
}

export default NavigationDock
