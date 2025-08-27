"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
import { Droplets } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const watermarkOptions = [
  {
    key: "watermarkText",
    label: "Watermark Text",
    type: "text" as const,
    defaultValue: "© Your Brand",
    section: "Watermark",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "slider" as const,
    defaultValue: 50,
    min: 10,
    max: 100,
    step: 5,
    section: "Watermark",
  },
  {
    key: "fontSize",
    label: "Font Size",
    type: "slider" as const,
    defaultValue: 5,
    min: 1,
    max: 15,
    step: 1,
    section: "Watermark",
  },
  {
    key: "position",
    label: "Position",
    type: "select" as const,
    defaultValue: "center",
    selectOptions: [
      { value: "center", label: "Center" },
      { value: "top-left", label: "Top Left" },
      { value: "top-right", label: "Top Right" },
      { value: "bottom-left", label: "Bottom Left" },
      { value: "bottom-right", label: "Bottom Right" },
      { value: "diagonal", label: "Diagonal" },
    ],
    section: "Position",
  },
  {
    key: "textColor",
    label: "Text Color",
    type: "color" as const,
    defaultValue: "#ffffff",
    section: "Style",
  },
  {
    key: "shadowEnabled",
    label: "Add Text Shadow",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Style",
  },
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
    label: "Quality",
    type: "slider" as const,
    defaultValue: 90,
    min: 10,
    max: 100,
    step: 5,
    section: "Output",
  },
]

async function addWatermarkToImages(files: any[], options: any) {
  try {
    if (!options.watermarkText || options.watermarkText.trim() === "") {
      return {
        success: false,
        error: "Please provide watermark text",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const processedBlob = await ImageProcessor.addWatermark(file.originalFile || file.file, options.watermarkText, {
          watermarkOpacity: options.opacity / 100,
          outputFormat: options.outputFormat,
          quality: options.quality,
          position: options.position,
          textColor: options.textColor,
          shadowEnabled: options.shadowEnabled,
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        
        // Update file name with correct extension
        const outputFormat = options.outputFormat || "png"
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_watermarked.${outputFormat}`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          size: processedBlob.size,
          blob: processedBlob
        }
      }),
    )

    return {
      success: true,
      processedFiles,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add watermark",
    }
  }
}

export default function ImageWatermarkPage() {
  return (
    <ImageToolsLayout
      title="Image Watermark"
      description="Add text watermarks to your images for copyright protection and branding. Customize opacity, position, size, and color."
      icon={Droplets}
      toolType="watermark"
      processFunction={addWatermarkToImages}
      options={watermarkOptions}
      maxFiles={10}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
    />
  )
}
