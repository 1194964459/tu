<template>
  <div class="product-card" role="button" tabindex="0" @click="emit('select', product)" @keydown.enter="emit('select', product)">
    <div class="product-top">
      <span class="product-category">{{ product.category }}</span>
      <div class="product-top-right">
        <span v-if="product.popularity != null" class="product-popularity">🔥 {{ product.popularity }}</span>
      </div>
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
        <button class="btn-fav" :class="{ active: isFavorite }" type="button" @click.stop="toggleFav">
          <svg v-if="isFavorite" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          <!-- <span class="btn-fav__text">{{ isFavorite ? '已收藏' : '收藏' }}</span> -->
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { readFavorites, toggleFavorite } from '../lib/productPrefs'

const props = defineProps({
  product: { type: Object, required: true },
  showTry: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'try'])

const prefsVersion = ref(0)

const favorites = computed(() => {
  prefsVersion.value
  return readFavorites()
})
const isFavorite = computed(() => favorites.value.includes(Number(props.product?.id)))

const onPrefsChanged = () => {
  prefsVersion.value += 1
}

onMounted(() => {
  window.addEventListener('demo-product-prefs-changed', onPrefsChanged)
})

onUnmounted(() => {
  window.removeEventListener('demo-product-prefs-changed', onPrefsChanged)
})

function openExternal() {
  const url = props.product?.externalDemoUrl
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

function toggleFav() {
  const id = props.product?.id
  const next = toggleFavorite(id)
  const name = String(props.product?.name || '').trim()
  const isNowFav = next.includes(Number(id))
  const message = name ? `${isNowFav ? '已收藏' : '已取消收藏'}「${name}」` : (isNowFav ? '已收藏' : '已取消收藏')
  window.dispatchEvent(new CustomEvent('demo-toast', { detail: { type: 'success', message } }))
}

function parseTopList(raw, maxCount = 3) {
  const text = String(raw || '').trim()
  if (!text) return ''
  const parts = text
    .split(/[,，/、\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
  return Array.from(new Set(parts)).slice(0, maxCount).join('、')
}

const capabilityText = computed(() => {
  return parseTopList(props.product?.capability, 3)
})

const scenarioText = computed(() => {
  return parseTopList(props.product?.scenarios, 3)
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

.product-top-right { display: inline-flex; align-items: center; gap: 10px; }

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

.btn-fav {
  height: 32px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #f5f7fa;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #333;
}

.btn-fav:hover { border-color: rgba(22, 119, 255, 0.5); color: #1677ff; background: rgba(22, 119, 255, 0.06); }
.btn-fav.active { border-color: rgba(255, 77, 79, 0.45); color: #ff4d4f; background: rgba(255, 77, 79, 0.08); }
.btn-fav__text { font-size: 13px; font-weight: 600; line-height: 1; }

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
  padding: 8px 10px;
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
