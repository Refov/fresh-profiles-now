import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Secure admin credentials (stored server-side only)
const ADMIN_USER = Deno.env.get("ADMIN_USERNAME") || "admin";
const ADMIN_PASS = Deno.env.get("ADMIN_PASSWORD") || "FreshProfiles2024!";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    // Verify credentials
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // Generate a simple session token (in production, use JWT)
      const sessionToken = btoa(`${username}:${Date.now()}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          token: sessionToken,
          message: "Login successful" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});


