<template>
  <div class="home">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">发现最适合您的产品解决方案</h1>
        <p class="hero-subtitle">AI 驱动的智能推荐，让选型变得更简单</p>
        <div class="hero-actions">
          <button class="btn btn-primary" @click="$router.push('/ai-chat')">开始智能选型</button>
          <button class="btn btn-secondary" @click="$router.push('/products')">浏览产品库</button>
        </div>
      </div>
    </section>

    <!-- 快速入口 -->
    <section class="quick-entry">
      <div class="entry-card" @click="$router.push('/trial')">
        <div class="entry-icon">🧪</div>
        <div class="entry-text">
          <h3>免费试用</h3>
          <p>在线体验产品功能</p>
        </div>
      </div>
      <div class="entry-card" @click="$router.push('/ai-chat')">
        <div class="entry-icon">🤖</div>
        <div class="entry-text">
          <h3>AI 顾问</h3>
          <p>智能推荐方案</p>
        </div>
      </div>
      <div class="entry-card">
        <div class="entry-icon">📊</div>
        <div class="entry-text">
          <h3>案例中心</h3>
          <p>成功案例展示</p>
        </div>
      </div>
    </section>

    <!-- 热门产品 -->
    <section class="section">
      <div class="section-header">
        <h2>热门产品</h2>
        <router-link to="/products" class="more-link">查看更多 →</router-link>
      </div>
      <div class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card" @click="$router.push(`/products/${product.id}`)">
          <div class="product-category">{{ product.category }}</div>
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-desc">{{ product.description }}</p>
          <div class="product-footer">
            <span class="product-price">¥{{ product.price }}万起</span>
            <span class="product-popularity">🔥 {{ product.popularity }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计 -->
    <section class="stats-section">
      <div class="stat-item">
        <div class="stat-value">{{ stats.totalProducts }}+</div>
        <div class="stat-label">产品数量</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.totalTrials }}+</div>
        <div class="stat-label">试用次数</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">{{ stats.satisfaction }}%</div>
        <div class="stat-label">用户满意度</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { productAPI, trialAPI } from '../api'

const products = ref([])
const stats = ref({ totalProducts: 6, totalTrials: 150, satisfaction: 92 })

onMounted(async () => {
  try {
    const res = await productAPI.popular(4)
    products.value = res.data.data || []
    
    const statsRes = await trialAPI.stats()
    if (statsRes.data.data) {
      stats.value.totalTrials = statsRes.data.data.runningCount + statsRes.data.data.completedCount
    }
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.hero { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; margin-bottom: 40px; }
.hero-title { color: #fff; font-size: 36px; margin-bottom: 12px; }
.hero-subtitle { color: rgba(255,255,255,0.9); font-size: 18px; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; justify-content: center; }
.btn { padding: 12px 32px; border-radius: 8px; font-size: 16px; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: #fff; color: #667eea; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.btn-secondary { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid #fff; }
.btn-secondary:hover { background: rgba(255,255,255,0.3); }

.quick-entry { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
.entry-card { background: #fff; padding: 24px; border-radius: 12px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.entry-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.entry-icon { font-size: 36px; }
.entry-text h3 { font-size: 16px; margin-bottom: 4px; }
.entry-text p { color: #999; font-size: 14px; }

.section { margin-bottom: 40px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { font-size: 24px; }
.more-link { color: #0066ff; text-decoration: none; font-size: 14px; }

.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.product-card { background: #fff; padding: 20px; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.product-category { font-size: 12px; color: #0066ff; background: #e8f4ff; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 12px; }
.product-name { font-size: 16px; margin-bottom: 8px; }
.product-desc { color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-footer { display: flex; justify-content: space-between; align-items: center; }
.product-price { color: #ff4d4f; font-weight: 600; }
.product-popularity { color: #999; font-size: 12px; }

.stats-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #fff; padding: 40px; border-radius: 12px; text-align: center; }
.stat-value { font-size: 36px; font-weight: 700; color: #667eea; }
.stat-label { color: #666; margin-top: 8px; }
</style>
