<script>
import config from './utils/config.js';

export default {
  globalData: {
    userInfo: null,
    baseUrl: config.baseUrl // 从配置文件导入
  },
  onLaunch: function() {
    // 获取本地存储的用户信息
    try {
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo) {
        this.globalData.userInfo = JSON.parse(userInfo);
      }
    } catch (e) {
      console.error('获取存储的用户信息失败:', e);
    }
  }
}
</script>

<style>
/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei', sans-serif;
  background-color: #f8f8f8;
}

.container {
  padding: 30rpx;
  box-sizing: border-box;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
  border-radius: 10rpx;
  width: 80%;
  margin: 20rpx 0;
}

.btn-danger {
  background-color: #f44336;
  color: white;
  border-radius: 10rpx;
  width: 80%;
  margin: 20rpx 0;
}

.btn-default {
  background-color: #f8f8f8;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 10rpx;
  width: 80%;
  margin: 20rpx 0;
}

.message {
  width: 90%;
  padding: 20rpx;
  border-radius: 10rpx;
  margin: 20rpx 0;
  text-align: center;
}

.message-success {
  background-color: #e8f5e9;
  color: #1b5e20;
}

.message-error {
  background-color: #ffebee;
  color: #b71c1c;
}

.message-info {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.card {
  width: 90%;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
  margin: 20rpx 0;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  text-align: center;
}

.subtitle {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
}
</style>
