import { type NextRequest, NextResponse } from "next/server"
import { SubscriptionService } from "@/lib/stripe/subscription-service"

export async function POST(request: NextRequest) {
  try {
    // Mock user session for demo
    const userId = "demo-user-id"

    const { returnUrl } = await request.json()

    const portalSession = await SubscriptionService.createBillingPortalSession(userId, returnUrl)

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Portal error:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
