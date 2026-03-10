import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";

function baseClasses(variant: Variant): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  if (variant === "primary") {
    return base + " bg-white/10 text-white border border-white/18 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-white/14 hover:border-white/28 hover:shadow-[0_12px_48px_-10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]";
  }
  if (variant === "secondary") {
    return base + " bg-transparent text-white/85 border border-white/12 hover:bg-white/6 hover:border-white/20 hover:text-white hover:-translate-y-px active:translate-y-0";
  }
  if (variant === "gold") {
    return base + " text-[#1a0f00] font-bold border-0 shadow-[0_8px_32px_-8px_rgba(245,158,11,0.5)] hover:shadow-[0_12px_48px_-10px_rgba(245,158,11,0.65)] hover:-translate-y-px active:translate-y-0 active:scale-[0.98]";
  }
  if (variant === "danger") {
    return base + " bg-[rgba(255,68,102,0.1)] text-[#ff6680] border border-[rgba(255,68,102,0.2)] hover:bg-[rgba(255,68,102,0.18)] hover:border-[rgba(255,68,102,0.35)] hover:-translate-y-px";
  }
  return base + " text-white/80 hover:bg-white/7 border border-transparent hover:-translate-y-px";
}

function goldStyle(variant: Variant): Record<string, string> {
  if (variant === "gold") {
    return { background: "linear-gradient(135deg, #fcd34d, #f59e0b)" };
  }
  return {};
}

export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button {...props} style={goldStyle(variant)} className={baseClasses(variant) + " " + (className ?? "")}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <Link href={href} {...props} style={goldStyle(variant)} className={baseClasses(variant) + " " + (className ?? "")}>
      {children}
    </Link>
  );
}
