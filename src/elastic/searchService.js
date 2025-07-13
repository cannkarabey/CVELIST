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

// Relevance Tuning, Field Boosting, Document Boosting ve Scoring optimizasyonları uygular.

export async function boostedSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    body: {
      query: {
        function_score: {
          // Temel sorgu: multi_match
          query: {
            multi_match: {
              query: query,            // Kullanıcının yazdığı kelime/terim
              fields: [
                'title^3',            // title alanı en önemli (3x boost)
                'description^1.5',    // description alanı orta önemde (1.5x)
                'tags^0.8'            // tags alanı daha az önemli (0.8x)
              ],
              type: 'best_fields'     // En iyi eşleşen field seçilir
            }
          },
          functions: [ // Ek scoring yapar
            { 
              filter: { term: { state: 'published' } }, // state:published olan belgelerin skorunu artır
              weight: 2               
            },
            {
              filter: { term: { state: 'deprecated' } }, // // state:deprecated olan belgelerin skorunu düşür
              weight: 0.5           
            },
            {
              gauss: { // Tarihi daha yeni olan belgeler öne çıkarır
                datePublished: {
                  origin: 'now',     // Şu anki tarih
                  scale: '30d',      // 30 gün içindekiler öncelikli
                  offset: '5d',      // İlk 5 gün tam öncelikli
                  decay: 0.5         // Etkisi uzak tarihlerde yarı yarıya azalır
                }
              }
            }
          ],
           // Skorların nasıl birleştirileceğini belirler
          boost_mode: 'multiply',    // Ana skorla çarp
          score_mode: 'sum'          // Tüm katkıları topla
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

