import type { ReactNode } from "react";

function gviewEmbedUrl(pdfUrl: string) {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfUrl)}`;
}

export function EmbeddedPdfPreview({
  title,
  source,
  pdfUrl,
  description,
  footer,
}: {
  title: string;
  source: string;
  pdfUrl: string;
  description: string;
  footer?: ReactNode;
}) {
  return (
    <div className="paper-preview rounded-3xl p-5">
      <div className="paper-sheet rounded-2xl p-5">
        <p className="text-[11px] font-medium text-slate-600">{source}</p>
        <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-700 paper-clamp-4">
          {description}
        </p>

        <div className="mt-4">
          <div className="pdf-embed">
            <iframe
              title={title}
              src={gviewEmbedUrl(pdfUrl)}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pdf-embed__overlay"
            >
              <span className="pdf-embed__cta">Open external PDF</span>
            </a>
          </div>
        </div>

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
