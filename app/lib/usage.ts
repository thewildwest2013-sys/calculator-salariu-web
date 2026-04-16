import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const DAY_MS = 24 * 60 * 60 * 1000;

export type UsageStatus = {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  windowStart: number;
  resetAt: number;
  isPremium: boolean;
};

type UsageDoc = {
  count: number;
  windowStart: number;
};

function getLimit(isPremium: boolean) {
  return isPremium ? 10 : 2;
}

async function readUsage(uid: string): Promise<UsageDoc> {
  const ref = doc(db, "users", uid, "usage", "main");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      count: 0,
      windowStart: Date.now(),
    };
  }

  const data = snap.data() as Partial<UsageDoc>;

  return {
    count: typeof data.count === "number" ? data.count : 0,
    windowStart:
      typeof data.windowStart === "number" ? data.windowStart : Date.now(),
  };
}

async function writeUsage(uid: string, data: UsageDoc) {
  const ref = doc(db, "users", uid, "usage", "main");
  await setDoc(ref, data, { merge: true });
}

function normalizeWindow(data: UsageDoc): UsageDoc {
  const now = Date.now();

  if (!data.windowStart || now - data.windowStart >= DAY_MS) {
    return {
      count: 0,
      windowStart: now,
    };
  }

  return data;
}

export async function getUsageStatus(
  uid: string,
  isPremium: boolean
): Promise<UsageStatus> {
  const raw = await readUsage(uid);
  const data = normalizeWindow(raw);
  const limit = getLimit(isPremium);
  const used = data.count;
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return {
    allowed,
    remaining,
    limit,
    used,
    windowStart: data.windowStart,
    resetAt: data.windowStart + DAY_MS,
    isPremium,
  };
}

export async function consumeUsage(
  uid: string,
  isPremium: boolean
): Promise<UsageStatus> {
  const raw = await readUsage(uid);
  const data = normalizeWindow(raw);
  const limit = getLimit(isPremium);

  if (data.count < limit) {
    data.count += 1;
    await writeUsage(uid, data);
  }

  const used = data.count;
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return {
    allowed,
    remaining,
    limit,
    used,
    windowStart: data.windowStart,
    resetAt: data.windowStart + DAY_MS,
    isPremium,
  };
}

export async function checkUsage(uid: string, isPremium: boolean) {
  return getUsageStatus(uid, isPremium);
}

export async function increaseUsage(uid: string, isPremium = false) {
  return consumeUsage(uid, isPremium);
}