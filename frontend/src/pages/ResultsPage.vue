<template>
  <div class="container mt-5">
    <h2 class="text-center text-primary mb-3">Arama Sonuçları</h2>
    <p class="text-center text-muted">Arama sonuçlarından birini seçerek detay sayfasına gidebilirsiniz.</p>

    <table
      v-if="cves.length"
      class="table table-striped table-hover mt-4"
      role="table"
      aria-label="CVE Results Table"
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
        >
          <td>{{ cve.cveId }}</td>
          <td>
            <router-link :to="`/cve/${cve.cveId}`" class="text-decoration-none">
              {{ cve.title }}
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="alert alert-warning text-center">
      Sonuç bulunamadı.
    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "ResultsPage",
  data() {
    return {
      cves: [],
    };
  },
  mounted() {
    // örnek olarak localstorage'dan query alıp sonuç getiriyoruz
    const query = localStorage.getItem("lastQuery");
    if (query) {
      axios
        .post("/api/cve/search", { query })
        .then((response) => {
          this.cves = response.data.cves;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  },
};
</script>
