"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
import { Archive } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const compressOptions = [
  {
    key: "compressionLevel",
    label: "Compression Level",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "low", label: "Low (High Quality)" },
      { value: "medium", label: "Medium (Balanced)" },
      { value: "high", label: "High (Small Size)" },
      { value: "maximum", label: "Maximum (Smallest)" },
    ],
    section: "Compression",
  },
  {
    key: "quality",
    label: "Quality",
    type: "slider" as const,
    defaultValue: 80,
    min: 10,
    max: 100,
    step: 5,
    section: "Compression",
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
]

async function compressImages(files: any[], options: any) {
  try {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const processedBlob = await ImageProcessor.compressImage(file.originalFile || file.file, {
          quality: options.quality,
          compressionLevel: options.compressionLevel,
          outputFormat: options.outputFormat || "jpeg"
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        
        const outputFormat = options.outputFormat || "jpeg"
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_compressed.${outputFormat}`

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
      error: error instanceof Error ? error.message : "Failed to compress images",
    }
  }
}

export default function ImageCompressorPage() {
  return (
    <ImageToolsLayout
      title="Compress Image"
      description="Compress JPG, PNG, WebP, and GIFs while saving space and maintaining quality."
      icon={Archive}
      toolType="compress"
      processFunction={compressImages}
      options={compressOptions}
      maxFiles={20}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp", "image/gif"]}
      outputFormats={["jpeg", "png", "webp"]}
    />
  )
}