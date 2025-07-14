"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { User, Bell, Users, Key, Camera, MoreHorizontal, Plus, Shield, Mail, Smartphone, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    deals: true,
    leads: true,
    tasks: true,
  })
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [notifLoading, setNotifLoading] = useState(false)

  useEffect(() => {
    const fetchTeam = async () => {
      setTeamLoading(true)
      setTeamError(null)
      const supabase = createClient()
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      const currentUser = userData?.user
      setUser(currentUser)
      setAuthChecked(true)
      if (!currentUser) {
        setTeamError("You must be logged in to view this page.")
        setTeamLoading(false)
        return
      }
      // Fetch current user's profile to get company
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("company")
        .eq("id", currentUser.id)
        .single()
      if (profileError) {
        setTeamError("Error fetching your profile: " + profileError.message)
        setTeamLoading(false)
        return
      }
      if (!profileData || !profileData.company) {
        setTeamError("Your profile is missing a company. Please contact support.")
        setTeamLoading(false)
        return
      }
      // Fetch all users in the same company
      const { data: members, error: membersError } = await supabase
        .from("users")
        .select("id, first_name, last_name, email, role, is_active, last_login, avatar_url")
        .eq("company", profileData.company)
      if (membersError) {
        setTeamError("Could not fetch team members.")
        setTeamLoading(false)
        return
      }
      setTeamMembers(members)
      setTeamLoading(false)
    }
    fetchTeam()
  }, [])

  useEffect(() => {
    if (!user || !user.company) return;
    const fetchInvites = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("invites")
        .select("*")
        .eq("company", user.company)
        .eq("status", "pending")
      setPendingInvites(data || [])
    }
    fetchInvites()
  }, [user?.company])

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return
      const { data: profile } = await supabase
        .from("users")
        .select("notification_prefs")
        .eq("id", user.id)
        .single()
      if (profile && profile.notification_prefs) {
        setNotifications(profile.notification_prefs)
      }
    }
    fetchNotifications()
  }, [])

  const handleSaveNotifications = async () => {
    setNotifLoading(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      toast({ title: "Error", description: "Not authenticated", variant: "destructive" })
      setNotifLoading(false)
      return
    }
    const { error } = await supabase
      .from("users")
      .update({ notification_prefs: notifications })
      .eq("id", user.id)
    setNotifLoading(false)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Preferences saved!", description: "Your notification preferences have been updated." })
    }
  }

  const handleInvite = async () => {
    setLoading(true)
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    })
    setLoading(false)
    if (res.ok) {
      toast({ title: "Invite sent!", description: `Invitation sent to ${email}` })
      setShow(false)
      setEmail("")
    } else {
      const data = await res.json()
      toast({ title: "Error", description: data.error || "Failed to send invite", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account preferences and team settings</p>
      </div>

      <Tabs defaultValue="team" className="space-y-4 sm:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 min-w-[400px] sm:min-w-0">
            {/* <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Prof</span>
            </TabsTrigger> */}
             <TabsTrigger value="team" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Team</span>
              <span className="sm:hidden">Team</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
           
            <TabsTrigger value="api" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Key className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">API Access</span>
              <span className="sm:hidden">API</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="team" className="space-y-4 sm:space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-lg">Team Members</span>
                <Button onClick={() => setShow(true)}>Invite Member</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {teamLoading && <div className="p-6 text-center text-slate-500">Loading team members...</div>}
              {teamError && <div className="p-6 text-center text-red-500">{teamError}</div>}
              {!teamLoading && !teamError && (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden">
                    <div className="space-y-4 p-4 sm:p-6">
                      {teamMembers.map((member) => (
                        <Card key={member.id} className="border-slate-200">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <Avatar className="w-10 h-10 flex-shrink-0">
                                    {member.avatar_url ? (
                                      <AvatarImage src={member.avatar_url} />
                                    ) : (
                                      <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-sm">
                                        {member.first_name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "U"}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-900 truncate">{member.first_name} {member.last_name}</p>
                                    <p className="text-sm text-slate-500 truncate">{member.email}</p>
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Remove Member</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary">{member.role}</Badge>
                                <Badge
                                  className={member.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}
                                >
                                  {member.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-600">Last active: {member.last_login ? new Date(member.last_login).toLocaleString() : "-"}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Member</TableHead>
                          <TableHead className="min-w-[120px]">Role</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Last Active</TableHead>
                          <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  {member.avatar_url ? (
                                    <AvatarImage src={member.avatar_url} />
                                  ) : (
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-sm">
                                      {member.first_name?.[0]?.toUpperCase() || member.email?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-900 truncate">{member.first_name} {member.last_name}</p>
                                  <p className="text-sm text-slate-500 truncate">{member.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{member.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={member.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-700 border-slate-200"}>
                                {member.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">{member.last_login ? new Date(member.last_login).toLocaleString() : "-"}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Remove Member</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Delivery Methods</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Mail className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">Email Notifications</p>
                        <p className="text-sm text-slate-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Bell className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">Push Notifications</p>
                        <p className="text-sm text-slate-500">Receive push notifications in browser</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Smartphone className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">SMS Notifications</p>
                        <p className="text-sm text-slate-500">Receive important alerts via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Notification Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">Deal Updates</p>
                      <p className="text-sm text-slate-500">When deals change status or are updated</p>
                    </div>
                    <Switch
                      checked={notifications.deals}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, deals: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">New Leads</p>
                      <p className="text-sm text-slate-500">When new leads are added to your pipeline</p>
                    </div>
                    <Switch
                      checked={notifications.leads}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, leads: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">Task Reminders</p>
                      <p className="text-sm text-slate-500">Reminders for upcoming and overdue tasks</p>
                    </div>
                    <Switch
                      checked={notifications.tasks}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, tasks: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={handleSaveNotifications} disabled={notifLoading}>
                {notifLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4 sm:space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">API Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-medium text-blue-900">API Security</h4>
                    <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                      Keep your API keys secure and never share them publicly. Rotate keys regularly for better
                      security.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input
                      id="apiKey"
                      type="password"
                      defaultValue="sk-1234567890abcdef1234567890abcdef"
                      readOnly
                      className="flex-1"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 sm:flex-none">
                        Copy
                      </Button>
                      <Button variant="outline" className="flex-1 sm:flex-none">
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Use this key to authenticate API requests to your CRM data.
                  </p>
                </div>

                <div>
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Input id="webhookUrl" placeholder="https://your-app.com/webhook" className="flex-1" />
                    <Button variant="outline" className="w-full sm:w-auto">
                      Test
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Receive real-time notifications when data changes in your CRM.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">API Usage</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Requests this month</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">1,247</p>
                    <p className="text-xs text-slate-500">of 10,000 limit</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Rate limit</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">100</p>
                    <p className="text-xs text-slate-500">requests per minute</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600">Last request</p>
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">2h</p>
                    <p className="text-xs text-slate-500">ago</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Documentation</Label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                    View API Documentation
                  </a>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">Save API Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Team Member</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleInvite} disabled={loading}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pendingInvites.map(invite => (
        <div key={invite.id}>
          {invite.email} (pending)
        </div>
      ))}
    </div>
  )
}
