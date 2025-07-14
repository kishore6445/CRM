"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CRMSidebar } from "@/components/crm-sidebar";
import { TopNavigation } from "@/components/top-navigation";
import { Tasks } from "@/components/pages/tasks";
import { createClient } from "@/lib/supabase/client";

function useContacts() {
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  useEffect(() => {
    const fetchContacts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("contacts").select("id, first_name, last_name");
      if (!error) setContacts(data);
    };
    fetchContacts();
  }, []);
  return contacts;
}

export default function TasksPage() {
  const router = useRouter();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = () => {
    router.replace("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
        <CRMSidebar currentPage="tasks" onPageChange={(page) => {
          if (page === "tasks") return;
          router.push(`/${page}`);
        }} onSignOut={handleSignOut} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <TopNavigation
            onNotificationsToggle={() => setNotificationsOpen(!notificationsOpen)}
            notificationsOpen={notificationsOpen}
          />
          <main className="flex-1 p-6 overflow-auto w-full">
            <Tasks />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 