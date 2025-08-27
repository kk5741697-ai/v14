import imageCompression from "browser-image-compression"

export interface ImageProcessingOptions {
  quality?: number
  width?: number
  height?: number
  maintainAspectRatio?: boolean
  outputFormat?: "jpeg" | "png" | "webp"
  backgroundColor?: string
  watermarkText?: string
  watermarkOpacity?: number
  rotation?: number
  cropArea?: { x: number; y: number; width: number; height: number }
  compressionLevel?: "low" | "medium" | "high" | "maximum"
  flipHorizontal?: boolean
  flipVertical?: boolean
  filters?: {
    brightness?: number
    contrast?: number
    saturation?: number
    blur?: number
    sepia?: boolean
    grayscale?: boolean
  }
}

export class ImageProcessor {

  static async resizeImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas not supported")

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = async () => {
        try {
          let { width: targetWidth, height: targetHeight } = options
          const { naturalWidth: originalWidth, naturalHeight: originalHeight } = img

          // Calculate target dimensions
          if (options.maintainAspectRatio !== false && targetWidth && targetHeight) {
            const aspectRatio = originalWidth / originalHeight
            if (targetWidth / targetHeight > aspectRatio) {
              targetWidth = targetHeight * aspectRatio
            } else {
              targetHeight = targetWidth / aspectRatio
            }
          } else if (targetWidth && !targetHeight) {
            targetHeight = (targetWidth / originalWidth) * originalHeight
          } else if (targetHeight && !targetWidth) {
            targetWidth = (targetHeight / originalHeight) * originalWidth
          }

          canvas.width = targetWidth!
          canvas.height = targetHeight!

          // Apply background color if needed
          if (options.backgroundColor && options.outputFormat !== "png") {
            ctx.fillStyle = options.backgroundColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }

          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Convert to blob with proper format
          const quality = (options.quality || 90) / 100
          const mimeType = `image/${options.outputFormat || "jpeg"}`

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob"))
            }
          }, mimeType, quality)

        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  static async compressImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    const compressionOptions = {
      maxSizeMB: this.getMaxSizeMB(options.compressionLevel),
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: (options.quality || 80) / 100,
      fileType: "image/jpeg" as any
    }

    try {
      return await imageCompression(file, compressionOptions)
    } catch (error) {
      // Fallback to canvas compression
      return this.resizeImage(file, options)
    }
  }

  static async cropImage(file: File, cropArea: { x: number; y: number; width: number; height: number }, options: ImageProcessingOptions = {}): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas not supported")

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const { x, y, width, height } = cropArea
        const cropX = (x / 100) * img.naturalWidth
        const cropY = (y / 100) * img.naturalHeight
        const cropWidth = (width / 100) * img.naturalWidth
        const cropHeight = (height / 100) * img.naturalHeight

        canvas.width = cropWidth
        canvas.height = cropHeight

        if (options.backgroundColor) {
          ctx.fillStyle = options.backgroundColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

        const quality = (options.quality || 95) / 100
        const mimeType = `image/${options.outputFormat || "png"}`

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob"))
          }
        }, mimeType, quality)
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  static async addWatermark(file: File, watermarkText: string, options: ImageProcessingOptions = {}): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx || !watermarkText) throw new Error("Canvas not supported or watermark text not specified")

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        ctx.drawImage(img, 0, 0)

        // Add watermark
        const fontSize = Math.min(canvas.width, canvas.height) * 0.05
        ctx.font = `${fontSize}px Arial`
        ctx.fillStyle = `rgba(255, 255, 255, ${options.watermarkOpacity || 0.5})`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Add text shadow for better visibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2

        ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2)

        const quality = (options.quality || 90) / 100
        const mimeType = `image/${options.outputFormat || "png"}`

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob"))
          }
        }, mimeType, quality)
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  static async convertFormat(file: File, outputFormat: "jpeg" | "png" | "webp", options: ImageProcessingOptions = {}): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas not supported")

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        let { naturalWidth: width, naturalHeight: height } = img
        
        // Handle rotation
        if (options.rotation && (Math.abs(options.rotation) === 90 || Math.abs(options.rotation) === 270)) {
          canvas.width = height
          canvas.height = width
        } else {
          canvas.width = width
          canvas.height = height
        }
        
        // Handle resize
        if (options.width || options.height) {
          let targetWidth = options.width || width
          let targetHeight = options.height || height
          
          if (options.maintainAspectRatio && options.width && options.height) {
            const aspectRatio = width / height
            if (targetWidth / targetHeight > aspectRatio) {
              targetWidth = targetHeight * aspectRatio
            } else {
              targetHeight = targetWidth / aspectRatio
            }
          }
          
          canvas.width = targetWidth
          canvas.height = targetHeight
        }

        // Add background color for formats that don't support transparency
        if (options.backgroundColor && outputFormat !== "png") {
          ctx.fillStyle = options.backgroundColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        // Apply transformations
        ctx.save()
        
        // Move to center for transformations
        ctx.translate(canvas.width / 2, canvas.height / 2)
        
        // Apply rotation
        if (options.rotation) {
          ctx.rotate((options.rotation * Math.PI) / 180)
        }
        
        // Apply flips
        let scaleX = 1, scaleY = 1
        if (options.flipHorizontal) scaleX = -1
        if (options.flipVertical) scaleY = -1
        ctx.scale(scaleX, scaleY)
        
        // Draw image centered
        ctx.drawImage(img, -width / 2, -height / 2, width, height)
        
        ctx.restore()

        const quality = (options.quality || 90) / 100
        const mimeType = `image/${outputFormat}`

        canvas.toBlob(
          (blob) => {
  static async removeBackground(file: File, options: ImageProcessingOptions = {}): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas not supported")

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)

        // Enhanced background removal with edge detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const sensitivity = (options.filters?.brightness || 30) / 100

        // Sample multiple edge pixels for better background detection
        const edgePixels = []
        const sampleSize = 10
        
        // Top edge
        for (let x = 0; x < canvas.width; x += Math.floor(canvas.width / sampleSize)) {
          const index = x * 4
          edgePixels.push([data[index], data[index + 1], data[index + 2]])
        }
        
        // Bottom edge
        for (let x = 0; x < canvas.width; x += Math.floor(canvas.width / sampleSize)) {
          const index = ((canvas.height - 1) * canvas.width + x) * 4
          edgePixels.push([data[index], data[index + 1], data[index + 2]])
        }
        
        // Left and right edges
        for (let y = 0; y < canvas.height; y += Math.floor(canvas.height / sampleSize)) {
          const leftIndex = (y * canvas.width) * 4
          const rightIndex = (y * canvas.width + canvas.width - 1) * 4
          edgePixels.push([data[leftIndex], data[leftIndex + 1], data[leftIndex + 2]])
          edgePixels.push([data[rightIndex], data[rightIndex + 1], data[rightIndex + 2]])
        }
            if (blob) {
        // Calculate average background color
        const avgBg = edgePixels.reduce((acc, pixel) => [
          acc[0] + pixel[0],
          acc[1] + pixel[1], 
          acc[2] + pixel[2]
        ], [0, 0, 0]).map(sum => sum / edgePixels.length)
              resolve(blob)
        // Remove background with improved algorithm
        const threshold = sensitivity * 255
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
            } else {
          const colorDistance = Math.sqrt(
            Math.pow(r - avgBg[0], 2) + 
            Math.pow(g - avgBg[1], 2) + 
            Math.pow(b - avgBg[2], 2)
          )
              reject(new Error("Failed to create blob"))
          if (colorDistance < threshold) {
            data[i + 3] = 0 // Make transparent
          } else if (options.filters?.brightness) {
            // Apply edge smoothing
            const smoothing = (options.filters.brightness || 2) / 10
            const alpha = Math.max(0, Math.min(255, 255 - (threshold - colorDistance) * smoothing))
            data[i + 3] = alpha
          }
        }
            }
        ctx.putImageData(imageData, 0, 0)
          },
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create blob"))
          }
        }, "image/png") // Always PNG for transparency
      }
          mimeType,
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }
          quality,
  static async applyFilters(file: File, options: ImageProcessingOptions): Promise<Blob> {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx || !options.filters) throw new Error("Canvas not supported or no filters specified")
        )
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
      }
        // Apply CSS filters for better performance
        const filters = []
        const { brightness, contrast, saturation, blur, sepia, grayscale } = options.filters

        if (brightness !== undefined) filters.push(`brightness(${brightness}%)`)
        if (contrast !== undefined) filters.push(`contrast(${contrast}%)`)
        if (saturation !== undefined) filters.push(`saturate(${saturation}%)`)
        if (blur !== undefined) filters.push(`blur(${blur}px)`)
        if (sepia) filters.push("sepia(100%)")
        if (grayscale) filters.push("grayscale(100%)")
      img.onerror = () => reject(new Error("Failed to load image"))
        ctx.filter = filters.join(" ")
        ctx.drawImage(img, 0, 0)
      img.src = URL.createObjectURL(file)
        const quality = (options.quality || 90) / 100
        const mimeType = `image/${options.outputFormat || "png"}`
    })
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob"))
            }
          },
          mimeType,
          quality,
        )
      }
  }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  private static getMaxSizeMB(level?: string): number {
    switch (level) {
      case "low": return 5
      case "medium": return 2
      case "high": return 1
      case "maximum": return 0.5
      default: return 2
    }
  }
}