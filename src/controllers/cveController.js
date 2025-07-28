import client from '../elastic/elasticClient.js';
import {
  simpleSearch,
  boostedSearch,
  fuzzySearch,
  rangeSearch,
  boolSearch,
  profiledSearch
} from '../elastic/searchService.js';

const INDEX_NAME = 'cvelist';

export async function getCveById(req, res) {
  const { cveId } = req.params;

  try {
    const result = await client.search({
      index: INDEX_NAME,
      body: {
        query: { term: { 'cveMetadata.cveId.keyword': cveId } }
      }
    });

    if (result.hits.hits.length === 0) {
      return res.status(404).json({ error: 'CVE not found' });
    }

    const doc = result.hits.hits[0]._source;
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function searchCves(req, res) {
  const {
    query,
    state,
    problemType,
    dateFrom,
    dateTo,
    field,
    gte,
    lte,
    mode,
    sortBy = 'default',
    page = 1,
    size = 20
  } = req.body;

  const from = (page - 1) * size;

  try {
    let result;

    const commonParams = {
      keyword: query,
      state,
      problemType,
      dateFrom,
      dateTo,
      field,
      gte,
      lte,
      sortBy,
      from,
      size
    };

    switch (mode) {
      case 'simple':
        result = await simpleSearch(commonParams);
        break;
      case 'boosted':
        result = await boostedSearch(commonParams);
        break;
      case 'fuzzy':
        result = await fuzzySearch(commonParams);
        break;
      case 'range':
        if (!field || !gte || !lte) {
          return res.status(400).json({ error: 'Range search requires field, gte, lte' });
        }
        result = await rangeSearch(commonParams);
        break;
      case 'bool':
        result = await boolSearch(commonParams);
        break;
      case 'profiled':
        result = await profiledSearch(commonParams);
        break;
      default:
        result = await boostedSearch(commonParams);
    }

    const totalHits = result.hits.total?.value || 0;
    const totalPages = Math.ceil(totalHits / size);

    const cves = result.hits.hits.map(hit => {
      const doc = hit._source;
      return {
        cveId: doc.cveMetadata?.cveId || 'N/A',
        title: doc.title || 'N/A',
        state: doc.state || 'N/A',
        datePublished: doc.datePublished || 'N/A'
      };
    });

    res.json({ cves, totalPages, currentPage: Number(page) });
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
        size: 100,
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
      index: INDEX_NAME,
      size: 5,
      body: {
        query: {
          match_phrase_prefix: {
            'title': query
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
