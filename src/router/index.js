import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import HistoryView from '../views/HistoryView.vue'
import StatsView from '../views/StatsView.vue'
import StaffManagerView from '../views/StaffView.vue'
import VehicleView from '../views/VehicleView.vue'
import VehicleListView from '../views/VehicleListView.vue'
import StaffCreateView from '../views/StaffCreateView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, role: 'BAO_VE' }
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
      meta: { requiresAuth: true, role: 'BAO_VE' }
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView,
      meta: { requiresAuth: true, role: 'QUAN_LY' }
    },
    {
      path: '/staff',
      name: 'staff-manager',
      component: StaffManagerView,
      // Phân quyền bảo vệ: Bắt buộc đăng nhập và chỉ tài khoản QUAN_LY mới được vào
      meta: { requiresAuth: true, role: 'QUAN_LY' } 
    },
    {
      path: '/staff/create',
      name: 'staff-create',
      component: () => import('../views/StaffCreateView.vue') // Trỏ đến file view thêm mới nhân sự vừa tạo
    },
    {
      path: '/staff/edit/:id',
      name: 'staff-edit',
      component: () => import('../views/StaffEditView.vue'),
      props: true,
      meta: { requiresAuth: true, role: 'QUAN_LY' }
    },
    {
      path: '/vehicles',
      name: 'vehicles-list',
      component: VehicleListView,
      // Bảo vệ tuyến đường: Yêu cầu đăng nhập và chỉ tài khoản QUAN_LY mới được vào xem
      meta: { requiresAuth: true, role: 'QUAN_LY' }
    },
    {
      path: '/vehicle-detail/:plate',
      name: 'vehicle-detail',
      component: VehicleView,
      // Bảo vệ tuyến đường: Yêu cầu đăng nhập và chỉ tài khoản QUAN_LY mới được vào xem
      meta: { requiresAuth: true, role: 'QUAN_LY' }
    },
    {
    path: '/vehicles/edit/:id', // Đường dẫn trang sửa riêng biệt có truyền ID xe
    name: 'vehicle-edit',
    component: () => import('../views/VehicleEditView.vue'),
    props: true // Bắt buộc phải có true để truyền ID xe sang trang sửa thuận tiện
  }
  ]
})

router.beforeEach((to, from) => {
  const isAuthenticated = localStorage.getItem('auth') === 'true'
  const role = localStorage.getItem('role')

  // 1. Nếu trang yêu cầu đăng nhập mà chưa đăng nhập -> đá về trang Login
  if (to.meta.requiresAuth && !isAuthenticated && to.name !== 'login') {
    return { name: 'login' }
  } 
  
  // 2. Nếu đã đăng nhập rồi mà cố tình vào lại trang Login -> đá về đúng trang theo quyền
  if (to.name === 'login' && isAuthenticated) {
    if (role === 'QUAN_LY') return { name: 'stats' }
    return { name: 'dashboard' }
  } 
  
  // 3. Nếu vào trang sai phân quyền (ví dụ: Bảo vệ cố vào /stats hoặc Quản lý cố vào /dashboard)
  if (to.meta.role && to.meta.role !== role) {
    if (role === 'QUAN_LY') return { name: 'stats' }
    return { name: 'dashboard' }
  }

  // 4. Các trường hợp hợp lệ còn lại -> cho phép đi tiếp (không cần gọi next() nữa)
})

export default router