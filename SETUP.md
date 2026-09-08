# راه‌اندازی Tasnim Royal CRM

## وضعیت
CRM شامل بانک اطلاعات مخاطبین، پیگیری‌ها، وظایف، دوره‌ها، ثبت‌نام‌ها، پرداخت‌ها، قیف فروش، برچسب‌گذاری، تاریخچه تعاملات و Audit Log است.

## 1. Supabase

1. یک پروژه Supabase بسازید.
2. مقدارهای `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_ANON_KEY` را در `.env.local` قرار دهید.
3. فایل‌های migration را به‌ترتیب نام اجرا کنید:
   - `001_initial_schema.sql`
   - `002_harden_rls.sql`
   - `003_business_rules.sql`
   - `004_admin_safety.sql`
   - `004_harden_contacts_rls.sql`
   - `006_contact_phone_normalization.sql`
   - `007_crm_growth.sql`

Migration 006 شماره موبایل ایران را استاندارد و از ثبت تکراری جلوگیری می‌کند. Migration 007 قیف فروش، تگ‌ها، Audit Log و ثبت خودکار رویدادهای پرونده مخاطب را اضافه می‌کند.

## 2. حساب اصلی

- Username: `tasnimroyal`
- Role: `admin`

رمز عبور نباید در GitHub یا سورس‌کد ذخیره شود. حساب Auth را در Supabase ایجاد کنید و در metadata مقدار `username` را برابر `tasnimroyal` قرار دهید.

## 3. اجرای محلی

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

مسیر `/login` برای ورود و `/` برای پنل اصلی است. مسیر `/pipeline` قیف فروش و `/audit` تاریخچه تغییرات را نمایش می‌دهد.
