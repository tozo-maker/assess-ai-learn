import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogEntry {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  endpoint: string;
  method?: string;
  status_code?: number;
  response_time_ms?: number;
  error_message?: string;
  context?: Record<string, any>;
  timestamp?: string;
}

interface LogBatch {
  logs: LogEntry[];
  session_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Require authentication header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create client with user's auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { logs, session_id }: LogBatch = await req.json();

    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid logs array' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Limit batch size to prevent abuse
    const maxBatchSize = 100;
    if (logs.length > maxBatchSize) {
      return new Response(
        JSON.stringify({ error: `Batch size exceeds maximum of ${maxBatchSize}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[ingest-logs] Processing ${logs.length} log entries for user: ${user.id}`);

    // Transform logs to match database schema - associate with authenticated user
    const dbLogs = logs.map(log => ({
      endpoint: log.endpoint,
      method: log.method || log.level,
      status_code: log.status_code || levelToStatusCode(log.level),
      response_time_ms: log.response_time_ms || 0,
      error_message: formatLogMessage(log),
      user_id: user.id  // Always associate logs with authenticated user
    }));

    // Use service role key for insert since RLS blocks direct inserts
    // But we've already verified the user, so this is safe
    const serviceSupabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Insert logs into database
    const { error } = await serviceSupabase
      .from('system_performance_logs')
      .insert(dbLogs);

    if (error) {
      console.error('[ingest-logs] Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to store logs', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[ingest-logs] Successfully stored ${logs.length} log entries for user: ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: logs.length,
        session_id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[ingest-logs] Processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal processing error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function levelToStatusCode(level: string): number {
  switch (level) {
    case 'ERROR': return 500;
    case 'WARN': return 400;
    case 'INFO': return 200;
    case 'DEBUG': return 100;
    default: return 200;
  }
}

function formatLogMessage(log: LogEntry): string {
  let message = log.message;
  
  if (log.error_message) {
    message += ` | Error: ${log.error_message}`;
  }
  
  if (log.context) {
    try {
      const contextStr = JSON.stringify(log.context);
      message += ` | Context: ${contextStr}`;
    } catch {
      message += ` | Context: [unable to serialize]`;
    }
  }
  
  return message;
}
