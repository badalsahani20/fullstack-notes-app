import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { setAuth } = useAuthStore();
  const nav = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/users/login", { email, password, name: name || undefined });
      if (res.data) {
        setAuth(
          {
            id: res.data.user._id || res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
          },
          res.data.accessToken
        );
        nav("/");
      }
    } catch (error) {
      console.log("Login error", error);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/10 bg-[#121a2a]/85 text-zinc-100 shadow-[0_20px_48px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <CardHeader className="space-y-2">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">
            <FileText size={24} />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-zinc-400">Sign in to continue organizing your notes.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                className="border-white/12 bg-[#0f1625]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <Input
                type="password"
                className="border-white/12 bg-[#0f1625]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Name (optional)</label>
              <Input
                type="text"
                className="border-white/12 bg-[#0f1625]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Need an account?{" "}
            <Link to="/register" className="font-medium text-zinc-200 hover:text-primary">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
