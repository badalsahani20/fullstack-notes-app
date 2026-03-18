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
        const u = res.data.user || res.data;
        setAuth({ id: u._id || u.id, name: u.name, email: u.email }, accessToken);
      })
      .catch((err) => {
        // Only force logout on explicit "token invalid/expired" (401)
        // Network errors, timeouts, or 5xx (e.g. Render cold start) should
        // keep the stored session alive — the token may still be valid.
        if (err?.response?.status === 401) {
          clearAuth();
        }
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
