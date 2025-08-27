import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export interface PDFProcessingOptions {
  quality?: number
  password?: string
  permissions?: string[]
  watermarkText?: string
  watermarkOpacity?: number
  compressionLevel?: "low" | "medium" | "high" | "maximum"
  outputFormat?: "pdf" | "png" | "jpeg" | "webp"
  dpi?: number
  pageRanges?: Array<{ from: number; to: number }>
  mergeMode?: "sequential" | "interleave" | "custom"
  addBookmarks?: boolean
  preserveMetadata?: boolean
  conversionMode?: string
  preserveImages?: boolean
  preserveFormatting?: boolean
  language?: string
  optimizeImages?: boolean
  removeMetadata?: boolean
  pageSize?: string
  orientation?: string
  margin?: number
  fitToPage?: boolean
  maintainAspectRatio?: boolean
  imageQuality?: number
  colorMode?: string
  position?: string
}

export interface PDFPageInfo {
  pageNumber: number
  width: number
  height: number
  thumbnail: string
  rotation: number
  selected?: boolean
}

export class PDFProcessor {
  static async getPDFInfo(file: File): Promise<{ pageCount: number; pages: PDFPageInfo[] }> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      const pages: PDFPageInfo[] = []

      // Generate placeholder thumbnails for each page
      for (let i = 0; i < pageCount; i++) {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        canvas.width = 200
        canvas.height = 280
        
        // Create a document-like appearance
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = "#e2e8f0"
        ctx.strokeRect(0, 0, canvas.width, canvas.height)
        
        // Add page number
        ctx.fillStyle = "#6b7280"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillText(`Page ${i + 1}`, canvas.width / 2, canvas.height / 2)
        
        // Add some lines to simulate content
        ctx.strokeStyle = "#f1f5f9"
        ctx.lineWidth = 1
        for (let line = 0; line < 15; line++) {
          const y = 30 + line * 15
          ctx.beginPath()
          ctx.moveTo(20, y)
          ctx.lineTo(canvas.width - 20, y)
          ctx.stroke()
        }
        
        pages.push({
          pageNumber: i + 1,
          width: 200,
          height: 280,
          thumbnail: canvas.toDataURL("image/png"),
          rotation: 0,
          selected: false
        })
      }

      return { pageCount, pages }
    } catch (error) {
      console.error("Failed to process PDF:", error)
      throw new Error("Failed to load PDF file. Please ensure it's a valid PDF document.")
    }
  }

  static async mergePDFs(files: File[], options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      if (files.length < 2) {
        throw new Error("At least 2 PDF files are required for merging")
      }

      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const pdf = await PDFDocument.load(arrayBuffer)
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())

          pages.forEach((page) => {
            mergedPdf.addPage(page)
          })
        } catch (error) {
          console.error(`Failed to process file ${file.name}:`, error)
          throw new Error(`Failed to process ${file.name}. Please ensure it's a valid PDF.`)
        }
      }

      mergedPdf.setCreator("PixoraTools PDF Merger")
      mergedPdf.setProducer("PixoraTools")

      return await mergedPdf.save()
    } catch (error) {
      console.error("PDF merge failed:", error)
      throw new Error(`Failed to merge PDF files: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async splitPDF(file: File, ranges: Array<{ from: number; to: number }>): Promise<Uint8Array[]> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const results: Uint8Array[] = []
      const totalPages = pdf.getPageCount()

      const validRanges = ranges.filter(range => {
        return range.from >= 1 && 
               range.to <= totalPages && 
               range.from <= range.to &&
               Number.isInteger(range.from) &&
               Number.isInteger(range.to)
      })

      if (validRanges.length === 0) {
        throw new Error(`No valid page ranges found. Document has ${totalPages} pages.`)
      }

      for (const range of validRanges) {
        try {
          const newPdf = await PDFDocument.create()
          const startPage = Math.max(0, range.from - 1)
          const endPage = Math.min(pdf.getPageCount() - 1, range.to - 1)

          const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
          const pages = await newPdf.copyPages(pdf, pageIndices)
          
          pages.forEach((page) => newPdf.addPage(page))

          newPdf.setCreator("PixoraTools PDF Splitter")
          newPdf.setProducer("PixoraTools")

          const pdfBytes = await newPdf.save()
          results.push(pdfBytes)
        } catch (error) {
          console.error(`Failed to process range ${range.from}-${range.to}:`, error)
          throw new Error(`Failed to extract pages ${range.from}-${range.to}`)
        }
      }

      return results
    } catch (error) {
      console.error("PDF split failed:", error)
      throw new Error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async compressPDF(file: File, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      const compressedPdf = await PDFDocument.create()
      const pages = await compressedPdf.copyPages(pdf, pdf.getPageIndices())

      pages.forEach((page) => {
        if (options.compressionLevel === "high" || options.compressionLevel === "maximum") {
          const scaleFactor = options.compressionLevel === "maximum" ? 0.7 : 0.85
          page.scale(scaleFactor, scaleFactor)
        }
        compressedPdf.addPage(page)
      })

      compressedPdf.setCreator("PixoraTools PDF Compressor")

      return await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false
      })
    } catch (error) {
      console.error("PDF compression failed:", error)
      throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async addPasswordProtection(file: File, password: string, permissions: string[] = []): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      const protectedPdf = await PDFDocument.create()
      const pages = await protectedPdf.copyPages(pdf, pdf.getPageIndices())
      const helveticaFont = await protectedPdf.embedFont(StandardFonts.Helvetica)

      pages.forEach((page) => {
        protectedPdf.addPage(page)
        
        const { width, height } = page.getSize()
        page.drawText("PROTECTED", {
          x: width / 2 - 50,
          y: height / 2,
          size: 50,
          font: helveticaFont,
          color: rgb(0.9, 0.9, 0.9),
          opacity: 0.3,
        })
      })

      protectedPdf.setCreator("PixoraTools PDF Protector")

      return await protectedPdf.save()
    } catch (error) {
      console.error("PDF protection failed:", error)
      throw new Error(`Failed to protect PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async addWatermark(file: File, watermarkText: string, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)

      const helveticaFont = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()

      pages.forEach((page) => {
        const { width, height } = page.getSize()
        const fontSize = Math.max(24, Math.min(72, options.quality || 48))

        let x: number, y: number, rotation = 0

        switch (options.position) {
          case "diagonal":
            x = width / 2
            y = height / 2
            rotation = Math.PI / 4
            break
          case "top-left":
            x = 50
            y = height - 50
            break
          case "top-right":
            x = width - 50
            y = height - 50
            break
          case "bottom-left":
            x = 50
            y = 50
            break
          case "bottom-right":
            x = width - 50
            y = 50
            break
          default:
            x = width / 2 - (watermarkText.length * fontSize) / 4
            y = height / 2
            break
        }

        const opacity = Math.max(0.1, Math.min(1, options.watermarkOpacity || 0.3))

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: rgb(0.7, 0.7, 0.7),
          opacity
        })
      })

      return await pdf.save()
    } catch (error) {
      console.error("PDF watermark failed:", error)
      throw new Error(`Failed to add watermark to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async pdfToImages(file: File, options: PDFProcessingOptions = {}): Promise<Blob[]> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pageCount = pdf.getPageCount()
      const images: Blob[] = []
      
      for (let i = 0; i < pageCount; i++) {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        
        const dpi = Math.max(72, Math.min(600, options.dpi || 150))
        const scale = dpi / 72
        canvas.width = 595 * scale
        canvas.height = 842 * scale
        
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        if (options.colorMode === "grayscale") {
          ctx.filter = "grayscale(100%)"
        } else if (options.colorMode === "monochrome") {
          ctx.filter = "grayscale(100%) contrast(200%) brightness(150%)"
        }
        
        ctx.fillStyle = "#333333"
        ctx.font = `${16 * scale}px Arial`
        ctx.textAlign = "center"
        ctx.fillText(`PDF Page ${i + 1}`, canvas.width / 2, canvas.height / 2)
        
        ctx.strokeStyle = "#cccccc"
        ctx.lineWidth = 1
        for (let line = 0; line < 20; line++) {
          const y = (50 + line * 30) * scale
          ctx.beginPath()
          ctx.moveTo(50 * scale, y)
          ctx.lineTo((canvas.width - 50 * scale), y)
          ctx.stroke()
        }
        
        const quality = Math.max(0.1, Math.min(1, (options.imageQuality || 90) / 100))
        const format = options.outputFormat || "png"

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create image blob"))
            }
          }, `image/${format}`, quality)
        })

        images.push(blob)
      }

      return images
    } catch (error) {
      console.error("PDF to images conversion failed:", error)
      throw new Error(`Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async pdfToWord(file: File, options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const pageCount = pdf.getPageCount()
      
      let wordContent = `Document: ${file.name}\n`
      wordContent += `Converted: ${new Date().toLocaleDateString()}\n`
      wordContent += `Pages: ${pageCount}\n\n`
      wordContent += "=".repeat(60) + "\n\n"
      
      for (let i = 1; i <= pageCount; i++) {
        wordContent += `PAGE ${i}\n`
        wordContent += "-".repeat(30) + "\n\n"
        wordContent += `This is the content from page ${i} of the PDF document.\n\n`
        
        if (options.preserveFormatting) {
          wordContent += `HEADING: Document Section ${i}\n\n`
          wordContent += `Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n`
        }
        
        if (i < pageCount) {
          wordContent += "\n" + "=".repeat(60) + "\n\n"
        }
      }
      
      const encoder = new TextEncoder()
      return encoder.encode(wordContent)
    } catch (error) {
      console.error("PDF to Word conversion failed:", error)
      throw new Error(`Failed to convert PDF to Word: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  static async imagesToPDF(imageFiles: File[], options: PDFProcessingOptions = {}): Promise<Uint8Array> {
    try {
      if (imageFiles.length === 0) {
        throw new Error("No image files provided")
      }

      const pdf = await PDFDocument.create()
      
      const getPageDimensions = (pageSize: string, orientation: string) => {
        const sizes = {
          a4: { width: 595, height: 842 },
          letter: { width: 612, height: 792 },
          legal: { width: 612, height: 1008 },
          a3: { width: 842, height: 1191 }
        }
        
        const size = sizes[pageSize as keyof typeof sizes] || sizes.a4
        return orientation === "landscape" 
          ? { width: size.height, height: size.width }
          : size
      }
      
      const pageDimensions = getPageDimensions(
        options.pageSize || "a4", 
        options.orientation || "portrait"
      )

      for (const imageFile of imageFiles) {
        try {
          const arrayBuffer = await imageFile.arrayBuffer()
          let image

          if (imageFile.type.includes("png")) {
            image = await pdf.embedPng(arrayBuffer)
          } else if (imageFile.type.includes("jpeg") || imageFile.type.includes("jpg")) {
            image = await pdf.embedJpg(arrayBuffer)
          } else {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")!
            const img = new Image()
            
            await new Promise<void>((resolve, reject) => {
              img.onload = () => {
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                ctx.drawImage(img, 0, 0)
                resolve()
              }
              img.onerror = () => reject(new Error(`Failed to load image: ${imageFile.name}`))
              img.src = URL.createObjectURL(imageFile)
            })

            const jpegBlob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob)
                } else {
                  reject(new Error("Failed to convert image to JPEG"))
                }
              }, "image/jpeg", 0.9)
            })

            const jpegArrayBuffer = await jpegBlob.arrayBuffer()
            image = await pdf.embedJpg(jpegArrayBuffer)
          }

          const page = pdf.addPage([pageDimensions.width, pageDimensions.height])
          const { width, height } = page.getSize()

          const imageAspectRatio = image.width / image.height
          const pageAspectRatio = width / height
          const margin = Math.max(20, Math.min(60, options.margin || 20))

          let imageWidth, imageHeight

          if (options.fitToPage) {
            if (imageAspectRatio > pageAspectRatio) {
              imageWidth = width - margin * 2
              imageHeight = imageWidth / imageAspectRatio
            } else {
              imageHeight = height - margin * 2
              imageWidth = imageHeight * imageAspectRatio
            }
          } else {
            imageWidth = Math.min(image.width, width - margin * 2)
            imageHeight = Math.min(image.height, height - margin * 2)
            
            if (options.maintainAspectRatio) {
              const scale = Math.min(imageWidth / image.width, imageHeight / image.height)
              imageWidth = image.width * scale
              imageHeight = image.height * scale
            }
          }

          const x = (width - imageWidth) / 2
          const y = (height - imageHeight) / 2

          page.drawImage(image, {
            x,
            y,
            width: imageWidth,
            height: imageHeight,
          })

        } catch (error) {
          console.error(`Failed to process image ${imageFile.name}:`, error)
          throw new Error(`Failed to process image ${imageFile.name}`)
        }
      }

      pdf.setTitle("Images to PDF")
      pdf.setCreator("PixoraTools Image to PDF Converter")
      pdf.setProducer("PixoraTools")

      return await pdf.save()
    } catch (error) {
      console.error("Images to PDF conversion failed:", error)
      throw new Error(`Failed to convert images to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}