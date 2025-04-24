const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Abilita la compressione gzip
app.use(compression());

// Configura la base path per gli assets
const BASE_PATH = process.env.BASE_PATH || '/budjet';

// Serve file statici dalla directory dist
app.use(BASE_PATH, express.static(path.join(__dirname, 'dist')));

// Reindirizza dalla root al percorso base
app.get('/', (req, res) => {
  res.redirect(BASE_PATH);
});

// Gestisci tutte le richieste che non corrispondono a file statici
// Questo è necessario per l'SPA routing (gestito da React Router)
app.get(`${BASE_PATH}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
  console.log(`Applicazione accessibile su http://localhost:${PORT}${BASE_PATH}`);
}); 