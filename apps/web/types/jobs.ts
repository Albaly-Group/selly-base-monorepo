export interface ImportJob {
  id: string
  filename: string
  status: "processing" | "completed" | "failed"
  totalRows: number
  processedRows: number
  errorRows: number
  createdAt: string
  completedAt?: string
  failedAt?: string
  importedBy?: string
  errorMessage?: string
}

export interface ExportJob {
  id: string
  filename: string
  status: "processing" | "completed" | "expired" | "failed"
  scope?: string
  format?: string
  totalRecords: number
  fileSize?: string
  requestedBy?: string
  createdAt: string
  completedAt?: string
  expiresAt?: string
  downloadUrl?: string
}
