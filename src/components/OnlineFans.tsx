import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export function OnlineFans() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    const usersRef = ref(db, "online_users");
    return onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val,
        }));
        setOnlineUsers(list);
      } else {
        setOnlineUsers([]);
      }
    });
  }, []);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold">In the room</h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {onlineUsers.length} online
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {onlineUsers.length === 0 && (
          <li className="text-xs text-muted-foreground italic">You are the first fan here!</li>
        )}
        {onlineUsers.map((f) => (
          <li key={f.id} className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated text-sm">
                {f.avatar || "👤"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
            </div>
            <span className="flex-1 truncate text-sm text-foreground">{f.username}</span>
            {f.team && (
              <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {f.team}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
