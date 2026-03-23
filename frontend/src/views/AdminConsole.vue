<template>
  <a-config-provider :locale="zhCN">
    <div class="admin-console">
    <div class="page-header">
      <h1>管理后台</h1>
      <p>试用需求收集、生态产品上架与外部体验入口</p>
    </div>

    <a-tabs v-model:activeKey="activeTab" class="admin-tabs">
         <a-tab-pane key="ai" tab="AI对话流程追溯">
      <div class="toolbar">
        <input v-model="aiKeyword" class="search" type="text" placeholder="搜索标题/标签/需求" />
        <div class="inline">
          <span class="inline-label">用户ID</span>
          <input v-model="aiUserId" class="input-sm" type="number" min="1" />
        </div>
        <button class="btn-refresh" type="button" :disabled="aiLoading" @click="loadAiConversations">
          {{ aiLoading ? '加载中...' : '刷新' }}
        </button>
      </div>

      <div v-if="!aiLoading && !aiFiltered.length && !aiError" class="secondary" style="margin: 6px 0 12px;">
        若已完成 AI 对话但此处仍为空，请确认后端已重启并已创建 ai_conversations 表。
      </div>

      <div class="table">
        <a-table
          :loading="aiLoading"
          :columns="aiColumns"
          :data-source="aiFiltered"
          :row-key="(r) => r.id"
          :scroll="{ x: 1180, y: 560 }"
          bordered
          :pagination="{ pageSize: 10 }"
        >
          <template #emptyText>{{ aiError || '暂无 AI 对话记录' }}</template>
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'title'">
              <div class="primary">{{ record.title || `会话 #${record.id}` }}</div>
              <div class="secondary">
                用户ID：{{ record.userId }}
                <a-tag class="click-tag" @click.stop="openUserPortrait(record.userId)">用户画像</a-tag>
              </div>
            </template>
            <template v-else-if="column.key === 'req'">
              <div class="primary clamp">{{ summarizeRequirements(record.requirementsJson) }}</div>
            </template>
            <template v-else-if="column.key === 'tags'">
              <template v-if="splitTags(record.tags).length">
                <a-tag v-for="t in splitTags(record.tags).slice(0, 6)" :key="t">{{ t }}</a-tag>
              </template>
              <template v-else>-</template>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="record.needsMoreInfo ? 'orange' : 'green'">
                {{ record.needsMoreInfo ? '待补充' : '可推荐' }}
              </a-tag>
              <span class="secondary" v-if="record.completeness != null">完整度 {{ record.completeness }}%</span>
            </template>
            <template v-else-if="column.key === 'time'">
              {{ formatDateTime(record.updateTime || record.createTime) }}
            </template>
            <template v-else-if="column.key === 'op'">
              <a-button size="small" type="link" @click="openAiDetail(record.id)">查看</a-button>
            </template>
          </template>
        </a-table>
      </div>

      <a-modal v-model:open="aiDetailVisible" title="AI 对话详情" width="900px" :footer="null">
        <div v-if="aiDetailLoading" class="secondary">加载中...</div>
        <template v-else>
          <div class="ai-detail-meta">
            <div class="primary">{{ aiDetail.conversation?.title || '-' }}</div>
            <div class="secondary">
              会话ID：{{ aiDetail.conversation?.id || '-' }} ｜ 用户ID：{{ aiDetail.conversation?.userId || '-' }} ｜ 完整度：{{ aiDetail.conversation?.completeness ?? '-' }}%
            </div>
            <div class="secondary">需求：{{ summarizeRequirements(aiDetail.conversation?.requirementsJson) }}</div>
            <div class="secondary">下一步追问：{{ aiDetail.conversation?.nextQuestion || '-' }}</div>
          </div>

          <div class="ai-msgs">
            <div v-for="m in aiDetail.messages" :key="m.id" class="ai-msg" :class="m.role">
              <div class="ai-msg__role">{{ m.role === 'user' ? '用户' : 'AI' }}</div>
              <div class="ai-msg__content">{{ m.content }}</div>
              <div class="ai-msg__sub">
                <span v-if="m.requirementsJson">需求：{{ summarizeRequirements(m.requirementsJson) }}</span>
                <span v-if="m.tags">｜ 标签：{{ m.tags }}</span>
                <span v-if="m.nextQuestion">｜ 追问：{{ m.nextQuestion }}</span>
              </div>
            </div>
          </div>
        </template>
      </a-modal>

      <a-modal v-model:open="portraitVisible" :title="`用户画像｜用户ID：${portraitUserId || '-'}`" width="860px" :footer="null">
        <div v-if="portraitLoading" class="secondary">加载中...</div>
        <template v-else>
          <div v-if="portraitError" class="secondary">{{ portraitError }}</div>
          <template v-else>
            <div class="portrait-grid">
              <div class="portrait-card">
                <div class="portrait-title">基础信息</div>
                <div class="kv">
                  <div class="k">姓名</div><div class="v">{{ portraitBase.name || '-' }}</div>
                  <div class="k">企业</div><div class="v">{{ portraitBase.company || '-' }}</div>
                  <div class="k">行业</div><div class="v">{{ portraitBase.industry || '-' }}</div>
                  <div class="k">岗位</div><div class="v">{{ portraitBase.jobRole || '-' }}</div>
                </div>
              </div>

              <div class="portrait-card">
                <div class="portrait-title">AI 对话</div>
                <div class="kv">
                  <div class="k">会话数</div><div class="v">{{ portraitAi.conversationCount ?? 0 }}</div>
                  <div class="k">平均完整度</div><div class="v">{{ portraitAi.avgCompleteness ?? '-' }}<span v-if="portraitAi.avgCompleteness != null">%</span></div>
                  <div class="k">最近更新时间</div><div class="v">{{ portraitAi.lastTime ? formatDateTime(portraitAi.lastTime) : '-' }}</div>
                  <div class="k">最近需求</div><div class="v">{{ portraitAi.lastRequirements || '-' }}</div>
                </div>
                <div class="tag-block">
                  <div class="tag-title">高频标签</div>
                  <div class="tag-list">
                    <template v-if="portraitAi.topTags.length">
                      <a-tag v-for="t in portraitAi.topTags" :key="t">{{ t }}</a-tag>
                    </template>
                    <template v-else>-</template>
                  </div>
                </div>
              </div>

              <div class="portrait-card">
                <div class="portrait-title">试用与反馈</div>
                <div class="kv">
                  <div class="k">试用总数</div><div class="v">{{ portraitTrial.trialTotal ?? 0 }}</div>
                  <div class="k">进行中</div><div class="v">{{ portraitTrial.runningCount ?? 0 }}</div>
                  <div class="k">已完成</div><div class="v">{{ portraitTrial.completedCount ?? 0 }}</div>
                  <div class="k">平均评分</div><div class="v">{{ portraitTrial.averageRating ?? '-' }}/5</div>
                  <div class="k">反馈数</div><div class="v">{{ portraitTrial.feedbackCount ?? 0 }}</div>
                  <div class="k">购买意向</div><div class="v">{{ portraitTrial.intentSummary || '-' }}</div>
                </div>
              </div>

              <div class="portrait-card">
                <div class="portrait-title">兴趣偏好（试用）</div>
                <div class="tag-block">
                  <div class="tag-title">产品体系</div>
                  <div class="tag-list">
                    <template v-if="portraitTrial.topSystems.length">
                      <a-tag v-for="t in portraitTrial.topSystems" :key="t">{{ t }}</a-tag>
                    </template>
                    <template v-else>-</template>
                  </div>
                </div>
                <div class="tag-block">
                  <div class="tag-title">垂类场景</div>
                  <div class="tag-list">
                    <template v-if="portraitTrial.topScenes.length">
                      <a-tag v-for="t in portraitTrial.topScenes" :key="t">{{ t }}</a-tag>
                    </template>
                    <template v-else>-</template>
                  </div>
                </div>
                <div class="tag-block">
                  <div class="tag-title">服务类型</div>
                  <div class="tag-list">
                    <template v-if="portraitTrial.topServiceTypes.length">
                      <a-tag v-for="t in portraitTrial.topServiceTypes" :key="t">{{ t }}</a-tag>
                    </template>
                    <template v-else>-</template>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </template>
      </a-modal>
      </a-tab-pane>
      <a-tab-pane key="trials" tab="（内部）产品试用管理">
      <div class="toolbar">
        <input v-model="keyword" class="search" type="text" placeholder="搜索用户/产品/方案/功能/场景" />
        <button class="btn-refresh" type="button" :disabled="loading" @click="loadTrials">
          {{ loading ? '加载中...' : '查找' }}
        </button>
      </div>

      <div class="table">
        <a-table
          :loading="loading"
          :columns="trialColumns"
          :data-source="filteredRows"
          :row-key="(r) => r.trialId"
          :scroll="{ x: 1580, y: 560 }"
          bordered
          :pagination="trialPagination"
          @change="onTrialTableChange"
        >
          <template #emptyText>暂无数据</template>
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'user'">
              <div class="flex">
                <div class="primary">{{ record.userName || record.userUsername || '-' }}</div>
                <div class="secondary">
                  <template v-if="splitTags(record.userIndustry).length">
                    <a-tag v-for="t in splitTags(record.userIndustry)" :key="t">{{ t }}</a-tag>
                  </template>
                  <template v-else>-</template>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'product'">
              <div class="inline-line">
                <span class="inline-main">{{ record.productName || '-' }}</span>
                <span class="inline-sub">(ID: {{ record.productId ?? '-' }})</span>
              </div>
            </template>
            <template v-else-if="column.key === 'solution'">
              <div class="inline-line">
                <span class="inline-main">{{ record.solutionName || '-' }}</span>
                <span class="inline-sub">(ID: {{ record.solutionId ?? '-' }})</span>
              </div>
            </template>
            <template v-else-if="column.key === 'capability'">
              <div class="primary clamp">{{ record.productCapability || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'scenarios'">
              <div class="primary clamp">{{ record.productScenarios || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'price'">
              <div class="primary">{{ record.productPrice != null ? `${record.productPrice}` : '-' }}</div>
            </template>
            <template v-else-if="column.key === 'version'">
              <div class="primary">{{ record.productVersion || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="trialStatusTagColor(record.trialStatus)">
                {{ formatTrialStatus(record.trialStatus) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'time'">
              {{ formatDateTime(record.createTime) }}
            </template>
            <template v-else-if="column.key === 'op'">
              <a-button size="small" type="link" @click="openDetail(record.trialId)">查看</a-button>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
        </a-table>
      </div>
      </a-tab-pane>


      <a-tab-pane key="ecosystem" tab="（第三方）生态产品管理">
    <div class="eco">
      <div class="toolbar">
        <input v-model="ecoKeyword" class="search" type="text" placeholder="搜索生态产品/供应商/功能/场景/客户/案例" />
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
        <a-table
          :loading="ecoLoading"
          :columns="ecoPendingColumns"
          :data-source="pendingFiltered"
          :row-key="(r) => r.id"
          :scroll="{ x: 1780, y: 260 }"
          bordered
        >
          <template #emptyText>暂无待审核产品</template>
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'product'">
              <div>
                <div class="primary">{{ record.name || '-' }}</div>
                <div class="secondary">
                  <template v-if="splitTags(record.category).length">
                    <a-tag v-for="t in splitTags(record.category)" :key="t">{{ t }}</a-tag>
                  </template>
                  <template v-else>-</template>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'provider'">
              <div class="primary">{{ record.providerName || record.sourceName || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'source'">
              <div class="primary">{{ record.sourceType || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'website'">
              <a v-if="record.sourceUrl" class="link" :href="record.sourceUrl" target="_blank" rel="noopener noreferrer">打开</a>
              <span v-else>-</span>
            </template>
            <template v-else-if="column.key === 'capability'">
              <div class="primary clamp">{{ record.capability || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'scenarios'">
              <div class="primary clamp">{{ record.scenarios || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'price'">
              <div class="primary">{{ record.price != null ? `${record.price}` : '-' }}</div>
            </template>
            <template v-else-if="column.key === 'version'">
              <div class="primary">{{ record.version || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'external'">
              <a v-if="record.externalDemoUrl" class="link" :href="record.externalDemoUrl" target="_blank" rel="noopener noreferrer">打开</a>
              <span v-else>-</span>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="productStatusTagColor(record.status)">
                {{ formatProductStatus(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'op'">
              <a-space :size="8">
                <a-button size="small" type="link" @click="openProductDetail(record)">查看</a-button>
                <a-button size="small" type="primary" @click="approve(record)">上架</a-button>
                <a-button size="small" danger @click="offline(record)">下架</a-button>
              </a-space>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
        </a-table>
      </div>

      <div class="section-title">我的提交（伙伴自助）</div>
      <div class="table">
        <a-table
          :loading="ecoLoading"
          :columns="ecoMineColumns"
          :data-source="mineFiltered"
          :row-key="(r) => r.id"
          :scroll="{ x: 1620, y: 260 }"
          bordered
        >
          <template #emptyText>暂无提交记录</template>
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.key === 'product'">
              <div>
                <div class="primary">{{ record.name || '-' }}</div>
                <div class="secondary">
                  <template v-if="splitTags(record.category).length">
                    <a-tag v-for="t in splitTags(record.category)" :key="t">{{ t }}</a-tag>
                  </template>
                  <template v-else>-</template>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'provider'">
              <div class="primary">{{ record.providerName || record.sourceName || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'source'">
              <div class="primary">{{ record.sourceType || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'website'">
              <a v-if="record.sourceUrl" class="link" :href="record.sourceUrl" target="_blank" rel="noopener noreferrer">打开</a>
              <span v-else>-</span>
            </template>
            <template v-else-if="column.key === 'external'">
              <a v-if="record.externalDemoUrl" class="link" :href="record.externalDemoUrl" target="_blank" rel="noopener noreferrer">打开</a>
              <span v-else>-</span>
            </template>
            <template v-else-if="column.key === 'customers'">
              <div class="primary clamp">{{ record.customers || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'cases'">
              <div class="primary clamp">{{ record.cases || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'price'">
              <div class="primary">{{ record.price != null ? `${record.price}` : '-' }}</div>
            </template>
            <template v-else-if="column.key === 'version'">
              <div class="primary">{{ record.version || '-' }}</div>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="productStatusTagColor(record.status)">
                {{ formatProductStatus(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'op'">
              <a-space :size="8">
                <a-button size="small" type="link" @click="openProductDetail(record)">查看</a-button>
                <a-button size="small" type="link" @click="openEdit(record)">编辑</a-button>
              </a-space>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
        </a-table>
      </div>
    </div>
      </a-tab-pane>
    </a-tabs>

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
              <div class="label">功能</div>
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
              <div class="label">功能</div>
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

    <a-modal
      v-model:open="submitVisible"
      :title="submitMode === 'create' ? '提交生态产品' : '编辑生态产品'"
      :width="600"
      ok-text="确定"
      cancel-text="取消"
      :confirm-loading="submitLoading"
      :ok-button-props="{ disabled: !submitForm.name }"
      @ok="submit"
      @cancel="closeSubmit"
    >
      <a-form layout="vertical" :model="submitForm">
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="产品名称" name="name">
              <a-input v-model:value="submitForm.name" placeholder="请输入产品名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="分类" name="category">
              <a-input v-model:value="submitForm.category" placeholder="如：运输管理/数据分析" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="供应商名称" name="providerName">
              <a-input v-model:value="submitForm.providerName" placeholder="对外展示的供应商名称" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="供应商官网（可选）" name="sourceUrl">
              <a-input v-model:value="submitForm.sourceUrl" placeholder="https://..." />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="外部体验链接（方式A）" name="externalDemoUrl">
          <a-input v-model:value="submitForm.externalDemoUrl" placeholder="https://..." />
        </a-form-item>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="功能点" name="capability">
              <a-textarea v-model:value="submitForm.capability" :rows="3" placeholder="用逗号分隔，如：路线优化,车辆调度..." />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="场景" name="scenarios">
              <a-textarea v-model:value="submitForm.scenarios" :rows="3" placeholder="用逗号分隔，如：干线运输,同城配送..." />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="案例" name="cases">
              <a-textarea v-model:value="submitForm.cases" :rows="3" placeholder="可填写典型案例" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="客户" name="customers">
              <a-textarea v-model:value="submitForm.customers" :rows="3" placeholder="可填写典型客户" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="价格（万）" name="price">
              <a-input-number v-model:value="submitForm.price" :min="0" :step="0.01" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="版本" name="version">
              <a-input v-model:value="submitForm.version" placeholder="如：v1.0" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="简介" name="description">
          <a-textarea v-model:value="submitForm.description" :rows="3" placeholder="产品简介" />
        </a-form-item>
      </a-form>
    </a-modal>
    </div>
  </a-config-provider>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { adminAPI, feedbackAPI, partnerAPI, productAPI, trialAPI } from '../api'

const activeTab = ref('trials')

const loading = ref(false)
const rows = ref([])
const keyword = ref('')

const aiLoading = ref(false)
const aiRows = ref([])
const aiKeyword = ref('')
const aiUserId = ref(null)
const aiError = ref('')
const aiDetailVisible = ref(false)
const aiDetailLoading = ref(false)
const aiDetail = reactive({
  conversation: null,
  messages: []
})

const portraitVisible = ref(false)
const portraitLoading = ref(false)
const portraitError = ref('')
const portraitUserId = ref(null)
const portraitBase = reactive({ name: '', company: '', industry: '', jobRole: '' })
const portraitAi = reactive({ conversationCount: 0, avgCompleteness: null, lastTime: null, lastRequirements: '', topTags: [] })
const portraitTrial = reactive({
  trialTotal: 0,
  runningCount: 0,
  completedCount: 0,
  averageRating: 0,
  feedbackCount: 0,
  intentSummary: '',
  topSystems: [],
  topScenes: [],
  topServiceTypes: []
})

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

const trialPagination = reactive({
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
  showTotal: (total) => `共 ${total} 条`
})

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

watch(keyword, () => {
  trialPagination.current = 1
})

const aiFiltered = computed(() => {
  const kw = aiKeyword.value.trim().toLowerCase()
  const list = aiRows.value || []
  if (!kw) return list
  return list.filter(r => {
    const parts = [
      r.title,
      r.tags,
      summarizeRequirements(r.requirementsJson)
    ].filter(Boolean)
    return parts.join(' ').toLowerCase().includes(kw)
  })
})

const trialColumns = [
  {
    title: '用户',
    key: 'user',
    width: 140,
    fixed: 'left'
  },
  {
    title: '产品',
    key: 'product',
    width: 220
  },
  {
    title: '方案',
    key: 'solution',
    width: 220
  },
  {
    title: '功能',
    key: 'capability',
  },
  {
    title: '场景',
    key: 'scenarios',
  },
  {
    title: '价格',
    key: 'price',
    width: 90
  },
  {
    title: '版本',
    key: 'version',
    width: 90
  },
  {
    title: '状态',
    dataIndex: 'trialStatus',
    key: 'status',
    width: 120
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'time',
    width: 180
  },
  {
    title: '操作',
    key: 'op',
    width: 100,
    fixed: 'right'
  }
]

const aiColumns = [
  { title: '会话', key: 'title', width: 220, fixed: 'left' },
  { title: '需求摘要', key: 'req' },
  { title: '标签', key: 'tags', width: 320 },
  { title: '状态', key: 'status', width: 160 },
  { title: '更新时间', key: 'time', width: 180 },
  { title: '操作', key: 'op', width: 80, fixed: 'right' }
]

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch (e) {
    return fallback
  }
}

function splitListText(raw) {
  const text = String(raw || '').trim()
  if (!text) return []
  return text
    .split(/[,，/、\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function topNFromCounter(counter, limit) {
  const arr = Array.from(counter.entries()).map(([k, v]) => ({ k, v }))
  arr.sort((a, b) => b.v - a.v)
  return arr.slice(0, limit).map(x => `${x.k}(${x.v})`)
}

function countByList(items, pickList) {
  const counter = new Map()
  for (const it of items || []) {
    for (const k of pickList(it)) {
      counter.set(k, (counter.get(k) || 0) + 1)
    }
  }
  return counter
}

function summarizeIntent(counter) {
  const parts = []
  const order = [
    ['PURCHASED', '已购买'],
    ['PENDING', '考虑中'],
    ['INTERESTED', '感兴趣'],
    ['NONE', '暂无兴趣']
  ]
  for (const [k, label] of order) {
    const n = counter.get(k) || 0
    if (n) parts.push(`${label}${n}`)
  }
  return parts.join(' / ')
}

async function openUserPortrait(userId) {
  const uid = Number(userId)
  portraitUserId.value = Number.isFinite(uid) ? uid : null
  portraitVisible.value = true
  portraitLoading.value = true
  portraitError.value = ''

  portraitBase.name = ''
  portraitBase.company = ''
  portraitBase.industry = ''
  portraitBase.jobRole = ''

  portraitAi.conversationCount = 0
  portraitAi.avgCompleteness = null
  portraitAi.lastTime = null
  portraitAi.lastRequirements = ''
  portraitAi.topTags = []

  portraitTrial.trialTotal = 0
  portraitTrial.runningCount = 0
  portraitTrial.completedCount = 0
  portraitTrial.averageRating = 0
  portraitTrial.feedbackCount = 0
  portraitTrial.intentSummary = ''
  portraitTrial.topSystems = []
  portraitTrial.topScenes = []
  portraitTrial.topServiceTypes = []

  try {
    const usersRaw = localStorage.getItem('demo-platform-users')
    const users = safeParse(usersRaw, [])
    const sessionRaw = localStorage.getItem('demo-platform-session')
    const session = safeParse(sessionRaw, null)
    const account = session?.account ? String(session.account) : ''
    const u = Array.isArray(users) ? users.find(x => String(x?.account || '').toLowerCase() === account.toLowerCase()) : null
    portraitBase.name = u?.name ? String(u.name) : '演示用户'
    portraitBase.company = u?.company ? String(u.company) : '演示企业'
    portraitBase.industry = u?.industry ? String(u.industry) : '物流'
    portraitBase.jobRole = u?.jobRole ? String(u.jobRole) : '-'

    const [productsRes, aiRes, trialsRes, feedbackRes] = await Promise.all([
      productAPI.list(),
      adminAPI.aiConversations({ userId: portraitUserId.value }),
      trialAPI.userTrials(portraitUserId.value),
      feedbackAPI.listAll()
    ])

    const products = productsRes?.data?.data || []
    const productMap = new Map((products || []).map(p => [Number(p?.id), p]))

    const convs = aiRes?.data?.data || []
    portraitAi.conversationCount = convs.length
    const completenesses = convs.map(c => Number(c?.completeness)).filter(n => Number.isFinite(n))
    if (completenesses.length) {
      portraitAi.avgCompleteness = Math.round((completenesses.reduce((a, b) => a + b, 0) / completenesses.length) * 10) / 10
    }
    const tagCounter = new Map()
    for (const c of convs) {
      for (const t of splitListText(c?.tags)) {
        tagCounter.set(t, (tagCounter.get(t) || 0) + 1)
      }
    }
    portraitAi.topTags = topNFromCounter(tagCounter, 10)
    const lastConv = [...convs].sort((a, b) => String(b?.updateTime || b?.createTime || '').localeCompare(String(a?.updateTime || a?.createTime || '')))[0] || null
    portraitAi.lastTime = lastConv?.updateTime || lastConv?.createTime || null
    portraitAi.lastRequirements = summarizeRequirements(lastConv?.requirementsJson) || ''

    const trials = trialsRes?.data?.data || []
    portraitTrial.trialTotal = trials.length
    portraitTrial.runningCount = trials.filter(t => String(t?.status || '').toUpperCase() === 'RUNNING').length
    portraitTrial.completedCount = trials.filter(t => String(t?.status || '').toUpperCase() === 'COMPLETED').length

    const feedbacksAll = feedbackRes?.data?.data || []
    const myFeedbacks = (feedbacksAll || []).filter(f => Number(f?.userId) === portraitUserId.value)
    portraitTrial.feedbackCount = myFeedbacks.length
    const ratings = myFeedbacks.map(f => Number(f?.rating)).filter(n => Number.isFinite(n) && n > 0)
    portraitTrial.averageRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0
    const intentCounter = new Map()
    for (const f of myFeedbacks) {
      const k = f?.purchaseIntent ? String(f.purchaseIntent) : 'NONE'
      intentCounter.set(k, (intentCounter.get(k) || 0) + 1)
    }
    portraitTrial.intentSummary = summarizeIntent(intentCounter)

    const trialProducts = trials.map(t => productMap.get(Number(t?.productId))).filter(Boolean)
    const systemCounter = countByList(trialProducts, p => [String(p?.category || '')].filter(Boolean))
    const serviceTypeCounter = countByList(trialProducts, p => [String(p?.serviceType || '')].filter(Boolean))
    const sceneCounter = countByList(trialProducts, p => splitListText(p?.scenarios))

    portraitTrial.topSystems = topNFromCounter(systemCounter, 8)
    portraitTrial.topServiceTypes = topNFromCounter(serviceTypeCounter, 8)
    portraitTrial.topScenes = topNFromCounter(sceneCounter, 10)
  } catch (e) {
    portraitError.value = e?.message ? String(e.message) : '加载失败'
  } finally {
    portraitLoading.value = false
  }
}

const ecoPendingColumns = [
  {
    title: '产品',
    key: 'product',
    width: 220,
    fixed: 'left'
  },
  {
    title: '供应商',
    key: 'provider',
    width: 160
  },
  {
    title: '来源',
    key: 'source',
    width: 120
  },
  {
    title: '供应商官网',
    key: 'website',
    width: 220
  },
  {
    title: '功能',
    key: 'capability',
    width: 220,
    ellipsis: true
  },
  {
    title: '场景',
    key: 'scenarios',
    width: 220,
    ellipsis: true
  },
  {
    title: '价格',
    key: 'price',
    width: 90
  },
  {
    title: '版本',
    key: 'version',
    width: 90
  },
  {
    title: '外部体验',
    key: 'external',
    width: 120
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120
  },
  {
    title: '操作',
    key: 'op',
    width: 160,
    fixed: 'right'
  }
]

const ecoMineColumns = [
  {
    title: '产品',
    key: 'product',
    width: 220,
    fixed: 'left'
  },
  {
    title: '供应商',
    key: 'provider',
    width: 160
  },
  {
    title: '来源',
    key: 'source',
    width: 120
  },
  {
    title: '供应商官网',
    key: 'website',
    width: 220
  },
  {
    title: '外部体验',
    key: 'external',
    width: 120
  },
  {
    title: '客户',
    key: 'customers',
    width: 200,
    ellipsis: true
  },
  {
    title: '案例',
    key: 'cases',
    width: 240,
    ellipsis: true
  },
  {
    title: '价格',
    key: 'price',
    width: 90
  },
  {
    title: '版本',
    key: 'version',
    width: 90
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120
  },
  {
    title: '操作',
    key: 'op',
    width: 140,
    fixed: 'right'
  }
]

onMounted(() => {
  loadTrials()
  loadAiConversations()
  loadEco()
  window.addEventListener('demo-ai-conversation-updated', onAiConversationUpdated)
})

onUnmounted(() => {
  window.removeEventListener('demo-ai-conversation-updated', onAiConversationUpdated)
})

function onAiConversationUpdated() {
  if (activeTab.value !== 'ai') return
  loadAiConversations()
}

watch(activeTab, (v) => {
  if (v !== 'ai') return
  loadAiConversations()
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

async function loadAiConversations() {
  aiLoading.value = true
  aiError.value = ''
  try {
    const params = {}
    const uid = Number(aiUserId.value)
    if (Number.isFinite(uid) && uid > 0) params.userId = uid
    const res = await adminAPI.aiConversations(params)
    aiRows.value = res.data.data || []
  } catch (e) {
    aiRows.value = []
    aiError.value = e?.message ? String(e.message) : '加载失败'
  }
  aiLoading.value = false
}

async function openAiDetail(id) {
  aiDetailVisible.value = true
  aiDetailLoading.value = true
  aiDetail.conversation = null
  aiDetail.messages = []

  try {
    const res = await adminAPI.aiConversationDetail(id)
    const d = res.data.data || {}
    aiDetail.conversation = d.conversation || null
    aiDetail.messages = d.messages || []
  } catch (e) {
  }

  aiDetailLoading.value = false
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

function onTrialTableChange(pagination) {
  if (!pagination) return
  trialPagination.current = pagination.current
  trialPagination.pageSize = pagination.pageSize
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

function trialStatusTagColor(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'RUNNING') return 'green'
  if (s === 'COMPLETED') return 'blue'
  if (s === 'EXPIRED') return 'red'
  if (s === 'PENDING') return 'orange'
  return 'default'
}

function productStatusTagColor(status) {
  const s = String(status || '').toUpperCase()
  if (s === 'ACTIVE') return 'green'
  if (s === 'OFFLINE') return 'red'
  if (s === 'DRAFT') return 'orange'
  return 'default'
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
  sourceType: '',
  sourceUrl: '',
  externalDemoUrl: '',
  capability: '',
  scenarios: '',
  customers: '',
  cases: '',
  price: null,
  version: '',
  description: ''
})

function resetSubmitForm() {
  submitForm.name = ''
  submitForm.category = ''
  submitForm.providerName = ''
  submitForm.sourceType = '伙伴自助'
  submitForm.sourceUrl = ''
  submitForm.externalDemoUrl = ''
  submitForm.capability = ''
  submitForm.scenarios = ''
  submitForm.customers = ''
  submitForm.cases = ''
  submitForm.price = null
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
  submitForm.sourceType = p.sourceType || ''
  submitForm.sourceUrl = p.sourceUrl || ''
  submitForm.externalDemoUrl = p.externalDemoUrl || ''
  submitForm.capability = p.capability || ''
  submitForm.scenarios = p.scenarios || ''
  submitForm.customers = p.customers || ''
  submitForm.cases = p.cases || ''
  submitForm.price = p.price != null ? Number(p.price) : null
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
      price: submitForm.price == null ? null : submitForm.price,
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
    p.sourceType,
    p.sourceName,
    p.sourceUrl,
    p.capability,
    p.scenarios,
    p.customers,
    p.cases,
    p.version
  ].filter(Boolean)
  return parts.join(' ').toLowerCase()
}

function splitTags(v) {
  const raw = String(v || '').trim()
  if (!raw) return []
  return raw
    .split(/[,/，、;\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function summarizeRequirements(requirementsJson) {
  const raw = String(requirementsJson || '').trim()
  if (!raw) return '-'
  try {
    const obj = JSON.parse(raw)
    if (!obj || typeof obj !== 'object') return '-'
    const parts = []
    if (obj.industry) parts.push(`行业:${obj.industry}`)
    if (obj.scenario) parts.push(`场景:${obj.scenario}`)
    if (obj.capability) parts.push(`功能:${obj.capability}`)
    if (obj.budget) parts.push(`预算:${obj.budget}`)
    if (obj.version) parts.push(`版本:${obj.version}`)
    if (!parts.length) return '-'
    return parts.join(' ｜ ')
  } catch (e) {
    return '-'
  }
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
</script>

<style scoped>
.admin-console { padding: 0; }
.page-header { margin-bottom: 20px; }
.page-header h1 { font-size: 24px; margin-bottom: 6px; }
.page-header p { color: #666; }

.admin-tabs :deep(.ant-tabs-nav) { margin-bottom: 14px; }

.toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.search { flex: 1; max-width: 520px; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.search:focus { outline: none; border-color: #0066ff; }
.btn-refresh { padding: 8px 16px; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; }
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
.secondary { font-size: 12px; color: #888; margin-left: 6px; }
.click-tag { margin-left: 8px; cursor: pointer; user-select: none; }
.click-tag:hover { border-color: rgba(22, 119, 255, 0.6); color: #1677ff; }
.inline-line { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.inline-main { font-size: 14px; color: #222; }
.inline-sub { font-size: 12px; color: #888; }
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

.ai-detail-meta { padding: 12px 14px; border: 1px solid rgba(5, 5, 5, 0.08); border-radius: 12px; background: #fff; margin-bottom: 12px; }
.ai-msgs { display: flex; flex-direction: column; gap: 10px; }
.ai-msg { border: 1px solid rgba(5, 5, 5, 0.08); border-radius: 12px; padding: 12px 14px; background: #fff; }
.ai-msg.user { background: rgba(114, 46, 209, 0.04); border-color: rgba(114, 46, 209, 0.18); }
.ai-msg.assistant { background: rgba(22, 119, 255, 0.03); border-color: rgba(22, 119, 255, 0.16); }
.ai-msg__role { font-weight: 800; font-size: 12px; color: #555; margin-bottom: 6px; }
.ai-msg__content { font-size: 13px; color: #222; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.ai-msg__sub { margin-top: 8px; font-size: 12px; color: #888; white-space: pre-wrap; word-break: break-word; }

.portrait-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.portrait-card { border: 1px solid rgba(5, 5, 5, 0.08); border-radius: 12px; padding: 12px 14px; background: #fff; }
.portrait-title { font-weight: 800; font-size: 13px; color: #222; margin-bottom: 10px; }
.tag-block { margin-top: 10px; }
.tag-title { font-size: 12px; color: #666; margin-bottom: 8px; font-weight: 700; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }

@media (max-width: 1100px) {
  .thead, .tr { grid-template-columns: 170px 180px 160px 1fr 130px 110px 160px 90px; }
}

@media (max-width: 720px) {
  .form-row { grid-template-columns: 1fr; }
  .portrait-grid { grid-template-columns: 1fr; }
}
</style>
