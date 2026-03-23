<template>
  <div class="ai-chat" :class="{ embedded }">
    <div class="chat-container" :class="{ compact: !showSidebar }">
      <div v-if="showSidebar" class="chat-sidebar">
        <h3 class="chat-title">
          <img class="robot-icon" :src="robotIcon" alt="" />
          <span>AI 智能顾问</span>
        </h3>
        <p class="chat-intro">告诉我您的需求，AI 将为您推荐合适的产品和方案</p>
        
        <div class="quick-questions">
          <h4>常见问题</h4>
          <button v-for="q in quickQuestions" :key="q" class="quick-btn" @click="sendQuickQuestion(q)">
            {{ q }}
          </button>
        </div>

        <div class="quick-questions">
          <h4>快捷操作</h4>
          <button class="quick-btn" @click="finishAndGenerate" :disabled="loading">
            结束对话并生成方案
          </button>
        </div>
      </div>
      
      <div class="chat-main">
        <div class="messages" ref="messagesRef">
          <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
            <div class="message-avatar">
              <template v-if="msg.role === 'user'">👤</template>
              <img v-else class="robot-icon" :src="robotIcon" alt="" />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)"></div>

              <div v-if="msg.requirements && Object.keys(msg.requirements).length" class="requirements">
                <div class="requirements-title">需求要点</div>
                <div v-if="msg.completeness != null" class="requirements-meta">
                  <span class="req-meta-chip">完整度 {{ msg.completeness }}%</span>
                  <span v-if="msg.missing?.length" class="req-meta-chip">待补充：{{ msg.missing.map(requirementLabel).join(' / ') }}</span>
                </div>
                <div class="requirements-kv">
                  <div v-if="msg.requirements.industry" class="req-line">
                    <div class="req-k">{{ requirementLabel('industry') }}</div>
                    <div class="req-v">{{ msg.requirements.industry }}</div>
                  </div>
                  <div v-if="msg.requirements.scenario" class="req-line">
                    <div class="req-k">{{ requirementLabel('scenario') }}</div>
                    <div class="req-v">{{ msg.requirements.scenario }}</div>
                  </div>
                  <div v-if="msg.requirements.capability" class="req-line">
                    <div class="req-k">{{ requirementLabel('capability') }}</div>
                    <div class="req-v">{{ msg.requirements.capability }}</div>
                  </div>
                  <div v-if="msg.requirements.budget" class="req-line">
                    <div class="req-k">{{ requirementLabel('budget') }}</div>
                    <div class="req-v">{{ msg.requirements.budget }}</div>
                  </div>
                </div>
                <div v-if="visibleTags(msg).length" class="requirements-tags">
                  <span v-for="t in visibleTags(msg)" :key="t" class="req-tag">
                    {{ t }}
                  </span>
                </div>
              </div>
              
              <!-- <div v-if="msg.recommendedProducts?.length" class="recommend-section">
                <h4>当前推荐/热门产品</h4>
                <div class="product-grid">
                  <ProductCard
                    v-for="p in msg.recommendedProducts"
                    :key="p.id"
                    :product="p"
                    :showTry="true"
                    @select="goProduct"
                    @try="(product) => startTrial(product, null)"
                  />
                </div>
              </div> -->
              
              <div v-if="msg.recommendedSolutions?.length" class="recommend-section">
                <h4>推荐方案</h4>
                <div class="solution-list">
                  <div v-for="s in msg.recommendedSolutions" :key="s.id" class="solution-item">
                    <div class="solution-name">{{ s.name }}</div>
                    <div class="solution-info">{{ s.description }}</div>
                    <div class="solution-meta">
                      <span>⏱ {{ s.estimatedDays }}天</span>
                      <span>💰 {{ s.priceRange }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="msg.bundles?.length" class="recommend-section">
                <h4>可对比方案（选择后可直接试用）</h4>
                <div class="bundle-grid">
                  <div v-for="b in msg.bundles" :key="b.solution?.id" class="bundle-card">
                    <div class="bundle-header">
                      <div class="bundle-name">
                        {{ b.solution?.name }}
                        <span v-if="b.score != null" class="bundle-score">{{ b.score }}分</span>
                      </div>
                      <div class="bundle-meta">
                        <span v-if="b.solution?.estimatedDays != null">⏱ {{ b.solution.estimatedDays }}天</span>
                        <span v-if="b.solution?.priceRange">💰 {{ b.solution.priceRange }}</span>
                      </div>
                    </div>
                    <div v-if="b.solution?.description" class="bundle-desc">{{ b.solution.description }}</div>
                    <div v-if="b.highlights && Object.keys(b.highlights).length" class="bundle-highlights">
                      <span v-for="(v, k) in b.highlights" :key="k" class="highlight-tag">{{ k }}：{{ v }}</span>
                    </div>
                    <div v-if="b.reasons?.length" class="bundle-reasons">
                      <div v-for="(r, i) in b.reasons" :key="i" class="bundle-reason">{{ r }}</div>
                    </div>
                    <div class="bundle-actions">
                      <button class="btn-bundle" type="button" @click="chooseBundle(b)">
                        {{ selectedBundleSolutionId === (b.solution?.id || null) ? '已选择' : '选择这套方案' }}
                      </button>
                    </div>
                    <div v-if="b.products?.length && selectedBundleSolutionId === (b.solution?.id || null)" class="bundle-products">
                      <div class="bundle-products-title">可试用产品</div>
                      <div class="product-grid">
                        <ProductCard
                          v-for="p in b.products"
                          :key="p.id"
                          :product="p"
                          :showTry="true"
                          @select="goProduct"
                          @try="(product) => startTrial(product, b.solution?.id || null)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="msg.nextQuestion" class="next-question">
                <button class="next-question-btn" @click="sendMessage(msg.nextQuestion)">
                  {{ msg.nextQuestion }} →
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="loading" class="message assistant">
            <div class="message-avatar">
              <img class="robot-icon" :src="robotIcon" alt="" />
            </div>
            <div class="message-content">
              <div class="typing">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="embedded" class="chat-quickbar">
          <button
            v-for="q in embeddedQuickQuestions"
            :key="q"
            class="quick-chip"
            type="button"
            @click="sendMessage(q)"
            :disabled="loading"
          >
            {{ q }}
          </button>
        </div>

        <div class="chat-input">
          <input 
            v-model="inputMessage" 
            type="text" 
            placeholder="请描述您的需求..."
            @keyup.enter="sendMessage()"
            :disabled="loading"
          />
          <button @click="sendMessage()" :disabled="loading || !String(inputMessage || '').trim()">
            {{ loading ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { aiAPI } from '../api'
import ProductCard from '../components/ProductCard.vue'
import robotIcon from '@/assets/icons/robot.png'
import { writeAiRecommendations } from '../lib/productPrefs'

const CONV_KEY = 'demo-ai-conversation-id'

defineProps({
  embedded: { type: Boolean, default: false },
  showSidebar: { type: Boolean, default: true }
})

defineExpose({ sendMessage, resetConversation })

const initialAssistantMessage = {
  role: 'assistant',
  content: '您好！我是您的智能选型顾问\n\n为了给您推荐最合适的产品和方案，请告诉我：\n1. 您所在的行业\n2. 您希望解决的问题或场景\n3. 您的预算范围'
}

const messages = ref([initialAssistantMessage])
const inputMessage = ref('')
const loading = ref(false)
const messagesRef = ref(null)
const router = useRouter()
const conversationId = ref(Number(localStorage.getItem(CONV_KEY)) || null)
const selectedBundleSolutionId = ref(null)

const quickQuestions = [
  '物流行业仓储管理方案',
  '电商订单管理系统推荐',
  '供应链数字化转型',
  '中小型企业性价比方案'
]

const embeddedQuickQuestions = [
  '仓库管理',
  '多式联运',
  '价格/版本怎么选？',
  '推荐可直接试用的产品',
  '联系客服',
]

onMounted(() => {
  scrollToBottom()
})

function resetConversation() {
  loading.value = false
  inputMessage.value = ''
  messages.value = [initialAssistantMessage]
  conversationId.value = null
  selectedBundleSolutionId.value = null
  localStorage.removeItem(CONV_KEY)
  localStorage.removeItem('selectedBundle')
  scrollToBottom()
}

async function sendMessage(text = inputMessage.value) {
  const normalizedText = typeof text === 'string' ? text : inputMessage.value
  if (!String(normalizedText || '').trim() || loading.value) return
  
  const userMessage = String(normalizedText || '').trim()
  inputMessage.value = ''
  
  messages.value.push({ role: 'user', content: userMessage })
  scrollToBottom()
  
  loading.value = true
  
  try {
    const res = await aiAPI.chat({
      userId: 1,
      conversationId: conversationId.value,
      message: userMessage,
      history: messages.value.slice(-6).map(m => ({ role: m.role, content: m.content }))
    })
    
    const data = res?.data?.data ?? res?.data
    if (!data || typeof data !== 'object') throw new Error('invalid_ai_response')
    if (data?.conversationId != null) {
      const id = Number(data.conversationId)
      if (Number.isFinite(id)) {
        conversationId.value = id
        localStorage.setItem(CONV_KEY, String(id))
      }
    }
    window.dispatchEvent(new CustomEvent('demo-ai-conversation-updated'))
    messages.value.push({
      role: 'assistant',
      content: data.reply || '抱歉，未获取到回复内容，请稍后重试。',
      recommendedProducts: data.recommendedProducts,
      recommendedSolutions: data.recommendedSolutions,
      bundles: data.bundles,
      requirements: data.requirements,
      tags: data.tags,
      missing: data.missing,
      completeness: data.completeness,
      nextQuestion: data.needsMoreInfo ? data.nextQuestion : null
    })
    if (Array.isArray(data?.bundles) && data.bundles.length) selectedBundleSolutionId.value = null
    const productIds = collectRecommendedProductIds(data)
    if (productIds.length) {
      writeAiRecommendations({ productIds, requirements: data.requirements, time: Date.now() })
    }
  } catch (e) {
    messages.value.push({
      role: 'assistant',
      content: '抱歉，服务暂时不可用，请稍后重试。'
    })
  }
  
  loading.value = false
  scrollToBottom()
}

function sendQuickQuestion(q) {
  sendMessage(q)
}

function finishAndGenerate() {
  sendMessage('请根据以上对话内容，生成适配我的方案，给出1-2套可对比方案，并推荐可试用的产品。')
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

function formatMessage(text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

function requirementLabel(key) {
  const map = {
    industry: '行业',
    scenario: '场景',
    capability: '功能点',
    budget: '预算',
    scale: '规模',
    version: '版本',
    needCase: '案例'
  }
  return map[key] || key
}

function visibleTags(msg) {
  const raw = Array.isArray(msg?.tags) ? msg.tags : []
  const tags = raw.map(v => String(v || '').trim()).filter(Boolean)
  const hiddenPrefixes = ['行业:', '场景:', '预算:', '版本:', '规模:', '功能:']
  const filtered = tags.filter(t => !hiddenPrefixes.some(p => t.startsWith(p)))
  return Array.from(new Set(filtered))
}

function goProduct(product) {
  router.push(`/products/${product.id}`)
}

function startTrial(product, solutionId) {
  localStorage.setItem('trialStart', JSON.stringify({
    productId: product.id,
    solutionId
  }))
  router.push('/trial')
}

function chooseBundle(bundle) {
  const solutionId = bundle?.solution?.id || null
  selectedBundleSolutionId.value = solutionId
  localStorage.setItem('selectedBundle', JSON.stringify({
    solutionId,
    time: Date.now()
  }))
}

function collectRecommendedProductIds(data) {
  const ids = []
  const list = data?.recommendedProducts
  if (Array.isArray(list)) {
    for (const p of list) {
      if (p?.id != null) ids.push(Number(p.id))
    }
  }
  const bundles = data?.bundles
  if (Array.isArray(bundles)) {
    for (const b of bundles) {
      const products = b?.products
      if (!Array.isArray(products)) continue
      for (const p of products) {
        if (p?.id != null) ids.push(Number(p.id))
      }
    }
  }
  return Array.from(new Set(ids.filter(n => Number.isFinite(n))))
}
</script>

<style scoped>
.ai-chat { height: calc(100vh - 140px); }
.ai-chat.embedded { height: 100%; }

.chat-container { display: grid; grid-template-columns: 280px 1fr; gap: 24px; height: 100%; }
.chat-container.compact { grid-template-columns: 1fr; }
.chat-container { min-height: 0; }

.chat-sidebar { background: #fff; border-radius: 12px; padding: 24px; height: fit-content; }
.chat-title { display: inline-flex; align-items: center; gap: 10px; font-size: 18px; margin-bottom: 12px; }
.robot-icon { width: 22px; height: 22px; display: block; object-fit: contain; }
.chat-intro { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }

.quick-questions h4 { font-size: 14px; margin-bottom: 12px;  margin-top: 60px; }
.quick-btn { display: block; width: 100%; text-align: left; padding: 10px 12px; background: #f5f7fa; border: none; border-radius: 8px; margin-bottom: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.quick-btn:hover { background: #e8f4ff; color: #0066ff; }

.chat-main { background: #fff; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
.chat-main { min-height: 0; }

.messages { flex: 1; overflow-y: auto; padding: 12px; }
.messages { min-height: 0; }

.chat-quickbar { padding: 10px 12px; display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid rgba(5, 5, 5, 0.06); box-shadow: 0 -10px 18px rgba(0, 0, 0, 0.04); background: #fff; }
.quick-chip { padding: 8px 12px; background: #fff; border: 1px solid rgba(22, 119, 255, 0.35); color: #1677ff; border-radius: 999px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
.quick-chip:hover { background: rgba(22, 119, 255, 0.06); border-color: #1677ff; }
.quick-chip:disabled { opacity: 0.6; cursor: not-allowed; }

.message { display: flex; gap: 6px; margin-bottom: 20px; }
.message-avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; border-radius: 50%; font-size: 18px; flex-shrink: 0; }
.message.user { flex-direction: row-reverse; }
.message.user .message-content { align-items: flex-end; }
.message.user .message-avatar { background: #e8f4ff; }
.message.assistant .message-avatar { background: #fef3e2; }

.message-content { display: flex; flex-direction: column; gap: 8px; max-width: 70%; }
.message-text { padding: 12px 16px; border-radius: 12px; line-height: 1.6; font-size: 14px; }
.message.user .message-text { background: #a278de; color: #fff; }
.message.assistant .message-text { background: #f5f7fa; color: #333; }

.requirements { margin-top: 10px; }
.requirements-title { font-size: 13px; color: #999; margin-bottom: 6px; }
.requirements-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.req-meta-chip { font-size: 12px; color: #722ed1; background: rgba(114, 46, 209, 0.08); border: 1px solid rgba(114, 46, 209, 0.22); padding: 4px 8px; border-radius: 999px; }
.requirements-kv { display: flex; flex-direction: column; gap: 8px; }
.req-line { display: grid; grid-template-columns: 56px 1fr; gap: 10px; align-items: start; }
.req-k { font-size: 12px; color: #999; }
.req-v { font-size: 12px; color: #333; line-height: 1.6; word-break: break-word; }
.requirements-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.req-tag { font-size: 12px; color: #666; background: #f5f7fa; padding: 4px 8px; border-radius: 999px; }

.recommend-section { margin-top: 12px; }
.recommend-section h4 { font-size: 13px; color: #999; margin-bottom: 8px; }

.product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.ai-chat.embedded .product-grid { grid-template-columns: 1fr; }
.chat-container.compact .product-grid { grid-template-columns: 1fr; }

.solution-list { display: flex; flex-direction: column; gap: 8px; }
.solution-item { padding: 12px; background: #f9fafb; border-radius: 8px; }
.solution-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.solution-info { font-size: 12px; color: #666; margin-bottom: 8px; }
.solution-meta { display: flex; gap: 16px; font-size: 12px; color: #999; }

.bundle-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.bundle-card { background: #f9fafb; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.bundle-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.bundle-name { font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
.bundle-score { font-size: 12px; font-weight: 700; color: #722ed1; background: rgba(114, 46, 209, 0.08); border: 1px solid rgba(114, 46, 209, 0.22); padding: 2px 8px; border-radius: 999px; }
.bundle-meta { display: flex; gap: 12px; font-size: 12px; color: #999; white-space: nowrap; }
.bundle-desc { font-size: 12px; color: #666; line-height: 1.5; }
.bundle-highlights { display: flex; flex-wrap: wrap; gap: 8px; }
.highlight-tag { font-size: 12px; color: #0066ff; background: #e8f4ff; padding: 4px 8px; border-radius: 999px; }
.bundle-reasons { display: flex; flex-direction: column; gap: 6px; }
.bundle-reason { font-size: 12px; color: #666; line-height: 1.6; }
.bundle-actions { display: flex; justify-content: flex-end; }
.btn-bundle { padding: 8px 14px; border: 1px solid #0066ff; background: #fff; color: #0066ff; border-radius: 8px; cursor: pointer; font-size: 12px; }
.btn-bundle:hover { background: #0066ff; color: #fff; }
.bundle-products { display: flex; flex-direction: column; gap: 10px; }
.bundle-products-title { font-size: 13px; color: #999; }

.next-question { margin-top: 8px; }
.next-question-btn { padding: 8px 16px; background: #fff; border: 1px solid #0066ff; color: #0066ff; border-radius: 20px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.next-question-btn:hover { background: #0066ff; color: #fff; }

.typing { display: flex; gap: 4px; padding: 12px 16px; background: #f5f7fa; border-radius: 12px; }
.dot { width: 8px; height: 8px; background: #999; border-radius: 50%; animation: typing 1.4s infinite; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.chat-input { padding: 16px 12px; border-top: 1px solid #f0f0f0; display: flex; gap: 12px; }
.chat-input input { flex: 1; padding: 8px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.chat-input input:focus { outline: none; border-color: #0066ff; }
.chat-input button { padding: 12px 24px; background: #0066ff; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
.chat-input button:disabled { background: #ccc; cursor: not-allowed; }

@media (max-width: 1100px) {
  .product-grid { grid-template-columns: 1fr; }
  .bundle-grid { grid-template-columns: 1fr; }
}
</style>
