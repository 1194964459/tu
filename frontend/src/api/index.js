import axios from 'axios'

const STORE_KEY = 'demo-mock-store-v1'

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

function nowISO() {
  return new Date().toISOString()
}

function readStore() {
  const raw = localStorage.getItem(STORE_KEY)
  const store = safeParse(raw, null)
  return store && typeof store === 'object' ? store : null
}

function writeStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store || {}))
  return store
}

function normalizePrice(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function stripExampleMark(v) {
  return String(v || '').replace(/\s*[（(]示例[）)]\s*/g, '').trim()
}

function splitListText(raw) {
  const text = String(raw || '').trim()
  if (!text) return []
  return text
    .split(/[,，/、\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function uniqList(list) {
  const seen = new Set()
  const out = []
  for (const it of list || []) {
    const s = String(it || '').trim()
    if (!s || seen.has(s)) continue
    seen.add(s)
    out.push(s)
  }
  return out
}

function limitListText(raw, maxCount) {
  return uniqList(splitListText(raw)).slice(0, maxCount).join(',')
}

function inferServiceType(product) {
  const category = String(product?.category || '')
  const sourceType = String(product?.sourceType || '').toUpperCase()
  if (sourceType === 'THIRD' || sourceType === 'PARTNER') return '数据产业生态'
  if (category.includes('数字化基础平台') || category.includes('数据要素')) return '数据公共服务'
  if (category.includes('场景解决方案') || category.includes('数智技术')) return '行业动态检测'
  if (category.includes('企业数智供应链') || category.includes('增值服务')) return '数据产业生态'
  return '数据公共服务'
}

function shortCategory(cat) {
  const s = String(cat || '')
  if (s.includes('数字化基础平台')) return '基础平台'
  if (s.includes('数据要素')) return '数据要素'
  if (s.includes('数智技术')) return '技术产品'
  if (s.includes('场景解决方案')) return '场景方案'
  if (s.includes('企业数智供应链')) return '企业产品'
  if (s.includes('增值服务')) return '增值服务'
  return s || '产品'
}

function dedupeProductNames(list) {
  const map = new Map()
  let renamed = false
  for (const p of list || []) {
    const base = String(p?.name || '').trim()
    if (!base) continue
    const count = map.get(base) || 0
    if (count === 0) {
      map.set(base, 1)
      continue
    }
    // duplicate: append short category or incremental suffix
    const cat = shortCategory(p?.category)
    let candidate = `${base} - ${cat}`
    let idx = 2
    while (list.some(x => x !== p && String(x?.name || '') === candidate)) {
      candidate = `${base} - ${cat}${idx}`
      idx += 1
    }
    p.name = candidate
    map.set(base, count + 1)
    renamed = true
  }
  return renamed
}

function seedProducts() {
  const baseTime = nowISO()
  const list = [
    {
      id: 1,
      name: '国家级物流大数据平台',
      category: '物流行业数字化基础平台',
      description: '公共型、开放型的行业数据基础设施，提供数据汇聚、治理、共享与服务功能',
      capability: '数据汇聚,数据治理,数据目录,数据共享,服务编排,API网关,权限管理,安全审计,运行监控',
      scenarios: '智慧港航,智慧口岸,智慧长江,数字仓管,网络货运,航空物流,航贸数字化,多式联运,政府监管,应急调度',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '公共平台',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '政府部门,行业企业',
      cases: '行业公共服务示例',
      ownerUserId: 1,
      popularity: 92,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 2,
      name: '物流行业可信数据空间',
      category: '物流行业数字化基础平台',
      description: '面向行业数据安全可信流通的空间底座，支持确权、脱敏、授权与审计',
      capability: '可信计算,隐私保护,安全多方计算,脱敏加工,数据确权,授权管理,审计追踪,合规评估,安全沙箱',
      scenarios: '智慧港航,智慧口岸,智慧长江,数字仓管,网络货运,航空物流,航贸数字化,多式联运,跨主体协同,数据交易',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '公共平台',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '物流企业,科技公司',
      cases: '可信流通示例',
      ownerUserId: 1,
      popularity: 88,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 3,
      name: '航贸数字化平台',
      category: '物流行业数字化基础平台',
      description: '面向港口航运与口岸贸易的数据交换与协同平台，提升通关与运输效率',
      capability: '舱单运单协同,节点可视,数据交换,单证协同,对外协同接口,异常预警,时效承诺,状态订阅',
      scenarios: '航贸数字化,智慧港航,智慧口岸,跨境物流,多式联运,单证流转,通关协同',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '公共平台',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '港口,航司,货代',
      cases: '航贸协同示例',
      ownerUserId: 1,
      popularity: 86,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 4,
      name: '行业智算连接底座',
      category: '物流行业数字化基础平台',
      description: '为行业应用提供算力、模型、连接与安全运营的一体化底座功能',
      capability: '智算,连接,模型服务,向量检索,流式计算,弹性扩展,灰度发布,安全运营,可观测性',
      scenarios: '智慧港航,智慧口岸,智慧长江,数字仓管,网络货运,航空物流,航贸数字化,多式联运,行业应用AI化',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '公共平台',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '行业应用开发方',
      cases: '行业智算示例',
      ownerUserId: 1,
      popularity: 84,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 5,
      name: '全社会物流成本指数数据集',
      category: '数据要素产品',
      description: '面向宏观决策与行业研判的指标数据产品，支持多维度分析与对标',
      capability: '指标体系,数据集,趋势分析,对标分析,区域画像,行业画像,归因分析,可视化报表',
      scenarios: '宏观研判,行业对标,智慧港航,智慧口岸,智慧长江,网络货运,航空物流,航贸数字化,多式联运',
      price: 3,
      version: 'v2026.1',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '数据产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '政府部门,行业机构',
      cases: '降本分析示例',
      ownerUserId: 1,
      popularity: 78,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 6,
      name: '港航时效基准数据产品',
      category: '数据要素产品',
      description: '沉淀港口/航线/班轮等关键链路的时效基准数据，支撑预测与优化',
      capability: '时效基准,时效预测,拥堵分析,链路拆解,节点归因,时效对标,延误预警',
      scenarios: '智慧港航,智慧长江,航贸数字化,跨境物流,港口调度',
      price: 2,
      version: 'v2026.1',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '数据产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '港口,航运公司,货主企业',
      cases: '港航时效分析示例',
      ownerUserId: 1,
      popularity: 74,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 7,
      name: '口岸通关态势数据产品',
      category: '数据要素产品',
      description: '汇聚口岸与监管相关数据，形成通关态势监测与预警的数据产品',
      capability: '态势监测,风险预警,数据画像,异常识别,指标看板,口岸对标,政策影响分析',
      scenarios: '智慧口岸,航贸数字化,跨境物流,通关协同,合规风控',
      price: 2,
      version: 'v2026.1',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '数据产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '监管部门,口岸企业',
      cases: '通关态势示例',
      ownerUserId: 1,
      popularity: 76,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 8,
      name: '运力画像与线路路由数据产品',
      category: '数据要素产品',
      description: '沉淀承运商、线路、时效与运价等数据，支持运力匹配与调度优化',
      capability: '运力画像,线路路由,运价分析,时效预测,供需匹配,调度优化,风控评分,账期分析',
      scenarios: '网络货运,多式联运,航空物流,干线运输,城配调度',
      price: 2,
      version: 'v2026.1',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '数据产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '物流企业,货主企业',
      cases: '运力匹配示例',
      ownerUserId: 1,
      popularity: 72,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 9,
      name: '物流知识图谱引擎',
      category: '数智技术产品',
      description: '融合行业知识与业务实体关系，支撑智能问答、关联分析与推荐',
      capability: '知识图谱,图谱构建,图查询,实体消歧,关系推理,行业知识,智能检索,智能推荐',
      scenarios: '智慧港航,智慧口岸,智慧长江,数字仓管,网络货运,航空物流,航贸数字化,多式联运,智能问答,关联分析',
      price: 12,
      version: 'v2.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '技术产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '科技公司,物流企业',
      cases: '知识驱动推荐示例',
      ownerUserId: 1,
      popularity: 80,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 10,
      name: 'OCR 票据识别 API',
      category: '数智技术产品',
      description: '提供运单/舱单/发票等票据 OCR 识别功能，支持接口级快速接入',
      capability: 'OCR识别,版面解析,字段抽取,结构化输出,质检校验,图片增强,高并发API,多模板适配',
      scenarios: '智慧口岸,航贸数字化,数字仓管,单证自动化,票据录入',
      price: 8,
      version: 'v1.2',
      providerName: '生态伙伴A',
      sourceType: 'THIRD',
      sourceName: '生态伙伴A',
      sourceUrl: 'https://example.com',
      externalDemoUrl: 'https://example.com',
      customers: '货代,仓储企业',
      cases: '票据自动录入示例',
      ownerUserId: 3,
      popularity: 66,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 11,
      name: '运输路径优化算法服务',
      category: '数智技术产品',
      description: '面向城市配送与干线运输的路径规划与车辆调度优化算法服务',
      capability: '路径规划,车辆调度,约束建模,算法优化,仿真评估,API服务,弹性扩容,成本测算',
      scenarios: '网络货运,多式联运,城配调度,干线运输,应急运输',
      price: 15,
      version: 'v1.0',
      providerName: '生态伙伴B',
      sourceType: 'THIRD',
      sourceName: '生态伙伴B',
      sourceUrl: 'https://example.com',
      externalDemoUrl: 'https://example.com',
      customers: '网络货运平台,物流企业',
      cases: '配送优化示例',
      ownerUserId: 3,
      popularity: 70,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 12,
      name: '异常预警与时效预测模型',
      category: '数智技术产品',
      description: '基于历史链路与实时态势数据构建预测模型，支撑异常预警与时效承诺',
      capability: '时效预测,异常预警,延误归因,阈值策略,模型训练,模型评估,在线推理,告警编排',
      scenarios: '航空物流,智慧港航,智慧长江,网络货运,航贸数字化,多式联运',
      price: 18,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '技术产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '物流企业,货主企业',
      cases: '时效预测示例',
      ownerUserId: 1,
      popularity: 76,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 13,
      name: '智慧港航解决方案',
      category: '物流行业场景解决方案',
      description: '面向港口与航运协同的可视化、调度与异常处置解决方案',
      capability: '节点可视,船期管理,拥堵分析,资源排班,协同调度,异常处置,对外协同接口,指标看板',
      scenarios: '智慧港航,航贸数字化,港口作业协同,船期可视化',
      price: 80,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '港口,航运公司',
      cases: '智慧港航示例',
      ownerUserId: 1,
      popularity: 86,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 14,
      name: '智慧口岸解决方案',
      category: '物流行业场景解决方案',
      description: '面向口岸通关与监管协同的态势监测、风控与通关效率提升方案',
      capability: '态势监测,风险预警,通关协同,单证协同,数据共享,异常处置,对标分析,合规审计',
      scenarios: '智慧口岸,航贸数字化,通关协同,跨境物流',
      price: 75,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '口岸企业,监管部门',
      cases: '智慧口岸示例',
      ownerUserId: 1,
      popularity: 84,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 15,
      name: '智慧长江解决方案',
      category: '物流行业场景解决方案',
      description: '面向内河航运的态势感知、通行组织与应急联动的数字化方案',
      capability: '数字孪生,态势感知,通行组织,应急联动,事件监测,水位预警,拥堵研判,协同调度',
      scenarios: '智慧长江,智慧港航,内河航运,应急保障',
      price: 70,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '航运管理部门,港航企业',
      cases: '智慧长江示例',
      ownerUserId: 1,
      popularity: 82,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 16,
      name: '数字仓管解决方案',
      category: '物流行业场景解决方案',
      description: '面向仓配一体的库存、作业与可视化管理方案，提升仓内作业效率',
      capability: '库存可视,波次策略,库位管理,拣选优化,异常管理,作业分析,盘点管理,绩效看板',
      scenarios: '数字仓管,仓配一体,园区仓管,多仓协同',
      price: 55,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '仓储企业,货主企业',
      cases: '数字仓管示例',
      ownerUserId: 1,
      popularity: 83,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 17,
      name: '网络货运解决方案',
      category: '物流行业场景解决方案',
      description: '面向网络货运平台的运力匹配、过程可视与结算对账解决方案',
      capability: '运力匹配,在途可视,结算对账,电子合同,风控,异常预警,运价分析,账期管理',
      scenarios: '网络货运,干线运输,城配调度',
      price: 65,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '网络货运平台,物流企业',
      cases: '网络货运示例',
      ownerUserId: 1,
      popularity: 81,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 18,
      name: '航空物流协同解决方案',
      category: '物流行业场景解决方案',
      description: '面向航司、机场与货代的协同网络，提升运单/舱单/状态数据交换效率',
      capability: '状态共享,节点追踪,异常预警,时效承诺,协同网络,对外协同接口,舱位协同,单证协同',
      scenarios: '航空物流,航贸数字化,跨境物流,多式联运',
      price: 72,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '航司,机场,货代',
      cases: '航空物流示例',
      ownerUserId: 1,
      popularity: 80,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 19,
      name: '多式联运协同解决方案',
      category: '物流行业场景解决方案',
      description: '覆盖铁公水空多种运输方式的计划编排、节点追踪与异常处置协同方案',
      capability: '计划编排,节点追踪,异常处置,对外协同接口,时效承诺,成本测算,协同调度,可视化看板',
      scenarios: '多式联运,智慧港航,航空物流,智慧口岸,航贸数字化,跨境物流',
      price: 88,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '综合物流企业,货主企业',
      cases: '多式联运示例',
      ownerUserId: 1,
      popularity: 85,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 20,
      name: '企业数智供应链（ERP+）',
      category: '企业数智供应链产品',
      description: '面向货主企业的端到端可视、预警与协同的供应链控制塔产品',
      capability: '端到端可视,异常预警,协同调度,指标分析,库存洞察,订单跟踪,在途追踪,风险看板',
      scenarios: '数字仓管,网络货运,航空物流,航贸数字化,多式联运,智慧口岸,智慧港航',
      price: 120,
      version: 'v2.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '企业产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '制造,电商,零售',
      cases: '控制塔示例',
      ownerUserId: 1,
      popularity: 90,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 21,
      name: 'WMS 仓储管理系统',
      category: '企业数智供应链产品',
      description: '面向多仓协同的仓储管理系统，支持库位、波次、盘点与策略配置',
      capability: '入库,出库,库位管理,波次拣选,补货策略,盘点,库存预警,绩效分析',
      scenarios: '数字仓管,多仓协同,仓配一体,电商仓',
      price: 95,
      version: 'v2.3',
      providerName: '自研团队',
      sourceType: 'INTERNAL',
      sourceName: '企业产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '仓储企业,货主企业',
      cases: '仓储数字化示例',
      ownerUserId: 1,
      popularity: 88,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 22,
      name: 'TMS 运输管理系统',
      category: '企业数智供应链产品',
      description: '覆盖运输计划、承运商协同、在途可视化与结算对账的运输管理系统',
      capability: '运输计划,承运商协同,在途可视化,结算对账,运价管理,异常处理,时效监控,调度排班',
      scenarios: '网络货运,多式联运,航空物流,干线运输,城配调度',
      price: 110,
      version: 'v3.1',
      providerName: '自研团队',
      sourceType: 'INTERNAL',
      sourceName: '企业产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '物流企业,货主企业',
      cases: '运输协同示例',
      ownerUserId: 1,
      popularity: 86,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 23,
      name: 'OMS 订单管理系统',
      category: '企业数智供应链产品',
      description: '订单全链路管理，支持多渠道接入、拆单合单、履约协同与对账',
      capability: '多渠道接入,拆单合单,履约协同,对账,库存占用,发货协同,退换货,风控',
      scenarios: '数字仓管,智慧口岸,航贸数字化,全渠道履约',
      price: 88,
      version: 'v1.8',
      providerName: '自研团队',
      sourceType: 'INTERNAL',
      sourceName: '企业产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '电商,新零售',
      cases: '履约协同示例',
      ownerUserId: 1,
      popularity: 82,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 24,
      name: '绿色金融与授信服务',
      category: '物流供应链增值服务',
      description: '面向物流供应链业务的金融服务与授信支持，提升资金周转效率',
      capability: '授信,结算,融资,风控,账期管理,对账协同,合规校验,票据管理',
      scenarios: '网络货运,智慧港航,航贸数字化,多式联运',
      price: null,
      version: 'v1.0',
      providerName: '金融伙伴',
      sourceType: 'THIRD',
      sourceName: '生态伙伴',
      sourceUrl: 'https://example.com',
      externalDemoUrl: 'https://example.com',
      customers: '物流企业,货主企业',
      cases: '绿色金融示例',
      ownerUserId: 3,
      popularity: 60,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 25,
      name: '供应链保险与风控服务',
      category: '物流供应链增值服务',
      description: '提供履约保障、货损保障等保险与风控增值服务，降低业务风险',
      capability: '保险,风控,理赔协同,保单管理,风险评分,异常识别,履约保障',
      scenarios: '网络货运,航空物流,多式联运,跨境物流',
      price: null,
      version: 'v1.0',
      providerName: '保险伙伴',
      sourceType: 'THIRD',
      sourceName: '生态伙伴',
      sourceUrl: 'https://example.com',
      externalDemoUrl: 'https://example.com',
      customers: '物流企业,货主企业',
      cases: '保险风控示例',
      ownerUserId: 3,
      popularity: 58,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 26,
      name: '运力撮合与结算服务',
      category: '物流供应链增值服务',
      description: '提供运力撮合、电子合同与结算对账等增值服务，提升交易效率',
      capability: '撮合,结算对账,电子合同,账期管理,运价发布,信用评估,对账协同',
      scenarios: '网络货运,多式联运,干线运输,城配调度',
      price: null,
      version: 'v1.0',
      providerName: '生态伙伴C',
      sourceType: 'THIRD',
      sourceName: '生态伙伴',
      sourceUrl: 'https://example.com',
      externalDemoUrl: 'https://example.com',
      customers: '网络货运平台,物流企业',
      cases: '撮合结算示例',
      ownerUserId: 3,
      popularity: 62,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 27,
      name: '跨境清关增值服务',
      category: '物流供应链增值服务',
      description: '面向跨境业务的清关协同、单证服务与合规咨询等增值服务',
      capability: '清关协同,单证服务,合规咨询,申报协同,异常处理,通关对标,时效追踪',
      scenarios: '智慧口岸,航贸数字化,跨境物流,多式联运',
      price: null,
      version: 'v1.0',
      providerName: '生态伙伴D',
      sourceType: 'THIRD',
      sourceName: '生态伙伴',
      sourceUrl: 'https://example.com',
      externalDemoUrl: 'https://example.com',
      customers: '货主企业,货代',
      cases: '跨境清关示例',
      ownerUserId: 3,
      popularity: 56,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 28,
      name: '陆路运输',
      category: '物流行业场景解决方案',
      description: '面向公路/干线运输的计划、调度与在途可视化协同功能',
      capability: '运力调度,在途可视,异常预警,签收回单,费用结算,司机管理,轨迹回放',
      scenarios: '网络货运,多式联运,数字仓管,智慧口岸',
      price: 58,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '综合物流企业,货主企业',
      cases: '陆路运输协同示例',
      ownerUserId: 1,
      popularity: 87,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 29,
      name: '海运运输',
      category: '物流行业场景解决方案',
      description: '面向订舱、船期节点、箱货跟踪与异常协同的海运运输数字化功能',
      capability: '订舱协同,船期管理,箱货跟踪,节点可视,异常处置,对外协同接口,时效预测',
      scenarios: '智慧港航,航贸数字化,多式联运,智慧口岸',
      price: 66,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '航运公司,货代,货主企业',
      cases: '海运运输协同示例',
      ownerUserId: 1,
      popularity: 88,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 30,
      name: '航空运输',
      category: '物流行业场景解决方案',
      description: '面向航空货运的航班节点追踪、时效承诺与异常预警协同功能',
      capability: '舱位协同,状态共享,节点追踪,异常预警,时效承诺,单证协同,对外协同接口',
      scenarios: '航空物流,航贸数字化,多式联运,智慧口岸',
      price: 72,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '航司,机场,货代',
      cases: '航空运输协同示例',
      ownerUserId: 1,
      popularity: 86,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 31,
      name: '水运运输',
      category: '物流行业场景解决方案',
      description: '面向内河/港航水运的节点追踪、在途异常与协同处置功能',
      capability: '节点追踪,港航协同,异常处理,在途可视,时效预测,对外协同接口,事件监测',
      scenarios: '智慧长江,智慧港航,多式联运',
      price: 62,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '港航企业,综合物流企业',
      cases: '水运运输协同示例',
      ownerUserId: 1,
      popularity: 85,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 32,
      name: '行业态势监测大屏',
      category: '物流行业场景解决方案',
      description: '面向行业运行的态势监测、预警与分析大屏，支持多维钻取',
      capability: '态势监测,指标看板,异常预警,多维钻取,事件订阅,联动处置',
      scenarios: '智慧港航,智慧口岸,智慧长江,网络货运',
      price: 48,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '场景方案',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '政府部门,行业机构',
      cases: '行业态势监测示例',
      ownerUserId: 1,
      popularity: 77,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 33,
      name: '数据开放接口网关',
      category: '物流行业数字化基础平台',
      description: '统一的对外数据服务门户与 API 网关，支持计量计费、鉴权与限流',
      capability: 'API网关,鉴权,限流,计量计费,服务编排,SDK发布,运行监控',
      scenarios: '智慧口岸,航贸数字化,网络货运,多式联运',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '公共平台',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '行业企业,开发者',
      cases: '开放接口示例',
      ownerUserId: 1,
      popularity: 73,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 34,
      name: '数据资产目录与血缘管理',
      category: '数智技术产品',
      description: '提供数据资产编目、血缘追踪、质量监控与权限治理功能',
      capability: '数据编目,血缘追踪,质量监控,权限治理,资产评估,变更审计',
      scenarios: '航贸数字化,智慧口岸,数字仓管,网络货运',
      price: 18,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '技术产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '物流企业,科技公司',
      cases: '数据治理示例',
      ownerUserId: 1,
      popularity: 71,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 35,
      name: '多式联运协同编排引擎',
      category: '数智技术产品',
      description: '将铁公水空等多种运输方式编排为可执行流程，支持异常分流与成本测算',
      capability: '流程编排,异常分流,成本测算,时效承诺,策略配置,协同调度,可视化看板',
      scenarios: '多式联运,智慧港航,航空物流,智慧口岸',
      price: 26,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '技术产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '综合物流企业,货主企业',
      cases: '多式联运编排示例',
      ownerUserId: 1,
      popularity: 82,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 36,
      name: '物流企业数据确权与授权服务',
      category: '数据要素产品',
      description: '面向物流企业的数据确权、授权与审计的服务化产品',
      capability: '数据确权,授权管理,审计追踪,合规评估,脱敏加工,水印溯源',
      scenarios: '数字仓管,网络货运,航空物流,航贸数字化',
      price: 4,
      version: 'v2026.1',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '数据产品',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '物流企业,科技公司',
      cases: '确权授权示例',
      ownerUserId: 1,
      popularity: 69,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 37,
      name: '生态伙伴接入与联调平台',
      category: '物流行业数字化基础平台',
      description: '提供伙伴接入规范、联调环境与数据对接功能，支持快速生态集成',
      capability: '接入规范,联调环境,沙箱环境,数据对接,API管理,灰度发布,监控告警',
      scenarios: '智慧港航,智慧口岸,网络货运,航贸数字化',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '公共平台',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '生态伙伴,科技公司',
      cases: '生态接入示例',
      ownerUserId: 1,
      popularity: 68,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 38,
      name: '企业运输费用对账助手',
      category: '企业数智供应链产品',
      description: '面向货主企业的运输费用对账、异常识别与结算协同助手',
      capability: '对账协同,异常识别,账期管理,费用归集,发票匹配,结算对接',
      scenarios: '网络货运,多式联运,航空物流,数字仓管',
      price: 22,
      version: 'v1.0',
      providerName: '生态伙伴E',
      sourceType: 'THIRD',
      sourceName: '生态伙伴',
      sourceUrl: 'https://example.com',
      externalDemoUrl: 'https://example.com',
      customers: '货主企业,物流企业',
      cases: '对账协同示例',
      ownerUserId: 3,
      popularity: 57,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 39,
      name: '行业数据产品商城',
      category: '物流供应链增值服务',
      description: '提供行业数据产品的选购、试用与交付服务，促进数据产业生态流通',
      capability: '产品选购,在线试用,交付管理,计量计费,合同管理,工单服务',
      scenarios: '智慧口岸,航贸数字化,网络货运,多式联运',
      price: null,
      version: 'v1.0',
      providerName: '中国数联',
      sourceType: 'INTERNAL',
      sourceName: '增值服务',
      sourceUrl: null,
      externalDemoUrl: null,
      customers: '行业企业,开发者',
      cases: '数据产品商城示例',
      ownerUserId: 1,
      popularity: 64,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    },
    {
      id: 40,
      name: '物流行业数据合规模板库',
      category: '物流供应链增值服务',
      description: '提供数据合规检查清单、模板与咨询服务，降低企业合规成本',
      capability: '合规模板,检查清单,风险评估,审计材料,流程规范,咨询服务',
      scenarios: '智慧口岸,航贸数字化,数字仓管,网络货运',
      price: null,
      version: 'v1.0',
      providerName: '生态伙伴F',
      sourceType: 'THIRD',
      sourceName: '生态伙伴',
      sourceUrl: 'https://example.com',
      externalDemoUrl: 'https://example.com',
      customers: '物流企业,科技公司',
      cases: '数据合规示例',
      ownerUserId: 3,
      popularity: 55,
      status: 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    }
  ]
  for (const p of list) {
    p.name = stripExampleMark(p.name)
    p.capability = limitListText(p.capability, 8)
    p.scenarios = limitListText(p.scenarios, 4)
    if (!p.serviceType) p.serviceType = inferServiceType(p)
  }
  return list
}

function seedSolutions() {
  const baseTime = nowISO()
  return [
    {
      id: 1,
      name: '多式联运协同方案',
      description: '覆盖铁公水空多种运输方式的计划编排、节点追踪、异常处置与对外协同',
      targetIndustry: '物流',
      scenarios: '多式联运,智慧港航,航空物流,智慧口岸',
      architecture: 'SaaS+开放API',
      productIds: [1, 2, 3, 4, 28, 29, 30, 31, 11, 35, 19, 22],
      estimatedDays: 60,
      priceRange: '80-200万',
      createTime: baseTime
    },
    {
      id: 2,
      name: '仓储数字化方案',
      description: '以 WMS 为核心，打通入库、出库、盘点与库存预警',
      targetIndustry: '物流',
      scenarios: '数字仓管',
      architecture: 'SaaS',
      productIds: [1, 2, 16, 21, 10],
      estimatedDays: 45,
      priceRange: '50-120万',
      createTime: baseTime
    },
    {
      id: 3,
      name: '订单履约一体化方案',
      description: '以 OMS 为核心，联动仓储与运输，实现端到端履约可视化',
      targetIndustry: '电商',
      scenarios: '数字仓管,网络货运',
      architecture: 'SaaS',
      productIds: [20, 21, 22, 23, 12],
      estimatedDays: 40,
      priceRange: '60-150万',
      createTime: baseTime
    }
  ]
}

function initStore() {
  const existing = readStore()
  if (existing) {
    const list = Array.isArray(existing.products) ? existing.products : []
    let changed = false
    const seedArr = seedProducts()
    const seedMap = new Map(seedArr.map(p => [Number(p?.id), p]))
    const existIdSet = new Set(list.map(p => Number(p?.id)).filter(Number.isFinite))
    for (const p of list) {
      const next = stripExampleMark(p?.name)
      if (next && p?.name !== next) {
        p.name = next
        changed = true
      }
      const seed = seedMap.get(Number(p?.id))
      if (seed && Number(p?.ownerUserId) === Number(seed.ownerUserId)) {
        if (seed.name && p?.name !== seed.name) {
          p.name = seed.name
          changed = true
        }
        if (seed.category && p?.category !== seed.category) {
          p.category = seed.category
          changed = true
        }
        if (seed.description && p?.description !== seed.description) {
          p.description = seed.description
          changed = true
        }
        if (seed.capability && p?.capability !== seed.capability) {
          p.capability = seed.capability
          changed = true
        }
        if (seed.scenarios && p?.scenarios !== seed.scenarios) {
          p.scenarios = seed.scenarios
          changed = true
        }
        if (seed.providerName && p?.providerName !== seed.providerName) {
          p.providerName = seed.providerName
          changed = true
        }
        if (seed.sourceType && p?.sourceType !== seed.sourceType) {
          p.sourceType = seed.sourceType
          changed = true
        }
        if (seed.sourceName && p?.sourceName !== seed.sourceName) {
          p.sourceName = seed.sourceName
          changed = true
        }
        if (seed.serviceType && p?.serviceType !== seed.serviceType) {
          p.serviceType = seed.serviceType
          changed = true
        }
      }
      if (!p.serviceType) {
        p.serviceType = seed?.serviceType || inferServiceType(p)
        changed = true
      }
      const capLimited = limitListText(p?.capability, 8)
      if (capLimited && p?.capability !== capLimited) {
        p.capability = capLimited
        changed = true
      }
      const scLimited = limitListText(p?.scenarios, 4)
      if (scLimited && p?.scenarios !== scLimited) {
        p.scenarios = scLimited
        changed = true
      }
    }
    // 追加缺失的种子产品（保证演示数据完整）
    for (const sp of seedArr) {
      const sid = Number(sp?.id)
      if (!existIdSet.has(sid)) {
        const copy = { ...sp }
        if (!copy.serviceType) copy.serviceType = inferServiceType(copy)
        existing.products = Array.isArray(existing.products) ? existing.products : []
        existing.products.push(copy)
        changed = true
      }
    }
    // 去重：同名产品自动加短类别后缀
    if (dedupeProductNames(existing.products)) {
      changed = true
    }
    if (changed) {
      existing.meta = existing.meta && typeof existing.meta === 'object' ? existing.meta : {}
      existing.meta.updatedAt = nowISO()
      writeStore(existing)
    }
    return existing
  }

  const baseTime = nowISO()
  const store = {
    seq: {
      productId: 1000,
      trialId: 1000,
      feedbackId: 1000,
      solutionId: 1000,
      aiConversationId: 1000,
      aiMessageId: 1000
    },
    products: seedProducts(),
    solutions: seedSolutions(),
    trials: [],
    feedbacks: [],
    ai: {
      conversations: [],
      messages: []
    },
    meta: {
      createdAt: baseTime,
      updatedAt: baseTime
    }
  }
  for (const p of store.products || []) {
    if (!p.serviceType) p.serviceType = inferServiceType(p)
  }
  dedupeProductNames(store.products)
  return writeStore(store)
}

function bumpSeq(store, key) {
  const next = Number(store?.seq?.[key] || 0) + 1
  store.seq[key] = next
  return next
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizePath(config) {
  const baseURL = typeof config?.baseURL === 'string' ? config.baseURL : ''
  const rawUrl = typeof config?.url === 'string' ? config.url : ''
  let full = rawUrl

  if (/^https?:\/\//i.test(full)) {
    try {
      full = new URL(full).pathname
    } catch (e) {
    }
  } else if (baseURL && rawUrl && rawUrl.startsWith('/')) {
    full = `${baseURL.replace(/\/$/, '')}${rawUrl}`
  }

  full = String(full || '').trim()
  if (!full.startsWith('/')) full = `/${full}`
  full = full.replace(/\/+/g, '/')
  if (full.startsWith('/api/')) full = full.slice(4)
  if (full === '/api') full = '/'
  return full
}

function parseBody(data) {
  if (data == null) return null
  if (typeof data === 'object') return data
  const raw = String(data || '').trim()
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    return raw
  }
}

function buildAxiosResponse(config, status, payload) {
  return {
    data: payload,
    status,
    statusText: status >= 200 && status < 300 ? 'OK' : 'ERROR',
    headers: {},
    config,
    request: {}
  }
}

function buildApiResult(data, extra = {}) {
  return { ...extra, data }
}

function getActiveProducts(store) {
  return (store.products || []).filter(p => String(p?.status || '').toUpperCase() === 'ACTIVE')
}

function normalizeKeyword(v) {
  return String(v || '').trim().toLowerCase()
}

function searchProducts(products, keyword) {
  const kw = normalizeKeyword(keyword)
  if (!kw) return products
  return products.filter(p => {
    const text = [
      p.name,
      p.category,
      p.description,
      p.capability,
      p.scenarios,
      p.providerName,
      p.sourceType,
      p.sourceName,
      p.version
    ].filter(Boolean).join(' ').toLowerCase()
    return text.includes(kw)
  })
}

function buildEnvironmentUrl(product, trialId) {
  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TRIAL_ENV_BASE_URL)
    ? String(import.meta.env.VITE_TRIAL_ENV_BASE_URL)
    : 'http://dsly.172.16.50.163.nip.io/'
  return base
}

function computeTrialStats(store) {
  const trials = Array.isArray(store.trials) ? store.trials : []
  const feedbacks = Array.isArray(store.feedbacks) ? store.feedbacks : []
  const runningCount = trials.filter(t => String(t?.status || '').toUpperCase() === 'RUNNING').length
  const completedCount = trials.filter(t => String(t?.status || '').toUpperCase() === 'COMPLETED').length
  const ratings = feedbacks.map(f => Number(f?.rating)).filter(n => Number.isFinite(n) && n > 0)
  const avg = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0
  return { runningCount, completedCount, averageRating: avg }
}

function readSessionUser() {
  try {
    const raw = localStorage.getItem('demo-platform-session')
    const s = raw ? JSON.parse(raw) : null
    if (!s || typeof s !== 'object') return null
    const account = s.account
    if (!account) return null
    const usersRaw = localStorage.getItem('demo-platform-users')
    const users = usersRaw ? JSON.parse(usersRaw) : []
    if (!Array.isArray(users)) return null
    const u = users.find(x => String(x.account).toLowerCase() === String(account).toLowerCase())
    return u && typeof u === 'object' ? u : null
  } catch (e) {
    return null
  }
}

function buildMockUser(userId) {
  const id = Number(userId)
  const u = readSessionUser()
  return {
    id: Number.isFinite(id) ? id : 1,
    username: u?.account ? String(u.account) : 'demo',
    name: u?.name ? String(u.name) : '演示用户',
    industry: u?.industry ? String(u.industry) : '物流',
    company: u?.company ? String(u.company) : '演示企业',
    role: 'USER'
  }
}

function parseRequirementsFromText(text) {
  const msg = String(text || '')
  const requirements = {}

  // 专项规则：铁路在途跟踪（重庆→德国汉堡，货主/汽车制造业）
  const hasRail = /铁路|中欧班列/.test(msg)
  const hasTracking = /在途|跟踪|追踪|节点/.test(msg)
  const hasChongqing = /重庆/.test(msg)
  const hasHamburg = /汉堡|德国/.test(msg)
  const hasAuto = /汽车|整车/.test(msg)
  if (hasRail && hasTracking) {
    if (hasAuto) requirements.industry = '汽车制造业（货主企业出口物流）'
    requirements.scenario = '铁路货运在途跟踪'
    const caps = [
      '在途跟踪', '状态查询', '节点追踪', '可视化', '延误预警', '轨迹回放', '时效追踪'
    ]
    requirements.capability = caps.join('、')
  }
  if (hasChongqing || hasHamburg) {
    // 暗示跨境/多式联运链路，用于后续方案匹配加权
    requirements.scenario = requirements.scenario || '多式联运'
  }

  const industryHints = [
    ['物流', '物流'],
    ['电商', '电商'],
    ['制造', '制造'],
    ['零售', '零售'],
    ['跨境', '跨境']
  ]
  for (const [kw, val] of industryHints) {
    if (msg.includes(kw)) {
      requirements.industry = val
      break
    }
  }

  const scenarioHints = [
    ['仓储', '仓储管理'],
    ['运输', '运输管理'],
    ['订单', '订单管理'],
    ['多式联运', '多式联运'],
    ['跨境', '跨境物流']
  ]
  for (const [kw, val] of scenarioHints) {
    if (msg.includes(kw)) {
      requirements.scenario = val
      break
    }
  }

  const capHints = ['库存', '拣选', '调度', '在途', '对账', 'OCR', '识别', '路径', '优化']
  const caps = capHints.filter(k => msg.includes(k))
  if (caps.length) requirements.capability = caps.join('、')

  const budgetMatch = msg.match(/预算\s*([0-9]+)\s*万/i) || msg.match(/([0-9]+)\s*万\s*以内/)
  if (budgetMatch && budgetMatch[1]) requirements.budget = `${budgetMatch[1]}万`

  const versionMatch = msg.match(/版本\s*([vV]?[0-9]+(\.[0-9]+)*)/)
  if (versionMatch && versionMatch[1]) requirements.version = versionMatch[1]

  return requirements
}

function computeAiCompleteness(requirements) {
  const r = requirements && typeof requirements === 'object' ? requirements : {}
  let score = 0
  if (r.industry) score += 25
  if (r.scenario) score += 25
  if (r.capability) score += 25
  if (r.budget) score += 25
  return Math.min(100, Math.max(0, score))
}

function aiMissingKeys(requirements) {
  const r = requirements && typeof requirements === 'object' ? requirements : {}
  const missing = []
  if (!r.industry) missing.push('industry')
  if (!r.scenario) missing.push('scenario')
  if (!r.capability) missing.push('capability')
  if (!r.budget) missing.push('budget')
  return missing
}

function aiNextQuestion(missing) {
  const m = Array.isArray(missing) ? missing[0] : ''
  if (m === 'industry') return '您所处行业是？例如：物流/电商/制造'
  if (m === 'scenario') return '您希望解决的场景是？例如：仓储/运输/订单/跨境'
  if (m === 'capability') return '您最关注的功能点是？例如：库存/拣选/在途/对账'
  if (m === 'budget') return '预算范围大概是多少？例如：50万以内/80-200万'
  return '为了更准确推荐，能再补充一些需求吗？'
}

function aiRequirementLabel(key) {
  const k = String(key || '')
  if (k === 'industry') return '行业'
  if (k === 'scenario') return '场景'
  if (k === 'capability') return '功能点'
  if (k === 'budget') return '预算'
  if (k === 'version') return '版本'
  return k
}

function pickRecommendedProducts(products, requirements, limit) {
  const r = requirements && typeof requirements === 'object' ? requirements : {}
  const kw = [r.scenario, r.capability, r.industry].filter(Boolean).join(' ')
  const list = searchProducts(products, kw)
  const ranked = [...list].sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0))
  return ranked.slice(0, Math.max(1, Number(limit) || 3))
}

function buildAiTags(requirements) {
  const r = requirements && typeof requirements === 'object' ? requirements : {}
  const tags = []
  if (r.industry) tags.push(`行业:${r.industry}`)
  if (r.scenario) tags.push(`场景:${r.scenario}`)
  if (r.budget) tags.push(`预算:${r.budget}`)
  if (r.version) tags.push(`版本:${r.version}`)
  if (r.capability) {
    const parts = String(r.capability).split(/[，,/\s]+/).map(s => s.trim()).filter(Boolean)
    for (const p of parts.slice(0, 6)) tags.push(`功能:${p}`)
  }
  return Array.from(new Set(tags)).slice(0, 12)
}

function buildAiTitle(requirements) {
  const r = requirements && typeof requirements === 'object' ? requirements : {}
  const parts = [r.industry, r.scenario].filter(Boolean)
  return parts.length ? parts.join('-') : 'AI 对话'
}

function normalizeAiScenario(v) {
  const s = String(v || '').trim()
  const map = {
    铁路货运在途跟踪: '多式联运',
    仓储管理: '数字仓管',
    运输管理: '网络货运',
    订单管理: '订单履约',
    跨境物流: '智慧口岸'
  }
  return map[s] || s
}

function parseBudgetRange(text) {
  const raw = String(text || '')
  const nums = raw.match(/[0-9]+/g)?.map(n => Number(n)).filter(Number.isFinite) || []
  if (!nums.length) return null
  const hasDash = raw.includes('-') || raw.includes('～') || raw.includes('~')
  if (hasDash && nums.length >= 2) {
    const min = Math.min(nums[0], nums[1])
    const max = Math.max(nums[0], nums[1])
    return { min, max }
  }
  const v = nums[0]
  if (raw.includes('以内') || raw.includes('不超过') || raw.includes('以下')) return { min: 0, max: v }
  return { min: 0, max: v }
}

function buildSolutionHay(solution, productsById) {
  const parts = [
    solution?.name,
    solution?.description,
    solution?.targetIndustry,
    solution?.scenarios,
    solution?.architecture
  ].filter(Boolean)
  const productIds = Array.isArray(solution?.productIds) ? solution.productIds : []
  for (const id of productIds) {
    const p = productsById.get(Number(id))
    if (!p) continue
    parts.push([p?.name, p?.category, p?.capability, p?.scenarios].filter(Boolean).join(' '))
  }
  return parts.join(' ')
}

function scoreAiSolution(solution, requirements, productsById) {
  const r = requirements && typeof requirements === 'object' ? requirements : {}
  const reqIndustry = r.industry ? String(r.industry) : ''
  const reqScenario = normalizeAiScenario(r.scenario)
  const reqBudget = r.budget ? String(r.budget) : ''
  const capTokens = String(r.capability || '')
    .split(/[，,、/;\s]+/)
    .map(s => s.trim())
    .filter(Boolean)

  const hay = buildSolutionHay(solution, productsById)
  const scenarioAliases = (() => {
    const a = new Set([reqScenario])
    if (r.scenario === '铁路货运在途跟踪') {
      ['多式联运', '网络货运', '干线运输', '跨境物流', '铁路', '在途可视', '节点追踪'].forEach(x => a.add(x))
    }
    return Array.from(a).filter(Boolean)
  })()
  const scenarioMatch = reqScenario ? scenarioAliases.some(x => hay.includes(x)) : false
  const industryMatch = reqIndustry ? hay.includes(reqIndustry) : false
  const matchedCaps = capTokens.length ? capTokens.filter(t => hay.includes(t)) : []
  const uniqueMatchedCaps = Array.from(new Set(matchedCaps))

  let score = 55
  if (reqScenario) score += scenarioMatch ? 26 : 8
  if (reqIndustry) score += industryMatch ? 10 : 2
  score += Math.min(20, uniqueMatchedCaps.length * 6)

  const b = parseBudgetRange(reqBudget)
  const pr = parseBudgetRange(solution?.priceRange)
  if (b && pr) {
    if (b.max < pr.min) score -= 8
    else if (b.max >= pr.min && b.max <= pr.max) score += 8
    else score += 4
  } else if (b || pr) {
    score += 4
  }

  const pidCount = Array.isArray(solution?.productIds) ? solution.productIds.length : 0
  score += pidCount ? 5 : 0

  // 确定性微分：用于打破两方案同分（不引入随机）
  // 结合方案ID、功能词数量、是否有场景，映射到 [-2, +2]
  const seed = (Number(solution?.id) || 0) * 17 + (uniqueMatchedCaps.length || 0) * 3 + (reqScenario ? 11 : 0)
  const jitter = (seed % 5) - 2
  score += jitter

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    scenarioMatch,
    industryMatch,
    matchedCaps: uniqueMatchedCaps,
    reqScenario,
    reqIndustry,
    reqBudget,
    capTokens
  }
}

function pickAiSolutions(solutions, requirements, productsById, limit) {
  const list = Array.isArray(solutions) ? solutions : []
  const scored = list.map(s => ({ s, meta: scoreAiSolution(s, requirements, productsById) }))
    .sort((a, b) => Number(b.meta.score) - Number(a.meta.score))
  const picked = []
  const usedPrimary = new Set()
  for (const item of scored) {
    if (picked.length >= Math.max(1, Number(limit) || 2)) break
    const scenarios = String(item.s?.scenarios || '').split(/[,，/、\n]+/).map(v => v.trim()).filter(Boolean)
    const primary = scenarios[0] || String(item.s?.name || '')
    if (picked.length === 0) {
      picked.push(item)
      usedPrimary.add(primary)
      continue
    }
    if (usedPrimary.has(primary) && scored.length > Math.max(1, Number(limit) || 2)) continue
    picked.push(item)
    usedPrimary.add(primary)
  }
  if (picked.length < Math.max(1, Number(limit) || 2)) {
    for (const item of scored) {
      if (picked.length >= Math.max(1, Number(limit) || 2)) break
      if (picked.some(x => Number(x.s?.id) === Number(item.s?.id))) continue
      picked.push(item)
    }
  }
  return picked
}

function pickBundleProducts(candidateProducts, usedIds, requirements, limit) {
  const r = requirements && typeof requirements === 'object' ? requirements : {}
  const reqScenario = normalizeAiScenario(r.scenario)
  const capTokens = String(r.capability || '')
    .split(/[，,、/;\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
  const scored = (candidateProducts || []).map(p => {
    const hay = [p?.name, p?.category, p?.scenarios, p?.capability, p?.description].filter(Boolean).join(' ')
    const scenarioAliases = (() => {
      const a = new Set([reqScenario])
      if (r.scenario === '铁路货运在途跟踪') {
        ['多式联运', '网络货运', '干线运输', '跨境物流', '铁路', '在途可视', '节点追踪'].forEach(x => a.add(x))
      }
      return Array.from(a).filter(Boolean)
    })()
    const scenarioMatch = reqScenario ? scenarioAliases.some(x => hay.includes(x)) : false
    const capMatch = capTokens.length ? capTokens.filter(t => hay.includes(t)).length : 0
    const popularity = Number(p?.popularity || 0)
    const score = (scenarioMatch ? 20 : 0) + capMatch * 6 + Math.min(10, popularity / 10)
    return { p, score }
  }).sort((a, b) => Number(b.score) - Number(a.score))

  const picked = []
  const max = Math.max(1, Number(limit) || 4)
  for (const { p } of scored) {
    if (picked.length >= max) break
    const id = Number(p?.id)
    if (!Number.isFinite(id)) continue
    if (usedIds.has(id)) continue
    usedIds.add(id)
    picked.push(p)
  }
  if (picked.length < max) {
    for (const { p } of scored) {
      if (picked.length >= max) break
      const id = Number(p?.id)
      if (!Number.isFinite(id)) continue
      if (picked.some(x => Number(x?.id) === id)) continue
      picked.push(p)
    }
  }
  return picked
}

function makeAiBundles(solutions, requirements, products) {
  const allSolutions = Array.isArray(solutions) ? solutions : []
  const productsById = new Map((products || []).map(p => [Number(p?.id), p]))
  const chosen = pickAiSolutions(allSolutions, requirements, productsById, 2)
  const usedProductIds = new Set()

  const bundles = chosen.map(({ s, meta }) => {
    const reqIndustry = meta.reqIndustry
    const reqScenario = meta.reqScenario
    const reqBudget = meta.reqBudget
    const capTokens = meta.capTokens

    const productIds = Array.isArray(s?.productIds) ? s.productIds : []
    const directProducts = productIds.map(id => productsById.get(Number(id))).filter(Boolean)
    const candidates = directProducts.length ? directProducts : (products || [])
    const bundleProducts = pickBundleProducts(candidates, usedProductIds, requirements, 2)

    const reasons = []
    if (reqScenario) reasons.push(meta.scenarioMatch ? `场景匹配：覆盖${reqScenario}相关流程` : `场景建议：可扩展支持${reqScenario}场景`)
    if (capTokens.length) {
      reasons.push(
        meta.matchedCaps.length
          ? `功能覆盖：${meta.matchedCaps.slice(0, 4).join('、')}`
          : `功能建议：可按需补齐${capTokens.slice(0, 4).join('、')}`
      )
    }
    if (reqIndustry) reasons.push(meta.industryMatch ? `行业适配：面向${reqIndustry}业务特征配置` : `行业通用：可结合${reqIndustry}需求做定制适配`)
    if (reqBudget || s?.priceRange) reasons.push(`预算参考：${s?.priceRange || '可按规模评估报价'}`)
    const productNames = bundleProducts.map(p => p?.name).filter(Boolean).slice(0, 2)
    if (productNames.length) reasons.push(`可试用产品：${productNames.join('、')}`)

    return {
      score: meta.score,
      reasons,
      solution: {
        id: s.id,
        name: s.name,
        description: s.description,
        estimatedDays: s.estimatedDays,
        priceRange: s.priceRange
      },
      products: bundleProducts,
      highlights: {
        行业: reqIndustry || '通用',
        场景: reqScenario || '综合'
      }
    }
  })

  const sorted = bundles.slice().sort((a, b) => Number(b?.score || 0) - Number(a?.score || 0))
  ensureDistinctBundleScore10(sorted)
  return sorted
}

function ensureDistinctBundleScore10(sortedBundles) {
  const list = Array.isArray(sortedBundles) ? sortedBundles : []
  const used = new Set()
  const to10 = (v) => {
    const n = Number(v)
    if (!Number.isFinite(n)) return 0
    const ten = Math.round(n / 10)
    return Math.max(0, Math.min(10, ten))
  }
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)))

  for (const b of list) {
    const base = Number(b?.score)
    const base10 = to10(base)
    if (!used.has(base10)) {
      used.add(base10)
      continue
    }

    let next = clamp(base)
    for (let step = 1; step <= 10; step += 1) {
      const candidate = clamp(base - step * 10)
      const c10 = to10(candidate)
      if (!used.has(c10)) {
        next = candidate
        break
      }
    }
    b.score = next
    used.add(to10(next))
  }
}

function makeAiReply(requirements, missing, recommendedProducts, bundles, needsMoreInfo) {
  if (needsMoreInfo) {
    const missingText = (Array.isArray(missing) ? missing : []).map(aiRequirementLabel).join(' / ')
    return `为了给您推荐更合适的产品/方案，我还需要了解：\n- ${missingText}\n\n${aiNextQuestion(missing)}`
  }
  const productNames = (recommendedProducts || []).map(p => p.name).filter(Boolean).slice(0, 6)
  const bundleNames = (bundles || []).map(b => b?.solution?.name).filter(Boolean).slice(0, 4)
  const summary = [
    requirements.industry ? `行业：${requirements.industry}` : null,
    requirements.scenario ? `场景：${requirements.scenario}` : null,
    requirements.capability ? `功能：${requirements.capability}` : null,
    requirements.budget ? `预算：${requirements.budget}` : null
  ].filter(Boolean).join('\n')

  const lines = []
  if (summary) lines.push(`已了解您的需求：\n${summary}`)
  if (bundleNames.length) lines.push(`\n可对比方案：${bundleNames.join('、')}`)
  if (productNames.length) lines.push(`\n推荐产品：${productNames.join('、')}\n\n您可以选择方案后直接试用对应产品。`)
  return lines.join('\n')
}

async function handleMockRequest(config) {
  const store = initStore()
  const method = String(config?.method || 'get').toLowerCase()
  const path = normalizePath(config)
  const params = config?.params && typeof config.params === 'object' ? config.params : {}
  const body = parseBody(config?.data)

  const products = getActiveProducts(store)

  if (method === 'get' && path === '/products') {
    const category = params.category ? String(params.category) : ''
    const keyword = params.keyword ? String(params.keyword) : ''
    let list = products
    if (category) list = list.filter(p => String(p.category || '') === category)
    list = searchProducts(list, keyword)
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  if (method === 'get' && path === '/products/popular') {
    const limit = Number(params.limit)
    const size = Number.isFinite(limit) ? Math.max(1, Math.min(50, limit)) : 12
    const list = [...products].sort((a, b) => Number(b.popularity || 0) - Number(a.popularity || 0)).slice(0, size)
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  if (method === 'get' && path === '/products/categories') {
    const categories = Array.from(new Set(products.map(p => String(p.category || '')).filter(Boolean)))
    return buildAxiosResponse(config, 200, buildApiResult(categories))
  }

  const productDetailMatch = path.match(/^\/products\/(\d+)$/)
  if (method === 'get' && productDetailMatch) {
    const id = Number(productDetailMatch[1])
    const p = (store.products || []).find(x => Number(x?.id) === id) || null
    if (!p) return buildAxiosResponse(config, 404, { error: '产品不存在' })
    const related = getActiveProducts(store).filter(x => x.category === p.category && x.id !== p.id).slice(0, 8)
    return buildAxiosResponse(config, 200, { data: p, relatedProducts: related })
  }

  if (method === 'post' && path === '/trials') {
    const userId = Number(body?.userId)
    const productId = Number(body?.productId)
    const solutionId = body?.solutionId == null ? null : Number(body.solutionId)
    if (!Number.isFinite(userId) || !Number.isFinite(productId)) {
      return buildAxiosResponse(config, 400, { error: '参数不正确' })
    }

    const existing = (store.trials || []).find(t => Number(t.userId) === userId && Number(t.productId) === productId && String(t.status || '').toUpperCase() === 'RUNNING')
    if (existing) {
      return buildAxiosResponse(config, 400, { error: '该产品已有进行中的试用，请先完成或延长当前试用' })
    }

    const product = (store.products || []).find(p => Number(p?.id) === productId)
    if (!product) return buildAxiosResponse(config, 400, { error: '产品不存在' })

    const now = Date.now()
    const startTime = new Date(now).toISOString()
    const endTime = new Date(now + 7 * 24 * 3600 * 1000).toISOString()
    const trialId = bumpSeq(store, 'trialId')
    const trial = {
      id: trialId,
      userId,
      productId,
      solutionId: Number.isFinite(solutionId) ? solutionId : null,
      status: 'RUNNING',
      environmentUrl: buildEnvironmentUrl(product, trialId),
      testData: body?.testData ? String(body.testData) : '',
      startTime,
      endTime,
      createTime: startTime,
      updateTime: startTime
    }
    store.trials = Array.isArray(store.trials) ? store.trials : []
    store.trials.unshift(trial)
    store.meta.updatedAt = nowISO()
    writeStore(store)

    return buildAxiosResponse(config, 200, buildApiResult(trial, { message: '试用环境创建成功' }))
  }

  const trialDetailMatch = path.match(/^\/trials\/(\d+)$/)
  if (method === 'get' && trialDetailMatch) {
    const id = Number(trialDetailMatch[1])
    const trial = (store.trials || []).find(t => Number(t?.id) === id) || null
    if (!trial) return buildAxiosResponse(config, 404, { error: '试用不存在' })
    trial.environmentUrl = buildEnvironmentUrl(null, id)
    const feedback = (store.feedbacks || []).find(f => Number(f?.trialId) === id) || null
    const detail = { trial, feedback }
    return buildAxiosResponse(config, 200, buildApiResult(detail))
  }

  const userTrialsMatch = path.match(/^\/trials\/user\/(\d+)$/)
  if (method === 'get' && userTrialsMatch) {
    const userId = Number(userTrialsMatch[1])
    const list = (store.trials || [])
      .filter(t => Number(t?.userId) === userId)
      .map(t => ({ ...t, environmentUrl: buildEnvironmentUrl(null, t?.id) }))
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  const trialFeedbackMatch = path.match(/^\/trials\/(\d+)\/feedback$/)
  if (method === 'post' && trialFeedbackMatch) {
    const trialId = Number(trialFeedbackMatch[1])
    const trial = (store.trials || []).find(t => Number(t?.id) === trialId) || null
    if (!trial) return buildAxiosResponse(config, 404, { error: '试用不存在' })
    const userId = Number(body?.userId)
    const rating = Number(body?.rating)
    if (!Number.isFinite(userId) || !Number.isFinite(rating) || rating <= 0 || rating > 10) {
      return buildAxiosResponse(config, 400, { error: '参数不正确' })
    }

    store.feedbacks = Array.isArray(store.feedbacks) ? store.feedbacks : []
    const existing = store.feedbacks.find(f => Number(f.trialId) === trialId) || null
    const baseTime = nowISO()
    const fb = existing || {
      id: bumpSeq(store, 'feedbackId'),
      trialId,
      userId,
      createTime: baseTime
    }
    fb.rating = rating
    fb.feedback = body?.feedback ? String(body.feedback) : ''
    fb.issues = body?.issues ? String(body.issues) : ''
    fb.purchaseIntent = body?.purchaseIntent ? String(body.purchaseIntent) : 'NONE'
    fb.status = 'SUBMITTED'
    fb.providerReply = null
    fb.updateTime = baseTime

    if (!existing) store.feedbacks.unshift(fb)

    trial.status = 'COMPLETED'
    trial.updateTime = baseTime
    store.meta.updatedAt = baseTime
    writeStore(store)

    return buildAxiosResponse(config, 200, buildApiResult(fb, { message: '感谢您的反馈！' }))
  }

  const trialExtendMatch = path.match(/^\/trials\/(\d+)\/extend$/)
  if (method === 'post' && trialExtendMatch) {
    const trialId = Number(trialExtendMatch[1])
    const days = Number(params.days)
    const addDays = Number.isFinite(days) ? Math.max(1, Math.min(30, days)) : 7
    const trial = (store.trials || []).find(t => Number(t?.id) === trialId) || null
    if (!trial) return buildAxiosResponse(config, 404, { error: '试用不存在' })

    const end = new Date(trial.endTime || Date.now())
    const next = new Date(end.getTime() + addDays * 24 * 3600 * 1000).toISOString()
    trial.endTime = next
    trial.updateTime = nowISO()
    store.meta.updatedAt = trial.updateTime
    writeStore(store)

    return buildAxiosResponse(config, 200, buildApiResult(trial, { message: `试用时间已延长 ${addDays} 天` }))
  }

  if (method === 'get' && path === '/trials/stats') {
    return buildAxiosResponse(config, 200, buildApiResult(computeTrialStats(store)))
  }

  if (method === 'get' && path === '/feedback/all') {
    const list = Array.isArray(store.feedbacks) ? store.feedbacks : []
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  const feedbackUpdateMatch = path.match(/^\/feedback\/(\d+)$/)
  if (method === 'put' && feedbackUpdateMatch) {
    const id = Number(feedbackUpdateMatch[1])
    const list = Array.isArray(store.feedbacks) ? store.feedbacks : []
    const fb = list.find(f => Number(f?.id) === id) || null
    if (!fb) return buildAxiosResponse(config, 404, { error: '反馈不存在' })
    fb.status = body?.status ? String(body.status) : fb.status
    fb.providerReply = body?.providerReply == null ? null : String(body.providerReply)
    fb.updateTime = nowISO()
    store.meta.updatedAt = fb.updateTime
    writeStore(store)
    return buildAxiosResponse(config, 200, buildApiResult(fb, { message: '更新成功' }))
  }

  if (method === 'get' && path === '/admin/trial-requests') {
    const rows = (store.trials || []).map(t => {
      const user = buildMockUser(t.userId)
      const product = (store.products || []).find(p => Number(p?.id) === Number(t.productId)) || null
      const solution = t.solutionId == null ? null : (store.solutions || []).find(s => Number(s?.id) === Number(t.solutionId)) || null
      return {
        trialId: t.id,
        userId: user.id,
        userUsername: user.username,
        userName: user.name,
        userIndustry: user.industry,
        productId: product?.id ?? null,
        productName: product?.name ?? '',
        productCapability: product?.capability ?? '',
        productScenarios: product?.scenarios ?? '',
        productPrice: product?.price ?? null,
        productVersion: product?.version ?? '',
        solutionId: solution?.id ?? null,
        solutionName: solution?.name ?? null,
        trialStatus: t.status,
        environmentUrl: t.environmentUrl,
        testData: t.testData,
        startTime: t.startTime,
        endTime: t.endTime,
        createTime: t.createTime
      }
    })
    return buildAxiosResponse(config, 200, buildApiResult(rows, { total: rows.length }))
  }

  const adminTrialDetailMatch = path.match(/^\/admin\/trial-requests\/(\d+)$/)
  if (method === 'get' && adminTrialDetailMatch) {
    const trialId = Number(adminTrialDetailMatch[1])
    const trial = (store.trials || []).find(t => Number(t?.id) === trialId) || null
    if (!trial) return buildAxiosResponse(config, 404, { error: '试用不存在' })
    const user = buildMockUser(trial.userId)
    const product = (store.products || []).find(p => Number(p?.id) === Number(trial.productId)) || null
    const solution = trial.solutionId == null ? null : (store.solutions || []).find(s => Number(s?.id) === Number(trial.solutionId)) || null
    const feedback = (store.feedbacks || []).find(f => Number(f?.trialId) === trialId) || null
    return buildAxiosResponse(config, 200, buildApiResult({ trial, user, product, solution, feedback }))
  }

  if (method === 'get' && path === '/admin/products/pending') {
    const list = (store.products || []).filter(p => String(p?.status || '').toUpperCase() === 'DRAFT')
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  if (method === 'get' && path === '/admin/products') {
    const sourceType = params.sourceType ? String(params.sourceType).toUpperCase() : ''
    const status = params.status ? String(params.status).toUpperCase() : ''
    const keyword = params.keyword ? String(params.keyword) : ''
    let list = Array.isArray(store.products) ? store.products : []
    if (sourceType) list = list.filter(p => String(p?.sourceType || '').toUpperCase() === sourceType)
    if (status && status !== 'ALL') list = list.filter(p => String(p?.status || '').toUpperCase() === status)
    list = searchProducts(list, keyword)
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  if (method === 'post' && path === '/admin/products') {
    const baseTime = nowISO()
    const id = bumpSeq(store, 'productId')
    const category = String(body?.category || '')
    const p = {
      id,
      name: String(body?.name || ''),
      category,
      serviceType: body?.serviceType ? String(body.serviceType) : inferServiceType({ category, sourceType: 'INTERNAL' }),
      description: String(body?.description || ''),
      capability: String(body?.capability || ''),
      scenarios: String(body?.scenarios || ''),
      price: normalizePrice(body?.price),
      version: String(body?.version || ''),
      providerName: String(body?.providerName || '中国数联'),
      sourceType: 'INTERNAL',
      sourceName: String(body?.sourceName || '自研'),
      sourceUrl: body?.sourceUrl == null ? null : String(body.sourceUrl),
      externalDemoUrl: body?.externalDemoUrl == null ? null : String(body.externalDemoUrl),
      customers: body?.customers == null ? null : String(body.customers),
      cases: body?.cases == null ? null : String(body.cases),
      ownerUserId: 1,
      popularity: Number(body?.popularity) || 0,
      status: body?.status ? String(body.status) : 'ACTIVE',
      createTime: baseTime,
      updateTime: baseTime
    }
    if (!p.serviceType) p.serviceType = inferServiceType(p)
    p.name = stripExampleMark(p.name)
    p.capability = limitListText(p.capability, 8)
    p.scenarios = limitListText(p.scenarios, 4)
    store.products = Array.isArray(store.products) ? store.products : []
    store.products.unshift(p)
    store.meta.updatedAt = baseTime
    writeStore(store)
    return buildAxiosResponse(config, 200, buildApiResult(p, { message: '登记成功' }))
  }

  const adminProductUpdateMatch = path.match(/^\/admin\/products\/(\d+)$/)
  if (method === 'put' && adminProductUpdateMatch) {
    const id = Number(adminProductUpdateMatch[1])
    const p = (store.products || []).find(x => Number(x?.id) === id) || null
    if (!p) return buildAxiosResponse(config, 404, { error: '产品不存在' })
    const nextCategory = body?.category === undefined ? p.category : String(body?.category || '')

    p.name = String(body?.name ?? p.name)
    p.category = nextCategory
    p.serviceType = body?.serviceType === undefined ? p.serviceType : String(body?.serviceType || '')
    p.description = String(body?.description ?? p.description)
    p.capability = body?.capability === undefined ? p.capability : String(body?.capability || '')
    p.scenarios = body?.scenarios === undefined ? p.scenarios : String(body?.scenarios || '')
    p.price = body?.price === undefined ? p.price : normalizePrice(body?.price)
    p.version = String(body?.version ?? p.version)
    p.providerName = String(body?.providerName ?? p.providerName)
    p.sourceName = String(body?.sourceName ?? p.sourceName)
    p.sourceUrl = body?.sourceUrl === undefined ? p.sourceUrl : (body?.sourceUrl == null ? null : String(body.sourceUrl))
    p.externalDemoUrl = body?.externalDemoUrl === undefined ? p.externalDemoUrl : (body?.externalDemoUrl == null ? null : String(body.externalDemoUrl))
    p.customers = body?.customers === undefined ? p.customers : (body?.customers == null ? null : String(body.customers))
    p.cases = body?.cases === undefined ? p.cases : (body?.cases == null ? null : String(body.cases))
    p.status = body?.status === undefined ? p.status : String(body?.status || '')
    if (!p.serviceType) p.serviceType = inferServiceType(p)
    p.name = stripExampleMark(p.name)
    p.capability = limitListText(p.capability, 8)
    p.scenarios = limitListText(p.scenarios, 4)
    p.updateTime = nowISO()
    store.meta.updatedAt = p.updateTime
    writeStore(store)
    return buildAxiosResponse(config, 200, buildApiResult(p, { message: '更新成功' }))
  }

  const approveMatch = path.match(/^\/admin\/products\/(\d+)\/approve$/)
  if (method === 'put' && approveMatch) {
    const id = Number(approveMatch[1])
    const p = (store.products || []).find(x => Number(x?.id) === id) || null
    if (!p) return buildAxiosResponse(config, 404, { error: '产品不存在' })
    p.status = 'ACTIVE'
    p.updateTime = nowISO()
    store.meta.updatedAt = p.updateTime
    writeStore(store)
    return buildAxiosResponse(config, 200, buildApiResult(p, { message: '已上架' }))
  }

  const offlineMatch = path.match(/^\/admin\/products\/(\d+)\/offline$/)
  if (method === 'put' && offlineMatch) {
    const id = Number(offlineMatch[1])
    const p = (store.products || []).find(x => Number(x?.id) === id) || null
    if (!p) return buildAxiosResponse(config, 404, { error: '产品不存在' })
    p.status = 'OFFLINE'
    p.updateTime = nowISO()
    store.meta.updatedAt = p.updateTime
    writeStore(store)
    return buildAxiosResponse(config, 200, buildApiResult(p, { message: '已下架' }))
  }

  if (method === 'get' && path === '/partner/products') {
    const ownerUserId = Number(params.ownerUserId)
    const list = (store.products || []).filter(p => Number(p?.ownerUserId) === ownerUserId)
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  if (method === 'post' && path === '/partner/products') {
    const baseTime = nowISO()
    const ownerUserId = Number(body?.ownerUserId)
    if (!Number.isFinite(ownerUserId)) return buildAxiosResponse(config, 400, { error: '参数不正确' })
    const id = bumpSeq(store, 'productId')
    const p = {
      id,
      name: String(body?.name || ''),
      category: String(body?.category || ''),
      serviceType: body?.serviceType ? String(body.serviceType) : inferServiceType({ category: String(body?.category || ''), sourceType: 'PARTNER' }),
      description: String(body?.description || ''),
      capability: String(body?.capability || ''),
      scenarios: String(body?.scenarios || ''),
      price: normalizePrice(body?.price),
      version: String(body?.version || ''),
      providerName: String(body?.providerName || ''),
      sourceType: 'PARTNER',
      sourceName: String(body?.sourceName || body?.providerName || ''),
      sourceUrl: body?.sourceUrl == null ? null : String(body.sourceUrl),
      externalDemoUrl: body?.externalDemoUrl == null ? null : String(body.externalDemoUrl),
      customers: body?.customers == null ? null : String(body.customers),
      cases: body?.cases == null ? null : String(body.cases),
      ownerUserId,
      popularity: 0,
      status: 'DRAFT',
      createTime: baseTime,
      updateTime: baseTime
    }
    store.products = Array.isArray(store.products) ? store.products : []
    store.products.unshift(p)
    store.meta.updatedAt = baseTime
    writeStore(store)
    return buildAxiosResponse(config, 200, buildApiResult(p, { message: '提交成功，等待审核' }))
  }

  const partnerUpdateMatch = path.match(/^\/partner\/products\/(\d+)$/)
  if (method === 'put' && partnerUpdateMatch) {
    const id = Number(partnerUpdateMatch[1])
    const p = (store.products || []).find(x => Number(x?.id) === id) || null
    if (!p) return buildAxiosResponse(config, 404, { error: '产品不存在' })
    const ownerUserId = Number(body?.ownerUserId)
    if (Number.isFinite(ownerUserId) && Number(p.ownerUserId) !== ownerUserId) return buildAxiosResponse(config, 403, { error: '无权限编辑该产品' })

    p.name = String(body?.name ?? p.name)
    p.category = String(body?.category ?? p.category)
    p.serviceType = body?.serviceType === undefined ? p.serviceType : String(body?.serviceType || '')
    p.description = String(body?.description ?? p.description)
    p.capability = String(body?.capability ?? p.capability)
    p.scenarios = String(body?.scenarios ?? p.scenarios)
    p.price = body?.price === undefined ? p.price : normalizePrice(body?.price)
    p.version = String(body?.version ?? p.version)
    p.providerName = String(body?.providerName ?? p.providerName)
    p.sourceName = String(body?.sourceName ?? p.sourceName)
    p.sourceUrl = body?.sourceUrl === undefined ? p.sourceUrl : (body?.sourceUrl == null ? null : String(body.sourceUrl))
    p.externalDemoUrl = body?.externalDemoUrl === undefined ? p.externalDemoUrl : (body?.externalDemoUrl == null ? null : String(body.externalDemoUrl))
    p.customers = body?.customers === undefined ? p.customers : (body?.customers == null ? null : String(body.customers))
    p.cases = body?.cases === undefined ? p.cases : (body?.cases == null ? null : String(body.cases))
    p.updateTime = nowISO()
    store.meta.updatedAt = p.updateTime
    writeStore(store)
    return buildAxiosResponse(config, 200, buildApiResult(p, { message: '更新成功' }))
  }

  if (method === 'post' && path === '/ai/chat') {
    const userId = Number(body?.userId) || 1
    const message = String(body?.message || '')
    const convIdRaw = body?.conversationId
    const convId = convIdRaw == null ? null : Number(convIdRaw)
    const baseTime = nowISO()

    store.ai = store.ai && typeof store.ai === 'object' ? store.ai : { conversations: [], messages: [] }
    store.ai.conversations = Array.isArray(store.ai.conversations) ? store.ai.conversations : []
    store.ai.messages = Array.isArray(store.ai.messages) ? store.ai.messages : []

    let conv = Number.isFinite(convId) ? store.ai.conversations.find(c => Number(c?.id) === convId) : null
    if (!conv) {
      const id = bumpSeq(store, 'aiConversationId')
      conv = {
        id,
        userId,
        title: 'AI 对话',
        status: 'OPEN',
        requirementsJson: '{}',
        tags: '',
        completeness: 0,
        needsMoreInfo: true,
        nextQuestion: null,
        updateTime: baseTime,
        createTime: baseTime
      }
      store.ai.conversations.unshift(conv)
    }

    const prevReq = safeParse(conv.requirementsJson, {})
    const parsed = parseRequirementsFromText(message)
    const requirements = { ...(prevReq && typeof prevReq === 'object' ? prevReq : {}), ...(parsed || {}) }

    const missing = aiMissingKeys(requirements)
    const forceFinish = message.includes('结束对话') || message.includes('生成方案')
    const browseProductsIntent = /有哪些产品|看看.*产品|先给我看看.*产品/.test(message)
    const needsMoreInfo = !forceFinish && !browseProductsIntent && missing.length > 0
    const completeness = computeAiCompleteness(requirements)
    const nextQuestion = needsMoreInfo ? aiNextQuestion(missing) : null
    const tagsArr = buildAiTags(requirements)

    let recommendedProducts = needsMoreInfo ? [] : pickRecommendedProducts(products, requirements, 3)
    let bundles = needsMoreInfo ? [] : makeAiBundles(store.solutions || [], requirements, products)
    const recommendedSolutions = needsMoreInfo ? [] : bundles.map(b => ({
      id: b.solution?.id,
      name: b.solution?.name,
      description: b.solution?.description,
      estimatedDays: b.solution?.estimatedDays,
      priceRange: b.solution?.priceRange
    })).filter(s => s?.id != null)

    let reply = makeAiReply(requirements, missing, recommendedProducts, bundles, needsMoreInfo)
    if (!needsMoreInfo && browseProductsIntent && String(requirements?.scenario || '').includes('多式联运')) {
      const multimodalNames = ['陆路运输', '海运运输', '航空运输', '水运运输']
      const transportProducts = products.filter(p => multimodalNames.includes(String(p?.name || '')))
      if (transportProducts.length) {
        recommendedProducts = transportProducts
        bundles = []
        reply = `有${multimodalNames.join('、')}这几种产品，你可以考虑结合使用，形成“多式联运”整体方案。`
      }
    }

    conv.requirementsJson = JSON.stringify(requirements || {})
    conv.tags = tagsArr.join(',')
    conv.completeness = completeness
    conv.needsMoreInfo = needsMoreInfo
    conv.nextQuestion = nextQuestion
    conv.title = buildAiTitle(requirements)
    conv.updateTime = baseTime

    const userMsg = {
      id: bumpSeq(store, 'aiMessageId'),
      conversationId: conv.id,
      role: 'user',
      content: message,
      requirementsJson: conv.requirementsJson,
      tags: conv.tags,
      needsMoreInfo,
      nextQuestion,
      createTime: baseTime
    }
    const assistantMsg = {
      id: bumpSeq(store, 'aiMessageId'),
      conversationId: conv.id,
      role: 'assistant',
      content: reply,
      requirementsJson: conv.requirementsJson,
      tags: conv.tags,
      needsMoreInfo,
      nextQuestion,
      createTime: baseTime
    }
    store.ai.messages.push(userMsg, assistantMsg)
    store.meta.updatedAt = baseTime
    writeStore(store)

    const response = {
      conversationId: conv.id,
      reply,
      recommendedProducts,
      recommendedSolutions,
      bundles,
      requirements,
      needsMoreInfo,
      nextQuestion,
      tags: tagsArr,
      missing,
      completeness
    }

    return buildAxiosResponse(config, 200, buildApiResult(response))
  }

  if (method === 'post' && path === '/ai/recommend') {
    const requirements = body && typeof body === 'object' ? body : {}
    const recProducts = pickRecommendedProducts(products, requirements, 5)
    const recSolutions = (store.solutions || []).slice(0, 3)
    return buildAxiosResponse(config, 200, { products: recProducts, solutions: recSolutions })
  }

  if (method === 'get' && path === '/admin/ai/conversations') {
    store.ai = store.ai && typeof store.ai === 'object' ? store.ai : { conversations: [], messages: [] }
    const userId = params.userId == null ? null : Number(params.userId)
    const list = Number.isFinite(userId)
      ? (store.ai.conversations || []).filter(c => Number(c?.userId) === userId)
      : (store.ai.conversations || [])
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  const aiDetailMatch = path.match(/^\/admin\/ai\/conversations\/(\d+)$/)
  if (method === 'get' && aiDetailMatch) {
    const id = Number(aiDetailMatch[1])
    store.ai = store.ai && typeof store.ai === 'object' ? store.ai : { conversations: [], messages: [] }
    const conversation = (store.ai.conversations || []).find(c => Number(c?.id) === id) || null
    const messages = (store.ai.messages || []).filter(m => Number(m?.conversationId) === id)
    return buildAxiosResponse(config, 200, buildApiResult({ conversation, messages }))
  }

  return buildAxiosResponse(config, 404, { error: `未实现的 Mock 接口：${method.toUpperCase()} ${path}` })
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  adapter: async (config) => {
    await delay(80)
    return handleMockRequest(config)
  }
})

// 产品 API
export const productAPI = {
  list: (params) => api.get('/products', { params }),
  popular: (limit) => api.get('/products/popular', { params: { limit } }),
  detail: (id) => api.get(`/products/${id}`),
  categories: () => api.get('/products/categories')
}

// 试用 API - v1.3 核心
export const trialAPI = {
  create: (data) => api.post('/trials', data),
  detail: (id) => api.get(`/trials/${id}`),
  userTrials: (userId) => api.get(`/trials/user/${userId}`),
  feedback: (id, data) => api.post(`/trials/${id}/feedback`, data),
  extend: (id, days) => api.post(`/trials/${id}/extend`, null, { params: { days } }),
  stats: () => api.get('/trials/stats')
}

// AI API
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  recommend: (requirements) => api.post('/ai/recommend', requirements)
}

export const feedbackAPI = {
  listAll: () => api.get('/feedback/all'),
  update: (id, data) => api.put(`/feedback/${id}`, data)
}

export const adminAPI = {
  trialRequests: () => api.get('/admin/trial-requests'),
  trialRequestDetail: (trialId) => api.get(`/admin/trial-requests/${trialId}`),
  aiConversations: (params) => api.get('/admin/ai/conversations', { params }),
  aiConversationDetail: (id) => api.get(`/admin/ai/conversations/${id}`),
  listProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  pendingProducts: () => api.get('/admin/products/pending'),
  approveProduct: (id) => api.put(`/admin/products/${id}/approve`),
  offlineProduct: (id) => api.put(`/admin/products/${id}/offline`)
}

export const partnerAPI = {
  myProducts: (ownerUserId) => api.get('/partner/products', { params: { ownerUserId } }),
  createProduct: (data) => api.post('/partner/products', data),
  updateProduct: (id, data) => api.put(`/partner/products/${id}`, data)
}

export default api
