"use client";
import { useRouter } from "next/navigation";
import { Register } from "@/components/auth/register";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (data: { firstName: string; lastName: string; email: string; password: string; company: string; }) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company,
        },
      },
    });

    if (error) {
      toast({
        title: "Registration Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Registration Successful",
      description: "Account created! Confirm your email...",
    });

    setTimeout(() => {
      router.push("/login");
    }, 1500); // 1.5 seconds delay for user to see the toast
  };

  return (
    <Register
      onRegister={handleRegister}
      onSwitchToLogin={() => router.push("/login")}
      onBackToLanding={() => router.push("/")}
    />
  );
}
