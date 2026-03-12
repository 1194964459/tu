import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Products from '../views/Products.vue'
import ProductDetail from '../views/ProductDetail.vue'
import TrialWorkbench from '../views/TrialWorkbench.vue'
import AIChat from '../views/AIChat.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/products', name: 'Products', component: Products },
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/trial', name: 'TrialWorkbench', component: TrialWorkbench },
  { path: '/ai-chat', name: 'AIChat', component: AIChat }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
