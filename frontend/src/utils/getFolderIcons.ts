import { Notebook, Plane, UtensilsCrossed } from "lucide-react";
import type { ComponentType } from "react";

export type IconComponent = ComponentType<{ size?: number; className?: string }>;

export const getFolderIcon = (name: string): IconComponent => {
  if (/travel/i.test(name)) return Plane;
  if (/recipe/i.test(name)) return UtensilsCrossed;
  return Notebook;
};