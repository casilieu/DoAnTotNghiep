<template>
  <div class="edit-staff-container animate-fade-in">
    <button class="back-btn" @click="goBack">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Quay lại danh sách
    </button>

    <header class="page-header">
      <h1>Chỉnh sửa hồ sơ nhân sự</h1>
      <p class="subtitle">Thay đổi thông tin hồ sơ của nhân viên mã số #{{ id }}</p>
    </header>

    <div v-if="isPageLoading" class="loading-state glass-panel text-center">
      <div class="spinner mb-2"></div>
      <p>Đang tải thông tin nhân viên...</p>
    </div>

    <div v-else class="form-panel glass-panel">
      <form @submit.prevent="updateForm" class="staff-form">
        
        <div class="form-grid">
          <div class="form-group">
            <label>Mã nhân viên (Không được phép sửa)</label>
            <input 
              type="number" 
              :value="id" 
              class="form-input readonly-input" 
              disabled 
            />
          </div>

          <div class="form-group">
            <label>Họ và tên nhân viên <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="form.HoTen" 
              class="form-input" 
              required 
            />
          </div>

          <div class="form-group">
            <label>Chức vụ công tác</label>
            <input 
              type="text" 
              v-model="form.ChucVu" 
              class="form-input" 
            />
          </div>

          <div class="form-group">
            <label>Nơi công tác / Phòng ban</label>
            <input 
              type="text" 
              v-model="form.NoiCongTac" 
              class="form-input" 
            />
          </div>

          <div class="form-group full-width">
            <label>Trạng thái kích hoạt</label>
            <select v-model="form.TrangThai" class="form-input select-input">
              <option value="HoatDong">Hoạt động (Được quyền đăng ký xe)</option>
              <option value="NghiViec">Nghi việc (Đình chỉ tạm thời)</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="goBack">Hủy bỏ quay lại</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="mini-spinner"></span>
            {{ isSubmitting ? 'Đang cập nhật DB...' : 'Cập nhật thông tin (Update)' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// Nhận tham số `id` được truyền từ trang danh sách qua Router
const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const router = useRouter();
const isPageLoading = ref(true);
const isSubmitting = ref(false);

const form = ref({
  HoTen: '',
  ChucVu: '',
  NoiCongTac: '',
  TrangThai: 'HoatDong'
});

const goBack = () => {
  // Đẩy hướng quay về trang quản lý danh sách ban đầu của bạn (Sửa theo name router của bạn)
  router.push({ name: 'staff-manager' }); 
};

// Hàm lấy dữ liệu cũ của nhân viên đổ vào Form khi mở trang
const loadStaffData = async () => {
  isPageLoading.value = true;
  try {
    const response = await fetch(`http://localhost:8000/api/staff/${props.id}`);
    if (!response.ok) throw new Error('Không thể tải thông tin nhân sự này!');
    
    const data = await response.json();
    form.value.HoTen = data.HoTen;
    form.value.ChucVu = data.ChucVu || '';
    form.value.NoiCongTac = data.NoiCongTac || '';
    form.value.TrangThai = data.TrangThai;
  } catch (error) {
    alert(error.message);
    goBack();
  } finally {
    isPageLoading.value = false;
  }
};

// Hàm Submit gửi dữ liệu đã sửa đổi lên Backend (PUT)
const updateForm = async () => {
  isSubmitting.value = true;
  try {
    const response = await fetch(`http://localhost:8000/api/staff/${props.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form.value)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Gặp lỗi khi cập nhật thông tin.');
    }

    alert('Đã cập nhật thay đổi hồ sơ nhân sự thành công!');
    goBack(); 
  } catch (error) {
    alert('Thao tác cập nhật thất bại: ' + error.message);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadStaffData();
});
</script>

<style scoped>
.edit-staff-container { padding: 2.5rem; max-width: 800px; margin: 0 auto; color: #ffffff; }
.back-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #94a3b8; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.88rem; transition: all 0.2s; }
.back-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.2); }
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 1.8rem; font-weight: 700; color: #ffffff; }
.subtitle { color: #94a3b8; font-size: 0.9rem; margin-top: 0.25rem; }
.glass-panel { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 2rem; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); }
.staff-form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
@media (min-width: 641px) { .full-width { grid-column: span 2; } }
.form-group label { font-size: 0.85rem; color: #94a3b8; font-weight: 500; }
.required { color: #ef4444; }
.form-input { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 0.75rem 1rem; color: #ffffff; font-size: 0.92rem; outline: none; transition: all 0.2s; }
.form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
.readonly-input { background: rgba(255, 255, 255, 0.03); color: #64748b; border-color: rgba(255, 255, 255, 0.03); cursor: not-allowed; }
.select-input { cursor: pointer; }
.select-input option { background: #1e293b; color: #fff; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 1.5rem; margin-top: 1rem; }
.btn { padding: 0.65rem 1.25rem; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem; border: none; transition: all 0.2s; }
.btn-primary { background: #10b981; color: white; } /* Đổi nút sửa sang tông xanh lục Emerald */
.btn-primary:hover { background: #059669; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { background: transparent; border: 1px solid rgba(255, 255, 255, 0.15); color: white; }
.btn-outline:hover { background: rgba(255, 255, 255, 0.05); }
.loading-state { padding: 3rem; text-align: center; }
.spinner { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.1); border-radius: 50%; border-top-color: #3b82f6; animation: spin 1s linear infinite; margin: 0 auto; }
.mini-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>