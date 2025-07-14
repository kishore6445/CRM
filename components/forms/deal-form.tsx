"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface DealFormProps {
  deal?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isEdit?: boolean
  teamMembers: any[];
  contacts: any[];
}

export function DealForm({ deal, onSubmit, onCancel, isEdit = false, teamMembers, contacts }: DealFormProps) {
  const [formData, setFormData] = useState({
    title: deal?.title || "",
    description: deal?.description || "",
    value: deal?.value || "",
    stage: deal?.stage || "lead-in",
    probability: deal?.probability || [20],
    priority: deal?.priority || "medium",
    closeDate: deal?.closeDate || null,
    contactId: deal?.contactId || "",
    companyId: deal?.companyId || "",
    assignedTo: deal?.assignedTo || "",
    source: deal?.source || "",
    type: deal?.type || "",
    currency: deal?.currency || "USD",
    notes: deal?.notes || "",
    tags: deal?.tags || [],
    competitors: deal?.competitors || [],
    nextSteps: deal?.nextSteps || "",
    lossReason: deal?.lossReason || "",
  })

  const [newTag, setNewTag] = useState("")
  const [newCompetitor, setNewCompetitor] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.value || !formData.closeDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      onSubmit({ ...formData, probability: formData.probability[0] })
      toast({
        title: "Success",
        description: `Deal ${isEdit ? "updated" : "created"} successfully!`,
      })
    }, 1000)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      updateFormData("competitors", [...formData.competitors, newCompetitor.trim()])
      setNewCompetitor("")
    }
  }

  const removeCompetitor = (competitorToRemove: string) => {
    updateFormData(
      "competitors",
      formData.competitors.filter((comp: string) => comp !== competitorToRemove),
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Deal" : "Add New Deal"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Deal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    placeholder="Enterprise Software License"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Deal Value *</Label>
                  <div className="flex gap-2">
                    <Select value={formData.currency} onValueChange={(value) => updateFormData("currency", value)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="value"
                      value={formData.value}
                      onChange={(e) => updateFormData("value", e.target.value)}
                      placeholder="45000"
                      required
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Deal Stage</Label>
                  <Select value={formData.stage} onValueChange={(value) => updateFormData("stage", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead-in">Lead In</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="proposal">Proposal Sent</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => updateFormData("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Deal Type</Label>
                  <Select value={formData.type} onValueChange={(value) => updateFormData("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-business">New Business</SelectItem>
                      <SelectItem value="existing-customer">Existing Customer</SelectItem>
                      <SelectItem value="renewal">Renewal</SelectItem>
                      <SelectItem value="upsell">Upsell</SelectItem>
                      <SelectItem value="cross-sell">Cross-sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  placeholder="Brief description of the deal..."
                  rows={3}
                />
              </div>
            </div>

            {/* Deal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Deal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expected Close Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.closeDate ? format(formData.closeDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.closeDate}
                        onSelect={(date) => updateFormData("closeDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Lead Source</Label>
                  <Select value={formData.source} onValueChange={(value) => updateFormData("source", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="trade-show">Trade Show</SelectItem>
                      <SelectItem value="cold-call">Cold Call</SelectItem>
                      <SelectItem value="email-campaign">Email Campaign</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactId">Primary Contact</Label>
                  <Select value={formData.contactId} onValueChange={(value) => updateFormData("contactId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.length === 0 ? (
                        <SelectItem value="none" disabled>No contacts found</SelectItem>
                      ) : (
                        contacts.map(contact => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name} ({contact.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Select value={formData.assignedTo} onValueChange={(value) => updateFormData("assignedTo", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.length === 0 ? (
                        <SelectItem value="none" disabled>No team members found</SelectItem>
                      ) : (
                        teamMembers.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.first_name} {member.last_name} ({member.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Probability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Win Probability</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Probability of Closing</Label>
                    <span className="text-sm font-medium text-slate-900">{formData.probability[0]}%</span>
                  </div>
                  <Slider
                    value={Array.isArray(formData.probability) ? formData.probability : [formData.probability]}
                    onValueChange={(value) => updateFormData("probability", value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitors */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Competitors</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newCompetitor}
                    onChange={(e) => setNewCompetitor(e.target.value)}
                    placeholder="Add a competitor..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
                  />
                  <Button type="button" onClick={addCompetitor} variant="outline">
                    Add
                  </Button>
                </div>
                {formData.competitors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.competitors.map((competitor: string, index: number) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        {competitor}
                        <button
                          type="button"
                          onClick={() => removeCompetitor(competitor)}
                          className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">Tags</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add Tag
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Next Steps & Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Additional Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nextSteps">Next Steps</Label>
                  <Textarea
                    id="nextSteps"
                    value={formData.nextSteps}
                    onChange={(e) => updateFormData("nextSteps", e.target.value)}
                    placeholder="What are the next steps for this deal?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateFormData("notes", e.target.value)}
                    placeholder="Add any additional notes about this deal..."
                    rows={4}
                  />
                </div>
                {formData.stage === "lost" && (
                  <div className="space-y-2">
                    <Label htmlFor="lossReason">Loss Reason</Label>
                    <Select value={formData.lossReason} onValueChange={(value) => updateFormData("lossReason", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price too high</SelectItem>
                        <SelectItem value="competitor">Lost to competitor</SelectItem>
                        <SelectItem value="timing">Bad timing</SelectItem>
                        <SelectItem value="budget">No budget</SelectItem>
                        <SelectItem value="features">Missing features</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Saving..." : isEdit ? "Update Deal" : "Create Deal"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
