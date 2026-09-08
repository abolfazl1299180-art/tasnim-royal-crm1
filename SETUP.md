# راه‌اندازی Tasnim Royal CRM

## 1. Supabase

1. یک پروژه Supabase بسازید.
2. مقدارهای `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` را در `.env.local` قرار دهید.
3. فایل `supabase/migrations/001_initial_schema.sql` را در SQL Editor اجرا کنید.

## 2. حساب اصلی

حساب اصلی CRM باید با این مشخصات ایجاد شود:

- Username: `tasnimroyal`
- Role: `admin`

رمز عبور نباید در GitHub یا داخل سورس‌کد ذخیره شود. حساب Auth را در Supabase ایجاد کنید و در metadata کاربر مقدار `username` را برابر `tasnimroyal` قرار دهید. Trigger دیتابیس هنگام ایجاد اولین کاربر، نقش او را به‌صورت خودکار `admin` می‌کند.

## 3. اجرای محلی

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

سپس مسیر `/login` برای ورود و `/` برای پنل CRM استفاده می‌شود.
