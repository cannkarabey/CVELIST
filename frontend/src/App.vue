<template>
  <Navbar :darkMode="darkMode" :toggleDarkMode="toggleDarkMode" />
  <router-view />
</template>

<script setup>
import Navbar from './components/Navbar.vue'
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

