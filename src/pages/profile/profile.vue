<template>
  <view class="container profile-container">
    <!-- 用户信息卡片 -->
    <view class="profile-card" :class="{ 'animate-in': showAnimation }">
      <view class="avatar-container">
        <view class="avatar">
          <text class="avatar-text">{{ userInitial }}</text>
        </view>
      </view>
      <view class="user-info">
        <view class="username" :class="{'username-login': !userInfo}" @tap="!userInfo && handleLogin()">
          {{ userInfo ? userInfo.nickname : '点击登录' }}
        </view>
        <view class="user-status" v-if="userInfo">
          <view class="status-indicator" :class="userInfo.subscribed ? 'status-active' : 'status-inactive'"></view>
          <text>{{ userInfo.subscribed ? '已订阅提醒服务' : '未订阅提醒服务' }}</text>
        </view>
      </view>
    </view>

    <!-- 订阅状态卡片 -->
    <view class="info-section" :class="{ 'animate-in': showAnimation }" v-if="userInfo">
      <view class="section-header">
        <text class="icon subscription-icon">🔔</text>
        <text class="section-title">订阅状态</text>
      </view>
      <view class="section-content">
        <view class="status-card" :class="userInfo.subscribed ? 'status-active-card' : 'status-inactive-card'">
          <view class="status-info">
            <text class="status-title">{{ userInfo.subscribed ? '已开启喝水提醒' : '未开启喝水提醒' }}</text>
            <text class="status-desc">{{ userInfo.subscribed ? '您将定期收到喝水提醒通知' : '开启后将定期收到喝水提醒' }}</text>
          </view>
          <view class="status-action">
            <button 
              :class="userInfo.subscribed ? 'btn-danger' : 'btn-primary'" 
              @tap="userInfo.subscribed ? handleUnsubscribe() : handleSubscribe()"
              :loading="isLoading">
              {{ userInfo.subscribed ? '取消订阅' : '立即订阅' }}
            </button>
          </view>
        </view>
        <view class="reminder-info" v-if="userInfo.subscribed && userInfo.lastReminded">
          <text class="icon time-icon">⏰</text>
          <text>上次提醒：{{ lastRemindedTime }}</text>
        </view>
      </view>
    </view>

    <!-- 设置选项 -->
    <view class="info-section" :class="{ 'animate-in': showAnimation }">
      <view class="section-header">
        <text class="icon settings-icon">⚙️</text>
        <text class="section-title">设置</text>
      </view>
      <view class="section-content">
        <view class="setting-item" @tap="navigateToIndex">
          <view class="setting-info">
            <text class="icon home-icon">🏠</text>
            <text>返回首页</text>
          </view>
          <text class="icon arrow-icon">➡️</text>
        </view>
        <view class="setting-item" v-if="userInfo" @tap="handleLogout">
          <view class="setting-info">
            <text class="icon logout-icon">🚪</text>
            <text>退出登录</text>
          </view>
          <text class="icon arrow-icon">➡️</text>
        </view>
      </view>
    </view>

    <!-- 关于应用 -->
    <view class="info-section" :class="{ 'animate-in': showAnimation }">
      <view class="section-header">
        <text class="icon about-icon">📘</text>
        <text class="section-title">关于</text>
      </view>
      <view class="section-content">
        <view class="about-card">
          <view class="app-name">喝水提醒</view>
          <view class="app-version">版本 1.0.0</view>
          <view class="app-desc">每天喝足够的水，保持健康</view>
        </view>
      </view>
    </view>

    <!-- 移除自定义消息提示 -->
    <!-- <view class="message" :class="messageType" v-if="message">
      {{ message }}
    </view> -->
  </view>
</template>

<script>
import api from '../../utils/api.js';

export default {
  data() {
    return {
      userInfo: null,
      isLoading: false,
      // message: '', // 不再需要
      // messageType: '', // 不再需要
      lastRemindedTime: '',
      showAnimation: false
    };
  },
  computed: {
    userInitial() {
      if (this.userInfo && this.userInfo.nickname) {
        return this.userInfo.nickname.charAt(0).toUpperCase();
      }
      return '?';
    }
  },
  onShow() {
    // 从全局数据获取用户信息
    const app = getApp();
    if (app.globalData.userInfo) {
      this.userInfo = app.globalData.userInfo;
      this.fetchUserInfo();
    } else {
      this.userInfo = null;
    }
    
    // 延迟触发动画
    setTimeout(() => {
      this.showAnimation = true;
    }, 100);
  },
  methods: {
    // 获取用户信息
    fetchUserInfo() {
      if (!this.userInfo || !this.userInfo.openid) return;
      
      api.getUserInfo(this.userInfo.openid)
        .then(data => {
          if (data.success) {
            const user = data.user;
            this.userInfo = {
              openid: user.openid,
              nickname: user.nickname,
              subscribed: user.subscribed,
              lastReminded: user.lastReminded
            };
            
            // 格式化最后提醒时间
            if (user.lastReminded) {
              const date = new Date(user.lastReminded);
              this.lastRemindedTime = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            }
            
            // 更新全局数据和本地存储
            getApp().globalData.userInfo = this.userInfo;
            uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
          }
        })
        .catch(err => {
          console.error('获取用户信息失败:', err);
        });
    },
    
    // 处理订阅
    handleSubscribe() {
      this.isLoading = true;
      this.message = '';
      
      // 请求订阅消息权限
      uni.requestSubscribeMessage({
        tmplIds: [getApp().globalData.subscribeTemplateId],
        success: (res) => {
          // 检查用户是否同意订阅
          if (res[getApp().globalData.subscribeTemplateId] === 'accept') {
            // 调用订阅接口
            api.subscribe(this.userInfo.openid, this.userInfo.nickname)
              .then(data => {
                // 更新用户信息
                this.userInfo.subscribed = true;
                getApp().globalData.userInfo = this.userInfo;
                uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
                
                this.showMessage('订阅成功，您将定期收到喝水提醒', 'message-success');
              })
              .catch(err => {
                console.error('订阅失败:', err);
                this.showMessage('订阅失败: ' + (err.errMsg || '服务器错误'), 'message-error');
              })
              .finally(() => {
                this.isLoading = false;
              });
          } else {
            this.showMessage('您拒绝了订阅请求', 'message-error');
            this.isLoading = false;
          }
        },
        fail: (err) => {
          console.error('订阅请求失败:', err);
          this.showMessage('订阅请求失败', 'message-error');
          this.isLoading = false;
        }
      });
    },
    
    // 处理取消订阅
    handleUnsubscribe() {
      this.isLoading = true;
      this.message = '';
      
      api.unsubscribe(this.userInfo.openid)
        .then(data => {
          // 更新用户信息
          this.userInfo.subscribed = false;
          getApp().globalData.userInfo = this.userInfo;
          uni.setStorageSync('userInfo', JSON.stringify(this.userInfo));
          
          this.showMessage('已取消订阅喝水提醒', 'message-info');
        })
        .catch(err => {
          console.error('取消订阅失败:', err);
          this.showMessage('取消订阅失败: ' + (err.errMsg || '服务器错误'), 'message-error');
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    
    // 显示消息
    showMessage(msg, type) {
      // 将自定义消息替换为uni.showToast
      let icon = 'none';
      if (type === 'message-success') {
        icon = 'success';
      } else if (type === 'message-error') {
        icon = 'error';
      }
      
      uni.showToast({
        title: msg,
        icon: icon,
        duration: 3000
      });
    },
    
    // 导航到首页
    navigateToIndex() {
      uni.switchTab({
        url: '/pages/index/index'
      });
    },
    
    // 退出登录
    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除用户信息
            this.userInfo = null;
            getApp().globalData.userInfo = null;
            uni.removeStorageSync('userInfo');
            this.showMessage('已退出登录', 'message-info');
          }
        }
      });
    },
    
    // 处理登录
    handleLogin() {
      this.isLoading = true;
      
      // 先获取用户信息
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: profileRes => {
          const userInfo = profileRes.userInfo;
          const nickname = userInfo.nickName || '用户' + Math.floor(Math.random() * 10000);
          
          // 获取用户信息成功后再进行微信登录
          uni.login({
            provider: 'weixin',
            success: res => {
              if (res.code) {
                // 调用后端登录接口
                api.login(res.code, nickname)
                  .then(data => {
                    const userInfo = {
                      openid: data.openid,
                      nickname: data.nickname || nickname,
                      subscribed: data.subscribed,
                    };

                    // 保存用户信息
                    this.userInfo = userInfo;
                    getApp().globalData.userInfo = userInfo;
                    uni.setStorageSync('userInfo', JSON.stringify(userInfo));

                    // 获取完整用户信息
                    this.fetchUserInfo();
                    this.showMessage('登录成功', 'message-success');
                  })
                  .catch(err => {
                    console.error('登录失败:', err);
                    this.showMessage('登录失败: ' + (err.errMsg || '服务器错误'), 'message-error');
                  })
                  .finally(() => {
                    this.isLoading = false;
                  });
              } else {
                this.showMessage('登录失败', 'message-error');
                this.isLoading = false;
              }
            },
            fail: err => {
              console.error('微信登录失败:', err);
              this.showMessage('微信登录失败', 'message-error');
              this.isLoading = false;
            }
          });
        },
        fail: err => {
          console.error('获取用户信息失败:', err);
          this.showMessage('获取用户信息失败', 'message-error');
          this.isLoading = false;
        }
      });
    }
  }
};
</script>

<style>
/* 个人资料页面样式 */
.profile-container {
  min-height: 100vh;
  padding-bottom: 60rpx;
}

/* 用户信息卡片 */
.profile-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 20rpx rgba(46, 125, 50, 0.2);
  transform: translateY(20rpx);
  opacity: 0;
  transition: all 0.5s ease;
}

.profile-card.animate-in {
  transform: translateY(0);
  opacity: 1;
}

.avatar-container {
  margin-right: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.avatar-text {
  font-size: 60rpx;
  font-weight: bold;
  color: #4CAF50;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 40rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 10rpx;
}

.username-login {
  color: #e0f7fa;
  text-decoration: underline;
  padding: 10rpx 0;
}

.username-login:active {
  opacity: 0.8;
}

.user-status {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.status-indicator {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  margin-right: 10rpx;
}

.status-active {
  background-color: #4CAF50;
  box-shadow: 0 0 10rpx #4CAF50;
}

.status-inactive {
  background-color: #f44336;
  box-shadow: 0 0 10rpx #f44336;
}

/* 信息区块 */
.info-section {
  background-color: white;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transform: translateY(20rpx);
  opacity: 0;
  transition: all 0.5s ease;
}

.info-section.animate-in {
  transform: translateY(0);
  opacity: 1;
  transition-delay: calc(var(--index, 0) * 0.1s);
}

.info-section:nth-child(2) {
  --index: 1;
}

.info-section:nth-child(3) {
  --index: 2;
}

.info-section:nth-child(4) {
  --index: 3;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.icon {
  font-family: 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif;
  margin-right: 15rpx;
  font-size: 36rpx;
}

.subscription-icon {
  color: #4CAF50;
}

.settings-icon {
  color: #607D8B;
}

.about-icon {
  color: #2196F3;
}

.time-icon {
  color: #FF9800;
}

.home-icon {
  color: #4CAF50;
}

.logout-icon {
  color: #f44336;
}

.arrow-icon {
  margin-left: auto;
  margin-right: 0;
  color: #bbb;
}

.section-content {
  padding: 20rpx 30rpx;
}

/* 订阅状态卡片 */
.status-card {
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.status-active-card {
  background-color: #e8f5e9;
}

.status-inactive-card {
  background-color: #ffebee;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.status-active-card .status-title {
  color: #2E7D32;
}

.status-inactive-card .status-title {
  color: #C62828;
}

.status-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
}

.status-action {
  margin-left: 20rpx;
}

.status-action button {
  margin: 0;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
  line-height: 1.5;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.status-action button:active {
  transform: scale(0.95);
}

.reminder-info {
  font-size: 26rpx;
  color: #795548;
  padding: 20rpx;
  background-color: #FFF8E1;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:active {
  background-color: #f5f5f5;
}

.setting-info {
  display: flex;
  align-items: center;
}

/* 关于应用 */
.about-card {
  padding: 30rpx;
  text-align: center;
}

.app-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.app-version {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.app-desc {
  font-size: 28rpx;
  color: #666;
}

/* 消息提示 */
.message {
  position: fixed;
  bottom: 60rpx;
  left: 50%;
  transform: translateX(-50%);
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 20rpx);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
