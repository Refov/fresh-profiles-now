import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TagInput from "@/components/TagInput";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Search, MapPin, Briefcase, ExternalLink } from "lucide-react";
import { getProfiles, ProfileFilters, ProfileResult } from "@/lib/supabaseProfiles";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/lib/supabase";

const Candidates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    jobTitle: "",
    skills: [] as string[],
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [total, setTotal] = useState(0);
  const ITEMS_PER_PAGE = 20;

  const getDaysAgo = (iso: string) => {
    const created = new Date(iso).getTime();
    if (!isFinite(created)) return "";
    const days = Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
    return days === 0 ? "today" : `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const fetchProfiles = async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 1 : page;
    // New: trim and lowercase the filters
    const trimmedCity = filters.city.trim();
    const trimmedCountry = filters.country.trim();
    const trimmedTitle = filters.jobTitle.trim();
    try {
      const profileFilters: ProfileFilters = {
        city: trimmedCity || undefined,
        country: trimmedCountry || undefined,
        // Remove skills from backend for client filtering
        // skills: filters.skills.length > 0 ? filters.skills : undefined,
        search: trimmedTitle || undefined,
      };
      const result = await getProfiles(profileFilters, {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      let filteredProfiles = result.profiles;
      // Client-side filtering by skills (if skills provided)
      if (filters.skills.length > 0) {
        // Preprocess: remove spaces, punctuation, lowercase, and filter for nonempty skill queries
        const clean = (str: string) => str.replace(/\s+/g, '').replace(/\W/g, '').toLowerCase();
        const userSkillQueries = filters.skills.map(s => clean(s)).filter(Boolean);
        filteredProfiles = filteredProfiles.filter(profile => {
          if (!profile.core_skills) return false;
          // Flatten profile skills
          return profile.core_skills.some(coreSkill => {
            const processedSkill = clean(coreSkill);
            // Return true if any user query is a substring
            return userSkillQueries.some(q => processedSkill.includes(q));
          });
        });
      }
      if (resetPage) {
        setProfiles(filteredProfiles);
        setPage(1);
      } else {
        setProfiles((prev) => [...prev, ...filteredProfiles]);
      }
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (error: any) {
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleSearch = () => {
    fetchProfiles(true);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
    fetchProfiles();
  };

  const handleReveal = (profile: Profile) => {
    if (!revealedIds.has(profile.id)) {
      setRevealedIds(new Set([...Array.from(revealedIds), profile.id]));
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

  // Add helper for trimming before setting filters
  const handleFilterInputChange = (key: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [key]: e.target.value });
  };
  const handleFilterInputBlur = (key: keyof typeof filters) => (e: React.FocusEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [key]: e.target.value.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Candidates</h1>
          <p className="text-muted-foreground">Fresh profiles updated daily</p>
        </div>

        <Card className="p-6 mb-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Filter by city"
                  value={filters.city}
                  onChange={handleFilterInputChange('city')}
                  onBlur={handleFilterInputBlur('city')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Filter by country"
                  value={filters.country}
                  onChange={handleFilterInputChange('country')}
                  onBlur={handleFilterInputBlur('country')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Filter by job title"
                  value={filters.jobTitle}
                  onChange={handleFilterInputChange('jobTitle')}
                  onBlur={handleFilterInputBlur('jobTitle')}
                />
              </div>
              <div className="space-y-2">
                <Label>Skills</Label>
                <TagInput
                  value={filters.skills}
                  onChange={(skills) => setFilters({ ...filters, skills })}
                  maxTags={8}
                  placeholder="Type a skill and click + Add"
                />
                <p className="text-xs text-muted-foreground">Matches candidates that contain all listed skills.</p>
              </div>
            </div>
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </Card>

        {loading && profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No profiles found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <Accordion type="single" collapsible className="w-full mb-8">
              {profiles.map((profile) => (
                <AccordionItem key={profile.id} value={profile.id}>
                  <AccordionTrigger>
                    <div className="flex flex-col w-full gap-3 text-left">
                    <div>
                      <div className="text-base sm:text-lg font-semibold">
                        {profile.name} {profile.surname}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        {profile.city ? `${profile.city}, ${profile.country}` : profile.country}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                        <Briefcase className="w-4 h-4" />
                        {profile.job_title}
                        <span className="mx-2">•</span>
                        <span className="whitespace-nowrap">Posted {getDaysAgo(profile.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile.work_modes.filter(m => ["onsite", "hybrid", "remote"].includes(m)).map((m) => {
                          const getDisplayText = (mode: string) => {
                            switch (mode) {
                              case "onsite": return "Onsite";
                              case "hybrid": return "Hybrid";
                              case "remote": return "Remote";
                              default: return mode.charAt(0).toUpperCase() + mode.slice(1);
                            }
                          };

                          return (
                            <Badge key={m} variant="secondary" className="text-xs">
                              {getDisplayText(m)}
                            </Badge>
                          );
                        })}
                        {profile.work_modes.filter(m => ["fulltime", "parttime", "contract"].includes(m)).map((m) => {
                          const getDisplayText = (mode: string) => {
                            switch (mode) {
                              case "fulltime": return "Full Time";
                              case "parttime": return "Part Time";
                              case "contract": return "Contract";
                              default: return mode.charAt(0).toUpperCase() + mode.slice(1);
                            }
                          };

                          return (
                            <Badge key={m} variant="outline" className="text-xs">
                              {getDisplayText(m)}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 pt-0 space-y-4">
                      <p className="text-sm whitespace-pre-wrap">{profile.about_me}</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.core_skills.map((s) => (
                          <Badge key={s} variant="outline">{s}</Badge>
                        ))}
                      </div>
                      <div className="pt-2">
                        <Button onClick={() => handleReveal(profile)} className="w-full sm:w-auto" variant={revealedIds.has(profile.id) ? "default" : "outline"}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {revealedIds.has(profile.id) ? "Open LinkedIn Profile" : "Reveal LinkedIn"}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {hasMore && (
              <div className="text-center">
                <Button onClick={handleLoadMore} variant="outline" disabled={loading}>
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Candidates;
