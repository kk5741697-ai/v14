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
import { QRProcessor } from "@/lib/processors/qr-processor"
import { Wifi, Download, Copy, Eye, EyeOff } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function WiFiQRGeneratorPage() {
  const [ssid, setSsid] = useState("")
  const [password, setPassword] = useState("")
  const [security, setSecurity] = useState("WPA")
  const [hidden, setHidden] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState("")

  useEffect(() => {
    generateWiFiQR()
  }, [ssid, password, security, hidden])

  const generateWiFiQR = async () => {
    try {
      if (!ssid.trim()) {
        setQrDataUrl("")
        return
      }

      const wifiString = QRProcessor.generateWiFiQR(ssid, password, security as any, hidden)
      const qrDataURL = await QRProcessor.generateQRCode(wifiString, {
        width: 1000,
        errorCorrectionLevel: "M"
      })
      
      setQrDataUrl(qrDataURL)
    } catch (error) {
      console.error("WiFi QR generation failed:", error)
      setQrDataUrl("")
    }
  }

  const downloadQR = (format: string) => {
    if (!qrDataUrl) return

    const link = document.createElement("a")
    link.download = `wifi-qr.${format}`
    link.href = qrDataUrl
    link.click()

    toast({
      title: "Download started",
      description: `WiFi QR code downloaded as ${format.toUpperCase()}`
    })
  }

  const copyWiFiString = () => {
    const wifiString = QRProcessor.generateWiFiQR(ssid, password, security as any, hidden)
    navigator.clipboard.writeText(wifiString)
    toast({
      title: "Copied to clipboard",
      description: "WiFi configuration string copied"
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Wifi className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">WiFi QR Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create QR codes for WiFi networks. Users can scan to connect automatically without typing passwords.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* WiFi Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>WiFi Network Details</CardTitle>
              <CardDescription>Enter your WiFi network information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ssid">Network Name (SSID) *</Label>
                <Input
                  id="ssid"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="MyWiFiNetwork"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="WiFi password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="security">Security Type</Label>
                <Select value={security} onValueChange={setSecurity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2 (Recommended)</SelectItem>
                    <SelectItem value="WEP">WEP (Legacy)</SelectItem>
                    <SelectItem value="nopass">No Password (Open)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hidden"
                  checked={hidden}
                  onCheckedChange={setHidden}
                />
                <Label htmlFor="hidden">Hidden Network</Label>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">WiFi Configuration String</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm break-all">
                  {ssid ? QRProcessor.generateWiFiQR(ssid, password, security as any, hidden) : "Enter SSID to see configuration"}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyWiFiString}
                  disabled={!ssid}
                  className="mt-2"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy String
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Preview */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code Preview</CardTitle>
              <CardDescription>Scan this QR code to connect to your WiFi</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {qrDataUrl ? (
                <div className="space-y-4">
                  <img
                    src={qrDataUrl}
                    alt="WiFi QR Code"
                    className="mx-auto max-w-full border rounded-lg shadow-md"
                    style={{ maxWidth: "300px" }}
                  />
                  
                  <div className="space-y-2">
                    <Button onClick={() => downloadQR("png")} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => downloadQR("svg")}>
                        SVG
                      </Button>
                      <Button variant="outline" onClick={() => downloadQR("pdf")}>
                        PDF
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Print or display this QR code</li>
                      <li>2. Open camera app on phone</li>
                      <li>3. Point camera at QR code</li>
                      <li>4. Tap notification to connect</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-muted-foreground">
                  <Wifi className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter WiFi details to generate QR code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>WiFi QR Code Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use WPA/WPA2 security for better protection</li>
                  <li>• Test the QR code before sharing</li>
                  <li>• Print in high quality for better scanning</li>
                  <li>• Place QR codes at eye level for easy scanning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Compatibility</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• iOS 11+ (Camera app)</li>
                  <li>• Android 10+ (Camera app)</li>
                  <li>• Most QR scanner apps</li>
                  <li>• Works with guest networks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}