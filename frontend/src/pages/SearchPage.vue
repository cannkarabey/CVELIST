<template>
  <div class="container mt-5">
    <h1 class="text-center text-primary mb-4">
      <i class="bi bi-shield-lock"></i> CVE Search
    </h1>

    <div class="row justify-content-center">
      <div class="col-md-6">
        <form @submit.prevent="searchCve">
          <div class="input-group mb-3">
            <input
              type="text"
              v-model="query"
              class="form-control"
              placeholder="CVE ID veya anahtar kelime"
            />
            <button type="submit" class="btn btn-primary">Search</button>
          </div>
        </form>

        <div v-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-if="recentSearches.length" class="mt-4 text-center">
          <h5>Son Aramalar</h5>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const query = ref('')
const error = ref('')
const recentSearches = ref([])

const router = useRouter()

const searchCve = () => {
  if (!query.value.trim()) {
    error.value = 'Arama terimi gerekli.'
    return
  }
  error.value = ''
  if (!recentSearches.value.includes(query.value.trim())) {
    recentSearches.value.unshift(query.value.trim())
    if (recentSearches.value.length > 5) {
      recentSearches.value.pop()
    }
  }
  router.push({ name: 'Results', query: { q: query.value.trim() } })
}
</script>
