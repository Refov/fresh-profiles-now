import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ContactCandidateProps {
  profileId: string;
}

const ContactCandidate = ({ profileId }: ContactCandidateProps) => {
  const { toast } = useToast();
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"compose" | "sent">("compose");
  const [loading, setLoading] = useState(false);
  // No Turnstile on stage for simplicity

  const sendMessage = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recruiterEmail) || message.trim().length < 10) {
      toast({ title: "Check your input", description: "Valid email and a 10+ character message required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruiterEmail, profileId, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Failed (HTTP ${res.status})`);
      }
      toast({ title: "Message sent", description: "Your message was delivered to the candidate." });
      setStep("sent");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not send message", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === "compose" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="recruiterEmail">Your Email</Label>
            <Input id="recruiterEmail" type="email" placeholder="you@company.com" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} placeholder="Introduce yourself, role, location, and next steps..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button className="w-full" disabled={loading} onClick={sendMessage}>{loading ? "Sending..." : "Send Message"}</Button>
          <p className="text-xs text-muted-foreground">We’ll send your message to the candidate via Refov. Your email is kept private and used as Reply-To.</p>
        </div>
      )}

      {step === "sent" && (
        <div className="space-y-2">
          <p className="text-sm">Your message has been sent. Watch your inbox for replies.</p>
        </div>
      )}
    </div>
  );
};

export default ContactCandidate;


