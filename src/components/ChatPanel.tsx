import { useEffect, useRef, useState } from "react";
import { Send, Smile, ChevronDown } from "lucide-react";
import { formatRelative, type ChatMessage } from "@/lib/seed-data";
import { db } from "@/lib/firebase";
import { ref, onValue, push, set, serverTimestamp, query, limitToLast, onDisconnect } from "firebase/database";

const QUICK_EMOJIS = ["🔥", "🏏", "👏", "😱", "🐐", "🤡", "💯"];
const ANONYMOUS_AVATARS = ["👤", "🎭", "🕵️", "👤", "🌟", "🔥"];

const IPL_TEAMS = [
  { id: "RCB", name: "Royal Challengers", emoji: "❤️" },
  { id: "DC", name: "Delhi Capitals", emoji: "💙" },
  { id: "MI", name: "Mumbai Indians", emoji: "💙" },
  { id: "CSK", name: "Chennai Super Kings", emoji: "💛" },
  { id: "KKR", name: "Kolkata Knight Riders", emoji: "💜" },
  { id: "SRH", name: "Sunrisers Hyderabad", emoji: "🧡" },
  { id: "PBKS", name: "Punjab Kings", emoji: "❤️" },
  { id: "RR", name: "Rajasthan Royals", emoji: "💗" },
  { id: "GT", name: "Gujarat Titans", emoji: "💙" },
  { id: "LSG", name: "Lucknow Super Giants", emoji: "💚" },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [user, setUser] = useState<{ id: string; username: string; avatar: string } | null>(null);
  const [fanOf, setFanOf] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("fan_team");
    return null;
  });
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Initialize Local Profile and Presence (No Auth)
  useEffect(() => {
    let profile;
    const stored = localStorage.getItem("chat_profile");
    if (stored) {
      profile = JSON.parse(stored);
    } else {
      const randomId = Math.random().toString(36).slice(2, 11);
      profile = {
        id: randomId,
        username: `fan_${randomId.slice(0, 5)}`,
        avatar: ANONYMOUS_AVATARS[Math.floor(Math.random() * ANONYMOUS_AVATARS.length)],
      };
      localStorage.setItem("chat_profile", JSON.stringify(profile));
    }
    setUser(profile);

    // Presence logic (No Auth)
    const presenceRef = ref(db, `online_users/${profile.id}`);
    set(presenceRef, {
      username: profile.username,
      avatar: profile.avatar,
      lastSeen: serverTimestamp()
    });
    onDisconnect(presenceRef).remove();
  }, []);

  // 2. Listen for messages
  useEffect(() => {
    const messagesRef = query(ref(db, "match_chat"), limitToLast(50));
    return onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val,
          sentAt: val.sentAt ? new Date(val.sentAt).toISOString() : new Date().toISOString(),
        })) as ChatMessage[];
        setMessages(list.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()));
      }
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const selectTeam = (teamId: string) => {
    setFanOf(teamId);
    localStorage.setItem("fan_team", teamId);
    setShowTeamPicker(false);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || !user) return;

    const newMessageRef = push(ref(db, "match_chat"));
    await set(newMessageRef, {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      text,
      sentAt: serverTimestamp(),
      fanOf: fanOf || null,
    });

    setDraft("");
  };

  const addEmoji = (e: string) => setDraft((d) => d + e);

  const selectedTeam = IPL_TEAMS.find((t) => t.id === fanOf);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-surface px-4 py-3">
        <div>
          <h3 className="font-display text-sm font-bold">Live Match Huddle</h3>
          <p className="text-[11px] text-muted-foreground">Real-time discussion · Public Board</p>
        </div>
        {/* Team Selector Button */}
        <div className="relative">
          <button
            onClick={() => setShowTeamPicker(!showTeamPicker)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all ${
              fanOf
                ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border/60 bg-surface-elevated text-muted-foreground hover:border-primary/40 animate-pulse"
            }`}
          >
            {selectedTeam ? (
              <>
                <span>{selectedTeam.emoji}</span>
                {selectedTeam.id}
              </>
            ) : (
              "Pick Team"
            )}
            <ChevronDown className="h-3 w-3" />
          </button>

          {/* Team Picker Dropdown */}
          {showTeamPicker && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border/60 bg-card p-2 shadow-elevated">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Support your team</p>
              <div className="mt-1 max-h-48 overflow-y-auto space-y-0.5">
                {IPL_TEAMS.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => selectTeam(team.id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                      fanOf === team.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-surface-elevated text-foreground"
                    }`}
                  >
                    <span className="text-base">{team.emoji}</span>
                    <span className="font-semibold">{team.id}</span>
                    <span className="text-xs text-muted-foreground truncate">{team.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground/60 italic">
            Waiting for messages... be the first to chime in!
          </div>
        )}
        {messages.map((m) => (
          <MessageRow key={m.id} message={m} currentUserId={user?.id} />
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border/60 bg-surface p-3">
        <div className="mb-2 flex flex-wrap gap-1">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => addEmoji(e)}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-elevated text-base transition-transform hover:scale-110"
            >
              {e}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2 focus-within:border-primary/60">
            <Smile className="h-4 w-4 text-muted-foreground" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={user ? "Drop your hot take…" : "Loading..."}
              disabled={!user}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              maxLength={200}
            />
          </div>
          <button
            onClick={send}
            disabled={!draft.trim() || !user}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow-primary transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ 
  message, 
  currentUserId 
}: { 
  message: ChatMessage; 
  currentUserId?: string;
}) {
  const isMe = message.userId === currentUserId || message.userId === "me";
  const teamColor: Record<string, string> = {
    RCB: "bg-red-500/15 text-red-500",
    DC: "bg-blue-500/15 text-blue-500",
    MI: "bg-blue-600/15 text-blue-600",
    CSK: "bg-yellow-500/15 text-yellow-600",
    KKR: "bg-purple-500/15 text-purple-500",
    SRH: "bg-orange-500/15 text-orange-500",
    PBKS: "bg-red-600/15 text-red-600",
    RR: "bg-pink-500/15 text-pink-500",
    GT: "bg-cyan-500/15 text-cyan-600",
    LSG: "bg-green-500/15 text-green-500",
  };
  const badgeClass = message.fanOf ? (teamColor[message.fanOf] || "bg-primary/15 text-primary") : "";

  return (
    <div className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-base">
        {message.avatar}
      </div>
      <div className={`min-w-0 max-w-[80%] ${isMe ? "items-end" : ""} flex flex-col`}>
        <div className={`flex items-center gap-1.5 text-[11px] ${isMe ? "flex-row-reverse" : ""}`}>
          <span className="font-semibold text-foreground">{isMe ? "You" : message.username}</span>
          {message.fanOf && (
            <span className={`rounded px-1 py-0.5 font-bold uppercase tracking-wider text-[9px] ${badgeClass}`}>
              {message.fanOf}
            </span>
          )}
          <span className="text-muted-foreground">{formatRelative(message.sentAt)}</span>
        </div>
        <div
          className={`group relative mt-1 rounded-2xl px-3 py-2 text-sm leading-snug ${
            isMe ? "bg-gradient-primary text-primary-foreground" : "bg-surface-elevated text-foreground"
          }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  );
}
