const axios = require('axios');

// 🔧 Debug delle chiamate API
const API_BASE_URL = "https://bud-jet-be.netlify.app/.netlify/functions/api";

async function testApiCall() {
  try {
    console.log("🔍 Testing API calls...");
    console.log("📍 Base URL:", API_BASE_URL);
    
    // Test con token fittizio per vedere la struttura della risposta
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDate = firstDayOfMonth.toISOString().split('T')[0];
    const endDate = lastDayOfMonth.toISOString().split('T')[0];
    
    console.log("📅 Date range:", { startDate, endDate });
    
    // Test endpoint dashboard stats
    const dashboardUrl = `${API_BASE_URL}/direct/stats?startDate=${startDate}&endDate=${endDate}`;
    console.log("📞 Calling:", dashboardUrl);
    
    const response = await axios.get(dashboardUrl, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Sostituire con token reale
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log("✅ Response status:", response.status);
    console.log("📊 Response data:", JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error("❌ API Error:", error.message);
    if (error.response) {
      console.error("📱 Response status:", error.response.status);
      console.error("📱 Response data:", error.response.data);
    }
  }
}

// Test anche l'endpoint delle transazioni
async function testTransactionsApi() {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDate = firstDayOfMonth.toISOString().split('T')[0];
    const endDate = lastDayOfMonth.toISOString().split('T')[0];
    
    const transactionsUrl = `${API_BASE_URL}/direct/transactions?startDate=${startDate}&endDate=${endDate}&limit=10`;
    console.log("📞 Calling transactions:", transactionsUrl);
    
    const response = await axios.get(transactionsUrl, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Sostituire con token reale
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log("✅ Transactions response status:", response.status);
    console.log("📊 Transactions data:", JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error("❌ Transactions API Error:", error.message);
    if (error.response) {
      console.error("📱 Response status:", error.response.status);
      console.error("📱 Response data:", error.response.data);
    }
  }
}

console.log("🚀 Starting API debug...");
// testApiCall();
// testTransactionsApi();

// Per eseguire: sostituire YOUR_TOKEN_HERE con un token valido e scommentare le chiamate

module.exports = { testApiCall, testTransactionsApi }; 