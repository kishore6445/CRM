"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Grid3X3,
  List,
  Plus,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  Star,
  Building2,
  Edit,
  Trash2,
} from "lucide-react"
import { ContactForm } from "@/components/forms/contact-form"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

const tagColors = {
  VIP: "bg-purple-100 text-purple-700 border-purple-200",
  "Decision Maker": "bg-green-100 text-green-700 border-green-200",
  "Hot Lead": "bg-red-100 text-red-700 border-red-200",
  "Warm Lead": "bg-orange-100 text-orange-700 border-orange-200",
  Technical: "bg-blue-100 text-blue-700 border-blue-200",
  Referral: "bg-teal-100 text-teal-700 border-teal-200",
  "Follow-up": "bg-yellow-100 text-yellow-700 border-yellow-200",
}

function mapContactToForm(contact: any) {
  return {
    firstName: contact.first_name || "",
    lastName: contact.last_name || "",
    company: contact.company || "",
    title: contact.title || "",
    department: contact.department || "",
    email: contact.email || "",
    phone: contact.phone || "",
    mobile: contact.mobile || "",
    website: contact.website || "",
    linkedIn: contact.linkedin || "",
    twitter: contact.twitter || "",
    address: contact.address || "",
    city: contact.city || "",
    state: contact.state || "",
    zipCode: contact.zip_code || "",
    country: contact.country || "",
    birthday: contact.birthday || null,
    notes: contact.notes || "",
    tags: contact.tags || [],
    isVip: contact.is_vip || false,
    emailOptIn: contact.email_opt_in ?? true,
    smsOptIn: contact.sms_opt_in ?? false,
    preferredContact: contact.preferred_contact || "email",
    timezone: contact.timezone || "",
    language: contact.language || "en",
  }
}

export function Contacts() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddContactOpen, setIsAddContactOpen] = useState(false)
  const [isEditContactOpen, setIsEditContactOpen] = useState(false)
  const [editContact, setEditContact] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteContact, setDeleteContact] = useState<any | null>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchContacts = async () => {
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
      .from("contacts")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
    if (error) setError(error.message)
    setContacts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleAddContact = async (formData: any) => {
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
      department: formData.department,
      email: formData.email,
      phone: formData.phone,
      mobile: formData.mobile,
      website: formData.website,
      linkedin: formData.linkedIn,
      twitter: formData.twitter,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      country: formData.country,
      birthday: formData.birthday ? new Date(formData.birthday).toISOString().slice(0, 10) : null,
      notes: formData.notes,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      is_vip: formData.isVip,
      email_opt_in: formData.emailOptIn,
      sms_opt_in: formData.smsOptIn,
      preferred_contact: formData.preferredContact,
      timezone: formData.timezone,
      language: formData.language,
      created_by: user.id,
    }
    const { error: insertError } = await supabase.from("contacts").insert(payload)
    setActionLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setIsAddContactOpen(false)
    fetchContacts()
  }

  const handleEditContact = (contact: any) => {
    setEditContact(contact)
    setIsEditContactOpen(true)
  }

  const handleUpdateContact = async (formData: any) => {
    if (!editContact) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      company: formData.company,
      title: formData.title,
      department: formData.department,
      email: formData.email,
      phone: formData.phone,
      mobile: formData.mobile,
      website: formData.website,
      linkedin: formData.linkedIn,
      twitter: formData.twitter,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      country: formData.country,
      birthday: formData.birthday ? new Date(formData.birthday).toISOString().slice(0, 10) : null,
      notes: formData.notes,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      is_vip: formData.isVip,
      email_opt_in: formData.emailOptIn,
      sms_opt_in: formData.smsOptIn,
      preferred_contact: formData.preferredContact,
      timezone: formData.timezone,
      language: formData.language,
      updated_at: new Date().toISOString(),
    }
    const { error: updateError } = await supabase.from("contacts").update(payload).eq("id", editContact.id)
    setActionLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setIsEditContactOpen(false)
    setEditContact(null)
    fetchContacts()
  }

  const handleDeleteContact = (contact: any) => {
    setDeleteContact(contact)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteContact = async () => {
    if (!deleteContact) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const { error: deleteError } = await supabase.from("contacts").delete().eq("id", deleteContact.id)
    setActionLoading(false)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setIsDeleteDialogOpen(false)
    setDeleteContact(null)
    fetchContacts()
  }

  const filteredContacts = contacts.filter((contact) => {
    const name = `${contact.first_name} ${contact.last_name}`
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    // Status is not a column, so always matches
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600 mt-1">Manage your business contacts and relationships</p>
        </div>
        <Sheet open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
            <ContactForm
              onSubmit={handleAddContact}
              onCancel={() => setIsAddContactOpen(false)}
              isEdit={false}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Filters and View Toggle */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {/* Status filter removed since not in schema */}
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <List className="w-4 h-4" />
                List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Display */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {loading && <div className="p-6 text-center text-slate-500">Loading contacts...</div>}
        {error && <div className="p-6 text-center text-red-500">{error}</div>}
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {viewMode === "grid" ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`/placeholder.svg?height=48&width=48`} />
                        <AvatarFallback className="bg-blue-500 text-white font-medium">{contact.first_name?.[0]}{contact.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-slate-900">{contact.first_name} {contact.last_name}</h3>
                        <p className="text-sm text-slate-600">{contact.title}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleEditContact(contact)}>
                          <Edit className="w-4 h-4" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Star className="w-4 h-4" />
                          Add to Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleDeleteContact(contact)}>
                          <Trash2 className="w-4 h-4" />
                          Delete Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 className="w-4 h-4" />
                      {contact.company}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {contact.city}, {contact.state}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(contact.tags) && contact.tags.map((tag: string, index: number) => (
                      <Badge key={index} className={tagColors[tag as keyof typeof tagColors] + " text-xs"}>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="text-sm">
                      <span className="text-slate-500">Added:</span>
                      <span className="font-medium text-slate-900 ml-1">{contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "-"}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1">
                        <Mail className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Phone className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                      <AvatarFallback className="bg-blue-500 text-white">{contact.first_name?.[0]}{contact.last_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-slate-900">{contact.first_name} {contact.last_name}</h3>
                      <p className="text-sm text-slate-600">
                        {contact.title} {contact.company && `at ${contact.company}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-sm text-slate-600">{contact.email}</div>
                    <div className="text-sm text-slate-600">{contact.phone}</div>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(contact.tags) && contact.tags.slice(0, 2).map((tag: string, index: number) => (
                        <Badge key={index} className={tagColors[tag as keyof typeof tagColors] + " text-xs"}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-slate-900">{contact.created_at ? new Date(contact.created_at).toLocaleDateString() : "-"}</div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleEditContact(contact)}>
                          <Edit className="w-4 h-4" />
                          Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Star className="w-4 h-4" />
                          Add to Favorites
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-red-600" onClick={() => handleDeleteContact(contact)}>
                          <Trash2 className="w-4 h-4" />
                          Delete Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Contact Sheet */}
      <Sheet open={isEditContactOpen} onOpenChange={(open) => { setIsEditContactOpen(open); if (!open) setEditContact(null) }}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <ContactForm
            contact={editContact ? mapContactToForm(editContact) : undefined}
            onSubmit={handleUpdateContact}
            onCancel={() => { setIsEditContactOpen(false); setEditContact(null) }}
            isEdit={true}
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this contact? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteContact} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
