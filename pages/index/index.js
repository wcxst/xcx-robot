//index.js
//获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager()
const options = {
  duration: 10000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac',
  frameSize: 50
}
const innerAudioContext = wx.createInnerAudioContext()
innerAudioContext.autoplay = true
recorderManager.onStart(() => {
  console.log('recorder start')
})
recorderManager.onStop((res) => {
  console.log('recorder stop', res)
  innerAudioContext.src = res.tempFilePath;
  innerAudioContext.play();
})
recorderManager.onFrameRecorded((res) => {
  const { frameBuffer } = res
  console.log('frameBuffer.byteLength', frameBuffer.byteLength)
})

Page({
  data: {
    recordAudioButtonText: '按住 说话',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    app.userInfoReadyCallback = res => {
      this.setData({
        userInfo: res.userInfo,
        hasUserInfo: true
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
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
