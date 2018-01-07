//index.js
//获取应用实例
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()
innerAudioContext.autoplay = true
Page({
  data: {
    recordAudioButtonText: '按住 说话',
    userInfo: {
      nickName: wx.getStorageSync('nickName'),
      avatarUrl: wx.getStorageSync('avatarUrl')
    },
    messages: [
      {
        type: 'robot',
        message: '你好'
      },
      {
        type: 'user',
        message: '你好'
      },
    ]
  },
  recorderManager: wx.getRecorderManager(),
  onLoad: function () {
    this.recorderManager.onStop((res) => {
      var _this = this;
      wx.showLoading({
        title: '识别中',
        mask: true,
      })
      wx.uploadFile({
        url: 'https://api.robot.lerzen.com/chat/recognize.html',
        filePath: res.tempFilePath,
        name: 'file',
        formData: {
          'token': wx.getStorageSync('token')
        },
        dataType: 'json',
        success: function (res) {
          wx.hideLoading() 
          var data = JSON.parse(res.data).data;
          _this.appendMessage('user', data.chatRecord.message);
          wx.request({
            url: 'https://api.robot.lerzen.com/chat/chat.html',
            data: {
              'token': wx.getStorageSync('token'),
              chatRecordID: data.chatRecord.id
            },
            success: function (res) {
              var data = res.data.data;
              console.log(data);
              _this.appendMessage('robot', data.chatRecord.reply);
              innerAudioContext.src = data.chatRecord.replyAudio;
              innerAudioContext.play();
            }
          })
        },
        fail: function () {
          wx.hideLoading()
        }
      })
    })
    this.recorderManager.onError((res) => {
      wx.hideLoading()
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  startRecordAudio: function (e) {
    this.recorderManager.start({
      format: 'aac',
    })
    this.setData({
      recordAudioButtonText: '松开 结束',
    })
    wx.showLoading({
      title: '录音中',
      mask: true,
    })
  },
  stopRecordAudio: function (e) {
    this.recorderManager.stop()
    this.setData({
      recordAudioButtonText: '按住 说话',
    })
    wx.hideLoading()
  },
  appendMessage: function(type, message){
    var messages = this.data.messages;
    messages.push({ type: type, message: message});
    this.setData({
      messages: messages,
    })
  }
})
