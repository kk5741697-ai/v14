"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { AdBanner } from "@/components/ads/ad-banner"
import { 
  Upload, 
  Download, 
  Trash2, 
  RotateCw, 
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  X,
  ArrowLeft,
  CheckCircle,
  Undo,
  Redo,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Maximize2,
  Minimize2,
  Settings,
  AlertCircle,
  Info
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface ImageFile {
  id: string
  file: File
  originalFile?: File
  name: string
  size: number
  preview: string
  dimensions: { width: number; height: number }
  processed?: boolean
  processedPreview?: string
  processedSize?: number
  blob?: Blob
  cropArea?: { x: number; y: number; width: number; height: number }
}

interface ToolOption {
  key: string
  label: string
  type: "select" | "slider" | "input" | "checkbox" | "color" | "text"
  defaultValue: any
  min?: number
  max?: number
  step?: number
  selectOptions?: Array<{ value: string; label: string }>
  section?: string
  condition?: (options: any) => boolean
}

interface ImageToolsLayoutProps {
  title: string
  description: string
  icon: any
  toolType: "resize" | "compress" | "convert" | "crop" | "rotate" | "watermark" | "background" | "filters"
  processFunction: (files: ImageFile[], options: any) => Promise<{ success: boolean; processedFiles?: ImageFile[]; error?: string }>
  options: ToolOption[]
  maxFiles?: number
  singleFileOnly?: boolean
  allowBatchProcessing?: boolean
  supportedFormats?: string[]
  outputFormats?: string[]
  presets?: Array<{ name: string; values: any }>
}

export function ImageToolsLayout({
  title,
  description,
  icon: Icon,
  toolType,
  processFunction,
  options,
  maxFiles = 20,
  singleFileOnly = false,
  allowBatchProcessing = true,
  supportedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  outputFormats = ["jpeg", "png", "webp"],
  presets = []
}: ImageToolsLayoutProps) {
  const [files, setFiles] = useState<ImageFile[]>([])
  const [toolOptions, setToolOptions] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFiles, setProcessedFiles] = useState<ImageFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [cropSelection, setCropSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [cropHandles, setCropHandles] = useState<{ [key: string]: { x: number; y: number } }>({})
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [aspectRatioLocked, setAspectRatioLocked] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Initialize options with defaults
  useEffect(() => {
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
  }, [options])

  // Improved auto-save with quota management
  useEffect(() => {
    if (files.length > 0 || Object.keys(toolOptions).length > 0) {
      try {
        // Create minimal save data to avoid quota issues
        const saveData = {
          fileCount: files.length,
          toolOptions,
          timestamp: Date.now()
        }
        
        const saveString = JSON.stringify(saveData)
        
        // Check if we're approaching localStorage quota (reduced limit)
        if (saveString.length > 100000) { // 100KB limit
          console.warn("Auto-save data too large, skipping")
          return
        }
        
        localStorage.setItem(`pixora-${toolType}-autosave`, saveString)
      } catch (error) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          // Clear ALL auto-saves to free up space immediately
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('pixora-')) {
              try {
                localStorage.removeItem(key)
              } catch {
                localStorage.removeItem(key)
              }
            }
          })
          
          // Try to save again with minimal data
          try {
            const minimalSave = { timestamp: Date.now() }
            localStorage.setItem(`pixora-${toolType}-autosave`, JSON.stringify(minimalSave))
          } catch {
            // If still failing, disable auto-save completely
            console.warn("Auto-save completely disabled due to storage constraints")
          }
          
          toast({
            title: "Storage cleared",
            description: "Browser storage was full and has been cleared",
          })
        }
      }
    }
  }, [files.length, toolOptions, toolType])

  const handleFileUpload = async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return

    // Validate file types first
    const invalidFiles = Array.from(uploadedFiles).filter(file => 
      !supportedFormats.includes(file.type)
    )
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file types",
        description: `${invalidFiles.length} files are not supported. Please upload ${supportedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} files only.`,
        variant: "destructive"
      })
      return
    }
    if (singleFileOnly && files.length > 0) {
      setFiles([])
      setProcessedFiles([])
    }

    const newFiles: ImageFile[] = []
    const maxFilesToProcess = singleFileOnly ? 1 : Math.min(uploadedFiles.length, maxFiles)
    
    for (let i = 0; i < maxFilesToProcess; i++) {
      const file = uploadedFiles[i]
      if (!supportedFormats.includes(file.type)) continue

      try {
        const preview = await createImagePreview(file)
        const dimensions = await getImageDimensions(file)
        
        const imageFile: ImageFile = {
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          originalFile: file,
          name: file.name,
          size: file.size,
          preview,
          dimensions
        }

        newFiles.push(imageFile)
      } catch (error) {
        toast({
          title: "Error loading image",
          description: `Failed to load ${file.name}`,
          variant: "destructive"
        })
      }
    }

    if (newFiles.length === 0) {
      toast({
        title: "No valid images",
        description: "No valid image files were found to upload.",
        variant: "destructive"
      })
      return
    }
    setFiles(prev => singleFileOnly ? newFiles : [...prev, ...newFiles])
    
    if (newFiles.length > 0) {
      setSelectedFile(newFiles[0].id)
      
      toast({
        title: "Images uploaded",
        description: `${newFiles.length} image${newFiles.length > 1 ? 's' : ''} uploaded successfully`
      })
    }
  }

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setProcessedFiles(prev => prev.filter(f => f.id !== fileId))
    if (selectedFile === fileId) {
      const remainingFiles = files.filter(f => f.id !== fileId)
      setSelectedFile(remainingFiles.length > 0 ? remainingFiles[0].id : null)
    }
  }

  const resetTool = () => {
    setFiles([])
    setProcessedFiles([])
    setSelectedFile(null)
    setCropSelection(null)
    setZoomLevel(100)
    setPanOffset({ x: 0, y: 0 })
    
    const defaultOptions: Record<string, any> = {}
    options.forEach(option => {
      defaultOptions[option.key] = option.defaultValue
    })
    setToolOptions(defaultOptions)
    
    try {
      localStorage.removeItem(`pixora-${toolType}-autosave`)
    } catch (error) {
      console.warn("Failed to clear auto-save:", error)
    }
    
    toast({
      title: "Tool reset",
      description: "All files and settings have been reset"
    })
  }

  // Enhanced crop functionality with precise pixel coordinates
  const handleCropStart = (e: React.MouseEvent<HTMLImageElement>) => {
    if (toolType !== "crop") return
    
    const target = e.target as HTMLElement
    if (target.classList.contains('crop-handle')) {
      setIsResizing(target.dataset.handle || null)
      return
    }
    
    const img = e.currentTarget
    const rect = img.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setDragStart({ x, y })
    setIsDragging(true)
    setCropSelection({ x, y, width: 0, height: 0 })
  }

  const handleCropMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (toolType !== "crop") return
    
    if (isResizing && cropSelection) {
      const img = e.currentTarget
      const rect = img.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      let newSelection = { ...cropSelection }
      
      switch (isResizing) {
        case 'nw':
          newSelection.width += newSelection.x - x
          newSelection.height += newSelection.y - y
          newSelection.x = x
          newSelection.y = y
          break
        case 'ne':
          newSelection.width = x - newSelection.x
          newSelection.height += newSelection.y - y
          newSelection.y = y
          break
        case 'sw':
          newSelection.width += newSelection.x - x
          newSelection.height = y - newSelection.y
          newSelection.x = x
          break
        case 'se':
          newSelection.width = x - newSelection.x
          newSelection.height = y - newSelection.y
          break
      }
      
      // Maintain aspect ratio if locked
      if (aspectRatioLocked && toolOptions.aspectRatio !== "free") {
        const ratio = parseFloat(toolOptions.aspectRatio?.split(':')[0] || "1") / parseFloat(toolOptions.aspectRatio?.split(':')[1] || "1")
        if (newSelection.width / newSelection.height > ratio) {
          newSelection.width = newSelection.height * ratio
        } else {
          newSelection.height = newSelection.width / ratio
        }
      }
      
      setCropSelection(newSelection)
      return
    }
    
    if (!isDragging || !dragStart) return
    
    const img = e.currentTarget
    const rect = img.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    let newSelection = {
      x: Math.min(dragStart.x, x),
      y: Math.min(dragStart.y, y),
      width: Math.abs(x - dragStart.x),
      height: Math.abs(y - dragStart.y)
    }
    
    // Apply aspect ratio constraint
    if (toolOptions.aspectRatio && toolOptions.aspectRatio !== "free") {
      const ratio = parseFloat(toolOptions.aspectRatio.split(':')[0]) / parseFloat(toolOptions.aspectRatio.split(':')[1])
      if (newSelection.width / newSelection.height > ratio) {
        newSelection.width = newSelection.height * ratio
      } else {
        newSelection.height = newSelection.width / ratio
      }
    }
    
    setCropSelection(newSelection)
  }

  const handleCropEnd = () => {
    setIsDragging(false)
    setDragStart(null)
    setIsResizing(null)
    
    if (cropSelection && selectedFile) {
      setFiles(prev => prev.map(file => 
        file.id === selectedFile 
          ? { ...file, cropArea: cropSelection }
          : file
      ))
    }
  }

  // Pan and zoom functionality
  const handlePanStart = (e: React.MouseEvent) => {
    if (toolType === "crop") return
    setIsPanning(true)
    setLastPanPoint({ x: e.clientX, y: e.clientY })
  }

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    
    const deltaX = e.clientX - lastPanPoint.x
    const deltaY = e.clientY - lastPanPoint.y
    
    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    
    setLastPanPoint({ x: e.clientX, y: e.clientY })
  }

  const handlePanEnd = () => {
    setIsPanning(false)
  }

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(25, Math.min(400, prev + delta)))
  }

  const resetView = () => {
    setZoomLevel(100)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleProcess = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one image file",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    setProcessedFiles([])

    try {
      const result = await processFunction(files, toolOptions)
      
      if (result.success && result.processedFiles) {
        setProcessedFiles(result.processedFiles)
        toast({
          title: "Processing complete",
          description: `${result.processedFiles.length} images processed successfully`
        })
      } else {
        toast({
          title: "Processing failed",
          description: result.error || "An error occurred",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (processedFiles.length === 1) {
      const file = processedFiles[0]
      if (file.blob) {
        const url = URL.createObjectURL(file.blob)
        const link = document.createElement("a")
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } else if (processedFiles.length > 1) {
      import("jszip").then(({ default: JSZip }) => {
        const zip = new JSZip()
        
        processedFiles.forEach(file => {
          if (file.blob) {
            zip.file(file.name, file.blob)
          }
        })

        zip.generateAsync({ type: "blob" }).then(zipBlob => {
          const url = URL.createObjectURL(zipBlob)
          const link = document.createElement("a")
          link.href = url
          link.download = `${toolType}_images.zip`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        })
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const currentFile = selectedFile ? files.find(f => f.id === selectedFile) : files[0]

  // Group options by section
  const groupedOptions = options.reduce((acc, option) => {
    const section = option.section || "General"
    if (!acc[section]) acc[section] = []
    acc[section].push(option)
    return acc
  }, {} as Record<string, ToolOption[]>)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      {/* Left Canvas - Enhanced Image Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Icon className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            <Badge variant="secondary">{files.length} files</Badge>
            {currentFile && (
              <Badge variant="outline">
                {currentFile.dimensions.width} × {currentFile.dimensions.height}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetTool}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {currentFile && (
              <div className="flex items-center space-x-1 border rounded-md">
                <Button variant="ghost" size="sm" onClick={() => handleZoom(-25)}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">{zoomLevel}%</span>
                <Button variant="ghost" size="sm" onClick={() => handleZoom(25)}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={resetView}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Content */}
        <div className="flex-1 overflow-hidden">
          {files.length === 0 ? (
            <div className="h-full flex flex-col">
              <div className="p-4">
                <AdBanner position="header" showLabel />
              </div>
              
              <div className="flex-1 flex items-center justify-center p-6">
                <div 
                  className="max-w-lg w-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 p-16 group"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
                    <Upload className="relative h-20 w-20 text-blue-500 group-hover:text-blue-600 transition-colors group-hover:scale-110 transform duration-300" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-gray-700 group-hover:text-blue-600 transition-colors">Drop images here</h3>
                  <p className="text-gray-500 mb-6 text-lg">or click to browse files</p>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Images
                  </Button>
                  <div className="mt-6 space-y-2">
                    <p className="text-sm text-gray-500 font-medium">
                      Supported formats: {supportedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Maximum {maxFiles} files • Up to 100MB each
                    </p>
                  </div>
                  {singleFileOnly && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-700 font-medium flex items-center">
                        <Crop className="h-4 w-4 mr-2" />
                        Single file mode for precision editing
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <AdBanner position="inline" showLabel />
              </div>

              <div 
                ref={canvasRef}
                className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-gray-100 group"
                onMouseDown={handlePanStart}
                onMouseMove={handlePanMove}
                onMouseUp={handlePanEnd}
                onMouseLeave={handlePanEnd}
                style={{ cursor: isPanning ? "grabbing" : toolType === "crop" ? "crosshair" : "grab" }}
              >
                {currentFile && (
                  <div className="relative">
                    <div 
                      className="relative inline-block transition-transform duration-200"
                      style={{ 
                        transform: `scale(${zoomLevel / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                        maxWidth: "calc(100vw - 400px)",
                        maxHeight: "calc(100vh - 200px)"
                      }}
                    >
                      <img
                        src={currentFile.processedPreview || currentFile.preview}
                        alt={currentFile.name}
                        className="w-full h-full object-contain border border-gray-300 rounded-lg shadow-lg bg-white"
                        style={{ 
                          maxWidth: "100%",
                          maxHeight: "100%",
                          userSelect: "none",
                          pointerEvents: toolType === "crop" ? "auto" : "none"
                        }}
                        onMouseDown={handleCropStart}
                        onMouseMove={handleCropMove}
                        onMouseUp={handleCropEnd}
                        onMouseLeave={handleCropEnd}
                        draggable={false}
                      />
                      
                      {/* Enhanced Crop Overlay */}
                      {toolType === "crop" && cropSelection && (
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                          style={{
                            left: `${cropSelection.x}%`,
                            top: `${cropSelection.y}%`,
                            width: `${cropSelection.width}%`,
                            height: `${cropSelection.height}%`
                          }}
                        >
                          {/* Enhanced Crop Handles with Better UX */}
                          <div 
                            className="crop-handle absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-nw-resize pointer-events-auto"
                            data-handle="nw"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              setIsResizing("nw")
                            }}
                          ></div>
                          <div 
                            className="crop-handle absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-ne-resize pointer-events-auto"
                            data-handle="ne"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              setIsResizing("ne")
                            }}
                          ></div>
                          <div 
                            className="crop-handle absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-sw-resize pointer-events-auto"
                            data-handle="sw"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              setIsResizing("sw")
                            }}
                          ></div>
                          <div 
                            className="crop-handle absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-se-resize pointer-events-auto"
                            data-handle="se"
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              setIsResizing("se")
                            }}
                          ></div>
                          
                          {/* Enhanced Crop Info */}
                          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded shadow-md whitespace-nowrap">
                            {Math.round(cropSelection.width)}% × {Math.round(cropSelection.height)}%
                            {currentFile && (
                              <div className="text-center mt-1">
                                {Math.round((cropSelection.width / 100) * currentFile.dimensions.width)} × {Math.round((cropSelection.height / 100) * currentFile.dimensions.height)} px
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Quick Actions Overlay */}
                      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                        <Button size="sm" variant="secondary" onClick={() => {}}>
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => {}}>
                          <RotateCw className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => {}}>
                          <FlipHorizontal className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => {}}>
                          <FlipVertical className="h-3 w-3" />
                        </Button>
                      </div>

                       {/* Image Info Overlay */}
                       <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex items-center space-x-4">
                           <span>{currentFile.dimensions.width} × {currentFile.dimensions.height}</span>
                           <span>{formatFileSize(currentFile.size)}</span>
                           <span>{currentFile.name.split('.').pop()?.toUpperCase()}</span>
                         </div>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Thumbnails Bar */}
              {files.length > 1 && (
                <div className="border-t bg-white p-4">
                  <div className="flex space-x-3 overflow-x-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 ${
                          selectedFile === file.id 
                            ? "ring-2 ring-blue-500 scale-105" 
                            : "hover:scale-105 hover:shadow-md"
                        }`}
                        onClick={() => setSelectedFile(file.id)}
                      >
                        <img
                          src={file.processedPreview || file.preview}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(file.id)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {file.processed && (
                          <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Enhanced */}
      <div className="w-80 bg-white border-l shadow-lg flex flex-col">
        {/* Sidebar Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Quick Presets */}
          {presets.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setToolOptions(prev => ({ ...prev, ...preset.values }))
                    }}
                    className="text-xs h-8"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Aspect Ratio Lock for Crop Tool */}
          {toolType === "crop" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Aspect Ratio</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={aspectRatioLocked}
                    onCheckedChange={setAspectRatioLocked}
                  />
                  <span className="text-xs">Lock</span>
                </div>
              </div>
              
              {cropSelection && currentFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-600">Selection:</span>
                      <div>{Math.round(cropSelection.width)}% × {Math.round(cropSelection.height)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Pixels:</span>
                      <div>
                        {Math.round((cropSelection.width / 100) * currentFile.dimensions.width)} × {Math.round((cropSelection.height / 100) * currentFile.dimensions.height)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Grouped Options */}
          {Object.entries(groupedOptions).map(([section, sectionOptions]) => (
            <div key={section} className="space-y-4">
              {section !== "General" && (
                <div className="flex items-center space-x-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{section}</Label>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
              )}
              
              {sectionOptions.map((option) => {
                // Check condition if exists
                if (option.condition && !option.condition(toolOptions)) {
                  return null
                }

                return (
                  <div key={option.key} className="space-y-2">
                    <Label className="text-sm font-medium">{option.label}</Label>
                    
                    {option.type === "select" && (
                      <Select
                        value={toolOptions[option.key]?.toString()}
                        onValueChange={(value) => {
                          setToolOptions(prev => ({ ...prev, [option.key]: value }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {option.selectOptions?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {option.type === "slider" && (
                      <div className="space-y-2">
                        <Slider
                          value={[toolOptions[option.key] || option.defaultValue]}
                          onValueChange={([value]) => setToolOptions(prev => ({ ...prev, [option.key]: value }))}
                          min={option.min}
                          max={option.max}
                          step={option.step}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{option.min}</span>
                          <span className="font-medium">{toolOptions[option.key] || option.defaultValue}</span>
                          <span>{option.max}</span>
                        </div>
                      </div>
                    )}

                    {option.type === "input" && (
                      <Input
                        type="number"
                        value={toolOptions[option.key] || option.defaultValue}
                        onChange={(e) => {
                          setToolOptions(prev => ({ ...prev, [option.key]: parseInt(e.target.value) || option.defaultValue }))
                        }}
                        min={option.min}
                        max={option.max}
                      />
                    )}

                    {option.type === "checkbox" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={toolOptions[option.key] || false}
                          onCheckedChange={(checked) => {
                            setToolOptions(prev => ({ ...prev, [option.key]: checked }))
                          }}
                        />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    )}

                    {option.type === "color" && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={toolOptions[option.key] || option.defaultValue}
                          onChange={(e) => {
                            setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))
                          }}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <Input
                          value={toolOptions[option.key] || option.defaultValue}
                          onChange={(e) => {
                            setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))
                          }}
                          className="flex-1"
                        />
                      </div>
                    )}

                    {option.type === "text" && (
                      <Input
                        value={toolOptions[option.key] || option.defaultValue}
                        onChange={(e) => {
                          setToolOptions(prev => ({ ...prev, [option.key]: e.target.value }))
                        }}
                        placeholder={option.label}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Ad Space */}
          <div className="py-4">
            <AdBanner position="sidebar" showLabel />
          </div>
        </div>

        {/* Enhanced Sidebar Footer */}
        <div className="p-6 border-t bg-gray-50 space-y-3">
          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium text-blue-800">Processing images...</span>
              </div>
              <Progress value={66} className="h-2" />
              <p className="text-xs text-blue-600 mt-1">This may take a few moments</p>
            </div>
          )}

          {/* Error Display */}
          {!isProcessing && files.length > 0 && processedFiles.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">Ready to process {files.length} image{files.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleProcess}
            disabled={isProcessing || files.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                {title.split(' ')[0]} {files.length > 1 ? `${files.length} Images` : 'Image'} →
              </>
            )}
          </Button>


          {processedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Processing complete!</span>
                </div>
                <p className="text-xs text-green-600">
                  {processedFiles.length} image{processedFiles.length > 1 ? 's' : ''} processed successfully
                </p>
              </div>
              
              <Button 
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-semibold"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Download {processedFiles.length > 1 ? "ZIP" : "Image"}
              </Button>
            </div>
          )}

          {files.length > 0 && (
            <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
              <div className="flex justify-between">
                <span>Total files:</span>
                <span>{files.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total size:</span>
                <span>{formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}</span>
              </div>
              {processedFiles.length > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Processed size:</span>
                  <span>{formatFileSize(processedFiles.reduce((sum, file) => sum + (file.processedSize || file.size), 0))}</span>
                </div>
              )}
              {processedFiles.length > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Size reduction:</span>
                  <span>
                    {(() => {
                      const originalSize = files.reduce((sum, file) => sum + file.size, 0)
                      const processedSize = processedFiles.reduce((sum, file) => sum + (file.processedSize || file.size), 0)
                      const reduction = ((originalSize - processedSize) / originalSize) * 100
                      return reduction > 0 ? `${reduction.toFixed(1)}%` : "0%"
                    })()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={supportedFormats.join(",")}
        multiple={!singleFileOnly && maxFiles > 1}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  )
}