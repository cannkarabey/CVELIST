<template>
  <div class="container mt-5">
    <h1 class="text-center text-primary mb-4">
      <i class="bi bi-shield-lock"></i> CVE Search
    </h1>

    <div class="row justify-content-center">
      <div class="col-md-6">
        <form @submit.prevent="searchCve">
          <div class="input-group mb-3 position-relative">
            <!-- Büyüteç -->
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>

            <!-- Arama input -->
            <input
              type="text"
              v-model="query"
              @input="fetchSuggestions"
              class="form-control"
              placeholder="CVE ID or keyword"
            />

            <!-- Search butonu -->
            <button type="submit" class="btn btn-primary">Search</button>

            <!-- Öneriler -->
            <!-- <ul
              v-if="suggestions.length"
              class="list-group position-absolute w-100"
              style="z-index: 10; top: 100%;"
            >
              <li
                v-for="s in suggestions"
                :key="s"
                @click="selectSuggestion(s)"
                class="list-group-item list-group-item-action"
                style="cursor: pointer;"
              >
                {{ s }}
              </li>
            </ul> -->
          </div>
        </form>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-if="recentSearches.length" class="mt-4 text-center">
          <h5>Recent  Searches</h5>
          <ul class="list-inline">
            <li
              v-for="q in recentSearches"
              :key="q"
              class="list-inline-item"
            >
              <button @click="query = q; searchCve()" class="btn btn-sm btn-outline-secondary">{{ q }}</button>
            </li>
          </ul>
        </div>

        <div v-if="popularSearches.length" class="mt-4 text-center">
          <h5>Popular Searches</h5>
          <ul class="list-inline">
            <li
              v-for="q in popularSearches"
              :key="q"
              class="list-inline-item"
            >
              <button @click="query = q; searchCve()" class="btn btn-sm btn-outline-primary">{{ q }}</button>
            </li>
          </ul>
        </div>

        <!-- <div v-if="recentSearches.length" class="mt-4 text-center">
          <h5>Recent Searches</h5>
          <ul class="list-inline">
            <li
              v-for="q in recentSearches"
              :key="q"
              class="list-inline-item"
            >
              <button @click="query = q; searchCve()" class="btn btn-sm btn-outline-secondary">{{ q }}</button>
            </li>
          </ul>
        </div>
        <div v-else class="text-center text-muted mt-3">
          <h6>There has been no search yet.</h6>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const query = ref('')
const error = ref('')
const suggestions = ref([])
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
    error.value = 'The search term is required.'
    return
  }
  error.value = ''
  if (!recentSearches.value.includes(query.value.trim())) {
    recentSearches.value.unshift(query.value.trim())
    if (recentSearches.value.length > 5) {
      recentSearches.value.pop()
    }
  }
  suggestions.value = []
  router.push({ name: 'Results', query: { q: query.value.trim() } })
}

// const fetchSuggestions = async () => {
//   if (!query.value.trim()) {
//     suggestions.value = []
//     return
//   }
//   try {
//     const res = await axios.get(`/api/cve/autocomplete?query=${encodeURIComponent(query.value.trim())}`)
//     suggestions.value = res.data
//   } catch (err) {
//     console.error(err)
//     suggestions.value = []
//   }
// }

// const selectSuggestion = (s) => {
//   query.value = s
//   suggestions.value = []
//   searchCve()
// }
</script>
