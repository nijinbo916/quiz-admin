<template>
  <div class="stat-card">
    <div class="stat-icon" :style="{ background: tint, color: color }">
      <i :class="icon"></i>
    </div>
    <div class="stat-body">
      <span class="stat-label">{{ label }}</span>
      <div class="stat-value">
        {{ value }}<small v-if="unit">{{ unit }}</small>
      </div>
      <span class="stat-sub">{{ sub }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    icon: { type: String, default: 'el-icon-s-data' },
    label: { type: String, default: '' },
    value: { type: [String, Number], default: 0 },
    unit: { type: String, default: '' },
    sub: { type: String, default: '' },
    color: { type: String, default: '#409eff' },
    tint: { type: String, default: 'rgba(64, 158, 255, 0.12)' }
  }
}
</script>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 10px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(31, 45, 61, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 45, 61, 0.1);
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 22px;
}

.stat-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
  line-height: 1.25;
  color: #1f2d3d;
  font-variant-numeric: tabular-nums;
}

.stat-value small {
  font-size: 13px;
  font-weight: 400;
  color: #909399;
  margin-left: 2px;
}

.stat-sub {
  font-size: 12px;
  color: #b1b7c0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
