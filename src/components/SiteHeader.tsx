import { Link } from "@tanstack/react-router";
import { Radio } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow-primary transition-transform group-hover:scale-105">
            <Radio className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-extrabold tracking-tight md:text-lg">MatchHuddle</span>
            <span className="hidden text-[8px] uppercase tracking-[0.2em] text-muted-foreground md:block">Live · Fans · Emotions</span>
          </div>
        </Link>

        <nav className="flex items-center gap-0.5 sm:gap-1">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground md:px-3 md:py-2 md:text-sm md:font-medium"
            activeProps={{ className: "text-foreground bg-surface" }}
          >
            Matches
          </Link>
          <Link
            to="/circles"
            className="rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground md:px-3 md:py-2 md:text-sm md:font-medium"
            activeProps={{ className: "text-foreground bg-surface" }}
          >
            Fan Circles
          </Link>
          <Link
            to="/highlights"
            className="rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground md:px-3 md:py-2 md:text-sm md:font-medium"
            activeProps={{ className: "text-foreground bg-surface" }}
          >
            Highlights
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Auth buttons removed per user request */}
        </div>
      </div>
    </header>
  );
}
