import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-20 text-white">
      <h1 className="text-3xl md:text-4xl font-semibold mb-6">
        Privacy Policy for Azlo TV
      </h1>
      <p className="text-sm mb-8">Effective Date : 6/26/2025</p>

      <p className="mb-6">
        Azlo TV (&quot;Azlo&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy. This
        Privacy Policy outlines how we collect, use, disclose, and safeguard
        your personal information when you use our mobile and web-based streaming
        services.
      </p>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
        <p>We may collect the following types of personal and usage data:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Account Information: Name, email address, password, billing address.</li>
          <li>Payment Details: We use secure third-party providers to process payments.</li>
          <li>Device Information: IP address, device ID, operating system, browser type.</li>
          <li>Viewing Activity: Watch history, clicks, search terms, in-app behavior.</li>
          <li>
            Location (if enabled): Approximate or precise location to recommend
            content.
          </li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Operate and improve the Azlo TV app</li>
          <li>Deliver personalized content and recommendations</li>
          <li>Process payments and manage subscriptions</li>
          <li>Communicate with you (account updates, support, promotional messages)</li>
          <li>Monitor usage and prevent fraud</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">3. Sharing Your Information</h2>
        <p>We do not sell your data. We may share information with:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Service Providers (e.g., payment processors, cloud storage, analytics)</li>
          <li>Law Enforcement (if required by law)</li>
          <li>Business Transfers (e.g., merger or acquisition)</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
        <p>
          Azlo TV may use third-party tools that collect information independently, such as:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Payment processors (e.g., Stripe, Apple Pay)</li>
          <li>Analytics providers (e.g., Google Firebase)</li>
          <li>Ad networks (if applicable)</li>
        </ul>
        <p>These services are subject to their own privacy policies.</p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">5. Your Rights and Choices</h2>
        <p>You have the right to:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Access, correct, or delete your personal information</li>
          <li>Deactivate your account at any time</li>
          <li>Opt-out of promotional emails via the unsubscribe link</li>
          <li>Control tracking permissions via your device settings</li>
        </ul>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">6. Security Measures</h2>
        <p>
          We use industry-standard encryption and access controls to protect your
          data. While no system is 100% secure, we take all reasonable steps to
          safeguard your information.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">7. Children&quot;s Privacy</h2>
        <p>
          Azlo TV is not intended for children under 13. We do not knowingly
          collect data from children. If we become aware of such data, we will
          delete it.
        </p>
      </section>

      <section className="space-y-4 mb-8">
        <h2 className="text-2xl font-semibold">8. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. When we do, we
          will notify you via app or email and update the &quot;Effective Date.&quot;
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Contact Us</h2>
        <p>For questions about this Privacy Policy or your data:</p>
        <p className="font-medium">Azlo TV</p>
        <p>
          📧 Email:{" "}
          <a
            href="https://www.azlotv.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-300 transition-colors"
          >
            https://www.azlotv.com
          </a>
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
