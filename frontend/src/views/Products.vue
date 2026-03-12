<template>
  <div class="products-page">
    <div class="page-header">
      <h1>产品库</h1>
      <p>发现最适合您的产品解决方案</p>
    </div>

    <!-- 分类筛选 -->
    <div class="filters">
      <button class="filter-btn" :class="{ active: !selectedCategory }" @click="selectedCategory = ''">全部</button>
      <button v-for="cat in categories" :key="cat" class="filter-btn" :class="{ active: selectedCategory === cat }" @click="selectedCategory = cat">
        {{ cat }}
      </button>
    </div>

    <!-- 搜索 -->
    <div class="search-box">
      <input v-model="keyword" type="text" placeholder="搜索产品..." class="search-input" @input="searchProducts" />
    </div>

    <!-- 产品列表 -->
    <div class="product-list">
      <div v-for="product in filteredProducts" :key="product.id" class="product-item" @click="$router.push(`/products/${product.id}`)">
        <div class="product-info">
          <span class="product-category">{{ product.category }}</span>
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-desc">{{ product.description }}</p>
          <div class="product-tags">
            <span class="tag">能力: {{ product.capability?.split(',')[0] }}</span>
            <span class="tag">场景: {{ product.scenarios?.split(',')[0] }}</span>
          </div>
        </div>
        <div class="product-action">
          <div class="product-price">¥{{ product.price }}万起</div>
          <button class="btn-try" @click.stop="startTrial(product)">立即试用</button>
        </div>
      </div>
    </div>

    <div v-if="filteredProducts.length === 0" class="empty-state">
      <p>暂无产品</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { productAPI } from '../api'

const products = ref([])
const categories = ref([])
const selectedCategory = ref('')
const keyword = ref('')

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
  } catch (e) {
    console.error(e)
  }
})

function searchProducts() {
  // 自动触发 computed
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

.product-list { display: flex; flex-direction: column; gap: 16px; }
.product-item { background: #fff; border-radius: 12px; padding: 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.product-item:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
.product-category { font-size: 12px; color: #0066ff; background: #e8f4ff; padding: 4px 8px; border-radius: 4px; }
.product-name { font-size: 18px; margin: 8px 0; }
.product-desc { color: #666; font-size: 14px; margin-bottom: 12px; }
.product-tags { display: flex; gap: 8px; }
.tag { font-size: 12px; color: #999; background: #f5f7fa; padding: 4px 8px; border-radius: 4px; }

.product-action { text-align: right; }
.product-price { font-size: 20px; font-weight: 600; color: #ff4d4f; margin-bottom: 12px; }
.btn-try { padding: 10px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-try:hover { opacity: 0.9; }

.empty-state { text-align: center; padding: 60px; color: #999; }
</style>
