"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Copy, Download, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function LoremIpsumGeneratorPage() {
  const [outputType, setOutputType] = useState("paragraphs")
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [generatedText, setGeneratedText] = useState("")

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
    "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
    "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip",
    "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
    "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat",
    "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
  ]

  const generateWord = () => {
    return loremWords[Math.floor(Math.random() * loremWords.length)]
  }

  const generateSentence = (wordCount = Math.floor(Math.random() * 10) + 8) => {
    const words = []
    for (let i = 0; i < wordCount; i++) {
      words.push(generateWord())
    }
    return words.join(" ").charAt(0).toUpperCase() + words.join(" ").slice(1) + "."
  }

  const generateParagraph = (sentenceCount = Math.floor(Math.random() * 4) + 3) => {
    const sentences = []
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence())
    }
    return sentences.join(" ")
  }

  const generateText = () => {
    let result = ""

    switch (outputType) {
      case "words":
        const words = []
        for (let i = 0; i < count; i++) {
          words.push(generateWord())
        }
        result = words.join(" ")
        break

      case "sentences":
        const sentences = []
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence())
        }
        result = sentences.join(" ")
        break

      case "paragraphs":
        const paragraphs = []
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph())
        }
        result = paragraphs.join("\n\n")
        break

      case "list":
        const listItems = []
        for (let i = 0; i < count; i++) {
          listItems.push(`• ${generateSentence()}`)
        }
        result = listItems.join("\n")
        break
    }

    // Start with classic Lorem Ipsum if requested
    if (startWithLorem && outputType === "paragraphs") {
      const classicStart = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      if (count > 0) {
        const remainingParagraphs = []
        for (let i = 1; i < count; i++) {
          remainingParagraphs.push(generateParagraph())
        }
        result = classicStart + (remainingParagraphs.length > 0 ? "\n\n" + remainingParagraphs.join("\n\n") : "")
      }
    }

    setGeneratedText(result)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText)
    toast({
      title: "Copied to clipboard",
      description: "Lorem ipsum text has been copied"
    })
  }

  const downloadText = () => {
    const blob = new Blob([generatedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "lorem-ipsum.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <FileText className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Lorem Ipsum Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate placeholder text in various formats and lengths for design and development projects.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Text Configuration</CardTitle>
              <CardDescription>Customize your Lorem Ipsum output</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="output-type">Output Type</Label>
                <Select value={outputType} onValueChange={setOutputType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="words">Words</SelectItem>
                    <SelectItem value="sentences">Sentences</SelectItem>
                    <SelectItem value="paragraphs">Paragraphs</SelectItem>
                    <SelectItem value="list">List Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="count">
                  Number of {outputType.charAt(0).toUpperCase() + outputType.slice(1)}
                </Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  min={1}
                  max={outputType === "words" ? 500 : outputType === "sentences" ? 50 : 20}
                />
              </div>

              {outputType === "paragraphs" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="start-lorem"
                    checked={startWithLorem}
                    onCheckedChange={setStartWithLorem}
                  />
                  <Label htmlFor="start-lorem">Start with "Lorem ipsum..."</Label>
                </div>
              )}

              <Button onClick={generateText} className="w-full" size="lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Text
              </Button>

              <div className="pt-4 border-t space-y-2">
                <h4 className="font-medium">Quick Presets</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOutputType("paragraphs")
                      setCount(3)
                      setStartWithLorem(true)
                    }}
                  >
                    3 Paragraphs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOutputType("sentences")
                      setCount(5)
                    }}
                  >
                    5 Sentences
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOutputType("words")
                      setCount(50)
                    }}
                  >
                    50 Words
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOutputType("list")
                      setCount(5)
                    }}
                  >
                    5 List Items
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Text */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Generated Lorem Ipsum</CardTitle>
                <CardDescription>Your placeholder text is ready to use</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={generatedText}
                  readOnly
                  placeholder="Generated text will appear here..."
                  className="min-h-[400px] font-serif text-base leading-relaxed"
                />

                <div className="flex space-x-2">
                  <Button onClick={copyToClipboard} disabled={!generatedText}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Text
                  </Button>
                  <Button variant="outline" onClick={downloadText} disabled={!generatedText}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {generatedText && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
                    <div>
                      <div className="text-2xl font-bold">{generatedText.split(" ").length}</div>
                      <div className="text-sm text-muted-foreground">Words</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{generatedText.length}</div>
                      <div className="text-sm text-muted-foreground">Characters</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{generatedText.split(/[.!?]+/).length - 1}</div>
                      <div className="text-sm text-muted-foreground">Sentences</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About Lorem Ipsum */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>About Lorem Ipsum</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the 
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type 
              and scrambled it to make a type specimen book. It has survived not only five centuries, but also the 
              leap into electronic typesetting, remaining essentially unchanged.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}