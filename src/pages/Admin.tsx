import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAllProfiles, removeProfileById, LocalProfile } from "@/lib/localProfiles";

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || "admin";
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "changeme";

const Admin = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);

  useEffect(() => {
    if (authenticated) {
      setProfiles(getAllProfiles());
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthenticated(true);
    }
  };

  const handleRemove = (id: string) => {
    removeProfileById(id);
    setProfiles(getAllProfiles());
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
            <p className="text-xs text-muted-foreground">Default credentials can be set via VITE_ADMIN_USER and VITE_ADMIN_PASS.</p>
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

        <Card className="p-4 overflow-x-auto">
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
                      {p.work_modes.map(m => (
                        <Badge key={m} variant="secondary">{m === "onsite" ? "Onsite" : m.charAt(0).toUpperCase()+m.slice(1)}</Badge>
                      ))}
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
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">No profiles</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default Admin;


