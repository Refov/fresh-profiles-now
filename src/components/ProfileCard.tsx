import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    surname: string;
    job_title: string;
    work_modes: Array<"onsite" | "hybrid" | "remote" | "fulltime" | "parttime" | "contract">;
    city: string | null;
    country: string;
    about_me: string;
    linkedin_url: string;
    core_skills: string[];
    created_at: string;
  };
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const { toast } = useToast();
  const [revealed, setRevealed] = useState(false);

  const getDaysAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    return days === 0 ? "today" : `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      toast({ title: "LinkedIn revealed", description: "Click again to open" });
      return;
    }
    
    // Ensure LinkedIn URL has proper protocol
    let linkedinUrl = profile.linkedin_url;
    if (!linkedinUrl.startsWith('http://') && !linkedinUrl.startsWith('https://')) {
      linkedinUrl = 'https://' + linkedinUrl;
    }
    
    window.open(linkedinUrl, "_blank");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">
              {profile.name} {profile.surname}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Briefcase className="w-4 h-4" />
              {profile.job_title}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.work_modes.map((m) => {
              const getDisplayText = (mode: string) => {
                switch (mode) {
                  case "onsite": return "Onsite";
                  case "hybrid": return "Hybrid";
                  case "remote": return "Remote";
                  case "fulltime": return "Full Time";
                  case "parttime": return "Part Time";
                  case "contract": return "Contract";
                  default: return mode.charAt(0).toUpperCase() + mode.slice(1);
                }
              };
              
              const getBadgeVariant = (mode: string) => {
                if (["onsite", "hybrid", "remote"].includes(mode)) return "secondary";
                if (["fulltime", "parttime", "contract"].includes(mode)) return "outline";
                return "secondary";
              };
              
              return (
                <Badge key={m} variant={getBadgeVariant(m)}>
                  {getDisplayText(m)}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          {profile.city ? `${profile.city}, ${profile.country}` : profile.country}
        </div>

        <p className="text-sm mb-4 line-clamp-3">{profile.about_me.slice(0, 200)}...</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {profile.core_skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">Posted {getDaysAgo(profile.created_at)}</p>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          onClick={handleReveal}
          className="w-full"
          variant={revealed ? "default" : "outline"}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {revealed ? "Open LinkedIn Profile" : "Reveal LinkedIn"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileCard;
