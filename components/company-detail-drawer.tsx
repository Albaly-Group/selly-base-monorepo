"use client"

import { useState } from "react"
import type { Company } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  X, 
  Building, 
  Users, 
  Activity, 
  List, 
  History, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus
} from "lucide-react"

interface CompanyDetailDrawerProps {
  company: Company | null
  isOpen: boolean
  onClose: () => void
}

// Mock data for tabs
const mockContacts = [
  {
    id: "1",
    name: "John Smith",
    title: "General Manager", 
    phone: "+66-2-123-4567",
    email: "john@abc-mfg.com",
    isDecisionMaker: true,
    status: "Active"
  }
]

const mockActivities = [
  {
    id: "1",
    type: "call",
    outcome: "Interested",
    content: "Discussed Q1 logistics requirements",
    createdBy: "jane.smith@company.com",
    createdAt: "2024-12-08T10:30:00Z"
  },
  {
    id: "2", 
    type: "note",
    content: "Follow up needed for pricing discussion",
    createdBy: "john.doe@company.com",
    createdAt: "2024-12-07T15:20:00Z"
  }
]

const mockListMemberships = [
  {
    listId: "1",
    listName: "Bangkok Logistics Leads",
    status: "In Outreach",
    addedAt: "2024-12-01T00:00:00Z"
  },
  {
    listId: "2",
    listName: "Manufacturing Prospects", 
    status: "Draft",
    addedAt: "2024-11-28T00:00:00Z"
  }
]

const mockHistory = [
  {
    id: "1",
    action: "Updated verification status",
    field: "verificationStatus",
    oldValue: "Needs Verification",
    newValue: "Active",
    user: "jane.smith@company.com",
    timestamp: "2024-12-08T09:00:00Z"
  },
  {
    id: "2",
    action: "Added contact person",
    field: "contactPersons",
    user: "system",
    timestamp: "2024-12-01T10:30:00Z"
  }
]

export function CompanyDetailDrawer({ company, isOpen, onClose }: CompanyDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!isOpen || !company) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Needs Verification":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "Invalid":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Needs Verification":
        return "bg-yellow-100 text-yellow-800"  
      case "Invalid":
        return "bg-red-100 text-red-800"
      case "New":
        return "bg-blue-100 text-blue-800"
      case "Archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold truncate">Company Details</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 m-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <div className="flex-1 px-4 pb-4">
            <TabsContent value="overview" className="space-y-4 mt-0">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{company.companyNameEn}</h3>
                    {company.companyNameTh && (
                      <p className="text-gray-600">{company.companyNameTh}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Registration ID:</span>
                      <p className="font-medium">{company.registeredNo || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Industry:</span>
                      <p className="font-medium">{company.industrialName}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Province:</span>
                      <p className="font-medium">{company.province}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Company Size:</span>
                      <p className="font-medium">{company.companySize || "N/A"}</p>
                    </div>
                  </div>

                  {company.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <p className="text-sm">{company.address}</p>
                    </div>
                  )}

                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a href={company.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline text-sm">
                        {company.website}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(company.verificationStatus)}
                      <Badge className={getStatusColor(company.verificationStatus)}>
                        {company.verificationStatus}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {company.dataCompleteness}% complete
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Primary Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Primary Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  {company.contactPersons.length > 0 ? (
                    <div className="space-y-3">
                      {company.contactPersons.map((contact, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            {contact.title && <p className="text-sm text-gray-600">{contact.title}</p>}
                            <div className="flex gap-3 mt-1">
                              {contact.phone && (
                                <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </a>
                              )}
                              {contact.email && (
                                <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                                  <Mail className="h-3 w-3" />
                                  {contact.email}
                                </a>
                              )}
                            </div>
                          </div>
                          {contact.isDecisionMaker && (
                            <Badge variant="secondary" className="text-xs">Decision Maker</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No contact information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Validate Registration
                </Button>
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to List
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Contact Management</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              <div className="space-y-3">
                {mockContacts.map((contact) => (
                  <Card key={contact.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{contact.name}</h4>
                          <p className="text-sm text-gray-600">{contact.title}</p>
                          <div className="flex gap-3 mt-2">
                            {contact.phone && (
                              <a href={`tel:${contact.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </a>
                            )}
                            {contact.email && (
                              <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {contact.isDecisionMaker && (
                            <Badge variant="secondary" className="text-xs">Decision Maker</Badge>
                          )}
                          <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Activity Log</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Activity
                </Button>
              </div>

              <div className="space-y-3">
                {mockActivities.map((activity) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Activity className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{activity.type}</span>
                            {activity.outcome && (
                              <Badge variant="outline" className="text-xs">{activity.outcome}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{activity.content}</p>
                          <div className="text-xs text-gray-500 mt-2">
                            {activity.createdBy} • {new Date(activity.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="lists" className="space-y-4 mt-0">
              <h3 className="font-medium">List Memberships</h3>
              
              <div className="space-y-2">
                {mockListMemberships.map((membership) => (
                  <div key={membership.listId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{membership.listName}</p>
                      <p className="text-sm text-gray-600">Added {new Date(membership.addedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">{membership.status}</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-0">
              <h3 className="font-medium">Change History</h3>
              
              <div className="space-y-3">
                {mockHistory.map((entry) => (
                  <div key={entry.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{entry.action}</span>
                    </div>
                    {entry.oldValue && entry.newValue && (
                      <p className="text-sm text-gray-600 mt-1">
                        {entry.oldValue} → {entry.newValue}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {entry.user} • {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
