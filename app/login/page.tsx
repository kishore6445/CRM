"use client";
import { useRouter } from "next/navigation";
import { Login } from "@/components/auth/login";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleLogin = async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAlert({ type: "error", message: error.message });
      return;
    }

    setAlert({ type: "success", message: "Login successful! Redirecting..." });
    setTimeout(() => {
      router.push("/profile");
    }, 1200);
  };

  return (
    <Login
      onLogin={handleLogin}
      onSwitchToRegister={() => router.push("/register")}
      onForgotPassword={() => router.push("/forgot-password")}
      onBackToLanding={() => router.push("/")}
      alert={alert}
      onAlertClose={() => setAlert(null)}
    />
  );
}
