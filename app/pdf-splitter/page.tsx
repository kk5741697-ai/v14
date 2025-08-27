"use client"

import { PDFToolsLayout } from "@/components/pdf-tools-layout"
import { Scissors } from "lucide-react"
import { PDFProcessor } from "@/lib/processors/pdf-processor"

import JSZip from "jszip"

const splitOptions = [
  {
    key: "splitMode",
    label: "Split Mode",
    type: "select" as const,
    defaultValue: "range",
    selectOptions: [
      { value: "range", label: "Page Ranges" },
      { value: "pages", label: "Extract Selected Pages" },
      { value: "size", label: "Equal Parts" },
    ],
    condition: (options) => options.splitMode === "pages",
  },
  {
    key: "rangeMode",
    label: "Range Mode",
    type: "select" as const,
    defaultValue: "custom",
    selectOptions: [
      { value: "custom", label: "Custom Ranges" },
      { value: "fixed", label: "Fixed Intervals" },
    ],
    section: "Split Settings",
    condition: (options) => options.splitMode === "range",
  },
  {
    key: "mergeRanges",
    label: "Merge all ranges in one PDF file",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Split Settings",
    condition: (options) => options.splitMode === "range",
  },
  {
    key: "equalParts",
    label: "Number of Parts",
    type: "input" as const,
    defaultValue: 2,
    min: 2,
    max: 20,
    section: "Split Settings",
    condition: (options) => options.splitMode === "size",
  },
  {
    key: "preserveMetadata",
    label: "Preserve Metadata",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
]
async function splitPDF(files: any[], options: any) {
  try {
    if (files.length !== 1) {
      return {
        success: false,
        error: "Please select exactly one PDF file to split",
      }
    }

    const file = files[0]
    
    // Handle different split modes
    let ranges: Array<{ from: number; to: number }> = []
    
    if (options.splitMode === "pages" && options.selectedPages && options.selectedPages.length > 0) {
      // Split into individual pages based on selected pages
      const selectedPageNumbers = options.selectedPages.map((pageKey: string) => {
        const parts = pageKey.split('-')
        return parseInt(parts[parts.length - 1])
      }).filter((num: number) => !isNaN(num))
      
      ranges = selectedPageNumbers.map((pageNum: number) => ({ from: pageNum, to: pageNum }))
    } else if (options.splitMode === "range") {
      if (options.rangeMode === "custom" && options.pageRanges) {
        ranges = options.pageRanges || [{ from: 1, to: file.pageCount }]
      } else {
        // Fixed intervals
        const interval = Math.ceil(file.pageCount / 5) // Default 5 parts
        ranges = Array.from({ length: 5 }, (_, i) => ({
          from: i * interval + 1,
          to: Math.min((i + 1) * interval, file.pageCount)
        }))
      }
    } else if (options.splitMode === "size") {
      const parts = options.equalParts || 2
      const pagesPerPart = Math.ceil(file.pageCount / parts)
      ranges = Array.from({ length: parts }, (_, i) => ({
        from: i * pagesPerPart + 1,
        to: Math.min((i + 1) * pagesPerPart, file.pageCount)
      }))
    } else {
      // Default: extract all pages as individual files
      ranges = Array.from({ length: Math.min(file.pageCount, 50) }, (_, i) => ({ from: i + 1, to: i + 1 }))
    }

    if (ranges.length === 0) {
      return {
        success: false,
        error: "No pages selected for splitting. Please select pages or define ranges.",
      }
    }

    // Validate ranges
    const invalidRanges = ranges.filter(range => 
      range.from < 1 || range.to > file.pageCount || range.from > range.to
    )
    
    if (invalidRanges.length > 0) {
      return {
        success: false,
        error: `Invalid page ranges detected. Please check your page numbers (1-${file.pageCount}).`,
      }
    }
    const splitResults = await PDFProcessor.splitPDF(file.originalFile || file.file, ranges)

    if (options.mergeRanges && splitResults.length > 1) {
      // Merge all ranges into one PDF
      const tempFiles = splitResults.map((bytes, index) => {
        return new File([bytes], `temp-${index}.pdf`, { type: "application/pdf" })
      })
      
      const mergedBytes = await PDFProcessor.mergePDFs(tempFiles, {
        addBookmarks: false,
        preserveMetadata: options.preserveMetadata
      })
      
      const mergedBlob = new Blob([mergedBytes], { type: "application/pdf" })
      const downloadUrl = URL.createObjectURL(mergedBlob)
      
      return {
        success: true,
        downloadUrl,
      }
    } else {
      // Create ZIP with split PDFs
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()
      splitResults.forEach((pdfBytes, index) => {
        const range = ranges[index]
        const filename = range.from === range.to 
          ? `${file.name.replace(".pdf", "")}_page_${range.from}.pdf`
          : `${file.name.replace(".pdf", "")}_pages_${range.from}-${range.to}.pdf`
        zip.file(filename, pdfBytes)
      })

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
      error: error instanceof Error ? error.message : "Failed to split PDF",
    }
  }
}

export default function PDFSplitterPage() {
  return (
    <PDFToolsLayout
      title="Split PDF"
      description="Split large PDF files into smaller documents by page ranges, file size, bookmarks, or equal parts. Extract specific pages or sections easily."
      icon={Scissors}
      toolType="split"
      processFunction={splitPDF}
      options={splitOptions}
      maxFiles={1}
      allowPageSelection={true}
    />
  )
}