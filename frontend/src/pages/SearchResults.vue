<template>
  <div class="container mt-4">
    <h1>Search Results</h1>
    <p class="text-muted">Displaying results for: <strong>{{ query }}</strong></p>

    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>CVE ID</th>
          <th>Title</th>
          <th>State</th>
          <th>Date Published</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cve in results" :key="cve.cveId">
          <td>{{ cve.cveId }}</td>
          <td>{{ cve.title }}</td>
          <td>{{ cve.state }}</td>
          <td>{{ cve.datePublished }}</td>
          <td>
            <router-link
              :to="`/cve/${cve.cveId}`"
              class="btn btn-sm btn-outline-primary"
            >
              View
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SearchResults',
  data() {
    return {
      query: '',
      results: [],
    };
  },
  mounted() {
    // URL query string’den arama parametresini al
    const params = new URLSearchParams(window.location.search);
    this.query = params.get('query') || '';

    if (this.query) {
      this.fetchResults();
    }
  },
  methods: {
    async fetchResults() {
      try {
        const res = await axios.post('/api/cve/search', { query: this.query });
        this.results = res.data.cves;
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
