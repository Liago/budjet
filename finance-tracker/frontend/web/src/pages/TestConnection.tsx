import React, { useState } from 'react';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

const TestConnection: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const updateResult = (testName: string, status: 'success' | 'error', data?: any, error?: string, duration?: number) => {
    setResults(prev => prev.map(r => 
      r.test === testName 
        ? { ...r, status, result: data, error, duration }
        : r
    ));
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateResult(testName, 'success', result, undefined, duration);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateResult(testName, 'error', undefined, error.message, duration);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    
    // Inizializza i risultati
    const initialResults: TestResult[] = [
      { test: 'Environment Check', status: 'pending' },
      { test: 'CORS Preflight', status: 'pending' },
      { test: 'Health Check', status: 'pending' },
      { test: 'Auth Login Test', status: 'pending' },
    ];
    setResults(initialResults);

    // Test 1: Environment Check
    await runTest('Environment Check', async () => {
      return {
        apiUrl: API_URL,
        environment: import.meta.env.MODE,
        userAgent: navigator.userAgent.substring(0, 50),
        currentOrigin: window.location.origin
      };
    });

    // Test 2: CORS Preflight
    await runTest('CORS Preflight', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers,
        corsAllowed: response.status === 200 && headers['access-control-allow-origin']
      };
    });

    // Test 3: Health Check
    await runTest('Health Check', async () => {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: {
          'Origin': window.location.origin
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    });

    // Test 4: Auth Login Test (con credenziali di test)
    await runTest('Auth Login Test', async () => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword'
        })
      });

      const responseData = await response.text();
      
      // Per questo test, anche un 401 (credenziali non valide) è un successo CORS
      if (response.status === 401) {
        return {
          corsWorking: true,
          status: response.status,
          message: 'CORS funziona (credenziali non valide ma richiesta passata)',
          responseData: responseData
        };
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseData}`);
      }

      return JSON.parse(responseData);
    });

    setIsLoading(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔧 Bud-Jet API Connection Test
            </h1>
            <p className="text-gray-600">
              Testa la connessione tra frontend e backend per diagnosticare problemi di autenticazione
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Configurazione Attuale:</h3>
              <p className="text-blue-600"><strong>API URL:</strong> {API_URL}</p>
              <p className="text-blue-600"><strong>Origine Frontend:</strong> {window.location.origin}</p>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-semibold text-white ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Eseguendo Test...' : 'Esegui Tutti i Test'}
            </button>
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-2xl">{getStatusIcon(result.status)}</span>
                    {result.test}
                  </h3>
                  {result.duration && (
                    <span className="text-sm text-gray-500">
                      {result.duration}ms
                    </span>
                  )}
                </div>

                <div className={`text-sm ${getStatusColor(result.status)}`}>
                  {result.status === 'pending' && 'In attesa...'}
                  {result.status === 'success' && 'Test completato con successo!'}
                  {result.status === 'error' && `Errore: ${result.error}`}
                </div>

                {result.result && (
                  <div className="mt-3">
                    <details className="bg-gray-50 rounded p-3">
                      <summary className="cursor-pointer font-medium text-gray-700">
                        Visualizza Risultato
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {result.error && (
                  <div className="mt-3 p-3 bg-red-50 rounded">
                    <p className="text-red-800 text-sm font-medium">Dettagli Errore:</p>
                    <p className="text-red-600 text-sm">{result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {results.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">🎯 Diagnosi e Soluzioni:</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Se CORS Preflight fallisce:</strong> Il backend non gestisce correttamente le richieste OPTIONS</p>
                <p><strong>Se Health Check fallisce:</strong> Il backend non è raggiungibile all'URL configurato</p>
                <p><strong>Se Auth Login fallisce con errore CORS:</strong> Il backend non include headers CORS nelle risposte POST</p>
                <p><strong>Se tutto funziona ma login reale fallisce:</strong> Verifica credenziali e configurazione database</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestConnection;