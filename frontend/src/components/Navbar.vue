<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Elasticsearch project</a>
      <div>
        <router-link class="nav-link d-inline text-white" to="/">Home</router-link>
        <router-link class="nav-link d-inline text-white" to="/results">Results</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
};
</script>
