"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Hash, Copy, Download, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function UUIDGeneratorPage() {
  const [uuidVersion, setUuidVersion] = useState("4")
  const [count, setCount] = useState(1)
  const [uppercase, setUppercase] = useState(false)
  const [removeDashes, setRemoveDashes] = useState(false)
  const [generatedUUIDs, setGeneratedUUIDs] = useState<string[]>([])

  const generateUUID = () => {
    // Simple UUID v4 generation (for demo purposes)
    const generateV4 = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }

    const generateV1 = () => {
      // Simplified v1 (timestamp-based)
      const timestamp = Date.now().toString(16)
      const random = Math.random().toString(16).substring(2, 14)
      return `${timestamp.substring(0, 8)}-${timestamp.substring(8)}-1${random.substring(0, 3)}-${random.substring(3, 7)}-${random.substring(7)}`
    }

    const uuids = []
    for (let i = 0; i < count; i++) {
      let uuid = uuidVersion === "1" ? generateV1() : generateV4()
      
      if (removeDashes) {
        uuid = uuid.replace(/-/g, "")
      }
      
      if (uppercase) {
        uuid = uuid.toUpperCase()
      }
      
      uuids.push(uuid)
    }

    setGeneratedUUIDs(uuids)
  }

  const copyAll = () => {
    const text = generatedUUIDs.join("\n")
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${generatedUUIDs.length} UUID${generatedUUIDs.length > 1 ? 's' : ''} copied`
    })
  }

  const copyUUID = (uuid: string) => {
    navigator.clipboard.writeText(uuid)
    toast({
      title: "Copied",
      description: "UUID copied to clipboard"
    })
  }

  const downloadUUIDs = () => {
    const text = generatedUUIDs.join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "uuids.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Hash className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">UUID Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate unique identifiers (UUIDs) in various formats for applications, databases, and APIs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>UUID Configuration</CardTitle>
              <CardDescription>Customize your UUID generation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="version">UUID Version</Label>
                <Select value={uuidVersion} onValueChange={setUuidVersion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      <div>
                        <div className="font-medium">Version 1</div>
                        <div className="text-xs text-muted-foreground">Timestamp-based</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="4">
                      <div>
                        <div className="font-medium">Version 4</div>
                        <div className="text-xs text-muted-foreground">Random (Recommended)</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">Number of UUIDs</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                  min={1}
                  max={100}
                />
              </div>

              <div className="space-y-3">
                <Label>Formatting Options</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={uppercase}
                    onCheckedChange={setUppercase}
                  />
                  <Label htmlFor="uppercase">Uppercase</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remove-dashes"
                    checked={removeDashes}
                    onCheckedChange={setRemoveDashes}
                  />
                  <Label htmlFor="remove-dashes">Remove Dashes</Label>
                </div>
              </div>

              <Button onClick={generateUUID} className="w-full" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate UUID{count > 1 ? 's' : ''}
              </Button>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCount(1)
                      generateUUID()
                    }}
                  >
                    Single UUID
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCount(10)
                      generateUUID()
                    }}
                  >
                    10 UUIDs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated UUIDs */}
          <Card>
            <CardHeader>
              <CardTitle>Generated UUIDs</CardTitle>
              <CardDescription>Your unique identifiers are ready to use</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedUUIDs.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {generatedUUIDs.length} UUID{generatedUUIDs.length > 1 ? 's' : ''} generated
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyAll}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadUUIDs}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {generatedUUIDs.map((uuid, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded border group hover:bg-muted/80"
                      >
                        <code className="font-mono text-sm flex-1 mr-2">{uuid}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyUUID(uuid)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Total characters: {generatedUUIDs.join("").length}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Hash className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Generated UUIDs will appear here</p>
                  <Button onClick={generateUUID} className="mt-4">
                    Generate Your First UUID
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* UUID Information */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>About UUIDs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">UUID Version 1</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Based on timestamp and MAC address</li>
                  <li>• Guarantees uniqueness across time</li>
                  <li>• Can reveal information about when/where generated</li>
                  <li>• Good for distributed systems</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">UUID Version 4</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Completely random generation</li>
                  <li>• No information leakage</li>
                  <li>• Most commonly used version</li>
                  <li>• Perfect for general applications</li>
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