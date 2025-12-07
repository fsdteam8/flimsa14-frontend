import React from "react";

const TermsAndConditionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-white">
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">
        Azlo TV – Terms and Conditions for Subscribers
      </h1>
      <p className="text-sm mb-8">Effective Date: 6/26/2025</p>

      <p className="mb-6">
        Welcome to Azlo TV! These Terms and Conditions (&ldquo;Terms&ldquo;) apply to your
        use of the Azlo TV app and subscription services (&ldquo;Service&ldquo;) operated by
        Azlo TV (&ldquo;Azlo&ldquo;, &ldquo;we&ldquo;, &ldquo;us&ldquo;, or &ldquo;our&ldquo;). By creating an account,
        subscribing, or using the Service, you agree to these Terms.
      </p>

      {/* Section 1 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">1. Eligibility</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Be at least 13 years old (with parental consent if under 18)</li>
          <li>Have the legal capacity to enter a binding agreement</li>
          <li>Use the Service for personal, non-commercial use only</li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">2. Subscriptions & Billing</h2>

        <h3 className="text-xl font-medium">a. Subscription Plans</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Azlo TV offers subscription plans with different pricing and features, including:</li>
          <ul className="list-disc list-inside ml-6 space-y-1">
            <li>Ad-supported and ad-free options</li>
            <li>Monthly or annual billing</li>
            <li>Details available in-app or on our website</li>
          </ul>
        </ul>

        <h3 className="text-xl font-medium">b. Payments</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>
            All payments are processed through Apple App Store, Google Play Store,
            or our secure third-party provider.
          </li>
          <li>
            By subscribing, you authorize recurring charges according to your
            selected plan.
          </li>
          <li>
            You are responsible for any taxes or fees imposed by your location.
          </li>
        </ul>

        <h3 className="text-xl font-medium">c. Renewals & Cancellations</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>Subscriptions auto-renew unless canceled 24 hours before the next billing cycle.</li>
          <li>Cancel anytime through App Store or Google Play settings.</li>
          <li>
            No refunds for partial months, unused periods, or downgrades (unless legally required).
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">3. Your Account</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Provide accurate, up-to-date info.</li>
          <li>Keep your login credentials secure.</li>
          <li>Do not share your account or exceed stream limits.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">4. Use of the Service</h2>
        <p>You may:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Stream Azlo TV for personal use</li>
          <li>Access content based on your plan & location</li>
        </ul>

        <p>You may not:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Record, reproduce, or redistribute content</li>
          <li>Circumvent geo-restrictions or security</li>
          <li>Use for commercial/public screening</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">5. Content Availability</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Content may change or be removed at any time.</li>
          <li>Some content is geo-restricted.</li>
          <li>Offline viewing may be limited or expire.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">6. Modifications & Termination</h2>
        <p>We may:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Update pricing/features (with notice)</li>
          <li>Suspend or terminate access for violations</li>
          <li>Discontinue service (with notice)</li>
        </ul>
        <p>You may cancel anytime via your app store.</p>
      </section>

      {/* Section 7 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">7. Intellectual Property</h2>
        <p>
          All Azlo TV content, logos, and software are protected. You&ldquo;re granted a
          limited, non-transferable license to use the Service under these Terms.
        </p>
      </section>

      {/* Section 8 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">8. Disclaimers</h2>
        <p>Azlo TV is provided &ldquo;as is&ldquo; and &ldquo;as available.&ldquo; We do not guarantee:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Uninterrupted or error-free service</li>
          <li>That content meets all expectations</li>
          <li>Feature availability at all times</li>
        </ul>
      </section>

      {/* Section 9 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">9. Limitation of Liability</h2>
        <p>
          To the extent permitted by law, Azlo TV and affiliates are not liable for:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Indirect, incidental, or consequential damages</li>
          <li>Loss of data, content, or subscriptions from issues</li>
        </ul>
      </section>

      {/* Section 10 */}
      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">10. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the State of [Your State],
          U.S.A.
        </p>
      </section>

      {/* Section 11 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">11. Contact Us</h2>
        <p>📧 Email : 
          <a
            href="mailto:team@azlotv.com"
            rel="noopener noreferrer"
            className="hover:underline hover:text-gray-300 transition-colors pl-1"
          >
              team@azlotv.com
          </a>
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditionsPage;
