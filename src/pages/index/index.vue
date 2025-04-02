<template>
  <view class="container">
    <!-- 主内容卡片 -->
    <view class="main-card">
      <view class="card-header">
        <view class="title-container">
          <text class="title">智能水分管家</text>
          <text class="subtitle">科学补水，健康生活</text>
        </view>
      </view>

      <!-- 水分摄入可视化 -->
      <view class="hydration-visualization">
        <view class="progress-ring-container" @tap="navigateToProgress">
          <view class="progress-ring" :class="{ 'pulse-animation': isPulsing }">
            <view
              class="progress-ring-circle"
              :style="{ transform: 'rotate(' + 180 * dailyProgress + 'deg)' }"></view>
            <view
              class="progress-ring-mask"
              :style="{
                transform: 'rotate(' + 180 * Math.min(1, dailyProgress * 2) + 'deg)',
              }"></view>
            <view class="progress-ring-inner">
              <text class="progress-percentage">{{ Math.round(dailyProgress * 100) }}%</text>
              <text class="progress-label">今日进度</text>
            </view>
          </view>
          <view class="ring-ripple"></view>
        </view>

        <view class="hydration-stats">
          <view class="stat-item">
            <view class="stat-icon">💧</view>
            <view class="stat-content">
              <text class="stat-label">目标摄入</text>
              <text class="stat-value">{{ targetWaterIntake }}ml</text>
            </view>
          </view>
          <view class="stat-item">
            <view class="stat-icon">🥤</view>
            <view class="stat-content">
              <text class="stat-label">当前摄入</text>
              <text class="stat-value">{{ currentWaterIntake }}ml</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 分隔线 -->
      <view class="divider"></view>

      <!-- 登录/订阅区域 -->
      <block v-if="!userInfo">
        <view class="action-section">
          <view class="action-description">
            <text class="action-title">开启智能提醒</text>
            <text class="action-subtitle">登录后即可订阅个性化喝水提醒</text>
          </view>
          <button class="btn-login" @tap="handleLogin" :loading="isLoading">
            <view class="btn-icon">🔐</view>
            <text class="btn-text">微信一键登录</text>
          </button>
        </view>
      </block>

      <block v-else>
        <view class="divider"></view>

        <view class="action-section">
          <button
            v-if="!userInfo.subscribed"
            class="btn-subscribe"
            @tap="handleSubscribe"
            :loading="isLoading">
            <view class="btn-icon">🔔</view>
            <text class="btn-text">开启智能提醒</text>
          </button>

          <button v-else class="btn-unsubscribe" @tap="handleUnsubscribe" :loading="isLoading">
            <view class="btn-icon">🔕</view>
            <text class="btn-text">关闭提醒</text>
          </button>
        </view>

        <view v-if="userInfo.lastReminded" class="reminder-section">
          <view class="reminder-card">
            <view class="reminder-icon">🕒</view>
            <view class="reminder-info">
              <text class="reminder-label">上次提醒 </text>
              <text class="reminder-time">{{ lastRemindedTime }}</text>
            </view>
          </view>
        </view>
      </block>
    </view>

    <!-- 科技感波浪效果 -->
    <view class="wave-container">
      <view class="wave wave1"></view>
      <view class="wave wave2"></view>
    </view>
  </view>
</template>

<script>
import api from '../../utils/api.js'
import config from '../../utils/config.js'

export default {
  data() {
    return {
      userInfo: null,
      isLoading: false,
      lastRemindedTime: '',
      targetWaterIntake: 1600,
      currentWaterIntake: 0,
      isPulsing: false,
    }
  },
  onShow() {
    // 从全局数据获取用户信息
    const app = getApp()
    if (app.globalData.userInfo) {
      this.userInfo = app.globalData.userInfo
      this.fetchUserInfo()
    } else {
      this.userInfo = null
    }
  },
  computed: {
    dailyProgress() {
      return this.currentWaterIntake / this.targetWaterIntake
    },
  },
  methods: {
    fetchTodayWaterIntake() {
      if (!this.userInfo || !this.userInfo.openid) return
      api.getTodayWater(this.userInfo.openid).then(res => {
        console.log('res', res);
        if (res.success) {
          this.currentWaterIntake = res.totalWater || 0
        } else {
          this.currentWaterIntake = 0
        }
      })
    },
    // 导航到进度页面
    navigateToProgress() {
      // 点击时触发脉冲动画
      this.isPulsing = true

      // 300ms后导航到进度页面
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/progress/progress',
        })
        this.isPulsing = false
      }, 300)
    },

    // 处理登录
    handleLogin() {
      this.isLoading = true

      // 先获取用户信息
      uni.getUserProfile({
        desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
        success: profileRes => {
          console.log('获取用户信息成功', profileRes)
          const userInfo = profileRes.userInfo
          const nickname = userInfo.nickName || '用户' + Math.floor(Math.random() * 10000)

          // 获取用户信息成功后再进行微信登录
          uni.login({
            provider: 'weixin',
            success: res => {
              console.log('登录成功', res)
              if (res.code) {
                // 调用后端登录接口
                api
                  .login(res.code, nickname)
                  .then(data => {
                    console.log('登录成功', data)
                    const userInfo = {
                      openid: data.openid,
                      nickname: data.nickname || nickname,
                      subscribed: data.subscribed,
                    }

                    // 保存用户信息
                    this.userInfo = userInfo
                    getApp().globalData.userInfo = userInfo
                    uni.setStorageSync('userInfo', JSON.stringify(userInfo))

                    // 获取完整用户信息
                    this.fetchUserInfo()
                    this.showMessage('登录成功', 'message-success')
                  })
                  .catch(err => {
                    console.error('登录失败:', err)
                    this.showMessage('登录失败: ' + (err.errMsg || '服务器错误'), 'message-error')
                  })
                  .finally(() => {
                    this.isLoading = false
                  })
              } else {
                this.showMessage('登录失败', 'message-error')
                this.isLoading = false
              }
            },
            fail: err => {
              console.error('微信登录失败:', err)
              this.showMessage('微信登录失败', 'message-error')
              this.isLoading = false
            },
          })
        },
        fail: err => {
          console.error('获取用户信息失败:', err)
          this.showMessage('获取用户信息失败:' + (err.errMsg || '服务器错误'), 'message-error')
          this.isLoading = false
        },
      })
    },

    // 处理订阅
    handleSubscribe() {
      this.isLoading = true
      this.message = ''

      // 请求订阅消息权限
      uni.requestSubscribeMessage({
        tmplIds: [config.subscribeTemplateId],
        success: res => {
          // 检查用户是否同意订阅
          if (res[config.subscribeTemplateId] === 'accept') {
            // 调用订阅接口
            api
              .subscribe(this.userInfo.openid, this.userInfo.nickname)
              .then(data => {
                // 更新用户信息
                this.userInfo.subscribed = true
                getApp().globalData.userInfo = this.userInfo
                uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))

                this.showMessage('订阅成功，您将定期收到喝水提醒', 'message-success')
              })
              .catch(err => {
                console.error('订阅失败:', err)
                this.showMessage('订阅失败: ' + (err.errMsg || '服务器错误'), 'message-error')
              })
              .finally(() => {
                this.isLoading = false
              })
          } else {
            this.showMessage('您拒绝了订阅请求', 'message-error')
            this.isLoading = false
          }
        },
        fail: err => {
          console.error('订阅请求失败:', err)
          this.showMessage('订阅请求失败', 'message-error')
          this.isLoading = false
        },
      })
    },

    // 处理取消订阅
    handleUnsubscribe() {
      this.isLoading = true
      this.message = ''

      api
        .unsubscribe(this.userInfo.openid)
        .then(data => {
          // 更新用户信息
          this.userInfo.subscribed = false
          getApp().globalData.userInfo = this.userInfo
          uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))

          this.showMessage('已取消订阅喝水提醒', 'message-info')
        })
        .catch(err => {
          console.error('取消订阅失败:', err)
          this.showMessage('取消订阅失败: ' + (err.errMsg || '服务器错误'), 'message-error')
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    // 获取用户信息
    fetchUserInfo() {
      if (!this.userInfo || !this.userInfo.openid) return

      this.fetchTodayWaterIntake()

      api
        .getUserInfo(this.userInfo.openid)
        .then(data => {
          if (data.success) {
            const user = data.user
            this.userInfo = {
              openid: user.openid,
              nickname: user.nickname,
              subscribed: user.subscribed,
              lastReminded: user.lastReminded,
            }

            // 格式化最后提醒时间
            if (user.lastReminded) {
              const date = new Date(user.lastReminded)
              this.lastRemindedTime = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
                .getHours()
                .toString()
                .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
            }

            // 更新全局数据和本地存储
            getApp().globalData.userInfo = this.userInfo
            uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))
          }
        })
        .catch(err => {
          console.error('获取用户信息失败:', err)
        })
    },

    // 显示消息
    showMessage(msg, type) {
      // 将自定义消息替换为uni.showToast
      let icon = 'none'
      if (type === 'message-success') {
        icon = 'success'
      } else if (type === 'message-error') {
        icon = 'error'
      }

      uni.showToast({
        title: msg,
        icon: icon,
        duration: 3000,
      })
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
  padding-top: 80rpx;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  background-color: rgba(20, 40, 80, 0.6);
}

/* 主卡片样式 */
.main-card {
  width: 100%;
  border-radius: 30rpx;
  backdrop-filter: blur(20px);
  padding: 40rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  color: #fff;
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
  color: #64ffff;
  margin-bottom: 10rpx;
  letter-spacing: 2rpx;
  text-shadow: 0 0 10rpx rgba(100, 255, 255, 0.5);
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1rpx;
}

/* 水分摄入可视化 */
.hydration-visualization {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20rpx 0 40rpx;
}

/* 进度环动态效果 */
.progress-ring-container {
  position: relative;
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 30rpx;
  cursor: pointer;
}

.progress-ring {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(20, 40, 80, 0.5);
  overflow: hidden;
  box-shadow: 0 0 20rpx rgba(100, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: breathe 3s infinite ease-in-out;
}

.progress-ring:active {
  transform: scale(0.95);
}

.ring-ripple {
  position: absolute;
  top: -10rpx;
  left: -10rpx;
  right: -10rpx;
  bottom: -10rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(100, 255, 255, 0.5);
  opacity: 0;
  animation: ripple 2s infinite ease-out;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes breathe {
  0%,
  100% {
    box-shadow: 0 0 20rpx rgba(100, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 30rpx rgba(100, 255, 255, 0.6);
  }
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  40% {
    opacity: 0.6;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.progress-ring-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: conic-gradient(#64ffff 0%, rgba(100, 255, 255, 0.3) 100%);
  mask: radial-gradient(transparent 60%, #000 60%);
  -webkit-mask: radial-gradient(transparent 60%, #000 60%);
  transform-origin: center;
}

.progress-ring-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #142850;
  transform-origin: center;
  transition: transform 0.5s ease;
}

.progress-ring-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(20, 40, 80, 0.8);
  border: 1px solid rgba(100, 255, 255, 0.2);
}

.progress-percentage {
  font-size: 40rpx;
  font-weight: bold;
  color: #64ffff;
}

.progress-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4rpx;
}

.hydration-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 20rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: rgba(20, 40, 80, 0.5);
  border-radius: 20rpx;
  border: 1px solid rgba(100, 255, 255, 0.1);
  min-width: 200rpx;
}

.stat-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #64ffff;
}

/* 分隔线 */
.divider {
  height: 1rpx;
  background: linear-gradient(to right, transparent, rgba(100, 255, 255, 0.3), transparent);
  margin: 30rpx 0;
}

/* 用户部分 */
.user-section {
  display: flex;
  align-items: center;
  padding: 10rpx 0;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #64ffff, #0a84ff);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
  box-shadow: 0 0 15rpx rgba(100, 255, 255, 0.5);
}

.user-avatar text {
  color: white;
  font-size: 36rpx;
  font-weight: 600;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 5rpx;
}

.subscription-status {
  display: flex;
  align-items: center;
  font-size: 24rpx;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.status-active {
  color: #64ffff;
}

.status-active .status-dot {
  background-color: #64ffff;
  box-shadow: 0 0 10rpx rgba(100, 255, 255, 0.8);
}

.status-inactive {
  color: #ff6464;
}

.status-inactive .status-dot {
  background-color: #ff6464;
  box-shadow: 0 0 10rpx rgba(255, 100, 100, 0.8);
}

/* 操作部分 */
.action-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 0;
}

.action-description {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.action-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10rpx;
}

.action-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 按钮样式 */
.btn-login,
.btn-subscribe,
.btn-unsubscribe {
  width: 80%;
  height: 90rpx;
  border-radius: 45rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  border: none;
}

.btn-login,
.btn-subscribe {
  background: linear-gradient(135deg, #64ffff, #0a84ff);
}

.btn-unsubscribe {
  background: linear-gradient(135deg, #ff6464, #ff2d55);
}

.btn-icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

.btn-text {
  color: white;
  font-size: 32rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
}

/* 提醒信息 */
.reminder-section {
  margin-top: 30rpx;
}

.reminder-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: rgba(20, 40, 80, 0.5);
  border-radius: 20rpx;
  border: 1px solid rgba(100, 255, 255, 0.1);
}

.reminder-icon {
  font-size: 36rpx;
  margin-right: 15rpx;
}

.reminder-info {
  flex: 1;
}

.reminder-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5rpx;
}

.reminder-time {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}
</style>
