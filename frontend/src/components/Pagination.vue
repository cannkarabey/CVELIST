<template>
  <div class="pagination-container" v-if="totalPages > 1">
    <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
      &laquo;
    </button>

    <button
      v-for="page in visiblePages"
      :key="page"
      @click="goToPage(page)"
      :class="{ active: page === currentPage }"
    >
      {{ page }}
    </button>

    <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
      &raquo;
    </button>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  pageSize: {
    type: Number,
    default: 20
  },
  maxVisible: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['change'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const visiblePages = computed(() => {
  const pages = []
  const half = Math.floor(props.maxVisible / 2)
  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(totalPages.value, start + props.maxVisible - 1)

  if (end - start < props.maxVisible - 1) {
    start = Math.max(1, end - props.maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('change', page)
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
}

button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
