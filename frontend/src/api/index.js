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

function seedProducts() {
  const baseTime = nowISO()
  return [
    {
      id: 1,
      name: '国家级物流大数据平台（示例）',
      category: '物流行业数字化基础平台',
      description: '公共型、开放型的行业数据基础设施，提供数据汇聚、治理、共享与服务能力',
      capability: '数据汇聚,连接,数据治理,数据服务,安全运营',
      scenarios: '智慧港航,智慧口岸,智慧长江,数字仓管,网络货运,航空物流,航贸数字化,多式联运',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '物流行业可信数据空间（示例）',
      category: '物流行业数字化基础平台',
      description: '面向行业数据安全可信流通的空间底座，支持确权、脱敏、授权与审计',
      capability: '可信计算,隐私保护,数据确权,授权管理,审计追踪',
      scenarios: '智慧港航,智慧口岸,智慧长江,数字仓管,网络货运,航空物流,航贸数字化,多式联运',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '航贸数字化平台（示例）',
      category: '物流行业数字化基础平台',
      description: '面向港口航运与口岸贸易的数据交换与协同平台，提升通关与运输效率',
      capability: '舱单运单协同,节点可视,数据交换,对外协同接口',
      scenarios: '智慧港航,智慧口岸,航贸数字化,跨境物流,多式联运',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '行业智算连接底座（示例）',
      category: '物流行业数字化基础平台',
      description: '为行业应用提供算力、模型、连接与安全运营的一体化底座能力',
      capability: '智算,连接,模型服务,安全运营,弹性扩展',
      scenarios: '智慧港航,智慧口岸,智慧长江,数字仓管,网络货运,航空物流,航贸数字化,多式联运',
      price: 0,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '有效降低全社会物流成本指数数据集（示例）',
      category: '数据要素产品',
      description: '面向宏观决策与行业研判的指标数据产品，支持多维度分析与对标',
      capability: '指标体系,数据集,趋势分析,对标分析',
      scenarios: '智慧港航,智慧口岸,智慧长江,网络货运,航空物流,航贸数字化,多式联运',
      price: 3,
      version: 'v2026.1',
      providerName: '中国数联（示例）',
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
      name: '港航时效基准数据产品（示例）',
      category: '数据要素产品',
      description: '沉淀港口/航线/班轮等关键链路的时效基准数据，支撑预测与优化',
      capability: '时效基准,时效预测,拥堵分析',
      scenarios: '智慧港航,智慧长江,航贸数字化',
      price: 2,
      version: 'v2026.1',
      providerName: '中国数联（示例）',
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
      name: '口岸通关态势数据产品（示例）',
      category: '数据要素产品',
      description: '汇聚口岸与监管相关数据，形成通关态势监测与预警的数据产品',
      capability: '态势监测,风险预警,数据画像',
      scenarios: '智慧口岸,航贸数字化,跨境物流',
      price: 2,
      version: 'v2026.1',
      providerName: '中国数联（示例）',
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
      name: '运力画像与线路路由数据产品（示例）',
      category: '数据要素产品',
      description: '沉淀承运商、线路、时效与运价等数据，支持运力匹配与调度优化',
      capability: '运力画像,线路路由,运价分析,调度优化',
      scenarios: '网络货运,多式联运,航空物流',
      price: 2,
      version: 'v2026.1',
      providerName: '中国数联（示例）',
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
      name: '物流知识图谱引擎（示例）',
      category: '数智技术产品',
      description: '融合行业知识与业务实体关系，支撑智能问答、关联分析与推荐',
      capability: '知识图谱,图查询,行业知识,推荐',
      scenarios: '智慧港航,智慧口岸,智慧长江,数字仓管,网络货运,航空物流,航贸数字化,多式联运',
      price: 12,
      version: 'v2.0',
      providerName: '中国数联（示例）',
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
      name: 'OCR 票据识别 API（示例）',
      category: '数智技术产品',
      description: '提供运单/舱单/发票等票据 OCR 识别能力，支持接口级快速接入',
      capability: 'OCR,识别,API',
      scenarios: '智慧口岸,航贸数字化,数字仓管',
      price: 8,
      version: 'v1.2',
      providerName: '生态伙伴A（示例）',
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
      name: '运输路径优化算法服务（示例）',
      category: '数智技术产品',
      description: '面向城市配送与干线运输的路径规划与车辆调度优化算法服务',
      capability: '算法,优化,API',
      scenarios: '网络货运,多式联运',
      price: 15,
      version: 'v1.0',
      providerName: '生态伙伴B（示例）',
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
      name: '异常预警与时效预测模型（示例）',
      category: '数智技术产品',
      description: '基于历史链路与实时态势数据构建预测模型，支撑异常预警与时效承诺',
      capability: '模型,预测,异常预警,时效承诺',
      scenarios: '航空物流,智慧港航,智慧长江,网络货运',
      price: 18,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '智慧港航解决方案（示例）',
      category: '物流行业场景解决方案',
      description: '面向港口与航运协同的可视化、调度与异常处置解决方案',
      capability: '节点可视,拥堵分析,协同调度,异常处置',
      scenarios: '智慧港航,航贸数字化',
      price: 80,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '智慧口岸解决方案（示例）',
      category: '物流行业场景解决方案',
      description: '面向口岸通关与监管协同的态势监测、风控与通关效率提升方案',
      capability: '态势监测,风险预警,通关协同,数据共享',
      scenarios: '智慧口岸,航贸数字化',
      price: 75,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '智慧长江解决方案（示例）',
      category: '物流行业场景解决方案',
      description: '面向内河航运的态势感知、通行组织与应急联动的数字化方案',
      capability: '数字孪生,态势感知,应急联动,通行组织',
      scenarios: '智慧长江,智慧港航',
      price: 70,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '数字仓管解决方案（示例）',
      category: '物流行业场景解决方案',
      description: '面向仓配一体的库存、作业与可视化管理方案，提升仓内作业效率',
      capability: '库存可视,波次策略,异常管理,作业分析',
      scenarios: '数字仓管',
      price: 55,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '网络货运解决方案（示例）',
      category: '物流行业场景解决方案',
      description: '面向网络货运平台的运力匹配、过程可视与结算对账解决方案',
      capability: '运力匹配,在途可视,结算对账,风控',
      scenarios: '网络货运',
      price: 65,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '航空物流协同解决方案（示例）',
      category: '物流行业场景解决方案',
      description: '面向航司、机场与货代的协同网络，提升运单/舱单/状态数据交换效率',
      capability: '状态共享,节点追踪,异常预警,协同网络',
      scenarios: '航空物流,航贸数字化',
      price: 72,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '多式联运协同解决方案（示例）',
      category: '物流行业场景解决方案',
      description: '覆盖铁公水空多种运输方式的计划编排、节点追踪与异常处置协同方案',
      capability: '计划编排,节点追踪,异常处置,对外协同接口',
      scenarios: '多式联运,智慧港航,航空物流,智慧口岸',
      price: 88,
      version: 'v1.0',
      providerName: '中国数联（示例）',
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
      name: '企业供应链控制塔（示例）',
      category: '企业数智供应链产品',
      description: '面向货主企业的端到端可视、预警与协同的供应链控制塔产品',
      capability: '端到端可视,异常预警,协同调度,指标分析',
      scenarios: '智慧港航,智慧口岸,数字仓管,网络货运,航空物流,航贸数字化,多式联运',
      price: 120,
      version: 'v2.0',
      providerName: '中国数联（示例）',
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
      name: 'WMS 仓储管理系统（示例）',
      category: '企业数智供应链产品',
      description: '面向多仓协同的仓储管理系统，支持库位、波次、盘点与策略配置',
      capability: '入库,出库,库位管理,波次拣选,盘点,库存预警',
      scenarios: '数字仓管',
      price: 95,
      version: 'v2.3',
      providerName: '自研团队（示例）',
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
      name: 'TMS 运输管理系统（示例）',
      category: '企业数智供应链产品',
      description: '覆盖运输计划、承运商协同、在途可视化与结算对账的运输管理系统',
      capability: '运输计划,承运商协同,在途可视化,结算对账',
      scenarios: '网络货运,多式联运,航空物流',
      price: 110,
      version: 'v3.1',
      providerName: '自研团队（示例）',
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
      name: 'OMS 订单管理系统（示例）',
      category: '企业数智供应链产品',
      description: '订单全链路管理，支持多渠道接入、拆单合单、履约协同与对账',
      capability: '多渠道接入,拆单合单,履约协同,对账',
      scenarios: '航贸数字化,智慧口岸,数字仓管',
      price: 88,
      version: 'v1.8',
      providerName: '自研团队（示例）',
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
      name: '绿色金融与授信服务（示例）',
      category: '物流供应链增值服务',
      description: '面向物流供应链业务的金融服务与授信支持，提升资金周转效率',
      capability: '授信,结算,融资,风控',
      scenarios: '网络货运,智慧港航,航贸数字化',
      price: null,
      version: 'v1.0',
      providerName: '金融伙伴（示例）',
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
      name: '供应链保险与风控服务（示例）',
      category: '物流供应链增值服务',
      description: '提供履约保障、货损保障等保险与风控增值服务，降低业务风险',
      capability: '保险,风控,理赔协同',
      scenarios: '网络货运,航空物流,多式联运',
      price: null,
      version: 'v1.0',
      providerName: '保险伙伴（示例）',
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
      name: '运力撮合与结算服务（示例）',
      category: '物流供应链增值服务',
      description: '提供运力撮合、电子合同与结算对账等增值服务，提升交易效率',
      capability: '撮合,结算对账,电子合同',
      scenarios: '网络货运,多式联运',
      price: null,
      version: 'v1.0',
      providerName: '生态伙伴C（示例）',
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
      name: '跨境清关增值服务（示例）',
      category: '物流供应链增值服务',
      description: '面向跨境业务的清关协同、单证服务与合规咨询等增值服务',
      capability: '清关协同,单证服务,合规咨询',
      scenarios: '智慧口岸,航贸数字化',
      price: null,
      version: 'v1.0',
      providerName: '生态伙伴D（示例）',
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
    }
  ]
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
      productIds: [1, 2, 3, 4, 11, 19, 22],
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
  if (existing) return existing

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
  const url = product?.externalDemoUrl
  if (url) return String(url)
  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : ''
  return `${origin}/#/products/${product?.id || ''}?trial=${trialId}`
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
  if (m === 'capability') return '您最关注的能力点是？例如：库存/拣选/在途/对账'
  if (m === 'budget') return '预算范围大概是多少？例如：50万以内/80-200万'
  return '为了更准确推荐，能再补充一些需求吗？'
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
    for (const p of parts.slice(0, 6)) tags.push(`能力:${p}`)
  }
  return Array.from(new Set(tags)).slice(0, 12)
}

function buildAiTitle(requirements) {
  const r = requirements && typeof requirements === 'object' ? requirements : {}
  const parts = [r.industry, r.scenario].filter(Boolean)
  return parts.length ? parts.join('-') : 'AI 对话'
}

function makeAiBundles(store, requirements, products) {
  const solutions = Array.isArray(store.solutions) ? store.solutions : []
  const picked = solutions.slice(0, 2).map(s => {
    const ps = (s.productIds || []).map(id => products.find(p => p.id === id)).filter(Boolean)
    const fallback = ps.length ? ps : products.slice(0, 3)
    return {
      solution: {
        id: s.id,
        name: s.name,
        description: s.description,
        estimatedDays: s.estimatedDays,
        priceRange: s.priceRange
      },
      products: fallback.slice(0, 4),
      highlights: {
        行业: requirements.industry || '通用',
        场景: requirements.scenario || '综合'
      }
    }
  })
  return picked
}

function makeAiReply(requirements, missing, recommendedProducts, bundles, needsMoreInfo) {
  if (needsMoreInfo) {
    return `为了给您推荐更合适的产品/方案，我还需要了解：\n- ${missing.join(' / ')}\n\n${aiNextQuestion(missing)}`
  }
  const productNames = (recommendedProducts || []).map(p => p.name).filter(Boolean).slice(0, 6)
  const bundleNames = (bundles || []).map(b => b?.solution?.name).filter(Boolean).slice(0, 4)
  const summary = [
    requirements.industry ? `行业：${requirements.industry}` : null,
    requirements.scenario ? `场景：${requirements.scenario}` : null,
    requirements.capability ? `能力：${requirements.capability}` : null,
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
    const feedback = (store.feedbacks || []).find(f => Number(f?.trialId) === id) || null
    const detail = { trial, feedback }
    return buildAxiosResponse(config, 200, buildApiResult(detail))
  }

  const userTrialsMatch = path.match(/^\/trials\/user\/(\d+)$/)
  if (method === 'get' && userTrialsMatch) {
    const userId = Number(userTrialsMatch[1])
    const list = (store.trials || []).filter(t => Number(t?.userId) === userId)
    return buildAxiosResponse(config, 200, buildApiResult(list, { total: list.length }))
  }

  const trialFeedbackMatch = path.match(/^\/trials\/(\d+)\/feedback$/)
  if (method === 'post' && trialFeedbackMatch) {
    const trialId = Number(trialFeedbackMatch[1])
    const trial = (store.trials || []).find(t => Number(t?.id) === trialId) || null
    if (!trial) return buildAxiosResponse(config, 404, { error: '试用不存在' })
    const userId = Number(body?.userId)
    const rating = Number(body?.rating)
    if (!Number.isFinite(userId) || !Number.isFinite(rating) || rating <= 0) {
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
    const needsMoreInfo = !forceFinish && missing.length > 0
    const completeness = computeAiCompleteness(requirements)
    const nextQuestion = needsMoreInfo ? aiNextQuestion(missing) : null
    const tagsArr = buildAiTags(requirements)

    const recommendedProducts = needsMoreInfo ? [] : pickRecommendedProducts(products, requirements, 3)
    const recommendedSolutions = needsMoreInfo ? [] : (store.solutions || []).slice(0, 2).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      estimatedDays: s.estimatedDays,
      priceRange: s.priceRange
    }))
    const bundles = needsMoreInfo ? [] : makeAiBundles(store, requirements, recommendedProducts.length ? recommendedProducts : products.slice(0, 4))

    const reply = makeAiReply(requirements, missing, recommendedProducts, bundles, needsMoreInfo)

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
