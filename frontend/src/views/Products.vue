<template>
  <div class="products-page">
    <div class="page-header">
      <h1>产品库</h1>
      <p>发现最适合您的产品解决方案</p>
    </div>

    <!-- 分类筛选 -->
    <div class="filters">
      <button class="filter-btn" :class="{ active: !selectedCategory }" @click="setCategory('')">全部</button>
      <button v-for="cat in categories" :key="cat" class="filter-btn" :class="{ active: selectedCategory === cat }" @click="setCategory(cat)">
        {{ cat }}
      </button>
    </div>

    <!-- 搜索 -->
    <div class="search-box">
      <input v-model="keyword" type="text" placeholder="搜索产品..." class="search-input" @input="searchProducts" />
    </div>

    <!-- 产品列表 -->
    <div class="product-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        :showTry="true"
        @select="openProduct"
        @try="startTrial"
      />
    </div>

    <div v-if="filteredProducts.length === 0" class="empty-state">
      <p>暂无产品</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productAPI } from '../api'
import ProductCard from '../components/ProductCard.vue'

const products = ref([])
const categories = ref([])
const selectedCategory = ref('')
const keyword = ref('')
const route = useRoute()
const router = useRouter()

const filteredProducts = computed(() => {
  let result = products.value
  if (selectedCategory.value) {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  if (keyword.value) {
    const kw = keyword.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(kw) || p.description?.toLowerCase().includes(kw))
  }
  return result
})

onMounted(async () => {
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

function openProduct(product) {
  if (!product?.id) return
  router.push(`/products/${product.id}`)
}

function startTrial(product) {
  // 跳转到试用页面并传递产品ID
  localStorage.setItem('trialProduct', JSON.stringify(product))
  window.location.href = '/trial'
}
</script>

<style scoped>
.products-page { padding: 0; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; margin-bottom: 8px; }
.page-header p { color: #666; }

.filters { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.filter-btn { padding: 8px 16px; border: 1px solid #e0e0e0; background: #fff; border-radius: 20px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.filter-btn:hover { border-color: #0066ff; color: #0066ff; }
.filter-btn.active { background: #0066ff; color: #fff; border-color: #0066ff; }

.search-box { margin-bottom: 24px; }
.search-input { width: 100%; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.search-input:focus { outline: none; border-color: #0066ff; }

.product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

.empty-state { text-align: center; padding: 60px; color: #999; }

@media (max-width: 1100px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
