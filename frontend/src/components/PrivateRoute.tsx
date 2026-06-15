import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

import WelcomeLoader from "./ui/WelcomeLoader";

const PrivateRoute = () => {
  const { user, accessToken, authChecked } = useAuthStore();

  if (!authChecked) {
    return <WelcomeLoader />;
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
