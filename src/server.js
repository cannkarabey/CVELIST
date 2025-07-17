import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cveRoutes from './routes/cveRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// EJS ayarları
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/cve', cveRoutes);

// Ana sayfa
app.get('/', (req, res) => {
  res.redirect('/cve');
});

// Server başlat
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
