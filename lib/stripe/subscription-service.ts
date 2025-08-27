import { stripe } from "./config"
import { SUBSCRIPTION_PLANS, type PlanId } from "./plans"
import type Stripe from "stripe"

export class SubscriptionService {
  static async createCheckoutSession(userId: string, planId: PlanId, successUrl?: string, cancelUrl?: string) {
    const plan = SUBSCRIPTION_PLANS[planId]

    if (!plan.stripePriceId) {
      throw new Error(`Plan ${planId} does not have a Stripe price ID`)
    }

    // Mock customer for demo
    const customerId = `cus_demo_${userId}`

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId,
        planId,
      },
    })

    return session
  }

  static async createBillingPortalSession(userId: string, returnUrl?: string) {
    // Mock customer for demo
    const customerId = `cus_demo_${userId}`

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    })

    return session
  }

  static async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case "invoice.payment_succeeded":
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case "invoice.payment_failed":
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  }

  private static async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId
    const planId = session.metadata?.planId as PlanId

    if (!userId || !planId) {
      console.error("Missing metadata in checkout session", session.id)
      return
    }

    // Mock user plan update for demo
    console.log(`User ${userId} upgraded to ${planId}`)
  }

  private static async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log(`Subscription updated: ${subscription.id}`)
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    console.log(`Subscription deleted: ${subscription.id}`)
  }

  private static async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log(`Payment succeeded: ${invoice.id}`)
  }

  private static async handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log(`Payment failed: ${invoice.id}`)
  }
}