//index.js
//获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager()
const options = {
  format: 'aac',
}
const innerAudioContext = wx.createInnerAudioContext()
innerAudioContext.autoplay = true
recorderManager.onStart(() => {
  console.log('recorder start')
})
recorderManager.onStop((res) => {
  wx.showLoading({
    title: '识别中',
    mask: true,
  })
  wx.uploadFile({
    url: 'https://api.robot.lerzen.com/chat.html',
    filePath: res.tempFilePath,
    name: 'file',
    formData: {
      'token': wx.getStorageSync('token')
    },
    dataType: 'json',
    success: function (res) {
      wx.hideLoading()
      var data = JSON.parse(res.data);
      innerAudioContext.src = data.data.audio;
      innerAudioContext.play();
    },
    fail: function(){
      wx.hideLoading()
    }
  })
})
recorderManager.onFrameRecorded((res) => {
  const { frameBuffer } = res
  console.log('frameBuffer.byteLength', frameBuffer.byteLength)
})

Page({
  data: {
    recordAudioButtonText: '按住 说话',
    userInfo: {
      nickName: wx.getStorageSync('nickName'),
      avatarUrl: wx.getStorageSync('avatarUrl')
    }
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  startRecordAudio: function(e){
    recorderManager.start(options)
    this.setData({
      recordAudioButtonText: '松开 结束',
    })
    wx.showLoading({
      title: '录音中',
      mask: true,
    })
  },
  stopRecordAudio: function (e) {
    recorderManager.stop(options)
    this.setData({
      recordAudioButtonText: '按住 说话',
    })
    wx.hideLoading()
  }
})
