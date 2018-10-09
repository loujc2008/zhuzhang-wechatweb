import { Prompt } from '../../utils/util.js'
const app = getApp()
var mta = require('../../statistics/mta_analysis.js')
Page({
  data: {
    phone: '',
    pwd: '',
    verification: '',
    vic: true,
    countdown: 60
  },
  onLoad(){
    mta.Page.init()
  },
  phone(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  pwd(e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  verification(e) {
    this.setData({
      verification: e.detail.value
    })
  },
  settime() {
    let time = 60;
    let inter = setInterval(() => {
      time = time - 1;
      if (time == 0) {
        this.setData({
          vic: true,
          countdown: 60
        })
        clearInterval(inter)
      }
      this.setData({
        countdown: time
      })
    }, 1000)
  },
  // 获取验证码
  acquire() {
    if (/^1[34578]\d{9}$/.test(this.data.phone)) {
      wx.ajax({
        url: 'api/member/postSendCode',
        data: {
          destination: this.data.phone,
          businessCode: '1001',
          pluginId: 'Himall.Plugin.Message.SMS',
          sign: app.globalData.sign
        },
        method: 'POST'
      }).then((res) => {
        this.setData({
          vic: false
        })
        this.settime();
      }).catch((err) => {
        Prompt(err.data.Message)
      })
    } else {
      wx.showToast({
        title: '请输入正确手机号',
        icon: 'loading',
        duration: 500
      })
    }
  },
  // 绑定手机号
  binding() {
    wx.ajax({
      url: 'api/member/BindCellPhone',
      data: {
        cellphone: this.data.phone,
        userid: app.globalData.userid,
        password: this.data.pwd,
        openid: app.globalData.openid,
        checkcode: this.data.verification,
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      wx.showToast({
        title: '成功',
        icon: 'success',
        duration: 1500
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/user/user'
        })
      }, 1500)
    }).catch((err) => {
      wx.showToast({
        title: '绑定失败',
        icon: 'loading',
        duration: 500
      })
    })
  }
})