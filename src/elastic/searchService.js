import client from './elasticClient.js';

const INDEX_NAME = 'cvelist';

const FULL_SOURCE_FIELDS = [
  'cveMetadata', 'title', 'version', 'datePublished', 'state',
  'affected', 'descriptions', 'problemTypes', 'providerMetadata',
  'references', 'cvssV3_1'
];

function getSortClause(sortBy) {
  switch (sortBy) {
    case 'newest':
      return [{ datePublished: { order: 'desc' } }];
    case 'oldest':
      return [{ datePublished: { order: 'asc' } }];
    case 'a-z':
      return [{ 'title.keyword': { order: 'asc' } }];
    case 'z-a':
      return [{ 'title.keyword': { order: 'desc' } }];
    default:
      return [{ datePublished: { order: 'desc' } }];
  }
}

function buildFilterClause(state, problemType, dateFrom, dateTo) {
  const filters = [];

  if (state && state !== 'All States') {
    filters.push({ term: { state } });
  }

  if (problemType && problemType !== 'All Types') {
    filters.push({ term: { 'problemTypes.cweId.keyword': problemType } });
  }

  if (dateFrom || dateTo) {
    const range = {};
    if (dateFrom) range.gte = dateFrom;
    if (dateTo) range.lte = dateTo;
    filters.push({ range: { datePublished: range } });
  }

  return filters;
}

// Simple Search
export async function simpleSearch({ keyword, state, problemType, dateFrom, dateTo, sortBy, from, size }) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    from,
    size,
    body: {
      query: {
        bool: {
          must: [
            { match: { title: { query: keyword, fuzziness: 'AUTO', operator: 'or' } } }
          ],
          filter: buildFilterClause(state, problemType, dateFrom, dateTo)
        }
      },
      sort: getSortClause(sortBy)
    }
  });
}

// Boosted Search
export async function boostedSearch({ keyword, state, problemType, dateFrom, dateTo, sortBy, from, size }) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    from,
    size,
    body: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: keyword,
                fields: ['title^3', 'description^2', 'tags^1'],
                type: 'best_fields'
              }
            }
          ],
          filter: buildFilterClause(state, problemType, dateFrom, dateTo)
        }
      },
      sort: getSortClause(sortBy)
    }
  });
}

// Fuzzy Search
export async function fuzzySearch({ keyword, state, problemType, dateFrom, dateTo, sortBy, from, size }) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    from,
    size,
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                title: {
                  query: keyword,
                  fuzziness: 'AUTO',
                  prefix_length: 1,
                  max_expansions: 50,
                  operator: 'and'
                }
              }
            }
          ],
          filter: buildFilterClause(state, problemType, dateFrom, dateTo)
        }
      },
      sort: getSortClause(sortBy)
    }
  });
}

// Range Search
export async function rangeSearch({ field, gte, lte, from, size, sortBy }) {
  const lower = gte || '1999-01-01';
  const upper = lte || '2025-12-31';

  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    from,
    size,
    body: {
      query: {
        range: {
          [field]: { gte: lower, lte: upper }
        }
      },
      sort: getSortClause(sortBy)
    }
  });
}

// Bool Search
export async function boolSearch({ keyword, state, problemType, dateFrom, dateTo, sortBy, from, size }) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    from,
    size,
    body: {
      query: {
        bool: {
          must: [
            { match: { title: keyword } }
          ],
          filter: buildFilterClause(state, problemType, dateFrom, dateTo)
        }
      },
      sort: getSortClause(sortBy)
    }
  });
}

// Profiled Search
export async function profiledSearch({ keyword, from, size, sortBy }) {
  return await client.search({
    index: INDEX_NAME,
    _source: FULL_SOURCE_FIELDS,
    from,
    size,
    body: {
      profile: true,
      query: {
        match: {
          title: keyword
        }
      },
      sort: getSortClause(sortBy)
    }
  });
}

