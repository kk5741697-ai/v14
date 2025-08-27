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
import { Dices, Copy, Download, RefreshCw, BarChart } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function RandomNumberGeneratorPage() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [count, setCount] = useState(1)
  const [allowDuplicates, setAllowDuplicates] = useState(true)
  const [sortResults, setSortResults] = useState(false)
  const [numberType, setNumberType] = useState("integer")
  const [decimalPlaces, setDecimalPlaces] = useState(2)
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([])

  const generateNumbers = () => {
    const numbers: number[] = []
    const usedNumbers = new Set<number>()

    for (let i = 0; i < count; i++) {
      let number: number

      if (numberType === "integer") {
        do {
          number = Math.floor(Math.random() * (max - min + 1)) + min
        } while (!allowDuplicates && usedNumbers.has(number) && usedNumbers.size < (max - min + 1))
      } else {
        do {
          number = Math.random() * (max - min) + min
          number = Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
        } while (!allowDuplicates && usedNumbers.has(number))
      }

      if (!allowDuplicates) {
        usedNumbers.add(number)
      }
      numbers.push(number)
    }

    if (sortResults) {
      numbers.sort((a, b) => a - b)
    }

    setGeneratedNumbers(numbers)
  }

  const copyNumbers = () => {
    const text = generatedNumbers.join("\n")
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${generatedNumbers.length} number${generatedNumbers.length > 1 ? 's' : ''} copied`
    })
  }

  const downloadNumbers = () => {
    const text = generatedNumbers.join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "random-numbers.txt"
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatistics = () => {
    if (generatedNumbers.length === 0) return null

    const sum = generatedNumbers.reduce((a, b) => a + b, 0)
    const avg = sum / generatedNumbers.length
    const sortedNumbers = [...generatedNumbers].sort((a, b) => a - b)
    const median = sortedNumbers.length % 2 === 0
      ? (sortedNumbers[sortedNumbers.length / 2 - 1] + sortedNumbers[sortedNumbers.length / 2]) / 2
      : sortedNumbers[Math.floor(sortedNumbers.length / 2)]

    return {
      sum: sum.toFixed(numberType === "decimal" ? decimalPlaces : 0),
      average: avg.toFixed(numberType === "decimal" ? decimalPlaces : 2),
      median: median.toFixed(numberType === "decimal" ? decimalPlaces : 2),
      min: Math.min(...generatedNumbers).toFixed(numberType === "decimal" ? decimalPlaces : 0),
      max: Math.max(...generatedNumbers).toFixed(numberType === "decimal" ? decimalPlaces : 0)
    }
  }

  const stats = getStatistics()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Dices className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Random Number Generator</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate random numbers with customizable ranges, types, and distribution options for testing, games, and simulations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Number Configuration</CardTitle>
              <CardDescription>Set your random number generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="number-type">Number Type</Label>
                <Select value={numberType} onValueChange={setNumberType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="integer">Integer</SelectItem>
                    <SelectItem value="decimal">Decimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min">Minimum Value</Label>
                  <Input
                    id="min"
                    type="number"
                    value={min}
                    onChange={(e) => setMin(Number(e.target.value))}
                    step={numberType === "decimal" ? "0.1" : "1"}
                  />
                </div>
                <div>
                  <Label htmlFor="max">Maximum Value</Label>
                  <Input
                    id="max"
                    type="number"
                    value={max}
                    onChange={(e) => setMax(Number(e.target.value))}
                    step={numberType === "decimal" ? "0.1" : "1"}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="count">How Many Numbers</Label>
                <Input
                  id="count"
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))}
                  min={1}
                  max={1000}
                />
              </div>

              {numberType === "decimal" && (
                <div>
                  <Label htmlFor="decimal-places">Decimal Places</Label>
                  <Input
                    id="decimal-places"
                    type="number"
                    value={decimalPlaces}
                    onChange={(e) => setDecimalPlaces(Math.max(1, Math.min(10, Number(e.target.value))))}
                    min={1}
                    max={10}
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label>Options</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-duplicates"
                    checked={allowDuplicates}
                    onCheckedChange={setAllowDuplicates}
                  />
                  <Label htmlFor="allow-duplicates">Allow Duplicates</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sort-results"
                    checked={sortResults}
                    onCheckedChange={setSortResults}
                  />
                  <Label htmlFor="sort-results">Sort Results</Label>
                </div>
              </div>

              <Button onClick={generateNumbers} className="w-full" size="lg">
                <Dices className="h-4 w-4 mr-2" />
                Generate Numbers
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Numbers</CardTitle>
              <CardDescription>Your random numbers are ready</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedNumbers.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {generatedNumbers.length} number{generatedNumbers.length > 1 ? 's' : ''} generated
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={copyNumbers}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadNumbers}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
                    <div className="grid grid-cols-4 gap-2 font-mono text-sm">
                      {generatedNumbers.map((number, index) => (
                        <div key={index} className="text-center p-2 bg-background rounded border">
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statistics */}
                  {stats && generatedNumbers.length > 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3 flex items-center">
                        <BarChart className="h-4 w-4 mr-2" />
                        Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Sum:</span>
                          <span className="ml-2 font-medium">{stats.sum}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Average:</span>
                          <span className="ml-2 font-medium">{stats.average}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Median:</span>
                          <span className="ml-2 font-medium">{stats.median}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Range:</span>
                          <span className="ml-2 font-medium">{stats.min} - {stats.max}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Dices className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Generated numbers will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Testing & Development</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Generate test data</li>
                  <li>• Database seeding</li>
                  <li>• Load testing</li>
                  <li>• Mock API responses</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Games & Simulations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Dice rolling</li>
                  <li>• Lottery numbers</li>
                  <li>• Random events</li>
                  <li>• Probability testing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Research & Analysis</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Statistical sampling</li>
                  <li>• Monte Carlo methods</li>
                  <li>• Random selection</li>
                  <li>• Data analysis</li>
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