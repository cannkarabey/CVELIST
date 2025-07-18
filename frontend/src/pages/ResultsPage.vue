<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-center">Search Results</h2>

    <table class="table table-striped table-hover">
      <thead class="table-dark">
        <tr>
          <th scope="col">#</th>
          <th scope="col">CVE ID</th>
          <th scope="col">Title</th>
          <th scope="col">Published Date</th>
          <th scope="col">Details</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cve, index) in cves" :key="cve.cveId">
          <th scope="row">{{ index + 1 }}</th>
          <td>{{ cve.cveId }}</td>
          <td>{{ cve.title }}</td>
          <td>{{ cve.datePublished }}</td>
          <td>
            <router-link :to="`/cve/${cve.cveId}`" class="btn btn-sm btn-primary">
              View
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="cves.length === 0" class="alert alert-warning text-center mt-4">
      No results found.
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
