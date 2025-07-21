import client from '../elastic/elasticClient.js';
import { boostedSearch } from '../elastic/searchService.js';

const INDEX_NAME = 'cvelist';

// GET /api/cve/:cveId → tek bir CVE ID döner
export async function getCveById(req, res) {
  const { cveId } = req.params;

  try {
    const result = await client.search({
      index: INDEX_NAME,
      body: {
        query: { term: { cveId: cveId } }
      }
    });

    if (result.hits.hits.length === 0) {
      return res.status(404).json({ error: 'CVE not found' });
    }

    res.json(result.hits.hits[0]._source);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/cve/search → arama yapar ve sonuçları liste halinde döner
export async function searchCves(req, res) {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const result = await boostedSearch(query);

    const cves = result.hits.hits.map(hit => hit._source);

    res.json({ cves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/cve → (isteğe bağlı) tüm CVE kayıtlarını getirir (sınırlı sayıda)
export async function getAllCves(req, res) {
  try {
    const result = await client.search({
      index: INDEX_NAME,
      body: {
        size: 100, // sadece 100 kayıt getir
        query: { match_all: {} }
      }
    });

    const cves = result.hits.hits.map(hit => hit._source);

    res.json({ cves });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/cve/autocomplete?query=…
export async function autocompleteCves(req, res) {
  const { query } = req.query;

  if (!query) return res.json([]);

  try {
    const result = await client.search({
      index: 'cvelist',
      size: 5,
      body: {
        query: {
          match_phrase_prefix: {
            title: query
          }
        }
      }
    });

    const suggestions = result.hits.hits.map(hit => hit._source.title);
    res.json(suggestions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
