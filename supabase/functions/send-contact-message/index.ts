import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const baseCorsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const allowList = (Deno.env.get("ALLOWED_ORIGINS") || "https://stage.refov.com,https://refov.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAllowedOrigin = origin ? allowList.includes(origin) : true; // allow server-to-server (no origin)

  // Handle preflight
  if (req.method === "OPTIONS") {
    if (!isAllowedOrigin) {
      return new Response("CORS not allowed", { status: 403 });
    }
    return new Response(null, { headers: { ...baseCorsHeaders, "Access-Control-Allow-Origin": origin } });
  }

  if (origin && !isAllowedOrigin) {
    return new Response(JSON.stringify({ error: "CORS not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const corsHeaders = { ...baseCorsHeaders, "Access-Control-Allow-Origin": origin || "*" };

  try {
    const { profileId, recruiterEmail, message } = await req.json();

    // Basic validation
    if (!profileId || !recruiterEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recruiterEmail) || !message || message.length < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseUrl =
      Deno.env.get("SB_URL") ??
      Deno.env.get("REFOV_SUPABASE_URL") ??
      Deno.env.get("SUPABASE_URL") ??
      "";
    const serviceKey =
      Deno.env.get("SR_KEY") ??
      Deno.env.get("REFOV_SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      "";
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Server not configured (missing SUPABASE_URL or SERVICE_ROLE key)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Rate limit by IP (25/day)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: sentCount } = await supabase
      .from("recruiter_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
      .eq("sender_ip", ip);
    if ((sentCount || 0) >= 25) {
      return new Response(
        JSON.stringify({ error: "Daily limit reached" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Get candidate email securely
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", profileId)
      .single();

    if (pErr || !profile?.email) {
      return new Response(
        JSON.stringify({ error: "Candidate not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Send via self-hosted webhook
    const webhookUrl = Deno.env.get("MAIL_WEBHOOK_URL") ?? "";
    const webhookSecret = Deno.env.get("MAIL_WEBHOOK_SECRET") ?? "";

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: "Server not configured (missing MAIL_WEBHOOK_URL)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const mailRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
      },
      body: JSON.stringify({
        to: profile.email,
        subject: "New message from a recruiter via Refov",
        text: `From: ${recruiterEmail}\n\n${message}`,
        reply_to: recruiterEmail,
      }),
    });

    if (!mailRes.ok) {
      const t = await mailRes.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: `Email send failed (${mailRes.status}) ${t}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 502 }
      );
    }

    // Log message for rate limiting/audit
    await supabase
      .from("recruiter_messages")
      .insert({ profile_id: profileId, recruiter_email: recruiterEmail, message, sender_ip: ip });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});


