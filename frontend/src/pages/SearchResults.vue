<template>
  <div class="results-page">

    <!-- Top search bar -->
    <div class="results-header">
      <router-link to="/" class="back-logo">
        <i class="bi bi-shield-lock-fill"></i>
        CVE<span>Search</span>
      </router-link>
      <form @submit.prevent="performSearch" class="top-search">
        <div class="top-bar" :class="{ focused: topFocused }">
          <i class="bi bi-search top-icon"></i>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search CVEs..."
            class="top-input"
            @focus="topFocused = true"
            @blur="topFocused = false"
            autocomplete="off"
          />
          <button type="submit" class="top-submit">Search</button>
        </div>
      </form>
    </div>

    <div class="results-body">

      <!-- Filter panel -->
      <aside class="filter-panel">
        <div class="filter-header">
          <i class="bi bi-sliders"></i>
          <span>Filters</span>
        </div>

        <div class="filter-group">
          <label class="filter-label">State</label>
          <select v-model="selectedState" class="filter-select">
            <option value="all">All States</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Start Date</label>
          <input type="date" v-model="startDate" class="filter-input" />
        </div>

        <div class="filter-group">
          <label class="filter-label">End Date</label>
          <input type="date" v-model="endDate" class="filter-input" />
        </div>

        <div class="filter-group">
          <label class="filter-label">Sort By</label>
          <select v-model="sortBy" class="filter-select">
            <option value="default">Relevance</option>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
        </div>

        <button @click="applyFilters" class="apply-btn">
          <i class="bi bi-check2"></i> Apply Filters
        </button>
        <button @click="resetFilters" class="reset-btn">
          Reset
        </button>
      </aside>

      <!-- Results area -->
      <main class="results-main">

        <!-- Count -->
        <div v-if="!isLoading && cves.length > 0" class="result-count">
          <i class="bi bi-grid-3x3-gap-fill"></i>
          <strong>{{ totalResults.toLocaleString() }}</strong> results found
        </div>

        <!-- Error -->
        <div v-if="error" class="error-banner">
          <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Searching...</span>
        </div>

        <!-- Empty -->
        <div v-else-if="!isLoading && cves.length === 0 && searchTerm" class="empty-state">
          <i class="bi bi-search"></i>
          <h4>No results found</h4>
          <p>Try a different keyword or adjust your filters.</p>
        </div>

        <!-- Table -->
        <div v-if="cves.length > 0" class="table-wrap">
          <table class="cve-table">
            <thead>
              <tr>
                <th>CVE ID</th>
                <th>Title</th>
                <th>State</th>
                <th>Date Published</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cve in cves" :key="cve.cveId" class="cve-row">
                <td>
                  <router-link :to="`/cve/${cve.cveId}`" class="cve-id-link">
                    {{ cve.cveId }}
                  </router-link>
                </td>
                <td class="title-cell">{{ cve.title || '—' }}</td>
                <td>
                  <span class="state-badge" :class="cve.state === 'PUBLISHED' ? 'badge-published' : 'badge-rejected'">
                    {{ cve.state }}
                  </span>
                </td>
                <td class="date-cell">{{ formatDate(cve.datePublished) }}</td>
                <td>
                  <router-link :to="`/cve/${cve.cveId}`" class="detail-btn">
                    <i class="bi bi-arrow-right"></i>
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="goToFirstPage">«</button>
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">‹</button>

          <button
            v-for="page in visiblePages"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >{{ page }}</button>

          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">›</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="goToLastPage">»</button>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const searchTerm = ref('')
const selectedState = ref('all')
const startDate = ref('')
const endDate = ref('')
const sortBy = ref('default')
const topFocused = ref(false)

const cves = ref([])
const isLoading = ref(false)
const error = ref('')

const currentPage = ref(1)
const pageSize = 20
const totalResults = ref(0)
const totalPages = ref(1)
const searchMode = ref('simple')

onMounted(async () => {
  const query = route.query.q
  if (query) {
    searchTerm.value = query
    await performSearch()
  }
})

const performSearch = async () => {
  searchMode.value = 'simple'
  currentPage.value = 1
  isLoading.value = true
  error.value = ''
  try {
    const res = await axios.post('http://localhost:3000/api/cve/search', {
      query: searchTerm.value,
      from: 0,
      size: pageSize,
      mode: 'simple'
    })
    cves.value = res.data.cves || []
    totalResults.value = res.data.total || 0
    totalPages.value = Math.ceil(totalResults.value / pageSize)
  } catch (err) {
    console.error(err)
    error.value = 'Failed to fetch search results.'
  } finally {
    isLoading.value = false
  }
}

const applyFilters = async () => {
  currentPage.value = 1
  await performSearchWithFilters()
}

const resetFilters = () => {
  selectedState.value = 'all'
  startDate.value = ''
  endDate.value = ''
  sortBy.value = 'default'
  performSearch()
}

const performSearchWithFilters = async () => {
  searchMode.value = 'filtered'
  isLoading.value = true
  error.value = ''
  try {
    const res = await axios.post('http://localhost:3000/api/cve/search', {
      query: searchTerm.value,
      filters: {
        state: selectedState.value !== 'all' ? selectedState.value : undefined,
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined
      },
      sortBy: sortBy.value !== 'default' ? sortBy.value : undefined,
      from: (currentPage.value - 1) * pageSize,
      size: pageSize
    })
    cves.value = res.data.cves || []
    totalResults.value = res.data.total || 0
    totalPages.value = Math.ceil(totalResults.value / pageSize)
  } catch (err) {
    console.error(err)
    error.value = 'Failed to fetch filtered results.'
  } finally {
    isLoading.value = false
  }
}

const visiblePages = computed(() => {
  const max = 10
  const half = Math.floor(max / 2)
  let start = Math.max(1, currentPage.value - half)
  let end = Math.min(totalPages.value, start + max - 1)
  if (end - start < max - 1) start = Math.max(1, end - max + 1)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const goToPage = async (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  if (searchMode.value === 'filtered') await performSearchWithFilters()
  else await performSearch()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const nextPage = () => { if (currentPage.value < totalPages.value) goToPage(currentPage.value + 1) }
const prevPage = () => { if (currentPage.value > 1) goToPage(currentPage.value - 1) }
const goToFirstPage = () => goToPage(1)
const goToLastPage = () => goToPage(totalPages.value)

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.results-page {
  min-height: calc(100vh - 60px);
  background: var(--bg);
}

/* Header */
.results-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: 60px;
  z-index: 50;
}

.back-logo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  white-space: nowrap;
  flex-shrink: 0;
}

.back-logo i {
  color: var(--accent);
}

.back-logo span {
  color: var(--accent);
}

.top-search {
  flex: 1;
  max-width: 640px;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  padding: 0.35rem 0.35rem 0.35rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.top-bar.focused {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-dim);
}

.top-icon {
  color: var(--text-subtle);
  font-size: 0.9rem;
  flex-shrink: 0;
}

.top-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
  padding: 0.25rem 0;
}

.top-input::placeholder {
  color: var(--text-subtle);
}

.top-submit {
  background: var(--accent);
  border: none;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0.4rem 1.1rem;
  border-radius: var(--radius-full);
  transition: opacity 0.15s;
}

.top-submit:hover { opacity: 0.9; }

/* Body layout */
.results-body {
  display: flex;
  gap: 0;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0;
}

/* Filter panel */
.filter-panel {
  width: 240px;
  flex-shrink: 0;
  padding: 1.5rem 1.25rem;
  border-right: 1px solid var(--border);
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.filter-header i {
  color: var(--accent);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-label {
  color: var(--text-subtle);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-select,
.filter-input {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 0.875rem;
  font-family: inherit;
  padding: 0.45rem 0.75rem;
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
}

.filter-select:focus,
.filter-input:focus {
  border-color: var(--accent-border);
}

.filter-select option {
  background: var(--surface-2);
}

.filter-input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.6);
}

.apply-btn {
  background: var(--accent);
  border: none;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  padding: 0.6rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: opacity 0.15s;
  margin-top: 0.5rem;
}

.apply-btn:hover { opacity: 0.9; }

.reset-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: inherit;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  text-align: center;
}

.reset-btn:hover {
  border-color: var(--text-subtle);
  color: var(--text);
}

/* Main results area */
.results-main {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow: hidden;
}

.result-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.result-count i {
  color: var(--accent);
  font-size: 0.85rem;
}

.error-banner {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--text-muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 0;
  color: var(--text-subtle);
}

.empty-state i {
  font-size: 2.5rem;
}

.empty-state h4 {
  color: var(--text-muted);
  margin: 0;
  font-size: 1.1rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Table */
.table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.cve-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.cve-table thead {
  background: var(--surface);
}

.cve-table th {
  padding: 0.75rem 1rem;
  color: var(--text-subtle);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.cve-row {
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}

.cve-row:last-child {
  border-bottom: none;
}

.cve-row:hover {
  background: var(--surface);
}

.cve-table td {
  padding: 0.85rem 1rem;
  color: var(--text-muted);
  vertical-align: middle;
}

.cve-id-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.cve-id-link:hover { opacity: 0.8; }

.title-cell {
  max-width: 380px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text);
}

.state-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-published {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.badge-rejected {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border: 1px solid rgba(248, 113, 113, 0.25);
}

.date-cell {
  white-space: nowrap;
  font-size: 0.825rem;
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-subtle);
  text-decoration: none;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background 0.15s;
}

.detail-btn:hover {
  color: var(--accent);
  background: var(--accent-dim);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.5rem 0;
}

.page-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.875rem;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-border);
  color: var(--text);
}

.page-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
