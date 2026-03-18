import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

/**
 * PrivateRoute — wraps all authenticated pages.
 *
 * On first mount it calls GET /users/me to validate the stored token.
 * While that check is in-flight it shows a minimal loader so we don't
 * flash the login page for users who ARE logged in.
 * If the token is invalid / expired the interceptor in api.ts already
 * tries a refresh — if that also fails it clears auth and we redirect.
 */
const PrivateRoute = () => {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // No token at all → skip the network call, just redirect immediately
    if (!accessToken) {
      setChecking(false);
      return;
    }

    api
      .get("/users/me")
      .then((res) => {
        // Re-hydrate user in case of stale localStorage data
        const u = res.data.user || res.data;
        setAuth({ id: u._id || u.id, name: u.name, email: u.email }, accessToken);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setChecking(false);
      });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
