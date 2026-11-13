const DATA_URL = '/data/cves.json'

let loadPromise = null
let byId = null
let lastSearch = { key: null, results: [] }

export function loadCves() {
  if (!loadPromise) {
    loadPromise = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`CVE dataset could not be loaded (HTTP ${res.status}).`)
        return res.json()
      })
      .then((list) => {
        if (!Array.isArray(list)) throw new Error('CVE dataset has an invalid format.')
        byId = new Map()
        for (const cve of list) {
          cve._title = (cve.title || '').toLowerCase()
          cve._rest = [cve.description, cve.problemType, ...(cve.affected || [])]
            .filter(Boolean)
            .join('\n')
            .toLowerCase()
          byId.set(cve.cveId.toUpperCase(), cve)
        }
        return list
      })
      .catch((err) => {
        loadPromise = null
        throw err
      })
  }
  return loadPromise
}

export async function getCveById(cveId) {
  await loadCves()
  return byId.get(String(cveId).toUpperCase()) || null
}

function score(cve, terms) {
  const id = cve.cveId.toLowerCase()
  let s = 0
  for (const t of terms) {
    if (id.includes(t)) s += 5
    if (cve._title.includes(t)) s += 3
    if (cve._rest.includes(t)) s += 1
  }
  return s
}

function runSearch({ query, state, startDate, endDate, sortBy }) {
  return loadCves().then((all) => {
    const terms = (query || '').toLowerCase().split(/\s+/).filter(Boolean)
    let rows = []
    if (terms.length) {
      for (const cve of all) {
        const s = score(cve, terms)
        if (s > 0) rows.push({ cve, s })
      }
    } else {
      rows = all.map((cve) => ({ cve, s: 0 }))
    }

    if (state) rows = rows.filter((r) => r.cve.state === state)
    if (startDate) rows = rows.filter((r) => (r.cve.datePublished || '').slice(0, 10) >= startDate)
    if (endDate) rows = rows.filter((r) => (r.cve.datePublished || '').slice(0, 10) <= endDate)

    const date = (r) => r.cve.datePublished || ''
    if (sortBy === 'date_asc') rows.sort((a, b) => date(a).localeCompare(date(b)))
    else if (sortBy === 'date_desc' || !terms.length) rows.sort((a, b) => date(b).localeCompare(date(a)))
    else rows.sort((a, b) => b.s - a.s || date(b).localeCompare(date(a)))

    return rows.map((r) => r.cve)
  })
}

export async function searchCves({ query = '', state, startDate, endDate, sortBy, page = 1, pageSize = 20 }) {
  const key = JSON.stringify([query, state, startDate, endDate, sortBy])
  if (lastSearch.key !== key) {
    lastSearch = { key, results: await runSearch({ query, state, startDate, endDate, sortBy }) }
  }
  const { results } = lastSearch
  const start = (page - 1) * pageSize
  return {
    cves: results.slice(start, start + pageSize),
    total: results.length,
    totalPages: Math.ceil(results.length / pageSize)
  }
}
