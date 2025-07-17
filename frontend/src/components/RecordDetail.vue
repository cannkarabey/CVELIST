<template>
  <div class="card mt-3">
    <div class="card-header">
      CVE Detail - {{ record.cveId }}
    </div>
    <div class="card-body">
      <h5 class="card-title">{{ record.title }}</h5>
      <p class="card-text">{{ record.description }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "RecordDetail",
  props: {
    record: Object,
  },
};
</script>
