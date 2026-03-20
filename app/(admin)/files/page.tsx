"use client"

import { useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlus,
  faEye,
  faTrash,
  faDownload,
  faFile,
  faFileImage,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileArchive,
  faFileCode,
  faFileVideo,
  faFileAudio,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { DataTable, Column } from "@/components/data-table"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { api, fetcher } from "@/lib/api"
import type { UploadedFile } from "@/lib/types"

function getFileIcon(mimeType?: string, filename?: string) {
  if (!mimeType && filename) {
    const ext = filename.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return faFileImage
    }
    if (ext === "pdf") return faFilePdf
    if (["doc", "docx"].includes(ext || "")) return faFileWord
    if (["xls", "xlsx"].includes(ext || "")) return faFileExcel
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) return faFileArchive
    if (["mp4", "avi", "mov", "mkv"].includes(ext || "")) return faFileVideo
    if (["mp3", "wav", "flac", "ogg"].includes(ext || "")) return faFileAudio
    if (["js", "ts", "html", "css", "json", "py"].includes(ext || "")) return faFileCode
  }

  if (mimeType?.startsWith("image/")) return faFileImage
  if (mimeType === "application/pdf") return faFilePdf
  if (mimeType?.includes("word")) return faFileWord
  if (mimeType?.includes("excel") || mimeType?.includes("spreadsheet")) return faFileExcel
  if (mimeType?.includes("zip") || mimeType?.includes("archive")) return faFileArchive
  if (mimeType?.startsWith("video/")) return faFileVideo
  if (mimeType?.startsWith("audio/")) return faFileAudio

  return faFile
}

function formatFileSize(bytes?: number) {
  if (!bytes) return "-"
  const units = ["B", "KB", "MB", "GB"]
  let unitIndex = 0
  let size = bytes
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
}

export default function FilesPage() {
  const { data: files, error, isLoading, mutate } = useSWR<UploadedFile[]>(
    "/files",
    fetcher
  )
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await api.delete(`/files/${deleteId}`)
      mutate()
      setDeleteId(null)
    } catch (err) {
      console.error("Failed to delete file:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<UploadedFile>[] = [
    {
      key: "file_id",
      header: "ID",
      sortable: true,
    },
    {
      key: "filename",
      header: "File",
      sortable: true,
      render: (file) => (
        <div className="flex items-center gap-3">
          <FontAwesomeIcon
            icon={getFileIcon(file.mime_type, file.filename)}
            className="h-5 w-5 text-muted-foreground"
          />
          <div>
            <div className="font-medium truncate max-w-[250px]">
              {file.filename}
            </div>
            {file.mime_type && (
              <div className="text-xs text-muted-foreground">
                {file.mime_type}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "size",
      header: "Size",
      sortable: true,
      render: (file) => formatFileSize(file.size),
    },
    {
      key: "uploaded_by_name",
      header: "Uploaded By",
      sortable: true,
      render: (file) => file.uploaded_by_name || "-",
    },
    {
      key: "created_at",
      header: "Uploaded",
      sortable: true,
      render: (file) =>
        file.created_at
          ? new Date(file.created_at).toLocaleDateString()
          : "-",
    },
    {
      key: "actions",
      header: "Actions",
      render: (file) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/files/${file.file_id}`}>
              <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
            </Link>
          </Button>
          {file.url && (
            <Button variant="ghost" size="icon" asChild>
              <a href={file.url} download target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(file.file_id)}
          >
            <FontAwesomeIcon icon={faTrash} className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load files</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
          <p className="text-muted-foreground">Manage uploaded files</p>
        </div>
        <Button asChild>
          <Link href="/files/upload">
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Upload File
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={files || []}
        isLoading={isLoading}
        searchKey="filename"
        searchPlaceholder="Search files..."
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
