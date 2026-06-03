<template>
  <div id="app-container">
    <nav v-if="isAuthenticated" class="sidebar glass-panel">
      <div class="brand">
        <div class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <h2>CampusGuard</h2>
      </div>
      
      <div class="nav-links">
        <template v-if="role === 'BAO_VE'">
          <router-link to="/" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            Giám sát trực tiếp
          </router-link>
          
          <router-link to="/history" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0118 0z"></path>
            </svg>
            Lịch sử / Sửa lỗi
          </router-link>
        </template>
        
        <template v-if="role === 'QUAN_LY'">
          <router-link to="/stats" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Báo cáo thống kê
          </router-link>

          <router-link to="/staff" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Quản lý nhân viên
          </router-link>

          <router-link to="/vehicles" class="nav-item" active-class="active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="11" width="22" height="8" rx="2"></rect>
              <path d="M4 11V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"></path>
              <circle cx="6" cy="15" r="2"></circle>
              <circle cx="18" cy="15" r="2"></circle>
            </svg>
            Danh sách phương tiện
          </router-link>
        </template>
      </div>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar">{{ role === 'QUAN_LY' ? 'QL' : 'BV' }}</div>
          <div>
            <div class="name">{{ username || (role === 'QUAN_LY' ? 'Quản lý' : 'Bảo vệ') }}</div>
            <div class="status">Đang trực</div>
          </div>
        </div>
        <button @click="logout" class="btn btn-outline logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"></path>
          </svg>
          Đăng xuất
        </button>
      </div>
    </nav>
    
    <main class="main-content" :class="{ 'full-width': !isAuthenticated }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Khởi tạo các trạng thái Reactive đọc dữ liệu từ LocalStorage
const isAuthenticated = ref(localStorage.getItem('auth') === 'true')
const role = ref(localStorage.getItem('role') || '')
const username = ref(localStorage.getItem('username') || '')

// Hàm cập nhật dữ liệu từ localStorage
const updateAuthState = () => {
  isAuthenticated.value = localStorage.getItem('auth') === 'true'
  role.value = localStorage.getItem('role') || ''
  username.value = localStorage.getItem('username') || ''
}

// Lắng nghe sự kiện storage khi đăng nhập hoặc đăng xuất từ tab khác
onMounted(() => {
  window.addEventListener('storage', updateAuthState)
})

onUnmounted(() => {
  window.removeEventListener('storage', updateAuthState)
})

// Hàm xử lý đăng xuất hệ thống
const logout = () => {
  localStorage.removeItem('auth')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  isAuthenticated.value = false
  role.value = ''
  username.value = ''
  router.push('/login')
}
</script>

<style scoped>
/* Khung chứa layout chính toàn hệ thống */
#app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: radial-gradient(circle at top right, #1e293b, #0f172a);
}

/* Thanh Sidebar bên trái phong cách nền kính mờ */
.sidebar {
  width: 280px;
  height: calc(100vh - 32px);
  margin: 16px;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

/* Khối nhận diện thương hiệu đồ án */
.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.brand h2 {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(to right, #fff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Danh sách các link điều hướng */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: var(--text-muted);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

/* Hiệu ứng sáng xanh khi router tương ứng đang active */
.nav-item.active {
  background: rgba(59, 130, 246, 0.15);
  color: var(--primary);
  border-left: 3px solid var(--primary);
}

/* Chân trang Sidebar */
.sidebar-footer {
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--primary);
}

.name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
}

.status {
  font-size: 0.8rem;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Đèn LED nhấp nháy trạng thái Đang trực */
.status::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--success);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--success);
}

.logout-btn {
  width: 100%;
  font-size: 0.9rem;
}

/* Vùng hiển thị màn hình chính */
.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto; /* Cho phép cuộn dọc mượt mà ở màn hình chính */
  padding: 16px 16px 16px 0;
}

/* Full chiều rộng khi chưa đăng nhập (Màn hình Login) */
.main-content.full-width {
  padding: 0;
}
</style>