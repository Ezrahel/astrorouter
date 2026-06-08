import { Link } from "@tanstack/react-router";
import { cloneElement } from "react";
import type { LucideProps } from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  activeOptions?: { exact: boolean };
  isCollapsed: boolean;
  params?: Record<string, string>;
}

export function NavItem({
  icon,
  label,
  to,
  activeOptions,
  isCollapsed,
  params,
}: NavItemProps) {
  // Clone icon with dynamic size based on collapsed state
  const dynamicIcon = cloneElement(icon as React.ReactElement<LucideProps>, {
    size: isCollapsed ? 20 : 14,
  });

  return (
    <Link
      to={to}
      params={params}
      activeProps={{
        className:
          "bg-accent/10 text-accent font-medium border border-accent/20 shadow-[0_0_15px_rgba(255,166,43,0.1)]",
      }}
      inactiveProps={{
        className:
          "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
      }}
      activeOptions={activeOptions}
      className={`flex items-center ${isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-1"} w-full text-sm rounded-xl transition-all duration-200 group relative`}
      title={isCollapsed ? label : undefined}
    >
      {dynamicIcon}
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}
