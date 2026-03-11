import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "group relative mx-2 flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 transition",
          isActive
            ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
        )
      }
    >
      <Icon size={20} className="transition group-hover:scale-105" />
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
    </NavLink>
  );
};

export default NavItem;
