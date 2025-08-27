"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, ArrowUpDown, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const conversions = {
  length: {
    name: "Length",
    units: {
      mm: { name: "Millimeters", factor: 1 },
      cm: { name: "Centimeters", factor: 10 },
      m: { name: "Meters", factor: 1000 },
      km: { name: "Kilometers", factor: 1000000 },
      in: { name: "Inches", factor: 25.4 },
      ft: { name: "Feet", factor: 304.8 },
      yd: { name: "Yards", factor: 914.4 },
      mi: { name: "Miles", factor: 1609344 }
    }
  },
  weight: {
    name: "Weight",
    units: {
      mg: { name: "Milligrams", factor: 1 },
      g: { name: "Grams", factor: 1000 },
      kg: { name: "Kilograms", factor: 1000000 },
      oz: { name: "Ounces", factor: 28349.5 },
      lb: { name: "Pounds", factor: 453592 },
      ton: { name: "Tons", factor: 1000000000 }
    }
  },
  temperature: {
    name: "Temperature",
    units: {
      c: { name: "Celsius", factor: 1 },
      f: { name: "Fahrenheit", factor: 1 },
      k: { name: "Kelvin", factor: 1 }
    }
  },
  area: {
    name: "Area",
    units: {
      mm2: { name: "Square Millimeters", factor: 1 },
      cm2: { name: "Square Centimeters", factor: 100 },
      m2: { name: "Square Meters", factor: 1000000 },
      km2: { name: "Square Kilometers", factor: 1000000000000 },
      in2: { name: "Square Inches", factor: 645.16 },
      ft2: { name: "Square Feet", factor: 92903 },
      acre: { name: "Acres", factor: 4046856422.4 }
    }
  },
  volume: {
    name: "Volume",
    units: {
      ml: { name: "Milliliters", factor: 1 },
      l: { name: "Liters", factor: 1000 },
      cup: { name: "Cups", factor: 236.588 },
      pt: { name: "Pints", factor: 473.176 },
      qt: { name: "Quarts", factor: 946.353 },
      gal: { name: "Gallons", factor: 3785.41 },
      floz: { name: "Fluid Ounces", factor: 29.5735 }
    }
  },
  speed: {
    name: "Speed",
    units: {
      mps: { name: "Meters per Second", factor: 1 },
      kph: { name: "Kilometers per Hour", factor: 0.277778 },
      mph: { name: "Miles per Hour", factor: 0.44704 },
      fps: { name: "Feet per Second", factor: 0.3048 },
      knot: { name: "Knots", factor: 0.514444 }
    }
  }
}

export default function UnitConverterPage() {
  const [activeCategory, setActiveCategory] = useState("length")
  const [fromUnit, setFromUnit] = useState("m")
  const [toUnit, setToUnit] = useState("ft")
  const [inputValue, setInputValue] = useState("1")
  const [result, setResult] = useState("")

  const convertUnits = () => {
    const value = parseFloat(inputValue)
    if (isNaN(value)) {
      setResult("")
      return
    }

    const category = conversions[activeCategory as keyof typeof conversions]
    
    if (activeCategory === "temperature") {
      // Special handling for temperature
      let celsius = value
      
      // Convert input to Celsius first
      if (fromUnit === "f") {
        celsius = (value - 32) * 5/9
      } else if (fromUnit === "k") {
        celsius = value - 273.15
      }
      
      // Convert from Celsius to target
      let result = celsius
      if (toUnit === "f") {
        result = celsius * 9/5 + 32
      } else if (toUnit === "k") {
        result = celsius + 273.15
      }
      
      setResult(result.toFixed(6).replace(/\.?0+$/, ""))
    } else {
      // Standard unit conversion
      const fromFactor = category.units[fromUnit as keyof typeof category.units]?.factor || 1
      const toFactor = category.units[toUnit as keyof typeof category.units]?.factor || 1
      
      const baseValue = value * fromFactor
      const convertedValue = baseValue / toFactor
      
      setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ""))
    }
  }

  const swapUnits = () => {
    const temp = fromUnit
    setFromUnit(toUnit)
    setToUnit(temp)
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
    toast({
      title: "Copied to clipboard",
      description: "Conversion result copied"
    })
  }

  // Auto-convert when values change
  React.useEffect(() => {
    convertUnits()
  }, [inputValue, fromUnit, toUnit, activeCategory])

  // Reset units when category changes
  React.useEffect(() => {
    const category = conversions[activeCategory as keyof typeof conversions]
    const units = Object.keys(category.units)
    setFromUnit(units[0])
    setToUnit(units[1] || units[0])
  }, [activeCategory])

  const currentCategory = conversions[activeCategory as keyof typeof conversions]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Calculator className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Unit Converter</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert between different units of measurement including length, weight, temperature, area, volume, and speed.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {Object.entries(conversions).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Converter */}
          <Card>
            <CardHeader>
              <CardTitle>{currentCategory.name} Converter</CardTitle>
              <CardDescription>Convert between different {currentCategory.name.toLowerCase()} units</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* Input Value */}
                <div className="md:col-span-2">
                  <Label htmlFor="input-value">Value</Label>
                  <Input
                    id="input-value"
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter value"
                    className="text-lg"
                  />
                </div>

                {/* From Unit */}
                <div>
                  <Label htmlFor="from-unit">From</Label>
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currentCategory.units).map(([key, unit]) => (
                        <SelectItem key={key} value={key}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button variant="outline" size="icon" onClick={swapUnits}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Unit */}
                <div>
                  <Label htmlFor="to-unit">To</Label>
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currentCategory.units).map(([key, unit]) => (
                        <SelectItem key={key} value={key}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Result */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Result</div>
                    <div className="text-2xl font-bold font-mono">
                      {result || "0"} {currentCategory.units[toUnit as keyof typeof currentCategory.units]?.name}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyResult} disabled={!result}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Conversion Formula */}
              {result && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm">
                    <strong>Conversion:</strong> {inputValue} {currentCategory.units[fromUnit as keyof typeof currentCategory.units]?.name} = {result} {currentCategory.units[toUnit as keyof typeof currentCategory.units]?.name}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Common Conversions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Common {currentCategory.name} Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentCategory.units).slice(0, 6).map(([key, unit]) => (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => {
                      setFromUnit(Object.keys(currentCategory.units)[0])
                      setToUnit(key)
                      setInputValue("1")
                    }}
                    className="h-auto p-3 text-left justify-start"
                  >
                    <div>
                      <div className="font-medium">Convert to {unit.name}</div>
                      <div className="text-xs text-muted-foreground">1 → {key}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}