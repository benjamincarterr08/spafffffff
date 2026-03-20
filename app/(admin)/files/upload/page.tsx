"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faArrowLeft,
  faCloudUploadAlt,
  faFile,
  faTimes,
} from "@fortawesome/free-solid-svg-icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"

function formatFileSize(bytes: number) {
  const units = ["B", "KB", "MB", "GB"]
  let unitIndex = 0
  let size = bytes
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
}

export default function UploadFilePage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      if (description) {
        formData.append("description", description)
      }

      const response = await api.upload<{ file_id: number }>("/files/upload", formData)
      router.push(`/files/${response.file_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file")
      setIsUploading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/files">
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload File</h1>
          <p className="text-muted-foreground">Upload a new file to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Drop zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : selectedFile
                  ? "border-green-500 bg-green-500/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <FontAwesomeIcon
                    icon={faFile}
                    className="h-12 w-12 text-green-500 mx-auto"
                  />
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      setSelectedFile(null)
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2 h-3 w-3" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="h-12 w-12 text-muted-foreground mx-auto"
                  />
                  <div>
                    <span className="font-medium text-primary">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Any file type supported
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add a description for this file..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/files">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isUploading || !selectedFile}>
                {isUploading ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    className="mr-2 h-4 w-4"
                  />
                )}
                Upload File
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
