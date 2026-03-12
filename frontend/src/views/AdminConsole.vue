<template>
  <div class="admin-console">
    <div class="page-header">
      <h1>管理后台</h1>
      <p>试用需求收集、生态产品上架与外部体验入口</p>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'trials' }" type="button" @click="activeTab = 'trials'">试用需求</button>
      <button class="tab" :class="{ active: activeTab === 'ecosystem' }" type="button" @click="activeTab = 'ecosystem'">生态产品</button>
    </div>

    <div v-if="activeTab === 'trials'">
      <div class="toolbar">
        <input v-model="keyword" class="search" type="text" placeholder="搜索用户/产品/方案/能力/场景" />
        <button class="btn-refresh" type="button" :disabled="loading" @click="loadTrials">
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
            <span class="status" :class="trialStatusClass(row.trialStatus)">
              {{ formatTrialStatus(row.trialStatus) }}
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
    </div>

    <div v-else class="eco">
      <div class="toolbar">
        <input v-model="ecoKeyword" class="search" type="text" placeholder="搜索生态产品/供应商/能力/场景/客户/案例" />
        <div class="inline">
          <span class="inline-label">提交方ID</span>
          <input v-model="ownerUserId" class="input-sm" type="number" min="1" />
        </div>
        <button class="btn-refresh" type="button" :disabled="ecoLoading" @click="loadEco">
          {{ ecoLoading ? '加载中...' : '刷新' }}
        </button>
        <button class="btn-primary" type="button" @click="openSubmit">提交生态产品</button>
      </div>

      <div class="section-title">待审核（管理员）</div>
      <div class="table">
        <div class="thead eco-head">
          <div class="th">产品</div>
          <div class="th">供应商</div>
          <div class="th">能力/场景</div>
          <div class="th">价格/版本</div>
          <div class="th">外部体验</div>
          <div class="th">状态</div>
          <div class="th">操作</div>
        </div>
        <div class="tbody" :style="{ maxHeight: 260 + 'px' }">
          <div v-for="p in pendingFiltered" :key="p.id" class="tr eco-row">
            <div class="td">
              <div class="primary">{{ p.name }}</div>
              <div class="secondary">{{ p.category || '-' }}</div>
            </div>
            <div class="td">
              <div class="primary">{{ p.providerName || p.sourceName || '-' }}</div>
              <div class="secondary">{{ p.sourceUrl || '-' }}</div>
            </div>
            <div class="td">
              <div class="primary clamp">{{ p.capability || '-' }}</div>
              <div class="secondary clamp">{{ p.scenarios || '-' }}</div>
            </div>
            <div class="td">
              <div class="primary">{{ p.price != null ? `${p.price}` : '-' }}</div>
              <div class="secondary">{{ p.version || '-' }}</div>
            </div>
            <div class="td">
              <a v-if="p.externalDemoUrl" class="link" :href="p.externalDemoUrl" target="_blank">打开</a>
              <span v-else>-</span>
            </div>
            <div class="td">
              <span class="status" :class="productStatusClass(p.status)">
                {{ formatProductStatus(p.status) }}
              </span>
            </div>
            <div class="td op">
              <button class="btn-view" type="button" @click="openProductDetail(p)">查看</button>
              <button class="btn-ok" type="button" @click="approve(p)">上架</button>
              <button class="btn-warn" type="button" @click="offline(p)">下架</button>
            </div>
          </div>
          <div v-if="!ecoLoading && pendingFiltered.length === 0" class="empty">暂无待审核产品</div>
        </div>
      </div>

      <div class="section-title">我的提交（伙伴自助）</div>
      <div class="table">
        <div class="thead eco-head">
          <div class="th">产品</div>
          <div class="th">外部体验</div>
          <div class="th">客户/案例</div>
          <div class="th">状态</div>
          <div class="th">操作</div>
        </div>
        <div class="tbody" :style="{ maxHeight: 260 + 'px' }">
          <div v-for="p in mineFiltered" :key="p.id" class="tr eco-row">
            <div class="td">
              <div class="primary">{{ p.name }}</div>
              <div class="secondary">{{ p.category || '-' }}</div>
            </div>
            <div class="td">
              <a v-if="p.externalDemoUrl" class="link" :href="p.externalDemoUrl" target="_blank">打开</a>
              <span v-else>-</span>
            </div>
            <div class="td">
              <div class="primary clamp">{{ p.customers || '-' }}</div>
              <div class="secondary clamp">{{ p.cases || '-' }}</div>
            </div>
            <div class="td">
              <span class="status" :class="productStatusClass(p.status)">
                {{ formatProductStatus(p.status) }}
              </span>
            </div>
            <div class="td op">
              <button class="btn-view" type="button" @click="openProductDetail(p)">查看</button>
              <button class="btn-ok" type="button" :disabled="p.status !== 'DRAFT'" @click="openEdit(p)">编辑</button>
            </div>
          </div>
          <div v-if="!ecoLoading && mineFiltered.length === 0" class="empty">暂无提交记录</div>
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
              <div class="value">{{ formatTrialStatus(detail.trial?.status) }}</div>
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

    <div v-if="productDetailVisible" class="modal-overlay" @click="closeProductDetail">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>生态产品详情</h3>
          <button class="close-btn" type="button" @click="closeProductDetail">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="label">产品</div>
              <div class="value">{{ productDetail?.name || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">分类</div>
              <div class="value">{{ productDetail?.category || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">供应商</div>
              <div class="value">{{ productDetail?.providerName || productDetail?.sourceName || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">来源</div>
              <div class="value">{{ productDetail?.sourceType || '-' }}</div>
            </div>
            <div class="detail-item full">
              <div class="label">简介</div>
              <div class="value">{{ productDetail?.description || '-' }}</div>
            </div>
            <div class="detail-item full">
              <div class="label">能力</div>
              <div class="value">{{ productDetail?.capability || '-' }}</div>
            </div>
            <div class="detail-item full">
              <div class="label">场景</div>
              <div class="value">{{ productDetail?.scenarios || '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">价格</div>
              <div class="value">{{ productDetail?.price != null ? `${productDetail.price}` : '-' }}</div>
            </div>
            <div class="detail-item">
              <div class="label">版本</div>
              <div class="value">{{ productDetail?.version || '-' }}</div>
            </div>
            <div class="detail-item full">
              <div class="label">客户</div>
              <div class="value">{{ productDetail?.customers || '-' }}</div>
            </div>
            <div class="detail-item full">
              <div class="label">案例</div>
              <div class="value">{{ productDetail?.cases || '-' }}</div>
            </div>
            <div class="detail-item full">
              <div class="label">外部体验链接</div>
              <div class="value">
                <a v-if="productDetail?.externalDemoUrl" class="link" :href="productDetail.externalDemoUrl" target="_blank">{{ productDetail.externalDemoUrl }}</a>
                <span v-else>-</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" type="button" @click="closeProductDetail">关闭</button>
        </div>
      </div>
    </div>

    <div v-if="submitVisible" class="modal-overlay" @click="closeSubmit">
      <div class="modal small" @click.stop>
        <div class="modal-header">
          <h3>{{ submitMode === 'create' ? '提交生态产品' : '编辑生态产品' }}</h3>
          <button class="close-btn" type="button" @click="closeSubmit">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>产品名称</label>
              <input v-model="submitForm.name" class="input" type="text" placeholder="请输入产品名称" />
            </div>
            <div class="form-group">
              <label>分类</label>
              <input v-model="submitForm.category" class="input" type="text" placeholder="如：运输管理/数据分析" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>供应商名称</label>
              <input v-model="submitForm.providerName" class="input" type="text" placeholder="对外展示的供应商名称" />
            </div>
            <div class="form-group">
              <label>供应商官网（可选）</label>
              <input v-model="submitForm.sourceUrl" class="input" type="text" placeholder="https://..." />
            </div>
          </div>

          <div class="form-group">
            <label>外部体验链接（方式A）</label>
            <input v-model="submitForm.externalDemoUrl" class="input" type="text" placeholder="https://..." />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>能力点</label>
              <textarea v-model="submitForm.capability" class="textarea" rows="3" placeholder="用逗号分隔，如：路线优化,车辆调度..."></textarea>
            </div>
            <div class="form-group">
              <label>场景</label>
              <textarea v-model="submitForm.scenarios" class="textarea" rows="3" placeholder="用逗号分隔，如：干线运输,同城配送..."></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>案例</label>
              <textarea v-model="submitForm.cases" class="textarea" rows="3" placeholder="可填写典型案例"></textarea>
            </div>
            <div class="form-group">
              <label>客户</label>
              <textarea v-model="submitForm.customers" class="textarea" rows="3" placeholder="可填写典型客户"></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>价格（万）</label>
              <input v-model="submitForm.price" class="input" type="number" min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label>版本</label>
              <input v-model="submitForm.version" class="input" type="text" placeholder="如：v1.0" />
            </div>
          </div>
          <div class="form-group">
            <label>简介</label>
            <textarea v-model="submitForm.description" class="textarea" rows="3" placeholder="产品简介"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" type="button" @click="closeSubmit">取消</button>
          <button class="btn-confirm" type="button" :disabled="submitLoading || !submitForm.name" @click="submit">
            {{ submitLoading ? '提交中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { adminAPI, partnerAPI } from '../api'

const activeTab = ref('trials')

const loading = ref(false)
const rows = ref([])
const keyword = ref('')

const ecoLoading = ref(false)
const ecoKeyword = ref('')
const ownerUserId = ref(3)
const pendingProducts = ref([])
const myProducts = ref([])

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

const pendingFiltered = computed(() => {
  const kw = ecoKeyword.value.trim().toLowerCase()
  const list = pendingProducts.value || []
  if (!kw) return list
  return list.filter(p => buildProductSearchText(p).includes(kw))
})

const mineFiltered = computed(() => {
  const kw = ecoKeyword.value.trim().toLowerCase()
  const list = myProducts.value || []
  if (!kw) return list
  return list.filter(p => buildProductSearchText(p).includes(kw))
})

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
  loadTrials()
  loadEco()
})

async function loadTrials() {
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

async function loadEco() {
  ecoLoading.value = true
  try {
    const [pendingRes, mineRes] = await Promise.all([
      adminAPI.pendingProducts(),
      partnerAPI.myProducts(ownerUserId.value)
    ])
    pendingProducts.value = pendingRes.data.data || []
    myProducts.value = mineRes.data.data || []
  } catch (e) {
    pendingProducts.value = []
    myProducts.value = []
  }
  ecoLoading.value = false
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

const productDetailVisible = ref(false)
const productDetail = ref(null)

function openProductDetail(p) {
  productDetail.value = p
  productDetailVisible.value = true
}

function closeProductDetail() {
  productDetailVisible.value = false
}

const submitVisible = ref(false)
const submitLoading = ref(false)
const submitMode = ref('create')
const editingId = ref(null)
const submitForm = reactive({
  name: '',
  category: '',
  providerName: '',
  sourceUrl: '',
  externalDemoUrl: '',
  capability: '',
  scenarios: '',
  customers: '',
  cases: '',
  price: '',
  version: '',
  description: ''
})

function resetSubmitForm() {
  submitForm.name = ''
  submitForm.category = ''
  submitForm.providerName = ''
  submitForm.sourceUrl = ''
  submitForm.externalDemoUrl = ''
  submitForm.capability = ''
  submitForm.scenarios = ''
  submitForm.customers = ''
  submitForm.cases = ''
  submitForm.price = ''
  submitForm.version = ''
  submitForm.description = ''
}

function openSubmit() {
  submitMode.value = 'create'
  editingId.value = null
  resetSubmitForm()
  submitVisible.value = true
}

function openEdit(p) {
  submitMode.value = 'edit'
  editingId.value = p.id
  submitForm.name = p.name || ''
  submitForm.category = p.category || ''
  submitForm.providerName = p.providerName || ''
  submitForm.sourceUrl = p.sourceUrl || ''
  submitForm.externalDemoUrl = p.externalDemoUrl || ''
  submitForm.capability = p.capability || ''
  submitForm.scenarios = p.scenarios || ''
  submitForm.customers = p.customers || ''
  submitForm.cases = p.cases || ''
  submitForm.price = p.price != null ? String(p.price) : ''
  submitForm.version = p.version || ''
  submitForm.description = p.description || ''
  submitVisible.value = true
}

function closeSubmit() {
  submitVisible.value = false
}

async function submit() {
  submitLoading.value = true
  try {
    const payload = {
      ownerUserId: Number(ownerUserId.value),
      name: submitForm.name,
      category: submitForm.category,
      providerName: submitForm.providerName,
      sourceName: submitForm.providerName,
      sourceUrl: submitForm.sourceUrl || null,
      externalDemoUrl: submitForm.externalDemoUrl || null,
      capability: submitForm.capability,
      scenarios: submitForm.scenarios,
      customers: submitForm.customers || null,
      cases: submitForm.cases || null,
      price: submitForm.price === '' ? null : submitForm.price,
      version: submitForm.version,
      description: submitForm.description
    }

    if (submitMode.value === 'create') {
      await partnerAPI.createProduct(payload)
    } else {
      await partnerAPI.updateProduct(editingId.value, payload)
    }

    submitVisible.value = false
    await loadEco()
    alert('已提交')
  } catch (e) {
    alert('提交失败：' + e.message)
  }
  submitLoading.value = false
}

async function approve(p) {
  try {
    await adminAPI.approveProduct(p.id)
    await loadEco()
    alert('已上架')
  } catch (e) {
    alert('操作失败：' + e.message)
  }
}

async function offline(p) {
  try {
    await adminAPI.offlineProduct(p.id)
    await loadEco()
    alert('已下架')
  } catch (e) {
    alert('操作失败：' + e.message)
  }
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

function buildProductSearchText(p) {
  const parts = [
    p.name,
    p.category,
    p.providerName,
    p.sourceName,
    p.capability,
    p.scenarios,
    p.customers,
    p.cases,
    p.version
  ].filter(Boolean)
  return parts.join(' ').toLowerCase()
}

function formatTrialStatus(status) {
  const s = String(status || '').toUpperCase()
  if (!s) return '-'
  const map = {
    PENDING: '待开始',
    RUNNING: '进行中',
    COMPLETED: '已完成',
    EXPIRED: '已过期'
  }
  return map[s] || s
}

function trialStatusClass(status) {
  const s = String(status || '').toLowerCase()
  return s || ''
}

function formatProductStatus(status) {
  const s = String(status || '').toUpperCase()
  if (!s) return '-'
  const map = {
    DRAFT: '待审核',
    ACTIVE: '已上架',
    OFFLINE: '已下架'
  }
  return map[s] || s
}

function productStatusClass(status) {
  const s = String(status || '').toLowerCase()
  return s || ''
}
</script>

<style scoped>
.admin-console { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; margin-bottom: 6px; }
.page-header p { color: #666; }

.tabs { display: flex; gap: 10px; margin-bottom: 14px; }
.tab { padding: 10px 14px; border-radius: 10px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; font-size: 14px; color: #333; }
.tab.active { border-color: #0066ff; color: #0066ff; background: #e8f4ff; }

.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.search { flex: 1; max-width: 520px; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.search:focus { outline: none; border-color: #0066ff; }
.btn-refresh { padding: 10px 16px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { padding: 10px 16px; border: none; background: #0066ff; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-primary:hover { opacity: 0.9; }
.inline { display: inline-flex; align-items: center; gap: 8px; }
.inline-label { font-size: 12px; color: #666; white-space: nowrap; }
.input-sm { width: 90px; padding: 10px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.input-sm:focus { outline: none; border-color: #0066ff; }
.eco { display: flex; flex-direction: column; gap: 14px; }
.section-title { font-size: 14px; color: #666; font-weight: 600; margin-top: 6px; }

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
.clamp { display: -webkit-box; line-clamp: 2; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.status { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 12px; width: fit-content; border: 1px solid #e0e0e0; color: #666; background: #fff; }
.status.running { background: #e8f5e9; border-color: #c8e6c9; color: #2e7d32; }
.status.completed { background: #e3f2fd; border-color: #bbdefb; color: #1565c0; }
.status.pending { background: #fff3e0; border-color: #ffe0b2; color: #ef6c00; }
.status.expired { background: #ffebee; border-color: #ffcdd2; color: #c62828; }
.status.active { background: #e8f5e9; border-color: #c8e6c9; color: #2e7d32; }
.status.draft { background: #fff3e0; border-color: #ffe0b2; color: #ef6c00; }
.status.offline { background: #ffebee; border-color: #ffcdd2; color: #c62828; }

.btn-view { padding: 8px 12px; border: 1px solid #0066ff; background: #fff; color: #0066ff; border-radius: 8px; cursor: pointer; font-size: 13px; }
.btn-view:hover { background: #0066ff; color: #fff; }
.op { flex-direction: row; align-items: center; gap: 8px; }
.btn-ok { padding: 8px 12px; border: none; background: #52c41a; color: #fff; border-radius: 8px; cursor: pointer; font-size: 13px; }
.btn-ok:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-warn { padding: 8px 12px; border: none; background: #ff4d4f; color: #fff; border-radius: 8px; cursor: pointer; font-size: 13px; }
.btn-warn:hover, .btn-ok:hover { opacity: 0.9; }

.empty { padding: 24px; color: #999; text-align: center; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: #fff; border-radius: 12px; width: 92%; max-width: 860px; max-height: 90vh; overflow-y: auto; }
.modal.small { max-width: 600px; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { font-size: 18px; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }
.modal-body { padding: 22px 24px; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 12px; }
.btn-cancel { padding: 10px 18px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-confirm { padding: 10px 18px; border: none; background: #0066ff; color: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }
.btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

.eco-head, .eco-row { grid-template-columns: 220px 190px 1fr 140px 120px 90px 210px; }
.eco-row { min-height: 74px; }

.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.form-group label { font-size: 13px; color: #333; }
.input, .textarea { width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.input:focus, .textarea:focus { outline: none; border-color: #0066ff; }
.textarea { resize: vertical; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

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

@media (max-width: 720px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
