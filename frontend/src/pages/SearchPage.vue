<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">CVE Search</h1>

    <form @submit.prevent="searchCves" class="row justify-content-center">
      <div class="col-md-6">
        <div class="input-group">
          <input
            type="text"
            v-model="query"
            class="form-control"
            placeholder="Enter CVE keyword…"
          />
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-search"></i> Search
          </button>
        </div>
      </div>
    </form>

    <div class="row mt-4">
      <div class="col text-center">
        <p class="text-muted">
          Example: <code>CVE-2024</code> or <code>buffer overflow</code>
        </p>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-3 text-center">
      {{ error }}
    </div>

    <div v-if="loading" class="text-center mt-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading…</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const query = ref("");
    const error = ref("");
    const loading = ref(false);
    const router = useRouter();

    const searchCves = async () => {
      if (!query.value.trim()) {
        error.value = "Please enter a search keyword.";
        return;
      }
      error.value = "";
      loading.value = true;

      setTimeout(() => {
        loading.value = false;
        router.push({ name: "Results", query: { q: query.value } });
      }, 1000);
    };

    return { query, error, loading, searchCves };
  },
};
</script>
