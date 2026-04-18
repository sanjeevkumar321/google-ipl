import { useState } from "react";
import { Goal, Square, RectangleHorizontal, Repeat, Eye, Flag, Pause, Trophy, MessageCircle, type LucideIcon } from "lucide-react";
import type { MatchEvent, MatchEventType } from "@/lib/seed-data";

const ICONS: Record<MatchEventType, LucideIcon> = {
  GOAL: Goal,
  YELLOW: Square,
  RED: RectangleHorizontal,
  SUB: Repeat,
  VAR: Eye,
  KICKOFF: Flag,
  HALFTIME: Pause,
  FULLTIME: Trophy,
};

const ACCENT: Record<MatchEventType, string> = {
  GOAL: "bg-gradient-primary text-primary-foreground shadow-glow-primary",
  YELLOW: "bg-accent text-accent-foreground",
  RED: "bg-gradient-live text-live-foreground shadow-glow-live",
  SUB: "bg-team-home/20 text-foreground",
  VAR: "bg-surface-elevated text-foreground",
  KICKOFF: "bg-surface-elevated text-muted-foreground",
  HALFTIME: "bg-surface-elevated text-muted-foreground",
  FULLTIME: "bg-surface-elevated text-muted-foreground",
};

const EMOJIS = [
  { key: "fire", emoji: "🔥" },
  { key: "clap", emoji: "👏" },
  { key: "shock", emoji: "😱" },
  { key: "laugh", emoji: "😂" },
] as const;

export function EventTimeline({ events }: { events: MatchEvent[] }) {
  const [reactions, setReactions] = useState<Record<string, MatchEvent["reactions"]>>(() =>
    Object.fromEntries(events.map((e) => [e.id, { ...e.reactions }])),
  );
  const [activeReaction, setActiveReaction] = useState<Record<string, keyof MatchEvent["reactions"] | null>>({});

  const react = (eventId: string, key: keyof MatchEvent["reactions"]) => {
    setActiveReaction((prev) => {
      const current = prev[eventId];
      const next = current === key ? null : key;
      setReactions((rPrev) => {
        const evCounts = { ...rPrev[eventId] };
        if (current) evCounts[current] = Math.max(0, evCounts[current] - 1);
        if (next) evCounts[next] = evCounts[next] + 1;
        return { ...rPrev, [eventId]: evCounts };
      });
      return { ...prev, [eventId]: next };
    });
  };

  const ordered = [...events].sort((a, b) => b.minute - a.minute);

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-[27px] top-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
      <ol className="space-y-4">
        {ordered.map((event) => {
          const Icon = ICONS[event.type];
          const r = reactions[event.id];
          const active = activeReaction[event.id];
          return (
            <li key={event.id} className="relative pl-16">
              <div
                className={`absolute left-0 top-1 flex h-14 w-14 items-center justify-center rounded-2xl ${ACCENT[event.type]}`}
              >
                <Icon className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <div className="rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="rounded-md bg-surface-elevated px-1.5 py-0.5 font-display text-foreground tabular-nums">
                        {event.minute}'
                      </span>
                      <span>{event.type}</span>
                      {event.player && <span className="text-foreground/80">· {event.player}</span>}
                    </div>
                    <p className="mt-1.5 text-sm leading-snug text-foreground">{event.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {EMOJIS.map(({ key, emoji }) => {
                      const k = key as keyof MatchEvent["reactions"];
                      const isActive = active === k;
                      return (
                        <button
                          key={key}
                          onClick={() => react(event.id, k)}
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold transition-all ${
                            isActive
                              ? "border-primary/60 bg-primary/15 text-foreground"
                              : "border-border/60 bg-surface text-muted-foreground hover:border-border hover:text-foreground"
                          }`}
                        >
                          <span className="text-sm leading-none">{emoji}</span>
                          <span className="tabular-nums">{r[k].toLocaleString()}</span>
                        </button>
                      );
                    })}
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-border hover:text-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {event.threadCount} replies
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
