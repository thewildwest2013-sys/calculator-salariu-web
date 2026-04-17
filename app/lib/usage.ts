import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DAY_MS = 24 * 60 * 60 * 1000;

export type UsageStatus = {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  resetAt: number;
};

type UsageDoc = {
  count: number;
  windowStart: number;
};

function normalizeUsage(data: Partial<UsageDoc> | undefined): UsageDoc {
  const now = Date.now();
  const count = typeof data?.count === "number" ? data.count : 0;
  const windowStart =
    typeof data?.windowStart === "number" ? data.windowStart : now;

  if (now - windowStart > DAY_MS) {
    return { count: 0, windowStart: now };
  }

  return { count, windowStart };
}

export async function checkUsage(
  uid: string,
  isPremium: boolean
): Promise<UsageStatus> {
  const ref = doc(db, "users", uid, "usage", "main");
  const snap = await getDoc(ref);

  const normalized = normalizeUsage(
    snap.exists() ? (snap.data() as Partial<UsageDoc>) : undefined
  );
  const limit = isPremium ? 10 : 2;
  const used = normalized.count;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: used < limit,
    remaining,
    limit,
    used,
    resetAt: normalized.windowStart + DAY_MS,
  };
}

export async function increaseUsage(uid: string): Promise<void> {
  const ref = doc(db, "users", uid, "usage", "main");
  const snap = await getDoc(ref);

  const normalized = normalizeUsage(
    snap.exists() ? (snap.data() as Partial<UsageDoc>) : undefined
  );

  await setDoc(
    ref,
    {
      count: normalized.count + 1,
      windowStart: normalized.windowStart,
    },
    { merge: true }
  );
}

export async function getUsageStatus(
  uid: string,
  isPremium: boolean
): Promise<UsageStatus> {
  return checkUsage(uid, isPremium);
}

export async function consumeUsage(
  uid: string,
  isPremium: boolean
): Promise<UsageStatus> {
  const status = await checkUsage(uid, isPremium);

  if (!status.allowed) {
    return status;
  }

  await increaseUsage(uid);

  return getUsageStatus(uid, isPremium);
}
