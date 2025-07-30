import client from '../elastic/elasticClient.js';
import { normalizeCve } from '../utils/normalizeCve.js';

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
    const normalized = normalizeCve(doc);

    return res.json(normalized);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// export async function searchCves(req, res) {
//   const {
//     query,
//     state,
//     dateFrom,
//     dateTo,
//     field,
//     gte,
//     lte,
//     mode = 'simple',
//     page = 1,
//     size = 20,
//     filters,
//     sortBy
//   } = req.body;

//   const from = (page - 1) * size;

//   try {
//     let result;

//     // mode geçersizse default: boosted
//     switch (mode) {
//       case 'simple':
//         result = await simpleSearch(query, from, size, filters, sortBy);
//         break;
//       case 'boosted':
//         result = await boostedSearch(query, from, size, filters, sortBy);
//         break;
//       case 'fuzzy':
//         result = await fuzzySearch(query, from, size, filters, sortBy);
//         break;
//       case 'range':
//         if (!field || !gte || !lte) {
//           return res.status(400).json({ error: 'Range search requires field, gte, lte' });
//         }
//         result = await rangeSearch({ field, gte, lte }, from, size);
//         break;
//       case 'bool':
//         result = await boolSearch({ keyword: query, state, dateFrom, dateTo }, from, size);
//         break;
//       case 'profiled':
//         result = await profiledSearch(query, from, size, filters, sortBy);
//         break;
//       default:
//         result = await boostedSearch(query, from, size, filters, sortBy);
//     }

//     const totalHits = result.hits.total?.value || 0;
//     const totalPages = Math.ceil(totalHits / size);

//     const cves = result.hits.hits.map(hit => {
//       const doc = hit._source;
//       return {
//         cveId: doc.cveMetadata?.cveId || 'N/A',
//         title: doc.title || 'N/A',
//         state: doc.state || 'N/A',
//         datePublished: doc.datePublished || 'N/A'
//       };
//     });

//     res.json({
//       cves,
//       totalPages,
//       currentPage: Number(page)
//     });

//   } catch (err) {
//     console.error('Error in searchCves:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

export async function searchCves(req, res) {
  const {
    query = "",
    filters = {},
    sortBy = "date_desc",
    from = 0,               // ✅ doğrudan body’den al
    size = 20
  } = req.body;

  try {
    const result = await boolSearch({
      keyword: query,
      filters,
      sortBy,
      from,
      size
    });

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

    res.json({
      cves,
      total: totalHits,
      totalPages,
      currentPage: Math.floor(from / size) + 1   // ✅ doğru sayfa hesaplaması
    });

  } catch (err) {
    console.error('Error in searchCves:', err);
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
