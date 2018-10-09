// var trackSDK = require('./utils/index.js');
var mta = require('./statistics/mta_analysis.js')
App({
  onLaunch() {
    // this.userLogin();
    mta.App.init({
      "appID": "500558992",
      "eventID": "500559023",
    });
  },
  onShow() {
    // trackSDK.callTrail({ originId: 'wxa5828c9eead45e9b' });
  },
  //全局变量
  globalData: {
    scene: 1,
    userInfo: null,
    mallApiUrl: "api.feyjia.com/",
    userid: 0,
    openid: 0,
    sign: "Ea1OWCAnQWD4GCijZ2ChEB83i+7MXQahK7/Kd9jrmYHi+rQ9PvalLOYWa5JIYep9QbOamIej1KEPuQvyKuhlN/DXpUB3YKjHTx6I+hk8nAd7F6J/y80IbZ5tVgptGhE2",
    accesstoken: null,
    templateList: []
  },

  //API
  globalApiUrls: {
    // 获取验证码
    POST_SEND_CODE: "api/member/postSendCode",
    // 手机短信验证码检查
    POST_CHECK_CODE: "api/member/postCheckCode",
    //绑定手机号
    BIND_CELL_PHONE: "api/member/BindCellPhone"
  },

  toChoiceness(){
    wx.switchTab({
      url: '/pages/choiceness/choiceness'
    })
  },

  wxLogin(){
    let that = this;
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: 'https://' + that.globalData.mallApiUrl + 'api/member/getopenid',
            data: {
              "code": res.code,
              "sign": "Ea1OWCAnQWD4GCijZ2ChEB83i+7MXQahK7/Kd9jrmYHi+rQ9PvalLOYWa5JIYep9QbOamIej1KEPuQvyKuhlN/DXpUB3YKjHTx6I+hk8nAd7F6J/y80IbZ5tVgptGhE2"
            },
            method: "POST",
            success: function (res) {
              console.log(res)
              that.globalData.openid = res.data.Value.OpenId;
              console.log(that.globalData.openid)
              that.globalData.sessionKey = res.data.Value.SessionKey;
              that.globalData.userid = res.data.Value.UserId;
              console.log("app" + that.globalData.userid);
              that.toChoiceness();
              if (that.callback) {
                that.callback()
              }
              // successLogin(that.globalData.userid);
              // resolve();
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
          // reject();
        }
      }
    })
  },

  //用户登录
  userLogin(successLogin) {
    let that = this;
    wx.authorize({
      scope: 'scope.userInfo',
      success() {
        wx.getUserInfo({
          success(res) {
            that.globalData.userInfo = res.userInfo
          }
        })
      }
    })

    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            //发起网络请求
            wx.request({
              url: 'https://' + that.globalData.mallApiUrl + 'api/member/getopenid',
              data: {
                "code": res.code,
                "sign": "Ea1OWCAnQWD4GCijZ2ChEB83i+7MXQahK7/Kd9jrmYHi+rQ9PvalLOYWa5JIYep9QbOamIej1KEPuQvyKuhlN/DXpUB3YKjHTx6I+hk8nAd7F6J/y80IbZ5tVgptGhE2"
              },
              method: "POST",
              success: function (res) {
                
                that.globalData.openid = res.data.Value.OpenId;
                
                that.globalData.sessionKey = res.data.Value.SessionKey;
                that.globalData.userid = res.data.Value.UserId;
                console.log(res)
                console.log(that.globalData.openid)
                console.log("app" + that.globalData.userid)
                if (that.callback) {
                  that.callback()
                }
                // successLogin(that.globalData.userid);
                resolve();
              }
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
            reject();
          }
        }
      })
    })
  }
})