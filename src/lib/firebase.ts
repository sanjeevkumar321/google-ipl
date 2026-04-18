import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

// Match Data Helpers
export const liveMatchRef = ref(db, "live_match/151807");
export const updateLiveMatch = (data: any) => set(liveMatchRef, data);

export default app;
