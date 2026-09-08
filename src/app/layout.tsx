import type { Metadata } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { AppFrame } from "@/components/layout/app-frame";

export const metadata: Metadata = {
  title: "Tasnim Royal CRM",
  description: "سیستم مدیریت ارتباط با مشتری تسنیم رویال",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <PwaRegister />
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
