"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Menu, X, MoreHorizontal, ChevronDown, Wrench, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TOOLS_REGISTRY } from "@/lib/tools-registry"
import { useRouter } from "next/navigation"

// All available tools for search
const allTools = [
  // Image Tools
  { name: "Compress Image", href: "/image-compressor", category: "Image" },
  { name: "Resize Image", href: "/image-resizer", category: "Image" },
  { name: "Crop Image", href: "/image-cropper", category: "Image" },
  { name: "Convert Image", href: "/image-converter", category: "Image" },
  { name: "Image Rotator", href: "/image-rotator", category: "Image" },
  { name: "Background Remover", href: "/background-remover", category: "Image" },
  { name: "Image Flipper", href: "/image-flipper", category: "Image" },
  { name: "Image Filters", href: "/image-filters", category: "Image" },
  { name: "Image Upscaler", href: "/image-upscaler", category: "Image" },
  { name: "Image Watermark", href: "/image-watermark", category: "Image" },
  
  // PDF Tools
  { name: "Merge PDF", href: "/pdf-merger", category: "PDF" },
  { name: "Split PDF", href: "/pdf-splitter", category: "PDF" },
  { name: "Compress PDF", href: "/pdf-compressor", category: "PDF" },
  { name: "PDF to Image", href: "/pdf-to-image", category: "PDF" },
  { name: "PDF to Word", href: "/pdf-to-word", category: "PDF" },
  { name: "PDF Password Protector", href: "/pdf-password-protector", category: "PDF" },
  { name: "Image to PDF", href: "/image-to-pdf", category: "PDF" },
  { name: "PDF Unlock", href: "/pdf-unlock", category: "PDF" },
  { name: "PDF Organizer", href: "/pdf-organizer", category: "PDF" },
  { name: "PDF Watermark", href: "/pdf-watermark", category: "PDF" },
  
  // QR Tools
  { name: "QR Code Generator", href: "/qr-code-generator", category: "QR" },
  { name: "QR Scanner", href: "/qr-scanner", category: "QR" },
  { name: "Barcode Generator", href: "/barcode-generator", category: "QR" },
  { name: "Bulk QR Generator", href: "/bulk-qr-generator", category: "QR" },
  { name: "WiFi QR Generator", href: "/wifi-qr-generator", category: "QR" },
  { name: "vCard QR Generator", href: "/vcard-qr-generator", category: "QR" },
  
  // Text Tools
  { name: "JSON Formatter", href: "/json-formatter", category: "Text" },
  { name: "Base64 Encoder", href: "/base64-encoder", category: "Text" },
  { name: "URL Encoder", href: "/url-encoder", category: "Text" },
  { name: "Text Case Converter", href: "/text-case-converter", category: "Text" },
  { name: "Hash Generator", href: "/hash-generator", category: "Text" },
  { name: "XML Formatter", href: "/xml-formatter", category: "Text" },
  { name: "HTML Formatter", href: "/html-formatter", category: "Text" },
  { name: "CSS Minifier", href: "/css-minifier", category: "Text" },
  { name: "JavaScript Minifier", href: "/js-minifier", category: "Text" },
  { name: "Text Diff Checker", href: "/text-diff-checker", category: "Text" },
  { name: "Word Counter", href: "/word-counter", category: "Text" },
  
  // SEO Tools
  { name: "SEO Meta Generator", href: "/seo-meta-generator", category: "SEO" },
  
  // Utilities
  { name: "Password Generator", href: "/password-generator", category: "Utilities" },
  { name: "Lorem Ipsum Generator", href: "/lorem-ipsum-generator", category: "Utilities" },
  { name: "UUID Generator", href: "/uuid-generator", category: "Utilities" },
  { name: "Random Number Generator", href: "/random-number-generator", category: "Utilities" },
  { name: "Unit Converter", href: "/unit-converter", category: "Converters" },
  { name: "Currency Converter", href: "/currency-converter", category: "Converters" },
  { name: "Color Converter", href: "/color-converter", category: "Converters" },
]

// Dynamic tools based on current domain
const getMainTools = (hostname: string) => {
  const cleanHost = hostname.split(':')[0]
  
  switch (cleanHost) {
    case 'pixorapdf.com':
      return [
        { name: "MERGE PDF", href: "/pdf-merger" },
        { name: "SPLIT PDF", href: "/pdf-splitter" },
        { name: "COMPRESS PDF", href: "/pdf-compressor" },
        { name: "PDF TO WORD", href: "/pdf-to-word" },
        { name: "PROTECT PDF", href: "/pdf-password-protector" },
      ]
    case 'pixoraimg.com':
      return [
        { name: "COMPRESS IMAGE", href: "/image-compressor" },
        { name: "RESIZE IMAGE", href: "/image-resizer" },
        { name: "CROP IMAGE", href: "/image-cropper" },
        { name: "CONVERT TO JPG", href: "/image-converter" },
        { name: "PHOTO EDITOR", href: "/image-watermark" },
      ]
    case 'pixoraqrcode.com':
      return [
        { name: "QR GENERATOR", href: "/qr-code-generator" },
        { name: "QR SCANNER", href: "/qr-scanner" },
        { name: "BARCODE GENERATOR", href: "/barcode-generator" },
        { name: "BULK QR", href: "/bulk-qr-generator" },
        { name: "WIFI QR", href: "/wifi-qr-generator" },
      ]
    case 'pixoracode.com':
      return [
        { name: "JSON FORMATTER", href: "/json-formatter" },
        { name: "BASE64 ENCODER", href: "/base64-encoder" },
        { name: "URL ENCODER", href: "/url-encoder" },
        { name: "HASH GENERATOR", href: "/hash-generator" },
        { name: "TEXT CASE", href: "/text-case-converter" },
      ]
    case 'pixoraseo.com':
      return [
        { name: "META GENERATOR", href: "/seo-meta-generator" },
        { name: "SITEMAP GENERATOR", href: "/sitemap-generator" },
        { name: "ROBOTS.TXT", href: "/robots-txt-generator" },
        { name: "KEYWORD DENSITY", href: "/keyword-density-checker" },
        { name: "PAGE SPEED", href: "/page-speed-analyzer" },
      ]
    default: // pixoratools.com and localhost
      return [
        { name: "COMPRESS IMAGE", href: "/image-compressor" },
        { name: "RESIZE IMAGE", href: "/image-resizer" },
        { name: "MERGE PDF", href: "/pdf-merger" },
        { name: "QR GENERATOR", href: "/qr-code-generator" },
        { name: "JSON FORMATTER", href: "/json-formatter" },
      ]
  }
}

const getMoreTools = (hostname: string) => {
  const cleanHost = hostname.split(':')[0]
  
  if (cleanHost === 'pixoratools.com' || cleanHost === 'localhost') {
    return [
      { name: "PDF Tools", href: "/pdf-tools" },
      { name: "Image Tools", href: "/image-tools" },
      { name: "QR Tools", href: "/qr-tools" },
      { name: "Text Tools", href: "/text-tools" },
      { name: "SEO Tools", href: "/seo-tools" },
      { name: "Utilities", href: "/utilities" },
    ]
  }
  
  // For specialized domains, show other domain categories
  return [
    { name: "All Tools", href: "https://pixoratools.com" },
    { name: "PDF Tools", href: "https://pixorapdf.com" },
    { name: "Image Tools", href: "https://pixoraimg.com" },
    { name: "QR Tools", href: "https://pixoraqrcode.com" },
    { name: "Code Tools", href: "https://pixoracode.com" },
    { name: "SEO Tools", href: "https://pixoraseo.com" },
  ]
}

const getBrandConfig = (hostname: string) => {
  const cleanHost = hostname.split(':')[0]
  
  switch (cleanHost) {
    case 'pixorapdf.com':
      return { name: "PDF", color: "text-red-600", bgColor: "bg-red-600" }
    case 'pixoraimg.com':
      return { name: "IMG", color: "text-blue-600", bgColor: "bg-blue-600" }
    case 'pixoraqrcode.com':
      return { name: "QR", color: "text-green-600", bgColor: "bg-green-600" }
    case 'pixoracode.com':
      return { name: "CODE", color: "text-orange-600", bgColor: "bg-orange-600" }
    case 'pixoraseo.com':
      return { name: "SEO", color: "text-cyan-600", bgColor: "bg-cyan-600" }
    case 'pixoranet.com':
      return { name: "NET", color: "text-purple-600", bgColor: "bg-purple-600" }
    case 'pixorautilities.com':
      return { name: "UTILS", color: "text-indigo-600", bgColor: "bg-indigo-600" }
    default:
      return { name: "TOOLS", color: "text-gray-900", bgColor: "bg-gray-900" }
  }
}
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<typeof allTools>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [hostname, setHostname] = useState("pixoratools.com")
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Get hostname on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname)
    }
  }, [])
  
  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allTools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 8))
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchSelect = (href: string) => {
    setSearchQuery("")
    setShowSearchResults(false)
    router.push(href)
  }

  const mainTools = getMainTools(hostname)
  const moreTools = getMoreTools(hostname)
  const brandConfig = getBrandConfig(hostname)

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-18 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className={`h-10 w-10 rounded-xl ${brandConfig.bgColor} flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200`}>
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-gray-900">PIXORA</span>
                <span className={`text-2xl font-bold ${brandConfig.color} ml-1`}>{brandConfig.name}</span>
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {mainTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-gray-50"
              >
                {tool.name}
              </Link>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50">
                  MORE TOOLS
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200">
                {moreTools.map((tool) => (
                  <DropdownMenuItem key={tool.name} asChild>
                    <Link href={tool.href} className="w-full font-medium">
                      {tool.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-gray-50 border-gray-200 focus:bg-white hover:bg-white transition-colors"
                />
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto backdrop-blur-sm">
                  {searchResults.map((tool) => (
                    <button
                      key={tool.href}
                      onClick={() => handleSearchSelect(tool.href)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors group"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{tool.name}</div>
                      <div className="text-sm text-gray-500 group-hover:text-blue-500">{tool.category}</div>
                    </button>
                  ))}
                  {searchQuery && (
                    <Link href={`/search?q=${encodeURIComponent(searchQuery)}`}>
                      <div className="px-4 py-3 text-center text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium transition-colors">
                        View all results for "{searchQuery}"
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>

            <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50">
              Login
            </Button>
            <Button className={`${brandConfig.bgColor} hover:opacity-90 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}>
              Sign up
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg hover:bg-gray-50">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-xl border-gray-200">
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="font-medium">Pricing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing" className="font-medium">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="font-medium">Admin</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <Button variant="ghost" size="sm" className="lg:hidden rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white/95 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
              
              {/* Mobile Search Results */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                  {searchResults.map((tool) => (
                    <button
                      key={tool.href}
                      onClick={() => {
                        handleSearchSelect(tool.href)
                        setIsMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white border-b border-gray-200 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{tool.name}</div>
                      <div className="text-sm text-gray-500">{tool.category}</div>
                    </button>
                  ))}
                </div>
              )}
              
              <nav className="space-y-2">
                {mainTools.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {tool.name}
                  </Link>
                ))}
                {moreTools.map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {tool.name}
                  </Link>
                ))}
              </nav>
              <div className="flex space-x-3 pt-6 border-t">
                <Button variant="outline" size="sm" className="flex-1 bg-white font-medium rounded-lg">
                  Login
                </Button>
                <Button size="sm" className={`flex-1 ${brandConfig.bgColor} hover:opacity-90 font-semibold rounded-lg shadow-lg`}>
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
