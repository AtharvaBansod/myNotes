import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// POST /auth - Handles user signup/login via email/password in request body
serve(async (req) => {
  // Set CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Verify authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing or invalid' }),
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    if (token !== Deno.env.get('SUPABASE_ANON_KEY')) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers }
      );
    }

    // Parse request body
    const { email, password, name } = await req.json();
    
    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers }
      );
    }

    let userData;

    // Sign-up flow
    if (name) {
      const { data, error: signUpError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailConfirm: false
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
          });
          if (signInError) throw signInError;
          userData = signInData;
        } else {
          throw signUpError;
        }
      } else {
        userData = data;
      }

      // Verify user profile creation
      const { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userData.user.id)
        .single();
      
      if (!existingProfile) {
        throw new Error('User profile creation failed');
      }
    } 
    // Login flow
    else {
      const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) throw signInError;
      userData = signInData;
    }

    return new Response(JSON.stringify({
      user: {
        id: userData.user.id,
        email: userData.user.email,
        user_metadata: userData.user.user_metadata || { name }
      },
      session: {
        access_token: userData.session.access_token,
        refresh_token: userData.session.refresh_token
      }
    }), { headers });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers }
    );
  }
});