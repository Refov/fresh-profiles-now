import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
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
                <p className="text-gray-600">Connect directly via LinkedIn, no middleman</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
