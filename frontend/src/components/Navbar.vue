<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary px-5">
    <router-link class="navbar-brand" to="/">CVE Search</router-link>
    <div class="ms-auto d-flex gap-2">
      <router-link to="/" class="btn btn-sm btn-outline-light">Home</router-link>
      <router-link to="/results" class="btn btn-sm btn-outline-light">Results</router-link>
      <button
        class="btn btn-sm btn-outline-light"
        @click="toggleDarkMode"
      >
        <i class="bi" :class="darkMode ? 'bi-moon' : 'bi-brightness-high'"></i>
      </button>
    </div>
  </nav>
</template>


<script>
export default {
  name: "Navbar",
};
</script>

<script setup>
const props = defineProps({
  darkMode: Boolean,
  toggleDarkMode: Function
})
</script>

