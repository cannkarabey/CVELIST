import express from 'express';
import {
  homePage,
  searchCVE,
  rangeSearchCVE,
  boolSearchCVE,
  bulkLoad
} from '../controllers/cveController.js';

const router = express.Router();

// GET / → Ana sayfa (UI)
router.get('/', homePage);

// POST /search → Basit/boosted/fuzzy arama
router.post('/search', searchCVE);

// POST /range-search → Range sorgusu
router.post('/range-search', rangeSearchCVE);

// POST /bool-search → Bool sorgusu
router.post('/bool-search', boolSearchCVE);

// POST /bulkload → JSON verilerini Elasticsearch’e yükle
router.post('/bulkload', bulkLoad);

export default router;
