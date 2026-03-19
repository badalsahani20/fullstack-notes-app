import { CreditCard, LogOut, Shield, UserRound } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const initials = useMemo(() => {
    if (!user?.name) return "NS";
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
    } catch (error) {
      console.error("Logout failed", error);
    }
    clearAuth();
    navigate("/login");
  };

  const items = [
    { icon: UserRound, label: "Account Details" },
    { icon: CreditCard, label: "Plans & Subscription" },
    { icon: Shield, label: "Security" },
  ];

  return (
    <div className="mobile-profile-page">
      <div className="mobile-screen-header">
        <h2>Profile</h2>
      </div>

      <div className="px-4 pb-28">
        <div className="mobile-profile-card">
          <div className="mobile-profile-avatar">{initials}</div>
          <h3>{user?.name || "Notesify User"}</h3>
          <p>{user?.email || "No email connected"}</p>
        </div>

        <div className="mobile-profile-list">
          {items.map((item) => (
            <button key={item.label} type="button" className="mobile-profile-list-item">
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <button type="button" onClick={handleLogout} className="mobile-logout-button">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
