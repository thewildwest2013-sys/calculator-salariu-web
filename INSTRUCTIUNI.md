# Patch v14 — un credit pentru fiecare calcul

## Regula implementată

- Un credit efectuează **un singur calcul salarial complet**.
- Creditele pot fi folosite numai pe profilul principal (`default`/`main`).
- Orice calcul nou sau recalculare consumă încă un credit.
- Un rezultat deja salvat poate fi redeschis din Istoric fără consum.
- Premium Personal și planurile Business active includ calcule nelimitate.
- Rezultatul salarial este calculat pe server, nu în componenta din browser.
- Endpointul vechi de deblocare lunară este dezactivat.

## Fișiere

Copiază conținutul patch-ului peste rădăcina proiectului și acceptă înlocuirea fișierelor.

Nu este necesar `npm install`.

## Verificare locală

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run lint
npm run build
npm run dev
```

## Publicarea regulilor Firestore

Patch-ul adaugă colecția protejată `users/{uid}/calculations`.

```powershell
npx firebase-tools deploy --only firestore:rules --project calculator-salariu-60957
```

În Firebase → Firestore → Rules trebuie să apară o versiune publicată cu data curentă.

## Git / Vercel

```powershell
git add app/api/calculations/run/route.ts app/api/calculations/unlock/route.ts app/calculator-universal/page.tsx app/history/page.tsx app/dashboard/page.tsx app/pricing/page.tsx app/terms/page.tsx app/page.tsx app/login/page.tsx firestore.rules
git commit -m "Change credits to one per calculation"
git push
```

Vercel pornește automat deploymentul după `git push`.

## Test obligatoriu

1. Cont cu 1 credit → efectuează calculul → `credits` scade de la 1 la 0.
2. Redeschide rezultatul din Istoric → nu scade niciun credit.
3. Modifică o valoare → rezultatul se maschează.
4. Apasă iar calculare fără credite → apare cererea de cumpărare.
5. Cont Premium activ → calculele nu scad credite.
6. Profil secundar fără Premium → API răspunde `PROFILE_REQUIRES_PREMIUM`.
