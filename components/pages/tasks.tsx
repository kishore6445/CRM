"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Calendar,
  Clock,
  User,
  Building2,
  MoreHorizontal,
  Filter,
  CheckCircle2,
  AlertCircle,
  Circle,
  Edit,
  Trash2,
} from "lucide-react"
import { TaskForm } from "@/components/forms/task-form"
import { createClient } from "@/lib/supabase/client"

const priorityColors = {
  High: "bg-red-100 text-red-700 border-red-200",
  Medium: "bg-orange-100 text-orange-700 border-orange-200",
  Low: "bg-green-100 text-green-700 border-green-200",
}

const statusIcons = {
  pending: Circle,
  "in-progress": AlertCircle,
  completed: CheckCircle2,
}

const statusColors = {
  pending: "text-slate-500",
  "in-progress": "text-orange-500",
  completed: "text-green-500",
}

export function Tasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedView, setSelectedView] = useState("list")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editTask, setEditTask] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTask, setDeleteTask] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [contacts, setContacts] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const [deals, setDeals] = useState<{ id: string; title: string }[]>([])
  const [leads, setLeads] = useState<{ id: string; name: string }[]>([])
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [contactsLoading, setContactsLoading] = useState(true)
  const [contactsError, setContactsError] = useState<string | null>(null)
  const [linkedLoading, setLinkedLoading] = useState(true)
  const [linkedError, setLinkedError] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<{ id: string; first_name: string; last_name: string }[]>([])

  const fetchTasks = async () => {
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
      .from("tasks")
      .select("*")
      .eq("created_by", user.id)
      .order("due_date", { ascending: true })
    if (error) setError(error.message)
    setTasks(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    const fetchContacts = async () => {
      setContactsLoading(true)
      setContactsError(null)
      const supabase = createClient()
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      
      if (!user) {
        setContactsError("User not authenticated.")
        setContactsLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from("contacts")
        .select("id, first_name, last_name")
        .eq("created_by", user.id)
      if (error) setContactsError(error.message)
      setContacts(data || [])
      setContactsLoading(false)
    }
    fetchContacts()
  }, [])

  useEffect(() => {
    const fetchLinked = async () => {
      setLinkedLoading(true)
      setLinkedError(null)
      const supabase = createClient()
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      
      if (!user) {
        setLinkedError("User not authenticated.")
        setLinkedLoading(false)
        return
      }
      
      const [dealsRes, leadsRes, companiesRes] = await Promise.all([
        supabase.from("deals").select("id, title").eq("created_by", user.id),
        supabase.from("leads").select("id, first_name, last_name").eq("created_by", user.id),
        supabase.from("companies").select("id, name").eq("created_by", user.id),
      ])
      if (dealsRes.error || leadsRes.error || companiesRes.error) {
        setLinkedError(dealsRes.error?.message ?? leadsRes.error?.message ?? companiesRes.error?.message ?? null)      }
      setDeals(dealsRes.data || [])
      setLeads((leadsRes.data || []).map((lead: any) => ({
        id: lead.id,
        name: `${lead.first_name} ${lead.last_name}`,
      })))
      setCompanies(companiesRes.data || [])
      setLinkedLoading(false)
    }
    fetchLinked()
  }, [])

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const supabase = createClient()
      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) return
      // Get user's company
      const { data: profile } = await supabase.from("users").select("company").eq("id", user.id).single()
      if (!profile?.company) return
      // Fetch all users in the same company
      const { data: members } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .eq("company", profile.company)
      setTeamMembers(members || [])
    }
    fetchTeamMembers()
  }, [])

  const handleAddTask = async (formData: any) => {
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
    if (!formData.title || !formData.dueDate) {
      setError("Title and Due Date are required.")
      setActionLoading(false)
      return
    }
    const payload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority || "Medium",
      status: formData.status || "pending",
      due_date: new Date(formData.dueDate).toISOString().slice(0, 10),
      due_time: formData.dueTime || null,
      assigned_to: formData.assignedTo && formData.assignedTo !== "" ? formData.assignedTo : null,
      linked_to: formData.linkedTo || null,
      linked_type: formData.linkedType || null,
      category: formData.category || null,
      estimated_hours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      actual_hours: formData.actualHours ? parseFloat(formData.actualHours) : null,
      is_recurring: formData.isRecurring || false,
      recurring_type: formData.recurringType || null,
      reminder_before: formData.reminderBefore || null,
      notes: formData.notes,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      attachments: formData.attachments && formData.attachments.length > 0 ? formData.attachments : [],
      completed_at: formData.completedAt || null,
      created_by: user.id,
    }
    const { error: insertError } = await supabase.from("tasks").insert(payload)
    setActionLoading(false)
    if (insertError) {
      setError(insertError.message)
      return
    }
    setIsAddTaskOpen(false)
    fetchTasks()
  }

  const handleEditTask = (task: any) => {
    setEditTask(task)
    setIsEditTaskOpen(true)
  }

  const handleUpdateTask = async (formData: any) => {
    if (!editTask) return
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
      priority: formData.priority || "Medium",
      status: formData.status || "pending",
      due_date: formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 10) : null,
      due_time: formData.dueTime || null,
      assigned_to: formData.assignedTo && formData.assignedTo !== "" ? formData.assignedTo : null,
      linked_to: formData.linkedTo || null,
      linked_type: formData.linkedType || null,
      category: formData.category || null,
      estimated_hours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      actual_hours: formData.actualHours ? parseFloat(formData.actualHours) : null,
      is_recurring: formData.isRecurring || false,
      recurring_type: formData.recurringType || null,
      reminder_before: formData.reminderBefore || null,
      notes: formData.notes,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : [],
      attachments: formData.attachments && formData.attachments.length > 0 ? formData.attachments : [],
      completed_at: formData.completedAt || null,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }
    const { error: updateError } = await supabase.from("tasks").update(payload).eq("id", editTask.id)
    setActionLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setIsEditTaskOpen(false)
    setEditTask(null)
    fetchTasks()
  }

  const handleDeleteTask = (task: any) => {
    setDeleteTask(task)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteTask = async () => {
    if (!deleteTask) return
    setError(null)
    setActionLoading(true)
    const supabase = createClient()
    const { error: deleteError } = await supabase.from("tasks").delete().eq("id", deleteTask.id)
    setActionLoading(false)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    setIsDeleteDialogOpen(false)
    setDeleteTask(null)
    fetchTasks()
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesPriority && matchesStatus
  })

  const toggleTaskStatus = async (taskId: string) => {
    // Toggle between completed and pending
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const newStatus = task.status === "completed" ? "pending" : "completed"
    setActionLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId)
    setActionLoading(false)
    if (!updateError) fetchTasks()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-600 mt-1">Manage your daily tasks and follow-ups</p>
        </div>
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <UIDialogTitle>Add Task</UIDialogTitle>
            <TaskForm
              onSubmit={handleAddTask}
              onCancel={() => setIsAddTaskOpen(false)}
              contacts={contacts}
              deals={deals}
              leads={leads}
              companies={companies}
              teamMembers={teamMembers}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Circle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Tasks</p>
                <p className="text-2xl font-bold text-slate-900">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-slate-900">
                  {tasks.filter((task) => task.status === "in-progress").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-900">
                  {tasks.filter((task) => task.status === "completed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-slate-900">{tasks.filter((task) => {
                  const due = new Date(task.due_date)
                  return task.status !== "completed" && due < new Date()
                }).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const StatusIcon = statusIcons[task.status as keyof typeof statusIcons]
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={() => toggleTaskStatus(task.id)}
                    className="mt-1"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-medium ${task.status === "completed" ? "line-through text-slate-500" : "text-slate-900"}`}
                        >
                          {task.title}
                        </h3>
                        <StatusIcon className={`w-4 h-4 ${statusColors[task.status as keyof typeof statusColors]}`} />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}><Edit className="w-4 h-4" /> Edit Task</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleTaskStatus(task.id)}><CheckCircle2 className="w-4 h-4" /> Mark Complete</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task)}><Trash2 className="w-4 h-4" /> Delete Task</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{task.description}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                        {task.priority}
                      </Badge>

                      <div className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{task.due_date}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-blue-500 text-white text-xs">{task.avatar || "?"}</AvatarFallback>
                        </Avatar>
                        <span className="text-slate-600">{task.assignee || "-"}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-500">
                        {task.linked_type === "deal" ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span className="text-xs">{task.linked_to || "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={(open) => { setIsEditTaskOpen(open); if (!open) setEditTask(null) }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <UIDialogTitle>Edit Task</UIDialogTitle>
          <TaskForm
            task={editTask}
            onSubmit={handleUpdateTask}
            onCancel={() => { setIsEditTaskOpen(false); setEditTask(null) }}
            isEdit={true}
            contacts={contacts}
            deals={deals}
            leads={leads}
            companies={companies}
            teamMembers={teamMembers}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <UIDialogHeader>
            <UIDialogTitle>Delete Task</UIDialogTitle>
          </UIDialogHeader>
          <div>Are you sure you want to delete this task? This action cannot be undone.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteTask} disabled={actionLoading}>
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && <div className="p-6 text-center text-slate-500">Loading tasks...</div>}
      {error && <div className="p-6 text-center text-red-500">{error}</div>}
      {contactsLoading && <div className="p-6 text-center text-slate-500">Loading contacts...</div>}
      {contactsError && <div className="p-6 text-center text-red-500">{contactsError}</div>}
      {linkedLoading && <div className="p-6 text-center text-slate-500">Loading related data...</div>}
      {linkedError && <div className="p-6 text-center text-red-500">{linkedError}</div>}
    </div>
  )
}
