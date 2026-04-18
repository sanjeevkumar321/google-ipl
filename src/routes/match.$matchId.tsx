import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Activity, Target, Zap, TrendingUp, Shield, Gauge, BarChart3, Clock, CircleDot } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { LiveBadge } from "@/components/MatchCard";
import { ChatPanel } from "@/components/ChatPanel";
import { OnlineFans } from "@/components/OnlineFans";
import { PredictionPoll } from "@/components/PredictionPoll";
import { getMatch } from "@/lib/seed-data";
import { db } from "@/lib/firebase";
import { ref, onValue, get, update, set } from "firebase/database";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function DigitTicker({ value }: { value: string | number }) {
  const chars = String(value).split("");
  return (
    <div className="flex items-center justify-center">
      {chars.map((char, i) => (
        <div key={i} className="relative inline-flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={char}
              initial={{ y: -25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 25, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {char}
            </motion.span>
          </AnimatePresence>
          {/* Invisible placeholder to maintain width and height */}
          <span className="invisible pointer-events-none select-none">{char}</span>
        </div>
      ))}
    </div>
  );
}

function BigEventOverlay({ event }: { event: string }) {
  const colors: Record<string, string> = {
    FOUR: "from-primary/90 to-primary/40",
    SIX: "from-accent/90 to-accent/40",
    WICKET: "from-live/90 to-live/40",
    OUT: "from-live/90 to-live/40",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none bg-gradient-to-br ${colors[event] || "from-white/20 to-black/40"} backdrop-blur-xl`}
    >
      <motion.div
        initial={{ scale: 0.5, y: 100, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative"
      >
        <span className="absolute -inset-10 animate-ping rounded-full bg-white/20" />
        <h2 className="text-8xl md:text-[14rem] font-black italic tracking-tighter text-white drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] uppercase flex flex-col items-center">
          {event}
          <span className="text-2xl mt-4 bg-white/20 px-4 py-1 rounded-full not-italic">FIREWORK FEED!</span>
        </h2>
      </motion.div>
    </motion.div>
  );
}

export const Route = createFileRoute("/match/$matchId")({
  loader: ({ params }) => {
    const match = getMatch(params.matchId);
    if (!match) throw notFound();
    return { match };
  },
  component: MatchRoomPage,
});

// Global sync state to avoid double intervals in dev (HMR)
let globalSyncId: any = null;
const seenTimestamps = new Set<number>();

function MatchRoomPage() {
  const { match: initialMatch } = Route.useLoaderData();
  const [liveData, setLiveData] = useState<any>(null);
  const [allCommentary, setAllCommentary] = useState<any[]>([]);
  const [overlayEvent, setOverlayEvent] = useState<string | null>(null);
  const [lastProcessedBall, setLastProcessedBall] = useState<number>(0);

  // Integrated Background Sync (Replaces separate script)
  useEffect(() => {
    if (initialMatch.id !== "151807") return;
    if (globalSyncId) return;

    const API_URL = "/api-match/api/mcenter/livescore/151807";
    const liveMatchRef = ref(db, "live_match/151807");
    const commentaryRef = ref(db, "commentary_history/151807");

    const fetchAndSync = async () => {
      try {
        const { data } = await axios.get(API_URL);
        
        // Accumulate commentary
        if (data.commentaryList) {
          const newEntries: Record<string, any> = {};
          data.commentaryList.forEach((comm: any) => {
            if (!seenTimestamps.has(comm.timestamp)) {
              seenTimestamps.add(comm.timestamp);
              newEntries[`t_${comm.timestamp}`] = comm;
            }
          });
          if (Object.keys(newEntries).length > 0) {
            await update(commentaryRef, newEntries);
          }
        }

        // Update live score
        await set(liveMatchRef, data);
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    // Load existing timestamps first
    get(commentaryRef).then((snapshot) => {
      if (snapshot.exists()) {
        Object.values(snapshot.val()).forEach((c: any) => {
          if (c.timestamp) seenTimestamps.add(c.timestamp);
        });
      }
      // Start loop
      if (!globalSyncId) {
        globalSyncId = setInterval(fetchAndSync, 2000);
        fetchAndSync();
      }
    });

    return () => {
      // We don't clear globalSyncId on component unmount to keep it running "not separately"
      // but in a production app we might want a better strategy.
    };
  }, [initialMatch.id]);


  useEffect(() => {
    if (initialMatch.id === "151807") {
      const matchRef = ref(db, "live_match/151807");
      return onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setLiveData(data);
      });
    }
  }, [initialMatch.id]);

  useEffect(() => {
    if (initialMatch.id === "151807") {
      const commRef = ref(db, "commentary_history/151807");
      return onValue(commRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data) as any[];
          list.sort((a: any, b: any) => b.timestamp - a.timestamp);
          setAllCommentary(list);
        }
      });
    }
  }, [initialMatch.id]);

  const m = liveData?.miniscore;
  const match = initialMatch;
  const homeScore = m ? `${m.batTeam.teamScore}/${m.batTeam.teamWkts}` : match.homeScore;
  const overs = m ? m.overs : "";
  const status = m?.status || "";
  const crr = m ? m.currentRunRate.toFixed(2) : "0.00";
  const rrr = m && m.requiredRunRate > 0 ? m.requiredRunRate.toFixed(2) : null;

  useEffect(() => {
    if (allCommentary.length > 0) {
      const latest = allCommentary[0];
      if (latest.timestamp && latest.timestamp !== lastProcessedBall) {
        setLastProcessedBall(latest.timestamp);
        const event = latest.event?.toUpperCase();
        if (event === "FOUR" || event === "SIX" || event === "WICKET" || event === "OUT") {
          setOverlayEvent(event);
          setTimeout(() => setOverlayEvent(null), 3500);
        }
      }
    }
  }, [allCommentary, lastProcessedBall]);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-live/90 backdrop-blur-sm px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white flex items-center justify-center gap-2.5 sticky top-0 z-[100]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        Live Stadium Feed • Real-Time Updates active
      </div>
      <AnimatePresence>
        {overlayEvent && <BigEventOverlay event={overlayEvent} />}
      </AnimatePresence>
      <SiteHeader />

      {/* Hero Score Section */}
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> All matches
          </Link>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {match.competition}
            </span>
            {match.status === "live" && <LiveBadge minute={overs + " ov"} />}
          </div>

          <div className="mt-8 flex flex-col items-center gap-8 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-10">
            <TeamHero team={match.home} side="home" />
            
            <div className="flex flex-col items-center order-first md:order-none">
              <div className="font-display text-6xl font-extrabold md:text-7xl flex justify-center tracking-tighter">
                <DigitTicker value={homeScore} />
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
                <DigitTicker value={overs} /> <span>OVERS</span>
              </div>
              <div className="mt-2.5 text-[10px] font-black text-primary animate-pulse uppercase tracking-wider">{status}</div>
              {/* Run Rate Chips */}
              {m && (
                <div className="mt-4 flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated/80 backdrop-blur px-3 py-1 text-[11px] font-bold text-foreground transition-all hover:bg-surface-elevated">
                    <TrendingUp className="h-3 w-3 text-primary" /> CRR <DigitTicker value={crr} />
                  </span>
                  {rrr && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-live/10 backdrop-blur px-3 py-1 text-[11px] font-bold text-live transition-all hover:bg-live/20">
                      <Gauge className="h-3 w-3" /> RRR <DigitTicker value={rrr} />
                    </span>
                  )}
                </div>
              )}
            </div>

            <TeamHero team={match.away} side="away" />
          </div>

          {/* Recent Overs Strip */}
          {m?.recentOvsStats && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-2">Recent:</span>
              {m.recentOvsStats.split(" ").map((ball: string, i: number) => (
                <span
                  key={i}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${
                    ball === "W" ? "bg-live text-live-foreground shadow-glow-live" :
                    ball === "4" ? "bg-primary/20 text-primary" :
                    ball === "6" ? "bg-accent/20 text-accent" :
                    ball === "0" ? "bg-surface-elevated text-muted-foreground" :
                    "bg-surface-elevated text-foreground"
                  }`}
                >
                  {ball}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6 min-w-0">

            {/* Batting & Bowling Cards */}
            {m && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Batting Card */}
                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    <Target className="h-3.5 w-3.5 text-primary" /> Batting
                  </div>
                  {/* Column Headers */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1">
                    <span>Batter</span>
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center">R</span>
                      <span className="w-6 text-center">B</span>
                      <span className="w-6 text-center">4s</span>
                      <span className="w-6 text-center">6s</span>
                      <span className="w-10 text-center">SR</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <BatterRow bat={m.batsmanStriker} isStriker />
                    {m.batsmanNonStriker.batId !== 0 && (
                      <BatterRow bat={m.batsmanNonStriker} />
                    )}
                  </div>
                  {/* Partnership */}
                  {m.partnerShip && m.partnerShip.runs > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">Partnership</span>
                      <span className="font-black tabular-nums">{m.partnerShip.runs} <span className="font-normal text-muted-foreground">({m.partnerShip.balls}b)</span></span>
                    </div>
                  )}
                </div>

                {/* Bowling Card */}
                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    <Activity className="h-3.5 w-3.5 text-accent" /> Bowling
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest mb-2 px-1">
                    <span>Bowler</span>
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center">O</span>
                      <span className="w-6 text-center">M</span>
                      <span className="w-6 text-center">R</span>
                      <span className="w-6 text-center">W</span>
                      <span className="w-10 text-center">Econ</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <BowlerDetailRow bowl={m.bowlerStriker} isStriker />
                    {m.bowlerNonStriker.bowlId !== 0 && (
                      <BowlerDetailRow bowl={m.bowlerNonStriker} />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats Row: Powerplay, Performance, DRS */}
            {m && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Powerplay */}
                {m.ppData?.pp_1 && (
                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      <Zap className="h-3.5 w-3.5 text-accent" /> Powerplay
                    </div>
                    <div className="font-display text-3xl font-extrabold tabular-nums">{m.ppData.pp_1.runsScored}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Overs {m.ppData.pp_1.ppOversFrom} – {m.ppData.pp_1.ppOversTo}
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-surface-elevated overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-primary transition-all duration-700" style={{ width: `${Math.min((m.ppData.pp_1.runsScored / 90) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Latest Performance */}
                {m.latestPerformance && m.latestPerformance.length > 0 && (
                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" /> Recent Phase
                    </div>
                    <div className="space-y-3">
                      {m.latestPerformance.map((perf: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{perf.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black tabular-nums">{perf.runs}/{perf.wkts}</span>
                            <span className="text-[10px] text-muted-foreground">({(perf.runs / (perf.label.includes("5") ? 5 : 3)).toFixed(1)} rpo)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DRS */}
                {m.matchUdrs && (
                  <div className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                      <Shield className="h-3.5 w-3.5 text-live" /> DRS Review
                    </div>
                    <div className="space-y-3">
                      <DrsRow label={m.matchScoreDetails?.matchTeamInfo?.[0]?.battingTeamShortName || "Team 1"} remaining={m.matchUdrs.team1Remaining} success={m.matchUdrs.team1Successful} fail={m.matchUdrs.team1Unsuccessful} />
                      <DrsRow label={m.matchScoreDetails?.matchTeamInfo?.[0]?.bowlingTeamShortName || "Team 2"} remaining={m.matchUdrs.team2Remaining} success={m.matchUdrs.team2Successful} fail={m.matchUdrs.team2Unsuccessful} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Last Wicket */}
            {m?.lastWicket && (
              <div className="rounded-2xl border border-live/30 bg-live/5 p-4 flex items-start gap-3">
                <CircleDot className="h-4 w-4 text-live shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-live mb-1">Last Wicket</div>
                  <p className="text-sm text-foreground/90 font-semibold">{m.lastWicket}</p>
                </div>
              </div>
            )}

            {/* Toss Info */}
            {m?.matchScoreDetails?.tossResults && (
              <div className="rounded-2xl border border-border/60 bg-surface-elevated/50 p-4 flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{m.matchScoreDetails.tossResults.tossWinnerName}</span> won the toss and chose to <span className="font-bold text-foreground">{m.matchScoreDetails.tossResults.decision}</span>
                </p>
              </div>
            )}

            <PredictionPoll match={match} />

            {/* Commentary */}
            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight">Ball-by-Ball Commentary</h2>
                  <p className="text-sm text-muted-foreground">{allCommentary.length} deliveries tracked</p>
                </div>
              </div>

              <div className="space-y-3">
                {allCommentary.map((comm: any, i: number) => (
                  <div key={comm.timestamp || i} className="rounded-2xl border border-border/60 bg-surface-elevated p-4 relative overflow-hidden group transition-all hover:border-primary/30">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${
                      comm.event === "WICKET" ? "bg-live" :
                      comm.event === "FOUR" ? "bg-primary" :
                      comm.event === "SIX" ? "bg-accent" :
                      "bg-border/60 group-hover:bg-primary/40"
                    }`} />
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">{comm.overNumber}</span>
                        <span className="text-[10px] text-muted-foreground">{comm.batTeamName}</span>
                      </div>
                      {comm.event === "WICKET" && (
                        <span className="flex items-center gap-1 text-[10px] font-black bg-live/10 text-live px-2 py-0.5 rounded uppercase">
                          <Zap className="h-3 w-3 fill-current" /> Wicket
                        </span>
                      )}
                      {comm.event === "FOUR" && (
                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">FOUR</span>
                      )}
                      {comm.event === "SIX" && (
                        <span className="text-[10px] font-black bg-accent/10 text-accent px-2 py-0.5 rounded uppercase">SIX</span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 pl-1">
                      {comm.commText.replace(/B0\$|B1\$/g, "")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-hidden">
            <div className="h-[600px] lg:h-[calc(100%-260px)] lg:min-h-[400px]">
              <ChatPanel />
            </div>
            <div className="hidden lg:block">
              <OnlineFans />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* ─── Sub-components ─── */

function BatterRow({ bat, isStriker }: { bat: any; isStriker?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-1 py-1.5 ${isStriker ? "bg-primary/5" : ""}`}>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm font-bold text-foreground truncate max-w-[100px]">{bat.batName}</span>
        {isStriker && <span className="text-primary font-black text-xs">*</span>}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="w-6 flex justify-center font-black"><DigitTicker value={bat.batRuns} /></div>
        <div className="w-6 flex justify-center text-muted-foreground"><DigitTicker value={bat.batBalls} /></div>
        <div className="w-6 flex justify-center text-primary font-semibold"><DigitTicker value={bat.batFours} /></div>
        <div className="w-6 flex justify-center text-accent font-semibold"><DigitTicker value={bat.batSixes} /></div>
        <div className="w-10 flex justify-center text-xs text-muted-foreground"><DigitTicker value={bat.batStrikeRate.toFixed(1)} /></div>
      </div>
    </div>
  );
}

function BowlerDetailRow({ bowl, isStriker }: { bowl: any; isStriker?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-1 py-1.5 ${isStriker ? "bg-accent/5" : ""}`}>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-sm font-bold text-foreground truncate max-w-[100px]">{bowl.bowlName}</span>
        {isStriker && <span className="text-accent font-black text-xs">*</span>}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="w-6 flex justify-center text-muted-foreground"><DigitTicker value={bowl.bowlOvs} /></div>
        <div className="w-6 flex justify-center text-muted-foreground"><DigitTicker value={bowl.bowlMaidens} /></div>
        <div className="w-6 flex justify-center font-semibold"><DigitTicker value={bowl.bowlRuns} /></div>
        <div className="w-6 flex justify-center font-black text-primary"><DigitTicker value={bowl.bowlWkts} /></div>
        <div className="w-10 flex justify-center text-xs text-muted-foreground"><DigitTicker value={bowl.bowlEcon.toFixed(1)} /></div>
      </div>
    </div>
  );
}

function DrsRow({ label, remaining, success, fail }: { label: string; remaining: number; success: number; fail: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-black text-primary">{remaining}</span>
        <span className="text-[10px] text-muted-foreground">left</span>
        {success > 0 && <span className="text-[10px] text-primary font-bold">✓{success}</span>}
        {fail > 0 && <span className="text-[10px] text-live font-bold">✗{fail}</span>}
      </div>
    </div>
  );
}

function TeamHero({ team, side }: { team: { name: string; shortName: string; emoji: string }; side: "home" | "away" }) {
  return (
    <div className={`flex items-center gap-3 ${side === "away" ? "flex-row-reverse text-right" : ""} min-w-0`}>
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface-elevated text-3xl shadow-elevated md:h-20 md:w-20 md:text-4xl">
        {team.emoji}
      </div>
      <div className="min-w-0">
        <div className="font-display text-2xl font-extrabold leading-tight md:text-3xl">{team.shortName}</div>
        <div className="truncate text-sm text-muted-foreground">{team.name}</div>
      </div>
    </div>
  );
}
