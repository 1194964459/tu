<template>
  <div class="product-detail">
    <button class="back-btn" @click="$router.back()">← 返回</button>
    
    <div v-if="product" class="detail-content">
      <div class="detail-main">
        <span class="product-category">{{ product.category }}</span>
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-desc">{{ product.description }}</p>
        
        <div class="detail-section">
          <h3>核心能力</h3>
          <div class="capability-list">
            <span v-for="cap in product.capability?.split(',')" :key="cap" class="capability-tag">{{ cap }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>适用场景</h3>
          <div class="scenario-list">
            <span v-for="scene in product.scenarios?.split(',')" :key="scene" class="scenario-tag">{{ scene }}</span>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>产品信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">版本</span>
              <span class="info-value">{{ product.version }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">供应商</span>
              <span class="info-value">{{ product.providerName }}</span>
            </div>
            <div v-if="product.sourceType" class="info-item">
              <span class="info-label">来源</span>
              <span class="info-value">{{ product.sourceType }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">价格</span>
              <span class="info-value price">¥{{ product.price }}万起</span>
            </div>
            <div class="info-item">
              <span class="info-label">热度</span>
              <span class="info-value">🔥 {{ product.popularity }}</span>
            </div>
            <div v-if="product.externalDemoUrl" class="info-item">
              <span class="info-label">外部体验</span>
              <a class="info-value link" :href="product.externalDemoUrl" target="_blank">{{ product.externalDemoUrl }}</a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="detail-sidebar">
        <div class="action-card">
          <div class="price-display">
            <span class="price-label">价格</span>
            <span class="price-value">¥{{ product.price }}</span>
            <span class="price-unit">万起</span>
          </div>
          <button v-if="product.externalDemoUrl" class="btn-primary" @click="openExternal">外部体验</button>
          <button v-else class="btn-primary" @click="startTrial">立即试用</button>
          <button class="btn-secondary" @click="consultAdvisor">咨询顾问</button>
        </div>
        
        <div v-if="relatedProducts.length" class="related-section">
          <h3>相关产品</h3>
          <div v-for="p in relatedProducts" :key="p.id" class="related-item" @click="$router.push(`/products/${p.id}`)">
            <div class="related-name">{{ p.name }}</div>
            <div class="related-price">¥{{ p.price }}万</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { productAPI } from '../api'

const route = useRoute()
const product = ref(null)
const relatedProducts = ref([])

onMounted(async () => {
  try {
    const res = await productAPI.detail(route.params.id)
    product.value = res.data.data
    relatedProducts.value = res.data.relatedProducts || []
  } catch (e) {
    console.error(e)
  }
})

function startTrial() {
  localStorage.setItem('trialProduct', JSON.stringify(product.value))
  window.location.href = '/trial'
}

function openExternal() {
  const url = product.value?.externalDemoUrl
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function consultAdvisor() {
  const p = product.value
  const name = p?.name ? `“${p.name}”` : '该产品'
  const message = `我想咨询 ${name}：\n- 适用场景有哪些？\n- 版本/价格怎么选？\n- 能否给出类似案例或落地建议？`
  window.dispatchEvent(new CustomEvent('demo-open-ai-chat', { detail: { message } }))
}
</script>

<style scoped>
.product-detail { padding: 0; }
.back-btn { background: none; border: none; color: #666; cursor: pointer; font-size: 14px; margin-bottom: 24px; }
.back-btn:hover { color: #0066ff; }

.detail-content { display: grid; grid-template-columns: 1fr 320px; gap: 32px; }
.detail-main { background: #fff; padding: 32px; border-radius: 12px; }
.product-category { font-size: 14px; color: #0066ff; background: #e8f4ff; padding: 6px 12px; border-radius: 6px; }
.product-name { font-size: 28px; margin: 16px 0; }
.product-desc { color: #666; font-size: 16px; line-height: 1.8; margin-bottom: 32px; }

.detail-section { margin-bottom: 32px; }
.detail-section h3 { font-size: 18px; margin-bottom: 16px; }

.capability-list, .scenario-list { display: flex; flex-wrap: wrap; gap: 8px; }
.capability-tag { background: #e8f4ff; color: #0066ff; padding: 8px 16px; border-radius: 20px; font-size: 14px; }
.scenario-tag { background: #f5f7fa; color: #666; padding: 8px 16px; border-radius: 20px; font-size: 14px; }

.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.info-item { background: #f9fafb; padding: 12px 16px; border-radius: 8px; }
.info-label { display: block; font-size: 12px; color: #999; margin-bottom: 4px; }
.info-value { font-size: 14px; font-weight: 500; }
.info-value.price { color: #ff4d4f; font-size: 18px; }
.info-value.link { color: #0066ff; word-break: break-all; }

.detail-sidebar { display: flex; flex-direction: column; gap: 20px; }
.action-card { background: #fff; padding: 24px; border-radius: 12px; position: sticky; top: 100px; }
.price-display { text-align: center; margin-bottom: 24px; }
.price-label { display: block; font-size: 14px; color: #999; margin-bottom: 8px; }
.price-value { font-size: 32px; font-weight: 700; color: #ff4d4f; }
.price-unit { font-size: 14px; color: #999; }

.btn-primary { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin-bottom: 12px; }
.btn-secondary { width: 100%; padding: 14px; background: #f5f7fa; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; font-size: 16px; }

.related-section { background: #fff; padding: 20px; border-radius: 12px; }
.related-section h3 { font-size: 16px; margin-bottom: 16px; }
.related-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.related-item:last-child { border-bottom: none; }
.related-item:hover { color: #0066ff; }
.related-name { font-size: 14px; margin-bottom: 4px; }
.related-price { font-size: 14px; color: #ff4d4f; }
</style>
