import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cveRoutes from './routes/cveRoutes.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vue build dosyaları servisi (isteğe bağlı: Vue build ettiğinde frontend dağıtım için)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API route’ları
app.use('/api/cve', cveRoutes);

// Vue SPA fallback (isteğe bağlı, Vue routing çalışsın diye)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
});

// Server başlat
app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
