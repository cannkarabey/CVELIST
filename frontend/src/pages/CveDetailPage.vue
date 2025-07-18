<template>
  <div class="container mt-4">
    <h2><i class="bi bi-exclamation-triangle text-warning"></i> {{ cve?.cveId }}</h2>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="!cve && !error" class="spinner-border text-primary"></div>

    <div v-if="cve" class="mt-3">
      <h4>{{ cve.title }}</h4>
      <p>{{ cve.description }}</p>
      <p><strong>Durum:</strong> {{ cve.state }}</p>
      <p><strong>Yayın Tarihi:</strong> {{ cve.datePublished }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CveDetailPage",
  data() {
    return {
      cve: null,
      error: "",
    };
  },
  async mounted() {
    const { cveId } = this.$route.params;

    try {
      const res = await axios.get(`/api/cve/${cveId}`);
      this.cve = res.data;
    } catch (err) {
      this.error = "CVE bulunamadı.";
    }
  },
};
</script>
