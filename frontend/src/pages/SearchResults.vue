<template>
  <div class="container mt-5">
    <h2 class="mb-4 fw-semibold d-flex align-items-center gap-2">
      <i class="bi bi-list-check text-primary fs-3"></i> Results
    </h2>

    <div v-if="error" class="aleart alert-danger text-center">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
    </div>

    <div v-if="isLoading" class="d-flex flex-column align-items-center my-5">
      <div class="spinner-border text-primary mb-2" role="status"></div>
      <p class="text-muted">
        <i class="bi bi-arrow-repeat"></i> Loading data...
      </p>
    </div>

    <div v-else-if="cves.length === 0" class="text-center my-5">
      <i class="bi bi-search fs-1 text-muted"></i>
      <h4 class="text-muted mt-3">No results were found</h4>
      <p class="text-muted">Try a different keyword or filter.</p>
    </div>

    <div v-if="cves.length > 0" class="card shadow-sm border-0">
      <div class="card-body p-0">
        <table class="table table-hover table-striped mb-0">
          <thead class="table-light">
            <tr>
              <th>CVE ID</th>
              <th>Title</th>
              <th>State</th>
              <th>Date Published</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cve in cves" :key="cve.cveId">
              <td>
                <router-link
                  :to="`/cve/${cve.cveId}`"
                  class="text-decoration-none fw-medium text-primary"
                >
                  {{ cve.cveId }}
                </router-link>
              </td>
              <td>{{ cve.title }}</td>
              <td><span class="badge bg-info">{{ cve.state }}</span></td>
              <td>{{ cve.datePublished }}</td>
              <td>
                <router-link
                  :to="`/cve/${cve.cveId}`"
                  class="btn btn-sm btn-outline-primary"
                >
                  <i class="bi bi-eye"></i> Details
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const cves = ref([]);
const error = ref("");
const isLoading = ref(true);

const route = useRoute();

onMounted(async () => {
  isLoading.value = true;

  const query = route.query.q; // /results?q=foo  
  if (!query) {
    error.value = "The query parameter is missing.";
    isLoading.value = false;
    return;
  }

  // const type = query.split(":")

  try {
    // ** //
    const res = await axios.post("http://localhost:3000/api/cve/search", { query:query,mode:"boosted" }); 
    // ** //
    cves.value = res.data.cves || [];
  } catch (err) {
    console.error(err);
    error.value = "Unable to connect to the server. Please try again.";
  } finally {
    isLoading.value = false;
  }
});
</script> 