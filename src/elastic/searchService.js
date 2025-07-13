/*
Amacı:
- Index’e sorgu göndermek
- Gelen sonuçları dönmek
- Sorgu tipini (dynamic veya static mapping) etkilemez
*/

import client from './elasticClient.js';

const INDEX_NAME = 'cvelist';

// Basit match search
export async function simpleSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    body: {
      query: {
        match: {
          title: query
        }
      }
    }
  });
}

// Boosted search (title > description)
export async function boostedSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    body: {
      query: {
        multi_match: {
          query: query,
          fields: [
            'title^2', // RELEVANCE TUNING için boosting uygulanıyor, arama da öncelik verilen field değeri artırılıyor
            'description'
          ]
        }
      }
    }
  });
}

// Fuzzy search (yazım hatalarına toleranslı)
export async function fuzzySearch(query) {
  return await client.search({
    index: INDEX_NAME,
    body: {
      query: {
        match: {
          title: {
            query: query,
            fuzziness: 'AUTO'
          }
        }
      }
    }
  });
}

// Range search (tarih veya versiyon)
export async function rangeSearch({ field, gte, lte }) {
  return await client.search({
    index: INDEX_NAME,
    body: {
      query: {
        range: {
          [field]: {
            gte,
            lte
          }
        }
      }
    }
  });
}

// Bool search (çoklu koşul)
export async function boolSearch({ keyword, state, dateFrom, dateTo }) {
  return await client.search({
    index: INDEX_NAME,
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
      }
    }
  });
}

