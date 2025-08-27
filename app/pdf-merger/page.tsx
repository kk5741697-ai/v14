"use client"

import { PDFToolsLayout } from "@/components/pdf-tools-layout"
import { FileType } from "lucide-react"
import { PDFProcessor } from "@/lib/processors/pdf-processor"

const mergeOptions = [
  {
    key: "addBookmarks",
    label: "Add Bookmarks",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "preserveMetadata",
    label: "Preserve Metadata",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "mergeMode",
    label: "Merge Mode",
    type: "select" as const,
    defaultValue: "sequential",
    selectOptions: [
      { value: "sequential", label: "Sequential Order" },
      { value: "interleave", label: "Interleave Pages" },
      { value: "custom", label: "Custom Order" },
    ],
    section: "Merge Settings",
  },
]

async function mergePDFs(files: any[], options: any) {
  try {
    if (files.length < 2) {
      return {
        success: false,
        error: "At least 2 PDF files are required for merging",
      }
    }

    const fileObjects = files.map((f: any) => f.originalFile || f.file)
    const mergedPdfBytes = await PDFProcessor.mergePDFs(fileObjects, {
      addBookmarks: options.addBookmarks,
      preserveMetadata: options.preserveMetadata
    })

    const mergedBlob = new Blob([mergedPdfBytes], { type: "application/pdf" })
    const downloadUrl = URL.createObjectURL(mergedBlob)

    return {
      success: true,
      downloadUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to merge PDFs",
    }
  }
}

export default function PDFMergerPage() {
  return (
    <PDFToolsLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document with custom page ordering and bookmark preservation. Perfect for merging reports, presentations, and documents."
      icon={FileType}
      toolType="merge"
      processFunction={mergePDFs}
      options={mergeOptions}
      maxFiles={10}
      allowPageReorder={true}
    />
  )
}