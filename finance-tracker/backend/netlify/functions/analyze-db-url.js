// Script per identificare il corretto reference ID del progetto Supabase
exports.handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // Analizza DATABASE_URL attuale
    const dbUrl = process.env.DATABASE_URL;
    console.log('📋 Current DATABASE_URL:', dbUrl);
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    // Estrai informazioni dall'URL
    const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, username, password, host, port, database] = urlMatch;
    
    // Identifica tipo di connessione e reference ID
    let connectionType = 'unknown';
    let referenceId = 'unknown';
    
    if (host.includes('pooler.supabase.com')) {
      connectionType = 'pooler';
      // Estrai reference dalla parte iniziale dell'username
      const refMatch = username.match(/postgres\.(.+)/);
      if (refMatch) {
        referenceId = refMatch[1];
      }
    } else if (host.includes('db.') && host.includes('.supabase.co')) {
      connectionType = 'direct';
      // Estrai reference dal hostname
      const refMatch = host.match(/db\.(.+)\.supabase\.co/);
      if (refMatch) {
        referenceId = refMatch[1];
      }
    }

    // Suggerisci URL alternativi basati su pattern comuni
    const suggestions = [];
    
    if (connectionType === 'pooler') {
      suggestions.push({
        type: 'direct_connection',
        url: `postgresql://${username}:${password}@db.${referenceId}.supabase.co:5432/${database}`
      });
    } else if (connectionType === 'direct') {
      suggestions.push({
        type: 'pooler_connection', 
        url: `postgresql://${username}:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/${database}`
      });
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'URL_ANALYSIS',
        current_config: {
          connection_type: connectionType,
          reference_id: referenceId,
          username: username.substring(0, 10) + '...',
          host: host,
          port: port,
          database: database
        },
        suggestions: suggestions,
        instructions: [
          '1. Go to Supabase Dashboard > Settings > Database',
          '2. Find "Connection string" section',
          '3. Copy the correct URL for your project',
          '4. Update DATABASE_URL on Netlify',
          '5. Redeploy and test'
        ],
        timestamp: new Date().toISOString()
      }, null, 2)
    };

  } catch (error) {
    console.error('❌ URL analysis failed:', error);
    
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'ANALYSIS_FAILED',
        error: error.message,
        instructions: [
          'DATABASE_URL seems to be misconfigured.',
          'Please go to Supabase Dashboard > Settings > Database',
          'Copy the connection string and update DATABASE_URL on Netlify'
        ]
      })
    };
  }
};
