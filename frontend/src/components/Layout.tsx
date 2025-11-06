import Sidebar from "./SideBar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="flex">
      {/* Sidebar stays fixed on the left */}
      <Sidebar />

      {/* Main area shifted to the right */}
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
