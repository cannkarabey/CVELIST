<template>
  <div class="container mt-4">
    <h1 class="mb-3">Dashboard</h1>
    <p class="text-muted">Welcome to the CVE Search Dashboard.</p>

    <!-- Search Bar -->
    <div class="input-group mb-3">
      <input
        type="text"
        class="form-control"
        placeholder="Search CVEs..."
        v-model="query"
      />
      <button class="btn btn-primary" @click="onSearch">Search</button>
    </div>

    <!-- Filters -->
    <div class="row g-2 mb-3">
      <div class="col-md-3">
        <select class="form-select" v-model="state">
          <option value="">All States</option>
          <option value="published">Published</option>
          <option value="deprecated">Deprecated</option>
        </select>
      </div>
      <div class="col-md-3">
        <input type="date" class="form-control" v-model="startDate" />
      </div>
      <div class="col-md-3">
        <input type="date" class="form-control" v-model="endDate" />
      </div>
      <div class="col-md-3">
        <button class="btn btn-primary w-100" @click="applyFilters">
          Apply Filters
        </button>
      </div>
    </div>

    <!-- Results Table -->
    <table class="table table-striped">
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
export default {
  name: 'Dashboard',
  data() {
    return {
      query: '',
      state: '',
      startDate: '',
      endDate: '',
      results: [], // Arama sonuçları
    };
  },
  methods: {
    onSearch() {
      console.log('Search query:', this.query);
      // TODO: API çağrısı yapıp results’i doldur
    },
    applyFilters() {
      console.log('Filters:', this.state, this.startDate, this.endDate);
      // TODO: API’ye filtrelerle istek at
    },
  },
};
</script>
