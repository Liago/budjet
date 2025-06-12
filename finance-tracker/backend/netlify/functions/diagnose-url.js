// Function per diagnosticare esattamente il DATABASE_URL e testare varianti
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
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL not configured');
    }

    console.log('🔍 Analyzing DATABASE_URL...');
    
    // Parse URL
    const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!urlMatch) {
      throw new Error('Cannot parse DATABASE_URL format');
    }

    const [fullMatch, username, password, host, port, database] = urlMatch;
    
    // Analyze components
    const analysis = {
      username: username,
      username_length: username.length,
      username_has_dot: username.includes('.'),
      username_starts_with_postgres: username.startsWith('postgres'),
      password_length: password.length,
      password_starts_with: password.substring(0, 3) + '***',
      host: host,
      host_is_pooler: host.includes('pooler'),
      host_is_direct: host.includes('db.') && host.includes('.supabase.co'),
      port: port,
      port_is_pooler: port === '6543',
      port_is_direct: port === '5432',
      database: database
    };

    // Generate URL variants to test
    const variants = [];
    
    // Original URL (masked)
    variants.push({
      name: 'current_url',
      url: `postgresql://${username}:${password.substring(0,3)}***@${host}:${port}/${database}`,
      notes: 'Current configuration'
    });

    // Common format variations
    if (!username.includes('.')) {
      variants.push({
        name: 'username_with_dot',
        suggestion: `postgresql://postgres.cmwfwxrqbpjamqzuhpxy:${password.substring(0,3)}***@${host}:${port}/${database}`,
        notes: 'Username should have dot format for pooler'
      });
    }

    if (host.includes('pooler') && port !== '6543') {
      variants.push({
        name: 'correct_pooler_port',
        suggestion: `postgresql://${username}:${password.substring(0,3)}***@${host}:6543/${database}`,
        notes: 'Pooler should use port 6543'
      });
    }

    // Test connection (basic socket test)
    console.log('🔌 Testing basic socket connection...');
    let socketTest = 'unknown';
    
    try {
      // Simple socket test using net module
      const net = require('net');
      
      socketTest = await new Promise((resolve, reject) => {
        const socket = new net.Socket();
        const timeout = setTimeout(() => {
          socket.destroy();
          resolve('timeout_3s');
        }, 3000);
        
        socket.connect(parseInt(port), host, () => {
          clearTimeout(timeout);
          socket.destroy();
          resolve('reachable');
        });
        
        socket.on('error', (err) => {
          clearTimeout(timeout);
          resolve(`error_${err.code || err.message}`);
        });
      });
    } catch (err) {
      socketTest = `test_failed_${err.message}`;
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'URL_DIAGNOSIS',
        analysis: analysis,
        socket_test: socketTest,
        url_variants: variants,
        recommendations: [
          'Check if username format is correct (should be postgres.xxxxx for pooler)',
          'Verify password is exactly as shown in Supabase dashboard',
          'Ensure you are using pooler URL (port 6543) not direct (port 5432)',
          'Try resetting database password in Supabase if unsure'
        ],
        supabase_steps: [
          '1. Go to Supabase Dashboard > Settings > Database',
          '2. In "Connection string" section, copy the EXACT pooler URL',
          '3. Replace [YOUR-PASSWORD] with your actual password',
          '4. Update DATABASE_URL on Netlify exactly as copied'
        ]
      }, null, 2)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'DIAGNOSIS_FAILED',
        error: error.message,
        help: 'DATABASE_URL format appears to be invalid'
      })
    };
  }
};
