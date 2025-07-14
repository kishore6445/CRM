"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/crm-sidebar";
import { TopNavigation } from "@/components/top-navigation";
import { AIAssistant } from "@/components/pages/ai-assistant";

export default function AIAssistantPage() {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = () => {
    router.replace("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
        <CRMSidebar currentPage="ai-assistant" onPageChange={(page) => {
          if (page === "ai-assistant") return;
          router.push(`/${page}`);
        }} onSignOut={handleSignOut} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <TopNavigation
            onNotificationsToggle={() => setNotificationsOpen(!notificationsOpen)}
            notificationsOpen={notificationsOpen}
          />
          <main className="flex-1 p-6 overflow-auto w-full">
            <AIAssistant />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 