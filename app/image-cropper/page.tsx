"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
import { Crop } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const cropOptions = [
  {
    key: "aspectRatio",
    label: "Aspect Ratio",
    type: "select" as const,
    defaultValue: "free",
    selectOptions: [
      { value: "free", label: "Free" },
      { value: "1:1", label: "Square (1:1)" },
      { value: "4:3", label: "Standard (4:3)" },
      { value: "16:9", label: "Widescreen (16:9)" },
      { value: "3:2", label: "Photo (3:2)" },
      { value: "9:16", label: "Mobile (9:16)" },
      { value: "3:1", label: "Twitter Header (3:1)" },
      { value: "4:1", label: "LinkedIn Banner (4:1)" },
      { value: "2:3", label: "Pinterest Pin (2:3)" },
      { value: "5:4", label: "Instagram Portrait (5:4)" },
      { value: "1.91:1", label: "Facebook Cover (1.91:1)" },
    ],
    section: "Crop Settings",
  },
  {
    key: "cropPreset",
    label: "Social Media Presets",
    type: "select" as const,
    defaultValue: "custom",
    selectOptions: [
      { value: "custom", label: "Custom Size" },
      { value: "instagram-post", label: "Instagram Post (1080x1080)" },
      { value: "instagram-story", label: "Instagram Story (1080x1920)" },
      { value: "facebook-post", label: "Facebook Post (1200x630)" },
      { value: "twitter-post", label: "Twitter Post (1200x675)" },
      { value: "youtube-thumbnail", label: "YouTube Thumbnail (1280x720)" },
      { value: "linkedin-post", label: "LinkedIn Post (1200x627)" },
    ],
    section: "Crop Settings",
  },
  {
    key: "cropWidth",
    label: "Width (px)",
    type: "input" as const,
    defaultValue: 800,
    min: 1,
    max: 10000,
    section: "Dimensions",
  },
  {
    key: "cropHeight", 
    label: "Height (px)",
    type: "input" as const,
    defaultValue: 600,
    min: 1,
    max: 10000,
    section: "Dimensions",
  },
  {
    key: "positionX",
    label: "Position X (px)",
    type: "input" as const,
    defaultValue: 0,
    min: 0,
    section: "Position",
  },
  {
    key: "positionY",
    label: "Position Y (px)", 
    type: "input" as const,
    defaultValue: 0,
    min: 0,
    section: "Position",
  },
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "png",
    selectOptions: [
      { value: "png", label: "PNG" },
      { value: "jpeg", label: "JPEG" },
      { value: "webp", label: "WebP" },
    ],
    section: "Output",
  },
  {
    key: "quality",
    label: "Quality",
    type: "slider" as const,
    defaultValue: 95,
    min: 10,
    max: 100,
    step: 5,
    section: "Output",
  },
]

const cropPresets = [
  { name: "Instagram Post", values: { aspectRatio: "1:1" } },
  { name: "YouTube Thumbnail", values: { aspectRatio: "16:9" } },
  { name: "Facebook Cover", values: { aspectRatio: "16:9" } },
  { name: "Twitter Header", values: { aspectRatio: "3:1" } },
  { name: "LinkedIn Banner", values: { aspectRatio: "4:1" } },
  { name: "Pinterest Pin", values: { aspectRatio: "2:3" } },
]

async function cropImages(files: any[], options: any) {
  try {
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const cropArea = file.cropArea || { x: 10, y: 10, width: 80, height: 80 }
        
        const processedBlob = await ImageProcessor.cropImage(
          file.originalFile || file.file,
          cropArea,
          { 
            outputFormat: options.outputFormat || "png", 
            quality: options.quality || 95 
          }
        )

        const processedUrl = URL.createObjectURL(processedBlob)
        
        const outputFormat = options.outputFormat || "png"
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_cropped.${outputFormat}`

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
      error: error instanceof Error ? error.message : "Failed to crop images",
    }
  }
}

export default function ImageCropperPage() {
  return (
    <ImageToolsLayout
      title="Crop Image"
      description="Crop images with precision using our visual editor and aspect ratio presets."
      icon={Crop}
      toolType="crop"
      processFunction={cropImages}
      options={cropOptions}
      singleFileOnly={true}
      presets={cropPresets}
      supportedFormats={["image/jpeg", "image/png", "image/webp", "image/gif"]}
      outputFormats={["png", "jpeg", "webp"]}
    />
  )
}