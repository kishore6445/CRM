"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, DollarSign, Calendar, Building2, TrendingUp, Clock, Target, Edit, Trash2 } from "lucide-react"
import { DealForm } from "@/components/forms/deal-form"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const dealStages = [
  { id: "lead-in", title: "Lead In", color: "bg-slate-50 border-slate-200" },
  { id: "contacted", title: "Contacted", color: "bg-blue-50 border-blue-200" },
  { id: "qualified", title: "Qualified", color: "bg-green-50 border-green-200" },
  { id: "proposal", title: "Proposal Sent", color: "bg-purple-50 border-purple-200" },
  { id: "negotiation", title: "Negotiation", color: "bg-orange-50 border-orange-200" },
  { id: "won", title: "Won", color: "bg-green-50 border-green-200" },
  { id: "lost", title: "Lost", color: "bg-red-50 border-red-200" },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200"
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-700 border-green-200"
    case "urgent":
      return "bg-orange-100 text-orange-700 border-orange-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

function groupDealsByStage(deals: any[]) {
  const grouped: Record<string, any[]> = {}
  dealStages.forEach((stage) => {
    grouped[stage.id] = []
  })
  deals.forEach((deal) => {
    grouped[deal.stage] = grouped[deal.stage] || []
    grouped[deal.stage].push(deal)
  })
  return grouped
}

export function Deals() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDealOpen, setIsAddDealOpen] = useState(false)
  const [isEditDealOpen, setIsEditDealOpen] = useState(false)
  const [editDeal, setEditDeal] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteDeal, setDeleteDeal] = useState<any | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [draggedDeal, setDraggedDeal] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])

  const fetchDeals = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    
    // Get current user
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    
    if (!user) {
      setError("User not authenticated.")
      setLoading(false)
      return
    }
    
    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
    if (error) setError(error.message)
    setDeals(data || [])
    setLoading(false)

    // Fetch team members and contacts
    fetchTeamAndContacts(user)
  }

  const fetchTeamAndContacts = async (user: any) => {
    const supabase = createClient()

    // Fetch user's company
    const { data: profile } = await supabase
      .from("users")
      .select("company")
      .eq("id", user.id)
      .single()

    if (!profile?.company) return

    // Fetch team members in the same company
    const { data: members } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("company", profile.company)

    setTeamMembers(members || [])

    // Fetch contacts in the same company
    const { data: contactsData } = await supabase
      .from("contacts")
      .select("id, first_name, last_name, email")
      .eq("company", profile.company)

    setContacts(contactsData || [])
  }

  useEffect(() => {
    fetchDeals()
    // Print the current session when the page loads
    const printSession = async () => {
      const supabase = createClient()
      const sessionResult = await supabase.auth.getSession()
      console.log('supabase.auth.getSession() on load', sessionResult)
    }
    printSession()
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user) {
        fetchTeamAndContacts(user);
      }
    };
    fetchAll();
  }, []);

  const handleAddDeal = async (formData: any) => {
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    // Print the current session for debugging
    const sessionResult = await supabase.auth.getSession()
    console.log('supabase.auth.getSession()', sessionResult)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      setError("User not authenticated.")
      setActionLoading(false)
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      value: formData.value ? parseFloat(formData.value) : null,
      currency: formData.currency || "USD",
      stage: formData.stage || "lead-in",
      probability: formData.probability || 20,
      priority: formData.priority || "medium",
      close_date: formData.closeDate ? new Date(formData.closeDate).toISOString().slice(0, 10) : null,
      contact_id: formData.contactId || null,
      company_id: formData.companyId || null,
      assigned_to: formData.assignedTo || null,
      source: formData.source || null,
      type: formData.type || null,
      notes: formData.notes,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      competitors: formData.competitors && formData.competitors.length > 0 ? formData.competitors : [],
      next_steps: formData.nextSteps,
      loss_reason: formData.lossReason,
      created_by: user.id,
    }

    const { error: insertError } = await supabase.from("deals").insert(payload)
    setActionLoading(false)
    if (insertError) {
      console.log('insertError', insertError);
      setError(insertError.message)
      return
    }
    setIsAddDealOpen(false)
    fetchDeals()
  }

  const handleEditDeal = (deal: any) => {
    setEditDeal(deal)
    setIsEditDealOpen(true)
  }

  const handleUpdateDeal = async (formData: any) => {
    if (!editDeal) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      setError("User not authenticated.")
      setActionLoading(false)
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      value: formData.value ? parseFloat(formData.value) : null,
      currency: formData.currency || "USD",
      stage: formData.stage || "lead-in",
      probability: formData.probability || 20,
      priority: formData.priority || "medium",
      close_date: formData.closeDate ? new Date(formData.closeDate).toISOString().slice(0, 10) : null,
      contact_id: formData.contactId || null,
      company_id: formData.companyId || null,
      assigned_to: formData.assignedTo || null,
      source: formData.source || null,
      type: formData.type || null,
      notes: formData.notes,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      competitors: formData.competitors && formData.competitors.length > 0 ? formData.competitors : [],
      next_steps: formData.nextSteps,
      loss_reason: formData.lossReason,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }
    const { error: updateError } = await supabase.from("deals").update(payload).eq("id", editDeal.id)
    setActionLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setIsEditDealOpen(false)
    setEditDeal(null)
    fetchDeals()
  }

  const handleDeleteDeal = (deal: any) => {
    setDeleteDeal(deal)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteDeal = async () => {
    if (!deleteDeal) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const { error: deleteError } = await supabase.from("deals").delete().eq("id", deleteDeal.id)
    setActionLoading(false)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setIsDeleteDialogOpen(false)
    setDeleteDeal(null)
    fetchDeals()
  }

  const groupedDeals = groupDealsByStage(deals)

  // Stats
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0)
  const wonValue = deals.filter((deal) => deal.stage === "won").reduce((sum, deal) => sum + (deal.value || 0), 0)
  const avgDealSize = deals.length > 0 ? Math.round(totalValue / deals.length) : 0
  const activeDeals = deals.filter((deal) => deal.probability > 0 && deal.probability < 100).length

  // Drag and drop handlers (optional: implement backend update on drop)
  const handleDragStart = (e: React.DragEvent, deal: any, sourceStage: string) => {
    setDraggedDeal({ ...deal, sourceStage })
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault()
    if (draggedDeal && draggedDeal.stage !== targetStage) {
      // Update deal stage in Supabase
      setActionLoading(true)
      const supabase = createClient()
      const { error: updateError } = await supabase.from("deals").update({ stage: targetStage }).eq("id", draggedDeal.id)
      setActionLoading(false)
      if (!updateError) fetchDeals()
    }
    setDraggedDeal(null)
  }

  return (
    <div className="w-full h-full">
      <div className="space-y-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Deals Pipeline</h1>
            <p className="text-slate-600 mt-2">Track and manage your sales opportunities</p>
          </div>
          <Sheet open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto px-6 py-3">
                <Plus className="w-5 h-5" />
                Add New Deal
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
              <DialogTitle>Add New Deal</DialogTitle>
              <DealForm
                onSubmit={handleAddDeal}
                onCancel={() => setIsAddDealOpen(false)}
                teamMembers={teamMembers}
                contacts={contacts}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-600">Total Pipeline</p>
                  <p className="text-2xl font-bold text-slate-900">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-600">Won This Month</p>
                  <p className="text-2xl font-bold text-slate-900">${wonValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-600">Avg. Deal Size</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${avgDealSize.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-600">Active Deals</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {activeDeals}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-7 gap-6 w-full">
            {dealStages.map((stage) => (
              <Card
                key={stage.id}
                className={`border-2 ${stage.color} min-h-[600px] w-full`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-base">{stage.title}</span>
                    <Badge variant="secondary" className="bg-white/80 text-slate-700 font-medium">
                      {groupedDeals[stage.id]?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groupedDeals[stage.id]?.map((deal) => (
                    <Card
                      key={deal.id}
                      className="p-5 cursor-move hover:shadow-lg transition-all duration-200 border-slate-200 bg-white"
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal, stage.id)}
                    >
                      <div className="space-y-4">
                        {/* Header with title and actions */}
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-semibold text-slate-900 text-base leading-tight flex-1">{deal.title}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditDeal(deal)}>
                                <Edit className="w-4 h-4" /> Edit Deal
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteDeal(deal)}>
                                <Trash2 className="w-4 h-4" /> Delete Deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Value and Priority */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-green-600 text-lg">{deal.currency || "USD"} {deal.value?.toLocaleString()}</span>
                          <Badge className={`${getPriorityColor(deal.priority)} text-xs font-medium`}>
                            {deal.priority}
                          </Badge>
                        </div>

                        {/* Company and Contact Info */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-slate-700 truncate">{deal.company_id}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-6 h-6 flex-shrink-0">
                              <AvatarFallback className="bg-blue-500 text-white text-xs font-medium">
                                {/* You can fetch contact initials if needed */}
                                {deal.contact_id?.toString().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-600 truncate">{deal.contact_id}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="text-sm text-slate-600">{deal.close_date}</span>
                          </div>
                        </div>

                        {/* Probability Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-600">Probability</span>
                            <span className="text-xs font-bold text-slate-800">{deal.probability}%</span>
                          </div>
                          <Progress value={deal.probability} className="h-2" />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {/* Add Deal Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600 hover:text-slate-700 h-16 text-sm font-medium"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Deal
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
                      <DialogTitle>Add New Deal</DialogTitle>
                      <DealForm
                        deal={{ stage: stage.id }}
                        onSubmit={handleAddDeal}
                        onCancel={() => {}}
                        teamMembers={teamMembers}
                        contacts={contacts}
                      />
                    </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Edit Deal Sheet */}
        <Sheet open={isEditDealOpen} onOpenChange={(open) => { setIsEditDealOpen(open); if (!open) setEditDeal(null) }}>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
            <DialogTitle>Edit Deal</DialogTitle>
            <DealForm
              deal={editDeal}
              onSubmit={handleUpdateDeal}
              onCancel={() => { setIsEditDealOpen(false); setEditDeal(null) }}
              isEdit={true}
              teamMembers={teamMembers}
              contacts={contacts}
            />
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogHeader>
              <DialogTitle>Delete Deal</DialogTitle>
            </DialogHeader>
            <div>Are you sure you want to delete this deal? This action cannot be undone.</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteDeal} disabled={actionLoading}>
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {loading && <div className="p-6 text-center text-slate-500">Loading deals...</div>}
        {error && <div className="p-6 text-center text-red-500">{error}</div>}
      </div>
    </div>
  )
}
