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
    _source: ['cveId', 'title', 'description', 'datePublished'], // sadece gerekli alanlar
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

// Fuzzy search (yazım hatalarına toleranslı, kısa kelimelerde dikkatli olun)
export async function fuzzySearch(query) {
  return await client.search({
    index: INDEX_NAME,
    body: {
      query: {
        match: {
          title: {
            query,
            fuzziness: 'AUTO' // otomatik olarak kelimenin uzunluğuna göre belirlenir
          }
        }
      }
    }
  });
}

// Range search (ör. tarih veya versiyon aralığı için)
export async function rangeSearch({ field, gte, lte }) {
  return await client.search({
    index: INDEX_NAME,
    _source: ['cveId', 'title', 'datePublished'], // sadece ilgili alanları döndür
    body: {
      query: {
        range: {
          [field]: { gte, lte }
        }
      },
      sort: [
        { [field]: { order: 'asc' } } // tarih/versiyon sıralı gelsin
      ]
    }
  });
}

// Bool search (çoklu koşul — full-text ve filtreleri bir arada)
export async function boolSearch({ keyword, state, dateFrom, dateTo }) {
  return await client.search({
    index: INDEX_NAME,
    body: {
      query: {
        bool: { // bool queies yapılan kısım
          must: [ // must içinde bir tane match (full-text, relevance içeren)
            { match: { title: keyword } }
          ],
          filter: [ // filter içinde term (exact match, skor etkilemez, daha hızlı) ve range (tarih aralığı, skor etkilemez)
            { term: { state } },
            { range: { datePublished: { gte: dateFrom, lte: dateTo } } }
          ]
        }
      }
    }
  });
}

// Profiled search (performans test etmek için)
export async function profiledSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    body: {
      profile: true,
      query: {
        match: {
          title: query
        }
      }
    }
  });
}


