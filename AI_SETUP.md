# Activare Asistent AI

## Cloudflare Workers AI – recomandat ca furnizor principal

În Cloudflare creează un API Token cu permisiune Workers AI Read/Run și completează:

```text
AI_PROVIDER=cloudflare
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_AI_API_TOKEN=...
CLOUDFLARE_AI_MODEL=@cf/meta/llama-3.1-8b-instruct
```

## Groq – fallback opțional

```text
GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant
```

Cheile sunt exclusiv server-side în Vercel. Nu folosi prefixul `NEXT_PUBLIC_`.

AI-ul nu calculează taxele și nu salvează fără confirmare. Limitele lunare sunt verificate server-side după plan.
