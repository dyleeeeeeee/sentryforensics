import Link from "next/link";
import type { ReactNode } from "react";

export function PaperPreview({
  label = "Doc",
  title,
  excerpt,
  footer,
}: {
  label?: string;
  title: string;
  excerpt: string;
  footer?: ReactNode;
}) {
  return (
    <div className="paper-preview rounded-3xl p-5">
      <div className="paper-sheet rounded-2xl p-5">
        <p className="text-[11px] font-medium text-slate-600">{label}</p>
        <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
          <p className="paper-clamp-4">{excerpt}</p>
        </div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function PaperPreviewLink({
  href,
  label,
  title,
  excerpt,
  footer,
}: {
  href: string;
  label?: string;
  title: string;
  excerpt: string;
  footer?: ReactNode;
}) {
  return (
    <Link href={href} className="block transition hover:-translate-y-0.5">
      <PaperPreview label={label} title={title} excerpt={excerpt} footer={footer} />
    </Link>
  );
}

export function ExternalPaperPreviewLink({
  href,
  label,
  title,
  excerpt,
  footer,
}: {
  href: string;
  label?: string;
  title: string;
  excerpt: string;
  footer?: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block transition hover:-translate-y-0.5"
    >
      <PaperPreview label={label} title={title} excerpt={excerpt} footer={footer} />
    </a>
  );
}
