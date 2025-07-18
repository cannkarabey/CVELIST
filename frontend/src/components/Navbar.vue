<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <i class="bi bi-shield-lock me-2"></i> CVE Search
      </router-link>

      <div class="ms-auto">
        <router-link
          to="/"
          class="btn btn-outline-light btn-sm me-2"
        >
          Home
        </router-link>

        <router-link
          to="/results"
          class="btn btn-outline-light btn-sm"
        >
          Results
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
};
</script>
