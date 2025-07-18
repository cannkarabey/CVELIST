<template>
  <div class="container mt-5">
    <h2>CVE Detail: {{ cveId }}</h2>

    <div v-if="loading" class="text-center mt-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-4">
      {{ error }}
    </div>

    <div v-if="cve" class="card mt-4">
      <div class="card-body">
        <h5 class="card-title">{{ cve.title }}</h5>
        <p class="card-text">{{ cve.description }}</p>
        <p><strong>State:</strong> {{ cve.state }}</p>
        <p><strong>Version:</strong> {{ cve.version }}</p>
        <p><strong>Date Published:</strong> {{ cve.datePublished }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RecordDetail',
  data() {
    return {
      cveId: this.$route.params.cveId,
      cve: null,
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchCveDetail();
  },
  methods: {
    async fetchCveDetail() {
      try {
        const response = await axios.get(`/api/cve/${this.cveId}`);
        this.cve = response.data;
      } catch (err) {
        this.error = 'Failed to fetch CVE detail.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
