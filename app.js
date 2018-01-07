//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 获取用户信息
    wx.getSetting({
      success: res => {
        // 登录
        wx.login({
          success: res => {
            if (res.code) {
              var code = res.code;
              wx.getUserInfo({
                success: res => {
                  this.globalData.userInfo = res.userInfo
                  if (this.userInfoReadyCallback) {
                    this.userInfoReadyCallback(res)
                  }
                  wx.request({
                    url: 'https://api.robot.lerzen.com/login.html',
                    data: {
                      code: code,
                      encryptedData: res.encryptedData,
                      iv: res.iv,
                    },
                    success: function (res) {
                      var data = res.data.data;
                      wx.setStorageSync('openID', data.openID);
                      wx.setStorageSync('unionID', data.unionID);
                      wx.setStorageSync('openID', data.openID);
                      wx.setStorageSync('openID', data.openID);
                    }
                  })
                }
              })
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          }
        })
        
        wx.authorize({
          scope: 'scope.record',
        })
      }
    })
  },
  globalData: {
    userInfo: null
  }
})