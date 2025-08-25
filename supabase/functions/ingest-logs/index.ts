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
  user_id?: string;
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
    // Initialize Supabase client with service role key for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    console.log(`[ingest-logs] Processing ${logs.length} log entries`);

    // Transform logs to match database schema
    const dbLogs = logs.map(log => ({
      endpoint: log.endpoint,
      method: log.method || log.level,
      status_code: log.status_code || levelToStatusCode(log.level),
      response_time_ms: log.response_time_ms || 0,
      error_message: formatLogMessage(log),
      user_id: log.user_id || null
    }));

    // Insert logs into database using service role (bypasses RLS)
    const { error } = await supabase
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

    console.log(`[ingest-logs] Successfully stored ${logs.length} log entries`);

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