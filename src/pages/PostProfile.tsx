import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TagInput from "@/components/TagInput";
import TurnstileWidget from "@/components/TurnstileWidget";

const PostProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    jobTitle: "",
    workMode: "remote" as "onsite_hybrid" | "remote",
    city: "",
    country: "",
    aboutMe: "",
    linkedinUrl: "",
    coreSkills: [] as string[],
    agreedToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      toast({
        title: "Verification required",
        description: "Please complete the CAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreedToTerms) {
      toast({
        title: "Agreement required",
        description: "Please agree to the terms and privacy policy",
        variant: "destructive",
      });
      return;
    }

    if (formData.workMode === "onsite_hybrid" && !formData.city) {
      toast({
        title: "City required",
        description: "Please enter a city for onsite/hybrid work",
        variant: "destructive",
      });
      return;
    }

    if (formData.aboutMe.length > 600) {
      toast({
        title: "About Me too long",
        description: "Please keep your About Me under 600 characters",
        variant: "destructive",
      });
      return;
    }

    if (formData.coreSkills.length > 8) {
      toast({
        title: "Too many skills",
        description: "Please select up to 8 core skills",
        variant: "destructive",
      });
      return;
    }

    if (!formData.linkedinUrl.includes("linkedin.com")) {
      toast({
        title: "Invalid LinkedIn URL",
        description: "Please enter a valid LinkedIn profile URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check rate limit and insert profile via edge function
      const { data, error } = await supabase.functions.invoke("submit-profile", {
        body: {
          profile: {
            name: formData.name,
            surname: formData.surname,
            job_title: formData.jobTitle,
            work_mode: formData.workMode,
            city: formData.workMode === "onsite_hybrid" ? formData.city : null,
            country: formData.country,
            about_me: formData.aboutMe,
            linkedin_url: formData.linkedinUrl,
            core_skills: formData.coreSkills,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          turnstileToken,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile posted!",
        description: "Your profile will be visible for 30 days",
      });

      navigate("/candidates");
    } catch (error: any) {
      toast({
        title: "Failed to post profile",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Post Your Profile</CardTitle>
            <CardDescription>
              Your profile will be visible for 30 days and then automatically deleted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input
                    id="surname"
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  required
                  placeholder="e.g. Frontend Developer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Work Mode</Label>
                <RadioGroup
                  value={formData.workMode}
                  onValueChange={(value: "onsite_hybrid" | "remote") =>
                    setFormData({ ...formData, workMode: value })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="onsite_hybrid" id="onsite" />
                    <Label htmlFor="onsite" className="font-normal cursor-pointer">
                      Onsite/Hybrid
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remote" id="remote" />
                    <Label htmlFor="remote" className="font-normal cursor-pointer">
                      Remote
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.workMode === "onsite_hybrid" && (
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aboutMe">
                  About Me ({formData.aboutMe.length}/600 characters)
                </Label>
                <Textarea
                  id="aboutMe"
                  required
                  rows={6}
                  maxLength={600}
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  placeholder="Tell recruiters about your experience and what you're looking for..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  required
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Core Skills (max 8)</Label>
                <TagInput
                  value={formData.coreSkills}
                  onChange={(skills) => setFormData({ ...formData, coreSkills: skills })}
                  maxTags={8}
                  placeholder="Type a skill and press Enter"
                />
              </div>

              <TurnstileWidget onVerify={setTurnstileToken} />

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, agreedToTerms: checked as boolean })
                  }
                />
                <Label htmlFor="terms" className="font-normal leading-relaxed cursor-pointer">
                  I agree to list this data for 30 days and accept the privacy policy
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostProfile;
