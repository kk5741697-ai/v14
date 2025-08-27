"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Palette, Copy, RefreshCw, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ColorValues {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  hsv: { h: number; s: number; v: number }
  cmyk: { c: number; m: number; y: number; k: number }
}

export default function ColorConverterPage() {
  const [colorValues, setColorValues] = useState<ColorValues>({
    hex: "#3b82f6",
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    hsv: { h: 217, s: 76, v: 96 },
    cmyk: { c: 76, m: 47, y: 0, k: 4 }
  })

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }).join("")
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    }
  }

  const rgbToCmyk = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const k = 1 - Math.max(r, Math.max(g, b))
    const c = (1 - r - k) / (1 - k) || 0
    const m = (1 - g - k) / (1 - k) || 0
    const y = (1 - b - k) / (1 - k) || 0

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    }
  }

  const updateFromHex = (hex: string) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return

    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
    const hsv = { h: hsl.h, s: Math.round((hsl.s * hsl.l) / (100 - Math.abs(2 * hsl.l - 100))), v: hsl.l + (hsl.s * Math.min(hsl.l, 100 - hsl.l)) / 100 }

    setColorValues({ hex, rgb, hsl, hsv, cmyk })
  }

  const updateFromRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b)
    const hsl = rgbToHsl(r, g, b)
    const cmyk = rgbToCmyk(r, g, b)
    const hsv = { h: hsl.h, s: Math.round((hsl.s * hsl.l) / (100 - Math.abs(2 * hsl.l - 100))), v: hsl.l + (hsl.s * Math.min(hsl.l, 100 - hsl.l)) / 100 }

    setColorValues({ hex, rgb: { r, g, b }, hsl, hsv, cmyk })
  }

  const updateFromHsl = (h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
    const hsv = { h, s: Math.round((s * l) / (100 - Math.abs(2 * l - 100))), v: l + (s * Math.min(l, 100 - l)) / 100 }

    setColorValues({ hex, rgb, hsl: { h, s, l }, hsv, cmyk })
  }

  const copyValue = (value: string, format: string) => {
    navigator.clipboard.writeText(value)
    toast({
      title: "Copied to clipboard",
      description: `${format} value copied`
    })
  }

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)
    updateFromRgb(r, g, b)
  }

  const colorPresets = [
    { name: "Red", hex: "#ef4444" },
    { name: "Orange", hex: "#f97316" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Green", hex: "#22c55e" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Gray", hex: "#6b7280" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Palette className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Color Converter</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert colors between formats: HEX, RGB, HSL, CMYK, and more with live preview and color picker.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Color Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Color Preview</CardTitle>
              <CardDescription>Live preview of your selected color</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Large Color Swatch */}
              <div 
                className="w-full h-48 rounded-lg border-2 border-gray-200 shadow-inner"
                style={{ backgroundColor: colorValues.hex }}
              />

              {/* Color Picker */}
              <div>
                <Label htmlFor="color-picker">Color Picker</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    id="color-picker"
                    type="color"
                    value={colorValues.hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={colorValues.hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="flex-1 font-mono"
                    placeholder="#000000"
                  />
                  <Button variant="outline" size="icon" onClick={generateRandomColor}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <Label>Color Presets</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      onClick={() => updateFromHex(preset.hex)}
                      className="h-auto p-2 flex flex-col items-center"
                    >
                      <div 
                        className="w-8 h-8 rounded border mb-1"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-xs">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Values */}
          <Card>
            <CardHeader>
              <CardTitle>Color Values</CardTitle>
              <CardDescription>Color values in different formats</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hex" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="hex">HEX</TabsTrigger>
                  <TabsTrigger value="rgb">RGB</TabsTrigger>
                  <TabsTrigger value="hsl">HSL</TabsTrigger>
                  <TabsTrigger value="hsv">HSV</TabsTrigger>
                  <TabsTrigger value="cmyk">CMYK</TabsTrigger>
                </TabsList>

                <TabsContent value="hex" className="space-y-4">
                  <div>
                    <Label htmlFor="hex-input">HEX Value</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="hex-input"
                        value={colorValues.hex}
                        onChange={(e) => updateFromHex(e.target.value)}
                        className="font-mono"
                      />
                      <Button variant="outline" size="icon" onClick={() => copyValue(colorValues.hex, "HEX")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="rgb" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Red: {colorValues.rgb.r}</Label>
                      <Slider
                        value={[colorValues.rgb.r]}
                        onValueChange={([r]) => updateFromRgb(r, colorValues.rgb.g, colorValues.rgb.b)}
                        max={255}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Green: {colorValues.rgb.g}</Label>
                      <Slider
                        value={[colorValues.rgb.g]}
                        onValueChange={([g]) => updateFromRgb(colorValues.rgb.r, g, colorValues.rgb.b)}
                        max={255}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Blue: {colorValues.rgb.b}</Label>
                      <Slider
                        value={[colorValues.rgb.b]}
                        onValueChange={([b]) => updateFromRgb(colorValues.rgb.r, colorValues.rgb.g, b)}
                        max={255}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={`rgb(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b})`}
                        readOnly
                        className="font-mono"
                      />
                      <Button variant="outline" size="icon" onClick={() => copyValue(`rgb(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b})`, "RGB")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hsl" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Hue: {colorValues.hsl.h}°</Label>
                      <Slider
                        value={[colorValues.hsl.h]}
                        onValueChange={([h]) => updateFromHsl(h, colorValues.hsl.s, colorValues.hsl.l)}
                        max={360}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Saturation: {colorValues.hsl.s}%</Label>
                      <Slider
                        value={[colorValues.hsl.s]}
                        onValueChange={([s]) => updateFromHsl(colorValues.hsl.h, s, colorValues.hsl.l)}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Lightness: {colorValues.hsl.l}%</Label>
                      <Slider
                        value={[colorValues.hsl.l]}
                        onValueChange={([l]) => updateFromHsl(colorValues.hsl.h, colorValues.hsl.s, l)}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={`hsl(${colorValues.hsl.h}, ${colorValues.hsl.s}%, ${colorValues.hsl.l}%)`}
                        readOnly
                        className="font-mono"
                      />
                      <Button variant="outline" size="icon" onClick={() => copyValue(`hsl(${colorValues.hsl.h}, ${colorValues.hsl.s}%, ${colorValues.hsl.l}%)`, "HSL")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hsv" className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`hsv(${colorValues.hsv.h}, ${colorValues.hsv.s}%, ${colorValues.hsv.v}%)`}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={() => copyValue(`hsv(${colorValues.hsv.h}, ${colorValues.hsv.s}%, ${colorValues.hsv.v}%)`, "HSV")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="cmyk" className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{colorValues.cmyk.c}%</div>
                      <div className="text-sm text-muted-foreground">Cyan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{colorValues.cmyk.m}%</div>
                      <div className="text-sm text-muted-foreground">Magenta</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{colorValues.cmyk.y}%</div>
                      <div className="text-sm text-muted-foreground">Yellow</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{colorValues.cmyk.k}%</div>
                      <div className="text-sm text-muted-foreground">Black</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`cmyk(${colorValues.cmyk.c}%, ${colorValues.cmyk.m}%, ${colorValues.cmyk.y}%, ${colorValues.cmyk.k}%)`}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={() => copyValue(`cmyk(${colorValues.cmyk.c}%, ${colorValues.cmyk.m}%, ${colorValues.cmyk.y}%, ${colorValues.cmyk.k}%)`, "CMYK")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Color Harmony */}
        <Card className="mt-8 max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle>Color Harmony</CardTitle>
            <CardDescription>Complementary and analogous colors based on your selection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg border mb-2"
                  style={{ backgroundColor: colorValues.hex }}
                />
                <div className="text-sm font-medium">Original</div>
                <div className="text-xs text-muted-foreground font-mono">{colorValues.hex}</div>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg border mb-2"
                  style={{ backgroundColor: rgbToHex(255 - colorValues.rgb.r, 255 - colorValues.rgb.g, 255 - colorValues.rgb.b) }}
                />
                <div className="text-sm font-medium">Complementary</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {rgbToHex(255 - colorValues.rgb.r, 255 - colorValues.rgb.g, 255 - colorValues.rgb.b)}
                </div>
              </div>

              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg border mb-2"
                  style={{ backgroundColor: hslToRgb((colorValues.hsl.h + 30) % 360, colorValues.hsl.s, colorValues.hsl.l) }}
                />
                <div className="text-sm font-medium">Analogous +30°</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {rgbToHex(...Object.values(hslToRgb((colorValues.hsl.h + 30) % 360, colorValues.hsl.s, colorValues.hsl.l)))}
                </div>
              </div>

              <div className="text-center">
                <div 
                  className="w-full h-20 rounded-lg border mb-2"
                  style={{ backgroundColor: hslToRgb((colorValues.hsl.h - 30 + 360) % 360, colorValues.hsl.s, colorValues.hsl.l) }}
                />
                <div className="text-sm font-medium">Analogous -30°</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {rgbToHex(...Object.values(hslToRgb((colorValues.hsl.h - 30 + 360) % 360, colorValues.hsl.s, colorValues.hsl.l)))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}