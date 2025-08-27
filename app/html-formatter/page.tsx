"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Code } from "lucide-react"
import { TextProcessor } from "@/lib/processors/text-processor"

const htmlExamples = [
  {
    name: "Basic HTML",
    content: `<!DOCTYPE html><html><head><title>Example</title></head><body><h1>Hello World</h1><p>This is a paragraph.</p></body></html>`,
  },
  {
    name: "Form HTML",
    content: `<form action="/submit" method="post"><div class="form-group"><label for="name">Name:</label><input type="text" id="name" name="name" required></div><div class="form-group"><label for="email">Email:</label><input type="email" id="email" name="email" required></div><button type="submit">Submit</button></form>`,
  },
  {
    name: "Table HTML",
    content: `<table class="data-table"><thead><tr><th>Name</th><th>Age</th><th>City</th></tr></thead><tbody><tr><td>John</td><td>30</td><td>New York</td></tr><tr><td>Jane</td><td>25</td><td>Los Angeles</td></tr></tbody></table>`,
  },
]

const htmlOptions = [
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
    label: "Minify HTML",
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

function processHTML(input: string, options: any = {}) {
  return TextProcessor.processHTML(input, options)
}

export default function HTMLFormatterPage() {
  return (
    <TextToolLayout
      title="HTML Formatter"
      description="Clean up and format HTML code with proper indentation and syntax highlighting."
      icon={Code}
      placeholder="Paste your HTML here..."
      outputPlaceholder="Formatted HTML will appear here..."
      processFunction={processHTML}
      options={htmlOptions}
      examples={htmlExamples}
      fileExtensions={[".html", ".htm"]}
    />
  )
}