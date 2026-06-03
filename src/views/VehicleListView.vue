<template>
  <div class="vehicle-container animate-fade-in">
    
    <header class="page-header-actions mb-4">
      <div class="title-block">
        <h2 class="m-0">Quản lý Phương tiện</h2>
        <p class="subtitle m-0">Danh sách cấp phép và phân quyền bãi đỗ xe tự động</p>
      </div>
      <div class="action-block">
        <button class="btn-refresh me-2" @click="fetchVehicles">Làm mới</button>
        <button class="btn-add-top" @click="openAddModal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-1">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Thêm phương tiện
        </button>
      </div>
    </header>

    <div class="table-panel glass-panel">
      <div class="table-responsive">
        <table class="custom-center-table">
          <thead>
            <tr>
              <th>Mã ID</th>
              <th>Biển số xe</th>
              <th>Loại xe</th>
              <th>Chủ sở hữu</th>
              <th>Phòng ban / Vị trí</th>
              <th>Thao tác hệ thống</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="vehiclesList.length === 0">
              <td colspan="6" class="text-muted text-center py-4">Hệ thống chưa ghi nhận phương tiện nào đăng ký bãi xe.</td>
            </tr>
            <tr v-for="v in vehiclesList" :key="v.MaPhuongTien">
              <td>#{{ v.MaPhuongTien }}</td>
              <td class="plate-highlight">{{ v.BienSoXe }}</td>
              <td>
                <span :class="v.LoaiPhuongTien === 'Ô tô' ? 'badge-car' : 'badge-moto'">
                  {{ v.LoaiPhuongTien }}
                </span>
              </td>
              <td><strong>{{ v.ChuSoHuu }}</strong></td>
              <td>{{ v.NoiCongTac }}</td>
              <td>
                <div class="action-buttons-center">
                  <button class="action-btn edit" title="Sửa thông tin xe" @click="goToEditPage(v.MaPhuongTien)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                  </button>
                  <button class="action-btn delete" title="Hủy đăng ký xe" @click="confirmDelete(v.MaPhuongTien, v.BienSoXe)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    <div v-if="showModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content-glass animate-zoom-in">
        <div class="modal-header-custom">
          <h3>Đăng ký phương tiện mới</h3>
          <button class="close-x-btn" @click="closeAddModal">&times;</button>
        </div>
        
        <form @submit.prevent="addNewVehicle" class="modal-form-body">
          <div class="mb-3">
            <label class="form-label-custom">Biển số xe *</label>
            <input type="text" v-model="addForm.BienSoXe" class="form-input-custom plate-mode" placeholder="Ví dụ: 30K-999.99" required />
          </div>
          
          <div class="mb-3">
            <label class="form-label-custom">Loại xe</label>
            <select v-model.number="addForm.MaLoaiPhuongTien" class="form-input-custom select-mode">
              <option :value="1">Ô tô</option>
              <option :value="2">Xe máy</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="form-label-custom">Chủ sở hữu (Nhân viên liên kết) *</label>
            <select v-model.number="addForm.MaNhanVien" class="form-input-custom select-mode" required>
              <option :value="null" disabled>-- Chọn nhân viên sở hữu --</option>
              <option v-for="staff in staffList" :key="staff.MaNhanVien" :value="staff.MaNhanVien">
                #{{ staff.MaNhanVien }} - {{ staff.HoTen }}
              </option>
            </select>
          </div>

          <div class="modal-footer-custom">
            <button type="button" class="btn-cancel" @click="closeAddModal">Hủy bỏ</button>
            <button type="submit" class="btn-submit-custom">Đăng ký vào bãi</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const vehiclesList = ref([]);
const staffList = ref([]);
const showModal = ref(false);

const addForm = ref({
  BienSoXe: '',
  MaLoaiPhuongTien: 1,
  MaNhanVien: null
});

// Điều khiển Modal
const openAddModal = () => { showModal.value = true; };
const closeAddModal = () => { showModal.value = false; };

// Điều hướng sang trang sửa riêng biệt (Đã dọn dẹp hàm trùng lặp)
const goToEditPage = (id) => {
  router.push(`/vehicles/edit/${id}`);
};

// API: Lấy danh sách xe
const fetchVehicles = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/vehicles');
    if (res.ok) vehiclesList.value = await res.json();
  } catch (err) { console.error(err); }
};

// API: Lấy danh sách nhân viên phục vụ dropdown
const fetchStaff = async () => {
  try {
    const res = await fetch('http://localhost:8000/api/staff');
    if (res.ok) staffList.value = await res.json();
  } catch (err) { console.error(err); }
};

// API: Thêm phương tiện mới
const addNewVehicle = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(addForm.value)
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Lỗi thêm phương tiện.');
    }
    
    alert('Đăng ký phương tiện mới thành công!');
    addForm.value.BienSoXe = '';
    addForm.value.MaNhanVien = null;
    closeAddModal(); 
    fetchVehicles(); 
  } catch (error) {
    alert(error.message);
  }
};

// API: Xóa phương tiện
const confirmDelete = async (id, plate) => {
  const isConfirmed = confirm(`Bạn có chắc chắn muốn xóa phương tiện mang biển kiểm soát [ ${plate} ] không?`);
  if (isConfirmed) {
    try {
      const response = await fetch(`http://localhost:8000/api/vehicles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Không thể xóa phương tiện này.');
      alert('Phương tiện đã được xóa bỏ hoàn toàn.');
      fetchVehicles();
    } catch (error) {
      alert(error.message);
    }
  }
};

onMounted(() => {
  fetchVehicles();
  fetchStaff();
});
</script>

<style scoped>
/* Toàn bộ style giao diện cũ của bạn được giữ nguyên */
.vehicle-container { padding: 2rem; color: #fff; }
.page-header-actions { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 1rem; }
.subtitle { color: #94a3b8; font-size: 0.88rem; margin-top: 0.2rem; }
.btn-add-top { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; color: white; font-weight: 600; padding: 0.55rem 1.2rem; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); display: inline-flex; align-items: center; font-size: 0.9rem; transition: all 0.2s; }
.btn-add-top:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3); }
.btn-refresh { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 0.55rem 1rem; border-radius: 10px; cursor: pointer; font-size: 0.9rem; }
.btn-refresh:hover { color: #fff; background: rgba(255,255,255,0.07); }
.glass-panel { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.5rem; }
.custom-center-table { width: 100%; border-collapse: collapse; }
.custom-center-table th, 
.custom-center-table td { text-align: center !important; vertical-align: middle !important; padding: 0.95rem 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
.custom-center-table th { background: rgba(15, 23, 42, 0.35); color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; }
.plate-highlight { font-family: monospace; font-weight: 700; color: #facc15; font-size: 1.05rem; }
.badge-car { background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.badge-moto { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
.action-buttons-center { display: flex; justify-content: center; align-items: center; gap: 0.5rem; }
.action-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); width: 30px; height: 30px; border-radius: 8px; color: #94a3b8; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.action-btn.edit:hover { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.05); }
.action-btn.delete:hover { border-color: #ef4444; color: #ef4444; background: rgba(239,68,68,0.05); }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal-content-glass { background: rgba(30, 41, 59, 0.75); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; width: 100%; max-width: 480px; padding: 1.75rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
.modal-header-custom { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 0.75rem; margin-bottom: 1.25rem; }
.modal-header-custom h3 { font-size: 1.2rem; font-weight: 600; margin: 0; }
.close-x-btn { background: transparent; border: none; color: #94a3b8; font-size: 1.6rem; cursor: pointer; line-height: 1; }
.form-label-custom { font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.4rem; display: block; }
.form-input-custom { width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 0.6rem 0.8rem; color: #fff; outline: none; }
.plate-mode { text-transform: uppercase; font-family: monospace; font-weight: bold; }
.select-mode option { background: #1e293b; color: #fff; }
.modal-footer-custom { display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1rem; margin-top: 1.5rem; }
.btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #fff; padding: 0.55rem 1.2rem; border-radius: 8px; cursor: pointer; }
.btn-submit-custom { background: #10b981; border: none; color: white; font-weight: 600; padding: 0.55rem 1.2rem; border-radius: 8px; cursor: pointer; }
.btn-submit-custom:hover { background: #059669; }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-zoom-in { animation: zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>