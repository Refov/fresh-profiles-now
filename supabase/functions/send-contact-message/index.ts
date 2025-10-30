import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profileId, recruiterEmail, message } = await req.json();

    // Basic validation
    if (!profileId || !recruiterEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recruiterEmail) || !message || message.length < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid input" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: "Server not configured (missing SUPABASE_URL or SERVICE_ROLE key)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

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


