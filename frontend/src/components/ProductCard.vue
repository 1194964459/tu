<template>
  <div class="product-card" role="button" tabindex="0" @click="emit('select', product)" @keydown.enter="emit('select', product)">
    <div class="product-top">
      <span class="product-category">{{ product.category }}</span>
      <span v-if="product.popularity != null" class="product-popularity">🔥 {{ product.popularity }}</span>
    </div>
    <h3 class="product-name">{{ product.name }}</h3>
    <p v-if="product.description" class="product-desc">{{ product.description }}</p>
    <div v-if="capabilityText || scenarioText" class="product-tags">
      <div v-if="capabilityText" class="tag-row">
        <span class="tag-label">能力：</span>
        <span class="tag-value">{{ capabilityText }}</span>
      </div>
      <div v-if="scenarioText" class="tag-row">
        <span class="tag-label">场景：</span>
        <span class="tag-value">{{ scenarioText }}</span>
      </div>
    </div>
    <div class="product-footer">
      <span v-if="product.price != null" class="product-price">¥{{ product.price }}万起</span>
      <div class="product-actions">
        <button
          v-if="product.externalDemoUrl"
          class="btn-external"
          type="button"
          @click.stop="openExternal"
        >
          外部体验
        </button>
        <button
          v-if="showTry"
          class="btn-try"
          type="button"
          @click.stop="emit('try', product)"
        >
          立即试用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true },
  showTry: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'try'])

function openExternal() {
  const url = props.product?.externalDemoUrl
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const capabilityText = computed(() => {
  const cap = props.product?.capability
  if (!cap) return ''
  return String(cap).split(',')[0]?.trim() || ''
})

const scenarioText = computed(() => {
  const sc = props.product?.scenarios
  if (!sc) return ''
  return String(sc).split(',')[0]?.trim() || ''
})
</script>

<style scoped>
.product-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid rgba(5, 5, 5, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.product-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.product-category {
  font-size: 12px;
  color: #0066ff;
  background: #e8f4ff;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.product-popularity {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.product-name {
  font-size: 16px;
  margin-bottom: 8px;
}

.product-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-tags {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
  margin-bottom: 12px;
}

.tag-row { display: flex; align-items: flex-start; }
.tag-label { flex-shrink: 0; font-size: 12px; color: #666; background: #f9fafb;padding: 3px 8px; line-height: 18px; }
.tag-value { font-size: 12px; color: #999; background: #f9fafb; padding: 3px 0; border-radius: 6px; line-height: 18px; }

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.product-price {
  color: #ff4d4f;
  font-weight: 600;
  white-space: nowrap;
}

.product-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.btn-try {
  padding: 8px 14px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.btn-try:hover {
  background: #0958d9;
}

.btn-external {
  padding: 8px 14px;
  background: #fff;
  color: #1677ff;
  border: 1px solid rgba(22, 119, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.btn-external:hover {
  border-color: #1677ff;
  color: #1677ff;
  background: rgba(22, 119, 255, 0.06);
}
</style>
