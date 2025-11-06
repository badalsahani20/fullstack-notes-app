import { useState } from "react";
import api from "../lib/api";
import { setToken } from "../lib/auth";
import { Link, useNavigate } from "react-router-dom";
import FloatingInput from "../components/FloatingInput.tsx";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

const Register = () => {
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/users/register", {
        name,
        email,
        password,
      });
      setToken(data.token);
      nav("/");
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Opps, looks like something broke.Please try again."
      );
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
      className="min-h-screen flex items-center justify-center px-4 bg-background overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-7 ">
        <h1 className="border-b-accent rounded-md p-1 ">
          {" "}
          <span>
            <Home size={16} className="inline" />
          </span>{" "}
          Your ideas deserve a home. Sign up free!
        </h1>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
            {error}
          </div>
        )}
        <FloatingInput
          label="Name"
          // icon={<User size={16} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button
          className="btn-primary w-full"
          type="submit"
          disabled={loading || !name || !email || !password}
        >
          {loading ? "Creating Account..." : "Sign Up Free"}
        </button>
        <p className="subtitle">
          Already noting?{" "}
          <Link to="/login" className="text-accent underline font-medium">
            Log In
          </Link>
        </p>
      </form>
    </motion.div>
  );
};

export default Register;
