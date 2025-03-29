<template>
  <view class="container">
    <!-- 背景效果 -->
    <view class="background-gradient"></view>
    <view class="background-grid"></view>

    <!-- 粒子动画 -->
    <view class="particles-container">
      <view
        class="particle"
        v-for="(particle, index) in particles"
        :key="index"
        :style="{
          left: particle.left + 'rpx',
          top: particle.top + 'rpx',
          animationDelay: particle.delay + 's',
          opacity: particle.opacity,
          width: particle.size + 'rpx',
          height: particle.size + 'rpx',
        }">
      </view>
    </view>

    <!-- 主内容卡片 -->
    <view class="main-card">
      <view class="card-header">
        <view class="title-container">
          <text class="title">智能喝水时间表</text>
          <text class="subtitle">科学补水，全天守护</text>
        </view>
      </view>

      <!-- 饮水进度统计 -->
      <view class="water-stats">
        <view class="water-progress-container">
          <view class="water-progress-bar">
            <view
              class="water-progress"
              :style="{ width: (totalWaterIntake / dailyGoal) * 100 + '%' }"></view>
          </view>
          <view class="water-labels">
            <text class="water-amount">{{ totalWaterIntake }}ml</text>
            <text class="water-goal">目标: {{ dailyGoal }}ml</text>
          </view>
        </view>
        <view class="water-percentage">
          <text>{{ Math.min(Math.round((totalWaterIntake / dailyGoal) * 100), 100) }}%</text>
        </view>
      </view>

      <!-- 喝水时间表 -->
      <view class="schedule-container">
        <view
          v-for="(item, index) in waterSchedule"
          :key="index"
          class="schedule-item datav-border-box"
          :class="{ active: isCurrentTimeSlot(item.time), passed: hasTimePassed(item.time) }">
          <!-- <view class="time-indicator">
            <view class="time-dot"></view>
            <view class="time-line" v-if="index < waterSchedule.length - 1"></view>
          </view> -->

          <view class="schedule-card">
            <!-- 添加边框动画元素 -->
            <view class="border-box-content"></view>
            
            <view class="schedule-header">
              <text class="schedule-time">{{ item.time }}</text>
              <text class="schedule-amount">{{ item.amount }}</text>
            </view>

            <view class="schedule-content">
              <text class="schedule-message">{{ item.message }}</text>
              <text class="schedule-effect">{{ item.effect }}</text>
            </view>

            <view class="schedule-action">
              <button
                class="drink-button"
                :class="{ completed: item.completed, disabled: hasTimePassed(item.time) && !item.completed }"
                @click="toggleCompleted(index)"
                :disabled="hasTimePassed(item.time) && !item.completed">
                {{ item.completed ? '🎯 任务完成' : hasTimePassed(item.time) && !item.completed ? '⏱️ 时间已过' : '🚀 执行任务' }}
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 科技感波浪效果 -->
    <view class="wave-container">
      <view class="wave wave1"></view>
      <view class="wave wave2"></view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTime: '00:00',
      timelineProgress: 0,
      particles: [],
      waterSchedule: [
        {
          time: '7:00',
          amount: '300ml',
          message: '🌱晨间系统启动，需要能量液补给',
          effect: '激活代谢，补偿夜间水分流失',
          completed: false,
        },
        {
          time: '9:30',
          amount: '250ml',
          message: '⚠️检测到专注模式开启，建议脑部冷却',
          effect: '应对工作压力峰值',
          completed: false,
        },
        {
          time: '11:00',
          amount: '250ml',
          message: '⚡战舰引擎过热，立即补水降温！',
          effect: '预防午餐前饥饿混淆',
          completed: false,
        },
        {
          time: '13:30',
          amount: '300ml',
          message: '🐦午休后重力适应，需液压平衡',
          effect: '促进消化，避免午后困倦',
          completed: false,
        },
        {
          time: '15:30',
          amount: '300ml',
          message: '🔋能量舱储备剩余40%，立即充能',
          effect: '对抗下午代谢低谷',
          completed: false,
        },
        {
          time: '17:00',
          amount: '200ml',
          message: '🌃黄昏航行补给，避免燃料枯竭',
          effect: '缓解疲劳，准备晚餐',
          completed: false,
        },
        {
          time: '19:30',
          amount: '200ml',
          message: '🍃晚餐后生态维护，启动清洁协议',
          effect: '稀释血液浓度',
          completed: false,
        },
        {
          time: '21:00',
          amount: '200ml',
          message: '🏥休眠前2小时，完成终极补给',
          effect: '预防夜间脱水',
          completed: false,
        },
      ],
      totalWaterIntake: 0,
    }
  },
  computed: {
    dailyGoal() {
      // 这里可以根据需求设置每日喝水目标量
      return this.waterSchedule.reduce((total, item) => {
        // 从字符串中提取数字部分，例如从'300ml'中提取300
        const amount = parseInt(item.amount.replace(/[^0-9]/g, ''))
        return total + amount
      }, 0)
    },
  },
  onLoad() {
    // 生成粒子动画元素
    this.generateParticles()

    // 初始化计算总水量摄入
    this.calculateTotalWaterIntake()
  },
  methods: {
    // 生成随机粒子动画元素
    generateParticles() {
      const particles = []
      for (let i = 0; i < 30; i++) {
        particles.push({
          left: Math.floor(Math.random() * 750),
          top: Math.floor(Math.random() * 1334),
          delay: (Math.random() * 8).toFixed(2),
          opacity: (Math.random() * 0.5 + 0.1).toFixed(2),
          size: Math.floor(Math.random() * 10) + 4,
        })
      }
      this.particles = particles
    },

    // 判断是否为当前时间段
    isCurrentTimeSlot(timeString) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      const [hour, minute] = timeString.split(':').map(Number)

      // 当前时间在这个时间点的前后30分钟内，视为当前时间段
      const currentTimeInMinutes = currentHour * 60 + currentMinute
      const slotTimeInMinutes = hour * 60 + minute

      return Math.abs(currentTimeInMinutes - slotTimeInMinutes) <= 30
    },

    // 判断时间是否已过
    hasTimePassed(timeString) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()

      const [hour, minute] = timeString.split(':').map(Number)

      if (currentHour > hour) {
        return true
      } else if (currentHour === hour && currentMinute > minute) {
        return true
      }

      return false
    },

    // 切换完成状态
    toggleCompleted(index) {
      // 切换完成状态
      this.waterSchedule[index].completed = !this.waterSchedule[index].completed

      // 重新计算总水量摄入
      this.calculateTotalWaterIntake()

      // 可以在这里添加提示或动画效果
      uni.showToast({
        title: this.waterSchedule[index].completed ? '已完成饮水任务！' : '已取消完成状态',
        icon: 'none',
        duration: 1500,
      })
    },

    // 计算总水量摄入
    calculateTotalWaterIntake() {
      this.totalWaterIntake = this.waterSchedule
        .filter(item => item.completed)
        .reduce((total, item) => {
          // 从字符串中提取数字部分，例如从'300ml'中提取300
          const amount = parseInt(item.amount.replace(/[^0-9]/g, ''))
          return total + amount
        }, 0)
    },
  },
}
</script>

<style>
/* 容器样式 */
.container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
  overflow: hidden;
}

/* 背景效果 */
.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(6, 7, 9, 0.6);
  z-index: -3;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(100, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 40rpx 40rpx;
  z-index: -2;
  animation: gridPulse 8s ease-in-out infinite;
}

@keyframes gridPulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}

/* 粒子动画 */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(120, 255, 255, 0.9), rgba(100, 200, 255, 0));
  box-shadow: 0 0 15rpx rgba(120, 255, 255, 0.7);
  animation: particleFloat 15s infinite linear;
  filter: blur(1px);
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0) scale(1) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translateY(-100rpx) translateX(50rpx) scale(1.2) rotate(180deg);
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-200rpx) translateX(100rpx) scale(0.5) rotate(360deg);
    opacity: 0;
  }
}

/* 添加科技感光线效果 */
.container::before {
  content: '';
  position: absolute;
  top: -100rpx;
  left: -100rpx;
  right: -100rpx;
  height: 300rpx;
  background: linear-gradient(90deg, transparent, rgba(120, 255, 255, 0.1), transparent);
  transform: rotate(45deg);
  animation: lightBeam 8s infinite linear;
  z-index: -1;
}

@keyframes lightBeam {
  0% {
    transform: translateX(-100%) rotate(45deg);
    opacity: 0;
  }
  30% {
    opacity: 0.5;
  }
  70% {
    opacity: 0.5;
  }
  100% {
    transform: translateX(100%) rotate(45deg);
    opacity: 0;
  }
}

/* 波浪效果 */
.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  overflow: hidden;
  z-index: -1;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%2364ffff" fill-opacity="0.2" d="M0,192L48,186.7C96,181,192,171,288,181.3C384,192,480,224,576,229.3C672,235,768,213,864,181.3C960,149,1056,107,1152,101.3C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  background-repeat: repeat-x;
  background-position: 0 bottom;
  background-size: 50% 100%;
  transform: translate3d(0, 0, 0);
  filter: drop-shadow(0 0 8rpx rgba(100, 255, 255, 0.3));
}

.wave1 {
  animation: wave 15s infinite linear;
  z-index: 1;
  opacity: 0.4;
  animation-delay: 0s;
  bottom: 0;
}

.wave2 {
  animation: wave 20s infinite linear;
  z-index: 0;
  opacity: 0.2;
  animation-delay: -5s;
  bottom: 10rpx;
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* 添加数字雨效果 */
.container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(
    0deg,
    rgba(100, 255, 255, 0.03) 25%,
    rgba(100, 255, 255, 0) 25%,
    rgba(100, 255, 255, 0) 50%,
    rgba(100, 255, 255, 0.03) 50%,
    rgba(100, 255, 255, 0.03) 75%,
    rgba(100, 255, 255, 0) 75%
  );
  background-size: 10rpx 10rpx;
  z-index: -2;
  opacity: 0.5;
  animation: digitalRain 20s linear infinite;
}

@keyframes digitalRain {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 1000rpx;
  }
}

/* 主卡片样式 */
.main-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.2), 0 0 20rpx rgba(100, 255, 255, 0.2) inset;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 40rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  color: #fff;
  position: relative;
  z-index: 1;
}

.main-card::before {
  content: '';
  position: absolute;
  top: -10rpx;
  left: -10rpx;
  right: -10rpx;
  height: 10rpx;
  background: linear-gradient(90deg, transparent, rgba(100, 255, 255, 0.5), transparent);
  filter: blur(2px);
  z-index: 2;
  animation: scanline 4s linear infinite;
}

@keyframes scanline {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(calc(100% + 40rpx));
    opacity: 0;
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
}

.title-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: 48rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 10rpx;
  letter-spacing: 2rpx;
  text-shadow: 0 0 10rpx rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1rpx;
}

@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 10rpx rgba(124, 255, 255, 0.5);
  }
  100% {
    box-shadow: 0 0 20rpx rgba(124, 255, 255, 0.8);
  }
}

/* 饮水进度统计 */
.water-stats {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.water-progress-container {
  flex: 1;
  margin-right: 20rpx;
}

.water-progress-bar {
  height: 16rpx;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
  /* box-shadow: 0 0 8rpx rgba(0, 0, 0, 0.2) inset; */
}

.water-progress {
  height: 100%;
  background: linear-gradient(90deg, #64ffff, #7cffff);
  border-radius: 8rpx;
  transition: width 0.5s ease;
  box-shadow: 0 0 10rpx rgba(124, 255, 255, 0.5);
}

.water-labels {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
}

.water-amount {
  color: #64ffff;
  font-weight: 600;
}

.water-goal {
  color: rgba(255, 255, 255, 0.7);
}

.water-percentage {
  background-color: rgba(100, 255, 255, 0.15);
  color: #64ffff;
  font-size: 32rpx;
  font-weight: 600;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(100, 255, 255, 0.3);
  box-shadow: 0 0 15rpx rgba(100, 255, 255, 0.2);
  text-shadow: 0 0 10rpx rgba(100, 255, 255, 0.5);
}

/* 喝水时间表 */
.schedule-container {
  margin-top: 20rpx;
}

.schedule-item {
  display: flex;
  margin-bottom: 30rpx;
  transition: all 0.3s ease;
  position: relative;
}

/* DataV 边框样式 */
.datav-border-box .schedule-card {
  position: relative;
  border: none;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 20rpx;
}

.datav-border-box .schedule-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  z-index: -1;
}

/* 边框效果 */
.datav-border-box .schedule-card {
  box-shadow: 0 0 3rpx 3rpx rgba(0, 255, 255, 0.1);
  border-radius: 20rpx;
  overflow: visible;
}

.datav-border-box .schedule-card::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 20rpx;
  box-shadow: inset 0 0 40rpx rgba(0, 255, 255, 0.3);
  z-index: -1;
}

.datav-border-box .schedule-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20rpx;
  border: 1px solid rgba(0, 255, 255, 0.5);
  z-index: -1;
}

.datav-border-box .border-box-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  border-radius: 20rpx;
}

/* 四个角的装饰 */
.datav-border-box .border-box-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  background: 
    linear-gradient(to right, rgba(0, 255, 255, 0.8) 2px, transparent 2px) top left no-repeat,
    linear-gradient(to bottom, rgba(0, 255, 255, 0.8) 2px, transparent 2px) top left no-repeat,
    linear-gradient(to left, rgba(0, 255, 255, 0.8) 2px, transparent 2px) top right no-repeat,
    linear-gradient(to bottom, rgba(0, 255, 255, 0.8) 2px, transparent 2px) top right no-repeat,
    linear-gradient(to right, rgba(0, 255, 255, 0.8) 2px, transparent 2px) bottom left no-repeat,
    linear-gradient(to top, rgba(0, 255, 255, 0.8) 2px, transparent 2px) bottom left no-repeat,
    linear-gradient(to left, rgba(0, 255, 255, 0.8) 2px, transparent 2px) bottom right no-repeat,
    linear-gradient(to top, rgba(0, 255, 255, 0.8) 2px, transparent 2px) bottom right no-repeat;
  background-size: 30rpx 30rpx;
  z-index: 1;
}

@keyframes borderLightMove {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 0%;
  }
}

/* 为活跃项目添加更明显的效果 */
.datav-border-box.active .border-box-content::after {
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 5%,
    rgba(0, 255, 255, 1) 5%,
    rgba(0, 255, 255, 1) 10%,
    transparent 10%,
    transparent 100%
  );
  animation-duration: 2s;
}

/* 调整文字颜色以适应深色背景 */
.datav-border-box .schedule-time,
.datav-border-box .schedule-amount {
  color: #64ffff;
}

.datav-border-box .schedule-message {
  color: rgba(255, 255, 255, 0.9);
}

.datav-border-box .schedule-effect {
  color: rgba(255, 255, 255, 0.7);
}

.time-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20rpx;
  width: 40rpx;
}

.time-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background-color: rgba(100, 255, 255, 0.5);
  margin-top: 20rpx;
  box-shadow: 0 0 10rpx rgba(100, 255, 255, 0.3);
}

.schedule-item.active .time-dot {
  background-color: #64ffff;
  box-shadow: 0 0 15rpx rgba(100, 255, 255, 0.8);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(100, 255, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10rpx rgba(100, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(100, 255, 255, 0);
  }
}

.time-line {
  width: 2rpx;
  flex-grow: 1;
  background-color: rgba(100, 255, 255, 0.3);
  margin-top: 5rpx;
}

.schedule-card {
  flex: 1;
  border-radius: 20rpx;
  padding: 20rpx;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1px solid rgba(100, 255, 255, 0.2);
}

.schedule-time {
  font-size: 36rpx;
  font-weight: 600;
  color: #0066cc;
}

.schedule-amount {
  font-size: 28rpx;
  color: #0066cc;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.schedule-content {
  display: flex;
  flex-direction: column;
}

.schedule-message {
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.schedule-effect {
  font-size: 24rpx;
}

/* 饮水按钮样式 */
.schedule-action {
  margin-top: 15rpx;
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.drink-button {
  background-color: #000;
  color: #fff;
  font-size: 24rpx;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  border: 1px solid #fff;
  box-shadow: 0 0 10rpx rgba(0, 102, 204, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  line-height: 1.5;
  min-width: 160rpx;
  margin-left: 0;
  margin-right: 0;
}

.drink-button:active {
  transform: scale(0.98);
}

.drink-button.completed {
  background-color: rgba(145, 252, 253, 0.5);
  color: #ffffff;
  border: 1px solid #91fcfd;
}

/* 添加禁用状态样式 */
.drink-button.disabled {
  background-color: #f7f7f7;
  color: rgba(100, 100, 100, 0.8);
  border: none;
  cursor: not-allowed;
}

.drink-button.disabled:active {
  transform: none;
}
</style>
