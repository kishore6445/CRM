"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, Users, Handshake, DollarSign, CheckCircle, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const iconMap = {
  Users,
  Handshake,
  DollarSign,
  CheckCircle,
}

export function Dashboard() {
  // State for each section
  const [overview, setOverview] = useState<any[]>([])
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const [pipeline, setPipeline] = useState<any[]>([])
  const [pipelineLoading, setPipelineLoading] = useState(true)
  const [pipelineError, setPipelineError] = useState<string | null>(null)

  const [revenue, setRevenue] = useState<any[]>([])
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [revenueError, setRevenueError] = useState<string | null>(null)

  const [activities, setActivities] = useState<any[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)

  // Fetch all data on mount
  useEffect(() => {
    const supabase = createClient()

    async function getUserAndCompany() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return { user: null, company: null }
      const { data: profile } = await supabase.from("users").select("company").eq("id", user.id).single()
      return { user, company: profile?.company }
    }

    // Overview cards
    async function fetchOverview() {
      setOverviewLoading(true)
      setOverviewError(null)
      try {
        const { user, company } = await getUserAndCompany()
        if (!user) throw new Error("User not authenticated")
        // Total Leads
        const { count: leadsCount } = await supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("company", company)
        // Active Deals
        const { count: activeDeals } = await supabase
          .from("deals")
          .select("id", { count: "exact", head: true })
          .eq("stage", "negotiation")
          .eq("company", company)
        // Closed Sales (won deals, sum value)
        const { data: wonDeals, error: wonError } = await supabase
          .from("deals")
          .select("value")
          .eq("stage", "won")
          .eq("company", company)
        // Tasks Today
        const today = new Date().toISOString().slice(0, 10)
        const { count: tasksToday } = await supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("due_date", today)
          .eq("company", company)
        setOverview([
          {
            title: "Total Leads",
            value: leadsCount?.toLocaleString() ?? "-",
            change: "-", // You can implement change % if you want
            trend: "up",
            icon: "Users",
            color: "bg-blue-500",
          },
          {
            title: "Active Deals",
            value: activeDeals?.toLocaleString() ?? "-",
            change: "-",
            trend: "up",
            icon: "Handshake",
            color: "bg-purple-500",
          },
          {
            title: "Closed Sales",
            value: wonDeals ?
              "$" + wonDeals.reduce((acc, d) => acc + (parseFloat(d.value) || 0), 0).toLocaleString() : "-",
            change: "-",
            trend: "up",
            icon: "DollarSign",
            color: "bg-green-500",
          },
          {
            title: "Tasks Today",
            value: tasksToday?.toLocaleString() ?? "-",
            change: "-",
            trend: "down",
            icon: "CheckCircle",
            color: "bg-orange-500",
          },
        ])
      } catch (e: any) {
        setOverviewError("Failed to load overview data.")
      } finally {
        setOverviewLoading(false)
      }
    }

    // Deal pipeline (performance)
    async function fetchPipeline() {
      setPipelineLoading(true)
      setPipelineError(null)
      try {
        const { company } = await getUserAndCompany()
        // Count deals by stage
        const stages = [
          { name: "Lead In", key: "lead-in", color: "#3b82f6" },
          { name: "Contacted", key: "contacted", color: "#8b5cf6" },
          { name: "Proposal", key: "proposal", color: "#06b6d4" },
          { name: "Negotiation", key: "negotiation", color: "#10b981" },
          { name: "Won", key: "won", color: "#f59e0b" },
          { name: "Lost", key: "lost", color: "#ef4444" },
        ]
        const results = await Promise.all(
          stages.map(async (stage) => {
            const { count } = await supabase
              .from("deals")
              .select("id", { count: "exact", head: true })
              .eq("stage", stage.key)
              .eq("company", company)
            return { name: stage.name, value: count ?? 0, color: stage.color }
          })
        )
        setPipeline(results)
      } catch (e: any) {
        setPipelineError("Failed to load pipeline data.")
      } finally {
        setPipelineLoading(false)
      }
    }

    // Revenue trend (sum of won deals by month)
    async function fetchRevenue() {
      setRevenueLoading(true)
      setRevenueError(null)
      try {
        const { company } = await getUserAndCompany()
        // Get all won deals
        const { data, error } = await supabase
          .from("deals")
          .select("value, won_at")
          .eq("stage", "won")
          .eq("company", company)
        if (error) throw error
        // Group by month
        const monthly: Record<string, number> = {}
        data?.forEach((deal: any) => {
          if (!deal.won_at) return
          const date = new Date(deal.won_at)
          const month = date.toLocaleString("default", { month: "short" })
          monthly[month] = (monthly[month] || 0) + parseFloat(deal.value)
        })
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        setRevenue(months.map((m) => ({ month: m, revenue: monthly[m] || 0 })))
      } catch (e: any) {
        setRevenueError("Failed to load revenue data.")
      } finally {
        setRevenueLoading(false)
      }
    }

    // Recent activities
    async function fetchActivities() {
      setActivitiesLoading(true)
      setActivitiesError(null)
      try {
        const { company } = await getUserAndCompany()
        const { data, error } = await supabase
          .from("activities")
          .select("id, type, title, description, created_at, assigned_to")
          .eq("company", company)
          .order("created_at", { ascending: false })
          .limit(6)
        if (error) throw error
        // Fetch user names for assigned_to
        const userIds = Array.from(new Set((data || []).map((a: any) => a.assigned_to).filter(Boolean)))
        let userMap: Record<string, { first_name: string; last_name: string }> = {}
        if (userIds.length > 0) {
          const { data: usersData } = await supabase
            .from("users")
            .select("id, first_name, last_name")
            .in("id", userIds)
          if (usersData) {
            usersData.forEach((u: any) => {
              userMap[u.id] = { first_name: u.first_name, last_name: u.last_name }
            })
          }
        }
        setActivities(
          (data || []).map((a: any) => ({
            id: a.id,
            type: a.type,
            title: a.title,
            description: a.description,
            time: a.created_at ? timeAgo(a.created_at) : "-",
            user: a.assigned_to && userMap[a.assigned_to]
              ? `${userMap[a.assigned_to].first_name} ${userMap[a.assigned_to].last_name}`
              : "-",
            avatar: a.assigned_to && userMap[a.assigned_to]
              ? initials(`${userMap[a.assigned_to].first_name} ${userMap[a.assigned_to].last_name}`)
              : "U",
            color: "bg-slate-100 text-slate-700",
          }))
        )
      } catch (e: any) {
        setActivitiesError("Failed to load activities.")
      } finally {
        setActivitiesLoading(false)
      }
    }

    fetchOverview()
    fetchPipeline()
    fetchRevenue()
    fetchActivities()
  }, [])

  // Helper: time ago
  function timeAgo(dateString: string) {
    const now = new Date()
    const date = new Date(dateString)
    const diff = (now.getTime() - date.getTime()) / 1000
    if (diff < 60) return `${Math.floor(diff)} seconds ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }
  // Helper: initials
  function initials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="w-full h-full">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Welcome back! Here's what's happening with your sales.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="text-sm font-medium text-slate-900">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          {overviewLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-slate-200 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded w-1/2 mb-2" />
                  <div className="h-8 bg-slate-300 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </CardContent>
              </Card>
            ))
          ) : overviewError ? (
            <div className="col-span-4 text-red-500">{overviewError}</div>
          ) : (
            overview.map((item, index) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] || Users
              return (
                <Card key={index} className="border-slate-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-600 truncate">{item.title}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                        <div className="flex items-center mt-2">
                          {item.trend === "up" ? (
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm font-medium ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}
                          >
                            {item.change}
                          </span>
                          <span className="text-sm text-slate-500 ml-1">vs last month</span>
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 ml-3`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
          {/* Recent Activities */}
          <Card className="xl:col-span-2 border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-slate-600" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg animate-pulse">
                      <div className="w-10 h-10 bg-slate-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-2/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activitiesError ? (
                <div className="text-red-500">{activitiesError}</div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">{activity.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900 text-base truncate">{activity.title}</h4>
                          <Badge variant="secondary" className={`${activity.color} text-xs w-fit`}>
                            {activity.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{activity.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-500">
                          <span className="truncate">{activity.user}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart className="w-5 h-5 text-slate-600" />
                Deal Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="w-3 h-3 bg-slate-200 rounded-full" />
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="w-20 bg-slate-100 rounded-full h-2" />
                      <div className="h-4 bg-slate-200 rounded w-8" />
                    </div>
                  ))}
                </div>
              ) : pipelineError ? (
                <div className="text-red-500">{pipelineError}</div>
              ) : (
                <div className="space-y-4">
                  {pipeline.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-slate-700 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-20 bg-slate-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${(item.value / (pipeline[0]?.value || 1)) * 100}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-8 text-right">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="border-slate-200 w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <div className="w-1/2 h-8 bg-slate-200 rounded animate-pulse" />
              </div>
            ) : revenueError ? (
              <div className="text-red-500">{revenueError}</div>
            ) : (
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "#3b82f6",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenue} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}K`}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
