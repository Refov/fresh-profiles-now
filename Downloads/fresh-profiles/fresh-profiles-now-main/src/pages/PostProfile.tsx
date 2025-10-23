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
import { saveProfile } from "@/lib/supabaseProfiles";
import TagInput from "@/components/TagInput";

const PostProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [spamCheck, setSpamCheck] = useState("");
  const [lastSubmission, setLastSubmission] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    jobTitle: "",
    workModes: [] as Array<"onsite" | "hybrid" | "remote" | "fulltime" | "parttime" | "contract">,
    city: "",
    country: "",
    aboutMe: "",
    linkedinUrl: "",
    coreSkills: [] as string[],
    agreedToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting: prevent multiple submissions within 30 seconds
    const now = Date.now();
    if (lastSubmission && (now - lastSubmission) < 30000) {
      toast({
        title: "Please wait",
        description: "You can only submit one profile every 30 seconds",
        variant: "destructive",
      });
      return;
    }

    // Simple spam check: verify the user can read and type
    if (spamCheck.toLowerCase() !== "job") {
      toast({
        title: "Spam protection",
        description: "Please answer the question correctly",
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

    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.surname.trim()) {
      toast({
        title: "Surname required",
        description: "Please enter your surname",
        variant: "destructive",
      });
      return;
    }

    if (!formData.jobTitle.trim()) {
      toast({
        title: "Job title required",
        description: "Please enter your job title",
        variant: "destructive",
      });
      return;
    }

    if (formData.workModes.length === 0) {
      toast({
        title: "Work mode required",
        description: "Please select at least one work mode",
        variant: "destructive",
      });
      return;
    }

    // Check if at least one Employment Type is selected
    const employmentTypes = ["fulltime", "parttime", "contract"];
    const hasEmploymentType = formData.workModes.some(mode => employmentTypes.includes(mode));
    
    if (!hasEmploymentType) {
      toast({
        title: "Employment Type required",
        description: "Please select at least one employment type (Full Time, Part Time, or Contract)",
        variant: "destructive",
      });
      return;
    }

    if (!formData.city.trim()) {
      toast({
        title: "City required",
        description: "Please enter your city",
        variant: "destructive",
      });
      return;
    }

    if (!formData.country.trim()) {
      toast({
        title: "Country required",
        description: "Please enter your country",
        variant: "destructive",
      });
      return;
    }

    if (!formData.aboutMe.trim()) {
      toast({
        title: "About Me required",
        description: "Please tell us about yourself",
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

    if (formData.coreSkills.length === 0) {
      toast({
        title: "Skills required",
        description: "Please add at least one core skill",
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

    // LinkedIn URL validation is now handled in saveProfile function

    setIsSubmitting(true);
    setLastSubmission(now);

    try {
      const result = await saveProfile({
        name: formData.name,
        surname: formData.surname,
        job_title: formData.jobTitle,
        work_modes: formData.workModes,
        city: formData.city,
        country: formData.country,
        about_me: formData.aboutMe,
        linkedin_url: formData.linkedinUrl,
        core_skills: formData.coreSkills,
      });

      if (result.success) {
        toast({
          title: "Profile posted!",
          description: "Your profile is now visible to recruiters for 30 days",
        });
        navigate("/candidates");
      } else {
        toast({
          title: "Failed to post profile",
          description: result.error || "Please try again",
          variant: "destructive",
        });
      }
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
                <Label>Work Modes</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Location</h4>
                    {(["onsite","hybrid","remote"] as const).map(mode => (
                      <div key={mode} className="flex items-center space-x-2">
                        <Checkbox
                          id={`wm-${mode}`}
                          className="rounded-none"
                          checked={formData.workModes.includes(mode)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => {
                              const next = new Set(prev.workModes);
                              if (checked) next.add(mode); else next.delete(mode);
                              return { ...prev, workModes: Array.from(next) as Array<typeof mode> };
                            });
                          }}
                        />
                        <Label htmlFor={`wm-${mode}`} className="font-normal cursor-pointer capitalize">{mode}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Employment Type</h4>
                    {(["fulltime","parttime","contract"] as const).map(mode => (
                      <div key={mode} className="flex items-center space-x-2">
                        <Checkbox
                          id={`wm-${mode}`}
                          className="rounded-none"
                          checked={formData.workModes.includes(mode)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => {
                              const next = new Set(prev.workModes);
                              if (checked) next.add(mode); else next.delete(mode);
                              return { ...prev, workModes: Array.from(next) as Array<typeof mode> };
                            });
                          }}
                        />
                        <Label htmlFor={`wm-${mode}`} className="font-normal cursor-pointer capitalize">{mode === "fulltime" ? "Full Time" : mode === "parttime" ? "Part Time" : "Contract"}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Bratislava"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. Slovakia"
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
                  onChange={(skills) => {
                    console.log('PARENT onChange coreSkills:', skills);
                    setFormData({ ...formData, coreSkills: skills });
                  }}
                  maxTags={8}
                  placeholder="Type a skill and press Enter"
                />
                <div style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', background: '#f4f4f4', padding: 8, marginTop: 6 }}>
                  Current skills array: {JSON.stringify(formData.coreSkills, null, 2)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spamCheck">
                  Spam Protection: What are you looking for? (Answer: job)
                </Label>
                <Input
                  id="spamCheck"
                  placeholder="Type your answer here"
                  value={spamCheck}
                  onChange={(e) => setSpamCheck(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This helps us prevent automated spam submissions
                </p>
              </div>

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
