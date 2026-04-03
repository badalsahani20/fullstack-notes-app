import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black p-4">
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Premium Moving Dark Theme Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-100">
        <div className="absolute -left-[50%] -top-[50%] h-[200%] w-[200%] animate-[spin_25s_linear_infinite]">
          {/* Subtle slow moving white & indigo blurs */}
          <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/30 blur-[100px]" />
          <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/40 blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/3 h-[600px] w-[600px] rounded-full bg-purple-500/40 blur-[120px]" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
