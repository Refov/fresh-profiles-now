import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase } from "lucide-react";
import { SEO } from "@/components/SEO";

const Index = () => {
  const navigate = useNavigate();

  // AI-optimized structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Fresh Profiles Now",
    "alternateName": "Refov",
    "url": "https://refov.com",
    "description": "The fastest way to connect job seekers with employers. Post your professional profile in 60 seconds or browse fresh candidates. No account required. Profiles auto-expire every 30 days ensuring fresh, active talent.",
    "keywords": "job search platform, hire developers, tech recruitment, post job profile, find candidates, no signup job board, fresh profiles, active job seekers",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://refov.com/candidates?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Fresh Profiles Now",
      "url": "https://refov.com"
    },
    "mainEntity": {
      "@type": "Service",
      "name": "Job Seeker & Employer Matching Platform",
      "description": "Free platform connecting job seekers with employers. Features: instant profile posting, advanced candidate filtering by skills and location, no account required, 30-day active profiles.",
      "provider": {
        "@type": "Organization",
        "name": "Fresh Profiles Now"
      },
      "serviceType": "Job Recruitment Platform",
      "areaServed": "Worldwide",
      "audience": {
        "@type": "Audience",
        "audienceType": ["Job Seekers", "Recruiters", "Employers", "HR Professionals"]
      }
    }
  };

  return (
    <>
      <SEO 
        title="Find Your Next Job or Hire - Fresh Profiles Now"
        description="The fastest job search platform. Job seekers: post your profile in 60 seconds. Recruiters: browse fresh candidates updated daily. No signup required. Free for both sides."
        keywords="job search, hire developers, tech recruitment, post job profile, find candidates, no signup job board, free job posting, active job seekers, fresh candidates, quick hire"
        canonicalUrl="https://refov.com"
        schemaData={schemaData}
      />
      
      <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Find Your Next
              <span className="block text-blue-600">Job or Hire</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              Connect talented professionals with great opportunities
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Fresh profiles • No accounts required • Auto-expires every 30 days
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Job Seeker Card */}
            <div 
              onClick={() => navigate("/post")}
              className="group cursor-pointer bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold">Post Your Profile</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Get discovered by recruiters in 60 seconds
                </p>
                <div className="pt-4">
                  <span className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full text-sm font-medium group-hover:bg-white/30 transition-colors">
                    Start Now →
                  </span>
                </div>
              </div>
            </div>

            {/* Recruiter Card */}
            <div 
              onClick={() => navigate("/candidates")}
              className="group cursor-pointer bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Find Candidates</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Browse fresh, active talent
                </p>
                <div className="pt-4">
                  <span className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-medium group-hover:bg-blue-700 transition-colors">
                    Browse Now →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Why Choose Us?</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Setup</h3>
                <p className="text-gray-600">Post your profile in 60 seconds, no signup required</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔄</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Always Fresh</h3>
                <p className="text-gray-600">Profiles auto-expire every 30 days, no outdated listings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Contact</h3>
                <p className="text-gray-600">Send directly to candidates' mailboxes</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-12 border-t border-gray-200">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Questions? Contact us at <a href="mailto:hello@refov.com" className="text-blue-600 hover:text-blue-700 font-medium">hello@refov.com</a>
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <a href="/privacy" className="text-gray-500 hover:text-gray-700">Privacy Policy</a>
                <a href="/terms" className="text-gray-500 hover:text-gray-700">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default Index;
