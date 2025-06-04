// Crypto polyfill condizionale per ambienti che ne hanno bisogno
try {
  // Se crypto non è disponibile globalmente, lo importiamo
  if (typeof globalThis.crypto === 'undefined') {
    const { webcrypto } = require('crypto');
    globalThis.crypto = webcrypto;
  }
} catch (error) {
  // Se fallisce, non è necessario - Node.js moderno ha crypto nativo
  console.log('Crypto polyfill not needed or failed to load, using native crypto');
}
