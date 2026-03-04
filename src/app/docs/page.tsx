import Link from "next/link";

import { Container } from "@/components/Container";
import { GlassCard } from "@/components/GlassCard";
import { EmbeddedPdfPreview } from "@/components/EmbeddedPdfPreview";

export const metadata = {
  title: "Docs",
};

const externalPapers = [
  {
    href: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-61r3.pdf",
    title: "NIST SP 800-61r3 — Incident Response Guide",
    source: "NIST",
    description:
      "A comprehensive guide for building and operating incident response capability, including preparation, detection, analysis, containment, eradication, and recovery.",
  },
  {
    href: "https://www.cisa.gov/sites/default/files/2025-03/StopRansomware-Guide%20508.pdf",
    title: "#StopRansomware Guide (PDF)",
    source: "CISA",
    description:
      "A practical guide covering ransomware response and resilience, from preparation and prevention to incident handling and recovery.",
  },
  {
    href: "https://owasp.org/www-pdf-archive/OWASP_Application_Security_Verification_Standard_4.0-en.pdf",
    title: "OWASP ASVS 4.0 (PDF)",
    source: "OWASP",
    description:
      "A standard for verifying application security controls and building a structured security requirements baseline.",
  },
];

export default function DocsIndexPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="grid gap-6">
          <header>
            <p className="text-xs font-medium text-white/60">Documentation</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Docs
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
              A curated set of authoritative, pre-existing security references with inline
              previews.
            </p>
          </header>

          <section className="grid gap-4">
            <header className="mt-2">
              <h2 className="text-base font-semibold text-white">External papers (PDF)</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                These open in a new tab. Sentry Forensics does not host or store these files.
                Sources are credited and remain under their original publishers.
              </p>
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
              {externalPapers.map((paper) => (
                <EmbeddedPdfPreview
                  key={paper.href}
                  pdfUrl={paper.href}
                  source={paper.source}
                  title={paper.title}
                  description={paper.description}
                />
              ))}
            </div>
          </section>

          <GlassCard className="glass-card--elevated">
            <h2 className="text-base font-semibold text-white">Trust note</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              We do not claim guaranteed recovery results. We do not custody funds. We never
              request seed phrases or private keys, and we do not request remote access.
            </p>
          </GlassCard>

          <div className="text-sm">
            <Link className="text-white/80 hover:text-white" href="/">
              ← Back to home
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
