import { useTheme } from "@/lib/theme-provider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun02Icon,
  Moon02Icon,
  ComputerIcon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <HugeiconsIcon
            icon={
              theme === "light"
                ? Sun02Icon
                : theme === "dark"
                  ? Moon02Icon
                  : ComputerIcon
            }
            strokeWidth={2}
            className="size-4"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <HugeiconsIcon
            icon={Sun02Icon}
            strokeWidth={2}
            className="mr-2 size-4"
          />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <HugeiconsIcon
            icon={Moon02Icon}
            strokeWidth={2}
            className="mr-2 size-4"
          />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <HugeiconsIcon
            icon={ComputerIcon}
            strokeWidth={2}
            className="mr-2 size-4"
          />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
