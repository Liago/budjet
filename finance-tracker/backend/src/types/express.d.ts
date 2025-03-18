// Estende i tipi di Express per includere i tipi di Multer
import * as multer from 'multer';

declare global {
  namespace Express {
    namespace Multer {
      interface File extends multer.File {}
    }
  }
} 