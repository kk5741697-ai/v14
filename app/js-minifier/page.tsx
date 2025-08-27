"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const jsExamples = [
  {
    name: "Function Declaration",
    content: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

const cart = [
  { name: "Product A", price: 29.99, quantity: 2 },
  { name: "Product B", price: 15.50, quantity: 1 }
];

console.log("Total:", calculateTotal(cart));`,
  },
  {
    name: "ES6 Features",
    content: `const users = [
  { id: 1, name: "John", age: 30, active: true },
  { id: 2, name: "Jane", age: 25, active: false },
  { id: 3, name: "Bob", age: 35, active: true }
];

const activeUsers = users
  .filter(user => user.active)
  .map(user => ({
    ...user,
    displayName: \`\${user.name} (\${user.age})\`
  }));

const getUserById = (id) => users.find(user => user.id === id);`,
  },
  {
    name: "Async/Await",
    content: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
}

// Usage
fetchUserData(123).then(user => {
  if (user) {
    console.log("User loaded:", user.name);
  }
});`,
  },
]

const jsOptions = [
  {
    key: "minify",
    label: "Minify JavaScript",
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
    key: "removeConsole",
    label: "Remove console.log",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "preserveNewlines",
    label: "Preserve Some Newlines",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processJavaScript(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments
    if (options.removeComments) {
      // Remove single-line comments
      output = output.replace(/\/\/.*$/gm, "")
      // Remove multi-line comments
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Remove console statements
    if (options.removeConsole) {
      output = output.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, "")
    }

    // Minify JavaScript
    if (options.minify) {
      output = output
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/;\s*}/g, "}") // Remove semicolon before closing brace
        .replace(/\s*{\s*/g, "{") // Remove spaces around opening brace
        .replace(/;\s*/g, ";") // Remove spaces after semicolon
        .replace(/,\s*/g, ",") // Remove spaces after comma
        .replace(/\s*=\s*/g, "=") // Remove spaces around equals
        .replace(/\s*\+\s*/g, "+") // Remove spaces around plus
        .replace(/\s*-\s*/g, "-") // Remove spaces around minus
        .trim()

      // Preserve some newlines for readability if requested
      if (options.preserveNewlines) {
        output = output.replace(/}/g, "}\n").replace(/;(?=[a-zA-Z])/g, ";\n")
      }
    }

    const originalSize = input.length
    const minifiedSize = output.length
    const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0

    const stats = {
      "Original Size": `${originalSize} chars`,
      "Minified Size": `${minifiedSize} chars`,
      "Size Reduction": `${savings.toFixed(1)}%`,
      "Functions": `${(input.match(/function\s+\w+/g) || []).length}`,
      "Variables": `${(input.match(/(?:var|let|const)\s+\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "JavaScript processing failed",
    }
  }
}

function validateJavaScript(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic JavaScript validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  const openParens = (input.match(/\(/g) || []).length
  const closeParens = (input.match(/\)/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in JavaScript" }
  }
  
  if (openParens !== closeParens) {
    return { isValid: false, error: "Mismatched parentheses in JavaScript" }
  }
  
  return { isValid: true }
}

export default function JSMinifierPage() {
  return (
    <TextToolLayout
      title="JavaScript Minifier"
      description="Compress JavaScript code while preserving functionality to optimize web performance. Remove comments, whitespace, and console statements."
      icon={FileCode}
      placeholder="Paste your JavaScript here..."
      outputPlaceholder="Minified JavaScript will appear here..."
      processFunction={processJavaScript}
      validateFunction={validateJavaScript}
      options={jsOptions}
      examples={jsExamples}
      fileExtensions={[".js", ".mjs"]}
    />
  )
}