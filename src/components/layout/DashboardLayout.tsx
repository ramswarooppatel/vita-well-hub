
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-6">{children}</main>
      <Footer />
    </div>
  );
}
