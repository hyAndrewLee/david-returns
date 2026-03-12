import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service | David Returns",
  description:
    "Terms of Service for David Returns - Read our terms and conditions for using our return pickup services.",
}

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/david-returns-logo.png"
              alt="David Returns"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: December 2025</p>

          <div className="prose prose-stone max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-8">
              Welcome to David Returns ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to
              and use of our website and return-pickup services ("Services"). By creating an account, scheduling a
              pickup, purchasing a membership, or using our website, you agree to these Terms.
            </p>
            <p className="font-medium mb-8">Please read them carefully.</p>

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Overview of Our Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                David Returns provides last-mile return pickup and drop-off services. We pick up packages from customers
                and deliver them to designated carrier or retail return locations (including UPS, USPS, FedEx, Amazon
                return centers, or retailer stores).
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>We are not the merchant, carrier, or retailer associated with the return.</li>
                <li>We facilitate the pickup and drop-off process on your behalf.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">To use our Services, you must:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Be at least 18 years old</li>
                <li>Have the authority to schedule returns for the package being shipped</li>
                <li>Create an account to access and use the service</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Accounts and Memberships</h2>

              <h3 className="text-lg font-medium mb-3">A. Required Accounts</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You must create an account to schedule any pickup or use the David Returns platform. This allows us to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Track your pickup history</li>
                <li>Deliver status updates</li>
                <li>Manage billing</li>
                <li>Provide customer support</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">B. Membership Plans</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Memberships include benefits such as unlimited pickups and additional services as described on our
                website. Key membership terms:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Memberships are billed monthly</li>
                <li>Memberships renew automatically</li>
                <li>Membership benefits apply as long as the membership is active</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">C. Canceling Memberships</h3>
              <p className="text-muted-foreground leading-relaxed">
                You may cancel your membership anytime through your account settings or by contacting support.
                Cancellation stops future billing but does not refund previous monthly charges unless required by law.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Your Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">By using David Returns, you agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Ensure packages are properly labeled for the correct retailer or carrier</li>
                <li>Provide accurate return information (QR code, prepaid label, store return instructions)</li>
                <li>Ensure pickup locations are safe and accessible</li>
                <li>Comply with retailer and carrier restrictions (no hazardous materials, weight limits, etc.)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We are not responsible for issues caused by incorrect labels, missing return info, wrong return
                destinations, or inaccessible pickup locations.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Our Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We will make reasonable efforts to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Arrive within the selected pickup window</li>
                <li>Handle your package safely during transport</li>
                <li>Deliver your package to the return location you provided</li>
                <li>Send pickup and drop-off confirmations via text/email</li>
                <li>Provide support for service-related issues</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We cannot guarantee retailer acceptance, carrier processing times, or refund outcomes.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Service Limitations</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                David Returns is currently available only in New York City. We may refuse or cancel a pickup if:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>The location is inaccessible or unsafe</li>
                <li>The package is improperly labeled</li>
                <li>The item violates retailer/carrier guidelines</li>
                <li>The package appears hazardous or prohibited</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Payments and Billing</h2>

              <h3 className="text-lg font-medium mb-3">A. Standard Pricing</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pickup fees for non-members are listed on our website and may include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Base pickup fee</li>
                <li>Additional package fees</li>
                <li>Instant pickup surcharge</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">B. Membership Billing</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">Memberships are:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Billed monthly</li>
                <li>Auto-renewing unless canceled</li>
                <li>Charged to the payment method on file</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">C. Refunds</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fees are generally non-refundable, unless a pickup was not completed due to our error, or refunds are
                required by applicable law.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Package Handling & Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We handle packages with care, but:</p>

              <h3 className="text-lg font-medium mb-3">A. No Insurance</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                David Returns does not insure packages and does not cover the value of items being returned.
              </p>

              <h3 className="text-lg font-medium mb-3">B. Limited Liability</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To the fullest extent permitted by law, our liability is limited to the amount you paid for the pickup
                in question. We are not responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
                <li>Lost or damaged items after transfer to the retailer or carrier</li>
                <li>Incorrect labels, missing QR codes, or wrong return instructions</li>
                <li>Retailer decisions regarding refunds, exchanges, or denials</li>
                <li>Items improperly packaged by the user</li>
              </ul>

              <h3 className="text-lg font-medium mb-3">C. Transfer of Custody</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Liability transfers to the retailer or carrier once a package is dropped off.
              </p>

              <h3 className="text-lg font-medium mb-3">D. Product Condition Disclaimer</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our responsibility is limited to transporting your package to the designated drop-off location. We are not responsible for any pre-existing damage to products, defects, or the condition of items prior to pickup. David Returns does not inspect, verify, or guarantee the condition of items being returned. Any damage claims must be directed to the original retailer or carrier.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Communications</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By creating an account, you agree to receive:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Service-related SMS/email updates</li>
                <li>Pickup and drop-off confirmations</li>
                <li>Account or billing notices</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You may opt out of promotional messages at any time.
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Service Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update pricing, features, or service areas at any time. We will provide notice of significant
                changes through our website or by email.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You may not use our Services to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Ship hazardous, illegal, or prohibited items</li>
                <li>Submit fraudulent returns</li>
                <li>Provide false information</li>
                <li>Interfere with or misuse our systems or staff</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">12. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate your access if you violate these Terms or misuse our Services. You may close
                your account at any time through account settings or by contacting support.
              </p>
            </section>

            {/* Section 13 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">13. Disclaimers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Services are provided on an "as is" and "as available" basis. We do not guarantee uninterrupted
                service, perfect timing, or outcome of retailer/carrier processes.
              </p>
            </section>

            {/* Section 14 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">14. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of the State of New York.
              </p>
            </section>

            {/* Section 15 - Contact */}
            <section className="mb-4">
              <h2 className="text-xl font-semibold mb-4">15. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms, contact us at:
              </p>
              <div className="bg-stone-50 rounded-xl p-6 border">
                <p className="font-semibold mb-2">David Returns</p>
                <p className="text-muted-foreground">
                  Email:{" "}
                  <a href="mailto:hello@davidreturns.com" className="text-orange-500 hover:underline">
                    hello@davidreturns.com
                  </a>
                </p>
                <p className="text-muted-foreground">Location: New York, NY</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TermsPage
