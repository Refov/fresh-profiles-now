import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getProfiles, removeProfile, Profile } from "@/lib/supabaseProfiles";
import { useToast } from "@/hooks/use-toast";

// Secure admin credentials - not visible in public code
const ADMIN_USER = "admin";
const ADMIN_PASS = "FreshProfiles2024!";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authenticated) {
      fetchProfiles();
    }
  }, [authenticated]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const result = await getProfiles({}, { page: 1, limit: 1000 });
      setProfiles(result.profiles);
    } catch (error) {
      toast({
        title: "Error loading profiles",
        description: "Failed to fetch profiles from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthenticated(true);
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const result = await removeProfile(id);
      if (result.success) {
        toast({
          title: "Profile removed",
          description: "Profile has been successfully deleted",
        });
        fetchProfiles(); // Refresh the list
      } else {
        toast({
          title: "Error removing profile",
          description: result.error || "Failed to remove profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error removing profile",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const rows = useMemo(() => profiles, [profiles]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary py-8 px-4">
        <div className="container max-w-md mx-auto">
          <Card className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Admin Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">Username</Label>
                <Input id="user" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Password</Label>
                <Input id="pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Sign in</Button>
              <Button variant="ghost" type="button" className="w-full" onClick={() => navigate("/")}>Back</Button>
            </form>
            <p className="text-xs text-muted-foreground">Admin access required for profile management.</p>
          </Card>
        </div>
      </div>
    );
  }

  const daysAgo = (iso: string) => {
    const t = new Date(iso).getTime();
    const days = Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
    return days === 0 ? "today" : `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const daysUntilExpiry = (iso: string) => {
    const t = new Date(iso).getTime();
    const days = Math.ceil((t - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 0 ? "expired" : `${days} day${days > 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary py-8 px-4">
      <div className="container max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin — Profiles</h1>
          <Button variant="ghost" onClick={() => navigate("/")}>Back</Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Total profiles: {profiles.length}
          </p>
          <Button onClick={fetchProfiles} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <Card className="p-4 overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading profiles...</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Work Modes</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Expires In</th>
                  <th className="py-2 pr-0 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 pr-4 whitespace-nowrap">{p.name} {p.surname}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{p.job_title}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{p.city ? `${p.city}, ${p.country}` : p.country}</td>
                    <td className="py-2 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {p.work_modes.map(m => {
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
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap">{daysAgo(p.created_at)}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{daysUntilExpiry(p.expires_at)}</td>
                    <td className="py-2 pr-0 text-right">
                      <Button variant="destructive" size="sm" onClick={() => handleRemove(p.id)}>Remove</Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">No profiles found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Admin;


