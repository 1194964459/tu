<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🏢</span>
          <span class="logo-text">产品体验平台</span>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">首页</router-link>
          <router-link to="/products" class="nav-link" :class="{ active: $route.path.startsWith('/products') }">产品库</router-link>
          <router-link to="/ai-chat" class="nav-link" :class="{ active: $route.path === '/ai-chat' }">AI 顾问</router-link>
          <router-link to="/trial" class="nav-link trial-link" :class="{ active: $route.path === '/trial' }">试用工作台</router-link>
        </nav>
        <div class="user-info">
          <span class="role-badge">{{ currentRole }}</span>
        </div>
      </div>
    </header>
    
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentRole = ref('购买方')
</script>

<style>
.app { min-height: 100vh; }
.header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; }
.header-content { max-width: 1400px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 8px; }
.logo-icon { font-size: 24px; }
.logo-text { font-size: 18px; font-weight: 600; color: #1a1a2e; }
.nav { display: flex; gap: 8px; }
.nav-link { padding: 8px 16px; border-radius: 6px; text-decoration: none; color: #666; font-size: 14px; transition: all 0.2s; }
.nav-link:hover { background: #f5f7fa; color: #333; }
.nav-link.active { background: #e8f4ff; color: #0066ff; }
.trial-link { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff !important; }
.trial-link:hover { opacity: 0.9; }
.role-badge { padding: 4px 12px; background: #f0f0f0; border-radius: 12px; font-size: 12px; color: #666; }
.main { max-width: 1400px; margin: 0 auto; padding: 24px; }
</style>
