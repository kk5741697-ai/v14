"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon,
  File,
  RotateCcw
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
  preview?: string
}

interface EnhancedFileUploadProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSize?: number // MB
  accept?: string[]
  multiple?: boolean
  className?: string
}

export function EnhancedFileUpload({
  onFilesChange,
  maxFiles = 10,
  maxSize = 100,
  accept = ["*/*"],
  multiple = true,
  className = ""
}: EnhancedFileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxSize}MB limit` }
    }

    // Check file type
    if (accept.length > 0 && !accept.includes("*/*")) {
      const fileType = file.type
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`

      const isValidType = accept.some((acceptType) => {
        if (acceptType.startsWith(".")) {
          return acceptType === fileExtension
        }
        if (acceptType.includes("/*")) {
          return fileType.startsWith(acceptType.replace("/*", ""))
        }
        return fileType === acceptType
      })

      if (!isValidType) {
        return { valid: false, error: `File type not supported. Accepted: ${accept.join(", ")}` }
      }
    }

    return { valid: true }
  }, [accept, maxSize])

  const addFiles = useCallback(async (newFiles: FileList) => {
    if (!multiple && newFiles.length > 1) {
      toast({
        title: "Multiple files not allowed",
        description: "Please select only one file",
        variant: "destructive"
      })
      return
    }

    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      })
      return
    }

    const processedFiles: UploadFile[] = []
    const validFiles: File[] = []

    for (const file of Array.from(newFiles)) {
      const validation = validateFile(file)
      
      const uploadFile: UploadFile = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: validation.valid ? "success" : "error",
        progress: validation.valid ? 100 : 0,
        error: validation.error,
      }

      // Generate preview for images
      if (file.type.startsWith("image/") && validation.valid) {
        try {
          const preview = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          uploadFile.preview = preview
        } catch {
          // Preview generation failed, continue without preview
        }
      }

      processedFiles.push(uploadFile)
      
      if (validation.valid) {
        validFiles.push(file)
      } else {
        toast({
          title: "Invalid file",
          description: validation.error || "File validation failed",
          variant: "destructive"
        })
      }
    }

    setFiles(prev => [...prev, ...processedFiles])
    onFilesChange(validFiles)
  }, [files.length, maxFiles, validateFile, multiple, onFilesChange])

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId)
      const validFiles = newFiles.filter(f => f.status === "success").map(f => f.file)
      onFilesChange(validFiles)
      return newFiles
    })
  }, [onFilesChange])

  const retryFile = useCallback((fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: "success" as const, error: undefined, progress: 100 }
        : f
    ))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type === "application/pdf") return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragActive 
            ? "border-blue-500 bg-blue-50 scale-105" 
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
          isDragActive ? "text-blue-500" : "text-gray-400"
        }`} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? "Drop files here" : "Upload files"}
        </h3>
        <p className="text-gray-500 mb-4">
          {isDragActive ? "Release to upload" : "Drag and drop or click to browse"}
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Select Files
        </Button>
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Maximum {maxFiles} files • Up to {maxSize}MB each</p>
          {accept.length > 0 && !accept.includes("*/*") && (
            <p>Supported: {accept.join(", ")}</p>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Files ({files.length}/{maxFiles})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFiles([])
                onFilesChange([])
              }}
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type)
              
              return (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow"
                >
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <Badge
                        variant={
                          file.status === "success" 
                            ? "default" 
                            : file.status === "error" 
                              ? "destructive" 
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {file.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                      {file.status === "uploading" && (
                        <div className="flex-1">
                          <Progress value={file.progress} className="h-1" />
                        </div>
                      )}
                      {file.error && (
                        <span className="text-xs text-red-600">{file.error}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    {file.status === "success" && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {file.status === "error" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryFile(file.id)}
                          className="h-6 w-6 p-0"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept.join(",")}
        multiple={multiple}
        onChange={(e) => e.target.files && addFiles(e.target.files)}
        className="hidden"
      />
    </div>
  )
}