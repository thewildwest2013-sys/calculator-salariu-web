import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function checkUsage(uid: string, isPremium: boolean) {
  const ref = doc(db, "users", uid, "usage", "main");
  const snap = await getDoc(ref);

  const now = Date.now();

  let data = snap.exists()
    ? snap.data()
    : {
        count: 0,
        windowStart: now,
      };

  // reset după 24h
  if (now - data.windowStart > DAY_MS) {
    data = {
      count: 0,
      windowStart: now,
    };
  }

  const limit = isPremium ? 10 : 2;

  if (data.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  return {
    allowed: true,
    remaining: limit - data.count,
  };
}

export async function increaseUsage(uid: string) {
  const ref = doc(db, "users", uid, "usage", "main");
  const snap = await getDoc(ref);

  const now = Date.now();

  let data = snap.exists()
    ? snap.data()
    : {
        count: 0,
        windowStart: now,
      };

  if (now - data.windowStart > DAY_MS) {
    data = {
      count: 0,
      windowStart: now,
    };
  }

  data.count += 1;

  await setDoc(ref, data);
}