"use client";

import { Deals } from "@/components/pages/deals";
import { CRMSidebar } from "@/components/crm-sidebar";
import { TopNavigation } from "@/components/top-navigation";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export default function DealsPage() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const user = { firstName: "John", lastName: "Doe", company: "Demo Inc.", email: "john@demo.com" };
  const router = useRouter();

  const handleSignOut = () => {};

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 overflow-scroll w-full">
        <div className="w-64 flex-shrink-0 hidden md:block">
          {/* <CRMSidebar currentPage="deals" onPageChange={() => {}} onSignOut={() => {}} /> */}
          <CRMSidebar currentPage="deals" onPageChange={(page) => {
          if (page === "deals") return;
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
            <Deals />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 