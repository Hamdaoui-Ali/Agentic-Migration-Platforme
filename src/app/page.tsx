import Link from "next/link";
import { ArrowUpRight, Braces, Coffee, History, ShieldCheck } from "lucide-react";

import { ProductHeader } from "@/components/shared/product-header";
import { TechnologyCard } from "@/components/shared/technology-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { recentMigrations } from "@/data/recent-migrations";

export default function Home() {
  return (
    <div className="mf-page">
      <ProductHeader />
      <main>
        <section className="border-b border-[var(--mf-border)] bg-[var(--mf-surface)]">
          <div className="mf-container py-12 lg:py-16">
            <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mf-primary)]">
                  Migration control plane
                </p>
                <h1 className="mt-4 text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.06em] text-[var(--mf-text)]">
                  Govern every move.
                  <br />
                  Prove the outcome.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-[var(--mf-text-muted)]">
                  Configure, govern, execute, review, and prove complex framework migrations from one operational workspace.
                </p>
              </div>
              <div className="mf-launch-summary max-w-xs">
                <div className="flex items-center gap-2 text-[var(--mf-success)]"><ShieldCheck aria-hidden="true" className="h-4 w-4" /><span className="text-xs font-bold">Evidence-led execution</span></div>
                <p className="mt-2 text-xs leading-5 text-[var(--mf-text-muted)]">Human decisions stay explicit. Every stage leaves a durable trail.</p>
                <div className="mt-4 flex items-center gap-4 text-[11px] font-semibold text-[var(--mf-text-soft)]"><span className="inline-flex items-center gap-1.5"><History aria-hidden="true" className="h-3.5 w-3.5" />Append-only history</span><span className="inline-flex items-center gap-1.5"><Braces aria-hidden="true" className="h-3.5 w-3.5" />Two factories</span></div>
              </div>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <TechnologyCard
                eyebrow="Frontend"
                title="Angular Migration"
                description="Govern adjacent-major Angular modernization with certified runtime binding, evidence-backed gates, causal repair, validation, promotion, and sealed stage delivery."
                meta={["Angular 18 → 21", "Node · npm", "TypeScript · Angular CLI"]}
                href="/angular/migrations/new"
                action="Start Angular migration"
                icon={<Braces aria-hidden="true" className="h-7 w-7" strokeWidth={1.8} />}
              />
              <TechnologyCard
                eyebrow="Backend"
                title="Spring Boot Migration"
                description="Move Spring Boot applications across governed profiles with reviewed analysis and planning, Maven validation, repair review, dependency targeting, and final proof."
                meta={["Spring Boot 2.7 → 4.0", "Java · Maven", "Reviewed phase gates"]}
                href="/java/migrations/new"
                action="Start Spring Boot migration"
                icon={<Coffee aria-hidden="true" className="h-7 w-7" strokeWidth={1.8} />}
              />
            </div>
          </div>
        </section>

        <section className="mf-container py-10 lg:py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--mf-text-soft)]">
                Operations
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em]">
                Recent migrations
              </h2>
            </div>
            <Link href="/" className="mf-focus inline-flex items-center gap-1 text-xs font-semibold text-[var(--mf-primary)]">View all activity <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-[var(--mf-border)] bg-[var(--mf-surface)] shadow-[var(--mf-shadow)]">
            <div className="hidden grid-cols-[1.2fr_.8fr_.9fr_.6fr_90px] gap-4 border-b border-[var(--mf-border)] bg-[var(--mf-surface-subtle)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--mf-text-soft)] md:grid">
              <span>Application</span>
              <span>Platform</span>
              <span>Route</span>
              <span>Status</span>
              <span className="text-right">Updated</span>
            </div>
            {recentMigrations.map((migration) => (
              <Link
                key={migration.id}
                href={migration.href}
                className="mf-focus grid gap-3 border-b border-[var(--mf-border)] px-5 py-4 transition-colors last:border-b-0 hover:bg-[var(--mf-surface-subtle)] md:grid-cols-[1.2fr_.8fr_.9fr_.6fr_90px] md:items-center md:gap-4"
              >
                <span className="text-sm font-semibold">{migration.name}</span>
                <span className="text-sm text-[var(--mf-text-muted)]">{migration.stack}</span>
                <span className="font-mono text-xs text-[var(--mf-text-muted)]">{migration.route}</span>
                <span><StatusBadge label={migration.status} /></span>
                <span className="text-xs text-[var(--mf-text-soft)] md:text-right">{migration.updated}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
