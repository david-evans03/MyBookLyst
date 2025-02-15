import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-cyan-200 title-glow text-center">Privacy Policy</h1>
      
      <div className="space-y-8 text-gray-200">
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-100">Introduction</h2>
          <p className="mb-4">
            Welcome to MyBookLyst. We respect your privacy and are committed to protecting your personal data.
            This privacy policy explains how we collect, use, and safeguard your information when you use our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-100">Information We Collect</h2>
          <div className="space-y-4">
            <p>We collect several types of information for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium">Personal Information:</span>
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>Email address (when you sign in with Google)</li>
                  <li>Name associated with your Google account</li>
                  <li>Profile picture (if provided through Google)</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Usage Information:</span>
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>Books you add to your lists</li>
                  <li>Reading status and progress</li>
                  <li>Ratings and reviews you provide</li>
                  <li>Search history within the application</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-100">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our service</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-100">Data Storage and Security</h2>
          <p className="mb-4">
            We use Firebase, a Google Cloud platform, to store and process your data. Your information is protected by:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure data encryption in transit and at rest</li>
            <li>Regular security audits and monitoring</li>
            <li>Access controls and authentication mechanisms</li>
            <li>Compliance with industry security standards</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-100">Third-Party Services</h2>
          <p className="mb-4">We use the following third-party services:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">Google Authentication:</span> For user sign-in and account management
            </li>
            <li>
              <span className="font-medium">Firebase:</span> For data storage and hosting
            </li>
            <li>
              <span className="font-medium">Google Books API:</span> For book information and search functionality
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-100">Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct any inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-100">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:{' '}
            <Link href="mailto:privacy@mybooklyst.com" className="text-cyan-400 hover:text-cyan-300">
              devans3335@gmail.com
            </Link>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-cyan-100">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
          </p>
        </section>

        <footer className="text-sm text-gray-400 pt-8">
          Last updated: {new Date().toLocaleDateString()}
        </footer>
      </div>
    </div>
  );
} 