import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const DAY_MS = 24 * 60 * 60 * 1000;

export type UsageStatus = {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  windowStart: number;
  windowEndsAt: number;
};

function getLimit(isPremium: boolean) {
  return isPremium ? 10 : 2;
}

function normalize(data: any, isPremium: boolean): UsageStatus {
  const now = Date.now();
  const limit = getLimit(isPremium);
  let windowStart = Number(data?.windowStart || now);
  let count = Number(data?.count || 0);

  if (now - windowStart >= DAY_MS) {
    windowStart = now;
    count = 0;
  }

  const remaining = Math.max(0, limit - count);

  return {
    allowed: count < limit,
    count,
    limit,
    remaining,
    windowStart,
    windowEndsAt: windowStart + DAY_MS,
  };
}

export async function getUsageStatus(uid: string, isPremium: boolean): Promise<UsageStatus> {
  const ref = doc(db, "users", uid, "usage", "main");
  const snap = await getDoc(ref);
  return normalize(snap.exists() ? snap.data() : null, isPremium);
}

export async function consumeUsage(uid: string, isPremium: boolean): Promise<UsageStatus> {
  const ref = doc(db, "users", uid, "usage", "main");

  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    const current = normalize(snap.exists() ? snap.data() : null, isPremium);

    if (!current.allowed) {
      return current;
    }

    const nextCount = current.count + 1;
    const next: UsageStatus = {
      ...current,
      allowed: nextCount < current.limit,
      count: nextCount,
      remaining: Math.max(0, current.limit - nextCount),
    };

    transaction.set(
      ref,
      {
        count: nextCount,
        limit: current.limit,
        windowStart: current.windowStart,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return next;
  });
}
