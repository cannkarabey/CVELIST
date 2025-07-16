// server.js

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cveRoutes from './src/routes/cveRoutes.js';
import { createIndexIfNotExists } from './src/elastic/indexService.js';

const app = express();

// __dirname ayarlamak (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src', 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Route’lar
app.use('/', cveRoutes);

// Elasticsearch index kontrol
createIndexIfNotExists();

// Başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
