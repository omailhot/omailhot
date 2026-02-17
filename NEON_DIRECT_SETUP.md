# Neon direct setup (RLS + Data API from frontend)

This project now supports direct writes from the frontend to Neon Data API (no `/api/orders` call required).

Order rules implemented:
- One order per user
- User can lock/unlock until March 1, 2026
- After the March 1 deadline, the order is treated as placed

## 1) Configure env vars

Set these in `.env`:

```bash
VITE_NEON_AUTH_URL=https://ep-xxx.neonauth.c-4.us-east-1.aws.neon.tech/neondb/auth
VITE_NEON_DATA_API_URL=https://ep-xxx.apirest.c-4.us-east-1.aws.neon.tech/neondb/rest/v1
```

## 2) Apply schema + RLS

Run `database/neon-schema.sql` in Neon SQL Editor.

It creates:
- `orders`
- `order_items`
- lock-related fields on `orders` (`is_locked`, `locked_at`, `lock_deadline_at`, `placed_at`)
- RLS policies scoped to `auth.user_id()`

## 3) Neon console checks

In Neon Data API page:
- Neon Auth enabled
- RLS enabled for `orders` and `order_items`

## 3.1) Grant admin access

After your user signs in at least once (so it exists in `app_users`), promote it:

```sql
insert into admin_users (user_id)
values ('<your_neon_auth_user_id>')
on conflict (user_id) do nothing;
```

## 4) Authentication requirement

Order submission now uses:
- `client.auth.getSession()` from `@neondatabase/neon-js`
- then inserts into `orders` and `order_items`

If there is no authenticated Neon session, the app returns the existing auth-required toast.

## 5) Run app

```bash
npm run dev
```

Then sign in via Neon Auth and place an order.
