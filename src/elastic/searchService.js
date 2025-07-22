/*
Amacı:
- Index’e sorgu göndermek
- Gelen sonuçları dönmek
- Sorgu tipini (dynamic veya static mapping) etkilemez
*/

import client from './elasticClient.js';

const INDEX_NAME = 'cvelist';

// Basit match search (full-text için önerilir)
export async function simpleSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    _source: ['cveId', 'title', 'description', 'datePublished'],
    size: 10000, // daha fazla kayıt getir
    body: {
      query: {
        match: {
          title: query
        }
      },
      sort: [
        { "datePublished": { "order": "asc" } } // en eski tarihten başla
      ]
    }
  });
}

export async function boostedSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    _source: [
      'cveId',
      'title',
      'description',
      'datePublished',
      'state'
    ],
    size: 10000, // mümkün olan maksimum sayı
    body: {
      query: {
        function_score: {
          query: {
            multi_match: {
              query: query,
              fields: [
                'title^3',
                'description^1.5',
                'tags^0.8'
              ],
              type: 'best_fields'
            }
          },
          functions: [
            {
              filter: { term: { state: 'published' } },
              weight: 2
            },
            {
              filter: { term: { state: 'deprecated' } },
              weight: 0.5
            },
            {
              gauss: {
                datePublished: {
                  origin: 'now',
                  scale: '30d',
                  offset: '5d',
                  decay: 0.5
                }
              }
            }
          ],
          boost_mode: 'multiply',
          score_mode: 'sum'
        }
      },
      sort: [
        { "datePublished": { "order": "desc" } } // yeni -> eski
      ]
    }
  });
}

// Fuzzy search (yazım hatalarına toleranslı, kısa kelimelerde dikkatli olun)
export async function fuzzySearch(query) {
  return await client.search({
    index: INDEX_NAME,
    _source: ['cveId', 'title', 'description', 'datePublished'],
    size: 10000,
    body: {
      query: {
        match: {
          title: {
            query,
            fuzziness: 'AUTO'
          }
        }
      },
      sort: [
        { "datePublished": { "order": "asc" } }
      ]
    }
  });
}

// Range search (ör. tarih veya versiyon aralığı için)
export async function rangeSearch({ field, gte, lte }) {
  return await client.search({
    index: INDEX_NAME,
    _source: ['cveId', 'title', 'datePublished'],
    size: 10000,
    body: {
      query: {
        range: {
          [field]: { gte, lte }
        }
      },
      sort: [
        { [field]: { order: 'asc' } }
      ]
    }
  });
}

// Bool search (çoklu koşul — full-text ve filtreleri bir arada)
export async function boolSearch({ keyword, state, dateFrom, dateTo }) {
  return await client.search({
    index: INDEX_NAME,
    _source: ['cveId', 'title', 'description', 'datePublished'],
    size: 10000,
    body: {
      query: {
        bool: {
          must: [
            { match: { title: keyword } }
          ],
          filter: [
            { term: { state } },
            { range: { datePublished: { gte: dateFrom, lte: dateTo } } }
          ]
        }
      },
      sort: [
        { "datePublished": { "order": "asc" } }
      ]
    }
  });
}

// Profiled search (performans test etmek için)
export async function profiledSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    _source: [
      'cveMetadata.cveId',
      'cveMetadata.state',
      'title',
      'description',
      'datePublished'
    ],
    size: 10000,
    body: {
      profile: true,
      query: {
        match: {
          title: query
        }
      },
      sort: [
        { "datePublished": { "order": "asc" } }
      ]
    }
  });
}
