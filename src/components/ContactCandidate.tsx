import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import TurnstileWidget from "@/components/TurnstileWidget";

interface ContactCandidateProps {
  profileId: string;
}

const ContactCandidate = ({ profileId }: ContactCandidateProps) => {
  const { toast } = useToast();
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"request" | "compose" | "sent">("request");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const requestCode = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recruiterEmail)) {
      toast({ title: "Invalid email", description: "Enter a valid recruiter email", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-contact-code", {
        body: { recruiterEmail, profileId, turnstileToken },
      });
      if (error || data?.error) {
        throw new Error(error?.message || data?.error || "Failed to send code");
      }
      toast({ title: "Verification code sent", description: "Check your email for the code." });
      setStep("compose");
    } catch (err: any) {
      const details = err?.message || (typeof err === 'string' ? err : 'Network or server error');
      toast({ title: "Failed", description: details, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!verificationCode.trim() || message.trim().length < 10) {
      toast({ title: "Fill all fields", description: "Code and a 10+ character message required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-message", {
        body: { recruiterEmail, profileId, code: verificationCode, message, turnstileToken },
      });
      if (error || data?.error) {
        throw new Error(error?.message || data?.error || "Failed to send message");
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
      {step === "request" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="recruiterEmail">Your Email</Label>
            <Input id="recruiterEmail" type="email" placeholder="you@company.com" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} />
          </div>
          <TurnstileWidget onVerify={setTurnstileToken} />
          <Button className="w-full" disabled={loading} onClick={requestCode}>{loading ? "Sending..." : "Send Verification Code"}</Button>
          <p className="text-xs text-muted-foreground">We’ll email a code to verify your address. Candidate email remains private.</p>
        </div>
      )}

      {step === "compose" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input id="code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} placeholder="Introduce yourself, role, location, and next steps..." value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <Button className="w-full" disabled={loading} onClick={sendMessage}>{loading ? "Sending..." : "Send Message"}</Button>
          <p className="text-xs text-muted-foreground">Your email will be used as Reply-To so the candidate can respond directly.</p>
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


