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
       <!-- <div class="filters">
        <button class="filter-btn" :class="{ active: selectedSource === 'ALL' }" type="button" @click="selectedSource = 'ALL'">全部来源：</button>
        <button class="filter-btn" :class="{ active: selectedSource === 'THIRD' }" type="button" @click="selectedSource = 'THIRD'">行业生态（第三方）</button>
        <button class="filter-btn" :class="{ active: selectedSource === 'INTERNAL' }" type="button" @click="selectedSource = 'INTERNAL'">自研</button>
      </div> -->
        <div class="filters">
        <button class="filter-btn" :class="{ active: selectedServiceType === 'ALL' }" type="button" @click="selectedServiceType = 'ALL'" >服务类型：</button>
        <button
          v-for="t in serviceTypes"
          :key="t"
          class="filter-btn"
          type="button"
          :class="{ active: selectedServiceType === t }"
          @click="selectedServiceType = t"
        >
          {{ t }}
        </button>
      </div>

      <div class="filters">
        <button class="filter-btn" :class="{ active: selectedSystem === 'ALL' }" type="button" @click="selectedSystem = 'ALL'">六大产品体系：</button>
        <button
          v-for="s in productSystems"
          :key="s"
          class="filter-btn"
          type="button"
          :class="{ active: selectedSystem === s }"
          @click="selectedSystem = s"
        >
          {{ s }}
        </button>
      </div>


      <!-- <div class="filters">
        <button class="filter-btn" :class="{ active: selectedSource === 'ALL' }" type="button" @click="selectedSource = 'ALL'" >是否第三方：</button>
        <button class="filter-btn" :class="{ active: selectedSource === 'THIRD' }" type="button" @click="selectedSource = 'THIRD'">第三方</button>
        <button class="filter-btn" :class="{ active: selectedSource === 'INTERNAL' }" type="button" @click="selectedSource = 'INTERNAL'">非第三方</button>
      </div> -->     
      
      <div class="filters">
        <!-- <button class="filter-btn" :class="{ active: !selectedCategory }" type="button" @click="setCategory('')">全部分类：</button>
        <button v-for="cat in visibleCategories" :key="cat" class="filter-btn" type="button" :class="{ active: selectedCategory === cat }" @click="setCategory(cat)">
          {{ cat }}
        </button> -->
        <button class="filter-btn" :class="{ active: selectedScene === 'ALL' }" type="button" @click="selectedScene = 'ALL'">八大垂类场景：</button>
        <button
          v-for="s in verticalScenes"
          :key="s"
          class="filter-btn"
          type="button"
          :class="{ active: selectedScene === s }"
          @click="selectedScene = s"
        >
          {{ s }}
        </button>
      </div>

      <div class="filters">
        <button class="filter-btn" :class="{ active: selectedGranularity === 'ALL' }" type="button" @click="selectedGranularity = 'ALL'">全部粒度：</button>
        <button class="filter-btn" :class="{ active: selectedGranularity === 'SYSTEM' }" type="button" @click="selectedGranularity = 'SYSTEM'">系统型</button>
        <button class="filter-btn" :class="{ active: selectedGranularity === 'MODULE' }" type="button" @click="selectedGranularity = 'MODULE'">模块型</button>
        <button class="filter-btn" :class="{ active: selectedGranularity === 'ATOMIC' }" type="button" @click="selectedGranularity = 'ATOMIC'">原子型</button>
      </div>

    </div>

    <div class="search-module">
      <!-- 视图切换 -->
      <div class="view-toolbar">
        <button class="view-btn icon" :class="{ active: viewMode === 'card' }" type="button" aria-label="网格视图" @click="setViewMode('card')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h7v7H4z" />
            <path d="M13 4h7v7h-7z" />
            <path d="M4 13h7v7H4z" />
            <path d="M13 13h7v7h-7z" />
          </svg>
        </button>
        <button class="view-btn icon" :class="{ active: viewMode === 'list' }" type="button" aria-label="列表视图" @click="setViewMode('list')">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M8 6h13" />
            <path d="M8 12h13" />
            <path d="M8 18h13" />
            <path d="M3 6h.01" />
            <path d="M3 12h.01" />
            <path d="M3 18h.01" />
          </svg>
        </button>
      </div>
      <!-- 搜索 -->
      <div class="search-input-wrap">
        <span class="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
          </svg>
        </span>
        <input v-model="keyword" type="text" placeholder="搜索产品..." class="search-input" @input="searchProducts" />
      </div>
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
            <button class="row-btn fav" :class="{ active: isFavorite(product) }" type="button"  @click.stop="toggleFav(product)">
              <svg v-if="isFavorite(product)" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <!-- <span class="fav-text">{{ isFavorite(product) ? '已收藏' : '收藏' }}</span> -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { productAPI } from '../api'
import ProductCard from '../components/ProductCard.vue'
import { addViewedProduct, readFavorites, toggleFavorite } from '../lib/productPrefs'

const stats = ref({ totalProducts: 6, totalTrials: 150, satisfaction: 92 })

const products = ref([])
const selectedSystem = ref('ALL')
const selectedScene = ref('ALL')
const selectedServiceType = ref('ALL')
const selectedGranularity = ref('ALL')
const selectedSource = ref('ALL')
const keyword = ref('')
const viewMode = ref(localStorage.getItem('demo-products-view') === 'list' ? 'list' : 'card')
const prefsVersion = ref(0)
const router = useRouter()

const productSystems = [
  '物流行业数字化基础平台',
  '数据要素产品',
  '数智技术产品',
  '物流行业场景解决方案',
  '企业数智供应链产品',
  '物流供应链增值服务'
]

const serviceTypes = [
  '数据公共服务',
  '行业动态检测',
  '数据产业生态'
]

const verticalScenes = [
  '智慧港航',
  '智慧口岸',
  '智慧长江',
  '数字仓管',
  '网络货运',
  '航空物流',
  '航贸数字化',
  '多式联运'
]

const favorites = computed(() => {
  prefsVersion.value
  return readFavorites()
})

const filteredProducts = computed(() => {
  let result = products.value
  if (selectedSystem.value !== 'ALL') result = result.filter(p => String(p?.category || '') === selectedSystem.value)
  if (selectedScene.value !== 'ALL') result = result.filter(p => String(p?.scenarios || '').includes(selectedScene.value))
  if (selectedServiceType.value !== 'ALL') result = result.filter(p => String(p?.serviceType || '') === selectedServiceType.value)
  if (selectedGranularity.value !== 'ALL') {
    result = result.filter(p => granularityOfProduct(p) === selectedGranularity.value)
  }
  if (selectedSource.value === 'THIRD') result = result.filter(isThirdPartyProduct)
  if (selectedSource.value === 'INTERNAL') result = result.filter(p => !isThirdPartyProduct(p))
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(kw) || p.description?.toLowerCase().includes(kw))
  }
  return result
})

onMounted(async () => {
  window.addEventListener('demo-product-prefs-changed', onPrefsChanged)
  try {
    const productsRes = await productAPI.list()
    products.value = productsRes.data.data || []
    stats.value.totalProducts = Number(productsRes.data.total) || products.value.length || 0
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

function toggleFav(product) {
  const id = product?.id
  const next = toggleFavorite(id)
  const name = String(product?.name || '').trim()
  const isNowFav = next.includes(Number(id))
  const message = name ? `${isNowFav ? '已收藏' : '已取消收藏'}「${name}」` : (isNowFav ? '已收藏' : '已取消收藏')
  window.dispatchEvent(new CustomEvent('demo-toast', { detail: { type: 'success', message } }))
}

function openExternal(product) {
  const url = product?.externalDemoUrl
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function isThirdPartyProduct(product) {
  const s = String(product?.sourceType || 'INTERNAL').toUpperCase()
  return s !== 'INTERNAL'
}

function firstCapability(product) {
  const text = String(product?.capability || '').trim()
  if (!text) return ''
  const parts = text
    .split(/[,，/、\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
  return Array.from(new Set(parts)).slice(0, 3).join('、')
}

function firstScenario(product) {
  const text = String(product?.scenarios || '').trim()
  if (!text) return ''
  const parts = text
    .split(/[,，/、\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
  return Array.from(new Set(parts)).slice(0, 3).join('、')
}

function granularityOfProduct(p) {
  const name = String(p?.name || '')
  const desc = String(p?.description || '')
  const cap = String(p?.capability || '')

  const sysHints = ['WMS', 'TMS', 'OMS', 'ERP', 'SCM', '平台', '系统']
  if (sysHints.some(k => name.toUpperCase().includes(k) || desc.includes(k))) return 'SYSTEM'

  const atomicHints = ['API', 'SDK', '算法', '模型', 'OCR', '识别', '优化', '接口']
  if (atomicHints.some(k => cap.toUpperCase().includes(k) || desc.includes(k) || name.toUpperCase().includes(k))) return 'ATOMIC'
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
.filter-btn { padding: 8px; border: 1px solid #e0e0e0; background: #fff; border-radius: 20px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.filter-btn:first-child { border-radius: 4px; width: 116px; text-align: left;}
.filter-btn:hover { border-color: #0066ff; color: #0066ff; }
.filter-btn.active { background: #0066ff; color: #fff; border-color: #0066ff; }

.search-module{display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.search-input-wrap { width: 60%; position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #bfbfbf; display: inline-flex; align-items: center; justify-content: center; pointer-events: none; }
.search-input { width: 100%; padding: 12px 16px 12px 40px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.search-input:focus { outline: none; border-color: #0066ff; }

.view-toolbar { display: flex; justify-content: flex-end; gap: 10px;  }
.view-btn { height: 34px; padding: 0 14px; border-radius: 10px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; font-size: 13px; }
.view-btn.active { border-color: #1677ff; color: #1677ff; background: rgba(22, 119, 255, 0.06); }
.view-btn.icon { width: 40px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }

.product-grid { 
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; 
}

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
.row-btn.fav { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border-radius: 8px; border-color: #e0e0e0; background: #f5f7fa; color: #333; padding: 0 9px; }
.row-btn.fav:hover { background: rgba(22, 119, 255, 0.06); border-color: rgba(22, 119, 255, 0.5); color: #1677ff; }
.row-btn.fav.active { background: rgba(255, 77, 79, 0.08); border-color: rgba(255, 77, 79, 0.45); color: #ff4d4f; }
.fav-text { font-size: 13px; font-weight: 600; }

.empty-state { text-align: center; padding: 60px; color: #999; }


.stats-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: #fff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 40px; border: 1px solid rgba(5, 5, 5, 0.1);}
.stat-value { font-size: 36px; font-weight: 700; color: #1677ff; }
.stat-label { color: #666; margin-top: 8px; }

@media (max-width: 1100px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .row-actions { display: none; }
}
</style>
