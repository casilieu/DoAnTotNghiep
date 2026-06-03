<template>
  <div class="edit-vehicle-container animate-fade-in">
    <button class="back-btn" @click="goBack">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Quay lại danh sách
    </button>

    <header class="page-header">
      <h1>Chỉnh sửa phương tiện</h1>
      <p class="subtitle">Cập nhật thông tin phân quyền bãi xe cho mã hệ thống #{{ id }}</p>
    </header>

    <div v-if="isPageLoading" class="loading-state glass-panel text-center">
      <div class="spinner mb-2"></div>
      <p>Đang tải dữ liệu từ hệ thống...</p>
    </div>

    <div v-else class="form-panel glass-panel">
      <form @submit.prevent="updateForm" class="vehicle-form">
        <div class="form-grid">
          
          <div class="form-group">
            <label>Mã hệ thống (Khóa cố định)</label>
            <input type="number" :value="id" class="form-input readonly-input" disabled />
          </div>

          <div class="form-group">
            <label>Biển số kiểm soát <span class="required">*</span></label>
            <input type="text" v-model="form.BienSoXe" class="form-input plate-input" required />
          </div>

          <div class="form-group">
            <label>Phân loại danh mục xe</label>
            <select v-model.number="form.MaLoaiPhuongTien" class="form-input select-input">
              <option :value="1">Ô tô</option>
              <option :value="2">Xe máy</option>
            </select>
          </div>

          <div class="form-group">
            <label>Chủ sở hữu hiện tại (Nhân viên) <span class="required">*</span></label>
            <select v-model.number="form.MaNhanVien" class="form-input select-input" required>
              <option v-for="staff in staffList" :key="staff.MaNhanVien" :value="staff.MaNhanVien">
                #{{ staff.MaNhanVien }} - {{ staff.HoTen }}
              </option>
            </select>
          </div>

        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" @click="goBack">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Đang lưu...' : 'Lưu cập nhật' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // Nhớ là 'vue' chứ không phải 'react' nhé bạn!
import { useRouter } from 'vue-router';

// Nhận ID truyền từ Router qua props
const props = defineProps({
  id: { type: [String, Number], required: true }
});

const router = useRouter();
const isPageLoading = ref(true);
const isSubmitting = ref(false);
const staffList = ref([]);

const form = ref({
  BienSoXe: '',
  MaLoaiPhuongTien: 1,
  MaNhanVien: null
});

const goBack = () => {
  router.push('/vehicles'); // Quay lại trang danh sách chính
};

// Gọi API lấy thông tin cũ đổ vào Form sửa
const loadInitialData = async () => {
  isPageLoading.value = true;
  try {
    // 1. Tải danh sách nhân sự làm dropdown chọn lại chủ sở hữu
    const resStaff = await fetch('http://localhost:8000/api/staff');
    if (resStaff.ok) staffList.value = await resStaff.json();

    // 2. Tải thông tin gốc của xe dựa vào ID
    const resVehicle = await fetch(`http://localhost:8000/api/vehicles/${props.id}`);
    if (!resVehicle.ok) throw new Error('Không thể tải chi tiết dữ liệu xe.');
    
    const data = await resVehicle.json();
    form.value.BienSoXe = data.BienSoXe;
    form.value.MaLoaiPhuongTien = data.MaLoaiPhuongTien;
    form.value.MaNhanVien = data.MaNhanVien;
  } catch (error) {
    alert(error.message);
    goBack();
  } finally {
    isPageLoading.value = false;
  }
};

// Gửi dữ liệu đã sửa lên API PUT của Backend
const updateForm = async () => {
  isSubmitting.value = true;
  try {
    const response = await fetch(`http://localhost:8000/api/vehicles/${props.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    if (!response.ok) throw new Error('Lỗi cập nhật dữ liệu bãi xe.');
    alert('Cập nhật thông tin phương tiện thành công!');
    goBack(); // Thành công thì tự chuyển về trang danh sách
  } catch (error) {
    alert(error.message);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadInitialData();
});
</script>

<style scoped>
.edit-vehicle-container { padding: 2.5rem; max-width: 800px; margin: 0 auto; color: #ffffff; }
.back-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); color: #94a3b8; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; font-size: 0.88rem; }
.back-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
.page-header h1 { font-size: 1.8rem; font-weight: 700; }
.subtitle { color: #94a3b8; font-size: 0.9rem; margin-top: 0.25rem; }
.glass-panel { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 2rem; }
.vehicle-form { display: flex; flex-direction: column; gap: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.85rem; color: #94a3b8; }
.required { color: #ef4444; }
.form-input { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 0.75rem 1rem; color: #ffffff; font-size: 0.92rem; outline: none; }
.plate-input { text-transform: uppercase; font-family: monospace; font-weight: bold; }
.readonly-input { background: rgba(255, 255, 255, 0.03); color: #64748b; cursor: not-allowed; }
.select-input option { background: #1e293b; color: #fff; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 1.5rem; }
.btn { padding: 0.65rem 1.25rem; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 0.9rem; border: none; }
.btn-primary { background: #10b981; color: white; }
.btn-primary:hover { background: #059669; }
.btn-outline { background: transparent; border: 1px solid rgba(255, 255, 255, 0.15); color: white; }
.loading-state { padding: 3rem; text-align: center; }
.spinner { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.1); border-radius: 50%; border-top-color: #10b981; animation: spin 1s linear infinite; margin: 0 auto; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
</style>