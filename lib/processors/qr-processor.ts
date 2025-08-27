import QRCode from "qrcode"
import jsQR from "jsqr"

export interface QRCodeOptions {
  width?: number
  height?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
  type?: "image/png" | "image/jpeg" | "image/webp"
  quality?: number
  maskPattern?: number
  version?: number
  logo?: {
    src: string
    width?: number
    height?: number
    x?: number
    y?: number
  }
}

export interface QRScanResult {
  data: string
  location?: {
    topLeftCorner: { x: number; y: number }
    topRightCorner: { x: number; y: number }
    bottomLeftCorner: { x: number; y: number }
    bottomRightCorner: { x: number; y: number }
  }
}

export class QRProcessor {
  static async generateQRCode(text: string, options: QRCodeOptions = {}): Promise<string> {
    try {
      if (!text || text.trim() === "") {
        throw new Error("QR code content cannot be empty")
      }

      // Validate text length
      if (text.length > 4296) {
        throw new Error("QR code content is too long. Maximum 4296 characters allowed.")
      }

      const qrOptions = {
        width: Math.max(100, Math.min(4000, options.width || 1000)),
        margin: Math.max(0, Math.min(10, options.margin || 4)),
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
        type: options.type || "image/png",
        quality: Math.max(0.1, Math.min(1, options.quality || 0.92)),
        maskPattern: options.maskPattern,
        version: options.version,
      }

      // Generate base QR code
      const qrDataURL = await QRCode.toDataURL(text, qrOptions)

      // Add logo if provided
      if (options.logo?.src) {
        return await this.addLogoToQR(qrDataURL, options.logo, options.width || 1000)
      }

      return qrDataURL
    } catch (error) {
      console.error("QR generation failed:", error)
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async generateQRCodeSVG(text: string, options: QRCodeOptions = {}): Promise<string> {
    try {
      if (!text || text.trim() === "") {
        throw new Error("QR code content cannot be empty")
      }

      if (text.length > 4296) {
        throw new Error("QR code content is too long. Maximum 4296 characters allowed.")
      }

      const qrOptions = {
        width: Math.max(100, Math.min(4000, options.width || 1000)),
        margin: Math.max(0, Math.min(10, options.margin || 4)),
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
        maskPattern: options.maskPattern,
        version: options.version,
      }

      return await QRCode.toString(text, { ...qrOptions, type: "svg" })
    } catch (error) {
      console.error("QR SVG generation failed:", error)
      throw new Error(`Failed to generate QR SVG: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private static async addLogoToQR(
    qrDataURL: string,
    logo: NonNullable<QRCodeOptions["logo"]>,
    qrSize: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas not supported"))
          return
        }

        canvas.width = qrSize
        canvas.height = qrSize

        const qrImage = new Image()
        qrImage.onload = () => {
          // Draw QR code
          ctx.drawImage(qrImage, 0, 0, qrSize, qrSize)

          const logoImage = new Image()
          logoImage.crossOrigin = "anonymous"
          logoImage.onload = () => {
            try {
              // Calculate logo size and position with better proportions
              const maxLogoSize = qrSize * 0.2
              const logoSize = Math.min(maxLogoSize, logo.width || maxLogoSize)
              const logoX = logo.x !== undefined ? logo.x : (qrSize - logoSize) / 2
              const logoY = logo.y !== undefined ? logo.y : (qrSize - logoSize) / 2

              // Draw white background for logo with rounded corners
              const padding = Math.max(4, logoSize * 0.1)
              ctx.fillStyle = "#FFFFFF"
              ctx.beginPath()
              ctx.roundRect(logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2, 8)
              ctx.fill()

              // Add subtle shadow
              ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
              ctx.shadowBlur = 4
              ctx.shadowOffsetX = 2
              ctx.shadowOffsetY = 2

              // Draw logo
              ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)

              resolve(canvas.toDataURL("image/png"))
            } catch (error) {
              console.error("Logo processing failed:", error)
              resolve(qrDataURL) // Return original QR without logo
            }
          }
          logoImage.onerror = () => {
            console.warn("Failed to load logo, returning QR without logo")
            resolve(qrDataURL)
          }
          logoImage.src = logo.src
        }
        qrImage.onerror = () => reject(new Error("Failed to load QR code"))
        qrImage.src = qrDataURL
      } catch (error) {
        reject(new Error(`Logo addition failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  static async scanQRCode(imageFile: File): Promise<QRScanResult> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas not supported"))
          return
        }

        const img = new Image()
        img.onload = () => {
          try {
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            ctx.drawImage(img, 0, 0)

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height)

            if (code) {
              resolve({
                data: code.data,
                location: code.location
              })
            } else {
              reject(new Error("No QR code found in image. Please ensure the image contains a clear, visible QR code."))
            }
          } catch (error) {
            reject(new Error(`QR scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
          }
        }
        img.onerror = () => reject(new Error("Failed to load image for QR scanning"))
        img.src = URL.createObjectURL(imageFile)
      } catch (error) {
        reject(new Error(`QR scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  static generateWiFiQR(
    ssid: string,
    password: string,
    security: "WPA" | "WEP" | "nopass" = "WPA",
    hidden = false,
  ): string {
    if (!ssid.trim()) {
      throw new Error("WiFi SSID cannot be empty")
    }

    // Escape special characters
    const escapedSSID = ssid.replace(/([\\;,":.])/g, '\\$1')
    const escapedPassword = password.replace(/([\\;,":.])/g, '\\$1')

    return `WIFI:T:${security};S:${escapedSSID};P:${escapedPassword};H:${hidden ? "true" : "false"};;`
  }

  static generateVCardQR(contact: {
    firstName?: string
    lastName?: string
    organization?: string
    phone?: string
    email?: string
    url?: string
    address?: string
  }): string {
    // Validate required fields
    if (!contact.firstName && !contact.lastName && !contact.email) {
      throw new Error("At least one of firstName, lastName, or email is required")
    }

    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      contact.firstName || contact.lastName ? `FN:${(contact.firstName || "").trim()} ${(contact.lastName || "").trim()}`.trim() : "",
      contact.organization ? `ORG:${contact.organization}` : "",
      contact.phone ? `TEL:${contact.phone}` : "",
      contact.email ? `EMAIL:${contact.email}` : "",
      contact.url ? `URL:${contact.url}` : "",
      contact.address ? `ADR:;;${contact.address};;;;` : "",
      "END:VCARD",
    ]
      .filter((line) => line !== "")
      .join("\n")

    return vcard
  }

  static generateEventQR(event: {
    title: string
    location?: string
    startDate: string
    endDate?: string
    description?: string
  }): string {
    if (!event.title.trim()) {
      throw new Error("Event title cannot be empty")
    }

    // Format dates properly
    const formatDate = (dateStr: string) => {
      try {
        const date = new Date(dateStr)
        return date.toISOString().replace(/[-:]/g, "").split('.')[0] + "Z"
      } catch {
        throw new Error("Invalid date format")
      }
    }

    const vevent = [
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      event.location ? `LOCATION:${event.location}` : "",
      `DTSTART:${formatDate(event.startDate)}`,
      event.endDate ? `DTEND:${formatDate(event.endDate)}` : "",
      event.description ? `DESCRIPTION:${event.description}` : "",
      "END:VEVENT",
    ]
      .filter((line) => line !== "")
      .join("\n")

    return vevent
  }

  static async generateBulkQRCodes(
    data: Array<{ content: string; filename?: string }>,
    options: QRCodeOptions = {},
  ): Promise<Array<{ dataURL: string; filename: string }>> {
    const results = []
    const maxBulkSize = 100

    if (data.length > maxBulkSize) {
      throw new Error(`Too many QR codes requested. Maximum ${maxBulkSize} allowed.`)
    }

    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      try {
        if (!item.content || item.content.trim() === "") {
          console.warn(`Skipping empty content for item ${i + 1}`)
          continue
        }

        const qrDataURL = await this.generateQRCode(item.content, options)
        results.push({
          dataURL: qrDataURL,
          filename: item.filename || `qr-code-${i + 1}.png`,
        })
      } catch (error) {
        console.error(`Failed to generate QR code for item ${i + 1}:`, error)
        // Continue with other items instead of failing completely
      }
    }

    if (results.length === 0) {
      throw new Error("No valid QR codes could be generated")
    }

    return results
  }
}