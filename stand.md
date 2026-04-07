# Stand: Stripe Checkout + Billing Flow

**Datum:** 07.04.2026  
**Status:** Checkout, Redirect, Webhook-Sync und Profil-Refresh funktionieren im Testmodus

---

## Aktueller Stand

- Checkout startet aus dem Frontend sauber
- Stripe Testkauf laeuft durch
- Redirect zurueck in die App funktioniert
- Supabase Edge Functions sind erreichbar
- Stripe Webhook liefert 200 und verarbeitet Events
- Profil wird nach `checkout=success` direkt neu geladen
- Pro-Status erscheint nach Rueckkehr sofort im Frontend

---

## Relevante Konfiguration

### Frontend ENV

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### Supabase / Functions ENV

- `APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Aktuelle Test-Price

- `.env.example` verwendet aktuell `STRIPE_PRICE_PRO_MONTHLY=price_1TJBQeGihTJC34bw21m9ewMf`

---

## Deploy Hinweise

### Checkout / Portal Functions

```bash
npx supabase functions deploy create-checkout-session
npx supabase functions deploy create-portal-session
```

### Webhook Function

```bash
npx supabase functions deploy stripe-webhook
```

### Wichtiger Webhook Endpoint

- `https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`

---

## Wichtige technische Fixes

### Auth / Checkout

- Edge Functions lesen den Bearer-Token defensiv aus dem Request
- `getUser(token)` laeuft ueber einen separaten Auth-Client
- Fehlerpfade liefern JSON mit `stage`
- Frontend liest Function-Error-Responses explizit aus

### Webhook / Billing Sync

- `customer.subscription.created` schreibt bei fruehem Status wie `incomplete` keinen aggressiven Free-Downgrade mehr
- finale Aktivierung kommt ueber:
  - `customer.subscription.updated`
  - `invoice.paid`
- finaler Downgrade kommt primär ueber:
  - `customer.subscription.deleted`

### Frontend / Profilstatus

- Profil-Lesen ist robuster und leitet den effektiven Pro-Zugriff aus Billing-Daten ab
- `checkout=success` invalidiert die Profil-Query und laedt das Profil direkt neu

---

## Relevante Dateien

```text
src/components/ui/UpgradePrompt.tsx
src/features/profile/profileService.ts
src/features/profile/types.ts
src/features/profile/useProfile.ts
src/pages/ProfilePage.tsx

supabase/functions/create-checkout-session/index.ts
supabase/functions/create-portal-session/index.ts
supabase/functions/stripe-webhook/index.ts
supabase/functions/_shared/billing.ts
supabase/functions/_shared/stripe.ts
```

---

## Naechste Tests

1. Billing Portal oeffnen
2. Kuendigung im Testmodus ausloesen
3. Rueckstufung auf Free pruefen
4. Failed Payment Verhalten pruefen
5. Webhook-Logs fuer `customer.subscription.deleted` und `invoice.payment_failed` verifizieren

