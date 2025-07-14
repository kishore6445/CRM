"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react"
import { LeadForm } from "@/components/forms/lead-form"
import { createClient } from "@/lib/supabase/client"

const statusColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-700 border-gray-200",
  contacted: "bg-blue-100 text-blue-700 border-blue-200",
  qualified: "bg-green-100 text-green-700 border-green-200",
  hot: "bg-red-100 text-red-700 border-red-200",
  warm: "bg-orange-100 text-orange-700 border-orange-200",
  cold: "bg-blue-100 text-blue-700 border-blue-200",
  unqualified: "bg-slate-100 text-slate-700 border-slate-200",
}

const sourceOptions = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "trade-show", label: "Trade Show" },
  { value: "cold-call", label: "Cold Call" },
  { value: "email-campaign", label: "Email Campaign" },
  { value: "social-media", label: "Social Media" },
  { value: "advertisement", label: "Advertisement" },
]

const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
  { value: "unqualified", label: "Unqualified" },
]

function mapLeadToForm(lead: any) {
  return {
    firstName: lead.first_name || "",
    lastName: lead.last_name || "",
    company: lead.company || "",
    title: lead.title || "",
    email: lead.email || "",
    phone: lead.phone || "",
    website: lead.website || "",
    source: lead.source || "",
    status: lead.status || "",
    estimatedValue: lead.estimated_value ? String(lead.estimated_value) : "",
    expectedCloseDate: lead.expected_close_date || null,
    address: lead.address || "",
    city: lead.city || "",
    state: lead.state || "",
    zipCode: lead.zip_code || "",
    country: lead.country || "",
    notes: lead.notes || "",
    tags: lead.tags || [],
  }
}

export function Leads() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [isEditLeadOpen, setIsEditLeadOpen] = useState(false)
  const [editLead, setEditLead] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteLead, setDeleteLead] = useState<any | null>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchLeads = async () => {
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
      .from("leads")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
    if (error) setError(error.message)
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleAddLead = async (formData: any) => {
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
      first_name: formData.firstName,
      last_name: formData.lastName,
      company: formData.company,
      title: formData.title,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      source: formData.source || null,
      status: formData.status || "new",
      estimated_value: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
      expected_close_date: formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().slice(0, 10) : null,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      country: formData.country,
      notes: formData.notes,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      created_by: user.id,
    }
    const { error: insertError } = await supabase.from("leads").insert(payload)
    setActionLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setIsAddLeadOpen(false)
    fetchLeads()
  }

  const handleEditLead = (lead: any) => {
    setEditLead(lead)
    setIsEditLeadOpen(true)
  }

  const handleUpdateLead = async (formData: any) => {
    if (!editLead) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      company: formData.company,
      title: formData.title,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      source: formData.source || null,
      status: formData.status || "new",
      estimated_value: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
      expected_close_date: formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().slice(0, 10) : null,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      country: formData.country,
      notes: formData.notes,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      updated_at: new Date().toISOString(),
    }
    const { error: updateError } = await supabase.from("leads").update(payload).eq("id", editLead.id)
    setActionLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setIsEditLeadOpen(false)
    setEditLead(null)
    fetchLeads()
  }

  const handleDeleteLead = (lead: any) => {
    setDeleteLead(lead)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteLead = async () => {
    if (!deleteLead) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const { error: deleteError } = await supabase.from("leads").delete().eq("id", deleteLead.id)
    setActionLoading(false)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setIsDeleteDialogOpen(false)
    setDeleteLead(null)
    fetchLeads()
  }

  const filteredLeads = leads.filter((lead) => {
    const name = `${lead.first_name} ${lead.last_name}`
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter
    return matchesSearch && matchesStatus && matchesSource
  })

  return (
    <div className="w-full h-full">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
            <p className="text-slate-600 mt-1">Manage and track your sales leads</p>
          </div>
          <Sheet open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span className="sm:inline">Add New Lead</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
              <LeadForm
                onSubmit={handleAddLead}
                onCancel={() => setIsAddLeadOpen(false)}
                isEdit={false}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 w-full">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search leads by name, company, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {sourceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="border-slate-200 w-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-lg">Leads ({filteredLeads.length})</span>
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto" disabled>
                <Filter className="w-4 h-4" />
                More Filters
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 w-full">
            {loading && <div className="p-6 text-center text-slate-500">Loading leads...</div>}
            {error && <div className="p-6 text-center text-red-500">{error}</div>}
            <div className="overflow-x-auto w-full">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Lead Name</TableHead>
                    <TableHead className="min-w-[150px]">Company</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Source</TableHead>
                    <TableHead className="min-w-[100px]">Value</TableHead>
                    <TableHead className="min-w-[120px]">Created At</TableHead>
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-medium text-slate-900">{lead.first_name} {lead.last_name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-700">{lead.company}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600">{lead.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[lead.status] || "bg-slate-100 text-slate-700 border-slate-200"}>{lead.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-700">{lead.source}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-slate-900">{lead.estimated_value ? `$${lead.estimated_value}` : "-"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "-"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEditLead(lead)} title="Edit Lead">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteLead(lead)} title="Delete Lead">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Lead Sheet */}
      <Sheet open={isEditLeadOpen} onOpenChange={(open) => { setIsEditLeadOpen(open); if (!open) setEditLead(null) }}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <LeadForm
            lead={editLead ? mapLeadToForm(editLead) : undefined}
            onSubmit={handleUpdateLead}
            onCancel={() => { setIsEditLeadOpen(false); setEditLead(null) }}
            isEdit={true}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this lead? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteLead} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
