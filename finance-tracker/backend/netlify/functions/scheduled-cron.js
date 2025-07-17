const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('🔄 [Netlify Scheduled Function] Triggered at:', new Date().toISOString());
  
  try {
    // Get the base URL from environment or use default
    const baseUrl = process.env.URL || 'https://your-app.netlify.app';
    const apiUrl = `${baseUrl}/api/recurrent-payments/execute`;
    
    console.log('📞 [Netlify Scheduled Function] Calling API:', apiUrl);
    
    // Call the manual execution endpoint
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Netlify-Scheduled-Function'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ [Netlify Scheduled Function] Success:', result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Recurrent payments processed successfully',
        result: result,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ [Netlify Scheduled Function] Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process recurrent payments',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};