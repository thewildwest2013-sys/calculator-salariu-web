import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function ensureUserAccountDocument(user: User) {
  const now = new Date().toISOString();
  const base = {
    email: user.email,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    emailVerified: user.emailVerified,
    updatedAt: now,
    lastLoginAt: now,
  };

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    await setDoc(userRef, base, { merge: true });
  } else {
    await setDoc(userRef, {
      ...base,
      accountType: "personal",
      plan: "free",
      credits: 0,
      freeCalculationUsed: true,
      createdAt: serverTimestamp(),
    });
  }

  const profileRef = doc(db, "users", user.uid, "profile", "main");
  const profileSnap = await getDoc(profileRef);
  await setDoc(profileRef, profileSnap.exists() ? base : {
    ...base,
    name: user.displayName || "Profil principal",
    plan: "free",
    accountType: "personal",
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function registerWithEmail(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserAccountDocument(userCredential.user);
  await sendEmailVerification(userCredential.user);
  await signOut(auth);
  return userCredential;
}

export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await userCredential.user.reload();
  if (!auth.currentUser?.emailVerified) {
    await signOut(auth);
    throw new Error("EMAIL_NOT_VERIFIED");
  }
  await ensureUserAccountDocument(auth.currentUser);
  return userCredential;
}

export async function sendResetPasswordEmail(email: string) { return sendPasswordResetEmail(auth, email); }
export async function logoutUser() { return signOut(auth); }

export function mapAuthError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: unknown }).code || "") : "";
  const message = error instanceof Error ? error.message : "";
  if (message.includes("EMAIL_NOT_VERIFIED")) return "Trebuie să confirmi adresa de email. Verifică Inbox și Spam/Junk.";
  if (message.includes("DEVICE_LOCKED")) return "Contul este activ pe alt browser. Mutarea este blocată temporar; deblocheaz-o din pagina Securitate a browserului activ.";
  switch (code) {
    case "auth/invalid-credential": case "auth/wrong-password": case "auth/user-not-found": return "Emailul sau parola nu sunt corecte.";
    case "auth/invalid-email": return "Adresa de email nu este validă.";
    case "auth/too-many-requests": return "Prea multe încercări. Încearcă din nou peste câteva minute.";
    case "auth/missing-password": return "Introdu parola.";
    case "auth/popup-closed-by-user": return "Fereastra Google a fost închisă înainte de finalizare.";
    case "auth/popup-blocked": return "Browserul a blocat fereastra Google. Permite pop-up-urile și încearcă din nou.";
    case "auth/unauthorized-domain": return "Domeniul site-ului nu este autorizat în Firebase Authentication.";
    case "auth/account-exists-with-different-credential": return "Există deja un cont cu această adresă. Intră folosind metoda inițială, apoi conectează Google din setările contului.";
    default: return message || "A apărut o eroare la autentificare.";
  }
}
