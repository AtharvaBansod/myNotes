import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// POST /notes - Creates note with data from request body
serve(async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? ''
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    const requestBody = await req.json();
    
    if (!requestBody.title || typeof requestBody.title !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Title is required and must be a string' }),
        { status: 400, headers }
      );
    }

    const { data: newNote, error: createError } = await supabaseClient
      .from('notes')
      .insert({
        user_id: user.id,
        title: requestBody.title,
        description: requestBody.description || null,
        image_url: requestBody.image_url || null
      })
      .select()
      .single();

    if (createError) throw createError;

    return new Response(JSON.stringify(newNote), { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers }
    );
  }
});