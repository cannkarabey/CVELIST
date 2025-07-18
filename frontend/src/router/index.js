import { createRouter, createWebHistory } from 'vue-router'
import SearchPage from '../pages/SearchPage.vue'
import ResultsPage from '../pages/ResultsPage.vue'
import CveDetailPage from '../pages/CveDetailPage.vue'

const routes = [
  {
    path: '/',
    name: 'Search',
    component: SearchPage
  },
  {
    path: '/results',
    name: 'Results',
    component: ResultsPage
  },
  {
    path: '/cve/:cveId',
    name: 'CveDetail',
    component: CveDetailPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      template: '<div class="text-center mt-5"><h2>404 - Page Not Found</h2></div>'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
