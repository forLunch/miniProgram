//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    stepInfoList: []//微信运动步数列表
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo)
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function (e) {
    if (!this.data.logged && e.detail.userInfo) {
      console.log(e.detail.userInfo)
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetRunData: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
    }).then(login => {
      let openid = login.result.openid;
      wx.getWeRunData({
        success(res) {
          // 或拿 cloudID 通过云调用直接获取开放数据
          const cloudID = res.cloudID
          wx.cloud.callFunction({
            name: 'runData',
            data: {
              weRunData: wx.cloud.CloudID(cloudID), // 这个 CloudID 值到云函数端会被替换
              obj: {
                shareInfo: wx.cloud.CloudID(cloudID), // 非顶层字段的 CloudID 不会被替换，会原样字符串展示
              }
            }
          }).then(data => {
            if (data.errMsg == 'cloud.callFunction:ok') {
              console.log(data.result.todayStep);
              wx.showToast({
                title: '今日步数' + data.result.todayStep,
                icon: '',
                duration: 4000
              })

            }

          })
        }
      })
    })
  },


})
