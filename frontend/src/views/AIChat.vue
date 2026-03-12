<template>
  <div class="ai-chat">
    <div class="chat-container">
      <div class="chat-sidebar">
        <h3>💡 AI 智能顾问</h3>
        <p class="chat-intro">告诉我您的需求，AI 将为您推荐合适的产品和方案</p>
        
        <div class="quick-questions">
          <h4>常见问题</h4>
          <button v-for="q in quickQuestions" :key="q" class="quick-btn" @click="sendQuickQuestion(q)">
            {{ q }}
          </button>
        </div>
      </div>
      
      <div class="chat-main">
        <div class="messages" ref="messagesRef">
          <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.role">
            <div class="message-avatar">
              {{ msg.role === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)"></div>
              
              <!-- 推荐产品 -->
              <div v-if="msg.recommendedProducts?.length" class="recommend-section">
                <h4>推荐产品</h4>
                <div class="product-list">
                  <div v-for="p in msg.recommendedProducts" :key="p.id" class="product-item" @click="$router.push(`/products/${p.id}`)">
                    <div class="product-name">{{ p.name }}</div>
                    <div class="product-info">
                      <span>¥{{ p.price }}万起</span>
                      <span class="product-category">{{ p.category }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 推荐方案 -->
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
              
              <!-- 追问问题 -->
              <div v-if="msg.nextQuestion" class="next-question">
                <button class="next-question-btn" @click="sendMessage(msg.nextQuestion)">
                  {{ msg.nextQuestion }} →
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="loading" class="message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <input 
            v-model="inputMessage" 
            type="text" 
            placeholder="请描述您的需求，如：我是物流企业，需要仓储管理解决方案"
            @keyup.enter="sendMessage"
            :disabled="loading"
          />
          <button @click="sendMessage" :disabled="loading || !inputMessage.trim()">
            {{ loading ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { aiAPI } from '../api'

const messages = ref([
  {
    role: 'assistant',
    content: '您好！我是您的智能选型顾问 🤖\n\n为了给您推荐最合适的产品和方案，请告诉我：\n1. 您所在的行业\n2. 您希望解决的问题或场景\n3. 您的预算范围'
  }
])
const inputMessage = ref('')
const loading = ref(false)
const messagesRef = ref(null)

const quickQuestions = [
  '物流行业仓储管理方案',
  '电商订单管理系统推荐',
  '供应链数字化转型',
  '中小型企业性价比方案'
]

onMounted(() => {
  scrollToBottom()
})

async function sendMessage(text = inputMessage.value) {
  if (!text.trim() || loading.value) return
  
  const userMessage = text.trim()
  inputMessage.value = ''
  
  // 添加用户消息
  messages.value.push({ role: 'user', content: userMessage })
  scrollToBottom()
  
  loading.value = true
  
  try {
    const res = await aiAPI.chat({
      userId: 1,
      message: userMessage,
      history: messages.value.slice(-6).map(m => ({ role: m.role, content: m.content }))
    })
    
    const data = res.data.data
    messages.value.push({
      role: 'assistant',
      content: data.reply,
      recommendedProducts: data.recommendedProducts,
      recommendedSolutions: data.recommendedSolutions,
      nextQuestion: data.needsMoreInfo ? data.nextQuestion : null
    })
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
</script>

<style scoped>
.ai-chat { height: calc(100vh - 140px); }

.chat-container { display: grid; grid-template-columns: 280px 1fr; gap: 24px; height: 100%; }

.chat-sidebar { background: #fff; border-radius: 12px; padding: 24px; height: fit-content; }
.chat-sidebar h3 { font-size: 18px; margin-bottom: 12px; }
.chat-intro { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }

.quick-questions h4 { font-size: 14px; color: #999; margin-bottom: 12px; }
.quick-btn { display: block; width: 100%; text-align: left; padding: 10px 12px; background: #f5f7fa; border: none; border-radius: 8px; margin-bottom: 8px; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.quick-btn:hover { background: #e8f4ff; color: #0066ff; }

.chat-main { background: #fff; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }

.messages { flex: 1; overflow-y: auto; padding: 24px; }

.message { display: flex; gap: 12px; margin-bottom: 20px; }
.message-avatar { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; border-radius: 50%; font-size: 18px; flex-shrink: 0; }
.message.user { flex-direction: row-reverse; }
.message.user .message-content { align-items: flex-end; }
.message.user .message-avatar { background: #e8f4ff; }
.message.assistant .message-avatar { background: #fef3e2; }

.message-content { display: flex; flex-direction: column; gap: 8px; max-width: 70%; }
.message-text { padding: 12px 16px; border-radius: 12px; line-height: 1.6; font-size: 14px; }
.message.user .message-text { background: #0066ff; color: #fff; }
.message.assistant .message-text { background: #f5f7fa; color: #333; }

.recommend-section { margin-top: 12px; }
.recommend-section h4 { font-size: 13px; color: #999; margin-bottom: 8px; }

.product-list { display: flex; flex-direction: column; gap: 8px; }
.product-item { padding: 12px; background: #f9fafb; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.product-item:hover { background: #e8f4ff; }
.product-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.product-info { display: flex; justify-content: space-between; font-size: 12px; color: #666; }
.product-category { color: #0066ff; }

.solution-list { display: flex; flex-direction: column; gap: 8px; }
.solution-item { padding: 12px; background: #f9fafb; border-radius: 8px; }
.solution-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.solution-info { font-size: 12px; color: #666; margin-bottom: 8px; }
.solution-meta { display: flex; gap: 16px; font-size: 12px; color: #999; }

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

.chat-input { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; gap: 12px; }
.chat-input input { flex: 1; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.chat-input input:focus { outline: none; border-color: #0066ff; }
.chat-input button { padding: 12px 24px; background: #0066ff; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; }
.chat-input button:disabled { background: #ccc; cursor: not-allowed; }
</style>
