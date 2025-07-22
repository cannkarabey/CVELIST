<template>
  <div class="app-wrapper">
    <Navbar :darkMode="darkMode" :toggleDarkMode="toggleDarkMode" />
    <main class="content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import { ref, watch } from 'vue'

const darkMode = ref(false)

watch(darkMode, (val) => {
  if (val) {
    document.body.classList.add('bg-dark', 'text-light')
  } else {
    document.body.classList.remove('bg-dark', 'text-light')
  }
})

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}
</style>
