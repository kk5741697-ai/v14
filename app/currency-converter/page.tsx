"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, ArrowUpDown, Copy, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const currencies = {
  USD: { name: "US Dollar", symbol: "$", rate: 1 },
  EUR: { name: "Euro", symbol: "€", rate: 0.85 },
  GBP: { name: "British Pound", symbol: "£", rate: 0.73 },
  JPY: { name: "Japanese Yen", symbol: "¥", rate: 110 },
  CAD: { name: "Canadian Dollar", symbol: "C$", rate: 1.25 },
  AUD: { name: "Australian Dollar", symbol: "A$", rate: 1.35 },
  CHF: { name: "Swiss Franc", symbol: "CHF", rate: 0.92 },
  CNY: { name: "Chinese Yuan", symbol: "¥", rate: 6.45 },
  INR: { name: "Indian Rupee", symbol: "₹", rate: 74.5 },
  BRL: { name: "Brazilian Real", symbol: "R$", rate: 5.2 },
  RUB: { name: "Russian Ruble", symbol: "₽", rate: 73.5 },
  KRW: { name: "South Korean Won", symbol: "₩", rate: 1180 },
  SGD: { name: "Singapore Dollar", symbol: "S$", rate: 1.35 },
  HKD: { name: "Hong Kong Dollar", symbol: "HK$", rate: 7.8 },
  NOK: { name: "Norwegian Krone", symbol: "kr", rate: 8.5 },
  SEK: { name: "Swedish Krona", symbol: "kr", rate: 8.7 },
  DKK: { name: "Danish Krone", symbol: "kr", rate: 6.3 },
  PLN: { name: "Polish Zloty", symbol: "zł", rate: 3.9 },
  CZK: { name: "Czech Koruna", symbol: "Kč", rate: 21.5 },
  HUF: { name: "Hungarian Forint", symbol: "Ft", rate: 295 }
}

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState("100")
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [result, setResult] = useState("")
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    convertCurrency()
  }, [amount, fromCurrency, toCurrency])

  const convertCurrency = () => {
    const value = parseFloat(amount)
    if (isNaN(value)) {
      setResult("")
      return
    }

    const fromRate = currencies[fromCurrency as keyof typeof currencies].rate
    const toRate = currencies[toCurrency as keyof typeof currencies].rate
    
    // Convert to USD first, then to target currency
    const usdAmount = value / fromRate
    const convertedAmount = usdAmount * toRate
    
    setResult(convertedAmount.toFixed(2))
  }

  const swapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const copyResult = () => {
    const fullResult = `${amount} ${fromCurrency} = ${result} ${toCurrency}`
    navigator.clipboard.writeText(fullResult)
    toast({
      title: "Copied to clipboard",
      description: "Conversion result copied"
    })
  }

  const getExchangeRate = () => {
    const fromRate = currencies[fromCurrency as keyof typeof currencies].rate
    const toRate = currencies[toCurrency as keyof typeof currencies].rate
    return (toRate / fromRate).toFixed(6)
  }

  const popularPairs = [
    { from: "USD", to: "EUR" },
    { from: "USD", to: "GBP" },
    { from: "USD", to: "JPY" },
    { from: "EUR", to: "GBP" },
    { from: "GBP", to: "USD" },
    { from: "USD", to: "CAD" }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <DollarSign className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-heading font-bold text-foreground">Currency Converter</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert between world currencies with real-time exchange rates and historical data. Perfect for travel and international business.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Converter */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Conversion</CardTitle>
              <CardDescription>Enter amount and select currencies to convert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="text-lg"
                  step="0.01"
                />
              </div>

              {/* Currency Selection */}
              <div className="grid grid-cols-5 gap-4 items-end">
                <div className="col-span-2">
                  <Label htmlFor="from-currency">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, currency]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{code}</span>
                            <span>{currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" size="icon" onClick={swapCurrencies}>
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="to-currency">To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies).map(([code, currency]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{code}</span>
                            <span>{currency.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Result */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Converted Amount</div>
                  <div className="text-3xl font-bold font-mono">
                    {currencies[toCurrency as keyof typeof currencies].symbol}{result || "0.00"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {amount} {fromCurrency} = {result} {toCurrency}
                  </div>
                  <Button variant="outline" size="sm" onClick={copyResult} disabled={!result} className="mt-3">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Result
                  </Button>
                </div>
              </div>

              {/* Exchange Rate Info */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Exchange Rate</div>
                    <div className="text-xs text-muted-foreground">
                      1 {fromCurrency} = {getExchangeRate()} {toCurrency}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-xs text-muted-foreground">
                      {lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Currency Pairs */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Currency Pairs</CardTitle>
              <CardDescription>Quick access to commonly converted currencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {popularPairs.map((pair, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => {
                      setFromCurrency(pair.from)
                      setToCurrency(pair.to)
                    }}
                    className="h-auto p-3 text-left justify-start"
                  >
                    <div>
                      <div className="font-medium">{pair.from} → {pair.to}</div>
                      <div className="text-xs text-muted-foreground">
                        1 {pair.from} = {(currencies[pair.to as keyof typeof currencies].rate / currencies[pair.from as keyof typeof currencies].rate).toFixed(4)} {pair.to}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Exchange Rate Disclaimer</p>
                  <p>
                    Exchange rates are for demonstration purposes only and may not reflect current market rates. 
                    For actual financial transactions, please consult your bank or financial institution for 
                    real-time exchange rates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}