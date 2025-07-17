import express from 'express';
import { getAllCves, searchCves, getCveById } from '../controllers/cveController.js';

const router = express.Router();

// GET /api/cve → Tüm CVE kayıtlarından ilk 100
router.get('/', getAllCves);

// POST /api/cve/search → Arama (query: …)
router.post('/search', searchCves);

// GET /api/cve/:cveId → Belirli CVE ID
router.get('/:cveId', getCveById);

export default router;
