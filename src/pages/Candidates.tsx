import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProfileCard from "@/components/ProfileCard";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  surname: string;
  job_title: string;
  work_mode: string;
  city: string | null;
  country: string;
  about_me: string;
  linkedin_url: string;
  core_skills: string[];
  created_at: string;
  updated_at: string;
}

const Candidates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    jobTitle: "",
    skills: "",
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  const fetchProfiles = async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 0 : page;

    try {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      if (filters.city) {
        query = query.ilike("city", `%${filters.city}%`);
      }
      if (filters.country) {
        query = query.ilike("country", `%${filters.country}%`);
      }
      if (filters.jobTitle) {
        query = query.ilike("job_title", `%${filters.jobTitle}%`);
      }
      if (filters.skills) {
        query = query.contains("core_skills", [filters.skills]);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      if (resetPage) {
        setProfiles(data || []);
        setPage(0);
      } else {
        setProfiles((prev) => [...prev, ...(data || [])]);
      }

      setHasMore(data && data.length === ITEMS_PER_PAGE && count ? count > (currentPage + 1) * ITEMS_PER_PAGE : false);
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
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Filter by country"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="Filter by job title"
                  value={filters.jobTitle}
                  onChange={(e) => setFilters({ ...filters, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="Search by skill"
                  value={filters.skills}
                  onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {profiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>

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
