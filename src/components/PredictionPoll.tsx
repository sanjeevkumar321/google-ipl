import { useEffect, useState } from "react";
import type { Match } from "@/lib/seed-data";
import { db } from "@/lib/firebase";
import { ref, onValue, runTransaction } from "firebase/database";

type Choice = "home" | "draw" | "away";

export function PredictionPoll({ match }: { match: Match }) {
  const pollKey = `poll_${match.id}`;
  const [pick, setPick] = useState<Choice | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(pollKey) as Choice | null;
    if (saved) setPick(saved);
  }, [pollKey]);

  const [votes, setVotes] = useState<Record<Choice, number>>({ home: 0, draw: 0, away: 0 });

  // Listen for real-time vote counts
  useEffect(() => {
    const pollRef = ref(db, `polls/${match.id}`);
    return onValue(pollRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVotes({
          home: data.home || 0,
          draw: data.draw || 0,
          away: data.away || 0,
        });
      }
    });
  }, [match.id]);

  const total = votes.home + votes.draw + votes.away || 1;
  const pct = (n: number) => Math.round((n / total) * 100);

  const choose = async (c: Choice) => {
    if (pick) return;

    // Optimistic local update
    setPick(c);
    localStorage.setItem(pollKey, c);

    // Atomic increment in Firebase
    const choiceRef = ref(db, `polls/${match.id}/${c}`);
    await runTransaction(choiceRef, (current) => (current || 0) + 1);
  };

  const options: { key: Choice; label: string; sub: string }[] = [
    { key: "home", label: match.home.shortName, sub: "wins" },
    { key: "draw", label: "Draw", sub: "X" },
    { key: "away", label: match.away.shortName, sub: "wins" },
  ];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-bold">Final result?</h3>
          <p className="text-xs text-muted-foreground">{(votes.home + votes.draw + votes.away).toLocaleString()} fans predicted</p>
        </div>
        {pick && (
          <span className="rounded-full bg-primary/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            Voted
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {options.map((opt) => {
          const p = pct(votes[opt.key]);
          const isPick = pick === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => choose(opt.key)}
              disabled={!!pick}
              className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-all ${
                isPick
                  ? "border-primary/60 bg-primary/10"
                  : pick
                    ? "border-border/60 bg-surface"
                    : "border-border/60 bg-surface hover:border-primary/40"
              } disabled:cursor-default`}
            >
              {pick && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ${isPick ? "bg-gradient-primary opacity-20" : "bg-surface-elevated"}`}
                  style={{ width: `${p}%` }}
                />
              )}
              <div className="relative flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-base font-bold">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.sub}</span>
                </div>
                {pick && <span className="font-display text-sm font-bold tabular-nums">{p}%</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
