"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Copy, Download, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  sentences: number
  paragraphs: number
  readingTime: number
  speakingTime: number
  mostCommonWords: Array<{ word: string; count: number }>
}

export default function WordCounterPage() {
  const [text, setText] = useState("")
  const [stats, setStats] = useState<TextStats | null>(null)

  useEffect(() => {
    if (text.trim()) {
      calculateStats()
    } else {
      setStats(null)
    }
  }, [text])

  const calculateStats = () => {
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, "").length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
    
    // Reading time (average 200 words per minute)
    const readingTime = Math.ceil(words / 200)
    
    // Speaking time (average 150 words per minute)
    const speakingTime = Math.ceil(words / 150)

    // Most common words
    const wordFrequency: Record<string, number> = {}
    const cleanWords = text.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 3) // Filter out short words

    cleanWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    })

    const mostCommonWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }))

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      mostCommonWords
    })
  }

  const copyText = () => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text has been copied"
    })
  }

  const downloadText = () => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "text-analysis.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadStats = () => {
    if (!stats) return

    const statsText = `Text Analysis Report
Generated: ${new Date().toLocaleString()}

BASIC STATISTICS
================
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}

READING METRICS
===============
Estimated reading time: ${stats.readingTime} minute${stats.readingTime !== 1 ? 's' : ''}
Estimated speaking time: ${stats.speakingTime} minute${stats.speakingTime !== 1 ? 's' : ''}

WORD FREQUENCY
==============
${stats.mostCommonWords.map(({ word, count }) => `${word}: ${count} times`).join('\n')}

ORIGINAL TEXT
=============
${text}`

    const blob = new Blob([statsText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "text-analysis-report.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadExample = () => {
    setText(`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <FileText className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Word Counter</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Count words, characters, paragraphs, and analyze reading time for any text content. Perfect for writers and content creators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Text Input */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Text Input</CardTitle>
                    <CardDescription>Enter or paste your text for analysis</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={loadExample}>
                      Load Example
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setText("")}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste your text here for analysis..."
                  className="min-h-[400px] text-base leading-relaxed"
                />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-2">
                    <Button onClick={copyText} disabled={!text} variant="outline" size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </Button>
                    <Button onClick={downloadText} disabled={!text} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  {stats && (
                    <div className="text-sm text-muted-foreground">
                      Live count: {stats.words} words, {stats.characters} characters
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Text Statistics</CardTitle>
                <CardDescription>Real-time analysis of your text</CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Characters:</span>
                        <span className="font-medium">{stats.characters.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Characters (no spaces):</span>
                        <span className="font-medium">{stats.charactersNoSpaces.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Words:</span>
                        <span className="font-medium">{stats.words.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sentences:</span>
                        <span className="font-medium">{stats.sentences.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Paragraphs:</span>
                        <span className="font-medium">{stats.paragraphs.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Reading Metrics</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Reading time:</span>
                          <span className="font-medium">{stats.readingTime} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Speaking time:</span>
                          <span className="font-medium">{stats.speakingTime} min</span>
                        </div>
                      </div>
                    </div>

                    {stats.mostCommonWords.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Most Common Words</h4>
                        <div className="space-y-2">
                          {stats.mostCommonWords.map(({ word, count }) => (
                            <div key={word} className="flex justify-between">
                              <span className="text-sm">{word}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button onClick={downloadStats} variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Enter text to see statistics</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reading Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Reading Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Average reading speed:</strong>
                    <div className="text-muted-foreground">200 words per minute</div>
                  </div>
                  <div>
                    <strong>Average speaking speed:</strong>
                    <div className="text-muted-foreground">150 words per minute</div>
                  </div>
                  <div>
                    <strong>Ideal paragraph length:</strong>
                    <div className="text-muted-foreground">50-100 words</div>
                  </div>
                  <div>
                    <strong>Ideal sentence length:</strong>
                    <div className="text-muted-foreground">15-20 words</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}