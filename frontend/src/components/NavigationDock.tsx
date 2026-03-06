import { Folder, Home, PlusCircle, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'
import Dock from './Dock';

const NavigationDock = () => {
    const navigate = useNavigate();

    const dockItems = [
        {icon: <Home size={23} />, label: 'Home', onClick: () => navigate("/")},
        {icon: <Search size={23} />, label: 'Search', onClick: () => navigate("/search")},
        {icon: <PlusCircle size={23} className="text-emerald-500" />, label: 'New Note', onClick: () => handleCreateNote()},
        {icon: <Folder size={23} />, label: 'Folders', onClick: () => navigate("/folders")},
        {icon: <Trash2 size={23} />, label: 'Trash', onClick: () => navigate("/trash")},
    ];

    const handleCreateNote = () => {
        window.alert("Creating a new note...");
    }
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
