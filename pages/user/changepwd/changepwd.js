import { Prompt } from '../../../utils/util.js'
const app = getApp()
var mta = require('../../../statistics/mta_analysis.js')
Page({
  data: {
    opwd: '',
    npwd: ''
  },
  onLoad(){
    mta.Page.init()
  },
  opwd(e) {
    this.setData({
      opwd: e.detail.value
    })
  },
  npwd(e) {
    this.setData({
      npwd: e.detail.value
    })
  },
  change() {
    if (this.data.opwd === '' || this.data.npwd === '') {
      Prompt('请输入内容')
      return;
    }
    if (this.data.opwd.length < 6 || this.data.npwd.length < 6) {
      Prompt('密码格式错误')
      return;
    }
    wx.ajax({
      url: 'api/member/changepassword',
      data: {
        userId: app.globalData.userid,
        oldpassword: this.data.opwd,
        password: this.data.npwd,
        sign: app.globalData.sign
      },
      method: 'POST'
    }).then((res) => {
      wx.switchTab({
        url: '/pages/user/user'
      })
    }).catch((res) => {
      console.log(res)
      Prompt(res.data.Message)
    })
  }
})