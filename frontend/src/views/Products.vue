<template>
  <div class="products-page">
    <div class="page-header">
      <h1>产品库</h1>
      <p>发现最适合您的产品解决方案</p>
    </div>
      
    <div class="stats-section">
      <div class="stat-item">
        <div class="stat-value">{{stats.totalProducts}}+</div>
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
         
    <div class="product-toolbar">
      <div class="filters">
        <button class="filter-btn" :class="{ active: selectedGroup === 'ALL' }" type="button" @click="setGroup('ALL')">全部</button>
        <button class="filter-btn" :class="{ active: selectedGroup === 'BUSINESS' }" type="button" @click="setGroup('BUSINESS')">业务类</button>
        <button class="filter-btn" :class="{ active: selectedGroup === 'PUBLIC' }" type="button" @click="setGroup('PUBLIC')">公共服务</button>
      </div>

      <div class="filters">
        <button class="filter-btn" :class="{ active: selectedGranularity === 'ALL' }" type="button" @click="selectedGranularity = 'ALL'">全部粒度</button>
        <button class="filter-btn" :class="{ active: selectedGranularity === 'SYSTEM' }" type="button" @click="selectedGranularity = 'SYSTEM'">系统型</button>
        <button class="filter-btn" :class="{ active: selectedGranularity === 'MODULE' }" type="button" @click="selectedGranularity = 'MODULE'">模块型</button>
        <button class="filter-btn" :class="{ active: selectedGranularity === 'ATOMIC' }" type="button" @click="selectedGranularity = 'ATOMIC'">原子型</button>
      </div>

      <div class="filters">
        <button class="filter-btn" :class="{ active: !selectedCategory }" type="button" @click="setCategory('')">全部分类</button>
        <button v-for="cat in visibleCategories" :key="cat" class="filter-btn" type="button" :class="{ active: selectedCategory === cat }" @click="setCategory(cat)">
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- 搜索 -->
    <div class="search-box">
      <input v-model="keyword" type="text" placeholder="搜索产品..." class="search-input" @input="searchProducts" />
    </div>

    <div class="view-toolbar">
      <button class="view-btn" :class="{ active: viewMode === 'card' }" type="button" @click="setViewMode('card')">卡片</button>
      <button class="view-btn" :class="{ active: viewMode === 'list' }" type="button" @click="setViewMode('list')">列表</button>
    </div>

    <div v-if="viewMode === 'card'" class="product-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        :showTry="true"
        @select="openProduct"
        @try="startTrial"
      />
    </div>

    <div v-else class="product-list">
      <div v-for="product in filteredProducts" :key="product.id" class="product-row" @click="openProduct(product)">
        <div class="row-main">
          <div class="row-title">
            <span class="row-name">{{ product.name }}</span>
            <span class="row-category">{{ product.category }}</span>
            <span class="row-granularity">{{ granularityLabel(granularityOfProduct(product)) }}</span>
          </div>
          <div class="row-meta">
            <span v-if="firstCapability(product)" class="row-chip">能力：{{ firstCapability(product) }}</span>
            <span v-if="firstScenario(product)" class="row-chip">场景：{{ firstScenario(product) }}</span>
          </div>
        </div>
        <div class="row-side">
          <div class="row-price" v-if="product.price != null">¥{{ product.price }}万起</div>
          <div class="row-actions">
            <button v-if="product.externalDemoUrl" class="row-btn ghost" type="button" @click.stop="openExternal(product)">外部体验</button>
            <button class="row-btn" type="button" @click.stop="startTrial(product)">立即试用</button>
            <button class="row-btn ghost" type="button" @click.stop="togglePick(product)">
              {{ isPicked(product) ? '已加入' : '加入工作台' }}
            </button>
            <button class="row-btn icon" type="button" :aria-label="isFavorite(product) ? '取消收藏' : '收藏'" @click.stop="toggleFav(product)">
              <svg v-if="isFavorite(product)" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredProducts.length === 0" class="empty-state">
      <p>暂无产品</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productAPI } from '../api'
import ProductCard from '../components/ProductCard.vue'
import { addViewedProduct, readFavorites, readSelectedProducts, toggleFavorite, toggleSelectedProduct } from '../lib/productPrefs'

const stats = ref({ totalProducts: 6, totalTrials: 150, satisfaction: 92 })

const products = ref([])
const categories = ref([])
const selectedGroup = ref('ALL')
const selectedCategory = ref('')
const selectedGranularity = ref('ALL')
const keyword = ref('')
const viewMode = ref(localStorage.getItem('demo-products-view') === 'list' ? 'list' : 'card')
const prefsVersion = ref(0)
const route = useRoute()
const router = useRouter()

const favorites = computed(() => {
  prefsVersion.value
  return readFavorites()
})
const picked = computed(() => {
  prefsVersion.value
  return readSelectedProducts()
})

const visibleCategories = computed(() => {
  const list = Array.from(new Set((categories.value || []).filter(Boolean).map(String)))
  if (selectedGroup.value === 'ALL') return list
  if (selectedGroup.value === 'BUSINESS') return list.filter(isBusinessCategory)
  if (selectedGroup.value === 'PUBLIC') return list.filter(c => !isBusinessCategory(c))
  return list
})

const filteredProducts = computed(() => {
  let result = products.value
  if (selectedGroup.value === 'BUSINESS') result = result.filter(p => isBusinessCategory(p.category))
  if (selectedGroup.value === 'PUBLIC') result = result.filter(p => !isBusinessCategory(p.category))
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  if (selectedGranularity.value !== 'ALL') {
    result = result.filter(p => granularityOfProduct(p) === selectedGranularity.value)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(kw) || p.description?.toLowerCase().includes(kw))
  }
  return result
})

onMounted(async () => {
  window.addEventListener('demo-product-prefs-changed', onPrefsChanged)
  try {
    const [productsRes, catsRes] = await Promise.all([
      productAPI.list(),
      productAPI.categories()
    ])
    products.value = productsRes.data.data || []
    categories.value = catsRes.data.data || []
    syncCategoryFromQuery()
  } catch (e) {
    console.error(e)
  }
})

onUnmounted(() => {
  window.removeEventListener('demo-product-prefs-changed', onPrefsChanged)
})

function searchProducts() {
  // 自动触发 computed
}

function syncCategoryFromQuery() {
  const q = route.query.category
  if (typeof q === 'string') {
    selectedCategory.value = q || ''
    return
  }
  selectedCategory.value = ''
}

watch(
  () => route.query.category,
  () => syncCategoryFromQuery()
)

function setCategory(cat) {
  selectedCategory.value = cat || ''
  const nextQuery = { ...route.query }
  if (selectedCategory.value) nextQuery.category = selectedCategory.value
  else delete nextQuery.category
  router.replace({ query: nextQuery })
}

function setGroup(g) {
  selectedGroup.value = g
  if (selectedCategory.value && !visibleCategories.value.includes(selectedCategory.value)) {
    setCategory('')
  }
}

function openProduct(product) {
  if (!product?.id) return
  addViewedProduct(product.id)
  router.push(`/products/${product.id}`)
}

function startTrial(product) {
  // 跳转到试用页面并传递产品ID
  localStorage.setItem('trialProduct', JSON.stringify(product))
  window.location.href = '/trial'
}

function setViewMode(v) {
  viewMode.value = v
  localStorage.setItem('demo-products-view', v)
}

function onPrefsChanged() {
  prefsVersion.value += 1
}

function isFavorite(product) {
  return favorites.value.includes(Number(product?.id))
}

function isPicked(product) {
  return picked.value.includes(Number(product?.id))
}

function toggleFav(product) {
  toggleFavorite(product?.id)
}

function togglePick(product) {
  toggleSelectedProduct(product?.id)
}

function openExternal(product) {
  const url = product?.externalDemoUrl
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function firstCapability(product) {
  const cap = product?.capability
  if (!cap) return ''
  return String(cap).split(',')[0]?.trim() || ''
}

function firstScenario(product) {
  const sc = product?.scenarios
  if (!sc) return ''
  return String(sc).split(',')[0]?.trim() || ''
}

function isBusinessCategory(c) {
  const s = String(c || '')
  const business = ['仓储管理', '运输管理', '订单管理', '供应链', '国际货代/关务', '关务', '货代', '报关', '港航']
  return business.some(k => s.includes(k))
}

function granularityOfProduct(p) {
  const name = String(p?.name || '')
  const category = String(p?.category || '')
  const desc = String(p?.description || '')
  const cap = String(p?.capability || '')

  const sysHints = ['WMS', 'TMS', 'OMS', 'ERP', 'SCM', '平台', '系统']
  if (sysHints.some(k => name.toUpperCase().includes(k) || desc.includes(k))) return 'SYSTEM'
  if (category.includes('管理')) return 'SYSTEM'

  const atomicHints = ['API', 'SDK', '算法', '模型', 'OCR', '识别', '优化', '接口']
  const publicService = !isBusinessCategory(category)
  if (publicService && atomicHints.some(k => cap.toUpperCase().includes(k) || desc.includes(k) || name.toUpperCase().includes(k))) return 'ATOMIC'
  if (publicService) return 'MODULE'
  return 'MODULE'
}

function granularityLabel(v) {
  if (v === 'SYSTEM') return '系统型'
  if (v === 'MODULE') return '模块型'
  if (v === 'ATOMIC') return '原子型'
  return '全部'
}
</script>

<style scoped>
.products-page { padding: 0; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; margin-bottom: 8px; }
.page-header p { color: #666; }

.product-toolbar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px; }
.filters { display: flex; gap: 12px; flex-wrap: wrap; }
.filter-btn { padding: 8px 16px; border: 1px solid #e0e0e0; background: #fff; border-radius: 20px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.filter-btn:hover { border-color: #0066ff; color: #0066ff; }
.filter-btn.active { background: #0066ff; color: #fff; border-color: #0066ff; }

.search-box { margin-bottom: 24px; }
.search-input { width: 100%; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.search-input:focus { outline: none; border-color: #0066ff; }

.view-toolbar { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 12px; }
.view-btn { height: 34px; padding: 0 14px; border-radius: 10px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; font-size: 13px; }
.view-btn.active { border-color: #1677ff; color: #1677ff; background: rgba(22, 119, 255, 0.06); }

.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

.product-list { display: flex; flex-direction: column; gap: 12px; }
.product-row { background: #fff; border-radius: 12px; border: 1px solid rgba(5, 5, 5, 0.06); padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px; cursor: pointer; }
.product-row:hover { border-color: rgba(22, 119, 255, 0.35); }
.row-main { display: flex; flex-direction: column; gap: 8px; min-width: 0; flex: 1; }
.row-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
.row-name { font-weight: 700; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-category { font-size: 12px; color: #1677ff; background: rgba(22, 119, 255, 0.08); padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.row-granularity { font-size: 12px; color: #666; background: #f5f7fa; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
.row-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.row-chip { font-size: 12px; color: #666; background: #f9fafb; border: 1px solid rgba(5, 5, 5, 0.06); padding: 3px 8px; border-radius: 8px; }
.row-side { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.row-price { color: #ff4d4f; font-weight: 700; white-space: nowrap; }
.row-actions { display: inline-flex; align-items: center; gap: 8px; }
.row-btn { height: 32px; padding: 0 12px; border-radius: 10px; border: 1px solid #1677ff; background: #1677ff; color: #fff; cursor: pointer; font-size: 12px; white-space: nowrap; }
.row-btn:hover { background: #0958d9; border-color: #0958d9; }
.row-btn.ghost { background: #fff; color: #1677ff; border-color: rgba(22, 119, 255, 0.5); }
.row-btn.ghost:hover { background: rgba(22, 119, 255, 0.06); border-color: #1677ff; color: #1677ff; }
.row-btn.icon { width: 34px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-color: rgba(5, 5, 5, 0.14); background: #fff; color: #ff4d4f; }
.row-btn.icon:hover { background: rgba(255, 77, 79, 0.06); border-color: rgba(255, 77, 79, 0.4); }

.empty-state { text-align: center; padding: 60px; color: #999; }


.stats-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #fff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 40px; }
.stat-value { font-size: 36px; font-weight: 700; color: #667eea; }
.stat-label { color: #666; margin-top: 8px; }

@media (max-width: 1100px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .row-actions { display: none; }
}
</style>
