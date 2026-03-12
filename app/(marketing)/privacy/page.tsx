import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
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
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: December 2025</p>

          <div className="prose prose-stone max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              David Returns ("we," "our," or "us") provides last-mile return pickup and drop-off services for customers
              ("you"). We are committed to protecting your privacy and being transparent about how we collect, use, and
              safeguard your information. This Privacy Policy explains what data we collect, how we use it, and your
              rights regarding your personal information.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              By using our website, scheduling a pickup, or interacting with our services, you agree to the terms of
              this Privacy Policy.
            </p>

            {/* Section 1 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Information We Collect</h2>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">A. Information You Provide</h3>
              <p className="text-muted-foreground mb-3">
                When you use David Returns, you may provide us with the following information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Contact Information:</strong> name, email, phone number
                </li>
                <li>
                  <strong className="text-foreground">Pickup Details:</strong> pickup address, package details, return
                  location
                </li>
                <li>
                  <strong className="text-foreground">Account Information (optional):</strong> username, password,
                  membership status
                </li>
                <li>
                  <strong className="text-foreground">Payment Information:</strong> processed securely through our
                  payment partner (e.g., Stripe). We do not store full credit card numbers.
                </li>
                <li>
                  <strong className="text-foreground">Support Requests:</strong> messages or communications when you
                  contact us
                </li>
              </ul>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">B. Information Collected Automatically</h3>
              <p className="text-muted-foreground mb-3">
                When you visit our website or use our app, we may automatically collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Device information (browser, operating system)</li>
                <li>IP address</li>
                <li>Cookie and tracking data</li>
                <li>Usage data (pages visited, actions taken)</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                This helps us improve service performance and user experience.
              </p>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">C. Information from Third Parties</h3>
              <p className="text-muted-foreground mb-3">We may receive information from:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Payment processors (confirmation of payment or subscription status)</li>
                <li>Shipping carriers (UPS, USPS, FedEx) for package updates</li>
                <li>Analytics tools (Google Analytics or similar)</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide and manage pickup and return services</li>
                <li>Communicate updates (pickup confirmations, drop-off notices, reminders)</li>
                <li>Process payments and membership plans</li>
                <li>Improve our website, operations, and customer experience</li>
                <li>Detect and prevent fraud or misuse</li>
                <li>Respond to customer support inquiries</li>
              </ul>
              <p className="text-foreground font-medium mt-4">We do not sell your personal information.</p>
            </section>

            {/* Section 3 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Share Your Information</h2>
              <p className="text-muted-foreground mb-3">
                We may share your information only with trusted partners necessary to deliver our service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Shipping carriers (to complete your return)</li>
                <li>Payment processors (Stripe or similar)</li>
                <li>Service providers (SMS providers, email tools, analytics)</li>
                <li>Legal authorities if required by law</li>
              </ul>
              <p className="text-foreground font-medium mt-4">
                We do not share your data with advertisers or unrelated third parties.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground mb-3">
                We use reasonable administrative, technical, and physical safeguards to protect your information,
                including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Encrypted payment processing</li>
                <li>Secure data storage</li>
                <li>Limited employee access</li>
                <li>HTTPS encryption across our site</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                However, no method of transmission is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-3">Depending on your location, you may have rights to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access the personal information we hold</li>
                <li>Update or correct your information</li>
                <li>Request deletion of your data</li>
                <li>Opt out of promotional messages</li>
                <li>Disable cookies in your browser</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, contact us using the information below.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground mb-3">
                We retain your personal information only as long as necessary to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide our service</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Maintain business records</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You may request deletion of your account or data at any time.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Children's Privacy</h2>
              <p className="text-muted-foreground">
                David Returns does not knowingly collect personal information from children under 13. If we learn that
                we have collected such information, we will delete it promptly.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. When we make changes, we will update the "Last
                Updated" date at the top of the policy.
              </p>
              <p className="text-muted-foreground mt-4">
                Continued use of our service after changes means you accept the updated policy.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or want to make a privacy-related request, you can
                contact us at:
              </p>
              <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
                <p className="font-semibold text-foreground">David Returns</p>
                <p className="text-muted-foreground mt-2">
                  Email:{" "}
                  <a href="mailto:hello@davidreturns.com" className="text-orange-500 hover:underline">
                    hello@davidreturns.com
                  </a>
                </p>
                <p className="text-muted-foreground mt-1">Location: New York, NY</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PrivacyPolicyPage
