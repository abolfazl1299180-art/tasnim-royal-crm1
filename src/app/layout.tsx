import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasnim Royal CRM",
  description: "سیستم مدیریت ارتباط با مشتری تسنیم رویال",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
