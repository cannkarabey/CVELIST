import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '../pages/SearchPage.vue'
import SearchResults from '../pages/SearchResults.vue'
import CveDetailPage from '../pages/CveDetailPage.vue'

const routes = [
  { path: '/', name: 'Search', component: SearchPage },
  { path: '/results', name: 'Results', component: SearchResults },
  { path: '/cve/:cveId', name: 'CveDetail', component: CveDetailPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
