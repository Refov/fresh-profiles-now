import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Fresh Profiles Now privacy policy. Learn how we collect, use, and protect your data. No accounts, minimal data collection, 30-day auto-deletion."
        canonicalUrl="https://refov.com/privacy"
      />
      
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                We collect only the information you voluntarily provide when creating your profile:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Name and surname</li>
                <li>Job title and work preferences</li>
                <li>Location (city and country)</li>
                <li>Professional summary (about me)</li>
                <li>Core skills</li>
                <li>LinkedIn profile URL</li>
                <li>
                  <strong>Candidate email address</strong> (kept private and used only to deliver recruiter messages through our site; never displayed publicly)
                </li>
                <li>Profile creation timestamp</li>
              </ul>
              <p className="text-gray-700 mt-3">
                We <strong>do not collect or store recruiter email addresses</strong>. When a recruiter contacts a candidate, the recruiter email is used only transiently to set the <em>Reply‑To</em> header and is not retained by us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">
                Your information is used solely to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Display your profile to recruiters and potential employers</li>
                <li>Enable direct contact through your LinkedIn profile</li>
                <li>
                  Deliver messages from recruiters to your private email address via our contact form (your email is not shown; we forward the message and set the recruiter email as Reply‑To)
                </li>
                <li>Filter and search functionality for recruiters</li>
                <li>Automatically manage profile expiration</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Retention and Automatic Deletion</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 font-medium">
                  <strong>Important:</strong> Your profile and all associated data (including the candidate email address) will be automatically and permanently deleted after 30 days from the date of creation.
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                This automatic deletion ensures:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Only active job seekers are visible to recruiters</li>
                <li>Your data is not stored indefinitely</li>
                <li>Compliance with data minimization principles</li>
                <li>No outdated or stale profiles remain in our system</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing</h2>
              <p className="text-gray-700 mb-4">
                Your profile information is:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Publicly visible to all visitors of our platform</li>
                <li>Accessible to recruiters and potential employers</li>
                <li>Not sold to third parties</li>
                <li>Not shared with marketing companies</li>
                <li>Not used for advertising purposes</li>
                <li>
                  <strong>Candidate email addresses are never displayed publicly or shared</strong>; they are used only to forward recruiter messages initiated on our site.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Your Rights (GDPR Compliance)</h2>
              <p className="text-gray-700 mb-4">
                Under GDPR and other applicable privacy laws, you have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your data</li>
                <li><strong>Rectification:</strong> Correct inaccurate information</li>
                <li><strong>Erasure:</strong> Request immediate deletion of your profile</li>
                <li><strong>Portability:</strong> Export your data in a structured format</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
              </ul>
              <p className="text-gray-700 mt-4">
                To exercise these rights, contact us at <a href="mailto:hello@refov.com" className="text-blue-600 hover:text-blue-700">hello@refov.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Secure cloud hosting with industry-standard encryption</li>
                <li>Regular security updates and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Data backup and recovery procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Supabase:</strong> Database hosting and management, including server-side functions used to relay recruiter messages to candidates without exposing emails.</li>
                <li><strong>LinkedIn:</strong> External profile links (we do not control LinkedIn's privacy practices)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We do not use cookies or tracking technologies. We do not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Track your browsing behavior</li>
                <li>Use analytics or advertising cookies</li>
                <li>Collect device or browser information</li>
                <li>Monitor your activity on other websites</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our service is not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page with an updated "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy or our data practices, please contact us at:
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
    </>
  );
};

export default Privacy;
