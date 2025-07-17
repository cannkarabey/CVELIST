<template>
  <table class="table table-striped mt-3">
    <thead>
      <tr>
        <th>CVE ID</th>
        <th>Title</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="cve in cves" :key="cve.cveId">
        <td>{{ cve.cveId }}</td>
        <td>{{ cve.title }}</td>
        <td>
          <router-link :to="`/cve/${cve.cveId}`" class="btn btn-sm btn-info">Details</router-link>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "DataTable",
  props: {
    cves: Array,
  },
};
</script>
