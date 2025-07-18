<template>
  <div class="container mt-4">
    <h2>Sonuçlar</h2>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="cves.length === 0" class="alert alert-warning">
      Sonuç bulunamadı. Lütfen farklı bir kelimeyle tekrar deneyin.
    </div>
    <table
      v-if="cves.length > 0"
      role="table"
      aria-label="CVE Results Table"
      class="table table-striped mt-3"
    >
      <thead>
        <tr>
          <th>CVE ID</th>
          <th>Başlık</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="cve in cves"
          :key="cve.cveId"
          :class="{ 'table-success': cve.severity === 'Critical' }"
        >
          <td>
            <router-link
              :to="`/cve/${cve.cveId}`"
              class="text-decoration-none"
            >
              {{ cve.cveId }}
            </router-link>
          </td>
          <td>{{ cve.title }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SearchResults",
  data() {
    return {
      cves: [],
      error: "",
    };
  },
  async mounted() {
    const query = this.$route.query.q;
    if (!query) {
      this.error = "Sorgu parametresi eksik.";
      return;
    }

    try {
      const res = await axios.post("/api/cve/search", { query });
      this.cves = res.data.cves || [];
    } catch (err) {
      this.error = "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.";
    }
  },
};
</script>
