# Stadiu implementare – 14 iulie 2026

## Implementat și verificat prin `npm run lint` + `npm run build`

- interfață globală responsive, Dark/Light și RO/EN;
- login premium, înregistrare, resetare parolă și Google Sign-In în cod;
- homepage nou și navigație pentru desktop/tabletă/telefon;
- calculator universal: program normal, part-time, rotație 2M–2A–2N–4L și personalizat;
- ture peste miezul nopții, inclusiv 23:00–07:00, cu spor legal sau pe toată tura;
- calendar cu zile lucrate, L, CO, CM, ANV, ABS, CFP, AD, EFP, UF, RC, CI, CP și tip personalizat;
- taxe, sporuri, beneficii și reguli modificabile;
- motor fiscal versionat și avertismente pentru program/repaus;
- profiluri personale și istoric lunar;
- primul calcul gratuit, credite și deblocare o singură dată pe profil/lună, controlate server-side;
- planuri personale și Business, checkout Stripe, webhook și portal de upgrade pentru abonament existent;
- companie, angajați activi/arhivați și limite pe plan;
- asistent AI cu Cloudflare principal și Groq fallback;
- pagini bilingve Privacy, Terms, Cookies, Retention, AI Policy, DPA, Subprocessors și Trust;
- reguli Firestore/Storage, CSP și antete de securitate;
- sesiune legată de dispozitiv și blocare de 48h la schimbarea browserului;
- ștergere server-side a contului și anularea reînnoirii Stripe;
- eliminarea reclamelor Monetag, a APK-ului și a Service Worker-ului de publicitate;
- actualizare Next.js și Firebase Admin; build de producție reușit.

## Necesită configurare externă după copiere

- Firebase env, Authorized Domains și publicarea regulilor;
- produsele/prețurile Stripe, webhook și Customer Portal;
- Cloudflare Workers AI/Groq;
- email tranzacțional pentru invitații și alerte;
- App Check și MFA în Firebase Identity Platform, dacă se activează.

## Nu este încă sigur/activ pentru utilizare oficială

- REGES și D112;
- stocare CNP/IBAN/documente medicale;
- criptare la nivel de câmp și management KMS;
- scanare malware și linkuri temporare pentru documente Business;
- invitații email și flux complet de acceptare;
- export PDF/Excel oficial și portal complet al angajatului;
- reguli speciale exhaustive pentru sector public, transport și gărzi medicale.

Aceste module necesită integrare cu servicii externe, teste specifice, analiză juridică și date de configurare care nu pot fi inventate în cod.
