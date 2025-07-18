<template>
  <div class="container mt-4">
    <h2>CVE Details</h2>

    <div v-if="loading" class="text-center mt-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger mt-3">
      {{ error }}
    </div>

    <div v-else>
      <table class="table table-bordered">
        <tbody>
          <tr>
            <th>CVE ID</th>
            <td>{{ cve.cveId }}</td>
          </tr>
          <tr>
            <th>Title</th>
            <td>{{ cve.title }}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{{ cve.description }}</td>
          </tr>
          <tr>
            <th>Published Date</th>
            <td>{{ cve.datePublished }}</td>
          </tr>
          <tr>
            <th>State</th>
            <td>{{ cve.state }}</td>
          </tr>
          <tr>
            <th>Version</th>
            <td>{{ cve.version }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const cve = ref({})
const loading = ref(true)
const error = ref('')

onMounted(() => {
  fetchCve()
})

function fetchCve() {
  const id = route.params.cveId

  axios
    .get(`/api/cve/${id}`)
    .then((res) => {
      cve.value = res.data
    })
    .catch((err) => {
      console.error(err)
      error.value = 'CVE not found or server error.'
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
