import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader } from "lucide-react";

const PrivateRoute = () => {
  const { user, accessToken, authChecked } = useAuthStore();

  if (!authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#121212]">
        <Loader className="size-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
