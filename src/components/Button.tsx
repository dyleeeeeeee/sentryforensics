import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant = "primary" | "secondary" | "ghost";

function baseClasses(variant: Variant) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none";

  if (variant === "primary") {
    return (
      base +
      " bg-white/12 text-white border border-white/20 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-white/16 hover:border-white/30 hover:shadow-[0_12px_48px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.2)] hover:-translate-y-px"
    );
  }

  if (variant === "secondary") {
    return (
      base +
      " bg-black/20/70 text-white border border-white/20 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)] hover:bg-black/25/80 hover:border-white/30 hover:shadow-[0_8px_32px_-6px_rgba(0,0,0,0.45)] hover:-translate-y-px"
    );
  }

  return (
    base +
    " text-white/90 hover:bg-white/8 border border-transparent hover:-translate-y-px"
  );
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
    <button
      {...props}
      className={baseClasses(variant) + " " + (className ?? "")}
    >
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
    <Link
      href={href}
      {...props}
      className={baseClasses(variant) + " " + (className ?? "")}
    >
      {children}
    </Link>
  );
}
