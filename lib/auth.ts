import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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

export async function sendResetPasswordEmail(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logoutUser() {
  return signOut(auth);
}

export function mapAuthError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code || "")
      : "";

  const message = error instanceof Error ? error.message : "";

  if (message.includes("DEVICE_LOCKED")) {
    return "Contul este deja activ pe alt browser sau dispozitiv. Îl poți muta după expirarea ferestrei de 48 de ore sau din pagina Security de pe dispozitivul actual.";
  }

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Emailul sau parola nu sunt corecte.";
    case "auth/invalid-email":
      return "Adresa de email nu este validă.";
    case "auth/too-many-requests":
      return "Prea multe încercări de autentificare. Încearcă din nou peste câteva minute.";
    case "auth/missing-password":
      return "Introdu parola.";
    default:
      return message || "A apărut o eroare la autentificare.";
  }
}
