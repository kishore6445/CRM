"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let attempts = 0;
    let timeout: any;

    const fetchUser = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        console.log("UserContext fetched:", { authUser, profile });
        // If names are missing, retry a few times (for new users)
        if (
          profile &&
          (!profile.first_name || !profile.last_name) &&
          attempts < 5
        ) {
          attempts++;
          timeout = setTimeout(fetchUser, 1000); // retry after 1s
          return;
        }
        setUser({ ...authUser, ...profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
