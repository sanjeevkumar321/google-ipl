import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { MatchCard } from "@/components/MatchCard";
import { matches } from "@/lib/seed-data";
import { Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TerraceTV — Live sports fan rooms, real-time chat & reactions" },
      {
        name: "description",
        content:
          "Join live match rooms, react to goals as they happen, and chat with thousands of fans worldwide. Football, cricket and more.",
      },
      { property: "og:title", content: "TerraceTV — Where fans watch together" },
      { property: "og:description", content: "Live event timelines, threaded reactions, and global match chat." },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches.filter((m) => m.status === "upcoming");
  const completed = matches.filter((m) => m.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Live now · 2 matches in play
            </div>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
              Watch with{" "}
              <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">your people.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
              Real-time match rooms, threaded reactions on every goal, and chat that actually moves with the game.
              Pick a match — jump in.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#live"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow-primary transition-transform hover:scale-[1.03]"
              >
                <Zap className="h-4 w-4" />
                Join a live room
              </a>
              <a
                href="#upcoming"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-primary/40"
              >
                See upcoming
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        {live.length > 0 && (
          <Section
            id="live"
            title="Live now"
            subtitle="Jump in — fans are reacting in real time"
            badge={<span className="h-2 w-2 rounded-full bg-live shadow-glow-live" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {live.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </Section>
        )}

        {upcoming.length > 0 && (
          <Section id="upcoming" title="Upcoming" subtitle="Bookmark a room before kick-off">
            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </Section>
        )}

        {completed.length > 0 && (
          <Section title="Recently finished" subtitle="Replay the chat, relive the moments">
            <div className="grid gap-4 md:grid-cols-2">
              {completed.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </Section>
        )}
      </main>

      <footer className="border-t border-border/60 bg-surface/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground md:flex-row md:px-8">
          <span>© {new Date().getFullYear()} TerraceTV — built for fans, by fans.</span>
          <span>Real-time powered by Lovable Cloud · v0.1</span>
        </div>
      </footer>
    </div>
  );
}

function Section({
  id,
  title,
  subtitle,
  badge,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 first:mt-10 scroll-mt-20">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            {badge}
            <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
