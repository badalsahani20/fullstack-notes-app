import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const token = params.get("token");
  const id = params.get("id");
  const name = params.get("name");
  const email = params.get("email");

  useEffect(() => {
    if (token && id && email) {
      setAuth(
        {
          id,
          name: (name && name !== "undefined") ? name : "",
          email,
        },
        token,
      );
      navigate("/");
    }
  }, []);

  return <p className="text-center mt-10">Logging you in...</p>;
};

export default OAuthSuccess;
