import { Handler } from '@netlify/functions';

// Simple test function to verify deployment
export const handler: Handler = async (event, context) => {
  console.log('Test function called:', event.httpMethod, event.path);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify({
      message: 'Backend function is working!',
      timestamp: new Date().toISOString(),
      path: event.path,
      method: event.httpMethod
    })
  };
};
