"use client"

import { PDFToolsLayout } from "@/components/pdf-tools-layout"
import { Archive } from "lucide-react"
import { PDFProcessor } from "@/lib/processors/pdf-processor"

const compressOptions = [
  {
    key: "compressionLevel",
    label: "Compression Level",
    type: "select" as const,
    defaultValue: "medium",
    selectOptions: [
      { value: "low", label: "Low Compression (High Quality)" },
      { value: "medium", label: "Medium Compression (Balanced)" },
      { value: "high", label: "High Compression (Small Size)" },
      { value: "extreme", label: "Extreme Compression (Smallest)" },
    ],
    section: "Compression",
  },
  {
    key: "optimizeImages",
    label: "Optimize Images",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "removeMetadata",
    label: "Remove Metadata",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Options",
  },
]

async function compressPDF(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "Please select at least one PDF file to compress",
      }
    }

    const compressionOptions = {
      quality: 80,
      compressionLevel: options.compressionLevel,
      optimizeImages: options.optimizeImages,
      removeMetadata: options.removeMetadata,
    }

    if (files.length === 1) {
      // Single file compression
      const compressedBytes = await PDFProcessor.compressPDF(files[0].originalFile || files[0].file, compressionOptions)
      const blob = new Blob([compressedBytes], { type: "application/pdf" })
      const downloadUrl = URL.createObjectURL(blob)

      return {
        success: true,
        downloadUrl,
      }
    } else {
      // Multiple files - create ZIP
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      for (const file of files) {
        const compressedBytes = await PDFProcessor.compressPDF(file.originalFile || file.file, compressionOptions)
        const filename = `compressed_${file.name}`
        zip.file(filename, compressedBytes)
      }

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const downloadUrl = URL.createObjectURL(zipBlob)

      return {
        success: true,
        downloadUrl,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to compress PDF",
    }
  }
}

export default function PDFCompressorPage() {
  return (
    <PDFToolsLayout
      title="PDF Compressor"
      description="Reduce PDF file size while maintaining quality. Optimize images, compress fonts, and remove unnecessary metadata to create smaller files."
      icon={Archive}
      toolType="compress"
      processFunction={compressPDF}
      options={compressOptions}
      maxFiles={5}
    />
  )
}
