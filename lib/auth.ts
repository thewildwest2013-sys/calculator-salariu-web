import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function registerWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const createdAt = new Date().toISOString();

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      isPremium: false,
      plan: "free",
      createdAt,
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "users", user.uid, "profile", "main"),
    {
      email: user.email,
      isPremium: false,
      plan: "free",
      createdAt,
      premiumSince: null,
      premiumSource: null,
    },
    { merge: true }
  );

  return userCredential;
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  return signOut(auth);
}
