// crypto-polyfill.ts
// Questo file importa il modulo crypto e lo rende disponibile globalmente
import * as cryptoModule from "crypto";

// Aggiungi il modulo crypto all'oggetto global
(global as any).crypto = cryptoModule;

console.log("Crypto polyfill loaded");
