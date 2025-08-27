"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { QRProcessor } from "@/lib/processors/qr-processor"
import { Grid, Download, Upload, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function BulkQRGeneratorPage() {
  const [textInput, setTextInput] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedQRs, setGeneratedQRs] = useState<Array<{ dataURL: string; filename: string }>>([])

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
      
      // Read and preview CSV
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setTextInput(content.substring(0, 1000) + (content.length > 1000 ? "..." : ""))
      }
      reader.readAsText(file)
    }
  }

  const parseInput = (): Array<{ content: string; filename?: string }> => {
    const lines = textInput.split("\n").filter(line => line.trim())
    
    if (csvFile || textInput.includes(",")) {
      // CSV format: content,filename
      return lines.map((line, index) => {
        const [content, filename] = line.split(",").map(s => s.trim())
        return {
          content: content || `item-${index + 1}`,
          filename: filename || `qr-code-${index + 1}.png`
        }
      })
    } else {
      // Simple text list
      return lines.map((line, index) => ({
        content: line.trim(),
        filename: `qr-code-${index + 1}.png`
      }))
    }
  }

  const generateBulkQRs = async () => {
    const data = parseInput()
    
    if (data.length === 0) {
      toast({
        title: "No data to process",
        description: "Please enter content or upload a CSV file",
        variant: "destructive"
      })
      return
    }

    if (data.length > 100) {
      toast({
        title: "Too many items",
        description: "Maximum 100 QR codes can be generated at once",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGeneratedQRs([])

    try {
      const results = []
      
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        
        try {
          const qrDataURL = await QRProcessor.generateQRCode(item.content, {
            width: 1000,
            errorCorrectionLevel: "M"
          })
          
          results.push({
            dataURL: qrDataURL,
            filename: item.filename || `qr-code-${i + 1}.png`
          })
        } catch (error) {
          console.error(`Failed to generate QR for item ${i + 1}:`, error)
        }
        
        setProgress(((i + 1) / data.length) * 100)
      }

      setGeneratedQRs(results)
      
      toast({
        title: "Generation complete",
        description: `${results.length} QR codes generated successfully`
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate QR codes",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadAll = async () => {
    if (generatedQRs.length === 0) return

    const JSZip = (await import("jszip")).default
    const zip = new JSZip()

    generatedQRs.forEach((qr) => {
      // Convert data URL to blob
      const base64Data = qr.dataURL.split(",")[1]
      const binaryData = atob(base64Data)
      const bytes = new Uint8Array(binaryData.length)
      
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i)
      }
      
      zip.file(qr.filename, bytes)
    })

    const zipBlob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "bulk-qr-codes.zip"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Grid className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Bulk QR Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate multiple QR codes at once from text lists or CSV data. Perfect for bulk operations and batch processing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Input</CardTitle>
                <CardDescription>Enter your data as text list or upload CSV file</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-upload">Upload CSV File</Label>
                  <div className="mt-2">
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    CSV format: content,filename (one per line)
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-input">Text Input</Label>
                  <Textarea
                    id="text-input"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter URLs, text, or data (one per line)&#10;Example:&#10;https://example.com&#10;Hello World&#10;Contact Info"
                    rows={10}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    One item per line. For CSV format: content,filename
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generation Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Items to generate</Label>
                    <div className="text-2xl font-bold">{parseInput().length}</div>
                  </div>
                  <div>
                    <Label>Estimated size</Label>
                    <div className="text-2xl font-bold">{Math.round(parseInput().length * 0.05)}MB</div>
                  </div>
                </div>

                <Button 
                  onClick={generateBulkQRs}
                  disabled={isGenerating || parseInput().length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Grid className="h-4 w-4 mr-2" />
                      Generate {parseInput().length} QR Codes
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-center text-muted-foreground">
                      {Math.round(progress)}% complete
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated QR Codes</CardTitle>
                <CardDescription>Preview and download your generated QR codes</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedQRs.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {generatedQRs.length} QR codes generated
                      </span>
                      <Button onClick={downloadAll}>
                        <Download className="h-4 w-4 mr-2" />
                        Download All (ZIP)
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {generatedQRs.slice(0, 12).map((qr, index) => (
                        <div key={index} className="text-center">
                          <img
                            src={qr.dataURL}
                            alt={`QR ${index + 1}`}
                            className="w-full aspect-square object-contain border rounded"
                          />
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {qr.filename}
                          </p>
                        </div>
                      ))}
                    </div>

                    {generatedQRs.length > 12 && (
                      <p className="text-sm text-center text-muted-foreground">
                        And {generatedQRs.length - 12} more...
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Grid className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Generated QR codes will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setTextInput("https://example.com\nhttps://google.com\nhttps://github.com")}
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  URL List Example
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTextInput("https://example.com,website.png\nContact Info,contact.png\nWiFi Password,wifi.png")}
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CSV Format Example
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTextInput("Product A - SKU001\nProduct B - SKU002\nProduct C - SKU003")}
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Product List Example
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}