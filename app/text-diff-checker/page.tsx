"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { GitCompare, Copy, Download, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DiffResult {
  type: "added" | "removed" | "unchanged"
  content: string
  lineNumber?: number
}

export default function TextDiffCheckerPage() {
  const [originalText, setOriginalText] = useState("")
  const [modifiedText, setModifiedText] = useState("")
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)
  const [diffResults, setDiffResults] = useState<DiffResult[]>([])
  const [viewMode, setViewMode] = useState("side-by-side")

  const calculateDiff = () => {
    let original = originalText
    let modified = modifiedText

    // Apply ignore options
    if (ignoreCase) {
      original = original.toLowerCase()
      modified = modified.toLowerCase()
    }

    if (ignoreWhitespace) {
      original = original.replace(/\s+/g, " ").trim()
      modified = modified.replace(/\s+/g, " ").trim()
    }

    const originalLines = original.split("\n")
    const modifiedLines = modified.split("\n")
    const results: DiffResult[] = []

    // Simple diff algorithm
    const maxLines = Math.max(originalLines.length, modifiedLines.length)
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || ""
      const modifiedLine = modifiedLines[i] || ""

      if (originalLine === modifiedLine) {
        results.push({
          type: "unchanged",
          content: originalLine,
          lineNumber: i + 1
        })
      } else {
        if (originalLines[i] !== undefined) {
          results.push({
            type: "removed",
            content: originalLines[i],
            lineNumber: i + 1
          })
        }
        if (modifiedLines[i] !== undefined) {
          results.push({
            type: "added",
            content: modifiedLines[i],
            lineNumber: i + 1
          })
        }
      }
    }

    setDiffResults(results)
  }

  const copyDiff = () => {
    const diffText = diffResults.map(result => {
      const prefix = result.type === "added" ? "+ " : result.type === "removed" ? "- " : "  "
      return prefix + result.content
    }).join("\n")

    navigator.clipboard.writeText(diffText)
    toast({
      title: "Copied to clipboard",
      description: "Diff results copied"
    })
  }

  const downloadDiff = () => {
    const diffText = diffResults.map(result => {
      const prefix = result.type === "added" ? "+ " : result.type === "removed" ? "- " : "  "
      return prefix + result.content
    }).join("\n")

    const blob = new Blob([diffText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "text-diff.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setOriginalText(`The quick brown fox jumps over the lazy dog.
This is the original text.
Some content that will be changed.
Final line of original text.`)

    setModifiedText(`The quick brown fox jumps over the lazy dog.
This is the modified text.
Some content that has been updated.
Additional line added here.
Final line of original text.`)
  }

  const addedCount = diffResults.filter(r => r.type === "added").length
  const removedCount = diffResults.filter(r => r.type === "removed").length
  const unchangedCount = diffResults.filter(r => r.type === "unchanged").length

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <GitCompare className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Text Diff Checker</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare two texts and highlight differences with side-by-side or inline view. Perfect for code reviews and document comparison.
          </p>
        </div>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Original Text</CardTitle>
                <CardDescription>Enter the original version of your text</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Paste your original text here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modified Text</CardTitle>
                <CardDescription>Enter the modified version of your text</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={modifiedText}
                  onChange={(e) => setModifiedText(e.target.value)}
                  placeholder="Paste your modified text here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {/* Options and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignore-whitespace"
                    checked={ignoreWhitespace}
                    onCheckedChange={setIgnoreWhitespace}
                  />
                  <Label htmlFor="ignore-whitespace">Ignore Whitespace</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignore-case"
                    checked={ignoreCase}
                    onCheckedChange={setIgnoreCase}
                  />
                  <Label htmlFor="ignore-case">Ignore Case</Label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={calculateDiff} disabled={!originalText || !modifiedText}>
                    <GitCompare className="h-4 w-4 mr-2" />
                    Compare Texts
                  </Button>
                  <Button variant="outline" onClick={loadExample}>
                    Load Example
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {diffResults.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Comparison Results</CardTitle>
                    <CardDescription>Differences between the two texts</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyDiff}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Diff
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadDiff}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Statistics */}
                <div className="flex space-x-4 mb-6">
                  <Badge className="bg-green-100 text-green-800">
                    +{addedCount} Added
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    -{removedCount} Removed
                  </Badge>
                  <Badge variant="secondary">
                    {unchangedCount} Unchanged
                  </Badge>
                </div>

                {/* Diff Display */}
                <div className="bg-gray-50 border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="font-mono text-sm space-y-1">
                    {diffResults.map((result, index) => (
                      <div
                        key={index}
                        className={`p-1 rounded ${
                          result.type === "added"
                            ? "bg-green-100 text-green-800"
                            : result.type === "removed"
                              ? "bg-red-100 text-red-800"
                              : "text-gray-600"
                        }`}
                      >
                        <span className="inline-block w-6 text-center font-bold">
                          {result.type === "added" ? "+" : result.type === "removed" ? "-" : " "}
                        </span>
                        <span>{result.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}