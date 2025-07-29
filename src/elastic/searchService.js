import client from './elasticClient.js';

const INDEX_NAME = 'cvelist';

const FULL_SOURCE_FIELDS = [
  'cveMetadata',
  'title',
  'version',
  'datePublished',
  'state',
  'affected',
  'descriptions',
  'problemTypes',
  'providerMetadata',
  'references',
  'cvssV3_1'
];

// Basit match search (full-text için önerilir)
export async function simpleSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    size: 10000,
    body: {
      query: {
        match: {
          title: {
            query: query,
            fuzziness: 'AUTO',  // Yazım hatalarına karşı esneklik sağlar
            operator: 'or'     // Tüm kelimelerin eşleşmesi gerekmediğini belirtir
          }
        }
      },
      sort: [
        { "datePublished": { "order": "desc" } }
      ]
    }
  });
}

export async function boostedSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    size: 10000,
    body: {
      query: {
        multi_match: {
          query: query,
          fields: [
            'title^3',
            'description^2',
            'tags^1'
          ],
          type: 'best_fields'
        }
      },
      sort: [
        { "datePublished": { "order": "desc" } }
      ]
    }
  });
}

// Fuzzy search
export async function fuzzySearch(query) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    size: 10000,
    body: {
      query: {
        match: {
          title: {
            query: query,
            fuzziness: 'AUTO',      // otomatik olarak karakter değişim toleransı
            prefix_length: 1,       // ilk 1 harf sabit, sonrası fuzzy
            max_expansions: 50,     // ne kadar varyasyon denensin
            operator: 'and'         // tüm kelimeler eşleşmeli
          }
        }
      },
      sort: [
        { "datePublished": { "order": "desc" } }
      ]
    }
  });
}

// Range search
export async function rangeSearch({ field, gte, lte }) {
  const lowerBound = gte || '1999-01-01';
  const upperBound = lte || '2025-12-31';

  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    size: 10000,
    body: {
      query: {
        range: {
          [field]: {
            gte: lowerBound,
            lte: upperBound
          }
        }
      },
      sort: [
        { [field]: { order: 'desc' } }
      ]
    }
  });
}

// export async function boolSearch({ keyword, filters = {}, sortBy = "date_desc" }) {
//   const mustQueries = [];
//   const filterQueries = [];

//   // 1. Anahtar kelime varsa title içinde ara
//   if (keyword && keyword.trim() !== "") {
//     mustQueries.push({
//       match: {
//         title: {
//           query: keyword,
//           fuzziness: "AUTO",
//           operator: "or"
//         }
//       }
//     });
//   }

//   // 2. State filtresi
//   if (filters.state && filters.state !== "all") {
//     filterQueries.push({ term: { state: filters.state } });
//   }

//   // 3. Problem type filtresi (descriptions.value içinde match yapılabilir)
//   if (filters.problemType && filters.problemType !== "all") {
//     mustQueries.push({
//       match: {
//         "problemTypes.descriptions.value": filters.problemType
//       }
//     });
//   }

//   // 4. Tarih aralığı
//   if (filters.startDate || filters.endDate) {
//     const dateRange = {};
//     if (filters.startDate) dateRange.gte = filters.startDate;
//     if (filters.endDate) dateRange.lte = filters.endDate;
//     filterQueries.push({
//       range: {
//         datePublished: dateRange
//       }
//     });
//   }

//   // 5. Sıralama
//   let sort = [{ datePublished: { order: "desc" } }];
//   if (sortBy === "date_asc") sort = [{ datePublished: { order: "asc" } }];
//   else if (sortBy === "title_asc") sort = [{ title: { order: "asc" } }];
//   else if (sortBy === "title_desc") sort = [{ title: { order: "desc" } }];

//   return await client.search({
//     index: INDEX_NAME,
//     _source: FULL_SOURCE_FIELDS,
//     size: 10000,
//     body: {
//       query: {
//         bool: {
//           must: mustQueries,
//           filter: filterQueries
//         }
//       },
//       sort
//     }
//   });
// }

export async function boolSearch({ keyword, filters = {}, sortBy = "date_desc", from = 0, size = 20 }) {
  const mustQueries = [];
  const filterQueries = [];

  // Anahtar kelime
  if (keyword && keyword.trim() !== "") {
    mustQueries.push({
      match: {
        title: {
          query: keyword,
          fuzziness: "AUTO",
          operator: "or"
        }
      }
    });
  }

  // Filtre: state
  if (filters.state) {
    filterQueries.push({ term: { state: filters.state } });
  }

  // Filtre: problem type
  if (filters.problemType) {
    mustQueries.push({
      match: {
        "problemTypes.descriptions.value": filters.problemType
      }
    });
  }

  // Filtre: tarih aralığı
  if (filters.startDate || filters.endDate) {
    const dateRange = {};
    if (filters.startDate) dateRange.gte = filters.startDate;
    if (filters.endDate) dateRange.lte = filters.endDate;
    filterQueries.push({
      range: {
        datePublished: dateRange
      }
    });
  }

  // Sıralama
  let sort = [{ datePublished: { order: "desc" } }];
  if (sortBy === "date_asc") sort = [{ datePublished: { order: "asc" } }];
  else if (sortBy === "title_asc") sort = [{ "title.keyword": { order: "asc" } }];
  else if (sortBy === "title_desc") sort = [{ "title.keyword": { order: "desc" } }];

  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    from,
    size,
    body: {
      query: {
        bool: {
          must: mustQueries,
          filter: filterQueries
        }
      },
      sort
    }
  });
}

// Profiled search
export async function profiledSearch(query) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
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
