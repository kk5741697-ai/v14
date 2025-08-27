"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ToolCard } from "@/components/tool-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

// All available tools for search
const allTools = [
  // Image Tools
  { title: "Compress Image", description: "Compress JPG, PNG, WebP, and GIFs while saving space and maintaining quality.", href: "/image-compressor", icon: "Archive", category: "Image" },
  { title: "Resize Image", description: "Define your dimensions by percent or pixel, and resize your images with presets.", href: "/image-resizer", icon: "Maximize", category: "Image" },
  { title: "Crop Image", description: "Crop images with precision using our visual editor and aspect ratio presets.", href: "/image-cropper", icon: "Crop", category: "Image" },
  { title: "Convert Image", description: "Convert images between different formats including JPEG, PNG, and WebP.", href: "/image-converter", icon: "RefreshCw", category: "Image" },
  { title: "Image Rotator", description: "Rotate images by 90°, 180°, 270°, or any custom angle.", href: "/image-rotator", icon: "RotateCw", category: "Image" },
  { title: "Background Remover", description: "Remove backgrounds from images automatically using advanced edge detection.", href: "/background-remover", icon: "Scissors", category: "Image", isNew: true },
  { title: "Image Flipper", description: "Flip images horizontally, vertically, or both directions with batch processing.", href: "/image-flipper", icon: "FlipHorizontal", category: "Image" },
  { title: "Image Filters", description: "Apply professional filters and adjustments: brightness, contrast, saturation, and effects.", href: "/image-filters", icon: "Palette", category: "Image" },
  { title: "Image Upscaler", description: "Enlarge images with AI-enhanced quality. Increase resolution while preserving details.", href: "/image-upscaler", icon: "Zap", category: "Image", isNew: true },
  { title: "Image Watermark", description: "Add text watermarks to your images for copyright protection and branding.", href: "/image-watermark", icon: "Droplets", category: "Image" },
  
  // PDF Tools
  { title: "Merge PDF", description: "Combine multiple PDF files into one document with custom page ordering.", href: "/pdf-merger", icon: "FileType", category: "PDF" },
  { title: "Split PDF", description: "Split PDF files into separate documents by page ranges or extract specific pages.", href: "/pdf-splitter", icon: "Scissors", category: "PDF" },
  { title: "Compress PDF", description: "Reduce PDF file sizes while maintaining document quality and readability.", href: "/pdf-compressor", icon: "Archive", category: "PDF" },
  { title: "PDF to Image", description: "Convert PDF pages to high-quality images in various formats (PNG, JPEG, WebP).", href: "/pdf-to-image", icon: "ImageIcon", category: "PDF" },
  { title: "PDF to Word", description: "Convert PDF files to editable Word documents with OCR support for scanned documents.", href: "/pdf-to-word", icon: "FileText", category: "PDF", isPremium: true },
  { title: "PDF Password Protector", description: "Add password protection and encryption to PDF documents for security.", href: "/pdf-password-protector", icon: "Lock", category: "PDF" },
  { title: "Image to PDF", description: "Convert multiple images into a single PDF document with custom page layouts.", href: "/image-to-pdf", icon: "FileImage", category: "PDF" },
  { title: "PDF Unlock", description: "Remove password protection and restrictions from encrypted PDF files.", href: "/pdf-unlock", icon: "Unlock", category: "PDF" },
  { title: "PDF Organizer", description: "Reorder, sort, and organize PDF pages. Remove blank pages and add page numbers.", href: "/pdf-organizer", icon: "ArrowUpDown", category: "PDF" },
  { title: "PDF Watermark", description: "Add text watermarks to your PDF documents.", href: "/pdf-watermark", icon: "Droplets", category: "PDF" },
  
  // QR Tools
  { title: "QR Code Generator", description: "Create custom QR codes with logos, colors, and multiple formats.", href: "/qr-code-generator", icon: "QrCode", category: "QR", isNew: true },
  { title: "Barcode Generator", description: "Generate various barcode formats including UPC, EAN, Code 128, and more.", href: "/barcode-generator", icon: "BarChart3", category: "QR" },
  { title: "QR Code Scanner", description: "Decode and read QR codes from images.", href: "/qr-scanner", icon: "ScanLine", category: "QR" },
  { title: "Bulk QR Generator", description: "Generate multiple QR codes at once from CSV data or text lists.", href: "/bulk-qr-generator", icon: "Grid", category: "QR" },
  { title: "WiFi QR Generator", description: "Create QR codes for WiFi networks.", href: "/wifi-qr-generator", icon: "Wifi", category: "QR" },
  { title: "vCard QR Generator", description: "Generate QR codes for contact information.", href: "/vcard-qr-generator", icon: "User", category: "QR" },
  
  // Text Tools
  { title: "JSON Formatter", description: "Beautify, validate, and minify JSON data with syntax highlighting.", href: "/json-formatter", icon: "Braces", category: "Text" },
  { title: "Base64 Encoder/Decoder", description: "Encode text to Base64 or decode Base64 strings back to text.", href: "/base64-encoder", icon: "Lock", category: "Text" },
  { title: "URL Encoder/Decoder", description: "Encode URLs and query parameters or decode URL-encoded strings.", href: "/url-encoder", icon: "Link", category: "Text" },
  { title: "Text Case Converter", description: "Convert text between different cases: lowercase, UPPERCASE, Title Case, camelCase.", href: "/text-case-converter", icon: "Type", category: "Text" },
  { title: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes for data integrity.", href: "/hash-generator", icon: "Shield", category: "Text" },
  { title: "XML Formatter", description: "Format, validate, and beautify XML documents with syntax highlighting.", href: "/xml-formatter", icon: "Code", category: "Text" },
  { title: "HTML Formatter", description: "Clean up and format HTML code with proper indentation.", href: "/html-formatter", icon: "Code", category: "Text" },
  { title: "CSS Minifier", description: "Minify CSS code to reduce file size and improve website loading performance.", href: "/css-minifier", icon: "Palette", category: "Text" },
  { title: "JavaScript Minifier", description: "Compress JavaScript code while preserving functionality.", href: "/js-minifier", icon: "FileCode", category: "Text" },
  { title: "Text Diff Checker", description: "Compare two texts and highlight differences.", href: "/text-diff-checker", icon: "GitCompare", category: "Text" },
  { title: "Word Counter", description: "Count words, characters, paragraphs, and reading time.", href: "/word-counter", icon: "FileText", category: "Text" },
  
  // SEO Tools
  { title: "SEO Meta Generator", description: "Generate optimized meta tags, Open Graph, and Twitter Card tags.", href: "/seo-meta-generator", icon: "TrendingUp", category: "SEO" },
  
  // Utilities
  { title: "Password Generator", description: "Generate secure passwords with customizable length and character options.", href: "/password-generator", icon: "Shield", category: "Utilities" },
  { title: "Lorem Ipsum Generator", description: "Generate placeholder text in various formats and lengths.", href: "/lorem-ipsum-generator", icon: "FileText", category: "Utilities" },
  { title: "UUID Generator", description: "Generate unique identifiers (UUIDs) in various formats.", href: "/uuid-generator", icon: "Hash", category: "Utilities" },
  { title: "Random Number Generator", description: "Generate random numbers with customizable ranges and distribution options.", href: "/random-number-generator", icon: "Dices", category: "Utilities" },
  { title: "Unit Converter", description: "Convert between different units of measurement.", href: "/unit-converter", icon: "Calculator", category: "Converters" },
  { title: "Currency Converter", description: "Convert between world currencies with real-time exchange rates.", href: "/currency-converter", icon: "DollarSign", category: "Converters" },
  { title: "Color Converter", description: "Convert colors between formats: HEX, RGB, HSL, CMYK.", href: "/color-converter", icon: "Palette", category: "Converters" },
]

const categories = ["All", "Image", "PDF", "QR", "Text", "SEO", "Utilities", "Converters"]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [filteredTools, setFilteredTools] = useState(allTools)

  useEffect(() => {
    let filtered = allTools

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(tool =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }

    setFilteredTools(filtered)
  }, [searchQuery, selectedCategory])

  const clearSearch = () => {
    setSearchQuery("")
    setSelectedCategory("All")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Search className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Search Tools</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect tool for your needs from our collection of 300+ professional utilities
          </p>
        </div>

        {/* Search Controls */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for tools, features, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-white border-2 border-gray-200 focus:border-blue-500"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Search Stats */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>
              {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </div>
            {(searchQuery || selectedCategory !== "All") && (
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tools found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? `No tools match "${searchQuery}". Try different keywords or browse categories.`
                : "Try adjusting your search criteria or browse all tools."
              }
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={clearSearch}>
                Clear Search
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Browse All Tools</a>
              </Button>
            </div>
          </div>
        )}

        {/* Popular Searches */}
        {!searchQuery && (
          <div className="mt-16 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Searches</h2>
            <div className="flex flex-wrap gap-2">
              {["compress", "resize", "convert", "merge", "split", "qr code", "json", "password"].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(term)}
                  className="rounded-full"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}