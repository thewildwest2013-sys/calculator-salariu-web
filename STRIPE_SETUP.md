# Configurare Stripe

## Produse și prețuri

Creează câte un produs/preț pentru fiecare variabilă din `.env.example`:

- 1 calcul – 2,99 lei, plată unică
- 5 calcule – 8,99 lei, plată unică
- 12 calcule – 17,99 lei, plată unică
- Premium Personal – 29,99 lei/lună și 199,99 lei/an
- Business Starter – 49,99 lei/lună și 499,99 lei/an
- Business Growth – 149,99 lei/lună și 1.499,99 lei/an
- Business Pro – 299,99 lei/lună și 2.999,99 lei/an
- Business Plus – 399,99 lei/lună și 3.999,99 lei/an
- extensie +5 angajați – 29,99 lei/lună

## Webhook

Endpoint:

```text
https://DOMENIUL-TAU/api/stripe-webhook
```

Evenimente recomandate:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Copiază signing secret în `STRIPE_WEBHOOK_SECRET`.

## Upgrade/downgrade

Pentru un utilizator care are deja abonament, pagina de prețuri deschide Stripe Customer Portal. În Dashboard → Settings → Billing → Customer portal activează:

- schimbarea planului;
- anularea abonamentului;
- actualizarea metodei de plată;
- istoricul facturilor;
- produsele și prețurile Business/Personal între care permiți schimbarea.

Stripe aplică regulile de proration configurate în portal. Nu crea un al doilea cont pentru depășirea limitei.
