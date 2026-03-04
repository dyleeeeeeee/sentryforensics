import Link from "next/link";
import Image from "next/image";

import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/Button";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass-nav border-b border-white/10">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-white/10 border border-white/15">
              <Image
                src="/emblem.svg"
                alt="Sentry Forensics"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                priority
              />
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">
              Sentry Forensics
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link className="text-sm text-white/80 hover:text-white" href="/services">
              Services
            </Link>
            <Link className="text-sm text-white/80 hover:text-white" href="/process">
              Process
            </Link>
            <Link className="text-sm text-white/80 hover:text-white" href="/docs">
              Docs
            </Link>
            <Link className="text-sm text-white/80 hover:text-white" href="/faq">
              FAQ
            </Link>
            <Link className="text-sm text-white/80 hover:text-white" href="/contact">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ButtonLink href="/recover-wallet" variant="secondary" className="hidden sm:inline-flex">
              Start intake
            </ButtonLink>
            <ButtonLink href="/recover-wallet" variant="primary">
              Intake
            </ButtonLink>
          </div>
        </Container>
      </div>
    </header>
  );
}
