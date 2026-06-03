<template>
  <div class="staff-container animate-fade-in">
    <header class="staff-header">
      <div>
        <h1>Quản lý nhân viên</h1>
        <p class="subtitle">Danh sách nhân sự và phương tiện đăng ký ra vào bãi xe</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="fetchStaff">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Làm mới
        </button>
        <button class="btn btn-primary" @click="goToCreatePage" >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Thêm mới
        </button>
      </div>
    </header>

    <div class="filter-panel glass-panel mb-4">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Tìm kiếm theo mã nhân viên hoặc họ tên..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="errorMessage" class="error-state glass-panel mb-4">
      <p>{{ errorMessage }}</p>
      <button class="btn btn-outline btn-sm" @click="fetchStaff">Thử lại</button>
    </div>

    <div v-if="isLoading" class="loading-state glass-panel">
      <div class="spinner"></div>
      <p>Đang truy vấn danh sách nhân sự từ hệ thống...</p>
    </div>

    <div v-else class="table-panel glass-panel">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ và Tên</th>
              <th>Chức vụ</th>
              <th class="text-center">Đơn vị công tác</th>
              <th class="text-center">Phương tiện xe</th>
              <th class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredStaffList.length === 0">
              <td colspan="5" class="empty-row">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="mb-2 text-muted">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <p>Không tìm thấy nhân viên nào phù hợp với từ khóa</p>
              </td>
            </tr>

            <tr v-for="staff in filteredStaffList" :key="staff.MaNhanVien" class="table-row">
              <td>
                <span class="staff-id-badge">{{ staff.MaNhanVien }}</span>
              </td>
              <td class="staff-name">{{ staff.HoTen }}</td>
              <td>
                <span class="position-tag" :class="staff.ChucVu === 'Bảo vệ' ? 'bv' : 'gv'">
                  {{ staff.ChucVu }}
                </span>
              </td>
              <td class="text-center">{{ staff.NoiCongTac }}</td>
              <td class="text-center">
                <button
                  v-if="staff.phuong_tien && staff.phuong_tien.length === 1"
                  @click="goToVehicleDetail(staff.phuong_tien[0].BienSoXe)"
                  class="vehicle-tag single-tag"
                  title="Xem chi tiết phương tiện"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                    <rect x="5" y="5" width="14" height="10" rx="2"></rect>
                    <circle cx="7" cy="15" r="1"></circle>
                    <circle cx="17" cy="15" r="1"></circle>
                  </svg>
                  {{ staff.phuong_tien[0].BienSoXe }}
                </button>

                <div v-else-if="staff.phuong_tien && staff.phuong_tien.length > 1" class="dropdown-wrapper">
                  <button
                    class="vehicle-tag custom-dropdown-btn"
                    type="button"
                    @click.stop="toggleDropdown(staff.MaNhanVien)"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                      <path d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                    {{ staff.phuong_tien.length }} Phương tiện
                  </button>
                  
                  <ul 
                    v-if="activeDropdownId === staff.MaNhanVien" 
                    class="dropdown-menu-custom glass-dropdown"
                    @click.stop
                  >
                    <li v-for="v in staff.phuong_tien" :key="v.BienSoXe">
                      <button @click="goToVehicleDetail(v.BienSoXe)" class="dropdown-item custom-dropdown-item">
                        <span class="v-brand">Mã loại: {{ v.MaLoaiPhuongTien }}</span>
                        <span class="v-plate">{{ v.BienSoXe }}</span>
                      </button>
                    </li>
                  </ul>
                </div>

                <small v-else class="text-muted fst-italic opacity-50">Chưa đăng ký xe</small>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button class="action-btn edit-btn" title="Chỉnh sửa thông tin" @click="goToEditPage(staff.MaNhanVien)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                  </button>
                  <button class="action-btn delete-btn" title="Xóa nhân viên" @click="confirmDelete(staff.MaNhanVien, staff.HoTen)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchTerm = ref('');
const staffList = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const activeDropdownId = ref(null);

const goToCreatePage = () => {
  router.push({ name: 'staff-create' });
};

const goToEditPage = (id) => {
  router.push({ name: 'staff-edit', params: { id: id } });
};

// Hàm hiện thông báo xác nhận và thực hiện xóa nhân viên
const confirmDelete = async (id, name) => {
  const isConfirmed = confirm(`Bạn có chắc chắn muốn xóa nhân viên [${name}] có mã số #${id} ra khỏi hệ thống không? Dữ liệu này không thể khôi phục.`);
  
  if (isConfirmed) {
    try {
      const response = await fetch(`http://localhost:8000/api/staff/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Lỗi xử lý xóa dữ liệu từ hệ thống.');
      }
      
      alert('Đã xóa dữ liệu nhân sự thành công!');
      fetchStaff(); // Gọi lại hàm tải danh sách để làm mới bảng hiển thị dữ liệu
    } catch (error) {
      alert('Thao tác thất bại: ' + error.message);
    }
  }
};

const fetchStaff = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const res = await fetch('http://localhost:8000/api/staff');
    if (res.ok) {
      staffList.value = await res.json();
    } else {
      errorMessage.value = "Lỗi khi đọc danh sách nhân viên từ Server.";
    }
  } catch (err) {
    errorMessage.value = "Không thể kết nối đến Backend Server. Vui lòng bật dịch vụ.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const toggleDropdown = (id) => {
  activeDropdownId.value = activeDropdownId.value === id ? null : id;
};

// Hàm xử lý việc đóng khi click ra ngoài
const handleOutsideClick = (e) => {
  if (!e.target.closest('.dropdown-wrapper')) {
    activeDropdownId.value = null;
  }
};

onMounted(() => {
  fetchStaff();
  window.addEventListener('click', handleOutsideClick);
});

// Gỡ bỏ Event Listener để tránh rò rỉ bộ nhớ khi hủy component
onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick);
});

const filteredStaffList = computed(() => {
  return staffList.value.filter(staff => 
    (staff.HoTen && staff.HoTen.toLowerCase().includes(searchTerm.value.toLowerCase())) ||
    (staff.MaNhanVien && String(staff.MaNhanVien).toLowerCase().includes(searchTerm.value.toLowerCase()))
  );
});

const goToVehicleDetail = (plate) => {
  router.push(`/vehicle-detail/${plate}`);
};
</script>

<style scoped>
/* Xử lý Dropdown và phân tầng hiển thị */
.dropdown-wrapper {
  position: relative !important;
  display: inline-block;
}

.dropdown-menu-custom {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999 !important; /* Đảm bảo đè lên trên tất cả tr/td của bảng */
  display: block; /* Điều khiển hiển thị trực tiếp bằng v-if ở template */
  min-width: 12rem;
  padding: 0.5rem 0;
  margin: 0.25rem 0 0;
  list-style: none;
}

.glass-dropdown {
  background: rgba(30, 41, 59, 0.98) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px !important;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5) !important;
}

.custom-dropdown-item {
  background: transparent;
  border: none;
  width: 100%;
  color: #e2e8f0 !important;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.85rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  text-align: left;
}

.custom-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

.v-plate {
  font-weight: 700;
  color: #f59e0b;
  font-family: monospace;
}

/* Sửa lại lỗi hiển thị của bảng cha để không cắt đứt menu thò ra ngoài */
.table-panel {
  border-radius: 16px;
  overflow: visible !important; /* Thay đổi từ hidden sang visible */
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-responsive {
  flex: 1;
  overflow: visible !important; /* Cho phép menu thò ra ngoài phạm vi thẻ div chứa bảng */
}

/* Hệ thống CSS giao diện cũ */
.staff-container { height: 100%; display: flex; flex-direction: column; }
.staff-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.staff-header h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; color: #ffffff; }
.subtitle { color: var(--text-muted); font-size: 0.9rem; }
.header-actions { display: flex; gap: 1rem; }
.filter-panel { padding: 1rem; border-radius: 14px; }
.search-box { display: flex; align-items: center; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 0.5rem 1rem; gap: 0.75rem; }
.search-input { background: transparent; border: none; outline: none; color: #ffffff; width: 100%; font-size: 0.9rem; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background: rgba(15, 23, 42, 0.4); padding: 1rem 1.5rem; font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.custom-table td { padding: 1.1rem 1.5rem; color: #e2e8f0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.staff-id-badge { background: rgba(59, 130, 246, 0.15); color: var(--primary); font-weight: 700; padding: 0.3rem 0.6rem; border-radius: 6px; }
.staff-name { font-weight: 600; color: #ffffff; }
.position-tag { font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.6rem; border-radius: 20px; }
.position-tag.bv { background: rgba(16, 185, 129, 0.15); color: var(--success); }
.position-tag.gv { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
.vehicle-tag { display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; font-family: monospace; padding: 0.3rem 0.75rem; border-radius: 8px; cursor: pointer; }
.custom-dropdown-btn { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3); color: var(--warning); }
.action-buttons { display: flex; justify-content: center; gap: 0.5rem; }
.action-btn { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; width: 32px; height: 32px; cursor: pointer; color: var(--text-muted); }
.edit-btn:hover { color: var(--primary); background: rgba(59, 130, 246, 0.15); }
.delete-btn:hover { color: var(--danger); background: rgba(239, 68, 68, 0.15); }
.error-state { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 0; gap: 1rem; color: var(--text-muted); }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
/* Ép tất cả các ô trong bảng ở mọi component đều căn giữa */
table th, 
table td {
    text-align: center !important;
    vertical-align: middle !important; /* Căn giữa theo chiều dọc nếu ô có độ cao lớn */
}

/* Nếu bạn dùng các flexbox hoặc nút bấm bên trong ô <td> (như cụm nút Sửa/Xóa) */
table td .action-buttons,
table td div {
    justify-content: center !important;
    align-items: center !important;
    margin: 0 auto !important;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>