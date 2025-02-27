// components/dashboard/dashboard-shell.tsx
import { cn } from "../../lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({
  children,
  className,
}: DashboardShellProps) {
  return (
    <div className={cn("container mx-auto py-6", className)}>
      {children}
    </div>
  );
}