<template>
  <div class="stats-container animate-fade-in">
    <header class="stats-header">
      <div>
        <h1>Báo cáo thống kê</h1>
        <p class="subtitle">Tổng quan lưu lượng xe ra vào và hiệu suất hệ thống</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="fetchStats" :disabled="isLoading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          Làm mới
        </button>
        <button class="btn btn-primary">Xuất báo cáo</button>
      </div>
    </header>

    <div v-if="isLoading" class="loading-state">
      Đang tải dữ liệu thống kê...
    </div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Tổng lượt vào (Hôm nay)</div>
            <div class="stat-value">{{ totalIn }}</div>
            <div class="stat-trend positive">Hệ thống hoạt động ổn định</div>
          </div>
        </div>
        
        <div class="stat-card glass-panel">
          <div class="stat-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H3v6M15 21h6v-6M3 3l7 7M21 21l-7-7"/></svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Tổng lượt ra (Hôm nay)</div>
            <div class="stat-value">{{ totalOut }}</div>
            <div class="stat-trend positive">Hiện còn {{ totalIn - totalOut }} xe trong bãi</div>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="stat-content">
            <div class="stat-label">Sự cố chờ xử lý</div>
            <div class="stat-value text-danger">{{ pendingErrors }}</div>
            <div class="stat-trend negative" v-if="pendingErrors > 0">Cần ban quản lý kiểm tra</div>
            <div class="stat-trend positive" v-else>Không có sự cố tồn đọng</div>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-panel glass-panel">
          <div class="panel-header">
            <h3>Lưu lượng theo khung giờ thực tế</h3>
          </div>
          <div class="chart-container">
            <div class="bar-chart">
              <div v-for="chart in hourlyData" :key="chart.label" class="bar-wrapper">
                <div class="bar-value" :style="{ height: chart.percentage + '%' }">
                  <span class="bar-count">{{ chart.count }} xe</span>
                </div>
                <div class="bar-label">{{ chart.label }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chart-panel glass-panel">
          <div class="panel-header">
            <h3>Phân tích mật độ cao điểm</h3>
          </div>
          <div class="peak-hours">
            <div class="peak-item">
              <div class="time-range">07:00 - 08:30</div>
              <div class="peak-bar-container">
                <div class="peak-bar" :style="{ width: Math.min((totalIn * 5), 100) + '%' }"></div>
              </div>
              <div class="peak-value">Cao điểm vào (Sinh viên đi học)</div>
            </div>
            <div class="peak-item">
              <div class="time-range">16:30 - 17:30</div>
              <div class="peak-bar-container">
                <div class="peak-bar" :style="{ width: Math.min((totalOut * 5), 100) + '%' }"></div>
              </div>
              <div class="peak-value">Cao điểm ra (Tan trường)</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const totalIn = ref(0)
const totalOut = ref(0)
const pendingErrors = ref(0)
const isLoading = ref(true)

// Thêm biến chứa mảng dữ liệu khung giờ thực tế nhận từ API
const hourlyData = ref([
  { label: '07h - 09h', count: 0, percentage: 10 },
  { label: '09h - 12h', count: 0, percentage: 10 },
  { label: '13h - 16h', count: 0, percentage: 10 },
  { label: '16h - 18h', count: 0, percentage: 10 }
])

const fetchStats = async () => {
  isLoading.value = true
  try {
    const res = await fetch('http://localhost:8000/api/stats')
    if (res.ok) {
      const data = await res.json()
      
      totalIn.value = data.total_in || 0
      totalOut.value = data.total_out || 0
      pendingErrors.value = data.pending_errors || 0

      // Khớp dữ liệu mảng biểu đồ từ API (nếu Backend trả về mảng chart_data)
      if (data.chart_data && data.chart_data.length > 0) {
        hourlyData.value = data.chart_data;
      } else {
        // Fallback logic tính toán tương đối dựa trên tổng số xe vào nếu API chưa chia mảng
        hourlyData.value[0].count = Math.round(totalIn.value * 0.4);
        hourlyData.value[0].percentage = Math.min(hourlyData.value[0].count * 8, 100);
        
        hourlyData.value[1].count = Math.round(totalIn.value * 0.35);
        hourlyData.value[1].percentage = Math.min(hourlyData.value[1].count * 8, 100);

        hourlyData.value[2].count = Math.round(totalIn.value * 0.15);
        hourlyData.value[2].percentage = Math.min(hourlyData.value[2].count * 8, 100);

        hourlyData.value[3].count = Math.round(totalIn.value * 0.1);
        hourlyData.value[3].percentage = Math.min(hourlyData.value[3].count * 8, 100);
      }
    }
  } catch (err) {
    console.error("Lỗi khi kết nối tới API Stats:", err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
/* Giữ nguyên CSS cũ của StatsView.vue... */
.stats-container { height: 100%; display: flex; flex-direction: column; }
.stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.stats-header h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.25rem; }
.subtitle { color: var(--text-muted); font-size: 0.9rem; }
.header-actions { display: flex; gap: 1rem; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 1.5rem; }
.stat-card { display: flex; align-items: center; padding: 1.5rem; gap: 1.5rem; }
.stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
.stat-icon.info { background: rgba(59, 130, 246, 0.15); color: var(--primary); }
.stat-icon.warning { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
.stat-icon.danger { background: rgba(239, 68, 68, 0.15); color: var(--danger); }
.stat-content { flex: 1; }
.stat-label { color: var(--text-muted); font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem; }
.stat-value { font-size: 2rem; font-weight: 700; line-height: 1; margin-bottom: 0.5rem; }
.stat-trend { font-size: 0.8rem; font-weight: 500; }
.stat-trend.positive { color: var(--success); }
.stat-trend.negative { color: var(--danger); }
.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; flex: 1; }
.chart-panel { display: flex; flex-direction: column; padding: 1.5rem; }
.panel-header { margin-bottom: 1.5rem; }
.panel-header h3 { font-size: 1.1rem; font-weight: 600; }
.chart-container { flex: 1; display: flex; align-items: flex-end; padding-bottom: 1rem; }
.bar-chart { display: flex; justify-content: space-around; align-items: flex-end; width: 100%; height: 200px; padding-top: 1rem; }
.bar-wrapper { display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; width: 20%; }
.bar-value { width: 40px; background: linear-gradient(to top, rgba(59, 130, 246, 0.5), var(--primary)); border-radius: 4px 4px 0 0; transition: height 0.5s ease; position: relative; }
.bar-count { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.75rem; color: #fff; white-space: nowrap; }
.bar-label { margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
.peak-hours { display: flex; flex-direction: column; gap: 1.5rem; }
.peak-item { display: flex; flex-direction: column; gap: 0.5rem; }
.time-range { font-weight: 600; font-size: 0.95rem; }
.peak-bar-container { height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; }
.peak-bar { height: 100%; background: linear-gradient(to right, var(--warning), var(--danger)); border-radius: 4px; transition: width 0.5s ease; }
.peak-value { font-size: 0.8rem; color: var(--text-muted); text-align: right; }
.loading-state { display: flex; align-items: center; justify-content: center; flex: 1; color: var(--text-muted); font-size: 1.1rem; }
</style>