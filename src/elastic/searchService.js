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


// Bool search
export async function boolSearch({ keyword, state, dateFrom, dateTo }) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
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
