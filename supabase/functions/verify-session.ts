import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// POST /verify-session - Validates JWT from Authorization header
serve(async (req) => {
  // CORS configuration
  const origin = req.headers.get('Origin') || '';
  const allowedOrigins = [
    'http://localhost:5174', 
    'https://my-notes-lovat-two.vercel.app'
  ];

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) throw error;

    return new Response(JSON.stringify({ user }), { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 401, headers }
    );
  }
});