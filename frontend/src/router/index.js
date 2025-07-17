import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import SearchResults from '../pages/SearchResults.vue'
import CveDetail from '../pages/CveDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/results',
    name: 'SearchResults',
    component: SearchResults,
  },
  {
    path: '/cve/:cveId',
    name: 'CveDetail',
    component: CveDetail,
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
  routes,
})

export default router
