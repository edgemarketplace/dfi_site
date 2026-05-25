# DFI publishable key verification checklist

Target backend:
- https://api.defendfreedomindustries.com

Target sales channel:
- sc_01KSC4Y3N0KZVVC5P7NBXJZ27S

Storefronts that must use the key:
- https://dfi-site-storefront.vercel.app
- https://defendfreedomindustries.com
- https://www.defendfreedomindustries.com

## Goal
Confirm that the publishable key used by the storefront is:
1. present in the production Medusa backend database
2. active / not revoked
3. linked to sales channel `sc_01KSC4Y3N0KZVVC5P7NBXJZ27S`
4. the same value configured as `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in Vercel

## Important warning
`MEDUSA_PUBLISHABLE_KEY` in backend env is not authoritative by itself.
A Medusa publishable key must exist in Medusa's API key records and be linked to a sales channel.

## Verification steps

### 1. Check the storefront symptom
From any machine:

```bash
curl -i https://api.defendfreedomindustries.com/store/regions \
  -H "x-publishable-api-key: <candidate_key>"
```

Expected:
- `200 OK` means the key is accepted
- `400` with `A valid publishable key is required` means the key is invalid for that backend

### 2. Verify in Medusa Admin
Open the admin for the production backend and inspect:
- Settings
- Publishable API Keys

Confirm:
- the key exists
- it is not revoked
- it is associated with the DFI sales channel

### 3. Verify the sales channel mapping
Open the key details and confirm the linked sales channel includes:
- `sc_01KSC4Y3N0KZVVC5P7NBXJZ27S`

If it is linked to another channel only, the storefront may still fail depending on data access path.

### 4. If the key is missing
Create a new publishable API key in the production backend, then link it to the DFI sales channel.

### 5. Update Vercel
Set in Vercel project env:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.defendfreedomindustries.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<active_key_from_production_medusa>
NEXT_PUBLIC_BASE_URL=https://dfi-site-storefront.vercel.app
NEXT_PUBLIC_VERCEL_URL=https://dfi-site-storefront.vercel.app
NEXT_PUBLIC_DEFAULT_REGION=dk
```

### 6. Redeploy and verify
After saving env vars, redeploy the storefront.

Expected:
- Next.js build no longer fails during page-data collection
- `/store/regions` succeeds from middleware/build time

## Repo note
This repo seeds a default publishable key and links it to a default sales channel in:
- `apps/backend/src/migration-scripts/initial-data-seed.ts`

That helps local/bootstrap environments, but production still depends on the actual database serving `api.defendfreedomindustries.com`.
