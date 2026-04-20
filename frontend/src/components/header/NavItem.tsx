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
          "group relative mx-auto flex h-10 w-10 items-center justify-center rounded-md transition",
          isActive
            ? "bg-[#2563eb] text-white shadow-none"
            : "text-(--muted-text) hover:bg-white/5 hover:text-[#d1d5db]"
        )
      }
      title={label}
    >
      <Icon size={16} className="transition group-hover:scale-105" />
    </NavLink>
  );
};

export default NavItem;
