<template>
  <div class="hero">
    <div class="hero-content">

      <div class="logo-block">
        <i class="bi bi-shield-lock-fill logo-icon"></i>
        <h1 class="logo-text">CVE<span>Search</span></h1>
      </div>

      <p class="tagline">Search vulnerabilities across the CVE database</p>

      <form @submit.prevent="searchCve" class="search-form">
        <div class="search-bar" :class="{ focused: isFocused }">
          <i class="bi bi-search bar-icon"></i>
          <input
            type="text"
            v-model="query"
            @focus="isFocused = true"
            @blur="isFocused = false"
            placeholder="Search CVE ID or keyword..."
            class="bar-input"
            autocomplete="off"
          />
          <div class="bar-actions">
            <button type="button" class="bar-btn" title="AI Search">
              <i class="bi bi-stars"></i>
            </button>
            <button type="button" class="bar-btn" title="Voice Search">
              <i class="bi bi-mic"></i>
            </button>
          </div>
          <button type="submit" class="search-submit">Search</button>
        </div>
        <p v-if="error" class="error-msg">
          <i class="bi bi-exclamation-circle"></i> {{ error }}
        </p>
      </form>

      <div v-if="popularSearches.length" class="chips-row">
        <span class="chips-label">Popular:</span>
        <button
          v-for="q in popularSearches"
          :key="q"
          type="button"
          @click="query = q; searchCve()"
          class="chip"
        >{{ q }}</button>
      </div>

      <div v-if="recentSearches.length" class="chips-row">
        <span class="chips-label">Recent:</span>
        <button
          v-for="q in recentSearches"
          :key="q"
          type="button"
          @click="query = q; searchCve()"
          class="chip chip-recent"
        >
          <i class="bi bi-clock-history"></i> {{ q }}
        </button>
      </div>

    </div>

    <div class="hero-stats">
      <div class="stat-card">
        <i class="bi bi-database-fill"></i>
        <span>Client-side Search</span>
      </div>
      <div class="stat-card">
        <i class="bi bi-shield-check"></i>
        <span>Latest 2026 CVE Records</span>
      </div>
      <div class="stat-card">
        <i class="bi bi-lightning-charge-fill"></i>
        <span>Instant Local Results</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const query = ref('')
const error = ref('')
const isFocused = ref(false)
const recentSearches = ref([])
const popularSearches = ref([
  'Facebook',
  'SQL Injection',
  'Buffer Overflow',
  'XSS',
  'Privilege Escalation'
])

const router = useRouter()

const searchCve = () => {
  if (!query.value.trim()) {
    error.value = 'Please enter a search term.'
    return
  }
  error.value = ''
  const q = query.value.trim()
  if (!recentSearches.value.includes(q)) {
    recentSearches.value.unshift(q)
    if (recentSearches.value.length > 5) recentSearches.value.pop()
  }
  router.push({ name: 'Results', query: { q } })
}
</script>

<style scoped>
.hero {
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem 2rem;
  background:
    radial-gradient(ellipse 90% 60% at 50% -5%, rgba(249, 115, 22, 0.07) 0%, transparent 65%),
    var(--bg);
  gap: 2.5rem;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 680px;
}

/* Logo */
.logo-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 3rem;
  color: var(--accent);
  filter: drop-shadow(0 0 18px rgba(249, 115, 22, 0.4));
}

.logo-text {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  margin: 0;
  color: var(--text);
}

.logo-text span {
  color: var(--accent);
}

/* Tagline */
.tagline {
  color: var(--text-muted);
  font-size: 1rem;
  margin: 0;
}

/* Search form */
.search-form {
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-full);
  padding: 0.5rem 0.5rem 0.5rem 1.25rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar.focused {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 4px var(--accent-dim);
}

.bar-icon {
  color: var(--text-subtle);
  font-size: 1rem;
  flex-shrink: 0;
}

.bar-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 1rem;
  font-family: inherit;
  padding: 0.35rem 0.25rem;
}

.bar-input::placeholder {
  color: var(--text-subtle);
}

.bar-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.bar-btn {
  background: transparent;
  border: none;
  color: var(--text-subtle);
  font-size: 1.05rem;
  cursor: pointer;
  padding: 0.4rem 0.5rem;
  border-radius: var(--radius-full);
  line-height: 1;
  transition: color 0.15s, background 0.15s;
}

.bar-btn:hover {
  color: var(--text-muted);
  background: var(--surface-2);
}

.search-submit {
  background: var(--accent);
  border: none;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0.55rem 1.4rem;
  border-radius: var(--radius-full);
  transition: opacity 0.15s, transform 0.1s;
  flex-shrink: 0;
}

.search-submit:hover {
  opacity: 0.9;
}

.search-submit:active {
  transform: scale(0.97);
}

/* Error */
.error-msg {
  color: #f87171;
  font-size: 0.85rem;
  margin: 0.5rem 0 0 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

/* Chips */
.chips-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chips-label {
  color: var(--text-subtle);
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.chip {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: inherit;
  padding: 0.3rem 0.75rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.chip:hover {
  border-color: var(--accent-border);
  color: var(--text);
  background: var(--accent-dim);
}

.chip-recent {
  color: var(--text-subtle);
}

/* Stats row */
.hero-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.6rem 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-card i {
  color: var(--accent);
  font-size: 0.95rem;
}
</style>
