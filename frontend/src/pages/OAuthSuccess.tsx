import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestSessionRefresh } from "@/lib/api";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finishOAuthLogin = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          // New secure flow: Exchange the temp code for real tokens
          const res = await api.post("/users/exchange-code", { code });
          const { user, accessToken } = res.data;
          useAuthStore.getState().setAuth(user, accessToken);
        } else {
          // Fallback legacy flow: Use the cookie to refresh
          await requestSessionRefresh();
        }
        
        navigate("/", { replace: true });
      } catch (error) {
        console.error("OAuth completion failed:", error);
        navigate("/login", { replace: true });
      }
    };

    finishOAuthLogin();
  }, [navigate]);

  return <p className="text-center mt-10">Logging you in...</p>;
};

export default OAuthSuccess;
