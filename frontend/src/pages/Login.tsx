import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { setToken } from "../lib/auth";
import FloatingInput from "../components/FloatingInput";
import { motion } from "framer-motion";

const Login = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const { data } = await api.post("/users/login", { email, password });
      setToken(data.token);
      nav("/");
    } catch (error: any) {
      setErr(error?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="min-h-screen flex items-center justify-center px-4 bg-background overflow-hidden">
            
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-7">
        <h1 className="title text-center">Welcome Back 👋</h1>
        <p className="text-sm text-muted-foreground">
            Log in to pick up your notes where you left off.
          </p>
        {err && <p className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">{err}</p>}

        <FloatingInput
          label="Email"
          // icon={<Mail size={16} />}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <FloatingInput
          label="Password"
          // icon={<Lock size={16} />}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn-primary w-full" disabled= {loading || !email || !password}>
          {loading ? "Logging you in..." : "Log In"}
        </button>

        <p className="subtitle text-center">Google login coming soon</p>
        <p className="subtitle text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-accent font-medium underline">
            Create an account
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Login;
