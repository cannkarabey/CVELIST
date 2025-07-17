<template>
  <div class="container mt-4">
    <h1>Dashboard</h1>
    <p>Welcome to the CVE Search Dashboard.</p>

    <SearchBar />
    <Filters />
  </div>
</template>

<script setup>
import SearchBar from '../components/SearchBar.vue'
import Filters from '../components/Filters.vue'
</script>
