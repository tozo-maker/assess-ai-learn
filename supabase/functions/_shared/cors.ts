// Allowed origins for CORS
// Includes Lovable preview URLs, published URL patterns, and localhost for development
const getAllowedOrigins = (): string[] => {
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim());
  }
  
  // Default allowed origins for this project
  return [
    'https://id-preview--e4b555e1-8f3f-4bae-a57a-b572ee0e5e59.lovable.app',
    'https://e4b555e1-8f3f-4bae-a57a-b572ee0e5e59.lovableproject.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];
};

// Get CORS headers based on the request origin
export const getCorsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get('origin') || '';
  const allowedOrigins = getAllowedOrigins();
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => {
    // Exact match
    if (origin === allowed) return true;
    // Pattern match for lovable subdomains
    if (allowed.includes('lovable.app') && origin.endsWith('.lovable.app')) return true;
    if (allowed.includes('lovableproject.com') && origin.endsWith('.lovableproject.com')) return true;
    return false;
  });
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
};

// Legacy export for backwards compatibility during migration
// TODO: Update all edge functions to use getCorsHeaders(req) instead
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};
