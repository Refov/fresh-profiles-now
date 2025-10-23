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
    const { profileId, turnstileToken } = await req.json();

    // Verify Turnstile token
    const turnstileResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: Deno.env.get("TURNSTILE_SECRET_KEY") || "1x0000000000000000000000000000000AA", // Demo secret
          response: turnstileToken,
        }),
      }
    );

    const turnstileData = await turnstileResponse.json();
    if (!turnstileData.success) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get IP address
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check rate limit
    const now = new Date();
    const { data: rateLimit, error: rateLimitError } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("ip_address", ip)
      .single();

    if (rateLimitError && rateLimitError.code !== "PGRST116") {
      console.error("Rate limit check error:", rateLimitError);
    }

    // Reset daily limits if needed
    if (rateLimit && new Date(rateLimit.reset_at) < now) {
      await supabase
        .from("rate_limits")
        .update({
          post_count: 0,
          reveal_count: 0,
          reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("ip_address", ip);
    } else if (rateLimit && rateLimit.reveal_count >= 50) {
      return new Response(
        JSON.stringify({ error: "Daily reveal limit reached (50 reveals per day)" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    // Update rate limit
    if (rateLimit) {
      await supabase
        .from("rate_limits")
        .update({
          reveal_count: rateLimit.reveal_count + 1,
          last_reveal_at: now.toISOString(),
        })
        .eq("ip_address", ip);
    } else {
      await supabase
        .from("rate_limits")
        .insert({
          ip_address: ip,
          reveal_count: 1,
          last_reveal_at: now.toISOString(),
          reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });
    }

    console.log("LinkedIn revealed for profile:", profileId);

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
