"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/crm-sidebar";
import { TopNavigation } from "@/components/top-navigation";
import { Leads } from "@/components/pages/leads";

export default function LeadsPage() {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = () => {
    router.replace("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
        <CRMSidebar currentPage="leads" onPageChange={(page) => {
          if (page === "leads") return;
          router.push(`/${page}`);
        }} onSignOut={handleSignOut} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <TopNavigation
            onNotificationsToggle={() => setNotificationsOpen(!notificationsOpen)}
            notificationsOpen={notificationsOpen}
          />
          <main className="flex-1 p-6 overflow-auto w-full">
            <Leads />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 