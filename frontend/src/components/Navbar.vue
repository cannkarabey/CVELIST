<template>
  <nav class="site-nav">
    <router-link class="nav-logo" to="/">
      <i class="bi bi-shield-lock-fill"></i>
      CVE<span class="accent">Search</span>
    </router-link>
    <div class="nav-links">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/results" class="nav-link">Browse</router-link>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.nav-logo i {
  color: var(--accent);
  font-size: 1.25rem;
}

.accent {
  color: var(--accent);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.4rem 0.875rem;
  border-radius: var(--radius-sm);
  transition: color 0.15s, background 0.15s;
}

.nav-link:hover {
  color: var(--text);
  background: var(--surface);
}

.nav-link.router-link-exact-active {
  color: var(--text);
  background: var(--surface);
}
</style>
