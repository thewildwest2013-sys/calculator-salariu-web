# Calculator Salariu Web

Platformă web Next.js pentru calcule salariale personale și Business.

## Comenzi

```bash
npm ci
npm run dev
npm run lint
npm run build
```

## Configurare

1. Copiază `.env.example` în `.env.local` și completează valorile.
2. Activează Email/Password și Google în Firebase Authentication.
3. Adaugă domeniul Vercel în Firebase Authentication → Authorized domains.
4. Publică regulile cu `firebase deploy --only firestore:rules,storage`.
5. Creează produsele/prețurile Stripe și copiază ID-urile `price_...` în Vercel.
6. Configurează webhook-ul Stripe către `/api/stripe-webhook`.
7. Pentru AI, configurează Cloudflare Workers AI sau Groq în variabilele de mediu.

## Important

- Nu salva `.env.local`, chei service-account, CNP-uri ori documente medicale în Git.
- Modulul pentru date sensibile este intenționat blocat în Storage Rules până la implementarea fluxului server-side, criptării suplimentare și scanării fișierelor.
- REGES, D112, MFA, invitațiile email, exporturile oficiale și stocarea documentelor medicale nu sunt încă activate ca funcții oficiale.
