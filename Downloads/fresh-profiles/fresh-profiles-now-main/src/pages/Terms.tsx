import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By using our service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                Our platform connects job seekers with recruiters by allowing:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Job seekers to post their professional profiles</li>
                <li>Recruiters to browse and contact potential candidates</li>
                <li>Direct communication through LinkedIn profiles</li>
                <li>Automatic profile expiration after 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Job Seekers:</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Provide accurate and truthful information</li>
                <li>Ensure your LinkedIn profile is accessible and up-to-date</li>
                <li>Understand that your profile will be publicly visible</li>
                <li>Accept that your profile will be automatically deleted after 30 days</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Recruiters:</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Use the platform for legitimate recruitment purposes only</li>
                <li>Respect candidate privacy and professional boundaries</li>
                <li>Do not misuse or spam candidate information</li>
                <li>Comply with applicable employment and privacy laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prohibited Uses</h2>
              <p className="text-gray-700 mb-4">You may not use our service to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to scrape or collect data</li>
                <li>Post inappropriate, offensive, or illegal content</li>
                <li>Impersonate another person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Profile Expiration</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-medium">
                  <strong>Important:</strong> All profiles automatically expire and are permanently deleted after 30 days from creation.
                </p>
              </div>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>No extensions or renewals are available</li>
                <li>Deleted data cannot be recovered</li>
                <li>You may create a new profile after expiration</li>
                <li>This policy ensures only active job seekers are visible</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                By posting your profile, you grant us a limited license to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Display your profile information on our platform</li>
                <li>Allow recruiters to view and contact you</li>
                <li>Store your data for the 30-day period</li>
                <li>Automatically delete your data after expiration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our <a href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</a> to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
              <p className="text-gray-700 mb-4">
                Our service is provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Job placement or employment opportunities</li>
                <li>Quality or accuracy of recruiter communications</li>
                <li>Continuous availability of the service</li>
                <li>Compatibility with all devices or browsers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700">
                We are not liable for any damages arising from your use of our service, including but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your access to our service at any time, with or without notice, for any reason, including violation of these terms.
              </p>
              <p className="text-gray-700">
                You may stop using our service at any time. Your profile will be automatically deleted after 30 days regardless of your continued use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. We will notify users of material changes by posting the updated terms on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:hello@refov.com" className="text-blue-600 hover:text-blue-700">hello@refov.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
