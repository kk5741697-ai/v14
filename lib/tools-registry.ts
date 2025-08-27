export interface ToolDefinition {
  id: string
  slug: string
  title: string
  description: string
  category: string
  icon: string
  isNew?: boolean
  isPremium?: boolean
  supportsBulk?: boolean
  inputTypes?: string[]
  outputTypes?: string[]
  href?: string
}

export const TOOLS_REGISTRY: ToolDefinition[] = [
  // PDF Tools
  {
    id: "pdf-merge",
    slug: "pdf-merge",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document with custom ordering",
    category: "PDF",
    icon: "FileText",
    href: "/pdf-merger",
    supportsBulk: true,
    inputTypes: ["pdf"],
    outputTypes: ["pdf"],
  },
  {
    id: "pdf-split",
    slug: "pdf-split",
    title: "Split PDF",
    description: "Split PDF files by page range or extract specific pages",
    category: "PDF",
    icon: "Scissors",
    href: "/pdf-splitter",
    inputTypes: ["pdf"],
    outputTypes: ["pdf"],
  },
  {
    id: "pdf-compress",
    slug: "pdf-compress",
    title: "Compress PDF",
    description: "Reduce PDF file size while maintaining quality",
    category: "PDF",
    icon: "Archive",
    href: "/pdf-compressor",
    supportsBulk: true,
    inputTypes: ["pdf"],
    outputTypes: ["pdf"],
  },
  {
    id: "pdf-to-images",
    slug: "pdf-to-images",
    title: "PDF to Images",
    description: "Convert PDF pages to PNG, JPG, or WebP images",
    category: "PDF",
    icon: "ImageIcon",
    href: "/pdf-to-image",
    inputTypes: ["pdf"],
    outputTypes: ["png", "jpg", "webp"],
  },

  // Image Tools
  {
    id: "image-resize",
    slug: "image-resize",
    title: "Resize Image",
    description: "Resize images by pixels, percentage, or aspect ratio",
    category: "IMAGE",
    icon: "Maximize",
    href: "/image-resizer",
    supportsBulk: true,
    inputTypes: ["jpg", "png", "webp", "gif"],
    outputTypes: ["jpg", "png", "webp"],
  },
  {
    id: "image-compress",
    slug: "image-compress",
    title: "Compress Image",
    description: "Reduce image file size with quality control",
    category: "IMAGE",
    icon: "Archive",
    href: "/image-compressor",
    supportsBulk: true,
    inputTypes: ["jpg", "png", "webp"],
    outputTypes: ["jpg", "png", "webp"],
  },
  {
    id: "image-convert",
    slug: "image-convert",
    title: "Convert Image",
    description: "Convert between JPG, PNG, WebP, AVIF, and other formats",
    category: "IMAGE",
    icon: "RefreshCw",
    href: "/image-converter",
    supportsBulk: true,
    inputTypes: ["jpg", "png", "webp", "gif", "bmp", "tiff"],
    outputTypes: ["jpg", "png", "webp", "avif"],
  },
  {
    id: "image-crop",
    slug: "image-crop",
    title: "Crop Image",
    description: "Crop images with custom dimensions or aspect ratios",
    category: "IMAGE",
    icon: "Crop",
    href: "/image-cropper",
    supportsBulk: true,
    inputTypes: ["jpg", "png", "webp"],
    outputTypes: ["jpg", "png", "webp"],
  },

  // QR & Barcode Tools
  {
    id: "qr-generator",
    slug: "qr-generator",
    title: "QR Code Generator",
    description: "Generate custom QR codes with logos, colors, and styles",
    category: "QR_BARCODE",
    icon: "QrCode",
    href: "/qr-code-generator",
    isNew: true,
    outputTypes: ["png", "svg", "pdf"],
  },
  {
    id: "qr-bulk",
    slug: "qr-bulk",
    title: "Bulk QR Generator",
    description: "Generate multiple QR codes from CSV data",
    category: "QR_BARCODE",
    icon: "Grid",
    href: "/bulk-qr-generator",
    supportsBulk: true,
    inputTypes: ["csv"],
    outputTypes: ["zip"],
  },
  {
    id: "qr-scanner",
    slug: "qr-scanner",
    title: "QR Code Scanner",
    description: "Scan and decode QR codes from images or camera",
    category: "QR_BARCODE",
    icon: "ScanLine",
    href: "/qr-scanner",
    inputTypes: ["jpg", "png", "webp"],
  },
  {
    id: "barcode-generator",
    slug: "barcode-generator",
    title: "Barcode Generator",
    description: "Generate EAN, UPC, Code128, and other barcodes",
    category: "QR_BARCODE",
    icon: "BarChart3",
    href: "/barcode-generator",
    outputTypes: ["png", "svg"],
  },

  // Code & Development Tools
  {
    id: "json-formatter",
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Beautify, validate, and minify JSON data",
    category: "CODE_DEV",
    icon: "Braces",
    href: "/json-formatter",
    inputTypes: ["json"],
    outputTypes: ["json"],
  },
  {
    id: "html-formatter",
    slug: "html-formatter",
    title: "HTML Formatter",
    description: "Format and beautify HTML code with syntax highlighting",
    category: "CODE_DEV",
    icon: "Code",
    href: "/html-formatter",
    inputTypes: ["html"],
    outputTypes: ["html"],
  },
  {
    id: "css-formatter",
    slug: "css-formatter",
    title: "CSS Formatter",
    description: "Format, beautify, and minify CSS stylesheets",
    category: "CODE_DEV",
    icon: "Palette",
    href: "/css-minifier",
    inputTypes: ["css"],
    outputTypes: ["css"],
  },
  {
    id: "js-formatter",
    slug: "js-formatter",
    title: "JavaScript Formatter",
    description: "Format, beautify, and minify JavaScript code",
    category: "CODE_DEV",
    icon: "FileCode",
    href: "/js-minifier",
    inputTypes: ["js"],
    outputTypes: ["js"],
  },
  {
    id: "base64-encoder",
    slug: "base64-encoder",
    title: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings and files",
    category: "CODE_DEV",
    icon: "Lock",
    href: "/base64-encoder",
  },
  {
    id: "url-encoder",
    slug: "url-encoder",
    title: "URL Encoder/Decoder",
    description: "Encode and decode URL strings and parameters",
    category: "CODE_DEV",
    icon: "Link",
    href: "/url-encoder",
  },

  // SEO Tools
  {
    id: "meta-generator",
    slug: "meta-generator",
    title: "Meta Tag Generator",
    description: "Generate SEO meta tags, Open Graph, and Twitter Cards",
    category: "SEO",
    icon: "Tags",
    href: "/seo-meta-generator",
    outputTypes: ["html"],
  },
  {
    id: "sitemap-generator",
    slug: "sitemap-generator",
    title: "Sitemap Generator",
    description: "Generate XML sitemaps for better search engine indexing",
    category: "SEO",
    icon: "Map",
    href: "/sitemap-generator",
    outputTypes: ["xml"],
  },
  {
    id: "robots-generator",
    slug: "robots-generator",
    title: "Robots.txt Generator",
    description: "Create robots.txt files for search engine crawlers",
    category: "SEO",
    icon: "Bot",
    href: "/robots-txt-generator",
    outputTypes: ["txt"],
  },

  // Network Tools
  {
    id: "ssl-checker",
    slug: "ssl-checker",
    title: "SSL Certificate Checker",
    description: "Check SSL certificate details and expiration dates",
    category: "NETWORK",
    icon: "Shield",
    href: "/ssl-checker",
  },
  {
    id: "ip-lookup",
    slug: "ip-lookup",
    title: "IP Address Lookup",
    description: "Get detailed information about IP addresses",
    category: "NETWORK",
    icon: "Globe",
    href: "/ip-lookup",
  },

  // Utilities
  {
    id: "password-generator",
    slug: "password-generator",
    title: "Password Generator",
    description: "Generate secure passwords with custom options",
    category: "UTILITIES",
    icon: "Key",
    href: "/password-generator",
  },
  {
    id: "uuid-generator",
    slug: "uuid-generator",
    title: "UUID Generator",
    description: "Generate unique identifiers (UUID/GUID)",
    category: "UTILITIES",
    icon: "Hash",
    href: "/uuid-generator",
  },
  {
    id: "color-picker",
    slug: "color-picker",
    title: "Color Picker",
    description: "Pick colors and convert between HEX, RGB, HSL formats",
    category: "UTILITIES",
    icon: "Palette",
    href: "/color-converter",
  },
  {
    id: "unit-converter",
    slug: "unit-converter",
    title: "Unit Converter",
    description: "Convert between different units of measurement",
    category: "CONVERTERS",
    icon: "Calculator",
    href: "/unit-converter",
  },
]

export function getToolsByCategory(category: string): ToolDefinition[] {
  if (category === "all") {
    return TOOLS_REGISTRY
  }
  return TOOLS_REGISTRY.filter((tool) => tool.category === category.toUpperCase())
}

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS_REGISTRY.find((tool) => tool.slug === slug)
}

export function getToolCategories(): string[] {
  const categories = new Set(TOOLS_REGISTRY.map((tool) => tool.category))
  return Array.from(categories)
}
