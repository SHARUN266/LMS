import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "AI Masai-Style Career LMS | Job-Ready Bootcamp",
  description: "Disciplined career training platform powered by Local Qwen 2.5 Coder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-slate-100 antialiased overflow-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
