// crypto-polyfill.ts
// Questo file importa il modulo crypto e lo estende senza sovrascrivere l'oggetto globale
import * as cryptoModule from "crypto";

// Definizione dell'interfaccia per il tipo esteso di crypto
interface ExtendedCrypto extends Crypto {
  randomBytes?: typeof cryptoModule.randomBytes;
  createHash?: typeof cryptoModule.createHash;
}

// Invece di sovrascrivere la proprietà crypto, la estendiamo o forniamo funzioni alternative
if (typeof global.crypto === "undefined") {
  // Se crypto non esiste (caso raro), possiamo definirlo
  (global as any).crypto = cryptoModule;
} else {
  // Se crypto esiste ma mancano alcune funzionalità specifiche
  // Estendi l'oggetto crypto con le funzionalità mancanti
  const extendedCrypto = global.crypto as ExtendedCrypto;

  // Aggiungi randomBytes se non esiste
  if (!("randomBytes" in extendedCrypto)) {
    extendedCrypto.randomBytes = cryptoModule.randomBytes;
  }

  // Aggiungi createHash se non esiste
  if (!("createHash" in extendedCrypto)) {
    extendedCrypto.createHash = cryptoModule.createHash;
  }
}

console.log("Crypto polyfill loaded");
