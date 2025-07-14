"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CRMSidebar } from "@/components/crm-sidebar";
import { TopNavigation } from "@/components/top-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    company: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      setProfile({
        first_name: data.user.user_metadata?.first_name || "",
        last_name: data.user.user_metadata?.last_name || "",
        company: data.user.user_metadata?.company || "",
        email: data.user.email || "",
        phone: data.user.user_metadata?.phone || "",
        bio: data.user.user_metadata?.bio || "",
      });
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    // Update Auth user metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        company: profile.company,
        phone: profile.phone,
        bio: profile.bio,
      },
      email: profile.email,
    });
    // Update public.users table
    const { error: dbError } = await supabase
      .from("users")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        company: profile.company,
        phone: profile.phone,
      })
      .eq("id", user.id);
    setSaving(false);
    if (authError || dbError) {
      toast({
        title: "Update Error",
        description: authError?.message || dbError?.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out.",
    });
    router.replace("/login");
  };

  if (loading) return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
        <CRMSidebar currentPage="settings" onPageChange={() => {}} onSignOut={() => {}} />
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <TopNavigation onNotificationsToggle={() => {}} notificationsOpen={false} />
          <main className="flex-1 p-4 md:p-8 overflow-auto w-full">
            <div className="w-full max-w-4xl mx-auto">
              <div className="mb-8">
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-5 w-64" />
              </div>
              
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-200">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                    <Skeleton className="w-28 h-28 rounded-full" />
                    <div className="space-y-2 text-center md:text-left">
                      <Skeleton className="h-7 w-48 mb-2 mx-auto md:mx-0" />
                      <Skeleton className="h-5 w-32 mb-1 mx-auto md:mx-0" />
                      <Skeleton className="h-4 w-56 mx-auto md:mx-0" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );

  const getInitials = () => {
    const { first_name, last_name } = profile;
    if (first_name && last_name) return `${first_name[0]}${last_name[0]}`.toUpperCase();
    if (first_name) return first_name[0].toUpperCase();
    if (last_name) return last_name[0].toUpperCase();
    return "U";
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
        <CRMSidebar 
          currentPage="settings" 
          onPageChange={(page) => {
            if (page === "settings") return;
            router.push(`/${page}`);
          }} 
          onSignOut={handleSignOut} 
        />
        
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <TopNavigation
            user={{
              firstName: profile.first_name,
              lastName: profile.last_name,
              company: profile.company,
              email: profile.email,
              avatarUrl: user?.user_metadata?.avatar_url,
            }}
            onNotificationsToggle={() => setNotificationsOpen(!notificationsOpen)}
            notificationsOpen={notificationsOpen}
          />
          
          <main className="flex-1 p-4 md:p-8 overflow-auto w-full">
            <div className="w-full max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-2">Manage your personal information and account details</p>
              </div>
              
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-lg font-semibold">Personal Information</CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 md:w-28 md:h-28 border-2 border-white shadow-md">
                        <AvatarImage src={user?.user_metadata?.avatar_url || undefined} />
                        <AvatarFallback className="bg-indigo-600 text-white text-2xl font-medium">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <button 
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                        disabled
                      >
                        <Camera className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="text-center md:text-left">
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                        {profile.first_name} {profile.last_name}
                      </h3>
                      {profile.company && (
                        <p className="text-gray-700 font-medium">{profile.company}</p>
                      )}
                      <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
                    </div>
                  </div>
                  
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-gray-700">First Name</Label>
                      <Input 
                        id="first_name" 
                        name="first_name" 
                        value={profile.first_name} 
                        onChange={handleChange} 
                        className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoComplete="given-name" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-gray-700">Last Name</Label>
                      <Input 
                        id="last_name" 
                        name="last_name" 
                        value={profile.last_name} 
                        onChange={handleChange} 
                        className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoComplete="family-name" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-700">Company</Label>
                      <Input 
                        id="company" 
                        name="company" 
                        value={profile.company} 
                        onChange={handleChange} 
                        className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoComplete="organization" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        value={profile.email} 
                        onChange={handleChange} 
                        className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoComplete="email" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={profile.phone} 
                        onChange={handleChange} 
                        className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoComplete="tel" 
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio" className="text-gray-700">Bio</Label>
                      <Textarea 
                        id="bio" 
                        name="bio" 
                        value={profile.bio} 
                        onChange={handleChange} 
                        placeholder="Tell us about yourself..."
                        className="min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                      />
                    </div>
                  </form>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto px-6 py-3 shadow-sm"
                      onClick={handleSave} 
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
                      onClick={() => router.refresh()}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}