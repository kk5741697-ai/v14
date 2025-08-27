"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
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
    ],
    section: "Output",
  },
  {
    key: "quality",
    label: "Quality (for JPEG/WebP)",
    type: "slider" as const,
    defaultValue: 90,
    min: 10,
    max: 100,
    step: 5,
    section: "Output",
  },
  {
    key: "backgroundColor",
    label: "Background Color (for transparent images)",
    type: "color" as const,
    defaultValue: "#ffffff",
    section: "Options",
  },
  {
    key: "preserveTransparency",
    label: "Preserve Transparency",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "rotation",
    label: "Rotation (degrees)",
    type: "select" as const,
    defaultValue: "0",
    selectOptions: [
      { value: "0", label: "No Rotation" },
      { value: "90", label: "90° Clockwise" },
      { value: "180", label: "180° (Flip)" },
      { value: "270", label: "270° Clockwise" },
      { value: "custom", label: "Custom Angle" },
    ],
    section: "Transform",
  },
  {
    key: "customRotation",
    label: "Custom Rotation Angle",
    type: "slider" as const,
    defaultValue: 0,
    min: -180,
    max: 180,
    step: 1,
    section: "Transform",
    condition: (options) => options.rotation === "custom",
  },
  {
    key: "flipHorizontal",
    label: "Flip Horizontal",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Transform",
  },
  {
    key: "flipVertical",
    label: "Flip Vertical",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Transform",
  },
  {
    key: "brightness",
    label: "Brightness",
    type: "slider" as const,
    defaultValue: 100,
    min: 0,
    max: 200,
    step: 5,
    section: "Adjustments",
  },
  {
    key: "contrast",
    label: "Contrast",
    type: "slider" as const,
    defaultValue: 100,
    min: 0,
    max: 200,
    step: 5,
    section: "Adjustments",
  },
  {
    key: "saturation",
    label: "Saturation",
    type: "slider" as const,
    defaultValue: 100,
    min: 0,
    max: 200,
    step: 5,
    section: "Adjustments",
  },
  {
    key: "autoOptimize",
    label: "Auto Optimize Quality",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Output",
  },
  {
    key: "removeMetadata",
    label: "Remove EXIF Data",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Output",
  },
  {
    key: "resizeWidth",
    label: "Resize Width (px)",
    type: "input" as const,
    defaultValue: 0,
    min: 0,
    max: 10000,
    section: "Resize",
  },
  {
    key: "resizeHeight",
    label: "Resize Height (px)",
    type: "input" as const,
    defaultValue: 0,
    min: 0,
    max: 10000,
    section: "Resize",
  },
  {
    key: "maintainAspectRatio",
    label: "Lock Aspect Ratio",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Resize",
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
        let rotation = 0
        if (options.rotation === "custom") {
          rotation = options.customRotation || 0
        } else {
          rotation = parseInt(options.rotation) || 0
        }

        const processedBlob = await ImageProcessor.convertFormat(
          file.originalFile || file.file,
          options.outputFormat as "jpeg" | "png" | "webp",
          {
            quality: options.quality,
            backgroundColor: options.backgroundColor,
            outputFormat: options.outputFormat as "jpeg" | "png" | "webp",
            rotation,
            flipHorizontal: options.flipHorizontal,
            flipVertical: options.flipVertical,
            width: options.resizeWidth > 0 ? options.resizeWidth : undefined,
            height: options.resizeHeight > 0 ? options.resizeHeight : undefined,
            maintainAspectRatio: options.maintainAspectRatio,
            filters: {
              brightness: options.brightness,
              contrast: options.contrast,
              saturation: options.saturation,
            }
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
    <ImageToolsLayout
      title="Image Converter"
      description="Convert images between different formats including JPEG, PNG, and WebP. Apply rotation, flipping, and adjustments during conversion."
      icon={RefreshCw}
      toolType="convert"
      processFunction={convertImages}
      options={convertOptions}
      maxFiles={15}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/gif", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
    />
  )
}