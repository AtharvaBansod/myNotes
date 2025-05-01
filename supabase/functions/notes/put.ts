import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// PUT /notes/:id - Updates specific note with ID in path and data in body
serve(async (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
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

    const url = new URL(req.url);
    const noteId = url.pathname.split('/').pop();
    if (!noteId) throw new Error('Note ID is required');

    const { title, description, image_url, is_bookmarked } = await req.json();

    const { data: updatedNote, error: updateError } = await supabaseClient
      .from('notes')
      .update({
        title,
        description,
        image_url,
        is_bookmarked,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(JSON.stringify(updatedNote), { headers });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers }
    );
  }
});