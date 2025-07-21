import express from 'express';
import { getAllCves, searchCves, getCveById } from '../controllers/cveController.js';
import { autocompleteCves } from '../controllers/cveController.js';

const router = express.Router();

// GET /api/cve → Tüm CVE kayıtlarından ilk 100
router.get('/', getAllCves);

// POST /api/cve/search → Arama (query: …)
router.post('/search', searchCves);

// GET /api/cve/:cveId → Belirli CVE ID
router.get('/:cveId', getCveById);

// GET /api/cve/autocomplete?query=…
router.get('/autocomplete', autocompleteCves);

export default router;
