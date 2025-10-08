"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CompanyEditDialog } from "@/components/company-edit-dialog"
import { AddToListDialog } from "@/components/add-to-list-dialog"
import { apiClient } from "@/lib/api-client"
import { 
  Building, 
  Users, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Calendar, 
  Edit, 
  Plus, 
  Trash2, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileText,
  Activity
} from "lucide-react"
import type { Company } from "@/lib/types"
import { createContactSchema, createActivitySchema } from "@/lib/validation-schemas"
import { useFormValidation } from "@/hooks/use-form-validation"

interface CompanyDetailDrawerProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCompanyUpdated?: (company: Company) => void
}

export function CompanyDetailDrawer({ company, open, onOpenChange, onCompanyUpdated }: CompanyDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showAddContact, setShowAddContact] = useState(false)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddToListDialog, setShowAddToListDialog] = useState(false)
  const [showEditContact, setShowEditContact] = useState(false)
  const [showEditActivity, setShowEditActivity] = useState(false)
  const [editingContact, setEditingContact] = useState<any>(null)
  const [editingActivity, setEditingActivity] = useState<any>(null)
  const [companyLists, setCompanyLists] = useState<any[]>([])
  const [isLoadingLists, setIsLoadingLists] = useState(false)
  const [contacts, setContacts] = useState<any[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [activities, setActivities] = useState<any[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [contactFormData, setContactFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    phone: "",
    email: "",
  })
  const [activityFormData, setActivityFormData] = useState({
    activityType: "",
    outcome: "",
    content: "",
  })
  const [isSavingContact, setIsSavingContact] = useState(false)
  const [isSavingActivity, setIsSavingActivity] = useState(false)
  
  const contactValidation = useFormValidation(createContactSchema)
  const activityValidation = useFormValidation(createActivitySchema)

  const companyDetails = company

  console.log(company)

  useEffect(() => {
    if (company && open) {
      const fetchCompanyLists = async () => {
        try {
          setIsLoadingLists(true)
          const response = await apiClient.getCompanyLists()
          console.log("Respones", response)
          if (response.data) {
            const filteredLists = response.data.map((list: any) => ({
              id: list.id,
              name: list.name,
              status: list.status,
              owner: list.ownerUser?.name,
              addedDate: list.createdAt
            }))
            setCompanyLists(filteredLists)
          }
        } catch (error) {
          console.error('Failed to fetch company lists:', error)
          setCompanyLists([])
        } finally {
          setIsLoadingLists(false)
        }
      }
      
      const fetchContacts = async () => {
        if (!company?.id) return
        try {
          setIsLoadingContacts(true)
          const response = await apiClient.getCompanyContacts(company.id)
          if (response.data) {
            setContacts(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch contacts:', error)
          setContacts([])
        } finally {
          setIsLoadingContacts(false)
        }
      }
      
      const fetchActivities = async () => {
        if (!company?.id) return
        try {
          setIsLoadingActivities(true)
          const response = await apiClient.getCompanyActivities({ companyId: company.id })
          if (response.data) {
            setActivities(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch activities:', error)
          setActivities([])
        } finally {
          setIsLoadingActivities(false)
        }
      }
      
      fetchCompanyLists()
      fetchContacts()
      fetchActivities()
    }
  }, [company, open])

  const handleSaveContact = async () => {
    if (!company?.id) return

    // Build contact data, only including non-empty fields
    const contactData: any = {
      companyId: company.id,
    }
    
    if (contactFormData.firstName.trim()) contactData.firstName = contactFormData.firstName.trim()
    if (contactFormData.lastName.trim()) contactData.lastName = contactFormData.lastName.trim()
    if (contactFormData.title.trim()) contactData.title = contactFormData.title.trim()
    if (contactFormData.phone.trim()) contactData.phone = contactFormData.phone.trim()
    if (contactFormData.email.trim()) contactData.email = contactFormData.email.trim()

    if (!contactValidation.validate(contactData)) {
      alert('Please fix validation errors before saving')
      return
    }

    try {
      setIsSavingContact(true)
      await apiClient.createCompanyContact(contactData)
      
      // Reset form and close dialog
      setContactFormData({
        firstName: "",
        lastName: "",
        title: "",
        phone: "",
        email: "",
      })
      setShowAddContact(false)
      
      // Refresh contacts list to show the new contact instantly
      try {
        setIsLoadingContacts(true)
        const response = await apiClient.getCompanyContacts(company.id)
        if (response.data) {
          setContacts(response.data)
        }
      } catch (fetchError) {
        console.error('Failed to refresh contacts:', fetchError)
      } finally {
        setIsLoadingContacts(false)
      }
      
      // Show success message (you can add a toast notification here)
      console.log('Contact added successfully')
    } catch (error) {
      console.error('Failed to add contact:', error)
      alert('Failed to add contact. Please try again.')
    } finally {
      setIsSavingContact(false)
    }
  }

  const handleSaveActivity = async () => {
    if (!company?.id) return

    // Build activity data, only including non-empty fields
    const activityData: any = {
      companyId: company.id,
      activityType: activityFormData.activityType,
    }
    
    if (activityFormData.outcome.trim()) activityData.outcome = activityFormData.outcome.trim()
    if (activityFormData.content.trim()) activityData.content = activityFormData.content.trim()

    if (!activityValidation.validate(activityData)) {
      alert('Please fix validation errors before saving')
      return
    }

    try {
      setIsSavingActivity(true)
      await apiClient.createCompanyActivity(activityData)
      
      // Reset form and close dialog
      setActivityFormData({
        activityType: "",
        outcome: "",
        content: "",
      })
      setShowAddActivity(false)
      
      // Refresh activities list to show the new activity instantly
      try {
        setIsLoadingActivities(true)
        const response = await apiClient.getCompanyActivities({ companyId: company.id })
        if (response.data) {
          setActivities(response.data)
        }
      } catch (fetchError) {
        console.error('Failed to refresh activities:', fetchError)
      } finally {
        setIsLoadingActivities(false)
      }
      
      // Show success message (you can add a toast notification here)
      console.log('Activity logged successfully')
    } catch (error) {
      console.error('Failed to log activity:', error)
      alert('Failed to log activity. Please try again.')
    } finally {
      setIsSavingActivity(false)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!company?.id) return
    
    if (!confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      await apiClient.deleteCompanyContact(contactId)
      
      // Refresh contacts list
      const response = await apiClient.getCompanyContacts(company.id)
      if (response.data) {
        setContacts(response.data)
      }
      
      console.log('Contact deleted successfully')
    } catch (error) {
      console.error('Failed to delete contact:', error)
      alert('Failed to delete contact. Please try again.')
    }
  }

  const handleEditContact = async (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId)
    if (contact) {
      setEditingContact(contact)
      setContactFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        title: contact.title || "",
        phone: contact.phone || "",
        email: contact.email || "",
      })
      setShowEditContact(true)
    }
  }

  const handleUpdateContact = async () => {
    if (!company?.id || !editingContact) return

    // Build contact data, only including non-empty fields
    const contactData: any = {
      companyId: company.id,
    }
    
    if (contactFormData.firstName.trim()) contactData.firstName = contactFormData.firstName.trim()
    if (contactFormData.lastName.trim()) contactData.lastName = contactFormData.lastName.trim()
    if (contactFormData.title.trim()) contactData.title = contactFormData.title.trim()
    if (contactFormData.phone.trim()) contactData.phone = contactFormData.phone.trim()
    if (contactFormData.email.trim()) contactData.email = contactFormData.email.trim()

    if (!contactValidation.validate(contactData)) {
      alert('Please fix validation errors before saving')
      return
    }

    try {
      setIsSavingContact(true)
      await apiClient.updateCompanyContact(editingContact.id, contactData)
      
      // Close dialog
      setShowEditContact(false)
      setEditingContact(null)
      
      // Refresh contacts list
      const response = await apiClient.getCompanyContacts(company.id)
      if (response.data) {
        setContacts(response.data)
      }
      
      console.log('Contact updated successfully')
    } catch (error) {
      console.error('Failed to update contact:', error)
      alert('Failed to update contact. Please try again.')
    } finally {
      setIsSavingContact(false)
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!company?.id) return
    
    if (!confirm('Are you sure you want to delete this activity?')) {
      return
    }

    try {
      await apiClient.deleteCompanyActivity(activityId)
      
      // Refresh activities list
      const response = await apiClient.getCompanyActivities({ companyId: company.id })
      if (response.data) {
        setActivities(response.data)
      }
      
      console.log('Activity deleted successfully')
    } catch (error) {
      console.error('Failed to delete activity:', error)
      alert('Failed to delete activity. Please try again.')
    }
  }

  const handleEditActivity = async (activityId: string) => {
    const activity = activities.find(a => a.id === activityId)
    if (activity) {
      setEditingActivity(activity)
      setActivityFormData({
        activityType: activity.activityType || "",
        outcome: activity.details?.outcome || "",
        content: activity.details?.content || "",
      })
      setShowEditActivity(true)
    }
  }

  const handleUpdateActivity = async () => {
    if (!company?.id || !editingActivity) return

    // Build activity data, only including non-empty fields
    // Note: companyId should NOT be included in update payload
    const activityData: any = {
      activityType: activityFormData.activityType,
    }
    
    if (activityFormData.outcome.trim()) activityData.outcome = activityFormData.outcome.trim()
    if (activityFormData.content.trim()) activityData.content = activityFormData.content.trim()

    // For validation, we need to include companyId temporarily
    const validationData = { ...activityData, companyId: company.id }
    if (!activityValidation.validate(validationData)) {
      alert('Please fix validation errors before saving')
      return
    }

    try {
      setIsSavingActivity(true)
      await apiClient.updateCompanyActivity(editingActivity.id, activityData)
      
      // Close dialog
      setShowEditActivity(false)
      setEditingActivity(null)
      
      // Refresh activities list
      const response = await apiClient.getCompanyActivities({ companyId: company.id })
      if (response.data) {
        setActivities(response.data)
      }
      
      console.log('Activity updated successfully')
    } catch (error) {
      console.error('Failed to update activity:', error)
      alert('Failed to update activity. Please try again.')
    } finally {
      setIsSavingActivity(false)
    }
  }
  if (!company) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "font-bold bg-green-100 text-green-800"
      case "unverified":
        return "font-bold bg-red-100 text-red-800"
      default:
        return "font-bold bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "meeting":
        return <Users className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const onAddContact = async() => {
    console.log('Add contact')
    
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] w-[95vw] h-[90vh] max-h-[900px] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b mt-8">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl">{company.companyNameEn}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className={getStatusColor(company.verificationStatus)}>
                  {company.verificationStatus}
                </Badge>
                {company.isSharedData && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Shared Reference Data
                  </Badge>
                )}
                <Badge variant="outline">
                  {company.industrialName}
                </Badge>
                <Badge variant="outline">{company.province}</Badge>
              </div>
              <DialogDescription>
                <span>Registration ID: {company.registrationId}</span>
                <span>•</span>
                <span>Data Completeness: {company.dataCompleteness}%</span>
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {!company.isSharedData ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs sm:text-sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs sm:text-sm"
                  disabled
                  title="Cannot edit shared reference data"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm"
                onClick={() => setShowAddToListDialog(true)}
              >
                <span className="hidden sm:inline">Add to List</span>
                <span className="sm:hidden">List</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6">
          {company.isSharedData && (
            <div className="mt-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Shared Reference Data</p>
                <p className="text-blue-700 mt-1">
                  This company is from a shared data source and cannot be edited. You can still add contacts and log activities.
                </p>
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mb-4 text-xs sm:text-sm">
              <TabsTrigger value="overview" className="px-2">Overview</TabsTrigger>
              <TabsTrigger value="contacts" className="px-2">Contacts</TabsTrigger>
              <TabsTrigger value="activity" className="px-2">Activity</TabsTrigger>
              <TabsTrigger value="lists" className="px-2">Lists</TabsTrigger>
              <TabsTrigger value="history" className="px-2">History</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pb-6">

          <TabsContent value="overview" className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Company Name</Label>
                      <div className="mt-1">{companyDetails.companyNameEn}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Industry</Label>
                      <div className="mt-1">{companyDetails.industrialName}</div>
                    </div>
                    {/* <div>
                      <Label className="text-sm font-medium text-gray-600">Business Type</Label>
                      <div className="mt-1">{companyDetails.businessType}</div>
                    </div> */}
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Employee Count</Label>
                      <div className="mt-1">{companyDetails.employeeCountEstimate}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Registration ID</Label>
                      <div className="mt-1 font-mono">{companyDetails.registrationId}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Registration Date</Label>
                      <div className="mt-1">{new Date(companyDetails.registrationDate).toDateString()}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Data Completeness</Label>
                      <div className="mt-1">{companyDetails.dataCompleteness}%</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                      <div className="mt-1">{new Date(companyDetails.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {companyDetails.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Description</Label>
                    <div className="mt-1 text-sm">{companyDetails.description}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location & Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <div className="mt-1">{companyDetails.address1}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">District</Label>
                      <div className="mt-1">{companyDetails.district}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Province</Label>
                      <div className="mt-1">{companyDetails.province}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {companyDetails.contactPersons?.[0]?.phone && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{companyDetails.contactPersons?.[0]?.phone}</span>
                          <Button variant="ghost" size="sm" className="p-1 h-6">
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {companyDetails.contactPersons?.[0]?.email && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{companyDetails.contactPersons?.[0]?.email}</span>
                          <Button variant="ghost" size="sm" className="p-1 h-6">
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {companyDetails.primaryEmail && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Website</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{companyDetails.primaryEmail}</span>
                          <Button variant="ghost" size="sm" className="p-1 h-6">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Validate Registration
                  </Button>
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-1" />
                    Refresh Signals
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add to List
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h3 className="text-lg font-medium">Contact Persons</h3>
              <Button onClick={() => setShowAddContact(true)} size="sm" className="gap-1 self-start sm:self-center">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Contact</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            <div className="space-y-4">
              {isLoadingContacts ? (
                <div className="text-center text-gray-500 py-8">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No contacts found. Add your first contact above.</div>
              ) : (
                contacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">
                              {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'N/A'}
                            </h4>
                          </div>
                          {(contact.title || contact.department) && (
                            <div className="text-sm text-gray-600">
                              {[contact.title, contact.department].filter(Boolean).join(' • ')}
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                            {contact.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span className="break-all">{contact.phone}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="break-all">{contact.email}</span>
                              </div>
                            )}
                          </div>
                          {contact.lastVerifiedAt && (
                            <div className="text-xs text-gray-500">
                              Last verified: {new Date(contact.lastVerifiedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditContact(contact.id)}
                            title="Edit contact"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteContact(contact.id)}
                            title="Delete contact"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h3 className="text-lg font-medium">Activity Timeline</h3>
              <Button onClick={() => setShowAddActivity(true)} size="sm" className="gap-1 self-start sm:self-center">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Log Activity</span>
                <span className="sm:hidden">Log</span>
              </Button>
            </div>

            <div className="space-y-4">
              {isLoadingActivities ? (
                <div className="text-center text-gray-500 py-8">Loading activities...</div>
              ) : activities.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No activities logged yet. Log your first activity above.</div>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-full bg-gray-100">
                          {getActivityIcon(activity.activityType)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{activity.activityType}</Badge>
                            {activity.details?.outcome && (
                              <Badge variant="secondary">{activity.details.outcome}</Badge>
                            )}
                            {activity.user && (
                              <span className="text-sm text-gray-500">
                                by {activity.user.name || activity.user.email}
                              </span>
                            )}
                          </div>
                          {activity.details?.content && (
                            <div className="text-sm">{activity.details.content}</div>
                          )}
                          {activity.details?.contactPerson && (
                            <div className="text-sm text-gray-600">
                              Contact: {activity.details.contactPerson}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditActivity(activity.id)}
                            title="Edit activity"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteActivity(activity.id)}
                            title="Delete activity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Lists */}
          <TabsContent value="lists" className="space-y-6">
            <h3 className="text-lg font-medium">Lists Containing This Company</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>List Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyLists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">{list.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(list.status)}>
                        {list.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{list.owner}</TableCell>
                    <TableCell>{new Date(list.addedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Open List
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-6">
            <h3 className="text-lg font-medium">Audit Trail</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* {auditHistory.map((change) => (
                  <TableRow key={change.id}>
                    <TableCell className="font-medium">{change.field}</TableCell>
                    <TableCell className="text-red-600">{change.oldValue}</TableCell>
                    <TableCell className="text-green-600">{change.newValue}</TableCell>
                    <TableCell>{change.changedBy}</TableCell>
                    <TableCell>{new Date(change.changedAt).tolocalString()}</TableCell>
                  </TableRow>
                ))} */}
              </TableBody>
            </Table>
          </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Add Contact Dialog */}
        <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
          <DialogContent className="w-[95vw] max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Contact Person</DialogTitle>
              <DialogDescription>
                Add a new contact person for {company.companyNameEn}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    placeholder="Enter first name"
                    value={contactFormData.firstName}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, firstName: e.target.value })
                      contactValidation.clearError('firstName')
                    }}
                    className={contactValidation.hasError('firstName') ? 'border-red-500' : ''}
                  />
                  {contactValidation.hasError('firstName') && (
                    <p className="text-sm text-red-500">{contactValidation.getError('firstName')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    placeholder="Enter last name"
                    value={contactFormData.lastName}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, lastName: e.target.value })
                      contactValidation.clearError('lastName')
                    }}
                    className={contactValidation.hasError('lastName') ? 'border-red-500' : ''}
                  />
                  {contactValidation.hasError('lastName') && (
                    <p className="text-sm text-red-500">{contactValidation.getError('lastName')}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title/Position</Label>
                <Input 
                  placeholder="e.g., Chief Technology Officer"
                  value={contactFormData.title}
                  onChange={(e) => setContactFormData({ ...contactFormData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    placeholder="+66-2-123-4567"
                    value={contactFormData.phone}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, phone: e.target.value })
                      contactValidation.clearError('phone')
                    }}
                    className={contactValidation.hasError('phone') ? 'border-red-500' : ''}
                  />
                  {contactValidation.hasError('phone') && (
                    <p className="text-sm text-red-500">{contactValidation.getError('phone')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="contact@company.com"
                    value={contactFormData.email}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, email: e.target.value })
                      contactValidation.clearError('email')
                    }}
                    className={contactValidation.hasError('email') ? 'border-red-500' : ''}
                  />
                  {contactValidation.hasError('email') && (
                    <p className="text-sm text-red-500">{contactValidation.getError('email')}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddContact(false)} disabled={isSavingContact}>
                Cancel
              </Button>
              <Button onClick={handleSaveContact} disabled={isSavingContact}>
                {isSavingContact ? 'Saving...' : 'Add Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Activity Dialog */}
        <Dialog open={showAddActivity} onOpenChange={setShowAddActivity}>
          <DialogContent className="w-[95vw] max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
              <DialogDescription>
                Record a new activity for {company.companyNameEn}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Activity Type <span className="text-red-500">*</span></Label>
                  <Select 
                    value={activityFormData.activityType}
                    onValueChange={(value) => {
                      setActivityFormData({ ...activityFormData, activityType: value })
                      activityValidation.clearError('activityType')
                    }}
                  >
                    <SelectTrigger className={activityValidation.hasError('activityType') ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  {activityValidation.hasError('activityType') && (
                    <p className="text-sm text-red-500">{activityValidation.getError('activityType')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select
                    value={activityFormData.outcome}
                    onValueChange={(value) => setActivityFormData({ ...activityFormData, outcome: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="not-interested">Not Interested</SelectItem>
                      <SelectItem value="follow-up">Follow-up Required</SelectItem>
                      <SelectItem value="qualified">Qualified Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Enter activity details..." 
                  rows={3}
                  value={activityFormData.content}
                  onChange={(e) => setActivityFormData({ ...activityFormData, content: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddActivity(false)} disabled={isSavingActivity}>
                Cancel
              </Button>
              <Button onClick={handleSaveActivity} disabled={isSavingActivity}>
                {isSavingActivity ? 'Saving...' : 'Log Activity'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={showEditContact} onOpenChange={setShowEditContact}>
          <DialogContent className="w-[95vw] max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Contact Person</DialogTitle>
              <DialogDescription>
                Update contact information for {editingContact?.fullName || 'contact'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input 
                    placeholder="Enter first name"
                    value={contactFormData.firstName}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, firstName: e.target.value })
                      contactValidation.clearError('firstName')
                    }}
                    className={contactValidation.hasError('firstName') ? 'border-red-500' : ''}
                  />
                  {contactValidation.hasError('firstName') && (
                    <p className="text-sm text-red-500">{contactValidation.getError('firstName')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    placeholder="Enter last name"
                    value={contactFormData.lastName}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, lastName: e.target.value })
                      contactValidation.clearError('lastName')
                    }}
                    className={contactValidation.hasError('lastName') ? 'border-red-500' : ''}
                  />
                  {contactValidation.hasError('lastName') && (
                    <p className="text-sm text-red-500">{contactValidation.getError('lastName')}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title/Position</Label>
                <Input 
                  placeholder="e.g., Chief Technology Officer"
                  value={contactFormData.title}
                  onChange={(e) => setContactFormData({ ...contactFormData, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    placeholder="+66-2-123-4567"
                    value={contactFormData.phone}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, phone: e.target.value })
                      contactValidation.clearError('phone')
                    }}
                    className={contactValidation.hasError('phone') ? 'border-red-500' : ''}
                  />
                  {contactValidation.hasError('phone') && (
                    <p className="text-sm text-red-500">{contactValidation.getError('phone')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="contact@company.com"
                    value={contactFormData.email}
                    onChange={(e) => {
                      setContactFormData({ ...contactFormData, email: e.target.value })
                      contactValidation.clearError('email')
                    }}
                    className={contactValidation.hasError('email') ? 'border-red-500' : ''}
                  />
                  {contactValidation.hasError('email') && (
                    <p className="text-sm text-red-500">{contactValidation.getError('email')}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditContact(false)} disabled={isSavingContact}>
                Cancel
              </Button>
              <Button onClick={handleUpdateContact} disabled={isSavingContact}>
                {isSavingContact ? 'Saving...' : 'Update Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Activity Dialog */}
        <Dialog open={showEditActivity} onOpenChange={setShowEditActivity}>
          <DialogContent className="w-[95vw] max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
              <DialogDescription>
                Update activity details for {company.companyNameEn}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Activity Type <span className="text-red-500">*</span></Label>
                  <Select 
                    value={activityFormData.activityType}
                    onValueChange={(value) => {
                      setActivityFormData({ ...activityFormData, activityType: value })
                      activityValidation.clearError('activityType')
                    }}
                  >
                    <SelectTrigger className={activityValidation.hasError('activityType') ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  {activityValidation.hasError('activityType') && (
                    <p className="text-sm text-red-500">{activityValidation.getError('activityType')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select
                    value={activityFormData.outcome}
                    onValueChange={(value) => setActivityFormData({ ...activityFormData, outcome: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="not-interested">Not Interested</SelectItem>
                      <SelectItem value="follow-up">Follow-up Required</SelectItem>
                      <SelectItem value="qualified">Qualified Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea 
                  placeholder="Enter activity details..." 
                  rows={3}
                  value={activityFormData.content}
                  onChange={(e) => setActivityFormData({ ...activityFormData, content: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditActivity(false)} disabled={isSavingActivity}>
                Cancel
              </Button>
              <Button onClick={handleUpdateActivity} disabled={isSavingActivity}>
                {isSavingActivity ? 'Saving...' : 'Update Activity'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Company Edit Dialog */}
        <CompanyEditDialog
          company={company}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={(updatedCompany) => {
            console.log('Company updated:', updatedCompany)
            if (onCompanyUpdated) {
              onCompanyUpdated(updatedCompany)
            }
            setShowEditDialog(false)
          }}
        />
        
        {/* Add to List Dialog */}
        <AddToListDialog
          open={showAddToListDialog}
          onOpenChange={setShowAddToListDialog}
          selectedCompanyIds={company ? [company.id] : []}
          onSuccess={() => {
            console.log('Company added to list successfully')
            setShowAddToListDialog(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}