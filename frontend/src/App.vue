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
          <router-link to="/ai-chat" class="nav-link" :class="{ active: $route.path === '/ai-chat' }">AI 顾问</router-link>
          <router-link to="/trial" class="nav-link" :class="{ active: $route.path === '/trial' }">试用工作台</router-link>
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
                <label>手机号或邮箱</label>
                <input v-model="registerForm.account" class="input" type="text" placeholder="手机号或邮箱" />
              </div>
              <div class="form-group">
                <label>密码</label>
                <input v-model="registerForm.password" class="input" type="password" placeholder="设置密码" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>姓名</label>
                <input v-model="registerForm.name" class="input" type="text" placeholder="方便我们联系您" />
              </div>
              <div class="form-group">
                <label>公司名称</label>
                <input v-model="registerForm.company" class="input" type="text" placeholder="用于线索归属与去重" />
              </div>
            </div>

            <div class="form-row">
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
              <div class="form-group">
                <label>行业</label>
                <input v-model="registerForm.industry" class="input" type="text" placeholder="如：物流/电商/制造" />
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
import { onMounted, reactive, ref } from 'vue'

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

onMounted(() => {
  const session = readSession()
  if (!session?.account) return
  const u = findUser(session.account)
  if (u) currentUser.value = sanitizeUser(u)
})

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
.header-content { max-width: 1400px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
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
.main { max-width: 1400px; margin: 0 auto; padding: 24px; background: #fff;}

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

.btn-footer { height: 40px; padding: 0 16px; border-radius: 10px; border: 1px solid #e0e0e0; background: #fff; cursor: pointer; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; }
.btn-footer.primary { border-color: #1677ff; background: #1677ff; color: #fff; }
.btn-footer.ghost { background: #fff; }
.btn-footer:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 720px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
