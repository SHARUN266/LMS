import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Praxis — Engineering & Career Operating System",
  description: "Disciplined, job-ready technical career bootcamp platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-hidden bg-[#f8fafc] text-slate-900">
        <TooltipProvider delay={200}>
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
