"use client"

import { PDFToolsLayout } from "@/components/pdf-tools-layout"
import { FileText } from "lucide-react"
import { PDFProcessor } from "@/lib/processors/pdf-processor"

const convertOptions = [
  {
    key: "conversionMode",
    label: "Conversion Mode",
    type: "select" as const,
    defaultValue: "no-ocr",
    selectOptions: [
      { value: "no-ocr", label: "NO OCR - Convert PDFs with selectable text" },
      { value: "ocr", label: "OCR - Convert scanned PDFs (Premium)" },
    ],
    section: "Conversion",
  },
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "docx",
    selectOptions: [
      { value: "docx", label: "Word Document (.docx)" },
      { value: "doc", label: "Word 97-2003 (.doc)" },
      { value: "rtf", label: "Rich Text Format (.rtf)" },
      { value: "txt", label: "Plain Text (.txt)" },
    ],
    section: "Output",
  },
  {
    key: "preserveLayout",
    label: "Preserve Layout",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "preserveImages",
    label: "Preserve Images",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "preserveFormatting",
    label: "Preserve Text Formatting",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Options",
  },
  {
    key: "language",
    label: "OCR Language",
    type: "select" as const,
    defaultValue: "eng",
    selectOptions: [
      { value: "eng", label: "English" },
      { value: "spa", label: "Spanish" },
      { value: "fra", label: "French" },
      { value: "deu", label: "German" },
      { value: "ita", label: "Italian" },
      { value: "por", label: "Portuguese" },
      { value: "rus", label: "Russian" },
      { value: "chi_sim", label: "Chinese (Simplified)" },
      { value: "jpn", label: "Japanese" },
      { value: "kor", label: "Korean" },
    ],
    section: "OCR Settings",
    condition: (options) => options.conversionMode === "ocr",
  },
]

async function convertPDFToWord(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "Please select at least one PDF file to convert",
      }
    }

    if (options.conversionMode === "ocr") {
      return {
        success: false,
        error: "OCR conversion requires Premium subscription. Please upgrade to access this feature.",
      }
    }

    const conversionOptions = {
      outputFormat: options.outputFormat,
      preserveLayout: options.preserveLayout,
      preserveImages: options.preserveImages,
      preserveFormatting: options.preserveFormatting,
      language: options.language,
    }

    if (files.length === 1) {
      // Single file conversion
      const convertedBytes = await PDFProcessor.pdfToWord(files[0].originalFile || files[0].file, conversionOptions)
      const blob = new Blob([convertedBytes], { 
        type: options.outputFormat === "docx" 
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/msword"
      })
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
        const convertedBytes = await PDFProcessor.pdfToWord(file.originalFile || file.file, conversionOptions)
        const filename = `${file.name.replace(".pdf", "")}.${options.outputFormat}`
        zip.file(filename, convertedBytes)
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
      error: error instanceof Error ? error.message : "Failed to convert PDF to Word",
    }
  }
}

export default function PDFToWordPage() {
  return (
    <PDFToolsLayout
      title="PDF to Word Converter"
      description="Convert PDF files to editable Word documents. Supports both text-based PDFs and scanned documents with OCR."
      icon={FileText}
      toolType="convert"
      processFunction={convertPDFToWord}
      options={convertOptions}
      maxFiles={10}
    />
  )
}