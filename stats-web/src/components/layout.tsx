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
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { ThemeToggle } from "./theme-toggle";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: Home01Icon },
  { to: "/welcome", label: "Welcome", icon: InformationCircleIcon },
  { to: "/leagues", label: "Leagues", icon: Group01Icon },
  { to: "/balls", label: "Balls", icon: BarChartIcon },
  { to: "/monthly", label: "Monthly", icon: Chart01Icon },
  { to: "/upload", label: "Upload", icon: CloudUploadIcon },
] as const;

export function RootLayout() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSheetOpen(true)}
            aria-label="Open navigation menu"
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="size-5" />
          </Button>

          {/* Desktop navigation */}
          <ul className="hidden md:flex items-center gap-1">
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

          {/* Mobile sidebar */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent side="left" className="w-64">
              <nav className="mt-8">
                <ul className="flex flex-col gap-2">
                  {navItems.map(({ to, label, icon }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={to === "/"}
                        onClick={() => setSheetOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors w-full",
                            "text-muted-foreground hover:text-foreground hover:bg-muted",
                            isActive && "bg-muted text-foreground",
                          )
                        }
                      >
                        <HugeiconsIcon
                          icon={icon}
                          strokeWidth={2}
                          className="size-5"
                        />
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>

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
