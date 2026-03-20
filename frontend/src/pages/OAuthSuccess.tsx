import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { requestSessionRefresh } from "@/lib/api";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const finishOAuthLogin = async () => {
      try {
        await requestSessionRefresh();
        navigate("/", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    };

    finishOAuthLogin();
  }, [navigate]);

  return <p className="text-center mt-10">Logging you in...</p>;
};

export default OAuthSuccess;
