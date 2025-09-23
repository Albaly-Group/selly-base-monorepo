"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Clock, CheckCircle, XCircle, FileText, Calendar } from "lucide-react"

interface ExportJob {
  id: string
  filename: string
  status: "processing" | "completed" | "expired" | "failed"
  scope: string
  format: string
  totalRecords: number
  fileSize?: string
  requestedBy: string
  createdAt: string
  completedAt?: string
  expiresAt?: string
  downloadUrl?: string
}

interface ExportJobsTableProps {
  jobs: ExportJob[]
}

export function ExportJobsTable({ jobs }: ExportJobsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "expired":
        return <Calendar className="h-4 w-4 text-gray-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const isExpired = (job: ExportJob) => {
    if (!job.expiresAt) return false
    return new Date(job.expiresAt) < new Date()
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h remaining`
    return "< 1h remaining"
  }

  const handleDownload = (job: ExportJob) => {
    // Mock file download
    const csvContent = `Company Name,Industry,Province,Contact Person,Phone,Email,Status\nExample Company,Technology,Bangkok,John Doe,+66-2-123-4567,john@example.com,Active`
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = job.filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Records</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Requested By</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{job.filename}</div>
                    <div className="text-sm text-gray-500">{job.format}</div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(job.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(job.status)}
                    {job.status}
                  </div>
                </Badge>
                {job.expiresAt && job.status === "completed" && (
                  <div className="text-xs text-gray-500 mt-1">
                    {getTimeRemaining(job.expiresAt)}
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                <div className="text-sm">{job.scope}</div>
              </TableCell>
              
              <TableCell>
                <div className="font-medium">{job.totalRecords.toLocaleString()}</div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {job.fileSize || (job.status === "processing" ? "Calculating..." : "-")}
                </div>
              </TableCell>
              
              <TableCell className="text-sm">{job.requestedBy}</TableCell>
              
              <TableCell className="text-sm">
                <div>{formatDate(job.createdAt)}</div>
                {job.completedAt && (
                  <div className="text-gray-500">Completed: {formatDate(job.completedAt)}</div>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex gap-1">
                  {job.status === "completed" && !isExpired(job) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(job)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                  )}
                  {job.status === "processing" && (
                    <div className="text-sm text-gray-500 py-1 px-2">
                      Generating...
                    </div>
                  )}
                  {(job.status === "expired" || isExpired(job)) && (
                    <div className="text-sm text-gray-500 py-1 px-2">
                      File expired
                    </div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {jobs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No export jobs found. Create exports from the Lookup or Lists pages.
        </div>
      )}
    </div>
  )
}