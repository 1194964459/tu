<template>
  <div class="home">
    <div class="portal">
      <div class="portal-grid">
        <section
          v-for="block in portalBlocks"
          :key="block.id"
          class="portal-block"
          :class="`span-${block.span}`"
        >
          <template v-if="block.type === 'hero'">
            <div class="hero">
              <div class="hero-content">
                <h1 class="hero-title">发现最适合您的产品解决方案</h1>
                <p class="hero-subtitle">AI 驱动的智能推荐，让选型变得更简单</p>
                <div class="hero-actions">
                  <button class="btn btn-primary" @click="$router.push('/ai-chat')">开始智能选型</button>
                  <button class="btn btn-secondary" @click="$router.push('/products')">浏览产品库</button>
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="block.type === 'entry'">
            <div class="quick-entry">
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
            </div>
          </template>

          <template v-else-if="block.type === 'products'">
            <div class="section">
              <div class="section-header">
                <h2>{{ block.title }}</h2>
                <router-link to="/products" class="more-link">查看更多 →</router-link>
              </div>
              <div class="product-grid">
                <ProductCard
                  v-for="product in block.products"
                  :key="product.id"
                  :product="product"
                  @select="openProduct"
                />
              </div>
            </div>
          </template>

          <template v-else-if="block.type === 'categories'">
            <div class="section">
              <div class="section-header">
                <h2>{{ block.title }}</h2>
              </div>
              <div class="category-grid">
                <button
                  v-for="cat in block.categories"
                  :key="cat"
                  class="category-chip"
                  type="button"
                  @click="$router.push({ path: '/products', query: { category: cat } })"
                >
                  {{ cat }}
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="block.type === 'stats'">
            <div class="stats-section">
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
            </div>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productAPI, trialAPI } from '../api'
import ProductCard from '../components/ProductCard.vue'

const allProducts = ref([])
const categories = ref([])
const popularProducts = ref([])
const portalBlocks = ref([])
const stats = ref({ totalProducts: 6, totalTrials: 150, satisfaction: 92 })
const router = useRouter()

onMounted(async () => {
  initPortal()
  try {
    const [popularRes, listRes, catsRes, statsRes] = await Promise.all([
      productAPI.popular(12),
      productAPI.list(),
      productAPI.categories(),
      trialAPI.stats()
    ])

    popularProducts.value = popularRes.data.data || []
    allProducts.value = listRes.data.data || []
    categories.value = catsRes.data.data || []

    if (statsRes.data.data) {
      stats.value.totalTrials = statsRes.data.data.runningCount + statsRes.data.data.completedCount
    }

    stats.value.totalProducts = allProducts.value.length || stats.value.totalProducts
    rebuildPortal()
  } catch (e) {
    console.error(e)
    initPortal()
  }
})

function openProduct(product) {
  if (!product?.id) return
  router.push(`/products/${product.id}`)
}

function initPortal() {
  portalBlocks.value = [
    { id: 'hero', type: 'hero', span: 12 },
    { id: 'entry', type: 'entry', span: 12 },
    { id: 'stats', type: 'stats', span: 12 }
  ]
}

function rebuildPortal() {
  const pickedCategories = pickCategories(categories.value, 3)

  const categoryBlocks = pickedCategories
    .map((cat) => {
      const products = allProducts.value
        .filter(p => p.category === cat)
        .slice()
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 4)
      if (!products.length) return null
      return {
        id: `cat-${cat}`,
        type: 'products',
        title: `${cat}精选`,
        span: 6,
        products
      }
    })
    .filter(Boolean)

  portalBlocks.value = [
    { id: 'hero', type: 'hero', span: 12 },
    { id: 'entry', type: 'entry', span: 12 },
    { id: 'popular', type: 'products', title: '热门产品', span: 12, products: popularProducts.value.slice(0, 8) },
    { id: 'categories', type: 'categories', title: '热门分类', span: 12, categories: categories.value.slice(0, 12) },
    ...shuffle(categoryBlocks, todaySeed()),
    { id: 'stats', type: 'stats', span: 12 }
  ]
}

function pickCategories(list, count) {
  const cleaned = Array.from(new Set((list || []).filter(Boolean).map(String)))
  return shuffle(cleaned, todaySeed()).slice(0, count)
}

function todaySeed() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function shuffle(items, seedText) {
  const arr = (items || []).slice()
  let seed = 0
  for (let i = 0; i < String(seedText).length; i++) {
    seed = (seed * 31 + String(seedText).charCodeAt(i)) >>> 0
  }
  function next() {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
</script>

<style scoped>
.portal { display: flex; flex-direction: column; gap: 20px; }
.portal-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 20px; }
.portal-block { grid-column: span 12; }
.span-4 { grid-column: span 4; }
.span-6 { grid-column: span 6; }
.span-8 { grid-column: span 8; }
.span-12 { grid-column: span 12; }

.hero { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; }
.hero-title { color: #fff; font-size: 36px; margin-bottom: 12px; }
.hero-subtitle { color: rgba(255,255,255,0.9); font-size: 18px; margin-bottom: 32px; }
.hero-actions { display: flex; gap: 16px; justify-content: center; }
.btn { padding: 12px 32px; border-radius: 8px; font-size: 16px; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary { background: #fff; color: #667eea; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.btn-secondary { background: rgba(255,255,255,0.2); color: #fff; border: 1px solid #fff; }
.btn-secondary:hover { background: rgba(255,255,255,0.3); }

.quick-entry { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.entry-card { background: #fff; padding: 24px; border-radius: 12px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.entry-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.entry-icon { font-size: 36px; }
.entry-text h3 { font-size: 16px; margin-bottom: 4px; }
.entry-text p { color: #999; font-size: 14px; }

.section { background: transparent; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h2 { font-size: 24px; }
.more-link { color: #0066ff; text-decoration: none; font-size: 14px; }

.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.span-6 .product-grid { grid-template-columns: repeat(2, 1fr); }
.span-8 .product-grid { grid-template-columns: repeat(3, 1fr); }

.category-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.category-chip { padding: 8px 14px; background: #fff; border-radius: 999px; border: 1px solid #e0e0e0; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.category-chip:hover { border-color: #0066ff; color: #0066ff; }

.stats-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #fff; padding: 40px; border-radius: 12px; text-align: center; }
.stat-value { font-size: 36px; font-weight: 700; color: #667eea; }
.stat-label { color: #666; margin-top: 8px; }

@media (max-width: 1100px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .quick-entry { grid-template-columns: 1fr; }
}
</style>
