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
    defaultAvatar: {
      robot: '/images/default-robot.jpg',
      user: '/images/default-user.jpg',
    },
    messageViewWidth: wx.getSystemInfoSync().windowWidth - wx.getSystemInfoSync().windowWidth / 750 * 350,
    chatWrapHeight: wx.getSystemInfoSync().windowHeight - wx.getSystemInfoSync().windowWidth / 750 * 150,
    chatWrapScrollTop: 0,
    messages: [
      {
        type: 'robot',
        message: '你好,我是果冻,我可以陪你聊天帮你查天气哦~'
      },
    ]
  },
  recorderManager: wx.getRecorderManager(),
  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
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
          var responseData = JSON.parse(res.data);
          if (responseData.status == 0) {
            _this.appendMessage('error', '-- 没有识别出来,再试一次? --');
            return false;
          }
          var data = JSON.parse(res.data).data;
          _this.appendMessage('user', data.chatRecord.message);
          wx.request({
            url: 'https://api.robot.lerzen.com/chat/chat.html',
            data: {
              'token': wx.getStorageSync('token'),
              chatRecordID: data.chatRecord.id
            },
            success: function (res) {
              console.log(res.data);
              if (res.data.status == 0) {
                _this.appendMessage('error', '-- 果冻开小差了,再试一次? --');
                return false;
              }
              var data = res.data.data;
              switch (data.chatRecord.replyCode) {
                case '100000':
                  // 文本
                  _this.appendMessage('robot', data.chatRecord.reply);
                  break;
                case '200000':
                case '302000':
                case '308000':
                default:
                  _this.appendMessage('error', '-- 小程序暂不支持外部链接 --');
                  break;
              }
              innerAudioContext.src = data.chatRecord.replyAudio;
              innerAudioContext.play();
            },
            fail: function () {
              _this.appendMessage('error', '-- 果冻开小差了,再试一次? --');
            }
          })
        },
        fail: function () {
          wx.hideLoading()
        }
      })
    })
    this.recorderManager.onError((res) => {
      var _this = this;
      console.log(res);
      wx.hideLoading();
      if (res.errMsg == 'operateRecorder:fail auth deny'){
        _this.appendMessage('error', '-- 未授权使用录音功能 --');
      }
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
      chatWrapScrollTop: this.data.chatWrapScrollTop + 120
    })
  },
})
