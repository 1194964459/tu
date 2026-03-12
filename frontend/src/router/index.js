import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import TrialWorkbench from '../views/TrialWorkbench.vue'
import AIChat from '../views/AIChat.vue'
import AdminConsole from '../views/AdminConsole.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/products', name: 'Products', component: Products },
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/trial', name: 'TrialWorkbench', component: TrialWorkbench },
  { path: '/ai-chat', name: 'AIChat', component: AIChat },
  { path: '/admin', name: 'AdminConsole', component: AdminConsole }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
