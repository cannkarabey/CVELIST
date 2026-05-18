<template>
  <footer class="site-footer">
    <small>© {{ currentYear }} CVESearch — Powered by Elasticsearch</small>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  border-top: 1px solid var(--border);
  padding: 1rem 2rem;
  text-align: center;
  color: var(--text-subtle);
  font-size: 0.8rem;
}
</style>
