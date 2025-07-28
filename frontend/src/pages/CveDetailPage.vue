<template>
  <div class="container mt-5">
    <h2 class="mb-4 fw-semibold">
      CVE Detail: {{ cve?.cveId || 'N/A' }}
    </h2>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p>Loading...</p>
    </div>

    <div v-if="cve" class="card p-4 shadow-sm">
      <p><strong>Title:</strong> {{ cve.title || 'N/A' }}</p>
      <p><strong>State:</strong> {{ cve.state || 'N/A' }}</p>
      <p><strong>Date Published:</strong> {{ cve.datePublished || 'N/A' }}</p>
      <p><strong>Data Version:</strong> {{ cve.dataVersion || 'N/A' }}</p>
      <p><strong>Description:</strong> {{ cve.description || 'N/A' }}</p>
      <p><strong>Problem Type:</strong> {{ cve.problemType || 'N/A' }}</p>

      <div>
        <strong>Affected:</strong>
        <ul>
          <li v-for="(aff, idx) in cve.affected" :key="idx">
            {{ aff }}
          </li>
        </ul>
      </div>

      <div>
        <strong>References:</strong>
        <ul>
          <li v-for="(ref, idx) in cve.references" :key="idx">
            [{{ ref.tags }}]
            <a :href="ref.url" target="_blank">{{ ref.url }}</a>
          </li>
        </ul>
      </div>

      <div>
        <strong>Provider Org ID:</strong> {{ cve.providerOrgId || 'N/A' }}
      </div>

      <div>
        <br><strong>CVSS v3.1 Base Score:</strong> {{ cve.cvssBaseScore || 'N/A' }}</br>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const cve = ref(null);
const error = ref("");
const isLoading = ref(true);

onMounted(async () => {
  const cveId = route.params.cveId;
  if (!cveId) {
    error.value = "CVE ID is missing in the route.";
    isLoading.value = false;
    return;
  }

  try {
    // ** CVEDETAILPAGE BU DİZİNDE DÖNÜYOR 
    const res = await axios.get(`http://localhost:3000/api/cve/${cveId}`);
    // ** CVEDETAILPAGE BU DİZİNDE DÖNÜYOR 
    cve.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load CVE details.";
  } finally {
    isLoading.value = false;
  }
});
</script>

