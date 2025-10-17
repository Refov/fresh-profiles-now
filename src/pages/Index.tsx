import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Briefcase } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Fresh candidates only
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Updated every 30 days. No accounts. Post in 60 seconds.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Button
              size="lg"
              onClick={() => navigate("/post")}
              className="h-auto py-8 flex flex-col gap-3 bg-gradient-to-br from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
            >
              <Briefcase className="w-8 h-8" />
              <div>
                <div className="text-xl font-semibold">Job Seeker</div>
                <div className="text-sm opacity-90 font-normal">Post your profile</div>
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/candidates")}
              className="h-auto py-8 flex flex-col gap-3 border-2 hover:bg-secondary transition-colors"
            >
              <Users className="w-8 h-8" />
              <div>
                <div className="text-xl font-semibold">Recruiter</div>
                <div className="text-sm text-muted-foreground font-normal">Browse candidates</div>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
