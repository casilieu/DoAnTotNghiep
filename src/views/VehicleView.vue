<template>
  <div class="vehicle-detail-container animate-fade-in">
    <div v-if="isLoading" class="loading-state glass-panel text-center">
      <div class="spinner mb-2"></div>
      <p>Đang tải thông tin phương tiện từ hệ thống...</p>
    </div>

    <div v-else-if="!vehicle || errorMsg" class="empty-state glass-panel">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-muted mb-3">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>{{ errorMsg || 'Không tìm thấy dữ liệu phương tiện' }}</h3>
      <p class="text-muted small">Vui lòng quay lại danh sách nhân viên và chọn lại phương tiện.</p>
      <button class="btn btn-primary mt-3" @click="goBack">
        Quay lại
      </button>
    </div>

    <div v-else class="detail-layout">
      <button class="back-link-btn mb-4" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Quay lại danh sách nhân sự
      </button>

      <div class="row g-4">
        <div class="col-lg-4">
          <div class="card-left-preview glass-panel text-center">
            <div class="vehicle-avatar-wrapper" :class="{ 'has-cloudinary-image': vehicle.img }">
              <img 
                v-if="vehicle.img" 
                :src="vehicle.img" 
                alt="Hình ảnh phương tiện thực tế" 
                class="cloudinary-vehicle-img"
              />
              <template v-else>
                <svg v-if="vehicle.MaLoaiPhuongTien === 1" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="vehicle-icon-svg">
                  <rect x="1" y="11" width="22" height="8" rx="2"></rect>
                  <path d="M4 11V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"></path>
                  <circle cx="6" cy="15" r="2"></circle>
                  <circle cx="18" cy="15" r="2"></circle>
                </svg>
                <svg v-else width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="vehicle-icon-svg">
                  <circle cx="5" cy="18" r="3"></circle>
                  <circle cx="19" cy="18" r="3"></circle>
                  <path d="M12 18V9l4-4M5 18l4-9h7"></path>
                </svg>
              </template>
            </div>
            <h2 class="display-plate">{{ vehicle.BienSoXe }}</h2>
            <div class="status-badge-container">
              <span class="status-dot"></span>
              TRẠNG THÁI: HỢP LỆ
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card-right-info glass-panel">
            <div class="panel-header-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <h3>Thông tin chi tiết phương tiện</h3>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Mã Loại phương tiện (FK)</span>
                <p class="info-value">
                  {{ vehicle.MaLoaiPhuongTien === 1 ? 'Loại 1: Ô tô' : 'Loại 2: Xe máy' }}
                </p>
              </div>

              <div class="info-item">
                <span class="info-label">Mã Chủ sở hữu (Nhân viên FK)</span>
                <p class="info-value">Mã nhân viên: {{ vehicle.MaNhanVien || 'Chưa định danh' }}</p>
              </div>

              <div class="info-item full-width">
                <span class="info-label">Biển số đăng ký (Database)</span>
                <p class="info-value plate-highlight">{{ vehicle.BienSoXe }}</p>
              </div>

              <div v-if="vehicle.img" class="info-item full-width">
                <span class="info-label">Cloudinary URL Resource</span>
                <p class="info-value image-url-text">{{ vehicle.img }}</p>
              </div>

              <div class="info-item full-width">
                <span class="info-label">Ghi chú hệ thống</span>
                <div class="system-note-box">
                  Phương tiện đã được xác thực định danh thuộc sở hữu của nhân viên công tác, phân quyền tự động kích hoạt rơ-le mở barrier ra vào cổng thông qua mô hình nhận diện camera AI YOLOv8 kết nối bảng điều khiển khuôn viên.
                </div>
              </div>
            </div>

            <div class="panel-actions mt-4">
              <button class="btn btn-outline edit-btn">Chỉnh sửa thông tin</button>
              <button class="btn btn-outline delete-btn">Hủy đăng ký phương tiện</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const vehicle = ref(null);
const isLoading = ref(true);
const errorMsg = ref('');

const fetchVehicleDetail = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const plateParam = route.params.plate;
    const res = await fetch(`http://localhost:8000/api/vehicles-detail/${plateParam}`);
    if (res.ok) {
      vehicle.value = await res.json();
    } else {
      errorMsg.value = "Phương tiện không tồn tại trên hệ thống dữ liệu.";
    }
  } catch (err) {
    errorMsg.value = "Mất kết nối mạng đến máy chủ cơ sở dữ liệu.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchVehicleDetail();
});

const goBack = () => {
  router.push('/staff'); 
};
</script>

<style scoped>
.vehicle-detail-container { min-height: 100%; display: block; color: #e2e8f0; }
.back-link-btn { background: transparent; border: none; color: var(--text-muted); font-size: 0.9rem; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0; cursor: pointer; }
.back-link-btn:hover { color: #ffffff; }
.card-left-preview { padding: 2.5rem 1.5rem; border-radius: 16px; }

/* CẬP NHẬT CSS: Tinh chỉnh khung chứa ảnh để bo viền chữ nhật/vuông khi có ảnh thực tế */
.vehicle-avatar-wrapper { width: 140px; height: 140px; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; color: var(--text-muted); overflow: hidden; transition: all 0.3s ease; }
.vehicle-avatar-wrapper.has-cloudinary-image { width: 100%; height: 200px; border-radius: 12px; }

/* CSS bức ảnh tải từ Cloudinary */
.cloudinary-vehicle-img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }

.vehicle-icon-svg { opacity: 0.4; color: var(--primary); }
.display-plate { font-size: 1.6rem; font-weight: 700; font-family: monospace; color: #ffffff; margin-bottom: 1rem; }
.status-badge-container { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.12); color: var(--success); font-size: 0.8rem; font-weight: 700; padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2); }
.status-dot { width: 7px; height: 7px; background: var(--success); border-radius: 50%; box-shadow: 0 0 8px var(--success); }
.card-right-info { padding: 2rem; border-radius: 16px; }
.panel-header-title { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.06); padding-bottom: 1rem; }
.panel-header-title h3 { font-size: 1.2rem; font-weight: 600; color: #ffffff; margin: 0; }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem 2rem; }
.info-item { display: flex; flex-direction: column; gap: 0.4rem; }
.info-item.full-width { grid-column: span 2; }
.info-label { font-size: 0.75rem; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); font-weight: 600; }
.info-value { font-size: 1.05rem; font-weight: 500; color: #f1f5f9; margin: 0; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
.plate-highlight { color: var(--primary); font-family: monospace; font-weight: 700; }
.image-url-text { font-size: 0.82rem; font-family: monospace; color: #64748b; word-break: break-all; }
.system-note-box { background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 10px; padding: 1rem; font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; }
.panel-actions { display: flex; gap: 1rem; padding-top: 1rem; }
.panel-actions .btn { font-size: 0.88rem; font-weight: 600; padding: 0.6rem 1.2rem; border-radius: 10px; }
.edit-btn:hover { background: rgba(245, 158, 11, 0.1) !important; border-color: var(--warning) !important; color: var(--warning) !important; }
.delete-btn:hover { background: rgba(239, 68, 68, 0.1) !important; border-color: var(--danger) !important; color: var(--danger) !important; }
.empty-state { text-align: center; padding: 4rem 2rem; border-radius: 16px; max-width: 500px; margin: 4rem auto 0 auto; }
.empty-state h3 { font-size: 1.25rem; color: #ffffff; margin-bottom: 0.5rem; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 0; color: var(--text-muted); }
.spinner { width: 28px; height: 28px; border: 3px solid rgba(255, 255, 255, 0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>