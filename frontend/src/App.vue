<template>
  <div class="app">
    <header class="header">
      <div class="header-content">
        <div class="logo-module" @click="goHome">
          <img src="@/assets/icons/logo.svg" alt="Logo" class="logo" />
          <span class="title">动态门户</span>
      </div>
        <nav class="nav">
          <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">首页</router-link>
          <router-link to="/products" class="nav-link" :class="{ active: $route.path.startsWith('/products') }">产品库</router-link>
          <router-link to="/trial" class="nav-link" :class="{ active: $route.path === '/trial' }">我的工作台</router-link>
          <router-link to="/admin" class="nav-link" :class="{ active: $route.path === '/admin' }">管理后台</router-link>
        </nav>
        <div class="user-info">
          <template v-if="currentUser">
            <span class="user-name">{{ currentUser.name }}</span>
            <span class="role-badge">{{ currentUser.jobRole }}</span>
            <button class="btn-auth ghost" type="button" @click="logout">退出</button>
          </template>
          <template v-else>
            <button class="btn-auth ghost" type="button" @click="openAuth('login')">登录</button>
            <button class="btn-auth primary" type="button" @click="openAuth('register')">注册</button>
          </template>
        </div>
      </div>
    </header>
    
    <main class="main">
      <router-view />
    </main>

    <div class="ai-fab">
      <div v-if="aiChatOpen && aiChatCollapsed" class="ai-mini" role="dialog" aria-label="AI 顾问">
        <div class="ai-mini__header">
          <div class="ai-mini__title">
            <span class="ai-mini__title-icon" aria-hidden="true">
              <img class="ai-robot" :src="robotIcon" alt="" />
            </span>
            <div class="ai-mini__title-text">
              <div class="ai-mini__title-main">AI智能顾问</div>
              <div class="ai-mini__title-sub">24 小时在线服务</div>
            </div>
          </div>
          <div class="ai-mini__actions">
            <button class="ai-icon-btn" type="button" aria-label="展开" @click="expandAiChat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
            </button>
            <button class="ai-icon-btn" type="button" aria-label="关闭" @click="closeAiChat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="aiChatOpen" class="ai-panel" role="dialog" aria-label="AI 顾问">
        <div class="ai-panel__header">
          <div class="ai-panel__title">
            <span class="ai-panel__title-icon" aria-hidden="true">
              <img class="ai-robot" :src="robotIcon" alt="" />
            </span>
            <span>AI 智能顾问</span>
          </div>
          <div class="ai-panel__actions">
            <button class="ai-icon-btn" type="button" aria-label="新对话" @click="resetAiChat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
            </button>
            <button class="ai-icon-btn" type="button" aria-label="收起" @click="collapseAiChat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 3H3v6" />
                <path d="M15 21h6v-6" />
                <path d="M3 3l7 7" />
                <path d="M21 21l-7-7" />
              </svg>
            </button>
            <button class="ai-icon-btn danger" type="button" aria-label="关闭" @click="closeAiChat">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div class="ai-panel__body">
          <AIChat ref="aiChatRef" :embedded="true" :showSidebar="false" />
        </div>
      </div>

      <div v-if="aiGuideVisible && !aiChatOpen" class="ai-guide" role="note" aria-label="AI 助手引导">
        <div class="ai-guide__header">
          <div class="ai-guide__title">
            <span class="ai-guide__title-icon" aria-hidden="true">
              <img class="ai-robot" :src="robotIcon" alt="" />
            </span>
            <div class="ai-guide__title-text">
              <div class="ai-guide__title-main">AI智能顾问</div>
              <div class="ai-guide__title-sub">24 小时在线服务</div>
            </div>
          </div>
          <button class="ai-icon-btn ai-guide__close" type="button" aria-label="关闭引导" @click="dismissAiGuide">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="ai-guide__body">
          <div class="ai-guide__chips">
            <button class="ai-chip" type="button" @click="askAiFromGuide('产品有哪些？')">产品有哪些？</button>
            <button class="ai-chip" type="button" @click="askAiFromGuide('适用什么场景？')">适用什么场景？</button>
          </div>
        </div>
      </div>

      <button
        v-if="!aiChatOpen"
        class="ai-bubble"
        type="button"
        aria-label="打开 AI 顾问"
        @click="openAiChat"
      >
        <span class="ai-bubble__icon" aria-hidden="true">
          <img class="ai-robot" :src="robotIcon" alt="" />
        </span>
        <span class="ai-bubble__text"></span>
        <span class="ai-bubble__dot" aria-hidden="true"></span>
      </button>
    </div>

    <div v-if="authVisible" class="modal-overlay" @click="closeAuth">
      <div class="modal" :class="{ register: authTab === 'register', login: authTab === 'login' }" @click.stop>
        <div class="modal-header">
          <h3>{{ authTab === 'login' ? '登录' : '注册' }}</h3>
          <button class="close-btn" type="button" @click="closeAuth">×</button>
        </div>

        <div class="modal-body">
          <!-- <div class="tabs">
            <button class="tab" :class="{ active: authTab === 'login' }" type="button" @click="switchAuthTab('login')">登录</button>
            <button class="tab" :class="{ active: authTab === 'register' }" type="button" @click="switchAuthTab('register')">注册</button>
          </div> -->

          <div v-if="authTab === 'login'" class="form">
            <div class="form-row">
              <div class="form-group full">
                <label>手机号或邮箱</label>
                <input v-model="loginForm.account" class="input" type="text" placeholder="请输入手机号或邮箱" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full">
                <label>密码</label>
                <input v-model="loginForm.password" class="input" type="password" placeholder="请输入密码" />
              </div>
            </div>
            <div v-if="authError" class="error">{{ authError }}</div>
          </div>

          <div v-else class="form">
            <div class="form-row">
               <div class="form-group">
                <label>用户名</label>
                <input v-model="registerForm.name" class="input" type="text" placeholder="方便我们联系您" />
              </div>
              <div class="form-group">
                <label>密码</label>
                <input v-model="registerForm.password" class="input" type="password" placeholder="设置密码" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>手机号或邮箱</label>
                <input v-model="registerForm.account" class="input" type="text" placeholder="手机号或邮箱" />
              </div>
              <div class="form-group">
                <label>行业</label>
                <input v-model="registerForm.industry" class="input" type="text" placeholder="如：物流/电商/制造" />
              </div>
            </div>

            <div class="form-row">
               <div class="form-group">
                <label>公司名称</label>
                <input v-model="registerForm.company" class="input" type="text" placeholder="用于线索归属与去重" />
              </div>
              <div class="form-group">
                <label>角色/岗位</label>
                <select v-model="registerForm.jobRole" class="select">
                  <option value="" disabled>请选择</option>
                  <option value="业务负责人">业务负责人</option>
                  <option value="IT">IT</option>
                  <option value="采购">采购</option>
                  <option value="运营">运营</option>
                </select>
              </div>
             
            </div>

            <div v-if="authError" class="error">{{ authError }}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-footer ghost" type="button" @click="closeAuth">取消</button>
          <button
            v-if="authTab === 'login'"
            class="btn-footer primary"
            type="button"
            :disabled="authLoading"
            @click="login"
          >
            {{ authLoading ? '登录中...' : '确定' }}
          </button>
          <button
            v-else
            class="btn-footer primary"
            type="button"
            :disabled="authLoading"
            @click="register"
          >
            {{ authLoading ? '注册中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref, nextTick } from 'vue'
import AIChat from './views/AIChat.vue'
import { useRouter } from 'vue-router'
import robotIcon from '@/assets/icons/robot.png'

const USERS_KEY = 'demo-platform-users'
const SESSION_KEY = 'demo-platform-session'

const currentUser = ref(null)

const authVisible = ref(false)
const authTab = ref('login')
const authLoading = ref(false)
const authError = ref('')

const loginForm = reactive({
  account: '',
  password: ''
})

const registerForm = reactive({
  account: '',
  password: '',
  name: '',
  company: '',
  jobRole: '',
  industry: ''
})

const aiChatOpen = ref(false)
const aiChatCollapsed = ref(false)
const aiChatRef = ref(null)
const aiGuideVisible = ref(true)

const router = useRouter()

const openAiChatEventHandler = (e) => {
  openAiChat()
  const msg = e?.detail?.message
  if (!msg) return
  nextTick(() => {
    aiChatRef.value?.sendMessage?.(msg)
  })
}

onMounted(() => {
  aiGuideVisible.value = true
  window.addEventListener('demo-open-ai-chat', openAiChatEventHandler)
  const session = readSession()
  if (!session?.account) return
  const u = findUser(session.account)
  if (u) currentUser.value = sanitizeUser(u)
})

onUnmounted(() => {
  window.removeEventListener('demo-open-ai-chat', openAiChatEventHandler)
})

function openAiChat() {
  aiChatOpen.value = true
  aiChatCollapsed.value = false
  dismissAiGuide()
  nextTick(() => {
    aiChatRef.value?.resetConversation?.()
  })
}

function closeAiChat() {
  aiChatOpen.value = false
  aiChatCollapsed.value = false
}

function collapseAiChat() {
  aiChatCollapsed.value = true
}

function expandAiChat() {
  aiChatCollapsed.value = false
}

async function askAi(text) {
  aiChatOpen.value = true
  aiChatCollapsed.value = false
  dismissAiGuide()
  await nextTick()
  aiChatRef.value?.resetConversation?.()
  await nextTick()
  aiChatRef.value?.sendMessage?.(text)
}

function resetAiChat() {
  aiChatRef.value?.resetConversation?.()
}

function dismissAiGuide() {
  aiGuideVisible.value = false
}

function askAiFromGuide(text) {
  dismissAiGuide()
  askAi(text)
}

function goHome() {
  router.push('/')
}

function openAuth(tab) {
  authError.value = ''
  authLoading.value = false
  if (tab === 'login') resetLoginForm()
  if (tab === 'register') resetRegisterForm()
  authTab.value = tab
  authVisible.value = true
}

function closeAuth() {
  authVisible.value = false
  authError.value = ''
  authLoading.value = false
  resetLoginForm()
  resetRegisterForm()
}

function logout() {
  localStorage.removeItem(SESSION_KEY)
  currentUser.value = null
}

function resetLoginForm() {
  loginForm.account = ''
  loginForm.password = ''
}

function resetRegisterForm() {
  registerForm.account = ''
  registerForm.password = ''
  registerForm.name = ''
  registerForm.company = ''
  registerForm.jobRole = ''
  registerForm.industry = ''
}

async function login() {
  authError.value = ''
  const account = normalizeAccount(loginForm.account)
  const password = String(loginForm.password || '')
  if (!account) {
    authError.value = '请输入手机号或邮箱'
    return
  }
  if (!password) {
    authError.value = '请输入密码'
    return
  }

  const u = findUser(account)
  if (!u) {
    authError.value = '账号不存在，请先注册'
    return
  }

  authLoading.value = true
  try {
    const pwd = await hashPassword(password)
    if (pwd !== u.passwordHash) {
      authError.value = '账号或密码不正确'
      return
    }
    writeSession({ account })
    currentUser.value = sanitizeUser(u)
    closeAuth()
    loginForm.password = ''
  } finally {
    authLoading.value = false
  }
}

async function register() {
  authError.value = ''
  const account = normalizeAccount(registerForm.account)
  const password = String(registerForm.password || '')
  const name = String(registerForm.name || '').trim()
  const company = String(registerForm.company || '').trim()
  const jobRole = String(registerForm.jobRole || '').trim()
  const industry = String(registerForm.industry || '').trim()

  if (!account) {
    authError.value = '请输入手机号或邮箱'
    return
  }
  if (!password || password.length < 6) {
    authError.value = '密码至少6位'
    return
  }
  if (!name) {
    authError.value = '请输入姓名'
    return
  }
  if (!company) {
    authError.value = '请输入公司名称'
    return
  }
  if (!jobRole) {
    authError.value = '请选择角色/岗位'
    return
  }

  const users = readUsers()
  if (users.some(u => String(u.account).toLowerCase() === account.toLowerCase())) {
    authError.value = '该账号已注册'
    return
  }

  authLoading.value = true
  try {
    const passwordHash = await hashPassword(password)
    const u = {
      account,
      passwordHash,
      name,
      company,
      jobRole,
      industry,
      createdAt: Date.now()
    }
    users.push(u)
    writeUsers(users)
    writeSession({ account })
    currentUser.value = sanitizeUser(u)
    closeAuth()
    registerForm.password = ''
  } finally {
    authLoading.value = false
  }
}

function normalizeAccount(v) {
  const s = String(v || '').trim()
  if (!s) return ''
  return s
}

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch (e) {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users || []))
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session || {}))
}

function findUser(account) {
  const users = readUsers()
  return users.find(u => String(u.account).toLowerCase() === String(account).toLowerCase()) || null
}

function sanitizeUser(u) {
  return {
    account: u.account,
    name: u.name,
    company: u.company,
    jobRole: u.jobRole,
    industry: u.industry
  }
}

async function hashPassword(password) {
  const text = String(password || '')
  if (!text) return ''
  const cryptoObj = window.crypto
  if (cryptoObj?.subtle?.digest) {
    const data = new TextEncoder().encode(text)
    const digest = await cryptoObj.subtle.digest('SHA-256', data)
    return bufferToHex(digest)
  }
  return btoa(encodeURIComponent(text))
}

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer)
  let hex = ''
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0')
  }
  return hex
}
</script>

<style>
.app { min-height: 100vh; }
.logo-module{   
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer; 
}
  .logo {
    height: 32px;
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    transition: color 0.3s;
  }

.header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; }
.header-content { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
.logo { display: flex; align-items: center; gap: 8px; }
.logo-icon { font-size: 24px; }
.logo-text { font-size: 18px; font-weight: 600; color: #1a1a2e; }
.nav { display: flex; gap: 8px; }
.nav-link { padding: 8px 16px;  text-decoration: none; color: #666; font-size: 16px; transition: all 0.2s; font-weight: 500;}
.nav-link:hover { border-bottom: 2px solid #1677ff;}
.nav-link.active { color: #1677ff;   border-bottom: 2px solid #1677ff;}

.user-info { display: inline-flex; align-items: center; gap: 10px; }
.user-name { font-size: 13px; color: #333; font-weight: 600; }
.role-badge { padding: 4px 12px; background: #f0f0f0; border-radius: 12px; font-size: 12px; color: #666; }
.main { max-width: 1200px; margin: 0 auto; padding: 24px; background: #fff;}

.btn-auth { height: 32px; padding: 0 14px; border-radius: 4px; border: 1px solid #e0e0e0; background: #fff; color: #333; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; }
.btn-auth.primary { background: #1677ff; border-color: #1677ff; color: #fff; box-shadow: 0 6px 16px rgba(0, 102, 255, 0.18); }
.btn-auth.ghost { background: #fff; }
.btn-auth:hover { opacity: 0.92; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;  }
.modal { background: #fff; border-radius: 12px; width: 92%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal.register { max-width: 720px; }
.modal-header { padding: 18px 20px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
.modal-header h3 { font-size: 16px; }
.close-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: #999; }
.modal-body { padding: 18px 20px; }
.modal-footer { padding: 14px 20px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }

.tabs { display: flex; gap: 10px; margin-bottom: 14px; }
.tab { padding: 8px 12px; border-radius: 10px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; font-size: 13px; color: #333; }
.tab.active { border-color: #1677ff; color: #1677ff; background: #e8f4ff; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 13px; color: #333; }
.input, .select { width: 100%; padding: 10px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 14px; }
.input:focus, .select:focus { outline: none; border-color: #1677ff; }
.error { margin-top: 10px; color: #ff4d4f; font-size: 13px; }

input::placeholder,
textarea::placeholder,
.ant-input::placeholder,
.ant-input-affix-wrapper input::placeholder,
.ant-input-number-input::placeholder,
.ant-select-selection-search-input::placeholder {
  color: #d9d9d9;
}
.ant-select-selection-placeholder { color: #d9d9d9; }

.btn-footer { height: 40px; padding: 0 16px; border-radius: 10px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; }
.btn-footer.primary { border-color: #1677ff; background: #1677ff; color: #fff; }
.btn-footer.ghost { background: #fff; }
.btn-footer:disabled { opacity: 0.6; cursor: not-allowed; }

.ai-fab { position: fixed; right: 24px; bottom: 24px; z-index: 900; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }

.ai-bubble { display: inline-flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 999px; border: none; background: linear-gradient(135deg, #ff4d4f 0%, #ffa940 55%); color: #fff; cursor: pointer; box-shadow: 0 12px 30px rgba(255, 77, 79, 0.26); transition: transform 0.2s, box-shadow 0.2s; position: relative; }
.ai-bubble:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(255, 77, 79, 0.32); }
.ai-bubble:active { transform: translateY(0); }
.ai-bubble__icon { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.16); display: inline-flex; align-items: center; justify-content: center; font-size: 18px; }
.ai-bubble__text { font-weight: 700; font-size: 14px; letter-spacing: 0.5px; white-space: nowrap; }
.ai-bubble__dot { width: 10px; height: 10px; border-radius: 50%; background: #ff4d4f; box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.6); animation: aiPulse 1.6s infinite; }
.ai-robot { width: 20px; height: 20px; display: block; object-fit: contain; }

@keyframes aiPulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.55); }
  70% { box-shadow: 0 0 0 10px rgba(255, 77, 79, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 77, 79, 0); }
}

.ai-panel { width: 420px; height: 800px; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 18px 50px rgba(0,0,0,0.18); border: 1px solid rgba(5, 5, 5, 0.08); display: flex; flex-direction: column; }

.ai-panel__header { height: 52px; padding: 30px 14px; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #ff4d4f 0%, #f79319); border-bottom: 1px solid rgba(5, 5, 5, 0.06); }
.ai-panel__title { display: inline-flex; align-items: center; gap: 10px; font-weight: 900; color: #ffffff; }
.ai-panel__title-icon { width: 30px; height: 30px; border-radius: 10px; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; justify-content: center; }
.ai-panel__actions { display: inline-flex; align-items: center; gap: 8px; }

.ai-icon-btn { width: 32px; height: 32px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.22);  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;  
    background: rgba(255, 255, 255, 0.16);
    color: #fff;
}
.ai-icon-btn:hover { border-color: #fff; }
.ai-icon-btn.danger:hover { border-color: #fff; }

.ai-panel__actions .ai-icon-btn { position: relative; }
.ai-panel__actions .ai-icon-btn::after {
  content: attr(aria-label);
  position: absolute;
  left: 50%;
  top: calc(100% + 10px);
  transform: translateX(-50%) translateY(-2px);
  background: rgba(17, 17, 17, 0.92);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 10px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease, transform 0.12s ease;
  z-index: 1200;
}
.ai-panel__actions .ai-icon-btn::before {
  content: "";
  position: absolute;
  left: 50%;
  top: calc(100% + 4px);
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(17, 17, 17, 0.92);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s ease;
  z-index: 1200;
}
.ai-panel__actions .ai-icon-btn:hover::after,
.ai-panel__actions .ai-icon-btn:focus-visible::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.ai-panel__actions .ai-icon-btn:hover::before,
.ai-panel__actions .ai-icon-btn:focus-visible::before {
  opacity: 1;
}

.ai-panel__body { flex: 1; min-height: 0; overflow: hidden; background: #f6f7fb; }
.ai-panel__body :deep(.ai-chat) { height: 100%; }
.ai-panel__body :deep(.chat-container) { height: 100%; min-height: 0; }
.ai-panel__body :deep(.chat-main) { min-height: 0; }
.ai-panel__body :deep(.messages) { min-height: 0; }

.ai-guide { width: 300px; border-radius: 14px; overflow: hidden; box-shadow: 0 18px 50px rgba(0,0,0,0.18); border: 1px solid rgba(5, 5, 5, 0.08); background: #fff; position: relative; }
.ai-guide::after { content: ""; position: absolute; right: 28px; bottom: -10px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid #fff; filter: drop-shadow(0 6px 10px rgba(0,0,0,0.12)); }
.ai-guide__header { padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #ff4d4f 0%, #f79319); color: #fff; }
.ai-guide__title { display: inline-flex; align-items: center; gap: 10px; }
.ai-guide__title-icon { width: 34px; height: 34px; border-radius: 12px; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; justify-content: center; font-size: 18px; }
.ai-guide__title-text { display: flex; flex-direction: column; line-height: 1.1; }
.ai-guide__title-main { font-weight: 900; font-size: 16px; }
.ai-guide__title-sub { font-weight: 600; font-size: 12px; opacity: 0.9; margin-top: 4px; }
.ai-guide__header .ai-icon-btn { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.22); color: #fff; }
.ai-guide__header .ai-icon-btn:hover { border-color: rgba(255,255,255,0.8); color: #fff; }
.ai-guide__body { padding: 14px; }
.ai-guide__chips { display: flex; gap: 10px; flex-wrap: wrap; }

.ai-mini { width: 360px; border-radius: 14px; overflow: hidden; box-shadow: 0 18px 50px rgba(0,0,0,0.18); border: 1px solid rgba(5, 5, 5, 0.08); background: #fff; }
.ai-mini__header { padding: 24px 14px; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, #ff4d4f 0%, #f79319); color: #fff; }
.ai-mini__title { display: inline-flex; align-items: center; gap: 10px; }
.ai-mini__title-icon { width: 34px; height: 34px; border-radius: 12px; background: rgba(255,255,255,0.2); display: inline-flex; align-items: center; justify-content: center; font-size: 18px; }
.ai-mini__title-text { display: flex; flex-direction: column; line-height: 1.1; }
.ai-mini__title-main { font-weight: 900; font-size: 16px; }
.ai-mini__title-sub { font-weight: 600; font-size: 12px; opacity: 0.9; margin-top: 4px; }
.ai-mini__actions { display: inline-flex; align-items: center; gap: 8px; }
.ai-mini__header .ai-icon-btn { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.22); color: #fff; }
.ai-mini__header .ai-icon-btn:hover { border-color: rgba(255,255,255,0.8); color: #fff; }

.ai-chip { padding: 10px 14px; border-radius: 999px; border: 1px solid rgba(5, 5, 5, 0.08); background: #f7f8fb; cursor: pointer; font-size: 12px; font-weight: 700; color: #ff2e63; }
.ai-chip:hover { border-color: rgba(255, 46, 99, 0.5); background: rgba(255, 46, 99, 0.08); }

@media (max-width: 720px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
