"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { QRProcessor } from "@/lib/processors/qr-processor"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  QrCode,
  Download,
  Link,
  FileText,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  User,
  Upload,
  Palette,
  CheckCircle,
  Globe,
  MapPin,
  Settings,
  AlertCircle,
  Copy
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function QRCodeGeneratorPage() {
  const [activeType, setActiveType] = useState("url")
  const [content, setContent] = useState("https://example.com")
  const [qrSize, setQrSize] = useState([1000])
  const [errorCorrection, setErrorCorrection] = useState("M")
  const [foregroundColor, setForegroundColor] = useState("#000000")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [logoUrl, setLogoUrl] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  
  // Content type specific fields
  const [emailData, setEmailData] = useState({ email: "", subject: "", body: "" })
  const [phoneData, setPhoneData] = useState({ phone: "" })
  const [smsData, setSmsData] = useState({ phone: "", message: "" })
  const [wifiData, setWifiData] = useState({ ssid: "", password: "", security: "WPA", hidden: false })
  const [vcardData, setVcardData] = useState({ 
    firstName: "", lastName: "", organization: "", phone: "", email: "", url: "", address: "" 
  })
  const [eventData, setEventData] = useState({
    title: "", location: "", startDate: "", endDate: "", description: ""
  })

  const contentTypes = [
    { id: "url", label: "URL", icon: Link },
    { id: "text", label: "TEXT", icon: FileText },
    { id: "email", label: "EMAIL", icon: Mail },
    { id: "phone", label: "PHONE", icon: Phone },
    { id: "sms", label: "SMS", icon: MessageSquare },
    { id: "vcard", label: "VCARD", icon: User },
    { id: "wifi", label: "WIFI", icon: Wifi },
    { id: "event", label: "EVENT", icon: Calendar },
    { id: "location", label: "LOCATION", icon: MapPin },
  ]

  const generateQRContent = () => {
    try {
    switch (activeType) {
      case "url":
      case "text":
          if (!content.trim()) return ""
        return content
      case "email":
          if (!emailData.email.trim()) return ""
        return `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`
      case "phone":
          if (!phoneData.phone.trim()) return ""
        return `tel:${phoneData.phone}`
      case "sms":
          if (!smsData.phone.trim()) return ""
        return `sms:${smsData.phone}?body=${encodeURIComponent(smsData.message)}`
      case "wifi":
          if (!wifiData.ssid.trim()) return ""
        return QRProcessor.generateWiFiQR(wifiData.ssid, wifiData.password, wifiData.security as any, wifiData.hidden)
      case "vcard":
          if (!vcardData.firstName && !vcardData.lastName && !vcardData.email) return ""
        return QRProcessor.generateVCardQR(vcardData)
      case "event":
          if (!eventData.title.trim()) return ""
        return QRProcessor.generateEventQR(eventData)
      case "location":
          if (!content.trim()) return ""
        return `geo:${content}`
      default:
        return content
    }
    } catch (error) {
      console.error("Error generating QR content:", error)
      return ""
    }
  }

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrContent = generateQRContent()
        if (!qrContent.trim()) {
          setQrDataUrl("")
          return
        }

        const qrOptions = {
          width: qrSize[0],
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          errorCorrectionLevel: errorCorrection as "L" | "M" | "Q" | "H",
          logo: logoUrl
            ? {
                src: logoUrl,
                width: qrSize[0] * 0.2,
              }
            : undefined,
        }

        const qrDataURL = await QRProcessor.generateQRCode(qrContent, qrOptions)
        setQrDataUrl(qrDataURL)

      } catch (error) {
        console.error("Failed to generate QR code:", error)
        setQrDataUrl("")
        toast({
          title: "QR Generation Failed",
          description: error instanceof Error ? error.message : "Please check your input and try again",
          variant: "destructive"
        })
      }
    }

    generateQR()
  }, [
    activeType,
    content,
    emailData,
    phoneData,
    smsData,
    wifiData,
    vcardData,
    eventData,
    qrSize,
    foregroundColor,
    backgroundColor,
    logoUrl,
    errorCorrection,
  ])

  const downloadQR = async (format: string) => {
    try {
      if (!qrDataUrl && format !== "svg") {
        toast({
          title: "No QR code to download",
          description: "Please generate a QR code first",
          variant: "destructive"
        })
        return
      }

      if (format === "svg") {
        const qrContent = generateQRContent()
        if (!qrContent.trim()) {
          toast({
            title: "No content to generate QR code",
            description: "Please enter content first",
            variant: "destructive"
          })
          return
        }
        
        const qrOptions = {
          width: qrSize[0],
          color: { dark: foregroundColor, light: backgroundColor },
          errorCorrectionLevel: errorCorrection as "L" | "M" | "Q" | "H"
        }
        const svgString = await QRProcessor.generateQRCodeSVG(qrContent, qrOptions)
        const blob = new Blob([svgString], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.download = "qr-code.svg"
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      } else {
        const link = document.createElement("a")
        link.download = `qr-code.${format}`
        link.href = qrDataUrl
        link.click()
      }
      
      toast({
        title: "Download started",
        description: `QR code downloaded as ${format.toUpperCase()}`
      })
    } catch (error) {
      console.error("Failed to download QR code:", error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unable to download QR code",
        variant: "destructive"
      })
    }
  }

  const renderContentForm = () => {
    switch (activeType) {
      case "url":
        return (
          <div>
            <Label htmlFor="url-content">Your URL</Label>
            <Input
              id="url-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://example.com"
              className="mt-1"
            />
          </div>
        )
      
      case "text":
        return (
          <div>
            <Label htmlFor="text-content">Your Text</Label>
            <Textarea
              id="text-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here..."
              className="mt-1"
              rows={3}
            />
          </div>
        )
      
      case "email":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={emailData.email}
                onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Email subject"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={emailData.body}
                onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Email message"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )
      
      case "phone":
        return (
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneData.phone}
              onChange={(e) => setPhoneData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1234567890"
              className="mt-1"
            />
          </div>
        )
      
      case "sms":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="sms-phone">Phone Number</Label>
              <Input
                id="sms-phone"
                type="tel"
                value={smsData.phone}
                onChange={(e) => setSmsData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sms-message">Message</Label>
              <Textarea
                id="sms-message"
                value={smsData.message}
                onChange={(e) => setSmsData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Your SMS message"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )
      
      case "wifi":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
              <Input
                id="wifi-ssid"
                value={wifiData.ssid}
                onChange={(e) => setWifiData(prev => ({ ...prev, ssid: e.target.value }))}
                placeholder="MyWiFiNetwork"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wifi-password">Password</Label>
              <Input
                id="wifi-password"
                type="password"
                value={wifiData.password}
                onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="WiFi password"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="wifi-security">Security Type</Label>
              <select
                id="wifi-security"
                value={wifiData.security}
                onChange={(e) => setWifiData(prev => ({ ...prev, security: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md bg-white mt-1"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No Password</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="wifi-hidden"
                checked={wifiData.hidden}
                onCheckedChange={(checked) => setWifiData(prev => ({ ...prev, hidden: checked as boolean }))}
              />
              <Label htmlFor="wifi-hidden" className="text-sm">Hidden Network</Label>
            </div>
          </div>
        )
      
      case "vcard":
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={vcardData.firstName}
                  onChange={(e) => setVcardData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={vcardData.lastName}
                  onChange={(e) => setVcardData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={vcardData.organization}
                onChange={(e) => setVcardData(prev => ({ ...prev, organization: e.target.value }))}
                placeholder="Company Name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcard-phone">Phone</Label>
              <Input
                id="vcard-phone"
                type="tel"
                value={vcardData.phone}
                onChange={(e) => setVcardData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1234567890"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcard-email">Email</Label>
              <Input
                id="vcard-email"
                type="email"
                value={vcardData.email}
                onChange={(e) => setVcardData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcard-url">Website</Label>
              <Input
                id="vcard-url"
                type="url"
                value={vcardData.url}
                onChange={(e) => setVcardData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="vcard-address">Address</Label>
              <Textarea
                id="vcard-address"
                value={vcardData.address}
                onChange={(e) => setVcardData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main St, City, State, ZIP"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        )
      
      case "event":
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="event-title">Event Title</Label>
              <Input
                id="event-title"
                value={eventData.title}
                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Meeting Title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={eventData.location}
                onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Conference Room A"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={eventData.startDate}
                  onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="datetime-local"
                  value={eventData.endDate}
                  onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={eventData.description}
                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Event description"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )
      
      case "location":
        return (
          <div>
            <Label htmlFor="location-content">Coordinates or Address</Label>
            <Input
              id="location-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="40.7128,-74.0060 or 123 Main St, New York"
              className="mt-1"
            />
          </div>
        )
      
      default:
        return (
          <div>
            <Label htmlFor="default-content">Content</Label>
            <Textarea
              id="default-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your content here..."
              className="mt-1"
              rows={3}
            />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600">
      <Header />

      {/* Top Navigation Bar */}
      <div className="bg-green-500/90 backdrop-blur-sm text-white border-b border-green-400">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-6 py-4 text-sm font-medium overflow-x-auto">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveType(type.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  activeType === type.id 
                    ? "bg-white text-green-600 font-semibold shadow-lg scale-105" 
                    : "hover:bg-green-400/50 hover:scale-105"
                }`}
              >
                <type.icon className="h-4 w-4" />
                <span>{type.label}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-green-200">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Panel - Content Input */}
            <div className="lg:col-span-2 p-8 space-y-8">
              {/* Content Input */}
              <Card>
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">ENTER CONTENT</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderContentForm()}
                </CardContent>
              </Card>

              {/* Set Colors */}
              <Card>
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                      <Palette className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">SET COLORS</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="foreground-color" className="text-sm font-semibold text-gray-700">Foreground Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          id="foreground-color"
                          type="color"
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                        />
                        <Input
                          value={foregroundColor}
                          onChange={(e) => setForegroundColor(e.target.value)}
                          placeholder="#000000"
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="background-color" className="text-sm font-semibold text-gray-700">Background Color</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          id="background-color"
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-12 h-10 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                        />
                        <Input
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          placeholder="#FFFFFF"
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Logo Image */}
              <Card>
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">ADD LOGO IMAGE</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logo-url" className="text-sm font-semibold text-gray-700">Logo URL</Label>
                    <Input
                      id="logo-url"
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter a URL to an image that will be placed in the center of your QR code
                    </p>
                  </div>
                  
                  {/* Logo Gallery */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Quick Logo Gallery</Label>
                    <div className="grid grid-cols-6 gap-3">
                      {[
                        { name: "Facebook", icon: "📘", color: "#1877F2" },
                        { name: "Twitter", icon: "🐦", color: "#1DA1F2" },
                        { name: "Instagram", icon: "📷", color: "#E4405F" },
                        { name: "LinkedIn", icon: "💼", color: "#0A66C2" },
                        { name: "YouTube", icon: "📺", color: "#FF0000" },
                        { name: "WhatsApp", icon: "💬", color: "#25D366" },
                      ].map((social) => (
                        <button
                          key={social.name}
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:border-gray-400 flex items-center justify-center text-xl transition-all hover:scale-110"
                          style={{ backgroundColor: social.color + "20" }}
                          title={social.name}
                        >
                          {social.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customize Design */}
              <Card>
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-800">CUSTOMIZE DESIGN</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="error-correction" className="text-sm font-semibold text-gray-700">Error Correction Level</Label>
                    <select
                      id="error-correction"
                      value={errorCorrection}
                      onChange={(e) => setErrorCorrection(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white mt-2 font-medium"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Higher levels allow more damage recovery but create larger QR codes
                    </p>
                  </div>
                  
                  {/* QR Code Styles */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">QR Code Style</Label>
                    <div className="grid grid-cols-4 gap-3">
                      {["square", "rounded", "dots", "extra-rounded"].map((style) => (
                        <button
                          key={style}
                          className="p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-400 transition-all hover:scale-105 text-xs font-medium capitalize"
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - QR Code Preview */}
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 space-y-8">
              {/* QR Code Display */}
              <div className="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200">
                {qrDataUrl ? (
                  <div className="relative">
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="mx-auto max-w-full h-auto rounded-lg shadow-md"
                      style={{ maxWidth: "300px" }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                      onClick={() => {
                        navigator.clipboard.writeText(generateQRContent())
                        toast({ title: "Content copied", description: "QR code content copied to clipboard" })
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-64 h-64 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-inner">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Enter content to generate QR code</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quality Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 font-medium">Low Quality</span>
                  <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">{qrSize[0]} x {qrSize[0]} Px</span>
                  <span className="text-xs text-gray-500 font-medium">High Quality</span>
                </div>
                <Slider
                  value={qrSize}
                  onValueChange={setQrSize}
                  max={2000}
                  min={200}
                  step={100}
                  className="w-full h-3"
                />
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    File size: ~{Math.round((qrSize[0] * qrSize[0] * 3) / 1024)}KB
                  </Badge>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="space-y-4">
                <Button 
                  onClick={() => downloadQR("png")} 
                  disabled={!qrDataUrl}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download High Quality PNG
                </Button>

                <div className="grid grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => downloadQR("svg")}
                    disabled={!generateQRContent().trim()}
                    className="text-blue-500 border-blue-400 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-all hover:scale-105"
                  >
                    .SVG
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => downloadQR("pdf")}
                    disabled={!qrDataUrl}
                    className="text-orange-500 border-orange-400 hover:bg-orange-50 font-semibold py-3 rounded-lg transition-all hover:scale-105"
                  >
                    .PDF*
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => downloadQR("eps")}
                    disabled={!qrDataUrl}
                    className="text-purple-500 border-purple-400 hover:bg-purple-50 font-semibold py-3 rounded-lg transition-all hover:scale-105"
                  >
                    .EPS*
                  </Button>
                </div>

                <p className="text-xs text-gray-400 text-center italic">
                  * no support for color gradients
                </p>
                
                {/* QR Code Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-green-800">QR Code Info</h4>
                  <div className="text-xs text-green-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Content Type:</span>
                      <span className="font-medium">{activeType.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Length:</span>
                      <span className="font-medium">{generateQRContent().length} chars</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Correction:</span>
                      <span className="font-medium">{errorCorrection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>QR Size:</span>
                      <span className="font-medium">{qrSize[0]} × {qrSize[0]} px</span>
                    </div>
                  </div>
                </div>

                {/* Content Validation */}
                {!generateQRContent().trim() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-800">Please enter content to generate QR code</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}