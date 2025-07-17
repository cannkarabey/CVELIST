// src/controllers/cveController.js

import { simpleSearch, boostedSearch, fuzzySearch, rangeSearch, boolSearch, profiledSearch} from '../elastic/searchService.js';
import { bulkInsertCves, sendBatch, extractVersionFromTitle, transformCveJson } from '../elastic/bulkInsertService.js';

export async function homePage(req, res) {
  res.render('index', { title: 'CVE Search' });
}

export async function searchCVE(req, res) {
  try {
    const { query, type } = req.body;
    let results;

    switch (type) {
      case 'boosted':
        results = await boostedSearch(query);
        break;
      case 'fuzzy':
        results = await fuzzySearch(query);
        break;
      default:
        results = await simpleSearch(query);
        break;
    }

    res.json(results.hits.hits);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
}

export async function rangeSearchCVE(req, res) {
  try {
    const { field, gte, lte } = req.body;
    const results = await rangeSearch({ field, gte, lte });
    res.json(results.hits.hits);
  } catch (err) {
    console.error('Range search error:', err);
    res.status(500).json({ error: 'Range search failed' });
  }
}

export async function boolSearchCVE(req, res) {
  try {
    const { keyword, state, dateFrom, dateTo } = req.body;
    const results = await boolSearch({ keyword, state, dateFrom, dateTo });
    res.json(results.hits.hits);
  } catch (err) {
    console.error('Bool search error:', err);
    res.status(500).json({ error: 'Bool search failed' });
  }
}

export async function bulkLoad(req, res) {
  try {
    const result = await bulkInsert();
    res.json({ success: true, result });
  } catch (err) {
    console.error('Bulk insert error:', err);
    res.status(500).json({ error: 'Bulk insert failed' });
  }
}
