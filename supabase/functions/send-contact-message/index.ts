import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recruiterEmail, profileId, code, message, turnstileToken } = await req.json();

    if (!isValidEmail(recruiterEmail) || !profileId || !code || !message || message.length < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Optional Turnstile verification
    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (turnstileSecret) {
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
      });
      const data = await res.json();
      if (!data.success) {
        return new Response(
          JSON.stringify({ error: "CAPTCHA verification failed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Server not configured (missing SUPABASE_URL or SERVICE_ROLE key)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify code: find a non-used, non-expired record for this email & profile
    const codeHash = await hashString(`${recruiterEmail}|${profileId}|${code}`);
    const { data: verification, error: verErr } = await supabase
      .from("recruiter_verifications")
      .select("id, expires_at, used")
      .eq("recruiter_email", recruiterEmail)
      .eq("profile_id", profileId)
      .eq("code_hash", codeHash)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (verErr || !verification) {
      return new Response(
        JSON.stringify({ error: "Invalid code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (verification.used || new Date(verification.expires_at).getTime() < Date.now()) {
      return new Response(
        JSON.stringify({ error: "Code expired or already used" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch candidate email from profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", profileId)
      .single();

    if (profileErr || !profile?.email) {
      return new Response(
        JSON.stringify({ error: "Candidate not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Send email to candidate through self-hosted webhook
    const webhookUrl = Deno.env.get("MAIL_WEBHOOK_URL");
    const webhookSecret = Deno.env.get("MAIL_WEBHOOK_SECRET") || "";
    if (webhookUrl && webhookSecret) {
      const mailRes = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${webhookSecret}`,
        },
        body: JSON.stringify({
          to: profile.email,
          subject: "New message from a recruiter via Refov",
          text: `From: ${recruiterEmail}\n\n${message}`,
          reply_to: recruiterEmail,
        }),
      });
      if (!mailRes.ok) {
        const errText = await mailRes.text().catch(() => "");
        console.error("Webhook send failed:", mailRes.status, errText);
        return new Response(
          JSON.stringify({ error: "Failed to send email" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
        );
      }
    } else {
      console.log("[DEV] Would send message to", profile.email, "from", recruiterEmail, "message:", message);
    }

    // Mark verification as used and log message
    await supabase
      .from("recruiter_verifications")
      .update({ used: true })
      .eq("id", verification.id);

    await supabase
      .from("recruiter_messages")
      .insert({ profile_id: profileId, recruiter_email: recruiterEmail, message, sender_ip: ip });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});


