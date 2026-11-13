<template>
  <div class="detail-page">
    <div class="detail-container">

      <router-link to="/results" class="back-link">
        <i class="bi bi-arrow-left"></i> Back to Results
      </router-link>

      <div v-if="error" class="error-banner">
        <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <span>Loading CVE details...</span>
      </div>

      <template v-if="cve && !isLoading">

        <!-- Title row -->
        <div class="detail-hero">
          <div class="cve-id-badge">{{ cve.cveId }}</div>
          <div v-if="cve.cvssBaseScore" class="cvss-badge" :class="cvssClass(cve.cvssBaseScore)">
            CVSS {{ cve.cvssBaseScore }}
          </div>
          <span class="state-badge" :class="cve.state === 'PUBLISHED' ? 'badge-published' : 'badge-rejected'">
            {{ cve.state }}
          </span>
        </div>

        <h2 class="detail-title">{{ cve.title || 'Untitled Vulnerability' }}</h2>

        <!-- Main card -->
        <div class="detail-card">

          <!-- Description -->
          <section class="detail-section">
            <h3 class="section-title"><i class="bi bi-file-text"></i> Description</h3>
            <p class="section-body">{{ cve.description || 'No description available.' }}</p>
          </section>

          <div class="divider"></div>

          <!-- Meta grid -->
          <section class="detail-section">
            <h3 class="section-title"><i class="bi bi-info-circle"></i> Details</h3>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label">Date Published</span>
                <span class="meta-value">{{ formatDate(cve.datePublished) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Problem Type</span>
                <span class="meta-value">{{ cve.problemType || '—' }}</span>
              </div>
              <div v-if="cve.cvssBaseScore" class="meta-item">
                <span class="meta-label">CVSS v3.1 Base Score</span>
                <span class="meta-value" :class="'cvss-text-' + cvssClass(cve.cvssBaseScore)">
                  {{ cve.cvssBaseScore }}
                </span>
              </div>
            </div>
          </section>

          <!-- Affected -->
          <template v-if="cve.affected && cve.affected.length">
            <div class="divider"></div>
            <section class="detail-section">
              <h3 class="section-title"><i class="bi bi-cpu"></i> Affected Products</h3>
              <div class="tag-list">
                <span v-for="(aff, idx) in cve.affected" :key="idx" class="tag">{{ aff }}</span>
              </div>
            </section>
          </template>

          <!-- References -->
          <template v-if="cve.references && cve.references.length">
            <div class="divider"></div>
            <section class="detail-section">
              <h3 class="section-title"><i class="bi bi-link-45deg"></i> References</h3>
              <ul class="ref-list">
                <li v-for="(ref, idx) in cve.references" :key="idx" class="ref-item">
                  <div class="ref-tags" v-if="ref.tags && ref.tags.length">
                    <span v-for="t in (Array.isArray(ref.tags) ? ref.tags : [ref.tags])" :key="t" class="ref-tag">{{ t }}</span>
                  </div>
                  <a :href="ref.url" target="_blank" rel="noopener noreferrer" class="ref-url">
                    {{ ref.url }}
                    <i class="bi bi-box-arrow-up-right"></i>
                  </a>
                </li>
              </ul>
            </section>
          </template>

        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCveById } from '../api/cveApi.js'

const route = useRoute()
const cve = ref(null)
const error = ref('')
const isLoading = ref(true)

onMounted(async () => {
  const cveId = route.params.cveId
  if (!cveId) {
    error.value = 'CVE ID is missing in the route.'
    isLoading.value = false
    return
  }
  try {
    cve.value = await getCveById(cveId)
    if (!cve.value) error.value = `${cveId} was not found in the dataset.`
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Failed to load CVE details.'
  } finally {
    isLoading.value = false
  }
})

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const cvssClass = (score) => {
  const s = parseFloat(score)
  if (s >= 9) return 'critical'
  if (s >= 7) return 'high'
  if (s >= 4) return 'medium'
  return 'low'
}
</script>

<style scoped>
.detail-page {
  min-height: calc(100vh - 60px);
  background: var(--bg);
  padding: 2rem 1.5rem;
}

.detail-container {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.15s;
  width: fit-content;
}

.back-link:hover { color: var(--text); }

/* Error */
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
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem 0;
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

/* Hero row */
.detail-hero {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.cve-id-badge {
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.3rem 0.9rem;
  border-radius: var(--radius-full);
  letter-spacing: 0.02em;
}

.cvss-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-full);
  border: 1px solid;
}

.cvss-badge.critical {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.cvss-badge.high {
  background: rgba(249, 115, 22, 0.12);
  border-color: var(--accent-border);
  color: var(--accent);
}

.cvss-badge.medium {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.3);
  color: #eab308;
}

.cvss-badge.low {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
  color: #4ade80;
}

.state-badge {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid;
}

.badge-published {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
  color: #4ade80;
}

.badge-rejected {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.25);
  color: #f87171;
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.4;
}

/* Card */
.detail-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.detail-section {
  padding: 1.5rem;
}

.divider {
  height: 1px;
  background: var(--border);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-subtle);
  margin: 0 0 1rem;
}

.section-title i {
  color: var(--accent);
  font-size: 0.9rem;
}

.section-body {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.7;
  margin: 0;
}

/* Meta grid */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  color: var(--text-subtle);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  color: var(--text);
  font-size: 0.9rem;
}

.meta-value.mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cvss-text-critical { color: #ef4444; font-weight: 700; }
.cvss-text-high { color: var(--accent); font-weight: 700; }
.cvss-text-medium { color: #eab308; font-weight: 700; }
.cvss-text-low { color: #4ade80; font-weight: 700; }

/* Tags */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.8rem;
  padding: 0.25rem 0.7rem;
  border-radius: var(--radius-full);
}

/* References */
.ref-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ref-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.ref-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.ref-tag {
  background: var(--accent-dim);
  border: 1px solid var(--accent-border);
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ref-url {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  word-break: break-all;
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  transition: color 0.15s;
}

.ref-url:hover { color: var(--accent); }

.ref-url i {
  font-size: 0.7rem;
  flex-shrink: 0;
}
</style>
