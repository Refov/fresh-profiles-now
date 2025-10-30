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
    const { recruiterEmail, profileId, turnstileToken } = await req.json();

    if (!isValidEmail(recruiterEmail) || !profileId) {
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Basic per-IP daily rate limit for requests (max 50)
    const { count } = await supabase
      .from("recruiter_verifications")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .eq("ip_address", ip);
    if ((count || 0) >= 50) {
      return new Response(
        JSON.stringify({ error: "Daily limit reached. Try again tomorrow." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Generate 6-digit code
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const codeHash = await hashString(`${recruiterEmail}|${profileId}|${code}`);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    const { error: insertError } = await supabase
      .from("recruiter_verifications")
      .insert({ recruiter_email: recruiterEmail, code_hash: codeHash, profile_id: profileId, expires_at: expiresAt, ip_address: ip });

    if (insertError) {
      console.error("Insert verification error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create verification" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Send email via Resend API if configured
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const from = Deno.env.get("RESEND_FROM") || "Refov <no-reply@refov.com>";
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [recruiterEmail],
          subject: "Verify your email to contact candidate",
          text: `Your verification code is ${code}. It expires in 15 minutes.`,
        }),
      });
    } else {
      console.log("[DEV] Verification code for", recruiterEmail, code);
    }

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


