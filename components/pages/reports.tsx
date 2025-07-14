"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, Download, Filter, Calendar, Users, DollarSign, Target } from "lucide-react"

const conversionData = [
  { stage: "Leads", count: 450, conversion: 100 },
  { stage: "Contacted", count: 320, conversion: 71 },
  { stage: "Qualified", count: 180, conversion: 40 },
  { stage: "Proposal", count: 120, conversion: 27 },
  { stage: "Negotiation", count: 80, conversion: 18 },
  { stage: "Closed Won", count: 45, conversion: 10 },
]

const monthlyPerformance = [
  { month: "Jul", revenue: 85000, deals: 12, leads: 180 },
  { month: "Aug", revenue: 92000, deals: 15, leads: 210 },
  { month: "Sep", revenue: 78000, deals: 11, leads: 165 },
  { month: "Oct", revenue: 105000, deals: 18, leads: 240 },
  { month: "Nov", revenue: 118000, deals: 22, leads: 280 },
  { month: "Dec", revenue: 134000, deals: 28, leads: 320 },
]

const leadSources = [
  { name: "Website", value: 35, color: "#3b82f6" },
  { name: "Referrals", value: 28, color: "#8b5cf6" },
  { name: "LinkedIn", value: 20, color: "#06b6d4" },
  { name: "Trade Shows", value: 12, color: "#10b981" },
  { name: "Cold Calls", value: 5, color: "#f59e0b" },
]

const teamPerformance = [
  { name: "John Doe", deals: 28, revenue: 145000, target: 120000 },
  { name: "Sarah Johnson", deals: 24, revenue: 132000, target: 110000 },
  { name: "Mike Chen", deals: 22, revenue: 118000, target: 100000 },
  { name: "Emma Davis", deals: 19, revenue: 95000, target: 90000 },
  { name: "Alex Thompson", deals: 16, revenue: 78000, target: 80000 },
]

export function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Track performance and analyze sales data</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">$847K</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-600">+23.1%</span>
                  <span className="text-sm text-slate-500 ml-1 hidden sm:inline">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-600">Conversion Rate</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">10.2%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-600">+2.4%</span>
                  <span className="text-sm text-slate-500 ml-1 hidden sm:inline">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-600">Avg Deal Size</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">$42K</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-600">-5.2%</span>
                  <span className="text-sm text-slate-500 ml-1 hidden sm:inline">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-600">Active Leads</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">2,847</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                  <span className="text-sm text-slate-500 ml-1 hidden sm:inline">vs last month</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-lg">Revenue Trend</span>
              <Select defaultValue="6months">
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="12months">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "#3b82f6",
                },
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyPerformance} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Lead Sources Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="w-full lg:w-1/2">
                <ChartContainer
                  config={{
                    website: { label: "Website", color: "#3b82f6" },
                    referrals: { label: "Referrals", color: "#8b5cf6" },
                    linkedin: { label: "LinkedIn", color: "#06b6d4" },
                    tradeshows: { label: "Trade Shows", color: "#10b981" },
                    coldcalls: { label: "Cold Calls", color: "#f59e0b" },
                  }}
                  className="h-[200px] sm:h-[250px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {leadSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [`${value}%`, "Percentage"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="w-full lg:w-1/2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  {leadSources.map((source, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: source.color }} />
                      <span className="text-sm text-slate-600 flex-1 truncate">{source.name}</span>
                      <span className="text-sm font-medium text-slate-900 flex-shrink-0">{source.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Conversion Funnel */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sales Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Count",
                  color: "#3b82f6",
                },
              }}
              className="h-[250px] sm:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} layout="horizontal" margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    width={80}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [
                      `${value} (${conversionData.find((d) => d.count === value)?.conversion}%)`,
                      "Count",
                    ]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              {teamPerformance.map((member, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-medium text-slate-900 truncate">{member.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-900">${member.revenue.toLocaleString()}</span>
                      <span className="text-xs text-slate-500">({member.deals} deals)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((member.revenue / member.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Target: ${member.target.toLocaleString()}</span>
                    <span>{Math.round((member.revenue / member.target) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
