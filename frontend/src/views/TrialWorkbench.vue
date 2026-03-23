<template>
  <div class="trial-workbench">
    <div class="page-header">
      <h1>我的工作台</h1>
      <p>收藏、在线试用与反馈跟进</p>
    </div>

    <!-- 试用统计 -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-icon running" aria-label="进行中">
          <span
            class="running-spinner running-mask"
            aria-hidden="true"
            :style="{ WebkitMaskImage: `url(${runningIcon})`, maskImage: `url(${runningIcon})` }"
          ></span>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.runningCount }}</div>
          <div class="stat-label">进行中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.completedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.averageRating || '-' }}</div>
          <div class="stat-label">平均评分</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>我的收藏</h2>
      </div>

      <div class="pref-grid">
        <div class="pref-col">
          <div class="pref-title">收藏</div>
          <div v-if="favoriteProducts.length" class="pref-products">
            <ProductCard
              v-for="p in favoriteProducts"
              :key="p.id"
              :product="p"
              :showTry="true"
              @select="goProduct"
              @try="preselectTrial"
            />
          </div>
          <div v-else class="pref-empty">暂无收藏</div>
        </div>
      </div>
    </div>

    <!-- 试用记录列表 -->
    <div class="section">
      <div class="section-header">
        <h2>我的试用</h2>
        <button class="btn-new" @click="showNewTrial = true">+ 新建试用</button>
      </div>

      <div class="trial-list">
        <div v-for="trial in trials" :key="trial.id" class="trial-card">
          <div class="trial-header">
            <div class="trial-product">{{ getProductName(trial.productId) }}</div>
            <span class="trial-status" :class="trial.status">{{ trial.statusText }}</span>
          </div>
          
          <div class="trial-info">
            <div class="trial-item">
              <span class="label">环境地址</span>
              <a :href="trial.environmentUrl" target="_blank" class="trial-link">{{ trial.environmentUrl }}</a>
            </div>
            <div class="trial-item">
              <span class="label">试用时间</span>
              <span>{{ formatDate(trial.startTime) }} - {{ formatDate(trial.endTime) }}</span>
            </div>
            <div v-if="trial.feedback" class="trial-item">
              <span class="label">反馈状态</span>
              <span>{{ feedbackStatusText(trial.feedback.status) }}</span>
            </div>
          </div>

          <div v-if="trial.feedback?.providerReply" class="provider-reply">
            <span class="label">处理回复</span>
            <span class="reply-text">{{ trial.feedback.providerReply }}</span>
          </div>

          <div v-if="adminMode && trial.feedback && feedbackEdits[trial.feedback.id]" class="admin-panel">
            <div class="admin-row">
              <span class="admin-label">处理状态</span>
              <select v-model="feedbackEdits[trial.feedback.id].status" class="admin-select">
                <option value="SUBMITTED">已提交</option>
                <option value="VIEWED">已查看</option>
                <option value="REPLIED">已回复</option>
                <option value="CLOSED">已关闭</option>
              </select>
            </div>
            <div class="admin-row">
              <span class="admin-label">回复内容</span>
              <textarea v-model="feedbackEdits[trial.feedback.id].providerReply" class="admin-textarea" rows="2" placeholder="填写处理回复（可选）"></textarea>
            </div>
            <div class="admin-actions">
              <button class="btn-admin" type="button" @click="saveFeedbackUpdate(trial)">更新处理状态</button>
            </div>
          </div>

          <div class="trial-actions">
            <button v-if="trial.status === 'RUNNING'" class="btn-action" @click="openEnvironment(trial)">
              进入环境
            </button>
            <button v-if="trial.status === 'RUNNING'" class="btn-action report" @click="showFeedback(trial)">
              试用后反馈
            </button>
            <button v-if="trial.status === 'RUNNING'" class="btn-action" @click="extendTrial(trial)">
              延长试用
            </button>
            <button v-if="trial.feedback" class="btn-action view-feedback" @click="viewFeedback(trial)">
              查看反馈
            </button>
            <button class="btn-action report" type="button" @click="downloadTrialReport(trial)">
              下载试用报告
            </button>
          </div>
        </div>

        <div v-if="trials.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>暂无试用记录</p>
          <!-- <button class="btn-new" @click="showNewTrial = true">开始第一个试用</button> -->
        </div>
      </div>
    </div>

    <!-- 新建试用弹窗 -->
    <div v-if="showNewTrial" class="modal-overlay" @click="showNewTrial = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>创建试用</h3>
          <button class="close-btn" @click="showNewTrial = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>选择产品</label>
            <select v-model="newTrial.productId" class="form-select">
              <option value="">请选择产品</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>测试数据（可选）</label>
            <textarea v-model="newTrial.testData" class="form-textarea" placeholder="输入您希望测试的数据或场景..." rows="4"></textarea>
          </div>
          
          <div class="form-info">
            <p>📌 试用说明</p>
            <ul>
              <li>试用环境有效期为 7 天</li>
              <li>每个产品限同时进行 1 个试用</li>
              <li>试用数据与正式环境隔离</li>
            </ul>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-cancel" @click="showNewTrial = false">取消</button>
          <button class="btn-confirm" @click="createTrial" :disabled="!newTrial.productId">创建试用</button>
        </div>
      </div>
    </div>

    <!-- 反馈弹窗 -->
    <div v-if="showFeedbackModal" class="modal-overlay" @click="showFeedbackModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>提交试用反馈</h3>
          <button class="close-btn" @click="showFeedbackModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>整体评分</label>
            <div class="rating-stars">
              <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= feedbackForm.rating }" @click="feedbackForm.rating = i">★</span>
            </div>
          </div>
          
          <div class="form-group">
            <label>使用感受</label>
            <textarea v-model="feedbackForm.feedback" class="form-textarea" placeholder="请分享您的使用体验..." rows="4"></textarea>
          </div>
          
          <div class="form-group">
            <label>遇到的问题（可选）</label>
            <textarea v-model="feedbackForm.issues" class="form-textarea" placeholder="如有遇到问题，请详细描述..." rows="3"></textarea>
          </div>
          
          <div class="form-group">
            <label>购买意向</label>
            <div class="intent-options">
              <label v-for="opt in intentOptions" :key="opt.value" class="intent-option" :class="{ active: feedbackForm.purchaseIntent === opt.value }">
                <input type="radio" v-model="feedbackForm.purchaseIntent" :value="opt.value" />
                {{ opt.label }}
              </label>
            </div>
          </div>
        </div>
        
        
        <div class="modal-footer">
          <button class="btn-cancel" @click="showFeedbackModal = false">取消</button>
          <button class="btn-confirm" @click="submitFeedback" :disabled="!feedbackForm.rating">提交反馈</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trialAPI, productAPI, feedbackAPI } from '../api'
import ProductCard from '../components/ProductCard.vue'
import { readFavorites } from '../lib/productPrefs'
import runningIcon from '@/assets/icons/xunhuan.svg'
// import runningIcon from '@/assets/icons/xh.svg'


const trials = ref([])
const products = ref([])
const stats = ref({ runningCount: 0, completedCount: 0, averageRating: 0 })
const showNewTrial = ref(false)
const showFeedbackModal = ref(false)
const currentTrial = ref(null)
const route = useRoute()
const router = useRouter()
const adminMode = computed(() => route.query.admin === '1')
const feedbackEdits = reactive({})
const prefsVersion = ref(0)

const favoriteIds = computed(() => {
  prefsVersion.value
  return readFavorites()
})

const favoriteProducts = computed(() => {
  const ids = new Set(favoriteIds.value.map(Number))
  return products.value.filter(p => ids.has(Number(p.id))).slice(0, 8)
})

const newTrial = reactive({
  productId: '',
  solutionId: null,
  testData: ''
})

const feedbackForm = reactive({
  rating: 0,
  feedback: '',
  issues: '',
  purchaseIntent: 'NONE'
})

const intentOptions = [
  { value: 'NONE', label: '暂无兴趣' },
  { value: 'INTERESTED', label: '感兴趣' },
  { value: 'PENDING', label: '考虑中' },
  { value: 'PURCHASED', label: '已购买' }
]

const statusMap = {
  PENDING: { text: '待开始', class: 'pending' },
  RUNNING: { text: '进行中', class: 'running' },
  COMPLETED: { text: '已完成', class: 'completed' },
  EXPIRED: { text: '已过期', class: 'expired' }
}

onMounted(async () => {
  window.addEventListener('demo-product-prefs-changed', onPrefsChanged)
  await loadData()
  
  // 检查是否有预选产品
  const trialProduct = localStorage.getItem('trialProduct')
  if (trialProduct) {
    const product = JSON.parse(trialProduct)
    newTrial.productId = product.id
    localStorage.removeItem('trialProduct')
  }

  const trialStart = localStorage.getItem('trialStart')
  if (trialStart) {
    const payload = JSON.parse(trialStart)
    if (payload?.productId != null) {
      newTrial.productId = String(payload.productId)
      showNewTrial.value = true
    }
    if (payload?.solutionId != null) {
      newTrial.solutionId = payload.solutionId
    }
    localStorage.removeItem('trialStart')
  }
})

onUnmounted(() => {
  window.removeEventListener('demo-product-prefs-changed', onPrefsChanged)
})

async function loadData() {
  try {
    const [trialsRes, productsRes, statsRes] = await Promise.all([
      trialAPI.userTrials(1), // 默认用户ID
      productAPI.list(),
      trialAPI.stats()
    ])
    
    trials.value = (trialsRes.data.data || []).map(t => ({
      ...t,
      statusText: statusMap[t.status]?.text || t.status,
      feedback: null
    }))
    products.value = productsRes.data.data || []
    
    if (statsRes.data.data) {
      stats.value = statsRes.data.data
    }
    
    // 加载反馈
    for (const trial of trials.value) {
      const detail = await trialAPI.detail(trial.id)
      if (detail.data.data?.feedback) {
        trial.feedback = detail.data.data.feedback
        if (trial.feedback?.id != null) {
          feedbackEdits[trial.feedback.id] = {
            status: trial.feedback.status || 'SUBMITTED',
            providerReply: trial.feedback.providerReply || ''
          }
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

function onPrefsChanged() {
  prefsVersion.value += 1
}

function goProduct(product) {
  if (!product?.id) return
  router.push(`/products/${product.id}`)
}

function preselectTrial(product) {
  if (!product?.id) return
  newTrial.productId = String(product.id)
  showNewTrial.value = true
}

function getProductName(productId) {
  const product = products.value.find(p => p.id === productId)
  return product?.name || '未知产品'
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

async function createTrial() {
  try {
    const productId = Number(newTrial.productId)
    if (!Number.isFinite(productId)) throw new Error('请选择产品')

    const payload = {
      userId: 1,
      productId,
      testData: newTrial.testData
    }
    if (newTrial.solutionId != null) payload.solutionId = Number(newTrial.solutionId)

    await trialAPI.create(payload)
    
    showNewTrial.value = false
    newTrial.productId = ''
    newTrial.solutionId = null
    newTrial.testData = ''
    
    await loadData()
    alert('试用创建成功！')
  } catch (e) {
    alert('创建失败：' + e.message)
  }
}

function openEnvironment(trial) {
  window.open(trial.environmentUrl, '_blank')
}

function showFeedback(trial) {
  currentTrial.value = trial
  feedbackForm.rating = 0
  feedbackForm.feedback = ''
  feedbackForm.issues = ''
  feedbackForm.purchaseIntent = 'NONE'
  showFeedbackModal.value = true
}

async function submitFeedback() {
  try {
    await trialAPI.feedback(currentTrial.value.id, {
      userId: 1,
      rating: feedbackForm.rating,
      feedback: feedbackForm.feedback,
      issues: feedbackForm.issues,
      purchaseIntent: feedbackForm.purchaseIntent
    })
    
    showFeedbackModal.value = false
    await loadData()
    alert('反馈提交成功！感谢您的参与。')
  } catch (e) {
    alert('提交失败：' + e.message)
  }
}

async function extendTrial(trial) {
  if (confirm('确定延长 7 天试用期吗？')) {
    try {
      await trialAPI.extend(trial.id, 7)
      await loadData()
      alert('试用期已延长！')
    } catch (e) {
      alert('操作失败：' + e.message)
    }
  }
}

function viewFeedback(trial) {
  const fb = trial.feedback
  alert(`评分: ${'★'.repeat(fb.rating)}\n反馈: ${fb.feedback || '-'}\n问题: ${fb.issues || '-'}\n意向: ${purchaseIntentText(fb.purchaseIntent)}\n状态: ${feedbackStatusText(fb.status)}\n处理回复: ${fb.providerReply || '-'}`)
}

async function saveFeedbackUpdate(trial) {
  const fb = trial.feedback
  if (!fb?.id) return

  const edit = feedbackEdits[fb.id]
  if (!edit) return

  try {
    await feedbackAPI.update(fb.id, {
      status: edit.status,
      providerReply: edit.providerReply || null
    })
    await loadData()
    alert('已更新处理状态')
  } catch (e) {
    alert('更新失败：' + e.message)
  }
}

function feedbackStatusText(status) {
  const map = {
    SUBMITTED: '已提交',
    VIEWED: '已查看',
    REPLIED: '已回复',
    CLOSED: '已关闭'
  }
  return map[status] || status || '已提交'
}

function purchaseIntentText(v) {
  const map = {
    NONE: '暂无兴趣',
    INTERESTED: '感兴趣',
    PENDING: '考虑中',
    PURCHASED: '已购买'
  }
  return map[v] || v || '-'
}

function escapeHtml(input) {
  return String(input ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString('zh-CN')
}

function durationDays(startStr, endStr) {
  if (!startStr || !endStr) return '-'
  const start = new Date(startStr)
  const end = new Date(endStr)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '-'
  const diff = Math.max(0, end.getTime() - start.getTime())
  return `${Math.ceil(diff / (24 * 60 * 60 * 1000))} 天`
}

function safeFileName(name) {
  return String(name || '')
    .replaceAll(/[\\/:*?"<>|]/g, '-')
    .replaceAll(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

function downloadTrialReport(trial) {
  const productName = getProductName(trial?.productId)
  const title = `试用报告 - ${productName}`
  const fb = trial?.feedback || null

  const issues = String(fb?.issues || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)

  const reportHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; color: #111; padding: 28px; }
    h1 { font-size: 20px; margin: 0 0 6px; }
    .sub { color: #666; font-size: 12px; margin-bottom: 18px; }
    .card { border: 1px solid rgba(5,5,5,0.12); border-radius: 12px; padding: 16px; margin: 12px 0; }
    .card h2 { font-size: 14px; margin: 0 0 10px; }
    .grid { display: grid; grid-template-columns: 140px 1fr; gap: 8px 12px; font-size: 13px; }
    .k { color: #666; }
    .v { color: #111; word-break: break-word; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { background: #f5f7fa; border: 1px solid rgba(5,5,5,0.10); border-radius: 999px; padding: 4px 10px; font-size: 12px; color: #333; }
    .muted { color: #999; font-size: 13px; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 13px; line-height: 1.6; font-family: inherit; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="sub">导出时间：${escapeHtml(new Date().toLocaleString('zh-CN'))}</div>

  <div class="card">
    <h2>试用概览</h2>
    <div class="grid">
      <div class="k">产品</div><div class="v">${escapeHtml(productName)}</div>
      <div class="k">状态</div><div class="v">${escapeHtml(trial?.statusText || trial?.status || '-')}</div>
      <div class="k">试用时间</div><div class="v">${escapeHtml(formatDateTime(trial?.startTime))} ~ ${escapeHtml(formatDateTime(trial?.endTime))}</div>
      <div class="k">试用时长</div><div class="v">${escapeHtml(durationDays(trial?.startTime, trial?.endTime))}</div>
      <div class="k">环境地址</div><div class="v">${escapeHtml(trial?.environmentUrl || '-')}</div>
    </div>
  </div>

  <div class="card">
    <h2>关键操作 / 测试数据</h2>
    ${trial?.testData ? `<pre>${escapeHtml(trial.testData)}</pre>` : `<div class="muted">暂无记录</div>`}
  </div>

  <div class="card">
    <h2>反馈与评分</h2>
    <div class="grid">
      <div class="k">评分</div><div class="v">${escapeHtml(fb?.rating != null ? `${fb.rating}/5` : '-')}</div>
      <div class="k">购买意向</div><div class="v">${escapeHtml(purchaseIntentText(fb?.purchaseIntent))}</div>
      <div class="k">使用感受</div><div class="v">${fb?.feedback ? `<pre>${escapeHtml(fb.feedback)}</pre>` : `<span class="muted">暂无</span>`}</div>
    </div>
  </div>

  <div class="card">
    <h2>问题清单</h2>
    ${issues.length ? `<div class="chips">${issues.map(i => `<span class="chip">${escapeHtml(i)}</span>`).join('')}</div>` : `<div class="muted">暂无</div>`}
  </div>

  <div class="card">
    <h2>处理回复</h2>
    ${fb?.providerReply ? `<pre>${escapeHtml(fb.providerReply)}</pre>` : `<div class="muted">暂无</div>`}
  </div>
</body>
</html>`

  const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const ts = new Date().toISOString().slice(0, 10)
  a.download = `${safeFileName(`试用报告-${productName}-${ts}`) || '试用报告'}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
</script>

<style scoped>
.trial-workbench { padding: 0; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; margin-bottom: 8px; }
.page-header p { color: #666; }

.stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
.stat-card { background: #fff; padding: 24px; border-radius: 12px; display: flex; align-items: center; gap: 16px; border: 1px solid rgba(5, 5, 5, 0.1);}
.stat-icon { width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; }
.stat-icon.running { font-size: 0; color: #1677ff; }
.running-spinner { width: 32px; height: 32px; display: block; animation: runningSpin 1.1s linear infinite; }
.running-mask { background: #1677ff; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; -webkit-mask-position: center; mask-position: center; -webkit-mask-size: contain; mask-size: contain; }

@keyframes runningSpin { to { transform: rotate(360deg); } }
.stat-value { font-size: 28px; font-weight: 700; }
.stat-label { color: #999; font-size: 14px; }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h2 { font-size: 20px; }
.btn-new { height: 40px; padding: 0 18px; background: #1677ff; color: #fff; border: 1px solid #1677ff; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 800; box-shadow: 0 10px 22px rgba(22, 119, 255, 0.22); transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease, border-color 0.15s ease; }
.btn-new:hover { transform: translateY(-1px); background: #0958d9; border-color: #0958d9; box-shadow: 0 14px 26px rgba(22, 119, 255, 0.26); }
.btn-new:active { transform: translateY(0); box-shadow: 0 10px 22px rgba(22, 119, 255, 0.18); }
.btn-new:focus-visible { outline: 3px solid rgba(22, 119, 255, 0.25); outline-offset: 2px; }

.pref-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 32px; }
.pref-col { background: #fff; border-radius: 12px; border: 1px solid rgba(5, 5, 5, 0.08); padding: 18px; }
.pref-title { font-size: 14px; font-weight: 700; margin-bottom: 14px; color: #1a1a2e; }
.pref-products { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.pref-empty { padding: 16px; color: #999; background: #f9fafb; border-radius: 10px; text-align: center; }

.trial-list { display: flex; flex-direction: column; gap: 16px; }
.trial-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border: 1px solid rgba(5, 5, 5, 0.1);}
.trial-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.trial-product { font-size: 18px; font-weight: 600; }
.trial-status { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
.trial-status.running { background: #e8f5e9; color: #2e7d32; }
.trial-status.completed { background: #e3f2fd; color: #1565c0; }
.trial-status.pending { background: #fff3e0; color: #ef6c00; }
.trial-status.expired { background: #ffebee; color: #c62828; }

.trial-info { display: flex; gap: 32px; margin-bottom: 16px; }
.trial-item { display: flex; flex-direction: column; gap: 4px; }
.trial-item .label { font-size: 12px; color: #999; }
.trial-link { color: #0066ff; font-size: 14px; }

.provider-reply { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; background: #f9fafb; padding: 12px; border-radius: 8px; }
.provider-reply .label { font-size: 12px; color: #999; }
.reply-text { font-size: 13px; color: #333; line-height: 1.5; }

.admin-panel { margin-bottom: 16px; background: #fff7e6; border: 1px solid #ffe7ba; padding: 12px; border-radius: 8px; display: flex; flex-direction: column; gap: 10px; }
.admin-row { display: grid; grid-template-columns: 72px 1fr; gap: 10px; align-items: center; }
.admin-label { font-size: 12px; color: #666; }
.admin-select { padding: 8px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; }
.admin-textarea { padding: 8px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; resize: vertical; }
.admin-actions { display: flex; justify-content: flex-end; }
.btn-admin { padding: 8px 14px; border: none; border-radius: 8px; background: #fa8c16; color: #fff; cursor: pointer; font-size: 13px; }
.btn-admin:hover { opacity: 0.9; }

.trial-actions { display: flex; gap: 12px; }
.btn-action { padding: 8px 16px; border: 1px solid #e0e0e0; background: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.btn-action:hover { border-color: #0066ff; color: #0066ff; }
.btn-action.primary { background: #0066ff; color: #fff; border-color: #0066ff; }
.btn-action.view-feedback { background: #f5f7fa; }
.btn-action.report { border-color: rgba(22, 119, 255, 0.35); background: rgba(22, 119, 255, 0.06); color: #1677ff; font-weight: 700; }
.btn-action.report:hover { border-color: #1677ff; background: #1677ff; color: #fff; }

.empty-state { text-align: center; padding: 60px; background: #fff; border-radius: 12px; }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state p { color: #999; margin-bottom: 24px; }

/* 弹窗样式 */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 18px; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
.modal-body { padding: 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 12px; }

.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
.form-select, .form-textarea { width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.form-select:focus, .form-textarea:focus { outline: none; border-color: #0066ff; }

.form-info { background: #f9fafb; padding: 16px; border-radius: 8px; font-size: 14px; }
.form-info ul { margin: 8px 0 0; padding-left: 20px; color: #666; }
.form-info li { margin-bottom: 4px; }

.rating-stars { display: flex; gap: 8px; }
.star { font-size: 28px; color: #ddd; cursor: pointer; transition: color 0.2s; }
.star.active { color: #ffc107; }

.intent-options { display: flex; gap: 12px; flex-wrap: wrap; }
.intent-option { padding: 8px 16px; border: 1px solid #e0e0e0; border-radius: 20px; cursor: pointer; font-size: 14px; }
.intent-option.active { background: #e8f4ff; border-color: #0066ff; color: #0066ff; }
.intent-option input { display: none; }

.btn-cancel { padding: 10px 20px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; }
.btn-confirm { padding: 10px 20px; background: #0066ff; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.btn-confirm:disabled { background: #ccc; cursor: not-allowed; }
</style>
