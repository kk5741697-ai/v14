"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Palette } from "lucide-react"

const cssExamples = [
  {
    name: "Basic CSS",
    content: `body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}`,
  },
  {
    name: "Flexbox Layout",
    content: `.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.flex-item {
  flex: 1 1 300px;
  min-height: 200px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 8px;
  padding: 1.5rem;
}`,
  },
  {
    name: "Grid System",
    content: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
}`,
  },
]

const cssOptions = [
  {
    key: "minify",
    label: "Minify CSS",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeUnusedRules",
    label: "Remove Unused Rules",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "optimizeColors",
    label: "Optimize Colors",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCSS(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments
    if (options.removeComments) {
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Minify CSS
    if (options.minify) {
      output = output
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/;\s*}/g, "}") // Remove semicolon before closing brace
        .replace(/\s*{\s*/g, "{") // Remove spaces around opening brace
        .replace(/;\s*/g, ";") // Remove spaces after semicolon
        .replace(/,\s*/g, ",") // Remove spaces after comma
        .replace(/:\s*/g, ":") // Remove spaces after colon
        .trim()
    }

    // Optimize colors
    if (options.optimizeColors) {
      // Convert hex colors to shorter format where possible
      output = output.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, "#$1$2$3")
      // Convert rgb to hex where shorter
      output = output.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
        const hex = ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)
        return `#${hex}`
      })
    }

    const originalSize = input.length
    const minifiedSize = output.length
    const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0

    const stats = {
      "Original Size": `${originalSize} chars`,
      "Minified Size": `${minifiedSize} chars`,
      "Size Reduction": `${savings.toFixed(1)}%`,
      "Rules": `${(input.match(/[^{}]+{[^{}]*}/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "CSS processing failed",
    }
  }
}

function validateCSS(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic CSS validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in CSS" }
  }
  
  return { isValid: true }
}

export default function CSSMinifierPage() {
  return (
    <TextToolLayout
      title="CSS Minifier"
      description="Minify CSS code to reduce file size and improve website loading performance. Remove comments, whitespace, and optimize colors."
      icon={Palette}
      placeholder="Paste your CSS here..."
      outputPlaceholder="Minified CSS will appear here..."
      processFunction={processCSS}
      validateFunction={validateCSS}
      options={cssOptions}
      examples={cssExamples}
      fileExtensions={[".css"]}
    />
  )
}