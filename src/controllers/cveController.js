import client from '../elastic/elasticClient.js';
import { boostedSearch, boolSearch } from '../elastic/searchService.js';

const INDEX_NAME = 'cvelist';

// GET /api/cve/:cveId → tek bir CVE ID döner
// export async function getCveById(req, res) {
//   const { cveId } = req.params;

//   try {
//     const result = await client.search({
//       index: INDEX_NAME,
//       body: {
//         query: { term: { 'cveMetaData.cveId.keyword': cveId } } // dikkat: nested değil ama mapping'e bağlı olarak .keyword gerekebilir
//       }
//     });

//     if (result.hits.hits.length === 0) {
//       return res.status(404).json({ error: 'CVE not found' });
//     }

//     // res.json(result.hits.hits[0]._source);

//     const doc = result.hits.hits[0]._source;

//     const cve = {
//         cveId: doc.cveMetadata?.cveId || 'N/A',
//         title: doc.title || 'N/A',
//         state: doc.state || 'N/A',
//         datePublished: doc.datePublished || 'N/A',
//         dataVersion: doc.dataVersion || 'N/A',
//         description: doc.description || 'N/A',
//         problemType: doc.problemType || 'N/A',
//         affected: doc.affected || [],
//         references: doc.references || [],
//         providerOrgId: doc.providerOrgId || 'N/A',
//         cvssBaseScore: doc.cvssBaseScore || 'N/A'
//     };

//     res.json(cve);


//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

import { normalizeCve } from '../utils/normalizeCve.js';

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
    
    res.json(normalized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/cve/search → arama yapar ve sonuçları liste halinde döner
export async function searchCves(req, res) {
  const { query, state, dateFrom, dateTo } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    let result;

    if (state || (dateFrom && dateTo)) {
      result = await boolSearch({
        keyword: query,
        state,
        dateFrom,
        dateTo
      });
    } else {
      result = await boostedSearch(query);
    }

    // ** ÇOK ÖNEMLİ RESULTSTA CVEID BURADA DÖNÜYOR
    const cves = result.hits.hits.map(hit => {
      const doc = hit._source;
      return {
          cveId: doc.cveMetadata?.cveId || 'N/A',
          title: doc.title || 'N/A',
          state: doc.state || 'N/A',
          datePublished: doc.datePublished || 'N/A'
      };
    });
    res.json({ cves });
    // ** ÇOK ÖNEMLİ RESULTSTA CVEID BURADA DÖNÜYOR

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

// import client from '../elastic/elasticClient.js';
// import { boostedSearch, boolSearch } from '../elastic/searchService.js';
// // import { normalizeCve } from '../utils/normalizeCve.js';

// const INDEX_NAME = 'cvelist';

// // GET /api/cve/:cveId → tek bir CVE ID döner
// export async function getCveById(req, res) {
//   const { cveId } = req.params;

//   try {
//     const result = await client.search({
//       index: INDEX_NAME,
//       body: {
//         // query: { term: { 'cveMetaData.cveId.keyword': cveId } }
//         query: { term: { 'cveMetadata.cveId.keyword': cveId } }
//       }
//     });

//     if (result.hits.hits.length === 0) {
//       return res.status(404).json({ error: 'CVE not found' });
//     }

//     // const doc = result.hits.hits[0]._source;
//     res.json(result.hits.hits[0]._source);

//     const normalized = normalizeCve(doc);

//     res.json(normalized);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// // POST /api/cve/search → arama yapar ve sonuçları liste halinde döner
// export async function searchCves(req, res) {
//   const { query, state, dateFrom, dateTo } = req.body;

//   if (!query) {
//     return res.status(400).json({ error: 'Query is required' });
//   }

//   try {
//     let result;

//     if (state || (dateFrom && dateTo)) {
//       result = await boolSearch({
//         keyword: query,
//         state,
//         dateFrom,
//         dateTo
//       });
//     } else {
//       result = await boostedSearch(query);
//     }

//     const cves = result.hits.hits.map(hit => hit._source);

//     res.json({ cves });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// // GET /api/cve → (isteğe bağlı) tüm CVE kayıtlarını getirir (sınırlı sayıda)
// export async function getAllCves(req, res) {
//   try {
//     const result = await client.search({
//       index: INDEX_NAME,
//       body: {
//         size: 100,
//         query: { match_all: {} }
//       }
//     });

//     const cves = result.hits.hits.map(hit => hit._source);

//     res.json({ cves });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// // GET /api/cve/autocomplete?query=…
// export async function autocompleteCves(req, res) {
//   const { query } = req.query;

//   if (!query) return res.json([]);

//   try {
//     const result = await client.search({
//       index: INDEX_NAME,
//       size: 5,
//       body: {
//         query: {
//           match_phrase_prefix: {
//             'title': query
//           }
//         }
//       }
//     });

//     const suggestions = result.hits.hits.map(hit => hit._source.title);
//     res.json(suggestions);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }
