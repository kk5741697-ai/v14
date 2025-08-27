"use client"

import { SimpleImageToolLayout } from "@/components/simple-image-tool-layout"
import { RefreshCw } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const convertOptions = [
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "png",
    selectOptions: [
      { value: "jpeg", label: "JPEG" },
      { value: "png", label: "PNG" },
      { value: "webp", label: "WebP" },
      { value: "gif", label: "GIF" },
      { value: "bmp", label: "BMP" },
      { value: "tiff", label: "TIFF" },
    ],
  },
  {
    key: "quality",
    label: "Quality (for JPEG/WebP)",
    type: "slider" as const,
    defaultValue: 90,
    min: 10,
    max: 100,
    step: 5,
  },
  {
    key: "backgroundColor",
    label: "Background Color (for transparent images)",
    type: "color" as const,
    defaultValue: "#ffffff",
  },
  {
    key: "preserveTransparency",
    label: "Preserve Transparency",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeMetadata",
    label: "Remove Metadata",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

async function convertImages(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const processedBlob = await ImageProcessor.convertFormat(
          file.originalFile || file.file,
          options.outputFormat as "jpeg" | "png" | "webp",
          {
            quality: options.quality,
            backgroundColor: options.backgroundColor,
            outputFormat: options.outputFormat as "jpeg" | "png" | "webp"
          }
        )

        const processedUrl = URL.createObjectURL(processedBlob)
        
        // Update file name with correct extension
        const outputFormat = options.outputFormat || "png"
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}.${outputFormat}`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob
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
      error: error instanceof Error ? error.message : "Failed to convert images",
    }
  }
}

export default function ImageConverterPage() {
  return (
    <ImageToolLayout
      title="Image Converter"
      description="Convert images between different formats including JPEG, PNG, WebP, GIF, BMP, and TIFF. Preserve quality and transparency as needed."
      icon={RefreshCw}
      toolType="convert"
      processFunction={convertImages}
      options={convertOptions}
      maxFiles={15}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff"]}
    />
  )
}