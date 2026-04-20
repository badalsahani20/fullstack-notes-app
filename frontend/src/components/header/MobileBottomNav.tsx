import { Bot, Folder, Search, StickyNote, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    {
      label: "Notes",
      icon: StickyNote,
      active: !location.pathname.startsWith("/search") && !location.pathname.startsWith("/folders") && !location.pathname.startsWith("/profile"),
      onClick: () => navigate("/"),
    },
    {
      label: "Search",
      icon: Search,
      active: location.pathname.startsWith("/search"),
      onClick: () => navigate("/search"),
    },
    {
      label: "Iris AI",
      icon: Bot,
      active: location.pathname.startsWith("/chat"),
      onClick: () => navigate("/chat"),
    },
    {
      label: "Folders",
      icon: Folder,
      active: location.pathname.startsWith("/folders"),
      onClick: () => navigate("/folders"),
    },
    {
      label: "Profile",
      icon: User,
      active: location.pathname.startsWith("/profile"),
      onClick: () => navigate("/profile"),
    },
  ];

  return (
    <nav className="mobile-bottom-nav md:hidden">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={`mobile-bottom-nav-item ${item.active ? "mobile-bottom-nav-item-active" : ""}`}
          aria-current={item.active ? "page" : undefined}
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
