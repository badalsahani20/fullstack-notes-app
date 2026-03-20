import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

const PrivateRoute = () => {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || !accessToken) {
      setChecking(false);
      return;
    }

    api
      .get("/users/me")
      .then((res) => {
        const currentUser = res.data.user || res.data;
        setAuth(
          {
            id: currentUser._id || currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          },
          accessToken,
        );
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          clearAuth();
        }
      })
      .finally(() => {
        setChecking(false);
      });
  }, [accessToken, clearAuth, setAuth, user]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080d18]">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
