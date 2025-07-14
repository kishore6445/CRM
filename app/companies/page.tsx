"use client";

import Companies from "@/components/pages/companies";
import { CRMSidebar } from "@/components/crm-sidebar";
import { TopNavigation } from "@/components/top-navigation";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export default function CompaniesPage() {
  const router = useRouter();
  // Dummy user and notifications state for layout
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const user = { firstName: "John", lastName: "Doe", company: "Demo Inc.", email: "john@demo.com" };

  function handleSignOut(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
        <div className="w-64 flex-shrink-0 hidden md:block">
          {/* <CRMSidebar currentPage="companies" onPageChange={() => {}} onSignOut={() => {}} /> */}
          <CRMSidebar currentPage="companies" onPageChange={(page) => {
            if (page === "companies") return;
            router.push(`/${page}`);
          }} onSignOut={handleSignOut} />
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
          <TopNavigation
            onNotificationsToggle={() => setNotificationsOpen((v) => !v)}
            notificationsOpen={notificationsOpen}
            user={user}
          />
          <main className="flex-1 bg-slate-50 p-4 md:p-8">
            <Companies />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 