"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
import { Maximize } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const resizeOptions = [
  {
    key: "width",
    label: "Width (px)",
    type: "input" as const,
    defaultValue: 800,
    min: 1,
    max: 10000,
    section: "Dimensions",
  },
  {
    key: "height",
    label: "Height (px)",
    type: "input" as const,
    defaultValue: 600,
    min: 1,
    max: 10000,
    section: "Dimensions",
  },
  {
    key: "maintainAspectRatio",
    label: "Lock Aspect Ratio",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Dimensions",
  },
  {
    key: "resizeMode",
    label: "Resize Mode",
    type: "select" as const,
    defaultValue: "pixels",
    selectOptions: [
      { value: "pixels", label: "Exact Pixels" },
      { value: "percentage", label: "Percentage" },
      { value: "fit", label: "Fit to Size" },
    ],
    section: "Dimensions",
  },
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "jpeg",
    selectOptions: [
      { value: "jpeg", label: "JPEG" },
      { value: "png", label: "PNG" },
      { value: "webp", label: "WebP" },
    ],
    section: "Output",
  },
  {
    key: "quality",
    label: "Quality",
    type: "slider" as const,
    defaultValue: 90,
    min: 10,
    max: 100,
    step: 5,
    section: "Output",
  },
]

const resizePresets = [
  { name: "Instagram Post", values: { width: 1080, height: 1080 } },
  { name: "YouTube Thumbnail", values: { width: 1280, height: 720 } },
  { name: "Facebook Cover", values: { width: 1200, height: 630 } },
  { name: "Twitter Header", values: { width: 1500, height: 500 } },
  { name: "LinkedIn Post", values: { width: 1200, height: 627 } },
  { name: "50% Scale", values: { resizeMode: "percentage", width: 50, height: 50 } },
]

async function resizeImages(files: any[], options: any) {
  try {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        let targetWidth = options.width
        let targetHeight = options.height
        
        // Handle percentage mode
        if (options.resizeMode === "percentage") {
          targetWidth = Math.round((file.dimensions.width * options.width) / 100)
          targetHeight = Math.round((file.dimensions.height * options.height) / 100)
        }
        
        const processedBlob = await ImageProcessor.resizeImage(file.originalFile || file.file, {
          width: targetWidth,
          height: targetHeight,
          maintainAspectRatio: options.maintainAspectRatio,
          outputFormat: options.outputFormat || "jpeg",
          quality: options.quality
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        
        const outputFormat = options.outputFormat || "jpeg"
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_resized.${outputFormat}`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob,
          dimensions: { width: targetWidth, height: targetHeight }
        }
      })
    )

    return {
      success: true,
      processedFiles,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resize images",
    }
  }
}

export default function ImageResizerPage() {
  return (
    <ImageToolsLayout
      title="Resize Image"
      description="Define your dimensions by percent or pixel, and resize your images with presets."
      icon={Maximize}
      toolType="resize"
      processFunction={resizeImages}
      options={resizeOptions}
      maxFiles={20}
      presets={resizePresets}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp", "image/gif"]}
      outputFormats={["jpeg", "png", "webp"]}
    />
  )
}