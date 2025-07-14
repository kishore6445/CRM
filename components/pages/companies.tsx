"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function mapCompanyToForm(company: any) {
  return {
    name: company.name || "",
    website: company.website || "",
    industry: company.industry || "",
    size: company.size || "",
    revenue: company.revenue || "",
    phone: company.phone || "",
    email: company.email || "",
    address: company.address || "",
    city: company.city || "",
    state: company.state || "",
    zipCode: company.zip_code || "",
    country: company.country || "",
    description: company.description || "",
    tags: company.tags || [],
    socialMedia: company.social_media || {},
  }
}

function CompanyForm({ company, onSubmit, onCancel, isEdit = false }: any) {
  const [formData, setFormData] = useState(mapCompanyToForm(company || {}))
  const [isLoading, setIsLoading] = useState(false)
  const [newTag, setNewTag] = useState("")

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData("tags", [...formData.tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateFormData(
      "tags",
      formData.tags.filter((tag: string) => tag !== tagToRemove),
    )
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    await onSubmit(formData)
    setIsLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Company" : "Add New Company"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-medium" htmlFor="name">Name *</label>
                <Input id="name" value={formData.name} onChange={e => updateFormData("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="website">Website</label>
                <Input id="website" value={formData.website} onChange={e => updateFormData("website", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="industry">Industry</label>
                <Input id="industry" value={formData.industry} onChange={e => updateFormData("industry", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="size">Size</label>
                <Input id="size" value={formData.size} onChange={e => updateFormData("size", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="revenue">Revenue</label>
                <Input id="revenue" value={formData.revenue} onChange={e => updateFormData("revenue", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="phone">Phone</label>
                <Input id="phone" value={formData.phone} onChange={e => updateFormData("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="email">Email</label>
                <Input id="email" value={formData.email} onChange={e => updateFormData("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="address">Address</label>
                <Input id="address" value={formData.address} onChange={e => updateFormData("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="city">City</label>
                <Input id="city" value={formData.city} onChange={e => updateFormData("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="state">State</label>
                <Input id="state" value={formData.state} onChange={e => updateFormData("state", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="zipCode">ZIP Code</label>
                <Input id="zipCode" value={formData.zipCode} onChange={e => updateFormData("zipCode", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="font-medium" htmlFor="country">Country</label>
                <Input id="country" value={formData.country} onChange={e => updateFormData("country", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-medium">Description</label>
              <Input value={formData.description} onChange={e => updateFormData("description", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="font-medium">Tags</label>
              <div className="flex gap-2">
                <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Add a tag..." onKeyPress={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
                <Button type="button" onClick={addTag} variant="outline">Add Tag</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="gap-1">{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:bg-slate-300 rounded-full p-0.5">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>{isLoading ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update Company" : "Create Company"}</Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editCompany, setEditCompany] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteCompany, setDeleteCompany] = useState<any | null>(null)
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchCompanies = async () => {
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
      .from("companies")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
    if (error) setError(error.message)
    setCompanies(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleAddCompany = async (formData: any) => {
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
      name: formData.name,
      website: formData.website,
      industry: formData.industry,
      size: formData.size,
      revenue: formData.revenue,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      country: formData.country,
      description: formData.description,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      social_media: formData.socialMedia || {},
      created_by: user.id,
    }
    const { error: insertError } = await supabase.from("companies").insert(payload)
    setActionLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setIsAddOpen(false)
    fetchCompanies()
  }

  const handleEditCompany = (company: any) => {
    setEditCompany(company)
    setIsEditOpen(true)
  }

  const handleUpdateCompany = async (formData: any) => {
    if (!editCompany) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const payload = {
      name: formData.name,
      website: formData.website,
      industry: formData.industry,
      size: formData.size,
      revenue: formData.revenue,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      country: formData.country,
      description: formData.description,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      social_media: formData.socialMedia || {},
      updated_at: new Date().toISOString(),
    }
    const { error: updateError } = await supabase.from("companies").update(payload).eq("id", editCompany.id)
    setActionLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setIsEditOpen(false)
    setEditCompany(null)
    fetchCompanies()
  }

  const handleDeleteCompany = (company: any) => {
    setDeleteCompany(company)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCompany = async () => {
    if (!deleteCompany) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const { error: deleteError } = await supabase.from("companies").delete().eq("id", deleteCompany.id)
    setActionLoading(false)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setIsDeleteDialogOpen(false)
    setDeleteCompany(null)
    fetchCompanies()
  }

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      (company.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Companies</h1>
          <p className="text-slate-600 mt-1">Manage your business accounts and organizations</p>
        </div>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Company
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
            <CompanyForm
              onSubmit={handleAddCompany}
              onCancel={() => setIsAddOpen(false)}
              isEdit={false}
            />
          </SheetContent>
        </Sheet>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-lg">Companies ({filteredCompanies.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          {loading && <div className="p-6 text-center text-slate-500">Loading companies...</div>}
          {error && <div className="p-6 text-center text-red-500">{error}</div>}
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[150px]">Industry</TableHead>
                  <TableHead className="min-w-[150px]">Email</TableHead>
                  <TableHead className="min-w-[100px]">Phone</TableHead>
                  <TableHead className="min-w-[100px]">City</TableHead>
                  <TableHead className="min-w-[100px]">Country</TableHead>
                  <TableHead className="min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{company.name}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-700">{company.industry}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">{company.email}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">{company.phone}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">{company.city}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-600">{company.country}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEditCompany(company)} title="Edit Company">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteCompany(company)} title="Delete Company">
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

      {/* Edit Company Sheet */}
      <Sheet open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditCompany(null) }}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <CompanyForm
            company={editCompany ? mapCompanyToForm(editCompany) : undefined}
            onSubmit={handleUpdateCompany}
            onCancel={() => { setIsEditOpen(false); setEditCompany(null) }}
            isEdit={true}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this company? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteCompany} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 