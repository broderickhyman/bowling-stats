import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  CloudUploadIcon,
  Group01Icon,
  BarChartIcon,
  Chart01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { to: "/", label: "Home", icon: Home01Icon },
  { to: "/welcome", label: "Welcome", icon: InformationCircleIcon },
  { to: "/leagues", label: "Leagues", icon: Group01Icon },
  { to: "/balls", label: "Balls", icon: BarChartIcon },
  { to: "/monthly", label: "Monthly", icon: Chart01Icon },
  { to: "/upload", label: "Upload", icon: CloudUploadIcon },
] as const;

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <ul className="flex items-center gap-1">
            {navItems.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      "text-muted-foreground hover:text-foreground hover:bg-muted",
                      isActive && "bg-muted text-foreground",
                    )
                  }
                >
                  <HugeiconsIcon
                    icon={icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      </nav>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
