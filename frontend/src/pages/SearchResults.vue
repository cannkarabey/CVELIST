<template>
  <div class="container mt-5">
    <h2 class="mb-4 fw-semibold d-flex align-items-center gap-2">
      <i class="bi bi-list-check text-primary fs-3"></i> Sonuçlar
    </h2>

    <div v-if="error" class="alert alert-danger text-center">
      <i class="bi bi-exclamation-triangle-fill"></i> {{ error }}
    </div>

    <div v-if="isLoading" class="d-flex flex-column align-items-center my-5">
    <div class="spinner-border text-primary mb-2" role="status"></div>
      <p class="text-muted">
        <i class="bi bi-arrow-repeat"></i> Veriler yükleniyor...
      </p>
    </div>

    <div v-else-if="cves.length === 0" class="text-center my-5">
      <i class="bi bi-search fs-1 text-muted"></i>
      <h4 class="text-muted mt-3">Hiç sonuç bulunamadı</h4>
      <p class="text-muted">Farklı bir anahtar kelime veya filtre deneyin.</p>
    </div>

    <div v-if="cves.length > 0" class="card shadow-sm border-0">
      <div class="card-body p-0">
        <table class="table table-hover table-striped mb-0">
          <thead class="table-light">
            <tr>
              <th
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Common Vulnerabilities and Exposures Identifier"
              >
                CVE ID
              </th>
              <th>Başlık</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>Detay</th>
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
              <td>{{ cve.date }}</td>
              <td>
                <router-link
                  :to="`/cve/${cve.cveId}`"
                  class="btn btn-sm btn-outline-primary"
                >
                  <i class="bi bi-eye"></i> Detay
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

const cves = ref([]);
const error = ref("");
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  try {
    // burada backend çağrısı ya da dummy data
    // cves.value = [
    //   {
    //     cveId: "CVE-2023-1234",
    //     title: "Buffer Overflow in X Library",
    //     state: "Open",
    //     date: "2023-06-15",
    //   },
    //   {
    //     cveId: "CVE-2022-5678",
    //     title: "SQL Injection in Y Application",
    //     state: "Closed",
    //     date: "2022-12-10",
    //   },
    //   {
    //     cveId: "CVE-2021-9101",
    //     title: "Cross-Site Scripting in Z Framework",
    //     state: "Open",
    //     date: "2021-08-20",
    //   },
    // ];
    
    await new Promise((resolve) => setTimeout(resolve, 800)); // simülasyon

    // cves.value = []; // burada gerçekten veri yok
  } catch (err) {
    error.value = "Bir hata oluştu.";
  } finally {
    isLoading.value = false; // NE OLURSA OLSUN kapat
  }
});
</script>


