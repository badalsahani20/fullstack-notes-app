// src/components/navItem.tsx
// src/components/navItem.tsx
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

// src/components/navItem.tsx
const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-full py-3 gap-1.5 transition-colors",
          isActive
            ? "text-violet-500 bg-emerald-500/10 hover:text-white"
            : "text-violet-100 hover:text-zinc-200 hover:bg-zinc-800/50"
        )
      }
    >
      <Icon size={22} />

      <span className="text-[10px] font-medium text-center">
        {label}
      </span>
    </NavLink>
  );
};

export default NavItem