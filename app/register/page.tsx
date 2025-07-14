"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Register } from "@/components/auth/register";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (inviteToken) {
      const fetchInvite = async () => {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from("invites")
          .select("*")
          .eq("token", inviteToken)
          .eq("status", "pending")
          .single();
        setInvite(data);
        setLoading(false);
      };
      fetchInvite();
    }
  }, [inviteToken]);

  useEffect(() => {
    if (invite?.company) {
      const fetchCompanyName = async () => {
        const supabase = createClient();
        const { data: company } = await supabase
          .from("companies")
          .select("name")
          .eq("id", invite.company)
          .single();
        setCompanyName(company?.name || "");
      };
      fetchCompanyName();
    }
  }, [invite?.company]);

  const handleRegister = async (data: { firstName: string; lastName: string; email: string; password: string; company: string; }) => {
    const supabase = createClient();
    let email = data.email;
    let company = data.company;
    let role = "member";

    // If invite, override with invite data
    if (invite) {
      email = invite.email;
      company = companyName;
      role = invite.role || "member";
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          company,
          role,
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

    // If invite, mark as accepted
    if (invite) {
      await supabase.from("invites").update({ status: "accepted" }).eq("id", invite.id);
    }

    toast({
      title: "Registration Successful",
      description: "Account created! Confirm your email...",
      variant: "default",
    });

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
            <span className="text-muted-foreground">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  if (inviteToken && !invite)
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="py-12">
            <Alert variant="destructive">
              <AlertTitle>Invalid or Expired Invite</AlertTitle>
              <AlertDescription>
                The invitation link is invalid or has already been used.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-2">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {invite
              ? `Join ${companyName ? companyName : "the company"}`
              : "Create your account"}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            {invite
              ? `You have been invited as a${invite.role ? ` ${invite.role}` : " member"}.`
              : "Sign up to get started with your CRM workspace."}
          </p>
        </CardHeader>
        <CardContent className="py-6">
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => router.push("/login")}
            onBackToLanding={() => router.push("/")}
            prefillEmail={invite?.email}
            prefillCompany={companyName}
            prefillRole={invite?.role}
            disableEmail={!!invite}
            disableCompany={!!invite}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function RegisterPageWithSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPage />
    </Suspense>
  );
}
