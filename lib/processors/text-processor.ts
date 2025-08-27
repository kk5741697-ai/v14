// Real text processing utilities for formatting, validation, and conversion
export interface TextProcessingOptions {
  indent?: number | string
  minify?: boolean
  removeComments?: boolean
  sortKeys?: boolean
  validateOnly?: boolean
  outputFormat?: string
}

export interface ProcessingResult {
  output: string
  error?: string
  stats?: Record<string, any>
}

export class TextProcessor {
  static processJSON(input: string, options: TextProcessingOptions = {}): ProcessingResult {
    try {
      if (!input.trim()) {
        return { output: "", error: "Input cannot be empty" }
      }

      // Parse JSON to validate
      const parsed = JSON.parse(input)
      
      let output: string
      
      if (options.minify) {
        output = JSON.stringify(parsed)
      } else {
        const indent = typeof options.indent === "number" ? options.indent : 2
        
        if (options.sortKeys) {
          output = JSON.stringify(parsed, Object.keys(parsed).sort(), indent)
        } else {
          output = JSON.stringify(parsed, null, indent)
        }
      }

      const stats = {
        "Input Size": `${input.length} chars`,
        "Output Size": `${output.length} chars`,
        "Objects": this.countObjects(parsed),
        "Arrays": this.countArrays(parsed),
        "Properties": this.countProperties(parsed),
        "Compression": `${((1 - output.length / input.length) * 100).toFixed(1)}%`
      }

      return { output, stats }
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "Invalid JSON format"
      }
    }
  }

  static processXML(input: string, options: TextProcessingOptions = {}): ProcessingResult {
    try {
      if (!input.trim()) {
        return { output: "", error: "Input cannot be empty" }
      }

      // Parse and validate XML
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(input, "text/xml")
      const parseError = xmlDoc.querySelector("parsererror")
      
      if (parseError) {
        return { output: "", error: "Invalid XML format" }
      }

      let output: string

      if (options.minify) {
        output = input.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim()
      } else {
        output = this.formatXML(input, options.indent || 2)
      }

      if (options.removeComments) {
        output = output.replace(/<!--[\s\S]*?-->/g, "")
      }

      const stats = {
        "Input Size": `${input.length} chars`,
        "Output Size": `${output.length} chars`,
        "Elements": (input.match(/<[^\/][^>]*>/g) || []).length,
        "Attributes": (input.match(/\w+="[^"]*"/g) || []).length
      }

      return { output, stats }
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "XML processing failed"
      }
    }
  }

  static processHTML(input: string, options: TextProcessingOptions = {}): ProcessingResult {
    try {
      if (!input.trim()) {
        return { output: "", error: "Input cannot be empty" }
      }

      let output: string

      if (options.minify) {
        output = input
          .replace(/>\s+</g, "><")
          .replace(/\s+/g, " ")
          .replace(/<!--[\s\S]*?-->/g, "")
          .trim()
      } else {
        output = this.formatHTML(input, options.indent || 2)
      }

      if (options.removeComments) {
        output = output.replace(/<!--[\s\S]*?-->/g, "")
      }

      const stats = {
        "Input Size": `${input.length} chars`,
        "Output Size": `${output.length} chars`,
        "HTML Tags": (input.match(/<[^>]+>/g) || []).length,
        "Text Nodes": (input.match(/>[^<]+</g) || []).length
      }

      return { output, stats }
    } catch (error) {
      return {
        output: "",
        error: error instanceof Error ? error.message : "HTML processing failed"
      }
    }
  }

  private static formatXML(xml: string, indent: number | string): string {
    const indentStr = typeof indent === "number" ? " ".repeat(indent) : "\t"
    let formatted = ""
    let level = 0
    
    xml.split(/>\s*</).forEach((node, index) => {
      if (index > 0) formatted += ">"
      if (index < xml.split(/>\s*</).length - 1) formatted += "<"
      
      if (node.match(/^\/\w/)) level--
      
      formatted += "\n" + indentStr.repeat(level) + node
      
      if (node.match(/^<?\w[^>]*[^\/]$/)) level++
    })
    
    return formatted.substring(1)
  }

  private static formatHTML(html: string, indent: number | string): string {
    const indentStr = typeof indent === "number" ? " ".repeat(indent) : "\t"
    let formatted = ""
    let level = 0
    
    const tokens = html.split(/(<[^>]*>)/).filter(token => token.trim())
    
    tokens.forEach(token => {
      if (token.startsWith("</")) {
        level--
        formatted += indentStr.repeat(level) + token + "\n"
      } else if (token.startsWith("<") && !token.endsWith("/>")) {
        formatted += indentStr.repeat(level) + token + "\n"
        if (!token.match(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/i)) {
          level++
        }
      } else if (token.startsWith("<") && token.endsWith("/>")) {
        formatted += indentStr.repeat(level) + token + "\n"
      } else if (token.trim()) {
        formatted += indentStr.repeat(level) + token.trim() + "\n"
      }
    })
    
    return formatted.trim()
  }

  private static countObjects(obj: any): number {
    let count = 0
    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      count = 1
      Object.values(obj).forEach(value => {
        count += this.countObjects(value)
      })
    } else if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += this.countObjects(item)
      })
    }
    return count
  }

  private static countArrays(obj: any): number {
    let count = 0
    if (Array.isArray(obj)) {
      count = 1
      obj.forEach(item => {
        count += this.countArrays(item)
      })
    } else if (typeof obj === "object" && obj !== null) {
      Object.values(obj).forEach(value => {
        count += this.countArrays(value)
      })
    }
    return count
  }

  private static countProperties(obj: any): number {
    let count = 0
    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      count = Object.keys(obj).length
      Object.values(obj).forEach(value => {
        count += this.countProperties(value)
      })
    } else if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += this.countProperties(item)
      })
    }
    return count
  }
}