//index.js
var bmap = require('../../libs/bmap-wx.min.js');
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    todayStep: 0,//微信运动步数列表
    weatherData: '',
    weatherTemperature: 0,//温度
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    wx.showLoading({
      title: '读心术施法中...',
      mask: true,
    })


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

    this.onGetRunData();

    this.getWeather()
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
    let that = this;
    // 调用云函数
    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {},
    // }).then(login => {
    //   let openid = login.result.openid;
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
            wx.hideLoading()
            that.setData({
              todayStep: data.result.todayStep
            })
          }

        })
      }
    })
    // })
  },
  getWeather: function () {
    // l0v5BoTb2K0QC2vYkEDGRbVjohsqGw4V
    var that = this;
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'l0v5BoTb2K0QC2vYkEDGRbVjohsqGw4V'
    });
    var fail = function (data) {
      console.log(data)
    };
    var success = function (data) {
      var weatherData = data.currentWeather[0];
      weatherData = '城市：' + weatherData.currentCity + '\n' + 'PM2.5：' + weatherData.pm25 + '\n' + '日期：' + weatherData.date + '\n' + '温度：' + weatherData.temperature + '\n' + '天气：' + weatherData.weatherDesc + '\n' + '风力：' + weatherData.wind + '\n';
      that.setData({
        weatherData: weatherData,
        weatherTemperature: weatherData.temperature
      });
    }
    // 发起weather请求 
    BMap.weather({
      fail: fail,
      success: success
    });
  }


})
