const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Compress all responses
app.use(compression());

// Static files
app.use('/budjet', express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('/budjet/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Redirect root to /budjet
app.get('/', (req, res) => {
  res.redirect('/budjet');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 