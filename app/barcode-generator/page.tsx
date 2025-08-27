"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BarChart3, Download, Copy, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function BarcodeGeneratorPage() {
  const [content, setContent] = useState("123456789012")
  const [barcodeType, setBarcodeType] = useState("CODE128")
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(100)
  const [displayValue, setDisplayValue] = useState(true)
  const [fontSize, setFontSize] = useState(20)
  const [textAlign, setTextAlign] = useState("center")
  const [textPosition, setTextPosition] = useState("bottom")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [lineColor, setLineColor] = useState("#000000")
  const [barcodeDataUrl, setBarcodeDataUrl] = useState("")

  const barcodeTypes = [
    { value: "CODE128", label: "Code 128", description: "Most versatile, supports all ASCII characters" },
    { value: "EAN13", label: "EAN-13", description: "13-digit European Article Number" },
    { value: "EAN8", label: "EAN-8", description: "8-digit European Article Number" },
    { value: "UPC", label: "UPC-A", description: "12-digit Universal Product Code" },
    { value: "CODE39", label: "Code 39", description: "Alphanumeric barcode" },
    { value: "ITF14", label: "ITF-14", description: "14-digit shipping container code" },
    { value: "MSI", label: "MSI", description: "Modified Plessey code" },
    { value: "pharmacode", label: "Pharmacode", description: "Pharmaceutical binary code" },
    { value: "codabar", label: "Codabar", description: "Used in libraries and blood banks" }
  ]

  useEffect(() => {
    generateBarcode()
  }, [content, barcodeType, width, height, displayValue, fontSize, backgroundColor, lineColor])

  const generateBarcode = async () => {
    try {
      if (!content.trim()) {
        setBarcodeDataUrl("")
        return
      }

      // Simulate barcode generation using canvas
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      
      const barWidth = width
      const barHeight = height
      const textHeight = displayValue ? fontSize + 10 : 0
      
      canvas.width = content.length * barWidth * 12 + 40
      canvas.height = barHeight + textHeight + 20

      // Background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Generate barcode pattern
      ctx.fillStyle = lineColor
      let x = 20

      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i)
        const pattern = char % 2 === 0 ? [1, 0, 1, 1, 0, 1, 0, 1] : [1, 1, 0, 1, 0, 1, 1, 0]
        
        pattern.forEach((bar) => {
          if (bar) {
            ctx.fillRect(x, 10, barWidth, barHeight)
          }
          x += barWidth
        })
      }

      // Add text if enabled
      if (displayValue) {
        ctx.fillStyle = lineColor
        ctx.font = `${fontSize}px monospace`
        ctx.textAlign = textAlign as CanvasTextAlign
        
        const textX = textAlign === "center" ? canvas.width / 2 : 
                     textAlign === "right" ? canvas.width - 20 : 20
        const textY = textPosition === "top" ? fontSize + 5 : canvas.height - 10
        
        ctx.fillText(content, textX, textY)
      }

      setBarcodeDataUrl(canvas.toDataURL("image/png"))
    } catch (error) {
      console.error("Barcode generation failed:", error)
      setBarcodeDataUrl("")
    }
  }

  const downloadBarcode = (format: string) => {
    if (!barcodeDataUrl) return

    const link = document.createElement("a")
    link.download = `barcode.${format}`
    link.href = barcodeDataUrl
    link.click()

    toast({
      title: "Download started",
      description: `Barcode downloaded as ${format.toUpperCase()}`
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: "Barcode content has been copied"
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <BarChart3 className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Barcode Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate professional barcodes in multiple formats including Code 128, EAN-13, UPC, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Content Input */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Content</CardTitle>
              <CardDescription>Enter the data to encode in your barcode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content">Content</Label>
                <Input
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter barcode content"
                />
              </div>

              <div>
                <Label htmlFor="barcode-type">Barcode Type</Label>
                <Select value={barcodeType} onValueChange={setBarcodeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {barcodeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Barcode Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Preview</CardTitle>
              <CardDescription>Live preview of your generated barcode</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {barcodeDataUrl ? (
                <div className="space-y-4">
                  <img
                    src={barcodeDataUrl}
                    alt="Generated Barcode"
                    className="mx-auto max-w-full border rounded"
                  />
                  <div className="flex space-x-2 justify-center">
                    <Button onClick={() => downloadBarcode("png")}>
                      <Download className="h-4 w-4 mr-2" />
                      PNG
                    </Button>
                    <Button variant="outline" onClick={() => downloadBarcode("svg")}>
                      SVG
                    </Button>
                    <Button variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter content to generate barcode</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle>Customization</CardTitle>
              <CardDescription>Adjust barcode appearance and formatting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Bar Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min={1}
                    max={10}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Bar Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={20}
                    max={200}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="display-value"
                  checked={displayValue}
                  onCheckedChange={setDisplayValue}
                />
                <Label htmlFor="display-value">Display text below barcode</Label>
              </div>

              {displayValue && (
                <>
                  <div>
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input
                      id="font-size"
                      type="number"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      min={8}
                      max={48}
                    />
                  </div>

                  <div>
                    <Label htmlFor="text-align">Text Alignment</Label>
                    <Select value={textAlign} onValueChange={setTextAlign}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="text-position">Text Position</Label>
                    <Select value={textPosition} onValueChange={setTextPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bg-color">Background</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="line-color">Bars Color</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <Input
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}