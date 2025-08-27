"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Code } from "lucide-react"
import { TextProcessor } from "@/lib/processors/text-processor"

const xmlExamples = [
  {
    name: "Simple XML",
    content: `<?xml version="1.0" encoding="UTF-8"?><root><item id="1"><name>Example</name><value>123</value></item></root>`,
  },
  {
    name: "RSS Feed",
    content: `<?xml version="1.0"?><rss version="2.0"><channel><title>Example Feed</title><description>Sample RSS feed</description><item><title>Article 1</title><link>https://example.com/1</link></item></channel></rss>`,
  },
  {
    name: "Config File",
    content: `<configuration><database><host>localhost</host><port>5432</port><name>mydb</name></database><logging><level>info</level><file>app.log</file></logging></configuration>`,
  },
]

const xmlOptions = [
  {
    key: "indent",
    label: "Indentation",
    type: "select" as const,
    defaultValue: 2,
    selectOptions: [
      { value: 2, label: "2 Spaces" },
      { value: 4, label: "4 Spaces" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "minify",
    label: "Minify XML",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processXML(input: string, options: any = {}) {
  return TextProcessor.processXML(input, options)
}

function validateXML(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(input, "text/xml")
    const parseError = xmlDoc.querySelector("parsererror")
    
    if (parseError) {
      return { isValid: false, error: "Invalid XML format" }
    }
    
    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: "XML validation failed" }
  }
}

export default function XMLFormatterPage() {
  return (
    <TextToolLayout
      title="XML Formatter"
      description="Format, validate, and beautify XML documents with syntax highlighting and error detection."
      icon={Code}
      placeholder="Paste your XML here..."
      outputPlaceholder="Formatted XML will appear here..."
      processFunction={processXML}
      validateFunction={validateXML}
      options={xmlOptions}
      examples={xmlExamples}
      fileExtensions={[".xml", ".xsl", ".xsd"]}
    />
  )
}