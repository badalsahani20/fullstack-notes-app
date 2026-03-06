import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const {setAuth} = useAuthStore();
    const nav = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post("/users/login", {email, password});
            if(res.data) {
                setAuth({
                    id: res.data.user._id || res.data.user.id,
                    name: res.data.user.name,
                    email: res.data.user.email
                },
                res.data.accessToken
            );
            nav("/")
            }
        } catch (error) {
            console.log("Login error", error);
        }
    }
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="space-y-1 flex flex-col items-center">
                <div className="p-3 bg-zinc-800 rounded-2xl mb-4 text-white">
                    <FileText size={32} />
                </div>
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription className="text-zinc-500 text-center">
                    Enter your email to sign in to your notes
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input 
                            type="email"
                            placeholder="name@example.com"
                            className="bg-zinc-950 border-zinc-800"
                            value={email}
                            onChange={(e) => {setEmail(e.target.value)}}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                            type="password"
                            className="bg-zinc-950 border-zinc-800"
                            value={password}
                            onChange={(e) => {setPassword(e.target.value)}}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm  font-medium">Name(Optional)</label>
                        <Input 
                            type="name"
                            className="bg-zinc-950 border-zinc-800"
                            value={name}
                            onChange={(e) => {setName(e.target.value)}}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200">
                        Sign In
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm text-zinc-500">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-white hover:underline">
                    Sign Up</Link>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}

export default Login
