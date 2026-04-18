import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Users, Clock } from "lucide-react";
import type { Match } from "@/lib/seed-data";
import { formatTime } from "@/lib/seed-data";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export function LiveBadge({ minute }: { minute?: string | number }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-live px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-live-foreground shadow-glow-live">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-live-foreground opacity-75 live-pulse" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live-foreground" />
      </span>
      LIVE {minute !== undefined ? `· ${minute}` : ""}
    </div>
  );
}

function StatusChip({ match }: { match: Match }) {
  if (match.status === "live") return <LiveBadge minute={match.minute} />;
  if (match.status === "upcoming")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Clock className="h-3 w-3" /> {formatTime(match.startsAt)}
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      Full-time
    </span>
  );
}

export function MatchCard({ match: initialMatch }: { match: Match }) {
  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    if (initialMatch.id === "151807") {
      const matchRef = ref(db, "live_match/151807");
      return onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.miniscore) {
          setMatchData(data.miniscore);
        }
      });
    }
  }, [initialMatch.id]);

  const homeScore = matchData ? `${matchData.batTeam.teamScore}/${matchData.batTeam.teamWkts}` : initialMatch.homeScore;
  const awayScore = matchData ? (matchData.overs + " ov") : (initialMatch.status === "live" ? "15.2 ov" : initialMatch.awayScore);
  const displayMinute = matchData ? `${matchData.overs} ov` : initialMatch.minute;

  return (
    <Link
      to="/match/$matchId"
      params={{ matchId: initialMatch.id }}
      className="group relative block overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
    >
      {initialMatch.status === "live" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      )}

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {initialMatch.competition}
        </span>
        <StatusChip match={{ ...initialMatch, minute: displayMinute as any }} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <TeamRow name={initialMatch.home.shortName} fullName={initialMatch.home.name} emoji={initialMatch.home.emoji} side="home" />

        <div className="flex flex-col items-center">
          {initialMatch.status === "upcoming" ? (
            <span className="font-display text-2xl font-bold text-muted-foreground">vs</span>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 font-display text-3xl font-extrabold tabular-nums">
                <span className="text-foreground">
                  {homeScore}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                {awayScore}
              </span>
            </div>
          )}
        </div>

        <TeamRow name={initialMatch.away.shortName} fullName={initialMatch.away.name} emoji={initialMatch.away.emoji} side="away" />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
        <span className="truncate">{matchData?.status || initialMatch.venue}</span>
        {initialMatch.viewers > 0 && (
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5" />
            {(initialMatch.viewers + (matchData ? 1500 : 0)).toLocaleString()} watching
          </span>
        )}
      </div>
    </Link>
  );
}

function TeamRow({
  name,
  fullName,
  emoji,
  side,
}: {
  name: string;
  fullName: string;
  emoji: string;
  side: "home" | "away";
}) {
  return (
    <div className={`flex flex-1 items-center gap-3 ${side === "away" ? "flex-row-reverse text-right" : ""}`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-2xl">
        {emoji}
      </div>
      <div className="min-w-0">
        <div className="font-display text-base font-bold leading-tight">{name}</div>
        <div className="truncate text-xs text-muted-foreground">{fullName}</div>
      </div>
    </div>
  );
}
