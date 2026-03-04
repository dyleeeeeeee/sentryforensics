import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "glass-card rounded-3xl p-6 sm:p-8 " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}
