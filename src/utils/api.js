
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
  },
  
  // 获取用户每日喝水任务列表
  getWaterTaskList: (openid) => {
    return request(`/api/water-task/list/${openid}`, 'GET');
  },
  
  // 完成喝水任务
  completeWaterTask: (taskId, openid) => {
    return request(`/api/water-task/complete`, 'POST', { openid, taskId });
  },
  
  // 取消完成喝水任务
  cancelWaterTask: (taskId, openid) => {
    return request(`/api/water-task/cancel`, 'POST', { openid, taskId });
  },

  // 获取用户今天喝水量
  getTodayWater: (openid) => {
    return request(`/api/water-task/today-water/${openid}`, 'GET');
  }
};

export default api;
