// Dummy data powering the UI shell. Will be replaced with Lovable Cloud realtime queries.

export type MatchStatus = "live" | "upcoming" | "completed";

export type Team = {
  id: string;
  name: string;
  shortName: string;
  primary: string; // oklch / hex
  emoji: string;
};

export type Match = {
  id: string;
  competition: string;
  home: Team;
  away: Team;
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  minute?: number;
  startsAt: string; // ISO
  venue: string;
  viewers: number;
};

export type MatchEventType = "GOAL" | "YELLOW" | "RED" | "SUB" | "VAR" | "KICKOFF" | "HALFTIME" | "FULLTIME";

export type MatchEvent = {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  player?: string;
  team?: "home" | "away";
  description: string;
  reactions: { fire: number; clap: number; shock: number; laugh: number };
  threadCount: number;
};

export type ChatMessage = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  fanOf?: string; // team shortName
  text: string;
  sentAt: string; // ISO
  reactions?: { emoji: string; count: number }[];
};

const teams: Record<string, Team> = {
  bar: { id: "bar", name: "FC Barcelona", shortName: "BAR", primary: "#a50044", emoji: "🔵🔴" },
  rma: { id: "rma", name: "Real Madrid", shortName: "RMA", primary: "#febe10", emoji: "⚪️" },
  liv: { id: "liv", name: "Liverpool FC", shortName: "LIV", primary: "#c8102e", emoji: "🔴" },
  mci: { id: "mci", name: "Manchester City", shortName: "MCI", primary: "#6caddf", emoji: "🩵" },
  bay: { id: "bay", name: "Bayern Munich", shortName: "BAY", primary: "#dc052d", emoji: "🔴" },
  psg: { id: "psg", name: "Paris SG", shortName: "PSG", primary: "#004170", emoji: "🔵" },
  ars: { id: "ars", name: "Arsenal", shortName: "ARS", primary: "#ef0107", emoji: "🔴" },
  int: { id: "int", name: "Inter Milan", shortName: "INT", primary: "#0068a8", emoji: "🔵⚫️" },
  rcb: { id: "rcb", name: "Royal Challengers Bengaluru", shortName: "RCB", primary: "#e01e37", emoji: "❤️" },
  dc: { id: "dc", name: "Delhi Capitals", shortName: "DC", primary: "#004c97", emoji: "💙" },
};

export const matches: Match[] = [
  {
    id: "151807",
    competition: "IPL 2026",
    home: teams.rcb,
    away: teams.dc,
    status: "live",
    homeScore: 146,
    awayScore: 0,
    minute: 15,
    startsAt: new Date().toISOString(),
    venue: "M. Chinnaswamy Stadium",
    viewers: 245_200,
  },
  {
    id: "m-elclasico",
    competition: "LaLiga · Matchday 12",
    home: teams.bar,
    away: teams.rma,
    status: "live",
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    startsAt: new Date(Date.now() - 67 * 60_000).toISOString(),
    venue: "Spotify Camp Nou",
    viewers: 184_502,
  },
  {
    id: "m-livmci",
    competition: "Premier League · Matchday 11",
    home: teams.liv,
    away: teams.mci,
    status: "live",
    homeScore: 1,
    awayScore: 1,
    minute: 38,
    startsAt: new Date(Date.now() - 38 * 60_000).toISOString(),
    venue: "Anfield",
    viewers: 142_310,
  },
  {
    id: "m-baypsg",
    competition: "UCL · Group Stage",
    home: teams.bay,
    away: teams.psg,
    status: "upcoming",
    homeScore: 0,
    awayScore: 0,
    startsAt: new Date(Date.now() + 2 * 3600_000).toISOString(),
    venue: "Allianz Arena",
    viewers: 0,
  },
  {
    id: "m-arsint",
    competition: "UCL · Group Stage",
    home: teams.ars,
    away: teams.int,
    status: "upcoming",
    homeScore: 0,
    awayScore: 0,
    startsAt: new Date(Date.now() + 26 * 3600_000).toISOString(),
    venue: "Emirates Stadium",
    viewers: 0,
  },
  {
    id: "m-rmaliv",
    competition: "UCL · Group Stage",
    home: teams.rma,
    away: teams.liv,
    status: "completed",
    homeScore: 3,
    awayScore: 2,
    startsAt: new Date(Date.now() - 26 * 3600_000).toISOString(),
    venue: "Santiago Bernabéu",
    viewers: 220_400,
  },
  {
    id: "m-mcibar",
    competition: "Friendly",
    home: teams.mci,
    away: teams.bar,
    status: "completed",
    homeScore: 1,
    awayScore: 1,
    startsAt: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(),
    venue: "Etihad Stadium",
    viewers: 98_120,
  },
];

export function getMatch(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export const eventsByMatch: Record<string, MatchEvent[]> = {
  "m-elclasico": [
    {
      id: "e1",
      matchId: "m-elclasico",
      type: "KICKOFF",
      minute: 0,
      description: "Kick-off! El Clásico is underway at Camp Nou.",
      reactions: { fire: 412, clap: 88, shock: 12, laugh: 4 },
      threadCount: 3,
    },
    {
      id: "e2",
      matchId: "m-elclasico",
      type: "GOAL",
      minute: 14,
      player: "Lamine Yamal",
      team: "home",
      description: "GOAL! Yamal cuts inside and curls it top corner. 1-0 Barça.",
      reactions: { fire: 2840, clap: 612, shock: 540, laugh: 22 },
      threadCount: 47,
    },
    {
      id: "e3",
      matchId: "m-elclasico",
      type: "YELLOW",
      minute: 28,
      player: "Jude Bellingham",
      team: "away",
      description: "Yellow card for Bellingham — late challenge in midfield.",
      reactions: { fire: 88, clap: 14, shock: 210, laugh: 320 },
      threadCount: 9,
    },
    {
      id: "e4",
      matchId: "m-elclasico",
      type: "GOAL",
      minute: 41,
      player: "Vinícius Jr.",
      team: "away",
      description: "GOAL! Vinícius levels it with a cool finish across the keeper. 1-1.",
      reactions: { fire: 1980, clap: 440, shock: 380, laugh: 16 },
      threadCount: 38,
    },
    {
      id: "e5",
      matchId: "m-elclasico",
      type: "HALFTIME",
      minute: 45,
      description: "Half-time at Camp Nou. All square, 1-1.",
      reactions: { fire: 120, clap: 240, shock: 30, laugh: 18 },
      threadCount: 12,
    },
    {
      id: "e6",
      matchId: "m-elclasico",
      type: "GOAL",
      minute: 58,
      player: "Robert Lewandowski",
      team: "home",
      description: "GOAL! Lewa heads it home from a Pedri cross. Barça back in front, 2-1!",
      reactions: { fire: 3120, clap: 870, shock: 410, laugh: 12 },
      threadCount: 62,
    },
    {
      id: "e7",
      matchId: "m-elclasico",
      type: "VAR",
      minute: 64,
      description: "VAR check on a possible Madrid penalty… NO PENALTY. Play continues.",
      reactions: { fire: 220, clap: 180, shock: 940, laugh: 540 },
      threadCount: 88,
    },
  ],
  "m-livmci": [
    {
      id: "l1",
      matchId: "m-livmci",
      type: "KICKOFF",
      minute: 0,
      description: "We're underway at Anfield.",
      reactions: { fire: 280, clap: 60, shock: 4, laugh: 2 },
      threadCount: 2,
    },
    {
      id: "l2",
      matchId: "m-livmci",
      type: "GOAL",
      minute: 12,
      player: "Erling Haaland",
      team: "away",
      description: "GOAL! Haaland slides it past Alisson. City lead 0-1.",
      reactions: { fire: 1820, clap: 410, shock: 320, laugh: 18 },
      threadCount: 31,
    },
    {
      id: "l3",
      matchId: "m-livmci",
      type: "GOAL",
      minute: 31,
      player: "Mohamed Salah",
      team: "home",
      description: "GOAL! Salah equalises with a trademark curler. 1-1!",
      reactions: { fire: 2240, clap: 520, shock: 290, laugh: 10 },
      threadCount: 44,
    },
  ],
};

export const chatSeed: ChatMessage[] = [
  {
    id: "c1",
    userId: "u1",
    username: "culerForever",
    avatar: "🦁",
    fanOf: "BAR",
    text: "Yamal is playing like he's 25 years old, not 17. Insane.",
    sentAt: new Date(Date.now() - 6 * 60_000).toISOString(),
    reactions: [{ emoji: "🔥", count: 24 }],
  },
  {
    id: "c2",
    userId: "u2",
    username: "madridista10",
    avatar: "👑",
    fanOf: "RMA",
    text: "VAR robbed us. Clear penalty. CLEAR.",
    sentAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    reactions: [
      { emoji: "😡", count: 41 },
      { emoji: "🤡", count: 88 },
    ],
  },
  {
    id: "c3",
    userId: "u3",
    username: "neutralFan",
    avatar: "🍿",
    text: "Best Clásico in years. The pace is unreal.",
    sentAt: new Date(Date.now() - 4 * 60_000).toISOString(),
    reactions: [{ emoji: "💯", count: 56 }],
  },
  {
    id: "c4",
    userId: "u4",
    username: "lewaGOAT",
    avatar: "⚽",
    fanOf: "BAR",
    text: "Lewandowski header was perfection. Pedri's delivery 🤌",
    sentAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    reactions: [{ emoji: "🐐", count: 33 }],
  },
  {
    id: "c5",
    userId: "u5",
    username: "vini_jr_07",
    avatar: "💛",
    fanOf: "RMA",
    text: "We're not done. 25 minutes left, Vini cooking 🔥",
    sentAt: new Date(Date.now() - 60_000).toISOString(),
    reactions: [{ emoji: "🔥", count: 19 }],
  },
];

export const onlineFans = [
  { id: "u1", name: "culerForever", avatar: "🦁", team: "BAR" },
  { id: "u2", name: "madridista10", avatar: "👑", team: "RMA" },
  { id: "u3", name: "neutralFan", avatar: "🍿" },
  { id: "u4", name: "lewaGOAT", avatar: "⚽", team: "BAR" },
  { id: "u5", name: "vini_jr_07", avatar: "💛", team: "RMA" },
  { id: "u6", name: "pedri_magic", avatar: "✨", team: "BAR" },
  { id: "u7", name: "halamadrid", avatar: "🤍", team: "RMA" },
  { id: "u8", name: "tikitaka", avatar: "🎯", team: "BAR" },
];

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
