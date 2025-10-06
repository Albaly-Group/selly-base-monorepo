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
  FileText,
  Activity
} from "lucide-react"
import type { Company } from "@/lib/types"

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
  const [companyLists, setCompanyLists] = useState<any[]>([])
  const [isLoadingLists, setIsLoadingLists] = useState(false)
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

  const companyDetails = company

  if (!company) return null

  useEffect(() => {
    if (company && open) {
      const fetchCompanyLists = async () => {
        try {
          setIsLoadingLists(true)
          const response = await apiClient.getCompanyLists()
          if (response.data) {
            const filteredLists = response.data.map(list => ({
              id: list.id,
              name: list.name,
              status: list.status,
              owner: list.ownerUser?.name,
              addedDate: list.createdAt ? list.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
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
      fetchCompanyLists()
    }
  }, [company, open])

  const handleSaveContact = async () => {
    if (!company?.id) return

    try {
      setIsSavingContact(true)
      await apiClient.createCompanyContact({
        companyId: company.id,
        firstName: contactFormData.firstName,
        lastName: contactFormData.lastName,
        title: contactFormData.title,
        phone: contactFormData.phone,
        email: contactFormData.email,
      })
      
      // Reset form and close dialog
      setContactFormData({
        firstName: "",
        lastName: "",
        title: "",
        phone: "",
        email: "",
      })
      setShowAddContact(false)
      
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

    try {
      setIsSavingActivity(true)
      await apiClient.createCompanyActivity({
        companyId: company.id,
        activityType: activityFormData.activityType,
        outcome: activityFormData.outcome,
        content: activityFormData.content,
      })
      
      // Reset form and close dialog
      setActivityFormData({
        activityType: "",
        outcome: "",
        content: "",
      })
      setShowAddActivity(false)
      
      // Show success message (you can add a toast notification here)
      console.log('Activity logged successfully')
    } catch (error) {
      console.error('Failed to log activity:', error)
      alert('Failed to log activity. Please try again.')
    } finally {
      setIsSavingActivity(false)
    }
  }

  // Mock data
  // const contactPersons = [
  //   {
  //     id: "1",
  //     name: "Somchai Prasert",
  //     title: "Chief Technology Officer",
  //     department: "Technology",
  //     phone: "+66-2-123-4567",
  //     email: "somchai@example.co.th",
  //     linkedin: "https://linkedin.com/in/somchai-prasert",
  //     isDecisionMaker: true,
  //     status: "Active",
  //     lastVerified: "2024-12-05"
  //   },
  //   {
  //     id: "2", 
  //     name: "Sarah Johnson",
  //     title: "Business Development Manager",
  //     department: "Sales",
  //     phone: "+66-2-123-4568",
  //     email: "sarah@example.co.th",
  //     isDecisionMaker: false,
  //     status: "Active",
  //     lastVerified: "2024-12-01"
  //   }
  // ]

  // const activities = [
  //   {
  //     id: "1",
  //     type: "call",
  //     outcome: "Interested",
  //     content: "Discussed B2B software requirements. Interested in CRM solution.",
  //     contactPerson: "Somchai Prasert",
  //     createdBy: "John Sales Rep",
  //     createdAt: "2024-12-08T14:30:00Z"
  //   },
  //   {
  //     id: "2",
  //     type: "note", 
  //     content: "Company is expanding their digital transformation initiatives. Good prospect for Q1 2025.",
  //     createdBy: "Sarah Staff",
  //     createdAt: "2024-12-07T11:15:00Z"
  //   },
  //   {
  //     id: "3",
  //     type: "meeting",
  //     outcome: "Follow-up Required",
  //     content: "Initial product demo completed. Need to prepare custom proposal.",
  //     contactPerson: "Sarah Johnson",
  //     createdBy: "Mike Manager",
  //     createdAt: "2024-12-06T16:00:00Z"
  //   }
  // ]

  // const auditHistory = [
  //   {
  //     id: "1",
  //     field: "Phone",
  //     oldValue: "+66-2-123-4566",
  //     newValue: "+66-2-123-4567",
  //     changedBy: "Admin User",
  //     changedAt: "2024-12-05T10:30:00Z"
  //   },
  //   {
  //     id: "2",
  //     field: "Email", 
  //     oldValue: "info@oldexample.com",
  //     newValue: "info@example.co.th",
  //     changedBy: "System Import",
  //     changedAt: "2024-12-01T14:20:00Z"
  //   }
  // ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Needs Verification":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "Invalid":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
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
                      <div className="mt-1 font-mono">{companyDetails.registeredNo}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Registration Date</Label>
                      <div className="mt-1">{formatDate(companyDetails.registrationDate)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Data Completeness</Label>
                      <div className="mt-1">{companyDetails.dataCompleteness}%</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                      <div className="mt-1">{formatDate(companyDetails.updatedAt)}</div>
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
                    {companyDetails.contactPersons[0]?.phone && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Phone</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{companyDetails.contactPersons[0].phone}</span>
                          <Button variant="ghost" size="sm" className="p-1 h-6">
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {companyDetails.contactPersons[0]?.email && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Email</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <span>{companyDetails.contactPersons[0].email}</span>
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
              {/* {contactPersons.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium">{contact.name}</h4>
                          {contact.isDecisionMaker && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Decision Maker
                            </Badge>
                          )}
                          <Badge variant="secondary" className={getStatusColor(contact.status) + " text-xs"}>
                            {contact.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {contact.title} • {contact.department}
                        </div>
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
                        <div className="text-xs text-gray-500">
                          Last verified: {formatDate(contact.lastVerified)}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))} */}
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
              {/* {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent>
                    <div className="flex gap-3">
                      <div className="p-2rounded-full">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{activity.type}</Badge>
                          {activity.outcome && (
                            <Badge variant="secondary">{activity.outcome}</Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            by {activity.createdBy}
                          </span>
                        </div>
                        <div className="text-sm">{activity.content}</div>
                        {activity.contactPerson && (
                          <div className="text-sm text-gray-600">
                            Contact: {activity.contactPerson}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {formatDateTime(activity.createdAt)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))} */}
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
                    <TableCell>{formatDate(list.addedDate)}</TableCell>
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
                    <TableCell>{formatDateTime(change.changedAt)}</TableCell>
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
                    onChange={(e) => setContactFormData({ ...contactFormData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input 
                    placeholder="Enter last name"
                    value={contactFormData.lastName}
                    onChange={(e) => setContactFormData({ ...contactFormData, lastName: e.target.value })}
                  />
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
                    onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    placeholder="contact@company.com"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                  />
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
                  <Label>Activity Type</Label>
                  <Select 
                    value={activityFormData.activityType}
                    onValueChange={(value) => setActivityFormData({ ...activityFormData, activityType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
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