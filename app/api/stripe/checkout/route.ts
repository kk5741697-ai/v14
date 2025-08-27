import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionService } from "@/lib/stripe/subscription-service"

export async function POST(request: NextRequest) {
  try {
    // Mock user session for demo
    const userId = "demo-user-id"

    const { planId, successUrl, cancelUrl } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    const checkoutSession = await SubscriptionService.createCheckoutSession(
      userId,
      planId,
      successUrl,
      cancelUrl,
    )

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
