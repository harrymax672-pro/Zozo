# Frutza : Wadala — Live Products + Admin API

## Architecture
Customer website -> `/api/products` -> Supabase `products` table.
Admin login -> `/api/admin/login` -> HttpOnly session cookie -> protected POST/PATCH/DELETE `/api/products`.

## 1. Supabase
Create a Supabase project.
Open SQL Editor and run:
1. `supabase/schema.sql`
2. `supabase/seed.sql`

The Vercel server uses the Supabase service-role key, so the key is never placed in `index.html`.

## 2. Vercel Environment Variables
Add these in Vercel Project Settings -> Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Redeploy after adding variables.

## 3. GitHub
Upload the extracted project files to the repository root. Do not upload the `.env` file or any secret key.

## 4. Admin
Open the live Frutza website, click the lock icon, and use the `ADMIN_PASSWORD`.
Adding, editing, stock toggling, and deleting products writes to Supabase and therefore becomes live for all visitors.

## 5. API
Public:
- `GET /api/products`

Admin session required:
- `POST /api/products`
- `PATCH /api/products?id=PRODUCT_ID`
- `DELETE /api/products?id=PRODUCT_ID`
- `POST /api/admin/login`
