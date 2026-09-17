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
    <html lang="en" className="dark">
      <body className="overflow-hidden">
        <TooltipProvider delay={300}>
          <AppShell>{children}</AppShell>
        </TooltipProvider>
      </body>
    </html>
  );
}
