"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Download, Clock, CheckCircle, XCircle } from "lucide-react"

interface ImportJob {
  id: string
  filename: string
  status: "processing" | "completed" | "failed"
  totalRows: number
  processedRows: number
  errorRows: number
  createdAt: string
  completedAt?: string
  failedAt?: string
  importedBy: string
  errorMessage?: string
}

interface ImportJobsTableProps {
  jobs: ImportJob[]
  onRefresh?: () => void
}

export function ImportJobsTable({ jobs, onRefresh }: ImportJobsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
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

  const calculateProgress = (job: ImportJob) => {
    if (job.status === "completed") return 100
    if (job.status === "failed") return 0
    return Math.round((job.processedRows / job.totalRows) * 100)
  }

  const handleDownloadErrors = (jobId: string) => {
    // Mock error file download
    const csvContent = `Row,Field,Error\n15,registration_id,"Invalid format: must be 13 digits"\n23,email,"Invalid email format"\n45,registration_id,"Duplicate registration ID found"`
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `import-errors-${jobId}.csv`
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
            <TableHead>Progress</TableHead>
            <TableHead>Records</TableHead>
            <TableHead>Imported By</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell>
                <div className="font-medium">{job.filename}</div>
                {job.errorMessage && (
                  <div className="text-sm text-red-600 mt-1">{job.errorMessage}</div>
                )}
              </TableCell>
              
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(job.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(job.status)}
                    {job.status}
                  </div>
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <Progress value={calculateProgress(job)} className="w-24" />
                  <div className="text-xs text-gray-500">
                    {job.processedRows} / {job.totalRows}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-green-600">{job.processedRows} success</span>
                    {job.errorRows > 0 && (
                      <span className="text-red-600">{job.errorRows} errors</span>
                    )}
                  </div>
                  <div className="text-gray-500">Total: {job.totalRows}</div>
                </div>
              </TableCell>
              
              <TableCell className="text-sm">{job.importedBy}</TableCell>
              
              <TableCell className="text-sm">
                <div>{formatDate(job.createdAt)}</div>
                {job.completedAt && (
                  <div className="text-gray-500">Completed: {formatDate(job.completedAt)}</div>
                )}
                {job.failedAt && (
                  <div className="text-red-500">Failed: {formatDate(job.failedAt)}</div>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex gap-1">
                  {job.status === "completed" && job.errorRows > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadErrors(job.id)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Errors
                    </Button>
                  )}
                  {job.status === "failed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadErrors(job.id)}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Details
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}