"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRProcessor } from "@/lib/processors/qr-processor"
import { User, Download, Copy, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function VCardQRGeneratorPage() {
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    phone: "",
    email: "",
    url: "",
    address: ""
  })
  const [qrDataUrl, setQrDataUrl] = useState("")

  useEffect(() => {
    generateVCardQR()
  }, [contactData])

  const generateVCardQR = async () => {
    try {
      if (!contactData.firstName && !contactData.lastName && !contactData.email) {
        setQrDataUrl("")
        return
      }

      const vcardString = QRProcessor.generateVCardQR(contactData)
      const qrDataURL = await QRProcessor.generateQRCode(vcardString, {
        width: 1000,
        errorCorrectionLevel: "M"
      })
      
      setQrDataUrl(qrDataURL)
    } catch (error) {
      console.error("vCard QR generation failed:", error)
      setQrDataUrl("")
    }
  }

  const downloadQR = (format: string) => {
    if (!qrDataUrl) return

    const link = document.createElement("a")
    link.download = `contact-qr.${format}`
    link.href = qrDataUrl
    link.click()

    toast({
      title: "Download started",
      description: `Contact QR code downloaded as ${format.toUpperCase()}`
    })
  }

  const copyVCard = () => {
    const vcardString = QRProcessor.generateVCardQR(contactData)
    navigator.clipboard.writeText(vcardString)
    toast({
      title: "Copied to clipboard",
      description: "vCard data copied to clipboard"
    })
  }

  const loadExample = () => {
    setContactData({
      firstName: "John",
      lastName: "Doe",
      organization: "Example Corp",
      phone: "+1234567890",
      email: "john.doe@example.com",
      url: "https://johndoe.com",
      address: "123 Main St, City, State, 12345"
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <User className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">vCard QR Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate QR codes for contact information. Perfect for business cards, networking events, and easy contact sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Contact Information Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Enter the contact details to include in the QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={contactData.firstName}
                    onChange={(e) => setContactData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={contactData.lastName}
                    onChange={(e) => setContactData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={contactData.organization}
                  onChange={(e) => setContactData(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Company Name"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="url">Website</Label>
                <Input
                  id="url"
                  type="url"
                  value={contactData.url}
                  onChange={(e) => setContactData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={contactData.address}
                  onChange={(e) => setContactData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={3}
                />
              </div>

              <Button onClick={loadExample} variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Load Example Data
              </Button>
            </CardContent>
          </Card>

          {/* QR Code Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Contact QR Code</CardTitle>
              <CardDescription>Scan to save contact information</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {qrDataUrl ? (
                <div className="space-y-4">
                  <img
                    src={qrDataUrl}
                    alt="Contact QR Code"
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
                      <Button variant="outline" onClick={copyVCard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy vCard
                      </Button>
                    </div>
                  </div>

                  {/* Contact Preview */}
                  <div className="bg-gray-50 border rounded-lg p-4 text-left">
                    <h4 className="font-medium mb-2">Contact Preview:</h4>
                    <div className="text-sm space-y-1">
                      {(contactData.firstName || contactData.lastName) && (
                        <div><strong>Name:</strong> {contactData.firstName} {contactData.lastName}</div>
                      )}
                      {contactData.organization && (
                        <div><strong>Company:</strong> {contactData.organization}</div>
                      )}
                      {contactData.phone && (
                        <div><strong>Phone:</strong> {contactData.phone}</div>
                      )}
                      {contactData.email && (
                        <div><strong>Email:</strong> {contactData.email}</div>
                      )}
                      {contactData.url && (
                        <div><strong>Website:</strong> {contactData.url}</div>
                      )}
                      {contactData.address && (
                        <div><strong>Address:</strong> {contactData.address}</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-muted-foreground">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Enter contact details to generate QR code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>How to Use Contact QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">Generate QR Code</h4>
                <p className="text-sm text-muted-foreground">
                  Fill in your contact information and generate the QR code
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">Share QR Code</h4>
                <p className="text-sm text-muted-foreground">
                  Print on business cards or display on screens
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">Easy Contact Save</h4>
                <p className="text-sm text-muted-foreground">
                  Others scan to instantly save your contact info
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}