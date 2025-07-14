"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Bell, User, DollarSign, Calendar, AlertCircle, CheckCircle, Clock, Trash2 } from "lucide-react"

interface NotificationsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface Notification {
  id: string
  type: "lead" | "deal" | "task" | "system"
  title: string
  message: string
  time: string
  isRead: boolean
  priority: "low" | "medium" | "high"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "lead",
    title: "New Lead Assigned",
    message: "Sarah Johnson from TechCorp has been assigned to you",
    time: "2 minutes ago",
    isRead: false,
    priority: "high",
  },
  {
    id: "2",
    type: "deal",
    title: "Deal Update",
    message: "Enterprise Software deal moved to negotiation stage",
    time: "15 minutes ago",
    isRead: false,
    priority: "medium",
  },
  {
    id: "3",
    type: "task",
    title: "Task Due Soon",
    message: "Follow up with ABC Corp is due in 1 hour",
    time: "45 minutes ago",
    isRead: true,
    priority: "high",
  },
  {
    id: "4",
    type: "system",
    title: "System Update",
    message: "ArkCRM has been updated with new features",
    time: "2 hours ago",
    isRead: true,
    priority: "low",
  },
  {
    id: "5",
    type: "deal",
    title: "Deal Closed",
    message: "Marketing Automation deal closed successfully - $25,000",
    time: "3 hours ago",
    isRead: true,
    priority: "medium",
  },
  {
    id: "6",
    type: "lead",
    title: "Lead Activity",
    message: "John Smith opened your email and clicked 3 links",
    time: "5 hours ago",
    isRead: true,
    priority: "low",
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "lead":
      return <User className="w-4 h-4" />
    case "deal":
      return <DollarSign className="w-4 h-4" />
    case "task":
      return <Calendar className="w-4 h-4" />
    case "system":
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Bell className="w-4 h-4" />
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

export function NotificationsSidebar({ isOpen, onClose }: NotificationsSidebarProps) {
  const [notifications, setNotifications] = useState(mockNotifications)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && <Badge className="bg-red-500 text-white text-xs">{unreadCount}</Badge>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
          <span className="text-sm text-slate-500">{notifications.length} notifications</span>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications</h3>
                <p className="text-sm text-slate-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-all hover:bg-slate-50 cursor-pointer ${
                      notification.isRead ? "bg-white border-slate-100" : "bg-blue-50 border-blue-100"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={`text-sm font-medium ${
                              notification.isRead ? "text-slate-700" : "text-slate-900"
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className={`text-sm mt-1 ${notification.isRead ? "text-slate-500" : "text-slate-600"}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{notification.time}</span>
                          {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <Button variant="outline" className="w-full" size="sm">
            View All Notifications
          </Button>
        </div>
      </div>
    </>
  )
}
