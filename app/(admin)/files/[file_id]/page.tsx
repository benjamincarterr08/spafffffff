"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowLeft,
  faTrash,
  faDownload,
  faFile,
  faFileImage,
  faCalendar,
  faUser,
  faHardDrive,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { api, fetcher } from "@/lib/api"
import type { UploadedFile } from "@/lib/types"

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

function isImageFile(mimeType?: string, filename?: string) {
  if (mimeType?.startsWith("image/")) return true
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase()
    return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext || "")
  }
  return false
}

export default function FileDetailPage({
  params,
}: {
  params: Promise<{ file_id: string }>
}) {
  const { file_id } = use(params)
  const router = useRouter()

  const { data: file, error, isLoading } = useSWR<UploadedFile>(
    `/files/${file_id}`,
    fetcher
  )

  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/files/${file_id}`)
      router.push("/files")
    } catch (err) {
      console.error("Failed to delete file:", err)
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load file</p>
        <Button variant="outline" asChild className="mt-4">
          <Link href="/files">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" />
            Back to Files
          </Link>
        </Button>
      </div>
    )
  }

  const isImage = isImageFile(file.mime_type, file.filename)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/files">
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold truncate max-w-[400px]">
              {file.filename}
            </h1>
            <p className="text-muted-foreground">File #{file.file_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {file.url && (
            <Button variant="outline" asChild>
              <a href={file.url} download target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faDownload} className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={isImage ? faFileImage : faFile}
                className="h-4 w-4 text-muted-foreground"
              />
              File Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isImage && file.url ? (
              <div className="flex items-center justify-center bg-muted/50 rounded-lg p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.filename}
                  className="max-w-full max-h-[400px] object-contain rounded"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FontAwesomeIcon icon={faFile} className="h-16 w-16 mb-4" />
                <p>Preview not available</p>
                {file.url && (
                  <Button variant="outline" asChild className="mt-4">
                    <a
                      href={file.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download to view
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Filename</span>
              <span className="truncate max-w-[200px]">{file.filename}</span>
            </div>

            {file.mime_type && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{file.mime_type}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <FontAwesomeIcon icon={faHardDrive} className="h-3 w-3" />
                Size
              </span>
              <span>{formatFileSize(file.size)}</span>
            </div>

            {file.uploaded_by_name && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
                  Uploaded By
                </span>
                <span>{file.uploaded_by_name}</span>
              </div>
            )}

            {file.created_at && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="h-3 w-3" />
                  Uploaded
                </span>
                <span>
                  {new Date(file.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {file.description && (
              <div className="pt-4 border-t">
                <p className="text-muted-foreground text-sm mb-2">Description</p>
                <p className="whitespace-pre-wrap">{file.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${file.filename}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
    </div>
  )
}
