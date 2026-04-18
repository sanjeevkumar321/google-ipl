import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAIkVF89CeVC5dDWEd5BWMh1ITPdbX-y_k",
  authDomain: "ipl-3bbf3.firebaseapp.com",
  databaseURL: "https://ipl-3bbf3-default-rtdb.firebaseio.com",
  projectId: "ipl-3bbf3",
  storageBucket: "ipl-3bbf3.firebasestorage.app",
  messagingSenderId: "607881622033",
  appId: "1:607881622033:web:376ec06b16b5d5b0ff77b0",
  measurementId: "G-8VV10GXXFT"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const liveMatchRef = ref(db, "live_match/151807");
const commentaryRef = ref(db, "commentary_history/151807");

const API_URL = "https://www.cricbuzz.com/api/mcenter/livescore/151807";
const seenTimestamps = new Set<number>();

async function fetchAndSync() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      const data = await response.json();

      // Append new commentary entries to history
      if (data.commentaryList) {
        const newEntries: Record<string, any> = {};
        for (const comm of data.commentaryList) {
          if (!seenTimestamps.has(comm.timestamp)) {
            seenTimestamps.add(comm.timestamp);
            newEntries[`t_${comm.timestamp}`] = comm;
          }
        }
        if (Object.keys(newEntries).length > 0) {
          await update(commentaryRef, newEntries);
          console.log(`[${new Date().toLocaleTimeString()}] Added ${Object.keys(newEntries).length} new commentary`);
        }
      }

      // Update live score data (without overwriting commentary history)
      await set(liveMatchRef, data);
      console.log(`[${new Date().toLocaleTimeString()}] Sync successful`);
    } else {
      console.error(`[${new Date().toLocaleTimeString()}] Fetch failed: ${response.status}`);
    }
  } catch (err) {
    console.error("Error in sync loop:", err);
  }
}

// On startup, load existing timestamps so we don't re-add old commentary
async function init() {
  const snapshot = await get(commentaryRef);
  if (snapshot.exists()) {
    const existing = snapshot.val();
    for (const key of Object.keys(existing)) {
      const ts = existing[key].timestamp;
      if (ts) seenTimestamps.add(ts);
    }
    console.log(`Loaded ${seenTimestamps.size} existing commentary entries`);
  }
}

console.log("Starting Live Score Sync Loop (Interval: 2s)...");
init().then(() => {
  setInterval(fetchAndSync, 2000);
  fetchAndSync();
});
