
// 封装请求方法
const request = (url, method, data) => {
  const app = getApp();
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// API 方法
const api = {
  // 登录并获取 openid
  login: (code, nickname) => {
    return request('/api/login', 'POST', { code, nickname });
  },
  
  // 订阅喝水提醒
  subscribe: (openid, nickname) => {
    return request('/api/wechat/subscribe', 'POST', { openid, nickname });
  },
  
  // 取消订阅喝水提醒
  unsubscribe: (openid) => {
    return request('/api/wechat/unsubscribe', 'POST', { openid });
  },
  
  // 获取用户信息
  getUserInfo: (openid) => {
    return request(`/api/wechat/user/${openid}`, 'GET');
  }
};

export default api;
