import { Handler } from '@netlify/functions';

// Ultra-simple function to test basic functionality
export const handler: Handler = async (event, context) => {
  console.log('Simple function called');
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Simple function works!',
      timestamp: new Date().toISOString()
    })
  };
};
