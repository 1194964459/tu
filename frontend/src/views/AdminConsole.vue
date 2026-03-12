<template>
  <div class="admin-console">
    <div class="page-header">
      <h1>管理后台</h1>
      <p>收集与查看不同用户的试用需求与试用记录</p>
    </div>

    <div class="toolbar">
      <input v-model="keyword" class="search" type="text" placeholder="搜索用户/产品/方案/能力/场景" />
      <button class="btn-refresh" type="button" :disabled="loading" @click="load">
        {{ loading ? '加载中...' : '刷新' }}
      </button>
    </div>

    <div class="table">
      <div class="thead">
        <div class="th w-user">用户</div>
        <div class="th w-product">产品</div>
        <div class="th w-solution">方案</div>
        <div class="th w-meta">能力/场景</div>
        <div class="th w-price">价格/版本</div>
        <div class="th w-status">状态</div>
        <div class="th w-time">创建时间</div>
        <div class="th w-op">操作</div>
      </div>

      <div
        ref="bodyRef"
        class="tbody"
        :style="{ maxHeight: bodyMaxHeight + 'px' }"
        @scroll="onScroll"
      >
        <div :style="{ height: topPad + 'px' }"></div>
        <div
          v-for="row in visibleRows"
          :key="row.trialId"
          class="tr"
        >
          <div class="td w-user">
            <div class="primary">{{ row.userName || row.userUsername || '-' }}</div>
            <div class="secondary">{{ row.userIndustry || '-' }}</div>
          </div>
          <div class="td w-product">
            <div class="primary">{{ row.productName || '-' }}</div>
            <div class="secondary">ID: {{ row.productId ?? '-' }}</div>
          </div>
          <div class="td w-solution">
            <div class="primary">{{ row.solutionName || '-' }}</div>
            <div class="secondary">ID: {{ row.solutionId ?? '-' }}</div>
          </div>
          <div class="td w-meta">
            <div class="primary clamp">{{ row.productCapability || '-' }}</div>
            <div class="secondary clamp">{{ row.productScenarios || '-' }}</div>
          </div>
          <div class="td w-price">
            <div class="primary">{{ row.productPrice != null ? `${row.productPrice}` : '-' }}</div>
            <div class="secondary">{{ row.productVersion || '-' }}</div>
          </div>
          <div class="td w-status">
            <span class="status" :class="String(row.trialStatus || '').toLowerCase()">
              {{ row.trialStatus || '-' }}
            </span>
          </div>
          <div class="td w-time">{{ formatDateTime(row.createTime) }}</div>
          <div class="td w-op">
            <button class="btn-view" type="button" @click="openDetail(row.trialId)">查看</button>
          </div>
        </div>
        <div :style="{ height: bottomPad + 'px' }"></div>

        <div v-if="!loading && filteredRows.length === 0" class="empty">
          暂无数据
        </div>
      </div>
    </div>

    <div v-if="detailVisible" class="modal-overlay" @click="closeDetail">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>试用需求详情</h3>
          <button class="close-btn" type="button" @click="closeDetail">×</button>
        </div>

        <div v-if="detailLoading" class="modal-body">
          加载中...
        </div>
        <div v-else class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="label">用户</div>
              <div class="value">{{ detail.user?.name || detail.user?.username || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">行业</div>
              <div class="value">{{ detail.user?.industry || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">产品</div>
              <div class="value">{{ detail.product?.name || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">方案</div>
              <div class="value">{{ detail.solution?.name || '-' }}</div>
            </div>
            <div class="detail-item full">
              <div class="label">能力</div>
              <div class="value">{{ detail.product?.capability || '-' }}</div>
            </div>
            <div class="detail-item full">
              <div class="label">场景</div>
              <div class="value">{{ detail.product?.scenarios || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">价格</div>
              <div class="value">{{ detail.product?.price != null ? `${detail.product.price}` : '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">版本</div>
              <div class="value">{{ detail.product?.version || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">试用状态</div>
              <div class="value">{{ detail.trial?.status || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">环境地址</div>
              <div class="value">
                <a v-if="detail.trial?.environmentUrl" :href="detail.trial.environmentUrl" target="_blank" class="link">
                  {{ detail.trial.environmentUrl }}
                </a>
                <span v-else>-</span>
              </div>
            </div>
            <div class="detail-item full">
              <div class="label">用户具体要求</div>
              <div class="value pre">
                <div v-if="parsedTestData">
                  <div class="kv" v-for="(v, k) in parsedTestData" :key="k">
                    <div class="k">{{ k }}</div>
                    <div class="v">{{ v }}</div>
                  </div>
                </div>
                <div v-else>{{ detail.trial?.testData || '-' }}</div>
              </div>
            </div>
            <div v-if="detail.feedback" class="detail-item full">
              <div class="label">反馈/意向</div>
              <div class="value pre">
                <div>评分：{{ detail.feedback.rating ?? '-' }}</div>
                <div>意向：{{ detail.feedback.purchaseIntent || '-' }}</div>
                <div>状态：{{ detail.feedback.status || '-' }}</div>
                <div>反馈：{{ detail.feedback.feedback || '-' }}</div>
                <div>问题：{{ detail.feedback.issues || '-' }}</div>
                <div>处理回复：{{ detail.feedback.providerReply || '-' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" type="button" @click="closeDetail">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { adminAPI } from '../api'

const loading = ref(false)
const rows = ref([])
const keyword = ref('')

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = reactive({
  trial: null,
  user: null,
  product: null,
  solution: null,
  feedback: null
})

const bodyRef = ref(null)
const bodyMaxHeight = 560
const rowHeight = 74
const overscan = 6
const scrollTop = ref(0)

const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter(r => {
    const parts = [
      r.userName,
      r.userUsername,
      r.userIndustry,
      r.productName,
      r.solutionName,
      r.productCapability,
      r.productScenarios,
      r.productVersion
    ].filter(Boolean)
    return parts.join(' ').toLowerCase().includes(kw)
  })
})

const useVirtual = computed(() => filteredRows.value.length > 20)
const visibleCount = computed(() => Math.ceil(bodyMaxHeight / rowHeight) + overscan * 2)
const startIndex = computed(() => {
  if (!useVirtual.value) return 0
  const base = Math.floor(scrollTop.value / rowHeight) - overscan
  return Math.max(0, base)
})
const endIndex = computed(() => {
  if (!useVirtual.value) return filteredRows.value.length
  return Math.min(filteredRows.value.length, startIndex.value + visibleCount.value)
})
const topPad = computed(() => (useVirtual.value ? startIndex.value * rowHeight : 0))
const bottomPad = computed(() => {
  if (!useVirtual.value) return 0
  return Math.max(0, (filteredRows.value.length - endIndex.value) * rowHeight)
})
const visibleRows = computed(() => filteredRows.value.slice(startIndex.value, endIndex.value))

watch(keyword, async () => {
  await nextTick()
  scrollTop.value = 0
  if (bodyRef.value) bodyRef.value.scrollTop = 0
})

onMounted(() => {
  load()
})

async function load() {
  loading.value = true
  try {
    const res = await adminAPI.trialRequests()
    const list = res.data.data || []
    rows.value = list.map(normalizeRow)
  } catch (e) {
    rows.value = []
  }
  loading.value = false
}

function normalizeRow(r) {
  return {
    trialId: r.trialId ?? r.trial_id ?? r.id,
    userId: r.userId ?? r.user_id,
    userUsername: r.userUsername ?? r.user_username,
    userName: r.userName ?? r.user_name,
    userIndustry: r.userIndustry ?? r.user_industry,
    productId: r.productId ?? r.product_id,
    productName: r.productName ?? r.product_name,
    productCapability: r.productCapability ?? r.product_capability,
    productScenarios: r.productScenarios ?? r.product_scenarios,
    productPrice: r.productPrice ?? r.product_price,
    productVersion: r.productVersion ?? r.product_version,
    solutionId: r.solutionId ?? r.solution_id,
    solutionName: r.solutionName ?? r.solution_name,
    trialStatus: r.trialStatus ?? r.trial_status,
    environmentUrl: r.environmentUrl ?? r.environment_url,
    testData: r.testData ?? r.test_data,
    startTime: r.startTime ?? r.start_time,
    endTime: r.endTime ?? r.end_time,
    createTime: r.createTime ?? r.create_time
  }
}

function onScroll(e) {
  scrollTop.value = e.target.scrollTop
}

async function openDetail(trialId) {
  detailVisible.value = true
  detailLoading.value = true
  detail.trial = null
  detail.user = null
  detail.product = null
  detail.solution = null
  detail.feedback = null

  try {
    const res = await adminAPI.trialRequestDetail(trialId)
    const d = res.data.data || {}
    detail.trial = d.trial || null
    detail.user = d.user || null
    detail.product = d.product || null
    detail.solution = d.solution || null
    detail.feedback = d.feedback || null
  } catch (e) {
  }

  detailLoading.value = false
}

function closeDetail() {
  detailVisible.value = false
}

const parsedTestData = computed(() => {
  const raw = detail.trial?.testData
  if (!raw || typeof raw !== 'string') return null
  const text = raw.trim()
  if (!text) return null
  if (!(text.startsWith('{') && text.endsWith('}'))) return null
  try {
    const obj = JSON.parse(text)
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null
    return obj
  } catch (e) {
    return null
  }
})

function formatDateTime(v) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString('zh-CN')
}
</script>

<style scoped>
.admin-console { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; margin-bottom: 6px; }
.page-header p { color: #666; }

.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.search { flex: 1; max-width: 520px; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.search:focus { outline: none; border-color: #0066ff; }
.btn-refresh { padding: 10px 16px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

.table { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.thead, .tr { display: grid; grid-template-columns: 180px 190px 170px 1fr 140px 110px 170px 90px; align-items: stretch; }
.thead { background: #fafafa; border-bottom: 1px solid #f0f0f0; }
.th { padding: 12px 14px; font-size: 13px; color: #999; font-weight: 600; }
.tbody { overflow: auto; position: relative; }
.tr { border-bottom: 1px solid #f5f5f5; min-height: 74px; }
.tr:hover { background: #fcfcff; }
.td { padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; justify-content: center; }
.primary { font-size: 14px; color: #222; }
.secondary { font-size: 12px; color: #888; }
.clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.status { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 12px; width: fit-content; border: 1px solid #e0e0e0; color: #666; background: #fff; }
.status.running { background: #e8f5e9; border-color: #c8e6c9; color: #2e7d32; }
.status.completed { background: #e3f2fd; border-color: #bbdefb; color: #1565c0; }
.status.pending { background: #fff3e0; border-color: #ffe0b2; color: #ef6c00; }
.status.expired { background: #ffebee; border-color: #ffcdd2; color: #c62828; }

.btn-view { padding: 8px 12px; border: 1px solid #0066ff; background: #fff; color: #0066ff; border-radius: 8px; cursor: pointer; font-size: 13px; }
.btn-view:hover { background: #0066ff; color: #fff; }

.empty { padding: 24px; color: #999; text-align: center; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; width: 92%; max-width: 860px; max-height: 90vh; overflow-y: auto; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 18px; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
.modal-body { padding: 22px 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 12px; }
.btn-cancel { padding: 10px 18px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }

.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.detail-item { background: #fafafa; border: 1px solid #f0f0f0; border-radius: 10px; padding: 12px; }
.detail-item.full { grid-column: 1 / -1; }
.label { font-size: 12px; color: #999; margin-bottom: 6px; }
.value { font-size: 13px; color: #333; line-height: 1.6; }
.link { color: #0066ff; word-break: break-all; }
.pre { white-space: pre-wrap; word-break: break-word; }
.kv { display: grid; grid-template-columns: 140px 1fr; gap: 12px; padding: 6px 0; border-bottom: 1px dashed #eee; }
.kv:last-child { border-bottom: none; }
.k { color: #666; font-size: 12px; }
.v { color: #222; font-size: 13px; }

@media (max-width: 1100px) {
  .thead, .tr { grid-template-columns: 170px 180px 160px 1fr 130px 110px 160px 90px; }
}
</style>
