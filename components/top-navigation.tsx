"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, Bell, Settings, User, LogOut, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/components/auth/UserContext"

interface TopNavigationProps {
  onNotificationsToggle: () => void
  notificationsOpen: boolean
  user?: {
    firstName?: string;
    lastName?: string;
    company?: string;
    email?: string;
    avatarUrl?: string;
  }
}

export function TopNavigation({ onNotificationsToggle, notificationsOpen, user }: TopNavigationProps) {
  const [notifications] = useState(3)
  const router = useRouter()
  const { user: contextUser, loading } = useUser()


  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center gap-4 flex-1 max-w-2xl min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search contacts, deals, or companies..."
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:ring-blue-100 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className={`relative hover:bg-slate-100 flex-shrink-0 ${
              notificationsOpen ? "bg-blue-50 text-blue-600" : ""
            }`}
            onClick={onNotificationsToggle}
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {notifications}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-slate-100 px-3 flex-shrink-0">
                <Avatar className="w-8 h-8">
                  
                  {contextUser?.avatarUrl ? (
                    
                    <AvatarImage src={contextUser.avatarUrl} />
                  ) : (
                    <AvatarFallback
                      className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-sm flex items-center justify-center w-full h-full"
                      style={{ fontWeight: 600, fontSize: "1rem" }}
                    >
                      {contextUser?.first_name?.[0]?.toUpperCase() ||
                       contextUser?.firstName?.[0]?.toUpperCase() ||
                       contextUser?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>

                    
                  )}
                </Avatar>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {contextUser?.first_name || contextUser?.firstName} {contextUser?.last_name || contextUser?.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{contextUser?.company || contextUser?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={() => router.push("/profile")}>
                <User className="w-4 h-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <HelpCircle className="w-4 h-4" />
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
